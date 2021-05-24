import {Redis} from "ioredis";

export type Airport = {
  id: string;
  name: string;
};

export type Route = {
  id: string;
  airports: Airport[];
};

export type Traveler = {
  id: string;
  name: string;
};

export type Ticket = {
  id: string;
  flight: Flight;
  traveler?: Traveler;
  price: number;
};

export type Flight = {
  id: string;
  capacity: number;
  booked: number,
  price: number,
  basePrice: number;
};

// main?: Redis,
// lock?: Redis,
export type RedisDBS = { [id:string]: Redis};

export type OrderInfo = {
  orderId: string;
  uid: string;
  ticketId: string;
  expired: Date | number;
  price: number;
  curState?: number;
  create?: Date;
};

export type TicketInfo = {
  ticketId: string,
  flightId: string,
};