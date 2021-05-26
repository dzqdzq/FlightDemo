import Redis from 'ioredis';
import {RedisDBS} from '../../types';


async function start(configs:any) {
  const rdb:RedisDBS = {};

  for (const key in configs) {
    rdb[key] = new Redis(configs[key]);
  }
  return rdb;
}

export default {
  start
};
