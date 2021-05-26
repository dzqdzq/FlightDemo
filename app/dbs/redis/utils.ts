import * as _ from 'lodash';


export class Model{
  // @ts-ignore
  public Default:unknown;

  [key: string] : ((...args:unknown[])=>Promise<unknown>);
  // @ts-ignore
  constructor(public option: RedisModelOption) {
    this.Default = null;
  }
}

type KeyType = string | ((key?:string) => string);

// command must lower string
type TableType = 'hash' | 'set' | 'string' | 'list' | 'zset' | 'sort set';
export interface RedisModelOption {
  tableName: string;
  tableType: TableType;
  key: KeyType;
  value: unknown;
}

const commands:{[TableType:string]:string[]} = {
  'hash': 'hexists|hdel|hget|hgetall|hincrby|hincrbyfloat|hkeys|hlen|hmget|hmset|hrandfield|hscan|hset|hsetnx|hstrlen|hvals'.split('|')
};

const wrapCommands:{[TableType:string]:(cmd:string)=>string} = {
  'hash': (cmd:string) => cmd.substr(1)
};

function _createModel(option: RedisModelOption) {
  const mainDB = global.rdb!.main;

  const model = new Model(option);
  const cmds = commands[option.tableType];
  const wrap = wrapCommands[option.tableType];
  const isObject = typeof option.value === 'object';

  function f(cmd:string) {
    // @ts-ignore
    return (...args:unknown[])=>mainDB[cmd](option.tableName, ...args);
  }

  for (const cmd of cmds) {
    const toCmd = wrap(cmd);
    const func = f(cmd);
    model[toCmd] = func;

    if (isObject && toCmd.includes('get')) { // 自动转换对象
      model[toCmd] = async function(...args:unknown[]) {
        const data = await func(...args);
        if (Array.isArray(data)) {
          return data.map(d=>typeof d === 'string' ? JSON.parse(d) : d);
        }
        return typeof data === 'string' ? JSON.parse(data) : data;
      };
    } else if (isObject && toCmd.includes('set')) {
      model[toCmd] = function(...args:unknown[]) {
        const args2 = args.map(d=>typeof d === 'object' ? JSON.stringify(d) : d);
        return func(...args2);
      };
    }
  }

  if (isObject) {
    const Default:{[key:string]:any} = {};
    _.forEach(option.value as {}, (v, key)=>{
      // @ts-ignore
      Default[key] = _.isFunction(v.default) ? v.default() : v.default;
    });
    model.Default = Default;
  } else {
    model.Default = option.value;
  }
  return model;
}

export function createModel(options:RedisModelOption): ()=>Model {
  let _model:Model;
  return ():Model=>{
    if (!_model) {
      _model = _createModel(options);
    }
    return _model;
  };
}