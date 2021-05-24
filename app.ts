import cluster from 'cluster'
import os from 'os'
import worker from './worker'

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`主进程 ${process.pid} 正在运行`);

  // 衍生工作进程。
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 已退出`);
  });
} else {
  worker.start();
  console.log(`工作进程 ${process.pid} 已启动`);
}

process.on('uncaughtException', function (err) {
  console.error('uncaught:', err);
});