
var fs = require("fs")
var Web3 = require('web3')
var web3 = new Web3()

var dir = "./compiled/"

var code = "0x" + fs.readFileSync(dir + "Coindrop.bin")
var abi = JSON.parse(fs.readFileSync(dir + "Coindrop.abi"))

var config = JSON.parse(fs.readFileSync("/home/sami/webasm-solidity/node/config.json"))

var host = config.host

var send_opt = {gas:4700000, from:config.base}

web3.setProvider(new web3.providers.WebsocketProvider('ws://' + host + ':8546'))

var filesystem = new web3.eth.Contract(JSON.parse(fs.readFileSync("/home/sami/webasm-solidity/contracts/compiled/Filesystem.abi")), config.fs)

function arrange(arr) {
    var res = []
    var acc = ""
    arr.forEach(function (b) { acc += b; if (acc.length == 64) { res.push("0x"+acc); acc = "" } })
    if (acc != "") res.push("0x"+acc)
    console.log(res)
    return res
}

async function createFile(fname, buf) {
    var nonce = await web3.eth.getTransactionCount(config.base)
    var arr = []
    for (var i = 0; i < buf.length; i++) {
        if (buf[i] > 15) arr.push(buf[i].toString(16))
        else arr.push("0" + buf[i].toString(16))
    }
    console.log("Nonce", nonce, {arr:arrange(arr)})
    var tx = await filesystem.methods.createFileWithContents(fname, nonce, arrange(arr), buf.length).send(send_opt)
    var id = await filesystem.methods.calcId(nonce).call(send_opt)
    return id
}

async function doDeploy() {
    var file_id = await createFile("state.data", [1,2,3,4])
    var send_opt = {gas:4700000, from:config.base}
//    console.log(send_opt, file_id)
    var init_hash = "0x91c3688807987860d04dec4856fa4a8b3d4df484b82c211e80cb5b830cc6e3b6"
    var code_address = "QmT1tb6fRieTsryzfVFB6CBgzmpHBbcaRdW6eHfxS6embm"
    var contract = await new web3.eth.Contract(abi).deploy({data: code, arguments:[config.tasks, config.fs, code_address, init_hash, file_id]}).send(send_opt)
    config.coindrop = contract.options.address
    console.log(JSON.stringify(config))
    await contract.methods.addCoin(123, 234).send(send_opt)
    var lst = await contract.methods.checkInput().call(send_opt)
    console.log("Input", lst)
    var dta = await contract.methods.debugBlock().call(send_opt)
    console.log(dta)
    var dta2 = await contract.methods.debugFiles().call(send_opt)
    console.log(dta2)
    console.log("Hash", await contract.methods.debugHash().call(send_opt))
    await contract.methods.submitBlock().send(send_opt)
    process.exit(0)
}

doDeploy()

