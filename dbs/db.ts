import config  from '../config';
import mongoose from 'mongoose';
import mongodb from './mongodb/';
import redis from './redis';
import {RedisDBS} from '../types';

const to = require('await-to-js').default;

const {redisConfig, mongoConfig} = config;

async function start(){
  let err, mdb:mongoose.Mongoose, rdb:RedisDBS;
  // console.log('开始连接 ', mongoConfig);
  [err, mdb] = await to(mongodb.start(mongoConfig));
  if(err){
    console.error('mongodb数据库连接失败,', err);
    process.exit(1);
  }
  // console.log('开始连接 ', redisConfig);
  [err, rdb] = await to(redis.start(redisConfig));
  if(err){
    console.error('reids数据库连接失败,', err);
    process.exit(2);
  }

  global.mdb = mdb;
  global.rdb = rdb;
}

export default {
  start
};