const hre = require("hardhat");

async function main() {
  const token = await hre.ethers.deployContract("FridayToken");
  await token.waitForDeployment();
  console.log("Token address:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

module.exports.tags = ["all", "FridayToken"];
