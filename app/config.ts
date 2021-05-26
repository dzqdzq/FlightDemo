export default {
  PORT: 3000,
  redisConfig: {
    main: {
      host: '127.0.0.1',
      port: 6379,
      db: 0,
      password: '',
    },
    lock: {
      host: '127.0.0.1',
      port: 6379,
      db: 1,
      password: '',
    }
  },
  mongoConfig: {
    host: '127.0.0.1',
    port: 27017,
    db: 'flight',
    user: 'flight',
    password: '123456',
  },
  sceneTravelers: 10000,
  ToTalFlight: 200,
  FlightCapacityRandom: [20, 80],
  createTicketOrderConfig: {
    delays: [250, 3000],
    fail: 0.2, // 失败率
    expired: 3 * 60 * 1000 // 过期时间
  },
  payTicketOrderConfig: {
    delays: [250, 3000],
    fail: 0.1, // 失败率
  },

};