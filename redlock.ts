
import Redlock from 'redlock'

let redlock:Redlock|undefined = undefined;

export function init(){
  if(!global.rdb){
    console.error('数据库未连接');
    process.exit(1);
  }
  if(redlock){
    return redlock;
  }
  redlock = new Redlock(
    // you should have one client for each independent redis node
    // or cluster
    [global.rdb!.lock],
    {
      // the expected clock drift; for more details
      // see http://redis.io/topics/distlock
      driftFactor: 0.01, // multiplied by lock ttl to determine drift time
  
      // the max number of times Redlock will attempt
      // to lock a resource before erroring
      retryCount:  10,
  
      // the time in ms between attempts
      retryDelay:  200, // time in ms
  
      // the max time in ms randomly added to retries
      // to improve performance under high contention
      // see https://www.awsarchitectureblog.com/2015/03/backoff.html
      retryJitter:  200 // time in ms
    }
  );
  redlock.on('clientError', function(err:Error) {
    console.error('A redis error has occurred:', err);
  });
}

export function getRedLock(){
  return redlock;
} 

