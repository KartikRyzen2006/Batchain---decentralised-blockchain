const sha256 = require ('sha256')

function blockchain() {
    this.chain=[];
    this.pendingtransactions=[];
    this.createNewBlock(100,'0','0');
}
blockchain.prototype.createnewblock = function(nonce,previousblockhash,hash){
    const newblock = {
        index: this.chain.length+1,
        timestamp: Date.now(),
        transactions: this.pendingtransactions,
        nonce:nonce,
        previousblockhash: previousblockhash,
        hash: hash

    };
    this.chain.push(newblock);
    this.pendingtransactions=[];
    return newblock;
}

blockchain.prototype.getlastblock = function() {
    return this.chain[this.chain.length - 1];
}

blockchain.prototype.createNewTransaction = function(amount,sender,receipient) {
    const newTransaction = {
        amount: amount,
        sender: sender,
        receipient: receipient
    };
    this.pendingtransactions.push(newTransaction);
    return this.getlastblock() [ 'index'] + 1;

}

blockchain.prototype.hashblock = function (nonce, previousblockhash, currentBlockData) {
    const dataAsString = previousblockhash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);
}

blockchain.prototype.proofofwork = function (previousblockhash,currentBlockData) {
    let nonce = 0;
    let hash = this.hashblock(nonce,previousblockhash,currentBlockData);
    while (hash.substring(0,4) != '0000') {
        nonce ++;
    }
    return nonce;
}

module.exports=blockchain;


// app.post('/register-and-broadcast-node', async(req,res) {
//     const newNodeUrl = req.body.newNodeUrl;
// try {
//   if(!KryptoCoin.networkNode.includes(newNodeUrl)){
//     KryptoCoin.networkNode.push(newNodeUrl);
//   }
//   const RegPromises = KryptoCoin.networkNode.map(nodeUrl =>
//     rp ({
//         uri: nodeUrl + '/register-node',
//         method:'POST',
//         body: {newNodeUrl},
//         json: true
//     })
// )

//   await Promise.all(RegPromises);

//   await rp ({
//     uri: newNodeUrl + '/register-node-bulk',
//     method:'POST',
//     body: {allNetworkNode: [...KryptoCoin.networkNode,KryptoCoin.currentNodeUrl]},
//     json:true

//   });
//   res.json({note: 'Nodes connected with network successfully.'});


// }catch(err)
// {
//     console.error(err)
// }

// });