import mongoose from 'mongoose'
import * as utils from '../utils'

var schema = utils.createSchema({
    uid: {type: String},
    OpName: {type: String},
    extInfo:{type:Object, default:null},
    time: {type: Date, default:Date.now}
});

module.exports = mongoose.model('OpLog',schema);
