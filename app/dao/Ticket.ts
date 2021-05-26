import mongoose from 'mongoose';
import {TicketInfo} from '../types';

const model = () => mongoose.model('Ticket');

async function isEmpty() {
  const count = await model().estimatedDocumentCount();
  // console.log(count);
  return count === 0;
}

async function saveData(data:TicketInfo[]) {
  await model().insertMany(data);
}

// 获取机票信息
async function getTicketInfo(ticketId:string) {
  return model().findOne({ticketId}, {_id: 0});
}

export default {
  isEmpty,
  saveData,
  getTicketInfo,
};