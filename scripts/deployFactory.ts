import { ethers } from "hardhat";
const hre = require("hardhat");

// Function to deploy and interact with the MultiSignatureFactory and MultiSignature contracts
async function main() {

  // Addresses of the factory and the SmartDevToken contracts
  const factoryAddr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const smartDevTokenAddr = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // Get the contract instances
  const walletFactory = await ethers.getContractAt("MultiSignatureFactory", factoryAddr);
  const [owner, user1, user2, user3, user4, user5, user6] = await hre.ethers.getSigners();
  const signers = [user1.address, user2.address, user3.address, user4.address, user5.address, user6.address];

  // Create a new MultiSignature Wallet with a quorum of 3 and the specified signers
  const createWallet = await walletFactory.createMultisigWallet(3, signers);
  const wallet = await createWallet.wait();
  const walletClone = await walletFactory.getMultiSigClones();
  console.log("New Wallet clone addresses: ", walletClone);

  // Interact with the first clone of the MultiSignature Wallet
  const walletClone1 = walletClone[0];
  const sigWallet = await ethers.getContractAt("MultiSignature", walletClone1);

  // Transfer some SmartDevToken to the clone contract
  const smartDevToken = await ethers.getContractAt("SmartDevToken", smartDevTokenAddr);
  const amountToTransfer_ = ethers.parseUnits("5", 18);
  const trToken = await smartDevToken.transfer(walletClone1, amountToTransfer_);
  trToken.wait();
  console.log("Transfer some SMD ERC Token to wallet");
  const cloneBal = await smartDevToken.balanceOf(walletClone1);
  console.log(`Clone One ${walletClone1} SMD Contract Balance:  ${cloneBal}` )

  // Transfer funds from the MultiSignature Wallet
  const amountToTransfer = ethers.parseUnits("1", 18);
  const trf = await sigWallet.connect(user1).transfer(amountToTransfer, "0x06D97198756295A96C2158a23963306f507b2f69", smartDevTokenAddr);
  console.log("Transfer from multisig wallet initiated with block hash", trf.hash);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
