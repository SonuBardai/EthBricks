// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import pkg from "hardhat";
const { ethers } = pkg;

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

async function main() {
  const [buyer, seller, inspector, lender] = await ethers.getSigners();
  // deploy the real estate and escrow contracts
  const RealEstate = await ethers.getContractFactory("RealEstate");
  const realEstate = await RealEstate.deploy();
  await realEstate.deployed();
  console.log(`Deployed Real Estate Contract at: ${realEstate.address}`);

  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(realEstate.address, seller.address, inspector.address, lender.address);
  await escrow.deployed();
  console.log(`Deployed Escrow Contract at: ${escrow.address}`);

  // mint 3 dummy property nfts
  for (let i = 0; i < 3; i++) {
    const ipfsUrl = `https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${i + 1}.json`;
    let transaction = await realEstate.connect(seller).mint(ipfsUrl);
    await transaction.wait();
    // seller approves escrow to transfer nft during listing
    transaction = await realEstate.connect(seller).approve(escrow.address, i + 1);
    await transaction.wait();
  }
  console.log("Finished minting 3 nfts for properties");

  // list the properties
  let transaction = await escrow.connect(seller).list(1, buyer.address, tokens(20), tokens(15));
  await transaction.wait();
  transaction = await escrow.connect(seller).list(2, buyer.address, tokens(15), tokens(10));
  await transaction.wait();
  transaction = await escrow.connect(seller).list(3, buyer.address, tokens(10), tokens(5));
  await transaction.wait();
  console.log("Properties listed on Escrow");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
