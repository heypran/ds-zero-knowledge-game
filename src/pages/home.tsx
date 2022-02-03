import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Input } from "@mui/material";

import {
  initStorage,
  storeNewId,
  retrieveNewId,
  hasNewId,
} from "@/utils/erezk/storage";
import useAuth, { connectorLocalStorageKey } from "@/hooks/useAuth";
import useEagerConnect from "@/hooks/useEagerConnect";

import config from "../../exported_config.json";

import { ConnectorNames } from "@/utils/web3react";
import {
  useSemaphoreClientContract,
  useSemaphoreContract,
} from "@/hooks/useContract";

import { useWeb3React } from "@web3-react/core";

import * as ethers from "ethers";

//import WalletWidget from "./components/walletWidget";
//import Web3Provider from "web3-react";

// import {
//   Identity,
//   genIdentity,
//   genIdentityCommitment,
//   genCircuit,
//   genWitness,

//   genProof,
//   genPublicSignals,
//   genBroadcastSignalParams,
//   SnarkBigInt,
//   stringifyBigInts,
// } from "libsemaphore";

import { generateBroadcastParams } from "@/utils/erezk/zk";

// import {
//   Semaphore,
//   generateMerkleProof,
//   genExternalNullifier,
//   genSignalHash,
// } from "@libsem/protocols";

import { stringifyBigInts } from "snarkjs";

import { ZkIdentity } from "@libsem/identity";
import {
  Semaphore,
  generateMerkleProof,
  genExternalNullifier,
  genSignalHash,
} from "@/test";

const keccak256 = (plaintext: string) => {
  return ethers.utils.solidityKeccak256(["string"], [plaintext]);
};

const fetchWithoutCache = (url: string) => {
  return fetch(url, { cache: "no-store" });
};
const ZERO_VALUE = BigInt(
  ethers.utils.solidityKeccak256(
    ["bytes"],
    [ethers.utils.toUtf8Bytes("Semaphore")]
  )
);

const Home = () => {
  initStorage();
  const { login, logout } = useAuth();
  const { account, active } = useWeb3React();
  console.log("account status:", account, " : ", active);
  const [proofStatus, setProofStatus] = useState("");
  const [hasCheckedRegistration, setHasCheckedRegistration] = useState(false);
  const [selectedExternalNullifierIndex, setSelectedExternalNullifierIndex] =
    useState(0);
  const [newExternalNullifier, setNewExternalNullifier] = useState("");
  const [hasRegistered, setHasRegistered] = useState(false);
  const [externalNullifiers, setExternalNullifiers] = useState<any[]>([]);
  const [signalHistory, setSignalHistory] = useState<any[]>([]);

  // const context = useWeb3Context();

  const scContact = useSemaphoreClientContract();
  const semContract = useSemaphoreContract();
  let identity: typeof ZkIdentity;
  let serialisedIdentity: string;
  identity = new ZkIdentity();
  // storeNewId(identity.getIdentity());
  if (hasNewId()) {
    identity = ZkIdentity.genFromSerialized(retrieveNewId());
  } else {
    identity = new ZkIdentity();
    storeNewId(identity.serializeIdentity());
    serialisedIdentity = identity.serializeIdentity();
  }
  console.log("identity", identity);
  //serialisedIdentity = identity.serializeIdentity();

  let identityCommitment = identity.genIdentityCommitment();
  //console.log("typeof IC ", typeof identityCommitment);
  const getExternalNullifiers = async (semaphoreContract: any) => {
    const firstEn = await semaphoreContract.methods.firstExternalNullifier
      .call()
      .call();
    const lastEn = await semaphoreContract.methods.lastExternalNullifier
      .call()
      .call();

    const ens: BigInt[] = [firstEn];
    let currentEn = firstEn;

    while (currentEn.toString() !== lastEn.toString()) {
      currentEn = await semaphoreContract.methods
        .getNextExternalNullifier(currentEn)
        .call();
      ens.push(currentEn);
    }

    return ens;
  };

  const getContractData = async () => {
    // const semaphoreContract = await getSemaphoreContract(context);
    // const semaphoreClientContract = await getSemaphoreClientContract(context);

    if (!hasCheckedRegistration) {
      const leaves = await scContact.methods.getIdentityCommitments().call();
      if (
        leaves.map((x) => x.toString()).indexOf(identityCommitment.toString()) >
        -1
      ) {
        setHasRegistered(true);
        setHasCheckedRegistration(true);
      }
    }

    if (externalNullifiers.length === 0) {
      console.log("here.....");
      const ens = await getExternalNullifiers(semContract);
      setExternalNullifiers(ens);
    }

    let signals: any[] = [];
    const nextSignalIndex = await scContact.methods.getNextSignalIndex().call();

    for (let i = 0; i < nextSignalIndex; i++) {
      const signal = await scContact.methods.getSignalByIndex(i).call();
      const en = await scContact.methods
        .getExternalNullifierBySignalIndex(i)
        .call();

      signals.push({ signal, en });
    }
    setSignalHistory(signals);
  };

  const handleRegisterBtnClick = async () => {
    //const identityCommitment = identity.genIdentityCommitment();
    console.log(`identityCommitment`, identityCommitment);
    console.log("id -->", identityCommitment);
    const tx = await scContact.methods
      .insertIdentityAsClient(identityCommitment)
      .send({ from: account });

    console.log(tx);

    if (tx.transactionHash) {
      setHasRegistered(true);
      setHasCheckedRegistration(true);
    }
  };

  // const handleBroadcastBtnClick = async () => {
  //   const en = externalNullifiers[selectedExternalNullifierIndex];

  //   // @ts-ignore
  //   const signal = document.getElementById("signal").value;
  //   console.log(
  //     'Broadcasting "' + signal + '" to external nullifier',
  //     en.toString(16)
  //   );
  //   const signalAsHex = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signal));
  //   //const semaphoreClientContract = await getSemaphoreClientContract(context);

  //   setProofStatus("Downloading leaves");
  //   const leaves = await scContact.methods.getIdentityCommitments();
  //   console.log("Leaves:", leaves);
  //   setProofStatus("Downloading circuit");
  //   const circuitUrl = config.snarkUrls.circuit;
  //   console.log("Downloading circuit from", circuitUrl);

  //   const cirDef = await (await fetchWithoutCache(circuitUrl)).json();
  //   const circuit = genCircuit(cirDef);

  //   const provingKeyUrl = config.snarkUrls.provingKey;
  //   setProofStatus("Downloading proving key");
  //   console.log("Downloading proving key from", provingKeyUrl);
  //   const provingKey = new Uint8Array(
  //     await (await fetch(provingKeyUrl)).arrayBuffer()
  //   );

  //   setProofStatus("Generating witness");

  //   const result = await genWitness(
  //     signal,

  //     identity,
  //     leaves,
  //     config.chain.semaphoreTreeDepth,
  //     BigInt(en.toString()),
  //     circuit
  //   );

  //   const witness = result.witness;

  //   setProofStatus("Generating proof");
  //   console.log("Generating proof");
  //   //@ts-ignore
  //   const proof = await genProof(witness, provingKey);

  //   setProofStatus("Broadcasting signal");

  //   const publicSignals = genPublicSignals(witness, circuit);
  //   const params = genBroadcastSignalParams(result, proof, publicSignals);
  //   const tx = await scContact.methods
  //     .broadcastSignal(
  //       ethers.utils.toUtf8Bytes(signal),
  //       params.proof,
  //       params.root,
  //       params.nullifiersHash,
  //       en.toString()
  //     )
  //     .send({ from: account });

  //   const receipt = await tx.wait();

  //   console.log(receipt);
  //   if (receipt.status === 1) {
  //     // @ts-ignore
  //     document.getElementById("signal").value = "";
  //     setProofStatus("");
  //   } else {
  //     setProofStatus(
  //       "Transaction failed. Try signalling to a different external nullifier or use a fresh identity."
  //     );
  //   }
  // };

  const handleBroadcastBtnClick3 = async () => {
    const defaultExternalNullifier =
      externalNullifiers[selectedExternalNullifierIndex];

    // @ts-ignore
    const signal = document.getElementById("signal").value;
    console.log(
      'Broadcasting "' + signal + '" to external nullifier',
      defaultExternalNullifier.toString(16)
    );

    //const semaphoreClientContract = await getSemaphoreClientContract(context);

    const identityCommitment = identity.genIdentityCommitment();

    const nullifierHash = Semaphore.genNullifierHash(
      defaultExternalNullifier,
      identity.getNullifier()
    );

    setProofStatus("Downloading leaves");
    const leaves = await scContact.methods.getIdentityCommitments().call();
    //console.log("Leaves:", leaves);
    //setProofStatus("Generating witness");
    //const circuitUrl = config.snarkUrls.circuit;
    //console.log("Downloading circuit from", circuitUrl);

    //const cirDef = await (await fetchWithoutCache(circuitUrl)).json();
    //const circuit = genCircuit(cirDef);

    //const provingKeyUrl = config.snarkUrls.provingKey;
    //setProofStatus("Downloading proving key");
    // console.log("Downloading proving key from", provingKeyUrl);
    // const provingKey = new Uint8Array(
    //   await (await fetch(provingKeyUrl)).arrayBuffer()
    // );

    setProofStatus("Generating witness");

    console.log("signal-->", signal);
    console.log("identityCommitment-->", identityCommitment);
    console.log("leaves-->", leaves);
    console.log("semaphoreTreeDepth-->", config.chain.semaphoreTreeDepth);
    console.log("BigInt(en.toString())-->", defaultExternalNullifier);
    console.log(
      "BigInt(defaultExternalNullifier)-->",
      BigInt(defaultExternalNullifier)
    );
    const merkleProof = generateMerkleProof(
      20,
      ZERO_VALUE,
      5,
      leaves,
      identityCommitment.toString()
    );
    console.log("merkleProof", merkleProof);

    const witnessParams = Semaphore.genWitness(
      identity.getIdentity(),
      merkleProof,
      defaultExternalNullifier,
      signal
    );

    console.log("witnessParams", witnessParams);

    const fullProof = await generateBroadcastParams({
      ...witnessParams,
    });

    console.log("fullProof", fullProof);
    //console.log("broadcastSignlParam", broadcastSignlParam);
    const [a, b, c, input] = fullProof;

    // const verify = await semContract.methods
    //   .verifyThisProof(a, b, c, input)
    //   .send({ from: account });
    // console.log("verification", verify);

    // Skipping packing unpacking stuff
    // const solidityProof = Semaphore.packToSolidityProof(fullProof);
    // let packedProof;
    // try {
    //   packedProof = await semContract.methods
    //     .packProof(solidityProof.a, solidityProof.b, solidityProof.c)
    //     .call({ from: account });
    //   console.log("packedProof", packedProof);
    // } catch (e) {
    //   console.log(`packProof, E:${e}`);
    // }
    setProofStatus("PreBroadcastCheck");
    const signalAsHex = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signal));
    try {
      const preBroadcastCheck = await semContract.methods
        .preBroadcastCheck(
          signalAsHex,
          merkleProof.root,
          nullifierHash,
          genSignalHash(signal),
          defaultExternalNullifier
        )
        .send({ from: account });
      console.log("preBroadcastCheck", preBroadcastCheck);
      if (!preBroadcastCheck.transactionHash) {
        // show error
        return;
      }
    } catch (e) {
      console.log(`preBroadcastCheck, E:${e}`);
    }

    setProofStatus("Broadcasting signal");
    try {
      const broadcastSignal = await scContact.methods
        .broadcastSignal(
          signalAsHex,
          nullifierHash,
          defaultExternalNullifier,
          a,
          b,
          c,
          input
        )
        .send({ from: account });
      console.log(`broadcastSignal`, broadcastSignal);
      if (!broadcastSignal.transactionHash) {
        // show error
        return;
      }
    } catch (e) {
      console.log(`broadcastSignal, E:${e}`);
    }

    setProofStatus("Verifying....");
    // const nullifierHash = Semaphore.genNullifierHash(
    //   defaultExternalNullifier,
    //   identity.getNullifier(),
    //   20
    // );

    // const broadcastSignlParam = await generateBroadcastParams({
    //   signal_hash: result.signalHash,
    //   external_nullifier: BigInt(en.toString()),
    //   identity_nullifier: identity.identityNullifier,
    //   identity_trapdoor: identity.identityTrapdoor,
    //   identity_path_index: result.identityPathIndex,
    //   path_elements: result.identityPathElements,
    // });
    // //const witness = result.witness;
    // console.log("broadcastSignlParam", broadcastSignlParam);

    // setProofStatus("Generating proof");
    // console.log("Generating proof");
    // //@ts-ignore
    // const proof = await genProof(witness, provingKey);

    // setProofStatus("Broadcasting signal");

    // const publicSignals = genPublicSignals(witness, circuit);
    // const params = genBroadcastSignalParams(result, proof, publicSignals);
    // const tx = await semaphoreClientContract.broadcastSignal(
    //   ethers.utils.toUtf8Bytes(signal),
    //   params.proof,
    //   params.root,
    //   params.nullifiersHash,
    //   en.toString(),
    //   { gasLimit: 1000000 }
    // );

    // const receipt = await tx.wait();

    // console.log(receipt);
    // if (receipt.status === 1) {
    //   // @ts-ignore
    //   document.getElementById("signal").value = "";
    //   setProofStatus("");
    // } else {
    //   setProofStatus(
    //     "Transaction failed. Try signalling to a different external nullifier or use a fresh identity."
    //   );
    // }
  };
  // const handleWitness = (idCommitments) => {
  //   console.log("idCommitmentsAsBigInts....");
  //   // convert idCommitments
  //   const idCommitmentsAsBigInts: SnarkBigInt[] = [];
  //   for (let idc of idCommitments) {
  //     idCommitmentsAsBigInts.push(snark.bigInt(idc.toString()));
  //   }
  //   console.log("genIdentityCommitment....");
  //   const identityCommitment = genIdentityCommitment(identity);
  //   const index = idCommitmentsAsBigInts.indexOf(identityCommitment);
  //   const tree = await genTree(treeDepth, idCommitments);

  //   const identityPath = await tree.path(index);
  //   console.log("genPathElementsAndIndex....");
  //   const { identityPathElements, identityPathIndex } =
  //     await genPathElementsAndIndex(tree, identityCommitment);

  //   const signalHash = keccak256HexToBigInt(transformSignalToHex(signal));
  //   console.log("genSignedMsg....");
  //   const { signature, msg } = genSignedMsg(
  //     identity.keypair.privKey,
  //     externalNullifier,
  //     signalHash
  //   );
  //   console.log("herel....");
  // };

  const handleExternalNullifierSelect = (i: number) => {
    setSelectedExternalNullifierIndex(i);
  };

  const renderExternalNullifiers = () => {
    const en = externalNullifiers[selectedExternalNullifierIndex];
    return (
      <Box display="flex" flexDirection="column">
        {externalNullifiers.map((x: any, i: number) => {
          return (
            <p key={i}>
              <label className="radio">
                <input
                  type="radio"
                  name="externalNullifier"
                  checked={selectedExternalNullifierIndex === i}
                  onChange={() => handleExternalNullifierSelect(i)}
                />
                {x.toString(16)}
              </label>
            </p>
          );
        })}
      </Box>
    );
  };

  const handleReplaceBtnClick = async () => {
    //identity = genIdentity();
    const identity = new ZkIdentity();
    const identityCommitment = identity.genIdentityCommitment();
    storeNewId(identity.getIdentity());
    serialisedIdentity = JSON.stringify(identity);
    //identityCommitment = genIdentityCommitment(identity);
    setHasRegistered(false);
  };

  const handleAddExternalNullifierClick = async () => {
    // @ts-ignore
    const externalNullifier = document.getElementById(
      "newExternalNullifier"
      //@ts-ignore
    ).value;
    if (externalNullifier.length > 0) {
      //const semaphoreClientContract = await getSemaphoreClientContract(scContact,);

      const hash = genExternalNullifier(externalNullifier);
      console.log(`account`, account);
      console.log(`semContract`, semContract);
      const tx = await semContract.methods
        .addExternalNullifier(hash)
        .send({ from: account, gas: 300000 });
      //const receipt = await tx.wait();

      console.log(tx);

      if (tx.transactionHash) {
        //const semaphoreContract = await getSemaphoreContract(context);
        const ens = await getExternalNullifiers(semContract);
        console.log(`ens------>`, ens);
        setExternalNullifiers(ens);
        // @ts-ignore
        document.getElementById("newExternalNullifier").value = "";
      }
    }
  };

  const renderSignalHistory = () => {
    return (
      <table className="table">
        <thead>
          <tr>
            <td>External nullifier</td>
            <td>Signal</td>
          </tr>
        </thead>
        <tbody>
          {signalHistory.map((x, i) => {
            return (
              <tr key={i}>
                <td>{x.en.toString()}</td>
                <td>{x.signal.toString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  useEffect(() => {
    if (active) {
      getContractData();
    }
  }, [active]);

  let selectedEnToDisplay;

  if (externalNullifiers.length > 0) {
    selectedEnToDisplay = externalNullifiers[selectedExternalNullifierIndex]
      .toString(16)
      .slice(0, 8);
  }

  return (
    <div className="section">
      <div className="container" style={{ textAlign: "right" }}>
        {/* <WalletWidget /> */}
      </div>

      <hr />

      <div className="columns">
        <div className="column is-12-mobile is-8-desktop is-offset-2-desktop">
          <Typography>
            Using zero-knowledge proofs, Semaphore allows you to broadcast an
            arbitary string without revealing your identity, but only the fact
            that you are part of the set of registered identities. You may only
            broadcast once per external nullifier. To broadcast more than once,
            you must either select (or add) a new external nullifier, or
            register a new identity. In real-world use, a Semaphore client
            should use a relayer to pay the gas on behalf of the signaller to
            further preserve their anonymity.
          </Typography>
        </div>
      </div>
      <div>
        <Button onClick={() => login(ConnectorNames.Metamask)}>Login</Button>
        <Button className="button is-success" onClick={logout}>
          Logout
        </Button>
      </div>
      <div className="columns">
        <div className="column is-12-mobile is-8-desktop is-offset-2-desktop">
          <h2 className="subtitle">Register your identity</h2>

          <p>
            <label>Your identity (saved in localStorage):</label>
          </p>

          <br />

          <textarea
            className="identityTextarea"
            value={serialisedIdentity}
            readOnly={true}
          />

          <br />
          {hasCheckedRegistration && hasRegistered ? (
            <p>You have registered your identity.</p>
          ) : (
            <Button
              className="button is-success"
              onClick={handleRegisterBtnClick}
            >
              Register
            </Button>
          )}
          <br />

          {hasCheckedRegistration && hasRegistered && (
            <Button
              className="button is-warning"
              onClick={handleReplaceBtnClick}
            >
              Replace identity
            </Button>
          )}
        </div>
      </div>

      <hr />

      <div className="columns">
        <div className="column is-12-mobile is-8-desktop is-offset-2-desktop">
          <h2 className="subtitle">Select an external nullifier</h2>

          {externalNullifiers.length > 0 && renderExternalNullifiers()}

          <br />

          <p>
            Add a new external nullifier (the last 29 bytes of the Keccak256
            hash of what you type will be used):
          </p>

          <br />

          <input
            id="newExternalNullifier"
            type="text"
            className="input"
            placeholder="Plaintext"
          />

          <br />
          <br />

          <Button
            className="button is-primary"
            onClick={handleAddExternalNullifierClick}
          >
            Hash plaintext and add external nullifier
          </Button>
        </div>
      </div>

      {!hasRegistered && (
        <div className="columns">
          <div className="column is-12-mobile is-8-desktop is-offset-2-desktop">
            <p>You must first register to broadcast a signal.</p>
          </div>
        </div>
      )}

      <hr />

      {hasRegistered && (
        <div className="columns">
          <div className="column is-12-mobile is-8-desktop is-offset-2-desktop">
            <h2 className="subtitle">Broadcast a signal</h2>

            {externalNullifiers.length > 0 && (
              <div>
                <p>
                  Broadcasting to external nullifier {selectedEnToDisplay}….
                  This can only happen once per registered identity.
                </p>
                <br />
              </div>
            )}

            {proofStatus.length > 0 && (
              <div>
                <pre>{proofStatus}</pre>
                <br />
                <br />
              </div>
            )}

            <input
              id="signal"
              type="text"
              className="input"
              placeholder="Signal"
            />

            <br />
            <br />

            <Button
              className="button is-success"
              onClick={handleBroadcastBtnClick3}
            >
              Broadcast
            </Button>
          </div>
        </div>
      )}

      <div className="columns">
        <div className="column is-12-mobile is-8-desktop is-offset-2-desktop">
          <h2 className="subtitle">Signal history</h2>
          {renderSignalHistory()}
        </div>
      </div>
    </div>
  );
};

export default Home;
