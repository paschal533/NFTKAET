import React, { useEffect, useState } from "react";
import { AeSdk, Node, AE_AMOUNT_FORMATS } from "@aeternity/aepp-sdk";
import { iniSDK } from "../utils/aeternity.ts";
import axios from "axios";
import { useToast } from "@chakra-ui/react";

import { MarketAddress, MarketAddressACI } from "./constants";

export const NFTContext = React.createContext();

export const NFTProvider = ({ children }) => {
  const nftCurrency = "AE";
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState("");
  const toast = useToast();

  const fetchNFTs = async () => {
    try {
      setIsLoadingNFT(false);

      const { decodedResult } = await contract.fetchMarketItems();

      const items = await Promise.all(
        decodedResult.map(
          async ({ metadata_Url, tokenId, seller, owner, price }) => {
            const {
              data: { image, name, description },
            } = await axios.get(metadata_Url);

            return {
              price: Number(price),
              tokenId: Number(tokenId),
              seller,
              owner,
              image,
              name,
              description,
              metadata_Url,
            };
          }
        )
      );

      return items;
    } catch (error) {
      console.log(error);
    }
  };

  const init = async () => {
    try {
      const node = new Node("https://testnet.aeternity.io"); // ideally host your own node

      const aeSdk = new AeSdk({
        nodes: [{ name: "testnet", instance: node }],
      });

      const aci = MarketAddressACI; // ACI of the contract
      const contractAddress = MarketAddress; // the address of the contract
      const contractInstance = await aeSdk.getContractInstance({
        aci,
        contractAddress,
      });
      setContract(contractInstance.methods);
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const aeSdk = await iniSDK();

      const _address = await aeSdk.address();
      setAccount(aeSdk);
      setCurrentAccount(_address);

      toast({
        position: "top-left",
        title: "Wallet connect",
        description: "Wallet connected successfully ",
        status: "success",
        duration: 9000,
        isClosable: true,
      });

      const _balance = await aeSdk.getBalance(_address, {
        format: AE_AMOUNT_FORMATS.AE,
      });

      setBalance(_balance);
    } catch (error) {
      console.log(error);
      toast({
        position: "top-left",
        title: "Not Connected",
        description: "No SuperHero wallet found",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    init();
    connectWallet();
  }, []);

  const fetchMyNFTsOrCreatedNFTs = async (type) => {
    setIsLoadingNFT(false);

    const { decodedResult } = await contract.fetchMarketItems();

    try {
      if (type === "fetchItemsListed") {
        const items = await Promise.all(
          decodedResult.map(
            async ({ metadata_Url, tokenId, seller, owner, price }) => {
              if (seller === currentAccount) {
                const {
                  data: { image, name, description },
                } = await axios.get(metadata_Url);

                return {
                  price: Number(price),
                  tokenId: Number(tokenId),
                  seller,
                  owner,
                  image,
                  name,
                  description,
                  metadata_Url,
                };
              }
            }
          )
        );

        return items;
      } else {
        const items = await Promise.all(
          decodedResult.map(
            async ({ metadata_Url, tokenId, seller, owner, price }) => {
              if (owner === currentAccount) {
                const {
                  data: { image, name, description },
                } = await axios.get(metadata_Url);

                return {
                  price: Number(price),
                  tokenId: Number(tokenId),
                  seller,
                  owner,
                  image,
                  name,
                  description,
                  metadata_Url,
                };
              }
            }
          )
        );

        return items;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const createSale = async (url, formInputPrice, isReselling, id) => {
    try {
      setIsLoadingNFT(true);

      const transaction = !isReselling
        ? await contract.createToken(url, Number(formInputPrice), {
            onAccount: account,
          })
        : await contract.resellToken(id, Number(formInputPrice), {
            onAccount: account,
          });

      console.log(transaction);
      setIsLoadingNFT(false);
    } catch (error) {
      console.log(error);
    }
  };

  const buyNft = async (nft) => {
    try {
      setIsLoadingNFT(true);
      await contract.buyToken(nft.tokenId, {
        onAccount: account,
        amount: Number(nft.price),
      });
      setIsLoadingNFT(false);
    } catch (error) {
      console.log(error);
      toast({
        position: "top-left",
        title: "Insufficient balance",
        description:
          "You don not have sufficient balance to complete this transaction",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  return (
    <NFTContext.Provider
      value={{
        nftCurrency,
        buyNft,
        contract,
        createSale,
        fetchNFTs,
        fetchMyNFTsOrCreatedNFTs,
        connectWallet,
        currentAccount,
        isLoadingNFT,
      }}
    >
      {children}
    </NFTContext.Provider>
  );
};
