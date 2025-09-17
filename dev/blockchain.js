const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const {v1:uuid} = require('uuid');

function BatChain() {
    this.chain=[];
    this.pendingtransactions=[];
    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes=[];
    this.createNewBlock(100,'0','0');
}
BatChain.prototype.createNewBlock= function(nonce, previousHash,hash) {
    const newBlock = {
        index: this.chain.length+1,
        timestamp: Date.now(),
        transactions: this.pendingtransactions,
        nonce: nonce,
        hash: hash,
        previousHash: previousHash
    };
    this.pendingtransactions = [];
    this.chain.push(newBlock);
    return newBlock;
}
    BatChain.prototype.getLastBlock = function() {
        return this.chain[this.chain.length - 1];
    }
    BatChain.prototype.createNewTransaction = function(amount,sender,recipient) {
        const newTransaction = {
            amount: amount,
            sender: sender,
            receipient: recipient,
            transactionId: uuid().split('-').join('')
        };
       return newTransaction;
    }

    BatChain.prototype.addNewTransactiontoPendingTransaction = function(transactionobj){
        this.pendingtransactions.push(transactionobj);
        return this.getLastBlock()['index']+1;
    }

    BatChain.prototype.hashBlock = function (nonce,previousblockhash,currentblockdata) {
        const dataAsString = previousblockhash + nonce.toString() + JSON.stringify(currentblockdata);
        const hash = sha256(dataAsString);
        return hash;
    }
    BatChain.prototype.proofofwork= function (previousblockhash,currentblockdata) {
        let nonce = 0;
        let hash = this.hashBlock(nonce,previousblockhash,currentblockdata);
        while(hash.substring(0,4) != '0000') {
            nonce++;
            hash = this.hashBlock(nonce,previousblockhash,currentblockdata);
          //  console.log(hash);
        }
        return nonce;
    }

BatChain.prototype.chainIsValid = function(blockchain) {
    let validChain = true;

    for (let i = 1; i < blockchain.length; i++) {
        const currentBlock = blockchain[i];
        const prevBlock    = blockchain[i - 1];
        const blockHash    = this.hashBlock(
            currentBlock.nonce,
            prevBlock.hash,
            { transactions: currentBlock.transactions, index: currentBlock.index }
        );
        if (!blockHash.startsWith('0000')) validChain = false;
        if (currentBlock.previousHash !== prevBlock.hash) validChain = false;
    }

    const g = blockchain[0];
    if (
        g.nonce !== 100 || g.previousHash !== '0' || g.hash !== '0' || g.transactions.length !== 0
    ) validChain = false;

    return validChain;
};

BatChain.prototype.getBlock=function(blockHash) {
 let correctBlock = null;
 this.chain.forEach(block => {
    if(block.hash === blockHash) correctBlock = block;
 });
 return correctBlock;
};


BatChain.prototype.getTransaction=function(transactionId){
let correctTransaction = null;
let correctBlock = null;

this.chain.forEach(block => {
 block.transactions.forEach (transaction => {
    if(transaction.transactionId === transactionId){
        correctTransaction = transaction;
        correctBlock = block;
    }
 });
});
return {
    transaction: correctTransaction,
    block: correctBlock
};
};
BatChain.prototype.getAddressData= function(address) {
    const AllAddressTransaction = [];
  this.chain.forEach(block => {
    block.transaction.forEach(transaction => {
        if(transaction.sender === address || transaction.receipient === address) {
            return AllAddressTransaction.push(transaction);
        };
        });
    });

    let balance = 0;

    AllAddressTransaction.forEach(transaction => {
        if(transaction.receipient === address) { balance+= amount }
        else if (transaction.sender === address) {balance-= amount };
    });

    return {
        AddressTransaction: AllAddressTransaction,
        Addressbalance: balance
    };

};

module.exports = BatChain;
