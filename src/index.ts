require('dotenv').config();
import Discord from './bot/connection/Discord';

const bot = new Discord("");
bot.login();
