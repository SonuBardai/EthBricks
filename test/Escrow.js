import pkg from "hardhat";
const { ethers } = pkg;
import { expect } from "chai";

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Escrow", () => {
  let buyer, seller, inspector, lender;
  let realEstate, escrow;

  const nftID = 1;

  const approveNftTransfer = async (address, nftID) => {
    const transaction = await realEstate.connect(address).approve(escrow.address, nftID);
    await transaction.wait();
    return transaction;
  };

  const list = async (address, nftID, buyer, purchasePrice, escrowAmount) => {
    await approveNftTransfer(address, nftID); // seller approves escrow to transfer the his property nft to escrow's wallet

    const transaction = await escrow.connect(address).list(nftID, buyer, purchasePrice, escrowAmount);
    await transaction.wait();
    return transaction;
  };

  beforeEach(async () => {
    [buyer, seller, inspector, lender] = await ethers.getSigners();
    // deploy the RealEstate contract
    const RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy();
    // Mint a real estate NFT using the seller address
    let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
    await transaction.wait();

    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(realEstate.address, seller.address, inspector.address, lender.address);
  });

  describe("Deployment", () => {
    it("Returns NFT address", async () => {
      const nftAddressResponse = await escrow.nftAddress();
      expect(nftAddressResponse).to.equal(realEstate.address);
    });
    it("Returns seller address", async () => {
      const sellerAddressResponse = await escrow.seller();
      expect(sellerAddressResponse).to.equal(seller.address);
    });
    it("Returns inspector address", async () => {
      const inspectorAddressResponse = await escrow.inspector();
      expect(inspectorAddressResponse).to.equal(inspector.address);
    });
    it("Returns lender address", async () => {
      const lenderAddressResponse = await escrow.lender();
      expect(lenderAddressResponse).to.equal(lender.address);
    });
  });

  describe("Listing property NFT", () => {
    it("Listing property updates ownership of NFT", async () => {
      await list(seller, nftID, buyer.address, tokens(10), tokens(5));
      expect(await realEstate.ownerOf(1)).to.equal(escrow.address);
    });

    it("Sets listed to true", async () => {
      await list(seller, nftID, buyer.address, tokens(10), tokens(5));
      expect(await escrow.isListed(1)).to.equal(true);
    });

    it("Sets buyer, purchasePrice, escrowAmount", async () => {
      await list(seller, nftID, buyer.address, tokens(10), tokens(5));
      expect(await escrow.isListed(1)).to.equal(true);
      expect(await escrow.buyer(1)).to.equal(buyer.address);
      expect(await escrow.purchasePrice(1)).to.equal(tokens(10));
      expect(await escrow.escrowAmount(1)).to.equal(tokens(5));
    });
  });

  describe("Depositing earnest amount", () => {
    it("Updates contract balance", async () => {
      await list(seller, nftID, buyer.address, tokens(10), tokens(5));
      const transaction = await escrow.connect(buyer).depositEarnestAmount(1, { value: tokens(5) });
      await transaction.wait();
      const balance = await escrow.getBalance();
      expect(balance).to.equal(tokens(5));
    });
  });

  describe("Inspection", () => {
    it("updates inspection status", async () => {
      await list(seller, nftID, buyer.address, tokens(10), tokens(5));
      const transaction = await escrow.connect(inspector).updateInspectionStatus(nftID);
      await transaction.wait();
      const inspectionStatus = await escrow.getInspectionStatus(nftID);
      expect(inspectionStatus).to.be.equal(true);
    });
  });

  describe("Approving property", () => {
    it("Updates approvals mapping", async () => {
      await list(seller, nftID, buyer.address, tokens(10), tokens(5));

      let transaction = await escrow.connect(seller).approveSale(nftID);
      await transaction.wait();

      transaction = await escrow.connect(buyer).approveSale(nftID);
      await transaction.wait();

      transaction = await escrow.connect(inspector).approveSale(nftID);
      await transaction.wait();

      expect(await escrow.approvals(nftID, seller.address)).to.be.equal(true);
      expect(await escrow.approvals(nftID, buyer.address)).to.be.equal(true);
      expect(await escrow.approvals(nftID, inspector.address)).to.be.equal(true);
    });
  });

  describe("Finalize sale", () => {
    it("Performs the transfer to complete the sale", async () => {
      // list the property
      await list(seller, nftID, buyer.address, tokens(10), tokens(5));

      // send earnest amount
      let transaction = await escrow.connect(buyer).depositEarnestAmount(1, { value: tokens(5) });
      await transaction.wait();

      // mark as inspected
      transaction = await escrow.connect(inspector).updateInspectionStatus(nftID);
      await transaction.wait();

      // approve the sale
      transaction = await escrow.connect(seller).approveSale(nftID);
      await transaction.wait();
      transaction = await escrow.connect(buyer).approveSale(nftID);
      await transaction.wait();
      transaction = await escrow.connect(inspector).approveSale(nftID);
      await transaction.wait();

      // lender lends the remaining 5 tokens that are needed to finish the sale. ie. total property value = 10. 5 are given in earnest amount. remaining 5 from the lender.
      await lender.sendTransaction({ to: escrow.address, value: tokens(5) });

      // finalize the sale
      transaction = await escrow.connect(seller).finalizeSale(nftID);

      // check balance of the escrow to be 0
      expect(await escrow.getBalance()).to.equal(0);
      expect(await realEstate.ownerOf(nftID)).to.be.equal(buyer.address);
      expect(await escrow.isListed(nftID)).to.be.equal(false);
    });
  });

  describe("Allows cancellation", () => {
    it("refunds after cancellation", async () => {
      await list(seller, nftID, buyer.address, tokens(10), tokens(5));
      const transaction = await escrow.connect(buyer).depositEarnestAmount(nftID, { value: tokens(5) });
      await transaction.wait();
      await escrow.connect(buyer).cancelSale(nftID);
      expect(await escrow.getBalance()).to.equal(0);
    });
  });
});
