import { bot } from "./bot";
import { getWallets, getWalletInfo } from "./ton-connect/wallets";
import QRCode from "qrcode";
import TelegramBot from "node-telegram-bot-api";
import { getConnector } from "./ton-connect/connector";
import { UserRejectsError } from "@tonconnect/sdk";
export async function handleConnectCommand(
  msg: TelegramBot.Message
): Promise<void> {
  const chatId = msg.chat.id;
  const wallets = await getWallets();
  const connector = getConnector(chatId);

  connector.onStatusChange((wallet) => {
    if (wallet) {
      bot.sendMessage(chatId, `${wallet.device.appName} wallet connected!`);
    }
  });

  const link = connector.connect(wallets);
  const image = await QRCode.toBuffer(link);

  await bot.sendPhoto(chatId, image, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Choose a Wallet",
            callback_data: JSON.stringify({ method: "chose_wallet" }),
          },
          {
            text: "Open Link",
            url: `https://ton-connect.github.io/open-tc?connect=${encodeURIComponent(
              link
            )}`,
          },
        ],
      ],
    },
  });
}


export async function handleSendTXCommand(msg: TelegramBot.Message): Promise<void> {
  const chatId = msg.chat.id;

  const connector = getConnector(chatId);

  await connector.restoreConnection();
  if (!connector.connected) {
      await bot.sendMessage(chatId, 'Connect wallet to send transaction');
      return;
  }

  connector
      .sendTransaction({
          validUntil: Math.round(Date.now() / 1000) + 600, // timeout is SECONDS
          messages: [
              {
                  amount: '1000000',
                  address: '0:0000000000000000000000000000000000000000000000000000000000000000'
              }
          ]
      })
      .then(() => {
          bot.sendMessage(chatId, `Transaction sent successfully`);
      })
      .catch(e => {
          if (e instanceof UserRejectsError) {
              bot.sendMessage(chatId, `You rejected the transaction`);
              return;
          }

          bot.sendMessage(chatId, `Unknown error happened`);
      })
      .finally(() => connector.pauseConnection());

  let deeplink = '';
  // const walletInfo = await getWalletInfo(connector.wallet!.device.appName);
  const wallets = await getWallets();
  const walletInfo = wallets.find(wallet => wallet.appName.toLocaleLowerCase()=== connector.wallet!.device.appName.toLocaleLowerCase())!;
  if (walletInfo) {
      deeplink = walletInfo.universalLink;
  }

  await bot.sendMessage(
      chatId,
      `Open ${walletInfo?.name || connector.wallet!.device.appName} and confirm transaction`,
      {
          reply_markup: {
              inline_keyboard: [
                  [
                      {
                          text: 'Open Wallet',
                          url: deeplink
                      }
                  ]
              ]
          }
      }
  );
}
export async function handleDisconnectCommand(msg: TelegramBot.Message): Promise<void> {
  const chatId = msg.chat.id;

  const connector = getConnector(chatId);

  await connector.restoreConnection();
  if (!connector.connected) {
      await bot.sendMessage(chatId, "You didn't connect a wallet");
      return;
  }

  await connector.disconnect();

  await bot.sendMessage(chatId, 'Wallet has been disconnected');
}

export async function handleShowMyWalletCommand(msg: TelegramBot.Message): Promise<void> {
  const chatId = msg.chat.id;

  const connector = getConnector(chatId);

  await connector.restoreConnection();
  if (!connector.connected) {
      await bot.sendMessage(chatId, "You didn't connect a wallet");
      return;
  }

  const walletName =
      (await getWalletInfo(connector.wallet!.device.appName))?.name ||
      connector.wallet!.device.appName;


  // await bot.sendMessage(
  //     chatId,
  //     `Connected wallet: ${walletName}\nYour address: ${toUserFriendlyAddress(
  //         connector.wallet!.account.address,
  //         connector.wallet!.account.chain === CHAIN.TESTNET
  //     )}`
  // );
  await bot.sendMessage(
    chatId,
    `Connected wallet: ${walletName}`
);
}