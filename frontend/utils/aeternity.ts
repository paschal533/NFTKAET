import {
  AeSdkAepp,
  BrowserWindowMessageConnection,
  SUBSCRIPTION_TYPES,
  Node,
  walletDetector,
} from "@aeternity/aepp-sdk";

export const scanForWallet = async (aeSdk: AeSdkAepp) => {
  try {
    if (aeSdk) {
      return new Promise((resolve, reject) => {
        if (!aeSdk) reject("Failed!, SDK is not initialized.");
        const scannerConnection = new BrowserWindowMessageConnection();
        const handleNewWallet = async ({ wallets, newWallet }: any) => {
          const wallet = newWallet || Object.values(wallets)[0];
          stopScan();
          await aeSdk.connectToWallet(await wallet.getConnection());

          await aeSdk.subscribeAddress(
            // @ts-ignore
            SUBSCRIPTION_TYPES.subscribe,
            "current"
          );
          resolve(wallet);
        };

        const stopScan = walletDetector(
          scannerConnection,
          handleNewWallet.bind(this)
        );
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const iniSDK = async () => {
  try {
    const aeSdk = new AeSdkAepp({
      name: "Skaker",
      nodes: [
        {
          name: "ae_uat",
          instance: new Node("https://testnet.aeternity.io"),
        },
      ],
      compilerUrl: "https://compiler.aepps.com",
      onAddressChange: (p) => console.log("onAddressChange", p),
      onDisconnect: (p) => console.log("onDisconnect", p),
      onNetworkChange: (p) => console.log("onNetworkChange", p),
    });

    await scanForWallet(aeSdk);

    return aeSdk;
  } catch (error) {
    console.log(error);
  }
};
