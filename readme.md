运行前准备：
1. 本机安装redis
2. 本机安装mongo


3. 创建mongo数据库并且创建用户, 需要修改createDB.js文件的管理员的账号密码
mongo tools/createDB.js


4.  修改配置：
./config.ts 文件, 修改成自己本机的配置
redisConfig
mongoConfig 


5. 安装环境库
npm i -D


6.  命令说明：
```
npm run makeData  生成数据到数据库
npm run test      测试,  只写了部分， 写完只是时间问题
npm run start     启动服务器， CPU有几个核就有几个子进程
npm run publish   生成js代码到dist目录

启动服务时，必须先执行npm run makeData
如果运行过npm run makeData， 那么可以不用在执行这个命令了；即反复运行这个命令，也无效，因为会判断数据库中是否有无数据
运行 npm run test 时， 服务器可以不必开启
```

