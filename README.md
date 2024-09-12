# Multisignature and Factory Contract Project

## Overview

This project provides a multisignature contract, a factory contract, and a script to facilitate the creation and management of multisignature wallets. The project consists of a `multisig.ts` file, which contains the implementation of the multisignature wallet creation and management, a `Multisig` contract, and a `Factory` contract.

## Setup and Run

To set up and run the project, follow these steps:

1. Install the required dependencies:
   ```
   npm install
   ```
2. Run the script:
   ```
   node multisig.ts
   ```

## Deploying the Multisig and Factory Contracts

To deploy the `Multisig` and `Factory` contracts, follow these steps:

1. Compile the contracts using your preferred Solidity compiler.
2. Deploy the `Factory` contract to your preferred blockchain network.
3. Use the `Factory` contract to deploy new `Multisig` contracts.

## Creating and Managing Multisignature Wallets

To create and manage multisignature wallets, follow these steps:

1. Prepare a CSV file named `signers.csv` containing the addresses of the signers for the multisignature wallet.
2. Run the `multisig.ts` script, providing the CSV file path and other required parameters as input.
3. The script will create a new `Multisig` contract and print its address to the console.

## Explanation of Multisig.sol and Factory.sol Functions

The `Multisig` contract has the following functions:

- `constructor`: Initializes the contract with the list of valid signers and the quorum.
- `transfer`: Allows valid signers to propose a transaction.
- `approveTx`: Allows valid signers to approve a proposed transaction.
- `executeTx`: Executes a transaction once it has reached the required quorum.
- `isValidSigner`: Checks if an address is a valid signer.
- `quorum`: Returns the quorum required for a transaction.

The `Factory` contract has the following functions:

- `createMultisig`: Creates a new `Multisig` contract with the provided parameters.
- `getMultisigAddress`: Returns the address of a `Multisig` contract created by the factory.

## Assumptions and Limitations

- The script assumes that the addresses of the signers for the multisignature wallet are stored in a CSV file named `signers.csv`.
- The `Multisig` contract assumes that the signers have been correctly set up and that the quorum is a valid number.
- The script and the contracts assume that the blockchain network supports the required functionality.

## Implementation Details

The `multisig.ts` file implements the creation and management of multisignature wallets using the `Multisig` and `Factory` contracts. The contracts are implemented in Solidity and use a combination of access control and transaction management to facilitate secure and decentralized decision-making.

## Testing the Application

To test the application, you can use the provided test files in the `test` directory. These tests cover various scenarios such as deploying the contracts with the correct parameters, creating and managing multisignature wallets, proposing and executing transactions, and handling invalid transactions correctly.

To run the tests, execute the following command in your terminal:
```
npx hardhat test
```
