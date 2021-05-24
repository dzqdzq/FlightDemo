import Redis from 'ioredis';
import {RedisDBS} from '../../types';


async function start(configs:any){
  let rdb:RedisDBS = {};

  for(let key in configs){
    rdb[key] = new Redis(configs[key]);
  }
  return rdb;
}

export default {
  start
}
