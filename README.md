*BatChain – Gotham’s Ledger*
A dark, street-level blockchain forged in the shadows of Gotham City.
What it is
BatChain is a proof-of-work blockchain written in pure Node.js. It keeps a tamper-proof ledger of “KryptoCoin” transactions, offers a Batman-themed block-explorer, and syncs across a peer-to-peer network of Bat-nodes.
Core mechanics
SHA-256 hashing, 4-leading-zero difficulty (0000)
1 KryptoCoin block reward, no pre-mine – the coin is earned, not given
Instant transaction mempool + automatic emptying when a block is mined
Chain-validation engine rejects any block that breaks consensus or hash rule
RESTful API: /block/:hash, /transaction/:id, /address/:addr, /mine, /register-node, /consensus
BatExplorer frontend
Angular 1.5 single-page app styled in black & neon-red
Oversized controls for gloved hands – 70 px inputs, 2-rem buttons
Real-time lookup: blocks, transactions, address history & KryptoCoin balance
Gotham-style alerts: “The Bat-Signal returned nothing. Try again.”
Ideal use
Perfect for teaching blockchain basics, hackathons, or as the backbone for a Gotham RPG economy. Suit up, boot a node, and let the night settle every 60 seconds.
