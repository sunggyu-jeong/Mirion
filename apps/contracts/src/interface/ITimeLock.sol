interface ITimeLock {
  event Deposited(address indexed user, uint256 amount, uint256 unlockTime);
  event Withdraw(address indexed user, uint256 amount, uint256 fee);
  event FeeUpdated(uint256 indexed oldFee, uint256 indexed newFee);

  function deposit(uint256 _unlockTime) external payable;
  function withdraw() external;
  function setFeePercentage(uint256 _newFee) external;
  function getLockInfo(address _user) external view returns (uint256 balance, uint256 unlockTime);
}