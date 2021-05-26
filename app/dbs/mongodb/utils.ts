import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// 获取构造函数的第一个参数类型
type SchemaArg = ConstructorParameters<typeof Schema>[0]

export function createSchema(pro: SchemaArg) {
  return new Schema(pro, {toJSON: {transform: function(doc, obj) {
    delete obj.__v;
    delete obj._id;
    return obj;
  }}});
}

export function createSchemaWithID(pro: SchemaArg) {
  return new Schema(pro, {toJSON: {transform: function(doc, obj) {
    delete obj.__v;
    return obj;
  }}});
}

// time in seconds
export function curTime() {
  return Math.floor(Date.now() / 1000);
}
