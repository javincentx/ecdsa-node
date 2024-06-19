const express = require("express");
const fs = require('fs');
const app = express();
const cors = require("cors");
const {secp256k1}  = require('ethereum-cryptography/secp256k1');
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = JSON.parse(fs.readFileSync("./balances.json", 'utf-8'));

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { message, messageHash, signature } = req.body;
  // console.log('messageHash', messageHash);
  // console.log('sig', typeof signature, signature);

  // check wehther signature is signed by sender
  const sender = message.sender;
  const recoveredMessageHash = new Uint8Array(Object.values(messageHash)); // this is because messageHash turns to a list of k:v pair format
  const recoveredSignature = {'r': BigInt(signature.r), 's': BigInt(signature.s), 'recovery': signature.recovery};
  const isSigned = secp256k1.verify(recoveredSignature, recoveredMessageHash, message.sender);
  if (!isSigned) {
    res.status(400).send({message: 'Not signed by sender!'});
  }
  const recipient = message.recipient;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  amount = message.amount;
  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
