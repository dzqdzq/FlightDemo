import expect from 'expect';
import logic from '../logic';
import db from '../dbs/db'
import Codes from '../codes';
import * as redlock from '../redlock'
import to from 'await-to-js'
import * as _ from 'lodash'
import { sleep } from '../utils';


describe('logic', () => {
  let orderId = '';

  // 如果是 async function 那么参数一定不能加任何参数，否则报错 ensure "done()" is called;
  before(async function(){
    this.timeout(5000);
    await db.start();
    redlock.init();
    expect(redlock.getRedLock()).not.toBeUndefined();

    // @ts-ignore
    expect(global.mdb).not.toBeUndefined();
    // @ts-ignore
    expect(global.rdb).not.toBeUndefined();
    // @ts-ignore
    expect(global.rdb.main).not.toBeUndefined();
    // @ts-ignore
    expect(global.rdb.lock).not.toBeUndefined();
  })


  it('init()', (done) => {
    logic.init()
    done();
  });


  it('lock', async () => {
    const lock = await redlock.getRedLock().lock('hello', 2000);
    console.log('执行一些逻辑');
    lock && lock.unlock();
  });

  describe('logic.createTicketOrder', () => {
    it('createTicketOrder 不存在ticket', async function(){
      let result;
      try {
        result = await logic.createTicketOrder('123', 'abc');
      } catch (error) {
        console.log(error);
        expect(error).toBeNull();
      }

      expect(result).not.toBeNull();
      console.log(typeof result, result)
      expect(result.code).toBe(Codes.TICKET_NOT_EXIST);
    });

    it('createTicketOrder 存在ticket', async function(){
      let result;
      try {
        result = await logic.createTicketOrder('123', 'ticket_100000_1');
      } catch (error) {
        console.log('createTicketOrder error:', error);
        expect(error).toBeNull();
      }

      expect(result).not.toBeNull();
      console.log(typeof result, result);
      expect(result.code === Codes.THIRD_ERR || result.code === Codes.OK).toBe(true);
      if(result.code === Codes.OK){
        orderId = result.data.orderId;
      }
    });
  });

  describe('logic.payTicketOrder', () => {
    it('payTicketOrder OK', async () => {
      let orderId, result;
      while(true){
        const n = _.random(1,10);
        result = await logic.createTicketOrder('123', 'ticket_100000_'+n);
        if(result && result.code === Codes.OK){
          orderId = result.data.orderId;
          break;
        }
      }

      try {
        result = await logic.payTicketOrder('123', orderId);
      } catch (error) {
        console.log(error);
        expect(error).toBeNull();
      }
      console.log(result);
      expect(result).not.toBeNull();
      expect(result.code).toBe(Codes.OK);
    });

    it('payTicketOrder expire', async function(){
      this.timeout(185*1000);
      await sleep(180001);// 过期
      let result;
      try {
        result = await logic.payTicketOrder('123', orderId);
      } catch (error) {
        console.log(error);
        expect(error).toBeNull();
      }

      expect(result).not.toBeNull();
      expect(result.code).toBe(Codes.ORD_EXPIRE);
    });

  });


  // it('cancelTicketOrder()', async () => {
  //   logic.cancelTicketOrder
  // });

  // it('getflightInfo()', async() => {
  //   logic.getflightInfo
  // });
});