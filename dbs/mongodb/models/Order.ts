import mongoose from 'mongoose'
import * as utils from '../utils'

var schema = utils.createSchema({
  orderId: {type: String},      // 订单号
  uid: {type: String},          // 用户ID
  ticketId: {type: String},     // 机票号
  expired: {type: Date},        // 过期时间
  price:{type:Number},          // 下单价格
  curState: {type: Number, default: 0},      // 当前订单状态 具体值参考OrderState
  create: {type: Date, default: Date.now},   // 创建订单时间
});

schema.index({orderId: 1}, {unique: true});
schema.index({ticketId: 1});
module.exports = mongoose.model('Order',   schema);
