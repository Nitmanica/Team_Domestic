/**
 * Deploy EscrowContract to local or test network.
 *
 * Usage:
 *   cd blockchain
 *   npx hardhat compile
 *   npx hardhat run scripts/deploy.js --network localhost
 */
const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log(
    'Balance:',
    hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)),
    'ETH'
  );

  const EscrowContract = await hre.ethers.getContractFactory('EscrowContract');
  const escrow = await EscrowContract.deploy();
  await escrow.waitForDeployment();
  const address = await escrow.getAddress();
  console.log('EscrowContract deployed to:', address);
  console.log('\nAdd to backend .env:');
  console.log('ESCROW_CONTRACT_ADDRESS=' + address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

