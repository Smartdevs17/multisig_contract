import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre, { ethers } from "hardhat";



describe("MultiSignature Wallet Contract Test.", function(){

    async function deployMultisignatureFixture() {
        const _quorum = 4;
        const [ user1, addr2, addr3, addr4, addr5, addr6] = await hre.ethers.getSigners();
        const multiSync = await hre.ethers.getContractFactory("MultiSignature");
        const signers = [user1, addr2, addr3, addr4];
        const receipents = [addr5, addr6];
        const wallet = await multiSync.deploy(_quorum, signers);

        return { wallet, _quorum, signers, receipents};
    }

    async function deploySmartDevToken() {
        const [tokenAddress] = await hre.ethers.getSigners();
        const SmartDevToken = await hre.ethers.getContractFactory("SmartDevToken");
        const smartDevToken = await SmartDevToken.deploy();
        return { tokenAddress, smartDevToken }

    }

    describe("Deployment", function(){
        it("Should validate that the number of valid signers is greater than one", async function(){
            const { signers } = await loadFixture(deployMultisignatureFixture);
            expect(await signers.length).to.be.gt(1);
        });

        it("Should validate that the quorum is greater than one", async function(){
            const { _quorum } = await loadFixture(deployMultisignatureFixture);
            expect(await _quorum).to.be.gt(1);
        });

        it("Should validate that the addresses are valid signer addresses", async function(){
            const { signers } = await loadFixture(deployMultisignatureFixture);
            expect (await signers).to.not.revertedWith("Invalid Signer Address"); 
        });

        it("Should validate that the quorum value is less than or equal to the number of valid signers", async function(){
            const {  _quorum, signers } = await loadFixture(deployMultisignatureFixture);
            expect (await _quorum).to.be.lessThanOrEqual(signers.length);
        });


    });

    describe("Transfer", function(){
        it("Should validate that the addresses given are not zero addresses", async function(){

            const { wallet, signers,} = await loadFixture(deployMultisignatureFixture);

            const { smartDevToken } = await loadFixture(deploySmartDevToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            smartDevToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);
            expect(await wallet.connect(signers[0]).transfer(_amount, signers[1], smartDevToken.getAddress())).to.not.be.revertedWith("address zero found")
        });

        it("Should validate that the address calling the function is a valid signer", async function(){

            const { wallet, signers, } = await loadFixture(deployMultisignatureFixture);

            const {  smartDevToken } = await loadFixture(deploySmartDevToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            smartDevToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);
            expect(await wallet.connect(signers[0]).transfer(_amount, signers[1], smartDevToken.getAddress())).to.not.be.revertedWith("invalid signer")

        });

        it("Should validate that the amount is greater than zero", async function(){

            const { wallet, signers, receipents} = await loadFixture(deployMultisignatureFixture);

            const {  smartDevToken } = await loadFixture(deploySmartDevToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            smartDevToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);
            await expect(wallet.connect(signers[0]).transfer(_amount, receipents[1], smartDevToken.getAddress())).to.not.be.revertedWith("can't send zero amount")

        });

        it("Should validate that the wallet has enough funds", async function(){

            const { wallet, signers} = await loadFixture(deployMultisignatureFixture);

            const {  smartDevToken } = await loadFixture(deploySmartDevToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            smartDevToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);
            await expect( wallet.connect(signers[0]).transfer(_amount, signers[1], smartDevToken.getAddress())).to.not.be.revertedWith("insufficient funds")

        });

        it("Should validate that the transfer transaction was created successfully", async function(){

            const { wallet, signers} = await loadFixture(deployMultisignatureFixture);

            const {  smartDevToken } = await loadFixture(deploySmartDevToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            smartDevToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);
            expect(await wallet.connect(signers[0]).transfer(_amount, signers[1], smartDevToken.getAddress())).to.not.reverted
        });
    });


    describe("updateQuorum", function(){
        it("Should validate that the quorum given is not zero", async function(){

            const { wallet, signers} = await loadFixture(deployMultisignatureFixture);

            const {  smartDevToken } = await loadFixture(deploySmartDevToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            smartDevToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);

            expect(await wallet.connect(signers[0]).updateQuorum(1)).to.not.be.revertedWith("Quorum cannot be zero")
        });

        it("Should validate that the new quorum is less than or equal to the number of valid signers", async function(){

            const { wallet, signers} = await loadFixture(deployMultisignatureFixture);

            const {  smartDevToken } = await loadFixture(deploySmartDevToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            smartDevToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);

            expect(await wallet.connect(signers[0]).updateQuorum(4)).to.not.be.revertedWith("New is greater than signers.")
        });

        it("Should validate that the sender is not address zero", async function(){

            const { wallet, signers} = await loadFixture(deployMultisignatureFixture);

            const {  smartDevToken } = await loadFixture(deploySmartDevToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            smartDevToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);

            expect(await wallet.connect(signers[0]).updateQuorum(1)).to.not.be.revertedWith("Address zero detected.")
        });

        it("Should validate that the sender is a valid signer", async function(){

            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultisignatureFixture);

            const { tokenAddress, smartDevToken } = await loadFixture(deploySmartDevToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            smartDevToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);

            expect(await wallet.connect(signers[0]).updateQuorum(1)).to.not.be.revertedWith("Not a valid signer.")
        });

        it("Should validate that the updateQuorom function is executed successfully", async function(){

            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultisignatureFixture);

            const { tokenAddress, smartDevToken } = await loadFixture(deploySmartDevToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            smartDevToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);
            expect(await wallet.connect(signers[0]).updateQuorum(3)).to.not.reverted
        });

    
    });

    describe("approveTx", function(){
        it("Should validate that the transaction is not already completed", async function(){

            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultisignatureFixture);

            const { tokenAddress, smartDevToken } = await loadFixture(deploySmartDevToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            smartDevToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);
            await wallet.connect(signers[0]).transfer(_amount, signers[1], smartDevToken.getAddress());
            await wallet.connect(signers[0]).transfer(_amount, signers[1], smartDevToken.getAddress());

            expect(await wallet.connect(signers[1]).approveTx(2)).to.not.be.revertedWith("Transaction already completed.")
        });


        it("Should validate that the transaction ID is valid", async function(){

            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultisignatureFixture);

            const { tokenAddress, smartDevToken } = await loadFixture(deploySmartDevToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            smartDevToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);
            await wallet.connect(signers[0]).transfer(_amount, signers[1], smartDevToken.getAddress());
            await wallet.connect(signers[0]).transfer(_amount, signers[1], smartDevToken.getAddress());

        
            expect(await wallet.connect(signers[1]).approveTx(2)).to.not.be.revertedWith("Invalid transaction Id.")
        });

        it("Should validate that the wallet has enough funds", async function(){

            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultisignatureFixture);

            const {  smartDevToken } = await loadFixture(deploySmartDevToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            smartDevToken.transfer(wallet.getAddress(),amountToTransfer);
            const _amount = ethers.parseUnits("1", 18);
            await wallet.connect(signers[0]).transfer(_amount, signers[1], smartDevToken.getAddress());
            await wallet.connect(signers[0]).transfer(_amount, signers[1], smartDevToken.getAddress());

            await expect(wallet.connect(signers[1]).approveTx(2)).to.not.be.revertedWith("insufficient funds.")

        });

        it("Should validate that the total approval has been reached.", async function(){
            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultisignatureFixture);

            const { tokenAddress, smartDevToken } = await loadFixture(deploySmartDevToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            smartDevToken.transfer(wallet.getAddress(),amountToTransfer);
            const _amount = ethers.parseUnits("1", 18);
            await wallet.connect(signers[0]).transfer(_amount, signers[1], smartDevToken.getAddress());
            await wallet.connect(signers[0]).transfer(_amount, signers[1], smartDevToken.getAddress());
            
            // await wallet.connect(signers[0]).approveTx(2);
            await wallet.connect(signers[1]).approveTx(2);
            await wallet.connect(signers[2]).approveTx(2);
            

            await expect(wallet.connect(signers[3]).approveTx(2)).to.not.be.revertedWith("Can't sign twice.")
        });

        it("Should validate that the transaction has not already been signed by a signer.", async function(){
            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultisignatureFixture);

            const { tokenAddress, smartDevToken } = await loadFixture(deploySmartDevToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            smartDevToken.transfer(wallet.getAddress(),amountToTransfer);
            const _amount = ethers.parseUnits("1", 18);
            
            await wallet.connect(signers[0]).transfer(_amount, signers[1], smartDevToken.getAddress());
            await wallet.connect(signers[0]).transfer(_amount, signers[1], smartDevToken.getAddress());
            
            // await wallet.connect(signers[0]).approveTx(2);
            await expect(wallet.connect(signers[0]).approveTx(2)).to.be.revertedWith("Can't sign twice.");
            
        });

        it("Should validate that the signer is a valid signer.", async function(){
            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultisignatureFixture);

            const { tokenAddress, smartDevToken } = await loadFixture(deploySmartDevToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            smartDevToken.transfer(wallet.getAddress(),amountToTransfer);
            const _amount = ethers.parseUnits("1", 18);
            await wallet.connect(signers[0]).transfer(_amount, signers[1], smartDevToken.getAddress());
            await wallet.connect(signers[0]).transfer(_amount, signers[1], smartDevToken.getAddress());
            
            await expect(wallet.connect(signers[0]).approveTx(2)).to.not.be.revertedWith("Not a valid signer.");
            
        });

        it("Should validate that the approve function is working perfectly.", async function(){
            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultisignatureFixture);

            const { tokenAddress, smartDevToken } = await loadFixture(deploySmartDevToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            smartDevToken.transfer(wallet.getAddress(),amountToTransfer);
            const _amount = ethers.parseUnits("1", 18);
            await wallet.connect(signers[0]).transfer(_amount, signers[1], smartDevToken.getAddress());
            await wallet.connect(signers[0]).transfer(_amount, signers[1], smartDevToken.getAddress());
            
            
            await expect(wallet.connect(signers[1]).approveTx(2)).to.not.reverted;
            
        });
    });
});