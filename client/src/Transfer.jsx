import { useState } from "react";
import server from "./server";
import {keccak256} from "ethereum-cryptography/keccak";
import {secp256k1} from "ethereum-cryptography/secp256k1"
import {utf8ToBytes, toHex } from "ethereum-cryptography/utils"

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateKey, setPrivateKey] = useState("");


  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
            // // sign message hash
      const message =  {
        sender: address,
        amount: parseInt(sendAmount),
        recipient: recipient,
      };
      const messageHash = keccak256(utf8ToBytes(JSON.stringify(message)));
      console.log('messageHash', messageHash);
      console.log('priv', privateKey);
      const signature = secp256k1.sign(messageHash, privateKey);
      console.log('signature', signature);

      const {
        data: { balance },
      } = await server.post(`send`, {
        message,
        messageHash,
        signature
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <label>
        private key
        <input
          placeholder="Type privatekey, only used for generate signature"
          value={privateKey}
          onChange={setValue(setPrivateKey)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
