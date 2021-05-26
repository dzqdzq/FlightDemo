
import fs from 'fs';
import mongoose from 'mongoose';

let mdbclient:mongoose.Mongoose|undefined;// Mongoose Type

let _isInitial = false;

function initModels() {
  const models = __dirname + '/models/';

  const files = fs.readdirSync(models)
    .filter(file=>file.endsWith('.js') || file.endsWith('.ts'));

  for (let i = 0; i < files.length; i++) {
    require(models + '' + files[i]);
  }
}

// 连接mongo数据库
async function start(config:any) {
  if (!_isInitial) {
    _isInitial = true;
    const pwd = encodeURIComponent(config.pwd || config.password);
    const str = `mongodb://${config.user}:${pwd}@${config.host}:${config.port}/${config.db}`;
    mongoose.Promise = global.Promise;
    const ops = {
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    };
    mdbclient = await mongoose.connect(str, ops);
    initModels();
  }
  return mdbclient;
}

export default {
  start
};