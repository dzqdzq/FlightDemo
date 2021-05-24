import crypto from 'crypto'

function md5(data:string){
  let hash = crypto.createHash('md5');
  return hash.update(data).digest('base64');
}

function getToken(args:any, privateKey:string){
  let keys = Object.keys(args);
  keys.sort((a,b)=>a<b?-1:1);
  let srcStr = keys.map(k=>k+String(args[k])).join('|');
  let token = md5(srcStr+privateKey);
  return token;
}

export function encode(args:any, privateKey:string){
  args = args || {};
  delete args.token;
  args.anon = Math.random();
  args.token = getToken(args, privateKey);
  return args
}

export function decode(args:any, privateKey:string){
  if(!args){
    return null;
  }

  const netToken = args.token;
  if( typeof args.anon === 'number' &&  typeof netToken === 'string'){
    delete args.token;
    let locToken = getToken(args, privateKey);
    if(netToken === locToken){ // 数据校验成功
      delete args.anon;
      return args;
    }
  }

  return null;
}

export function sleep(ms:number){
  return new Promise(resolve => setTimeout(resolve, ms))
}
