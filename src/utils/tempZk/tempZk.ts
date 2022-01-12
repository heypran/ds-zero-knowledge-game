const snarkjs = require("snarkjs");

const spawningWasm = "./spawning.wasm";

const zkey = "spawning_0001.zkey";
const generateWitnessJs = require("./witness_calculator.js");
const genMoveWitnessJs = require("./move_witness_calculator.js");
const genHashWitnessJs = require("./genhash_witness_calculator.js");

const ff = require("ffjavascript");

const { unstringifyBigInts } = ff.utils;

const location1 = { x: 41, y: 1 };

const getBinaryPromise = (wasmFile: any) =>
  new Promise((resolve, reject) => {
    fetch(wasmFile, { credentials: "same-origin" })
      .then((response) => {
        if (!response["ok"]) {
          throw "failed to load wasm binary file at '" + spawningWasm + "'";
        }
        return response["arrayBuffer"]();
      })
      .then(resolve)
      .catch(reject);
  });

export async function initializePosition(location?: { x: number; y: number }) {
  const input = location ?? location1;
  // read wasm file as buffer
  const buffer = await getBinaryPromise(spawningWasm);
  // generate witness
  const witnessCalculator = await generateWitnessJs(buffer);
  const buff = await witnessCalculator.calculateWTNSBin(input, 0);

  //const provingKey = await fetch(zkey);
  //const provingKeyBuffer = await provingKey.arrayBuffer();

  const { proof, publicSignals } = await snarkjs.groth16.prove(zkey, buff);
  //console.log("Pub: ", publicSignals);
  //console.log("Proof: ", proof);

  const editedPublicSignals = unstringifyBigInts(publicSignals);
  const editedProof = unstringifyBigInts(proof);

  //console.log(`proof===>`, editedProof);
  //console.log(`publicSignals===>`, editedPublicSignals);
  const callData = await snarkjs.groth16.exportSolidityCallData(
    editedProof,
    editedPublicSignals
  );
  //console.log(JSON.parse(`[${callData}]`));
  console.log(`callData-->`, callData);
  return JSON.parse(`[${callData}]`);
}

export async function movePlayer(location: {
  x: number;
  y: number;
  x2: number;
  y2: number;
}) {
  const moveWasm = "./move.wasm";
  const moveZkey = "move_0001.zkey";

  // read wasm file as buffer
  const buffer = await getBinaryPromise(moveWasm);
  // generate witness
  const witnessCalculator = await genMoveWitnessJs(buffer);
  const buff = await witnessCalculator.calculateWTNSBin(location, 0);

  const { proof, publicSignals } = await snarkjs.groth16.prove(moveZkey, buff);

  const editedPublicSignals = unstringifyBigInts(publicSignals);
  const editedProof = unstringifyBigInts(proof);

  //console.log(`proof===>`, editedProof);
  //console.log(`publicSignals===>`, editedPublicSignals);
  const callData = await snarkjs.groth16.exportSolidityCallData(
    editedProof,
    editedPublicSignals
  );
  //console.log(JSON.parse(`[${callData}]`));
  console.log(`callData-->`, callData);
  return JSON.parse(`[${callData}]`);
}

export async function genPlanetHash(location: { x: number; y: number }) {
  const moveWasm = "./genhash.wasm";
  const moveZkey = "genhash_0001.zkey";

  // read wasm file as buffer
  const buffer = await getBinaryPromise(moveWasm);
  // generate witness
  const witnessCalculator = await genHashWitnessJs(buffer);
  const buff = await witnessCalculator.calculateWTNSBin(location, 0);

  const { proof, publicSignals } = await snarkjs.groth16.prove(moveZkey, buff);
  //console.log("Pub: ", publicSignals);
  //console.log("Proof: ", proof);

  const editedPublicSignals = unstringifyBigInts(publicSignals);
  const editedProof = unstringifyBigInts(proof);

  //console.log(`proof===>`, editedProof);
  //console.log(`publicSignals===>`, editedPublicSignals);
  const callData = await snarkjs.groth16.exportSolidityCallData(
    editedProof,
    editedPublicSignals
  );
  //console.log(JSON.parse(`[${callData}]`));
  console.log(`callData-->`, callData);
  return JSON.parse(`[${callData}]`);
}
