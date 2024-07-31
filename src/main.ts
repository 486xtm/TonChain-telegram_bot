import dotenv from 'dotenv';
dotenv.config();

import {bot} from './bot';

bot.on('message', msg => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hey JunHO how are you?');
})

