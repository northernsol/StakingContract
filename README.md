# ERC20 token contract + staking contact - Practice with solidity coding, deployment with ether.js, and testing with ethers.js

- The ERC20 contract mints TGIF token, and the staking contact is launched using the token contract address
- The staking contract enables users to stake funds, withdraw funds, and claim rewards
- The rewards are calculated using a reward rate per second with resepct to total tokens staked
- A modifier has been included to the stake, withdraw and claim rewards functions in order to update the reward calculation everytime a user modifies the state
