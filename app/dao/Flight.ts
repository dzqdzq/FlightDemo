import model from '../dbs/redis/models/Flight';
import * as _ from 'lodash';
import { Flight } from '../types';

function getDefault() {
  return model()!.Default;
}

function saveData(id:string, data:unknown) {
  model()!.set(id, data);
}

// 获取航班信息
async function getflightInfo(id:string) {
  let data = await model()!.get(id) as Flight;
  if (_.isEmpty(data)) {
    data = model()!.Default as Flight;
  }

  return {
    Id: id,
    Capacity: data.capacity,
    moreSeats: data.capacity - data.booked, // 当前剩余的座位数
    price: data.price, // 当前机票价格
  };
}

// 计算当前价格
function calPrice(data:any) {
  data.price = data.basePrice * (data.booked / data.capacity * 2 + 1);
}

/**
 * 玩家预定机票/取消机票，价格更新
 * @param id 航班号
 * @param isAdd  true 表示预定; false 表示取消
 */
async function booked(id:string, isAdd:boolean) {
  console.log('booked id::', id);
  let oldPrice = 0;
  const data = await model()!.get(id) as Flight;
  data.booked += (isAdd ? 1 : -1);
  oldPrice = data.price;// 更新之前的价格
  calPrice(data); // 更新价格，下个人购买机票使用该价格
  model()!.set(id, data);
  return {data, oldPrice};
}

export default {
  saveData,
  getDefault,
  calPrice,
  getflightInfo,
  booked,
};