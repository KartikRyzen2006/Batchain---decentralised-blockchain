var express = require ('express');
const bodyParser = require('body-parser');
const BatChain = require('./blockchain');
const {v1:uuid} = require('uuid');
const nodeAddress= uuid().split('-').join('');
const port = process.argv[2];
const rp = require('request-promise');


const KryptoCoin = new BatChain();

const app = express()
app.use (bodyParser.json());
app.use(bodyParser.urlencoded ({extended: false}));


//get entire blockchain
app.get('/blockchain', function(req, res) {
  res.send(KryptoCoin);
});


//create new transaction
app.post('/transaction' , function (req,res) {
    const newTransaction = req.body.newTransaction;
    const BlockIndex=KryptoCoin.addNewTransactiontoPendingTransaction(newTransaction);
    res.json({note:`Transaction will be added in the block ${BlockIndex}.`});
});

//broadcast transaction

app.post('/transaction/broadcast', async (req, res) => {
  try {
    const newTransaction = KryptoCoin.createNewTransaction(
      req.body.amount,
      req.body.sender,
      req.body.recipient
    );
    KryptoCoin.addNewTransactiontoPendingTransaction(newTransaction);

    const requestPromises = KryptoCoin.networkNodes.map(networkNodeUrl =>
      rp({
        uri:  networkNodeUrl + '/transaction',
        method: 'POST',
        body: { newTransaction: newTransaction },
        json: true
      })
    );

    await Promise.all(requestPromises);

    res.json({ note: 'Transaction created and broadcast successfully.' }); // <-- fixed
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Broadcast failed' });
  }
});


//mine a block
app.get('/mine', async (req,res) => {
  try {
  const lastBlock= KryptoCoin.getLastBlock();
  const previousblockhash = lastBlock['hash'];
  const currentblockdata = {
  transactions: KryptoCoin.pendingtransactions,
  index: lastBlock['index']+1

};
const nonce = KryptoCoin.proofofwork(previousblockhash,currentblockdata);
const blockHash = KryptoCoin.hashBlock(nonce,previousblockhash,currentblockdata);
//KryptoCoin.createNewTransaction(7,"00",nodeAddress);
const newBlock=KryptoCoin.createNewBlock(nonce,previousblockhash,blockHash);

const requestOptions = KryptoCoin.networkNodes.map(async networkNodeUrl => {
  rp ({
    uri: networkNodeUrl + '/receive-new-block',
    method: 'POST',
    body: {newBlock : newBlock},
    json: true
  })
});

  await Promise.all(requestOptions);

  await rp({
    uri: KryptoCoin.currentNodeUrl + '/transaction/broadcast',
    method: 'POST',
    body: {
      amount: "7",
      sender: "00",
      recipient: nodeAddress
    },
    json: true
  });

  res.json({note: "New Block is mined and broadcast Successfully.",
    Block: newBlock
  });







} catch(err){
  console.error (err);
  res.status(500).json({error: 'Broadcast failed'});
}
   
});
  

app.post ('/receive-new-block', function (req,res) {
 const newBlock = req.body.newBlock;
 const lastBlock = KryptoCoin.getLastBlock();
 const CorrectHash = lastBlock.hash === newBlock.previousHash;
 const CorrectIndex = lastBlock['index'] + 1 === newBlock['index'];

 if (CorrectHash && CorrectIndex) {
  KryptoCoin.chain.push(newBlock);
  KryptoCoin.pendingtransactions = [];
  res.json ({note: ' New Block is accepted',
    newBlock:newBlock
  });
 }else {
  res.json({note: 'Block is rejected',
    newBlock: newBlock
  });
 }
});




/* it will register new node and broadcast it which means for eg 
entity6 will ask to entity1 to add me */

app.post('/register-and-broadcast-node', async (req, res) => {
  try {
    const newNodeUrl = req.body.newNodeUrl;
    if (!KryptoCoin.networkNodes.includes(newNodeUrl)) {
      KryptoCoin.networkNodes.push(newNodeUrl);
    }

    // 1. tell every existing node about the newcomer
    const regPromises = KryptoCoin.networkNodes.map(nodeUrl =>
      rp({
        uri:  nodeUrl + '/register-node',
        method: 'POST',
        body: { newNodeUrl },
        json: true          // <- lowercase j
      })
    );

    await Promise.all(regPromises);

    // 2. send the newcomer the full list
    await rp({
      uri: newNodeUrl + '/register-nodes-bulk',
      method: 'POST',
      body: {
        allNetworkNodes: [...KryptoCoin.networkNodes, KryptoCoin.currentNodeUrl]
      },
      json: true            // <- lowercase j
    });

    res.json({ note: 'New node registered with network successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/* then entity1 will ask all other entities which is part of blockchain 
that 
can i add entity 6 */

app.post('/register-node',function (req,res){
  const newNodeUrl = req.body.newNodeUrl;
  const NodeAlreadyNotPresent =KryptoCoin.networkNodes.indexOf(newNodeUrl)== -1;
  const NotCurrentNode = KryptoCoin.currentNodeUrl !== newNodeUrl;
  if(NodeAlreadyNotPresent && NotCurrentNode)KryptoCoin.networkNodes.push(newNodeUrl);
  res.json({note:'New node registered successfully with network. '});

});


/* if all entities say yes then this request will be 
given to entity 6 and then when he accepts he. will be a part
of blockchain as it is decentralised */

app.post('/register-nodes-bulk',function(req,res){
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach(networkNodeUrl => {
    const NodeAlreadyNotPresent = KryptoCoin.networkNodes.indexOf(networkNodeUrl) == -1;
    const NotCurrentNode = KryptoCoin.currentNodeUrl !== networkNodeUrl;
   if(NodeAlreadyNotPresent && NotCurrentNode) KryptoCoin.networkNodes.push(networkNodeUrl);

  });
res.json({note: "Bulk registration successful."})
});

// consensus
app.get('/consensus', function(req, res) {
	const requestPromises = [];
	KryptoCoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/blockchain',
			method: 'GET',
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(blockchains => {
		const currentChainLength = KryptoCoin.chain.length;
		let maxChainLength = currentChainLength;
		let newLongestChain = null;
		let newPendingTransactions = null;

		blockchains.forEach(blockchain => {
			if (blockchain.chain.length > maxChainLength) {
				maxChainLength = blockchain.chain.length;
				newLongestChain = blockchain.chain;
				newPendingTransactions = blockchain.pendingTransactions;
			};
		});


		if (!newLongestChain || (newLongestChain && !KryptoCoin.chainIsValid(newLongestChain))) {
			res.json({
				note: 'Current chain has not been replaced.',
				chain: KryptoCoin.chain
			});
		}
		else {
			KryptoCoin.chain = newLongestChain;
			KryptoCoin.pendingTransactions = newPendingTransactions;
			res.json({
				note: 'This chain has been replaced.',
				chain: KryptoCoin.chain
			});
		}
	});
});

app.get('/block/:blockHash', function (req,res){
  const blockHash = req.params.blockHash;
  const correctBlock = KryptoCoin.getBlock(blockHash);
  res.json({block: correctBlock});

});

app.get('/transaction/:transactionId', function(req,res){
  const transactionId = req.params.transactionId;
  const transactionData = KryptoCoin.getTransaction(transactionId);
  res.json ({transaction: transactionData.transaction,
    block: transactionData.block
   });

});

app.get('/address/:address', function(req,res){
const address = req.params.address;
const addressData = KryptoCoin.getAddressData(addressData);
res.json({addressData: addressData});
});

app.get('/block-explorer',function(req,res){
  res.sendFile('./block-explorer/index.html',{root: __dirname});
})

app.listen(port , function (req,res){
console.log(`Batchain is on ${port}`);
});

