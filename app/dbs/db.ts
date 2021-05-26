import config from '../config';
import mongoose from 'mongoose';
import mongodb from './mongodb/';
import redis from './redis';
import {RedisDBS} from '../types';
import to from 'await-to-js';


const {redisConfig, mongoConfig} = config;

async function start() {
  // console.log('开始连接 ', mongoConfig);
  const [err1, mdb] = await to(mongodb.start(mongoConfig));
  if (err1) {
    console.error('mongodb数据库连接失败,', err1);
    process.exit(1);
  }
  // console.log('开始连接 ', redisConfig);
  const [err2, rdb] = await to(redis.start(redisConfig));
  if (err2) {
    console.error('reids数据库连接失败,', err2);
    process.exit(2);
  }

  global.mdb = mdb;
  global.rdb = rdb;
}

export default {
  start
};