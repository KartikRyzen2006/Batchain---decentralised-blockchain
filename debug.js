// debug.js  –  minimal version, runs standalone
const sha256 = require('sha256');

function BatChain() {
    this.chain = [];          // nothing else is used by chainIsValid
}
BatChain.prototype.hashBlock = function (nonce, prevHash, data) {
    return sha256(prevHash + nonce.toString() + JSON.stringify(data));
};

BatChain.prototype.chainIsValid = function (chain) {
    let ok = true;

    /* ---- genesis checks ---- */
    const g = chain[0];
    console.log('genesis nonce 100 ?', g.nonce === 100);
    console.log('genesis previousHash "0" ?', g.previousHash === '0');
    console.log('genesis hash "0" ?', g.hash === '0');
    console.log('genesis transactions [] ?', g.transactions.length === 0);

    if (!(g.nonce === 100 && g.previousHash === '0' && g.hash === '0' && g.transactions.length === 0))
        ok = false;

    /* ---- rest of chain ---- */
    for (let i = 1; i < chain.length; i++) {
        const cur = chain[i], prev = chain[i - 1];
        const recomputed = this.hashBlock(cur.nonce, prev.hash, { transactions: cur.transactions, index: cur.index });
        console.log(`block ${i} hash starts 0000 ?`, recomputed.startsWith('0000'));
        console.log(`block ${i} previousHash === prev.hash ?`, cur.previousHash === prev.hash);
        if (!recomputed.startsWith('0000') || cur.previousHash !== prev.hash) ok = false;
    }
    return ok;
};

/* ---------- paste your 4-block chain here ---------- */
const bc1 = {
    chain: [
        {
            "index": 1,
            "timestamp": 1757924315423,
            "transactions": [],
            "nonce": 100,
            "hash": "0",
            "previousHash": "0"
        },
        {
            "index": 2,
            "timestamp": 1757924331059,
            "transactions": [],
            "nonce": 18140,
            "hash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
            "previousHash": "0"
        },
        {
            "index": 3,
            "timestamp": 1757924336716,
            "transactions": [
                {
                    "amount": "7",
                    "sender": "00",
                    "receipient": "93111b00920c11f0809ae3bdd845aacf",
                    "transactionId": "9c76f570920c11f0809ae3bdd845aacf"
                }
            ],
            "nonce": 8724,
            "hash": "0000dfb6dda56e09214a1e0f8587c683a68995f7c3625ba59037264042250238",
            "previousHash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100"
        },
        {
            "index": 4,
            "timestamp": 1757924341235,
            "transactions": [
                {
                    "amount": "7",
                    "sender": "00",
                    "receipient": "93111b00920c11f0809ae3bdd845aacf",
                    "transactionId": "9fd3b500920c11f0809ae3bdd845aacf"
                }
            ],
            "nonce": 36276,
            "hash": "0000a9a7e4e567126c7327dba5ba7e7e9d3f8f1f1299ef765543b2e62ff28100",
            "previousHash": "0000dfb6dda56e09214a1e0f8587c683a68995f7c3625ba59037264042250238"
        }
    ]
};

console.log('VALID:', new BatChain().chainIsValid(bc1.chain));