import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('Multisig', function () {
    async function deployTokenFixture() {
        const SmartDev = await ethers.getContractFactory("SmartDev");
        const token = await SmartDev.deploy();
        return { token };
    }

    async function deployMultisigFixture() {
        const { token } = await loadFixture(deployTokenFixture);
        const Multisig = await ethers.getContractFactory("Multisig");
        const signers = await ethers.getSigners();
        const [owner, user1, user2, user3, user4, user5, user6] = signers;
        const validSigners = [owner.address, user1.address, user2.address, user3.address, user4.address, user5.address];
        const quorum = 5; 

        const multisig = await Multisig.deploy(quorum, validSigners);  
        const rewardAmount = ethers.parseEther("1000.0");

        // Ensure the token contract has enough tokens to transfer
        await token.transfer(await multisig.getAddress(), rewardAmount);

        return { token, multisig, quorum, owner, user1, user2, user3, user4, user5, user6 };
    }

    

    describe('Deployment', function () {
        it('Should deploy with the correct valid signers and quorum', async function () {
            const { multisig , quorum, owner, user1, user2, user3, user4, user5 } = await loadFixture(deployMultisigFixture);

            expect(await multisig.getAddress()).to.not.equal(ethers.ZeroAddress);
            expect(await multisig.quorum()).to.equal(quorum);
            expect(await multisig.isValidSigner(owner.address)).to.be.true;
            expect(await multisig.isValidSigner(user1.address)).to.be.true;
            expect(await multisig.isValidSigner(user2.address)).to.be.true;
            expect(await multisig.isValidSigner(user3.address)).to.be.true;
            expect(await multisig.isValidSigner(user4.address)).to.be.true;
            expect(await multisig.isValidSigner(user5.address)).to.be.true;
        });
    });

    describe('Transfer', function () {
        it('Should allow valid signers to propose a transaction with correct parameters', async function () {   
            const { token, multisig, owner, user1, user2, user3, user4, user5 } = await loadFixture(deployMultisigFixture);

            // Test with a valid signer
            await multisig.transfer(100, user1.address, token.getAddress());

            // Test with another valid signer
            await multisig.connect(user2).transfer(200, user2.address, token.getAddress());

            // Test with all valid signers
            for (const signer of [owner, user1, user2, user3, user4, user5]) {
                await multisig.connect(signer).transfer(100, signer.address, token.getAddress());
            }
        });

        it('Should not allow non-valid signers to propose a transaction', async function () {   
            const { multisig, token, user1, user6} = await loadFixture(deployMultisigFixture);  

            // Create a new signer that is not a valid signer
            await expect(multisig.connect(user6).transfer(100, user1.address, token.getAddress())).to.be.revertedWith("invalid signer");
        });

        it('Should revert if the recipient is the zero address', async function () {   
            const { multisig, token, owner} = await loadFixture(deployMultisigFixture);  

            // Attempt to transfer to the zero address
            await expect(multisig.connect(owner).transfer(100, ethers.ZeroAddress, token.getAddress())).to.be.revertedWith("address zero found");
        });

        it('Should revert if the token address is the zero address', async function () {   
            const { multisig, owner} = await loadFixture(deployMultisigFixture);  

            // Attempt to transfer with the zero address as the token address
            await expect(multisig.connect(owner).transfer(100, owner.address, ethers.ZeroAddress)).to.be.revertedWith("address zero found");
        });

        it('Should revert if the amount is zero', async function () {   
            const { multisig, token, owner} = await loadFixture(deployMultisigFixture);  

            // Attempt to transfer zero amount
            await expect(multisig.connect(owner).transfer(0, owner.address, token.getAddress())).to.be.revertedWith("can't send zero amount");
        });

        it('Should revert if there are insufficient funds', async function () {   
            const { multisig, token, owner} = await loadFixture(deployMultisigFixture);  
            const amount = ethers.parseEther("10000.0"); 

            // Attempt to transfer with insufficient funds
            await expect(multisig.connect(owner).transfer(amount, owner.address, token.getAddress())).to.be.revertedWith("insufficient funds");
        });
    });

    describe('Approve', function () {
        it('Should allow valid signers to approve a transaction', async function () {   
            const { multisig, token, user1, user2, } = await loadFixture(deployMultisigFixture);  

            // Propose a transaction first
            await multisig.transfer(100, user1.address, token.getAddress());

            // Approve the transaction
            await multisig.connect(user2).approveTx(1); 
        });

        it('Should not allow non-valid signers to approve a transaction', async function () {   
            const { multisig, token, user1, user6} = await loadFixture(deployMultisigFixture);  

            // Propose a transaction first
            await multisig.transfer(100, user1.address, token.getAddress());

            // Create a new signer that is not a valid signer
            await expect(multisig.connect(user6).approveTx(1)).to.be.revertedWith("not a valid signer");
        });
    });

    describe('Update Quorum', function () {
        it('Should update the quorum correctly', async function () {   
            const { multisig, owner } = await loadFixture(deployMultisigFixture);  

            // Update the quorum
            await multisig.connect(owner).updateQuorum(6);
            expect(await multisig.quorum()).to.equal(6);
        });
    });
});
