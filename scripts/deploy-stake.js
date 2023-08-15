const hre = require("hardhat");

async function main() {
  const tokenAddress = "0xb7f8bc63bbcad18155201308c8f3540b07f84f5e";
  const stake = await hre.ethers.getContractFactory("FridayStake");
  const fridayStake = await stake.deploy(tokenAddress, tokenAddress);
  await fridayStake.waitForDeployment();
  console.log("Token address:", await fridayStake.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

module.exports.tags = ["all", "FridayStake"];
