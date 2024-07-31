import dotenv from 'dotenv';
dotenv.config();

import {bot} from './bot';
import { getWallets } from './ton-connect/wallets';
import TonConnect from '@tonconnect/sdk';
import { TonConnectStorage } from './ton-connect/storage';
import QRCode from 'qrcode';

// bot.on('message', msg => {
//   const chatId = msg.chat.id;
//   bot.sendMessage(chatId, 'Hey JunHO how are you?');
// })

bot.onText(/\/connect/, async (msg) => {
  const chatId = msg.chat.id;
  const wallets = await getWallets();

  const connector = new TonConnect({
    storage: new TonConnectStorage(chatId),
    manifestUrl: process.env.MANIFEST_URL
  });
  connector.onStatusChange(wallet => {
    if(wallet)
      bot.sendMessage(chatId,  `${wallet.device.appName} wallet connectd!`);
  });
  const tonkeeper = wallets.find(wallet => wallet.appName === 'tonkeeper')!;
  const link = connector.connect({
    bridgeUrl: tonkeeper.bridgeUrl,
    universalLink: tonkeeper.universalLink
  });
  const image = await QRCode.toBuffer(link);
  await bot.sendPhoto(chatId, image);
})