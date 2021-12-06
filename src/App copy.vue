<template>
  <img alt="Vue logo"
    src="./assets/logo.png">
  <HelloWorld msg="Welcome to Your Vue.js App" />
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import Web3 from 'web3'
import axios from 'axios'
export default {
  name: 'App',
  components: {
    HelloWorld,
  },
  data() {
    return {
      web3: null,
      apiKey: 'VP56WHERXR3FXDWNE2EWGY2WC5H4HU61SI',
      accounts: [],
    }
  },
  async mounted() {
    if (window.ethereum) {
      window.ethereum.enable().then((res) => {
        console.log('当前钱包地址：' + res[0])
      })
    } else {
      alert('请安装MetaMask钱包')
    }
    this.web3 = new Web3(window.web3.currentProvider)
    this.accounts = await this.web3.eth.getAccounts()
    this.web3.eth.getBalance(this.accounts[0], (err, res) => {
      console.log(res)
      if (!err) {
        console.log('主代币（BNB）余额==', Number(res) / Math.pow(10, 18))
      }
    })
    // let ret = await this.web3.eth.sendTransaction({
    //   from: this.accounts[0],
    //   to: '0xB6d9149c0C7024470BB418E51B53A3cAACDf27C0',
    //   value: 0.5 * Math.pow(10, 18),
    // })
    // console.log(ret)

    // bnx
    // this.getCoinBalance('0x8c851d1a123ff703bd1f9dabe631b69902df5f97')

    this.getCoinBalance('0x1416e6EA40CBb1F09Cd2dbEdAAd6fbFE3e38D51F')
  },
  methods: {
    async getCoinBalance(contract) {
      // https://api-testnet.bscscan.com/
      // https://api.bscscan.com/api
      let res = await axios.get('https://api-testnet.bscscan.com/api', {
        params: {
          module: 'contract',
          action: 'getabi',
          address: contract,
          apikey: this.apiKey,
        },
      })
      console.log(JSON.parse(res.data.result))
      // let functionInstance = new this.web3.eth.Contract(
      //   JSON.parse(res.data.result),
      //   contract
      // )
      // // let functionInstance = ethContract.at(contract)
      // console.log(functionInstance)
      // let ret = await functionInstance.methods
      //   .balanceOf(this.accounts[0])
      //   .call()
      // console.log('（BNX）余额==', Number(ret) / Math.pow(10, 18))
      // let ret1 = await functionInstance.methods
      //   .transfer(
      //     '0xB6d9149c0C7024470BB418E51B53A3cAACDf27C0',
      //     0.5 * Math.pow(10, 18)
      //   )
      //   .call()
      // console.log(ret1)
      // functionInstance.methods.balanceOf(this.accounts[0], (err, res) => {
      //   if (!err) {
      //     //代币精度根据所发行的代币合约精度换算
      //   console.log('（BNX）余额==', Number(res) / Math.pow(10, 18))
      //   }
      // })
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
