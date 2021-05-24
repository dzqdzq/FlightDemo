enum Codes{
  OK =        0,              // 成功
  ERR =       100000,         // 通用错误
  LOCK_ERR =  100001,         // 上锁错误
  PARAM_ERR = 100002,         // 参数错误
  DB_ERR =    100003,         // 数据库异常
  THIRD_ERR = 100004,         // 航空公司接口异常
  TICKET_NOT_EXIST = 100005,  // 机票不存在
  CREATEORDER_HAVE =    100006,// 该机票已经有人预定了
  ORD_NOT_EXIST=100007,       // 订单不存在
  ORD_EXPIRE=100008,       // 订单已过期
  ORD_FORBID=100009,       // 订单不可用， 可能订单已取消，或者已完成， 或者已过期
}

export default Codes;