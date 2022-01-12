import snarkjs, { Circuit, CircuitDef, Witness } from "snarkjs";
import bigInt from "big-integer";
import { WebsnarkProof } from "@/types/global.types";

import mimcHash, { modPBigInt, modPBigIntNative } from "./../mimc";
import circuitJson from "../../../public/zk/circuit.json";
import verificationKey from "../../../public/zk/verification_key.json";
//export const wasmFile = "lessthanten.wasm";
//export const zkey = "lessthanten_2.zkey";
//const WITNESS_FILE = "/tmp/witness";

//const wc = require("./witness_calculator.js");

// /https://github.com/iden3/snarkjs/issues/107
// export const generateWitness = async (inputs: any) => {
//   const buffer = fs.readFileSync(wasmFile);
//   const witnessCalculator = await wc(buffer);
//   const buff = await witnessCalculator.calculateWTNSBin(inputs, 0);
//   fs.writeFileSync(WITNESS_FILE, buff);
// };

// reference https://github.com/LHerskind/snarkjs-react/blob/master/src/App.tsx
// export async function makeZkProof(
//   _proofInput: any,
//   _wasm: string,
//   _zkey: string
// ): Promise<{ proof: any; publicSignals: any }> {
//   const { proof, publicSignals } = await snarkjs.groth16.fullProve(
//     _proofInput,
//     _wasm,
//     _zkey
//   );
//   return { proof, publicSignals };
// }

// export async function verifyZkProof(
//   _verificationkey: string,
//   signals: any,
//   proof: any
// ): Promise<boolean> {
//   const vkey = await fetch(_verificationkey).then(function (res) {
//     return res.json();
//   });
//   snarkjs.groth16.gen;
//   const res = await snarkjs.groth16.verify(vkey, signals, proof);
//   return res;
// }
// // function wtnsCalculate(input, wasmFileName, wtnsFileName, options) {

// export async function calculateWitness(input: any, wasmFileName: string) {
//   const witness = await snarkjs.wtnsCalculate(
//     input,
//     wasmFileName,
//     "newWitness"
//   );
// }

// https://github.com/darkforest-eth/darkforest-v0.3/blob/ca1582efc21940132bf1432f3ed85f5c09ed0a56/client/src/utils/Utils.ts
interface DataViewWithOffset {
  dataView: DataView;
  offset: number;
}

function _writeUint32(h: DataViewWithOffset, val: number): void {
  h.dataView.setUint32(h.offset, val, true);
  h.offset += 4;
}

function _writeBigInt(h: DataViewWithOffset, bi: BigInteger): void {
  for (let i = 0; i < 8; i++) {
    const v = bigInt(bi)
      .shiftRight(i * 32)
      .and(0xffffffff)
      .toJSNumber();
    _writeUint32(h, v);
  }
}

function _calculateBuffLen(witness: Witness): number {
  let size = 0;

  // beta2, delta2
  size += witness.length * 32;

  return size;
}

export const witnessObjToBuffer: (witness: Witness) => ArrayBuffer = (
  witness
) => {
  const buffLen: number = _calculateBuffLen(witness);

  const buff = new ArrayBuffer(buffLen);

  const h: DataViewWithOffset = {
    dataView: new DataView(buff),
    offset: 0,
  };

  for (let i = 0; i < witness.length; i++) {
    _writeBigInt(h, witness[i]);
  }

  return buff;
};

export type ContractCallArgs = Array<unknown>;

interface InitInfo {
  a: string;
  //y: string;
  // p: string;
  // r: string;
}
export type InitializePlayerArgs = [
  [string, string], // proofA
  [
    // proofB
    [string, string],
    [string, string]
  ],
  [string, string], // proofC
  [string, string, string] // locationId (BigInt), perlin, radius
];

class SnarkArgsHelper {
  private readonly initCircuit: Circuit;
  private readonly provingKeyInit: ArrayBuffer;
  private readonly useMockHash: boolean;

  private constructor(
    provingKeyInit: ArrayBuffer,
    initCircuit: CircuitDef,
    useMockHash: boolean
  ) {
    this.initCircuit = new snarkjs.Circuit(initCircuit);
    this.provingKeyInit = provingKeyInit;
    this.useMockHash = useMockHash;
  }

  destroy(): void {
    // don't need to do anything
  }

  static async create(fakeHash = false): Promise<SnarkArgsHelper> {
    // we don't do the usual webpack stuff
    // instead we do this based on the example from https://github.com/iden3/websnark

    // const initCircuit: CircuitDef = await fetch(
    //   "../../../public/zk/circuit.json"
    // ).then((x) => x.json());

    const provingKeyInitBin = await fetch("public/zk/proving_key_init.bin");
    const provingKeyInit = await provingKeyInitBin.arrayBuffer();

    const snarkArgsHelper = new SnarkArgsHelper(
      provingKeyInit,

      circuitJson as CircuitDef,

      fakeHash
    );

    return snarkArgsHelper;
  }

  async getInitArgs(
    a: number
    // y: number,
    // p: number,
    // r: number
  ): Promise<InitializePlayerArgs> {
    const start = Date.now();

    const input: InitInfo = {
      a: modPBigInt(a).toString(),
      //y: modPBigInt(y).toString(),
      //p: modPBigInt(p).toString(),
      //r: r.toString(),
    };
    const witness: ArrayBuffer = witnessObjToBuffer(
      this.initCircuit.calculateWitness(input)
    );

    const hash = mimcHash(a); // this.useMockHash ? fakeHash(x, y) : mimcHash(x, y);
    // @ts-ignore
    const publicSignals: BigInteger[] = [hash, bigInt(p), bigInt(r)];
    const snarkProof: WebsnarkProof = await window.genZKSnarkProof(
      witness,
      this.provingKeyInit
    );

    const ret = this.callArgsFromProofAndSignals(
      snarkProof,
      // @ts-ignore
      publicSignals.map((x) => modPBigIntNative(x))
    ) as InitializePlayerArgs;
    //const end = Date.now();

    return ret;
  }

  private callArgsFromProofAndSignals(
    snarkProof: WebsnarkProof,
    publicSignals: BigInteger[]
  ): ContractCallArgs {
    // the object returned by genZKSnarkProof needs to be massaged into a set of parameters the verifying contract
    // will accept
    return [
      snarkProof.pi_a.slice(0, 2), // pi_a
      // genZKSnarkProof reverses values in the inner arrays of pi_b
      [snarkProof.pi_b[0].reverse(), snarkProof.pi_b[1].reverse()], // pi_b
      snarkProof.pi_c.slice(0, 2), // pi_c
      publicSignals.map((signal) => signal.toString(10)), // input
    ];
  }
}

export default SnarkArgsHelper;
