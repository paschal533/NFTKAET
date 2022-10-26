const { assert } = require('chai');
const { utils } = require('@aeternity/aeproject');

const NFTMarketplace_CONTRACT_SOURCE = './contracts/NFTMarketplace.aes';

describe('NFTMarketplaceContract', () => {
  let aeSdk;
  let contract;

  before(async () => {
    aeSdk = await utils.getSdk();

    // a filesystem object must be passed to the compiler if the contract uses custom includes
    const fileSystem = utils.getFilesystem(NFTMarketplace_CONTRACT_SOURCE);

    // get content of contract
    const source = utils.getContractContent(NFTMarketplace_CONTRACT_SOURCE);

    // initialize the contract instance
    contract = await aeSdk.getContractInstance({ source, fileSystem });
    await contract.deploy();

    // create a snapshot of the blockchain state
    await utils.createSnapshot(aeSdk);
  });

  // after each test roll back to initial state
  afterEach(async () => {
    await utils.rollbackSnapshot(aeSdk);
  });

  describe("create a token", async () => {
    it('NFT: mint token', async () => {
      let metaData =  "www.image.com";
      const { decodedResult } = await contract.methods.createToken(metaData, 30, { onAccount: utils.getDefaultAccounts()[0] });
      
      assert.equal(decodedResult, 0n, "token created");
    })

    it('emits the token created Event', async () => {
      let metaData =  "www.image.com";
      const { decodedEvents } = await contract.methods.createToken(metaData, 30, { onAccount: utils.getDefaultAccounts()[0] });
      const expectedEvent = "MarketItemCreated";

      const actualEvent = decodedEvents[0].name;
      
      assert.equal(actualEvent, expectedEvent, "events should match");
    })
  })

  describe("get the token metadata with id", async () => {
    it('returns nft token metadata', async () => {
      let metaData =  "www.image.com";
      await contract.methods.createToken(metaData, 30, { onAccount: utils.getDefaultAccounts()[0] });
      const { decodedResult } = await contract.methods.metadata(0);
      
      assert.equal(decodedResult, 'www.image.com', "Result sould match");
    })
  })

  describe("purchase token", async () => {
    it('purchase token from the marketplace', async () => {
      let metaData =  "www.image.com";
      await contract.methods.createToken(metaData, 30, { onAccount: utils.getDefaultAccounts()[1] });

      const { decodedEvents } = await contract.methods.buyToken(0, { onAccount: utils.getDefaultAccounts()[0],  amount: 30 });
      const expectedEvent = "BuyToken";

      const actualEvent = decodedEvents[0].name;
      
      assert.equal(decodedEvents[0].args[1], 30n, "values should match");
      assert.equal(decodedEvents[0].args[2], 0n, "values should match");
      assert.equal(actualEvent, expectedEvent, "events should match");
    })

    it('reverts if not enuogh fund', async () => {
      let metaData =  "www.image.com";
      await contract.methods.createToken(metaData, 30, { onAccount: utils.getDefaultAccounts()[0] });

      try {
        await contract.methods.buyToken(0, { onAccount: utils.getDefaultAccounts()[0],  amount: 20 });
        assert.fail("not enough fund ")
      } catch(err) {
        const expectedError = "Please submit the asking price in order to complete the purchase"
        const actualError = err.message;
        assert.include(actualError, expectedError);
      }
    })
  })

  describe("resell Token after purchase", async () => {
    it('relist token on the marketplace', async () => {
      let metaData =  "www.image.com";
      await contract.methods.createToken(metaData, 30, { onAccount: utils.getDefaultAccounts()[1] });

      await contract.methods.buyToken(0, { onAccount: utils.getDefaultAccounts()[0],  amount: 30 });

      const { decodedEvents } = await contract.methods.resellToken(0, 100, { onAccount: utils.getDefaultAccounts()[0] });
      
      const expectedEvent = "ResellToken";

      const actualEvent = decodedEvents[0].name;
      
      assert.equal(decodedEvents[0].args[1], 100n, "values should match");
      assert.equal(decodedEvents[0].args[2], 0n, "values should match");
      assert.equal(actualEvent, expectedEvent, "events should match");
    })

    it("throws an error when called from a non-onwer account", async () => {
      try {
        let metaData =  "www.image.com";
        await contract.methods.createToken(metaData, 30, { onAccount: utils.getDefaultAccounts()[1] });
  
        await contract.methods.buyToken(0, { onAccount: utils.getDefaultAccounts()[0],  amount: 30 });
  
        await contract.methods.resellToken(0, 100, { onAccount: utils.getDefaultAccounts()[1] });
        assert.fail("relist was not restricted to owner")
      } catch(err) {
        const expectedError = "Only item owner can perform this operation"
        const actualError = err.message;
        assert.include(actualError, expectedError);
      }
    });
  })

  describe("fetch all market items", async () => {
    it("returns all market items", async () => {
      let metaData =  "www.image.com";
      await contract.methods.createToken(metaData, 30, { onAccount: utils.getDefaultAccounts()[0] });

      let metaData2 =  "www.image2.com";
      await contract.methods.createToken(metaData2, 30, { onAccount: utils.getDefaultAccounts()[1] });

      let metaData3 =  "www.image3.com";
      await contract.methods.createToken(metaData3, 30, { onAccount: utils.getDefaultAccounts()[2] });

      const { decodedResult } = await contract.methods.fetchMarketItems();

      assert.equal(decodedResult[0].metadata_Url, 'www.image.com', "Result sould match");
      assert.equal(decodedResult[1].metadata_Url, 'www.image2.com', "Result sould match");
      assert.equal(decodedResult[2].metadata_Url, 'www.image3.com', "Result sould match");
    })
  })

});
