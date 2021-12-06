const EthSwap = artifacts.require("EthSwap")
const Token = artifacts.require("Token")

require("chai").use(require('chai-as-promised')).should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether')
}

contract('EthSwap', ([deployer, investor]) => {
  let token, ethSwap
  before(async () => {
    token = await Token.new()
    ethSwap = await EthSwap.new(token.address)
    await token.transfer(ethSwap.address, tokens('1000000'))
  })

  describe('Token deployment', async () => {
    it('contract has name', async () => {
      const name = await token.name()
      assert.equal(name, 'DApp Token')
    })
  })

  describe('EthSwap deployment', async () => {

    it('contract has name', async () => {
      const name = await ethSwap.name()
      assert.equal(name, 'EthSwap Instant Exchange')
    })


    it('contract has tokens', async () => {
      let balance = await token.balanceOf(ethSwap.address)
      assert.equal(balance.toString(), tokens('1000000'))
    })
  })

  describe('buyTokens()', async () => {
    let result
    before(async () => {
      // 支付
      result = await ethSwap.buyTokens({
        from: investor,
        value: tokens('1')
      })
    })
    it('用户用eth购买Dapp token', async () => {
      // 检查账户是否有dapp币
      let investorBalance = await token.balanceOf(investor)
      assert.equal(investorBalance.toString(), tokens('100'))

      // 检查合约账户是否减少了等量的dapp币 
      let ethSwapBalance = await token.balanceOf(ethSwap.address)
      assert.equal(ethSwapBalance.toString(), tokens('999900'))
      // 检查合约账户中的ETH是否到账
      let ethSwapEthBalance = await web3.eth.getBalance(ethSwap.address)
      assert.equal(ethSwapEthBalance.toString(), tokens('1'))

      const event = result.logs[0].args
      assert.equal(event.account, investor)
      assert.equal(event.token, token.address)
      assert.equal(event.amount.toString(), tokens('100').toString())
      assert.equal(event.rate.toString(), '100')
    })
  })

  describe('sellTokens()', async () => {
    let result
    before(async () => {
      await token.approve(ethSwap.address, tokens('100'), {
        from: investor
      })
      result = await ethSwap.sellTokens(tokens('100'), {
        from: investor
      })
    })
    it('用户出售Dapp币，换回ETH', async () => {
      // 检查账户dapp币是否为0
      let investorBalance = await token.balanceOf(investor)
      assert.equal(investorBalance.toString(), tokens('0'))

      // 检查合约账户是否还原总数的dapp币 
      let ethSwapBalance = await token.balanceOf(ethSwap.address)
      assert.equal(ethSwapBalance.toString(), tokens('1000000'))
      // 检查合约账户中的ETH是否退回
      let ethSwapEthBalance = await web3.eth.getBalance(ethSwap.address)
      assert.equal(ethSwapEthBalance.toString(), tokens('0'))

      // 检测参数是否正确
      const event = result.logs[0].args
      assert.equal(event.account, investor)
      assert.equal(event.token, token.address)
      assert.equal(event.amount.toString(), tokens('100').toString())
      assert.equal(event.rate.toString(), '100')

      // 如果卖出超出自己账户的token，应该是被拒绝的
      await ethSwap.sellTokens(tokens('500'), {from: investor}).should.be.rejected;
    })
  })
})