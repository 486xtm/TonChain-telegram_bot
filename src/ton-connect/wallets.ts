import { isWalletInfoRemote, WalletInfoRemote, WalletsListManager , WalletInfo} from "@tonconnect/sdk";
const walletsLIstManager = new WalletsListManager({
  cacheTTLMs : Number(process.env.WALLETS_LIST_CACHE_TTL_MS)
});

export async function getWallets(): Promise<WalletInfoRemote[]> {
  const wallets = await walletsLIstManager.getWallets();
  return wallets.filter(isWalletInfoRemote);
}
export async function getWalletInfo(walletAppName: string): Promise<WalletInfo | undefined> {
  const wallets = await getWallets();
  return wallets.find(wallet => wallet.appName.toLocaleLowerCase() === walletAppName.toLocaleLowerCase());
}