// 生成数据
/**
 * 我们假设一个虚拟场景, 场景中有 10000个乘客(Traveler) 想要购买去不同地方的机票,
 * 总共有200个航班(Flight)。每个航班的capacity是一个`20-80`的随机数。每个航班的起始提供的机票数量为`Flight.capacity`。
 * 乘客(Traveler), 航班(Flight) 和 机票(Ticket) 这些数据信息需要持久化并且可以在系统启动时直接生成好.
 */

import * as _ from 'lodash';
import config from './config';
import db from './dbs/db';
import Ticket from './dao/Ticket';
import Flight from './dao/Flight';

async function main() {

  await db.start();// 连接数据库

  if (!await Ticket.isEmpty()) { // 查看是否存在机票表
    console.log('数据库里有航班数据，跳过数据生成步骤');
    process.exit(0);
  }

  const tickets = [];
  const [min, max] = config.FlightCapacityRandom;
  for (let i = 0; i < config.ToTalFlight; i++) {
    const id = 100000 + i;
    const capacity = _.random(min, max);
    const initData = _.clone(Flight.getDefault()) as {[prop:string]:unknown};
    initData!.capacity = capacity;
    // save flight info
    Flight.calPrice(initData);
    const flightId = 'flight_' + id;
    Flight.saveData(flightId, initData);
    for (let j = 1; j <= capacity; j++) {
      const ticketId = `ticket_${id}_${j}`;
      tickets.push({ticketId, flightId});
    }
  }

  // save to database
  await Ticket.saveData(tickets);
  console.log('航班数据生成完成');
  process.exit(0);
}

main();
