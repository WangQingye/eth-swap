pragma solidity ^0.5.0;

import './Token.sol';

contract EthSwap {

  string public name = "EthSwap Instant Exchange";

  Token public token;
  uint public rate = 100;

  event TokensPurchased(
    address account,
    address token,
    uint amount,
    uint rate
  );
  event TokensSold(
    address account,
    address token,
    uint amount,
    uint rate
  );

  constructor(Token _token) public {
    token = _token;
  }

  function buyTokens() public payable {
    // 数量等于支付的eth乘以汇率
    uint tokenAmount = msg.value * rate;

    require(token.balanceOf(address(this)) >= tokenAmount);

    token.transfer(msg.sender, tokenAmount);

    // 触发事件
    emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
  }

  // 出售DAPP币
  function sellTokens(uint _amount) public {

    // 计算应该支付多少ETH给用户
    uint etherAmount =  _amount / rate;

    require(token.balanceOf(address(msg.sender)) >= _amount);
    require(address(this).balance >= etherAmount);

    // 将token转移回合约地址
    token.transferFrom(msg.sender, address(this), _amount);

    // 支付eth给用户
    msg.sender.transfer(etherAmount);

    // 触发事件
    emit TokensSold(msg.sender, address(token), _amount, rate);

  }
}