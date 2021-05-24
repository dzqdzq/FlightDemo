import mongoose from 'mongoose'
import {OrderInfo} from '../types'
import {OrderState} from '../constant'

const model = () => mongoose.model('Order');

// 获取机票信息
async function getOrderInfo(orderId:string, uid?:string){
  let filter:{orderId:string, uid?:string} = {orderId};
  if(typeof uid === 'string'){
    filter.uid = uid;
  }
  return model().findOne(filter, {_id:0});
}

/**
 * 获取正在进行的订单信息
 * @param ticketId 
 * @returns 
 */
async function getIngOrderInfo(ticketId:string){
  let curState = {$in:[OrderState.CreateOrder, OrderState.PayOrderFail]};
  return model().findOne({ticketId, curState, expired:{$lt:new Date()}}, {_id:0});
}

// {
//   orderId: {type: String},      // 订单号
//   uid: {type: String},          // 用户ID
//   ticketId: {type: String},     // 机票号
//   expired: {type: Date},        // 过期时间
//   curState: {type: Number, default: 0},      // 当前步骤 0: 创建订单， 0x10：购买订单-成功  0x11：购买订单-失败   0x20:取消订单
//   create: {type: Date, default: Date.now},   // 创建订单时间
// }

// 保存订单
async function saveOrder(data:OrderInfo){
  return model().insertMany(data);
}

// 设置过期标记
function setExpireFlag(orderId:string, ms:number, uid:string){
  return global.rdb!.main.psetex(orderId, ms, uid);
}

/**
 * 设置订单过期
 */
async function setExpire(orderId:string){
  let curState = OrderState.Expired;
  return setCurState(orderId, curState);
}

// 设置支付失败
async function setCurState(orderId:string, curState:OrderState){
  return model().updateOne({orderId}, {$set:{curState}});
}

export default {
  getOrderInfo,
  getIngOrderInfo,
  saveOrder,
  setExpire,
  setCurState,
  setExpireFlag,
}
