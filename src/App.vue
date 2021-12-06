<template>
  <el-container v-loading="loading">
    <el-header style="background: #333; display:flex; align-items:center; justify-content: space-between; color: white">
      <div style="display:flex;align-items:center">
        <el-icon size="24">
          <burger />
        </el-icon>
        <span style="margin-left: 10px">EthSwap</span>
      </div>
      <div style="float:right;display:flex;align-items:center">
        <span style="margin-right: 10px">{{address}}</span>
        <el-icon size="24">
          <burger />
        </el-icon>
      </div>
    </el-header>
    <el-main>
      <el-card class="box-card"
        style="width: 50%; margin: 0 auto;">
        <template #header>
          <div style="display:flex; align-items:center; justify-content: space-between">
            <el-button class="button"
              :disabled="nowAction === 'BUY'"
              @click="nowAction = 'BUY'"
              type="success">Buy</el-button>
            <p>{{nowAction}}</p>
            <el-button class="button"
              @click="nowAction = 'SELL'"
              :disabled="nowAction === 'SELL'"
              type="warning">Sell</el-button>
          </div>
        </template>
        <div>
          <div style="margin-bottom:20px">
            <span style="float:left">Input</span>
            <span style="float:right">Balance: {{inputBalance}}</span>
            <el-input type="number"
              style="margin-top:10px"
              v-model="inputNum"
              @change="inputChange"
              placeholder="Please input">
              <template #append>{{inputToken}}</template>
            </el-input>
          </div>
          <div style="margin-bottom:20px">
            <span style="float:left">Output</span>
            <span style="float:right">Balance: {{outPutBalance}}</span>
            <el-input type="number"
              disabled
              v-model="outPutNum"
              style="margin-top:10px">
              <template #append>{{outPutToken}}</template>
            </el-input>
          </div>
          <span style="float:left">Exchange Rate</span>
          <span style="float:right">1 ETH = 100 Dapp</span>
          <el-button class="button"
            style="width: 100%;margin-top:20px"
            @click="swapClick"
            type="primary">Swap!</el-button>
        </div>
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
import Web3 from 'web3'
// import axios from 'axios'
import { Burger } from '@element-plus/icons'
import TokenABI from './abis/Token.json'
import EthSwapABI from './abis/EthSwap.json'
export default {
  name: 'App',
  components: {
    Burger,
  },
  data() {
    return {
      loading: false,
      address: '',
      nowAction: '',
      inputBalance: '',
      inputToken: 'ETH',
      inputNum: '',
      outPutNum: '',
      outPutBalance: '',
      outPutToken: 'ETH',
      ethBalance: '',
      tokenBalance: '',
      tokenContract: null,
      ethSwapContract: null,
    }
  },
  async mounted() {
    if (window.ethereum) {
      window.ethereum.enable().then((res) => {
        this.address = res[0]
      })
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      alert('请安装MetaMask钱包')
    }
    let workId = await window.web3.eth.net.getId()
    this.tokenContract = window.web3.eth.Contract(
      TokenABI.abi,
      TokenABI.networks[workId].address
    )
    this.ethSwapContract = window.web3.eth.Contract(
      EthSwapABI.abi,
      EthSwapABI.networks[workId].address
    )
    console.log(this.ethSwapContract)
    this.nowAction = 'BUY'
  },
  watch: {
    nowAction: function () {
      this.refresh()
    },
  },
  methods: {
    async refresh() {
      await this.getCoinsBalance()
      this.inputNum = ''
      this.outPutNum = ''
      if (this.nowAction == 'BUY') {
        this.inputToken = 'ETH'
        this.outPutToken = 'Dapp'
        this.outPutBalance = this.tokenBalance
        this.inputBalance = this.ethBalance
      }
      if (this.nowAction == 'SELL') {
        this.inputToken = 'Dapp'
        this.outPutToken = 'ETH'
        this.outPutBalance = this.ethBalance
        this.inputBalance = this.tokenBalance
      }
    },
    inputChange(inputVal) {
      this.outPutNum =
        this.nowAction === 'BUY' ? inputVal * 100 : inputVal / 100
    },
    async getCoinsBalance() {
      console.log('获取钱包余额')
      let res = await window.web3.eth.getBalance(this.address)
      this.ethBalance = Number(res) / Math.pow(10, 18)
      let res1 = await this.tokenContract.methods.balanceOf(this.address).call()
      this.tokenBalance = Number(res1) / Math.pow(10, 18)
    },
    async swapClick() {
      this.loading = true
      let num = window.web3.utils.toWei(this.inputNum)
      // let num = this.inputNum * Math.pow(10, 18)
      if (this.nowAction === 'BUY') {
        this.ethSwapContract.methods
          .buyTokens()
          .send({ value: num, from: this.address })
          .on('transactionHash', () => {
            this.$message.success('交易成功')
            this.loading = false
            this.refresh()
          })
      } else {
        this.tokenContract.methods
          .approve(this.ethSwapContract.options.address, num)
          .send({ from: this.address })
          .on('transactionHash', (hash) => {
            console.log(hash)
            // 授权成功后，再发起交易
            this.ethSwapContract.methods
              .sellTokens(num)
              .send({ from: this.address })
              .on('transactionHash', () => {
                this.$message.success('交易成功')
                this.loading = false
                this.refresh()
              })
          })
      }
    },
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
