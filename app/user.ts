// 模拟真实用户行为
import config from './config';
import axios from 'axios';
import {encode} from './util';
const {
  ToTalFlight
} = config;

const URL = `http://127.0.0.1:${config.PORT}/`;
const kReq = {
  createOrder: '/createOrder',
  payOrder: '/payOrder',
  cancelOrder: '/cancelOrder',
  getflightInfo: '/getflightInfo',
}

let getReqId= (function(){
  let reqid = 0;
  return function(){
    return ++reqid;
  }
})();

const privateKey = '';
let cli = axios.create({
  baseURL: URL,
});

async function post(url, args, cb){
  let data = encode(args);
  let headers = encode({reqid:getReqId()});// 防止伪造reqid, 防止重放攻击

  return await cli.post({ data, url,
    config:{headers}
  })
}

class User {
  constructor(uid){
    this.uid = uid;
  }

  // 创建订单
  async createOrder(){
    let flight = 1 + Math.floor(Math.random()*ToTalFlight);
    let args = {
      uid: this.uid,
      flight
    }
    
    return await post(kReq.createOrder, args);
  }

  // 支付订单
  payOrder(){

  }

  doAction(){
    
  }
}

module.exports = User;