import db from './dbs/db';
import express from 'express';
import config from './config';
import codes from './codes';
import logic from './logic';
import to from 'await-to-js';
import {init as redlockInit} from './redlock';

const app = express();
app.use(express.json());

app.post('/createTicketOrder', async (req, res) => {
  const uid:string = req.body.uid;
  const ticketId:string = req.body.ticketId;
  const [err, obj] = await to(logic.createTicketOrder(uid, ticketId));
  if (err) {
    console.error('createTicketOrder error:', err);
    res.send({code: codes.ERR});
    return;
  }
  res.send(obj);
});

app.post('/payTicketOrder', async (req, res) => {
  const uid:string = req.body.uid;
  const orderId:string = req.body.orderId;
  const [err, obj] = await to(logic.payTicketOrder(uid, orderId));
  if (err) {
    console.error('payTicketOrder error:', err);
    res.send({code: codes.ERR});
    return;
  }
  res.send(obj);
});

app.post('/cancelTicketOrder', async (req, res) => {
  const uid:string = req.body.uid;
  const orderId:string = req.body.orderId;
  const [err, obj] = await to(logic.cancelTicketOrder(uid, orderId));
  if (err) {
    console.error('cancelTicketOrder error:', err);
    res.send({code: codes.ERR});
    return;
  }
  res.send(obj);
});

app.post('/getflightInfo', async (req, res) => {
  const flightId:string = req.body.flightId;
  const [err, obj] = await to(logic.getflightInfo(flightId));
  if (err) {
    console.error('getflightInfo error:', err);
    res.send({code: codes.ERR});
    return;
  }
  res.send(obj);
});

async function start() {
  await db.start();
  redlockInit();// 初始化分布式锁
  logic.init(); // 逻辑初始化
  app.listen(config.PORT, () => {
    console.log(`pid:${process.pid} listening at http://localhost:${config.PORT}`);
  });
}

export default {
  start
};