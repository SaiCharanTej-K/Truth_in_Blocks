const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const NewsValidation = await hre.ethers.getContractFactory("NewsValidation");
  
  // Deploy the contract
  const newsValidation = await NewsValidation.deploy();
  
  // Wait for deployment to finish
  await newsValidation.waitForDeployment();
  
  // Get the contract address
  const address = await newsValidation.getAddress();
  
  console.log("NewsValidation deployed to:", address);

  // Save the contract address to use it in the frontend
  console.log("Please copy this address into your React frontend configuration");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });