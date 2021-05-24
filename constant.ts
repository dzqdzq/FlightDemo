// 订单状态
export enum OrderState {
  CreateOrder = 0,        // 创建订单
  PayOrderIng = 0x10,     // 正在进行
  PayOrderOK = 0x11,      // 成功
  PayOrderFail = 0x12,    // 失败
  CancelOrder = 0x20,      // 取消订单
  Expired = 0x30      // 订单过期
};

// 事件类型-玩家操作事件
export enum OpName{
  createOrder = 'createOrder',
  payOrder = 'payOrder',
  cancelOrder = 'cancelOrder',
};
