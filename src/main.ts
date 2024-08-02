import dotenv from 'dotenv';
dotenv.config();

import {bot} from './bot';
import { getWalletInfo, getWallets } from './ton-connect/wallets';
import TonConnect from '@tonconnect/sdk';
import { TonConnectStorage } from './ton-connect/storage';
import { getConnector } from './ton-connect/connector';
import QRCode from 'qrcode';

import './connect-wallet-menu';
// bot.on('message', msg => {
//   const chatId = msg.chat.id;
//   bot.sendMessage(chatId, 'Hey JunHO how are you?');
// })

bot.onText(/\/connect/, async (msg) => {
  const chatId = msg.chat.id;
  const wallets = await getWallets();

  const connector = getConnector(chatId);
  connector.onStatusChange(async wallet => {
    if(wallet){
      const walletName = (await getWalletInfo(wallet.device.appName))?.name || wallet.device.appName;
      bot.sendMessage(chatId,  `${wallet.device.appName} wallet connectd!`);
    }
  });
  const link = connector.connect(wallets);
  const image = await QRCode.toBuffer(link);
  await bot.sendPhoto(chatId,image, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Choose a Wallet',
            callback_data: JSON.stringify({method: 'chose_wallet'})
          },
          {
            text: 'Open Link',
            url: `https://ton-connect.github.io/open-tc?connect=${encodeURIComponent(link)}`
          }
        ]
      ]
    }
  })
})