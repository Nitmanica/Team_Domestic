/**
 * Deploy Escrow contract to Hardhat network (local or Sepolia).
 * Usage:
 *   npx hardhat run scripts/deploy.js --network localhost
 *   npx hardhat run scripts/deploy.js --network sepolia
 */
const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Balance:', hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), 'ETH');

  const Escrow = await hre.ethers.getContractFactory('Escrow');
  const escrow = await Escrow.deploy();
  await escrow.waitForDeployment();
  const address = await escrow.getAddress();
  console.log('Escrow deployed to:', address);
  console.log('\nAdd to backend .env:');
  console.log('ESCROW_CONTRACT_ADDRESS=' + address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
