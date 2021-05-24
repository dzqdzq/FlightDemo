import * as _ from 'lodash'
import model from './models/Flight';

export class Model{
  [key: string]: Function;
  public Default:any;
  constructor(public option: any){
  }
}

// command must lower string
type TableType = 'hash' | 'set' | 'string' | 'list' | 'zset' | 'sort set';
export interface RedisModelOption {
  tableName: string,
  tableType: TableType,
  key: string | Function,
  value: any,
}
let commands:{[TableType:string]:string[]} = {
  "hash": "hexists|hdel|hget|hgetall|hincrby|hincrbyfloat|hkeys|hlen|hmget|hmset|hrandfield|hscan|hset|hsetnx|hstrlen|hvals".split("|")
};

let wrapCommands:{[TableType:string]:(cmd:string)=>string} = {
  "hash": (cmd:string) => cmd.substr(1)
};


function _createModel(option: RedisModelOption){
  const mainDB = global.rdb!.main;

  let model = new Model(option);
  let cmds = commands[option.tableType];
  let wrap = wrapCommands[option.tableType];
  let isObject = typeof option.value === 'object';
  for(let cmd of cmds){
    let toCmd = wrap(cmd);

    function f(...args:any[]){
      // @ts-ignore
      return mainDB[cmd](option.tableName,  ...args)
    };
    model[toCmd] = f;

    if(isObject && toCmd.includes('get')){ // 自动转换对象
      model[toCmd] = async function(){ 
        let data = await f.apply(null, Array.from(arguments));
        if(Array.isArray(data)){
          return data.map(d=>typeof d==='string' ? JSON.parse(d) : d);
        }
        return typeof data==='string' ? JSON.parse(data) : data;
      }
    }else if(isObject && toCmd.includes('set')){
      model[toCmd] = function(){
        let args = Array.from(arguments).map(d=>typeof d==='object'?JSON.stringify(d):d);
        return f.apply(null, args);
      }
    }
  }

  if (isObject){
    let Default:{[key:string]:any} = {};
    _.forEach(option.value, (v, key)=>{
      Default[key] = _.isFunction(v.default) ? v.default() : v.default;
    });
    model.Default = Default;
  }else{
    model.Default = option.value;
  }
  return model;
}

export function createModel(options:RedisModelOption){
  let _model:Model;
  return ()=>{
    if(!_model){
      _model = _createModel(options)
    }
    return _model;
  }
}