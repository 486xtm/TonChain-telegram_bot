import dotenv from "dotenv";
dotenv.config();

import { bot } from "./bot";
import { getWalletInfo, getWallets } from "./ton-connect/wallets";
import TonConnect from "@tonconnect/sdk";
import { TonConnectStorage } from "./ton-connect/storage";
import { getConnector } from "./ton-connect/connector";
import QRCode from "qrcode";

import "./connect-wallet-menu";
import {
  handleConnectCommand,
  handleSendTXCommand,
  handleDisconnectCommand,
  handleShowMyWalletCommand,
} from "./commands-handlers";
import { walletMenuCallbacks } from "./connect-wallet-menu";

const callbacks = {
  ...walletMenuCallbacks,
};
// bot.on('message', msg => {
//   const chatId = msg.chat.id;
//   bot.sendMessage(chatId, 'Hey JunHO how are you?');
// })

bot.on("callback_query", (query) => {
  if (!query.data) {
    return;
  }

  let request: { method: string; data: string };

  try {
    request = JSON.parse(query.data);
  } catch {
    return;
  }

  if (!callbacks[request.method as keyof typeof callbacks]) {
    return;
  }

  callbacks[request.method as keyof typeof callbacks](query, request.data);
});

bot.onText(/\/connect/, handleConnectCommand);
bot.onText(/\/send_tx/, handleSendTXCommand);
bot.onText(/\/disconnect/, handleDisconnectCommand);
bot.onText(/\/my_wallet/, handleShowMyWalletCommand);
