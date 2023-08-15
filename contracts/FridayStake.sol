// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error NeedsMoreThanZero();
error TransferFailed();

contract FridayStake is Ownable, ReentrancyGuard {
    IERC20 public s_rewardsToken;
    IERC20 public s_stakingToken;

    // Storage Variables
    uint256 public s_rewardPerTokenStored;
    uint256 public s_lastUpdateTime;
    uint256 public s_stakingRewardRate = 100; //tokens per second per second staked % total staked
    uint256 public s_totalSupply;

    // Mappings
    mapping(address => uint256) public s_balances;
    mapping(address => uint256) public s_userRewardPerTokenPaid;
    mapping(address => uint256) public s_rewards;

    // Events
    event Staked(address indexed _staker, uint256 _amount);
    event Withdrawn(address indexed _staker, uint256 _amount);
    event RewardClaimed(address indexed _staker, uint256 _amount);

    // Constructor
    constructor(address stakingToken, address rewardsToken) {
        s_stakingToken = IERC20(stakingToken);
        s_rewardsToken = IERC20(rewardsToken);
    }

    // Functions
    function stakeTokens(
        uint256 amount
    ) external updateReward(msg.sender) nonReentrant {
        if (amount == 0) {
            revert NeedsMoreThanZero();
        }
        s_totalSupply += amount;
        s_balances[msg.sender] += amount;
        emit Staked(msg.sender, amount);
        bool success = s_stakingToken.transferFrom(
            msg.sender,
            address(this),
            amount
        );
        if (!success) {
            revert TransferFailed();
        }
    }

    function withdrawTokens(
        uint256 amount
    ) external updateReward(msg.sender) nonReentrant {
        s_totalSupply -= amount;
        s_balances[msg.sender] -= amount;
        emit Withdrawn(msg.sender, amount);
        bool success = s_stakingToken.transfer(msg.sender, amount);
        if (!success) {
            revert TransferFailed();
        }
    }

    function claimReward() external updateReward(msg.sender) nonReentrant {
        uint256 reward = s_rewards[msg.sender];
        s_rewards[msg.sender] = 0;
        emit RewardClaimed(msg.sender, reward);
        bool success = s_rewardsToken.transfer(msg.sender, reward);
        if (!success) {
            revert TransferFailed();
        }
    }

    function updateRewardRate(uint256 newRewardRate) external onlyOwner {
        s_stakingRewardRate = newRewardRate;
    }

    // Modifiers & Associated Modifier Functions

    modifier updateReward(address account) {
        s_rewardPerTokenStored = rewardPerToken();
        s_lastUpdateTime = block.timestamp;
        s_rewards[account] = earned(account);
        s_userRewardPerTokenPaid[account] = s_rewardPerTokenStored;
        _;
    }

    function rewardPerToken() public view returns (uint256) {
        if (s_totalSupply == 0) {
            return s_rewardPerTokenStored;
        }
        return
            s_rewardPerTokenStored +
            (((block.timestamp - s_lastUpdateTime) *
                s_stakingRewardRate *
                1e18) / s_totalSupply);
    }

    function earned(address account) public view returns (uint256) {
        return
            ((s_balances[account] *
                (rewardPerToken() - s_userRewardPerTokenPaid[account])) /
                1e18) + s_rewards[account];
    }

    // Other Getter Functions

    function getStaked(address account) public view returns (uint256) {
        return s_balances[account];
    }
}
