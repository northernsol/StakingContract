const { assert, expect } = require("chai");
const { ethers } = require("hardhat");
const { moveTime } = require("../utils/move-time.js");
const { moveBlocks } = require("../utils/move-blocks.js");

const SECONDS_IN_A_DAY = 86400;
const SECONDS_IN_A_YEAR = 31449600;

describe("Staking Unit Tests", function () {
  let user, user1, token, fridayStake, stakeAddress, stakeAmount, tokenAddress;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    user = accounts[0];
    user1 = accounts[1];

    token = await hre.ethers.deployContract("FridayToken");
    await token.waitForDeployment();
    tokenAddress = await token.getAddress();

    const stake = await hre.ethers.getContractFactory("FridayStake");
    fridayStake = await stake.deploy(tokenAddress, tokenAddress);
    await fridayStake.waitForDeployment();
    stakeAddress = await fridayStake.getAddress();

    stakeAmount = ethers.parseEther("1000");
    const transferAmount = ethers.parseEther("1000");
    await token.transfer(user1.address, transferAmount);
  });

  describe("constructor", () => {
    it("sets the rewards token address correctly for rewards token", async () => {
      response = await fridayStake.s_rewardsToken();
      assert.equal(response, tokenAddress);
    });

    it("sets the rewards token address correctly for staking token", async () => {
      const response = await fridayStake.s_stakingToken();
      assert.equal(response, tokenAddress);
    });
  });

  describe("stakeTokens function", () => {
    it("Moves tokens from user[1] to the staking contract", async () => {
      await token.connect(user1).approve(stakeAddress, stakeAmount);
      await fridayStake.connect(user1).stakeTokens(stakeAmount);
      await moveBlocks(1);
      const staked = await fridayStake.s_balances(user1.address);
      const expectedStake = ethers.parseEther("1000");
      console.log("Expected Stake:", ethers.formatEther(expectedStake));
      console.log("Actual Staked:", ethers.formatEther(staked));
      assert.equal(expectedStake.toString(), staked.toString());
    });
  });

  describe("token balance of an account", () => {
    it("gives number tokens user[1] has", async () => {
      const balance = await token.balanceOf(user1.address);
      const expectedBalance = ethers.parseEther("1000");
      assert.equal(expectedBalance, balance.toString());
    });
    it("gives number tokens user[0] has", async () => {
      const balance = await token.balanceOf(user.address);
      const expectedBalance = ethers.parseEther("999000");
      assert.equal(expectedBalance, balance.toString());
    });
  });

  describe("withdrawTokens function", () => {
    it("Moves tokens from staking contract to user[1]", async () => {
      await token.connect(user1).approve(stakeAddress, stakeAmount);
      await fridayStake.connect(user1).stakeTokens(stakeAmount);
      await moveBlocks(1);
      const withdrawAmount = ethers.parseEther("400");
      await fridayStake.connect(user1).withdrawTokens(withdrawAmount);
      const balance = await token.balanceOf(user1.address);
      const expectedBalance = ethers.parseEther("400");
      console.log("Expected Stake:", ethers.formatEther(expectedBalance));
      console.log("Actual Staked:", ethers.formatEther(balance));
      assert.equal(expectedBalance, balance.toString());
    });
  });

  describe("rewardPerToken function", () => {
    it("expected rewards after 1 day if 1000 tokens are staked", async () => {
      await token.approve(stakeAddress, stakeAmount);
      await fridayStake.stakeTokens(stakeAmount);
      await moveTime(SECONDS_IN_A_DAY);
      await moveBlocks(1);
      const reward = await fridayStake.rewardPerToken();
      const expectedReward = "8640"; // something like ((86400 seconds *1 day*) x (reward rate *100*)) % total staked
      console.log("Expected reward:", expectedReward);
      console.log("Actual reward:", reward.toString());
      assert.equal(expectedReward, reward.toString());
    });
  });

  describe("claimReward", () => {
    it("Users can claim their rewards", async () => {
      const balanceBefore = await token.balanceOf(user.address);
      console.log("Balance before:", ethers.formatEther(balanceBefore));

      await token.approve(stakeAddress, stakeAmount);
      await fridayStake.stakeTokens(stakeAmount);

      await moveTime(SECONDS_IN_A_DAY);
      await moveBlocks(1);

      const earned = await fridayStake.earned(user.address);
      console.log("Earned amount:", ethers.formatEther(earned));

      await fridayStake.claimReward();

      const balanceAfter = await token.balanceOf(user.address);
      console.log("Balance after:", ethers.formatEther(balanceAfter));
      const balanceAfterPlusStake = balanceAfter + stakeAmount;
      console.log(
        "Balance after + original stake:",
        ethers.formatEther(balanceAfterPlusStake)
      );

      assert.equal(
        (balanceBefore + earned).toString(),
        balanceAfterPlusStake.toString()
      );
    });
  });

  describe("getter functions", () => {
    it("gets staked amount", async () => {
      await token.approve(stakeAddress, stakeAmount);
      await fridayStake.stakeTokens(stakeAmount);
      const actualStake = await fridayStake.getStaked(user.address);
      const expectedStake = stakeAmount;
      console.log("Stake amount:", ethers.formatEther(actualStake));
      console.log("Expected stake:", ethers.formatEther(expectedStake));
      assert.equal(expectedStake, actualStake.toString());
    });
  });
});
