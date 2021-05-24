import { createModel } from '../utils'

function defaultBasePrice(){
  return 100 + Math.floor(Math.random()*1000);
}

export default createModel({
  tableName: 'Flight',
  tableType: 'hash',
  key: 'flightId',
  value: {
    basePrice: {type: Number, default:defaultBasePrice},    // 基础价格
    capacity: {type: Number, default:0},                    // 总共座位数
    booked: {type: Number, default:0},                      // 已预定数
    price:{type: Number, default:0},                        // 当前机票价格
  }
});