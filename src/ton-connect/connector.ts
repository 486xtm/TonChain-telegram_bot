import TonConnect from '@tonconnect/sdk';
import { TonConnectStorage } from './storage';
import * as process from 'process'

export function getConnector(chatId: number): TonConnect {
  return new TonConnect({
    manifestUrl: process.env.MANIFEST_URL,
    storage: new TonConnectStorage(chatId)
  });
}