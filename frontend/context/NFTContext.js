import React, { useEffect, useState } from 'react';
import { AeSdk, Node, AE_AMOUNT_FORMATS } from "@aeternity/aepp-sdk";
import axios from 'axios';

import { MarketAddress, MarketAddressACI } from './constants';

export const NFTContext = React.createContext();

export const NFTProvider = ({ children }) => {
  const nftCurrency = 'AE';
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState("");

  const fetchNFTs = async () => {
    try {
      setIsLoadingNFT(false);

      const data = await contract.fetchMarketItems();

      const { decodedResult } = await contract.fetchMarketItems()

      console.log(data)

      console.log(decodedResult)

      /*const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
        const tokenURI = await contract.tokenURI(tokenId);
        const { data: { image, name, description } } = await axios.get(tokenURI);
        const price = ethers.utils.formatUnits(unformattedPrice.toString(), 'ether');

        return { price, tokenId: tokenId.toNumber(), id: tokenId.toNumber(), seller, owner, image, name, description, tokenURI };
      }));

      return items;*/
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

      const _balance = await aeSdk.getBalance(_address, {
        format: AE_AMOUNT_FORMATS.AE,
      });

      setBalance(_balance);
      toast({
        position: "top-left",
        title: "Wallet connect",
        description: "Wallet connected successfully ",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    } catch (error) {
      console.log(error);
      /*toast({
        position: "top-left",
        title: "Not Connected",
        description: "No SuperHero wallet found",
        status: "error",
        duration: 9000,
        isClosable: true,
      });*/
    }
  };

  useEffect(() => {
    init();
    connectWallet();
  }, []);

  const fetchMyNFTsOrCreatedNFTs = async (type) => {
    setIsLoadingNFT(false);

    const { decodedResult } = await contract.fetchMarketItems()

    console.log(decodedResult)
    /*const data = type === 'fetchItemsListed' ? await contract.fetchItemsListed() : await contract.fetchMyNFTs();

    const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
      const tokenURI = await contract.tokenURI(tokenId);
      const { data: { image, name, description } } = await axios.get(tokenURI);
      const price = ethers.utils.formatUnits(unformattedPrice.toString(), 'ether');

      return { price, tokenId: tokenId.toNumber(), seller, owner, image, name, description, tokenURI };
    }));

    return items;*/
  };

  const createSale = async (url, formInputPrice, isReselling, id) => {

    const transaction = !isReselling
      ? await contract.createToken(url, Number(formInputPrice), { onAccount: account })
      : await contract.resellToken(id, Number(formInputPrice), { onAccount: account });

    setIsLoadingNFT(true);

    console.log(transaction)
  };

  const buyNft = async (nft) => {
    try {
      setIsLoadingNFT(true);
      await contract.buyToken(nft.tokenId, { onAccount: account,  amount: Number(nft.price) });
      setIsLoadingNFT(false);
    } catch (error) {
      alert("You do not have sufficient money on your wallet to purchase this NFT. ");
    }
  };


  return (
    <NFTContext.Provider value={{ nftCurrency, buyNft, createSale, fetchNFTs, fetchMyNFTsOrCreatedNFTs, connectWallet, currentAccount, isLoadingNFT }}>
      {children}
    </NFTContext.Provider>
  );
};