import { RedisDBS } from '../types';
import mongoose from 'mongoose'

declare global {
    namespace NodeJS {
        interface Global {
            rdb: RedisDBS;
            mdb: mongoose.Mongoose;
        }
    }
}
