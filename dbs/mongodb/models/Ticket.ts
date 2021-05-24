import mongoose from 'mongoose'
import * as utils from '../utils'

var schema = utils.createSchema({
  ticketId: {type: String},
  flightId: {type: String},
});

schema.index({ticketId: 1}, {unique: true});
schema.index({flightId: 1});
module.exports = mongoose.model('Ticket',   schema);
