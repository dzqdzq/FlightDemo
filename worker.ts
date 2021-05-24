import db from './dbs/db'
import express from 'express'
import config from './config'
import codes from './codes'
import logic from './logic'
import to from 'await-to-js'
import {init as redlockInit} from './redlock'

const app = express()
app.use(express.json())

app.post('/createTicketOrder', async (req, res) => {
  let err, code;
  let uid:string = req.body.uid;
  let ticketId:string = req.body.ticketId;
  [err, code] = await to(logic.createTicketOrder(uid, ticketId));
  if(err){
    console.log('createTicketOrder error:', err);
    code = codes.ERR;
  }
  res.send({code});
})

app.post('/payTicketOrder', async (req, res) => {
  let err, code;
  let uid:string = req.body.uid;
  let orderId:string = req.body.orderId;
  [err, code] = await to(logic.payTicketOrder(uid, orderId));
  if(err){
    console.log('payTicketOrder error:', err);
    code = codes.ERR;
  }
  res.send({code});
})

app.post('/cancelTicketOrder', async (req, res) => {
  let err, code;
  let uid:string = req.body.uid;
  let orderId:string = req.body.orderId;
  [err, code] = await to(logic.cancelTicketOrder(uid, orderId));
  if(err){
    console.log('cancelTicketOrder error:', err);
    code = codes.ERR;
  }
  res.send({code});
})

app.post('/getflightInfo', async (req, res) => {
  let err, code;
  let flightId:string = req.body.flightId;
  [err, code] = await to(logic.getflightInfo(flightId));
  if(err){
    console.log('getflightInfo error:', err);
    code = codes.ERR;
  }
  res.send({code});
})

async function start(){
  await db.start();
  redlockInit();// 初始化分布式锁
  logic.init(); // 逻辑初始化
  app.listen(config.PORT, () => {
    console.log(`pid:${process.pid} listening at http://localhost:${config.PORT}`)
  })
}

export default {
  start
}