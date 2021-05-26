import mongoose from 'mongoose';
import * as utils from '../utils';

const schema = utils.createSchema({
  uid: {type: String},
  OpName: {type: String},
  extInfo: {type: Object, default: null},
  time: {type: Date, default: Date.now}
});

module.exports = mongoose.model('OpLog', schema);
