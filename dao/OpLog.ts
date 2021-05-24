import mongoose from 'mongoose'
const model = () => mongoose.model('OpLog');

export function log(uid:string, name:string, extInfo:any=null){
  model().insertMany({uid, name, extInfo});
}
