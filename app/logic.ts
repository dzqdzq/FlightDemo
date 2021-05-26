import to from 'await-to-js';
import { getRedLock } from './redlock';
import * as _ from 'lodash';
import codes from './codes';
import config from './config';
import * as Order from './dao/Order';
import Redis from 'ioredis';
import TicketDAO from './dao/Ticket';
import Flight from './dao/Flight';
import { log as oplog } from './dao/OpLog';
import { OrderState, OpName } from './constant';
import { OrderInfo, TicketInfo } from './types';
import { ObjectId } from 'bson';
import { sleep } from './utils';

const { createTicketOrderConfig, payTicketOrderConfig } = config;

function LOCK(res: string) {
  return 'locks:' + res;
}

let mainDB: Redis.Redis;

// 监听回调
function subExpired(err: Error | null, res: 'OK') {
  if (err) {
    console.error('设置过期事件失败,', err);
    return;
  }

  // connection in subscriber mode, only subscriber commands may be used
  const sub = mainDB.duplicate();
  const expired_subKey = `__keyevent@${sub.options.db}__:expired`;
  sub.subscribe(expired_subKey, function () {
    sub.on('message', function (event, key) {
      if (key.startsWith('ord')) {
        // 订单过期， 修改状态
        Order.setExpire(key);
      }
    });
  });
}

function init(cb?: typeof subExpired) {
  mainDB = global.rdb!.main;
  // 创建监听
  mainDB.config('SET', 'notify-keyspace-events', 'Ex', cb || subExpired);
}

const [createMin, createMax] = createTicketOrderConfig.delays;
const [payMin, payMax] = payTicketOrderConfig.delays;

async function createTicketOrder1(uid: string, ticketId: string) {
  console.log('createTicketOrder1', Date.now());
}

// 1. 由于需要和航司系统对接，并且其系统比较陈旧，所以预定机票(Ticket)有一个随机 250ms-3000ms 的延时以及一个20%的失败率.
// 1. 你需要处理上述的失败情况以及提供尽量稳定合理的逻辑实现.
// 1. 机票(Ticket)只能在同一时间被唯一乘客(Traveler)预定，并且其在同一时间只能预定1张机票。预定的机票如果未操作会在 3 分钟后过期.
// 1. 每个航班(Flight) 的机票(Ticket) 的总预定数量不能大于该航班(Flight)可以被预定的数量.
async function createTicketOrder(uid: string, ticketId: string) {
  let err,
    flightData,
    ticketInfo: TicketInfo | undefined,
    orderInfo: OrderInfo | undefined,
    code = codes.ERR,
    data;
  console.log(
    'createTicketOrder begin:',
    uid,
    ticketId,
    Date.now(),
    LOCK(ticketId),
    createMax + 2000
  );
  const [err1, lock] = await to(
    getRedLock()!.lock(LOCK(ticketId), createMax + 2000)
  );
  do {
    if (err1) {
      code = codes.LOCK_ERR;
      console.error('system err:', err1);
      break;
    }

    // @ts-ignore
    [err, ticketInfo] = await to(TicketDAO.getTicketInfo(ticketId));

    if (err) {
      code = codes.DB_ERR;
      console.error(err);
      break;
    }

    // 机票不存在
    if (!ticketInfo) {
      code = codes.TICKET_NOT_EXIST;
      break;
    }

    // 获取正在进行的订单
    // @ts-ignore
    [err, orderInfo] = await to(Order.getIngOrderInfo(ticketId));
    if (err) {
      code = codes.DB_ERR;
      console.error(err);
      break;
    }

    if (!orderInfo) {
      await sleep(_.random(createMin, createMax)); // 模拟向航空公司发请求
      if (Math.random() <= createTicketOrderConfig.fail) {
        // 有一定概率失败
        code = codes.THIRD_ERR;
        break;
      }

      // 获取当前价格，并且更新价格
      [err, flightData] = await to(Flight.booked(ticketInfo.flightId, true));
      if (err) {
        code = codes.DB_ERR;
        console.error(err);
        break;
      }

      // 第三方接口成功后, 开始更新当前订单
      const expired = Date.now() + createTicketOrderConfig.expired;
      const orderId = 'ord' + new ObjectId().toHexString();

      [err] = await to(
        Order.saveOrder({
          orderId, // 订单号
          uid, // 用户ID
          ticketId, // 机票号
          expired, // 过期时间
          price: flightData!.oldPrice, // 购买机票价格
        })
      );
      if (err) {
        code = codes.DB_ERR;
        console.error('Order.saveOrder error: ', err);
        Flight.booked(ticketInfo.flightId, false); // 保存订单失败, 将价格还原
        break;
      }
      data = { orderId, expired };
      // 设置一个标记， 过期redis会通知
      [err] = await to(
        Order.setExpireFlag(orderId, createTicketOrderConfig.expired, uid)
      );
      if (err) {
        // 如果能执行到这里，表示redis服务器可能压力大出现异常了，需要考虑加内存，或者集群部署redis
        // 但是不影响业务正常进行
        console.error(err);
      }
    } else {
      code = codes.CREATEORDER_HAVE; // 已经有人下单了，可能是他自己， 也有可能是别人
    }

    code = codes.OK;
  } while (0);

  lock && (await lock.unlock());
  const ret = { code, data };
  oplog(uid, OpName.createOrder, ret);
  console.log('createTicketOrder end:', uid, ticketId, Date.now());
  return ret;
}

// ### **购买机票(Pay)**:
// 1. 由于客户购买机票通过第三方支付接口，例如微信，支付宝，甚至信用卡中心，所以购买机票(Ticket) 有一个随机的 250ms-3000ms 的延时以及一个10%的失败率， 客户支付失败之后可以重新尝试支付该订单。
// 1. 每个航班(Flight) 的机票(Ticket) 的总购买数量不能大于该航班 (Flight) 的capacity.
// 1. 机票(Ticket)只能在同一时间被唯一持有该机票预定权的乘客(Traveler) 在预定时间过期(Holding Expiration) 内购买.
async function payTicketOrder(uid: string, orderId: string) {
  let err,
    code = codes.ERR,
    data,
    lock,
    orderInfo: OrderInfo | undefined;

  do {
    [err, lock] = await to(getRedLock()!.lock(LOCK(orderId), payMax + 2000));
    if (err) {
      console.error('system err:', err);
      code = codes.LOCK_ERR;
      break;
    }

    // 检查是否可以购买
    // @ts-ignore
    [err, orderInfo] = await to(Order.getOrderInfo(orderId, uid));
    if (err) {
      console.error(err);
      code = codes.DB_ERR;
      break;
    }

    if (!orderInfo) {
      code = codes.ORD_NOT_EXIST;
      break;
    }

    if (new Date() >= orderInfo.expired) {
      code = codes.ORD_EXPIRE;
      break;
    }

    // 查询订单状态
    if (
      !(
        orderInfo.curState === OrderState.CreateOrder ||
        orderInfo.curState === OrderState.PayOrderFail
      )
    ) {
      code = codes.ORD_FORBID;
      break;
    }

    // 进行到这里，表示用户可以付钱了
    await sleep(_.random(payMin, payMax)); // 假设这是调用第三方支付
    if (Math.random() <= payTicketOrderConfig.fail) {
      // 有一定概率失败, 可能钱不足或者不想支付
      code = codes.THIRD_ERR;
      if (orderInfo.curState !== OrderState.PayOrderFail) {
        await Order.setCurState(orderId, OrderState.PayOrderFail);
      }
      break;
    } else {
      await Order.setCurState(orderId, OrderState.PayOrderOK);
    }
    data = orderInfo;
    code = codes.OK;
  } while (0);

  const ret = { code, data };
  lock && (await lock.unlock());
  oplog(uid, OpName.payOrder, ret);
  return ret;
}

// ### **取消机票(Cancel)**:
// 1. 你需要合理的检查机票是否可以被取消。
// 1. 乘客取消了机票之后，可以被其他乘客购买。
// 1. 机票(Ticket) 只能被购买了该机票的乘客(Traveler) 取消.
async function cancelTicketOrder(uid: string, orderId: string) {
  let err,
    lock,
    code = codes.ERR,
    orderInfo:OrderInfo;
  do {
    [err, lock] = await to(getRedLock()!.lock(LOCK(orderId), 2000));
    if (err) {
      console.error('system err:', err);
      return codes.LOCK_ERR;
    }

    // @ts-ignore
    [err, orderInfo] = await to(Order.getOrderInfo(orderId, uid));
    if (err) {
      console.error(err);
      code = codes.DB_ERR;
      break;
    }

    if (!orderInfo) {
      code = codes.ORD_NOT_EXIST;
      break;
    }

    // 没过期， 且订单状态是刚创建或者支付失败状态
    if (
      new Date() < orderInfo!.expired &&
      (orderInfo.curState === OrderState.CreateOrder ||
        orderInfo.curState === OrderState.PayOrderFail)
    ) {
      [err] = await to(Order.setCurState(orderId, OrderState.CancelOrder));
      if (err) {
        console.error(err);
        code = codes.DB_ERR;
        break;
      } else {
        code = codes.OK;
      }
    } else {
      code = codes.ORD_FORBID;
      break;
    }
  } while (0);

  const ret = { code, data: { orderId } };
  lock && (await lock.unlock());
  oplog(uid, OpName.cancelOrder, ret); // 后期可以查看日志，玩家取消的是啥订单
  return ret;
}

/**
 * 获取航班信息
 * @param flightId
 * @returns
 */
async function getflightInfo(flightId: string) {
  let err,
    data,
    flightInfo,
    code = codes.ERR;
  do {
    [err, flightInfo] = await to(Flight.getflightInfo(flightId));
    if (err) {
      console.error(err);
      code = codes.DB_ERR;
      break;
    }

    (data = flightInfo), (code = codes.OK);
  } while (0);
  return { code, data };
}

export default {
  init,
  createTicketOrder,
  createTicketOrder1,
  payTicketOrder,
  cancelTicketOrder,
  getflightInfo,
};
