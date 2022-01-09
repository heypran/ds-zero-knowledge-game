
   
const fs = require("fs");

const spawningWasm = './spawning.wasm';

const snarkjs = require("snarkjs");
const zkey = './spawning_0001.zkey'
const witness = './gen_witness.wtns'
const generateWitnessJs = require('./witness_calculator.js');
const ff = require("ffjavascript");
const {unstringifyBigInts} = ff.utils;

const generateWitness = async (inputs) => {
    const buffer = fs.readFileSync(spawningWasm);
    const witnessCalculator = await generateWitnessJs(buffer)
    console.log(inputs)
    const buff = await witnessCalculator.calculateWTNSBin(inputs);
     fs.writeFileSync(witness, buff);
    
}


async function genZk(){
    
    const x = 44;
    const y = 1;
    
    const inputSignals = { x , y }; 
    try{

    await generateWitness(inputSignals);
    const {proof, publicSignals} = await snarkjs.groth16.prove(zkey, `./gen_witness.wtns`);
     
    console.log(`proof===>`,proof);
    console.log(`publicSignals===>`,publicSignals);
    
    const editedPublicSignals = unstringifyBigInts(publicSignals);
    const editedProof = unstringifyBigInts(proof);

    console.log(`proof===>`,editedProof);
    console.log(`publicSignals===>`,editedPublicSignals);

     const callData = await snarkjs.groth16.exportSolidityCallData(editedProof, editedPublicSignals);
     console.log(callData);
  }catch(e){
    console.log('error generating witness or proofs',JSON.stringify(e));
  }
}

genZk();

//["0x14f1f72a969ebc179401cbc1db041e0ee1119faf1643ca217fdd5ad44b06734f", "0x1bfc16b2995c01fc6db776dd8ebf2f114b7dc28249f6b81688243f6d1cd7b5c0"],[["0x13f79cc49e77dd17dd02e20246639b18743ea38e9ab4e368fa065006bbc71979", "0x28dcf816a7970fd4f49595d45d3d92aec21ef1f354f70145274393d72b10b181"],["0x05c1e52227b7e0edc4154e7eaddeada76f749ed877247b3e4cda0807dc6020a7", "0x1640428dd0b8b8a3974ce78102654c543b4abe5af33373b73031b31dec1bc4b1"]],["0x2332e14ad756616dd58b3389f33f756a968fa23e7d885e001f4dbcda3d7d120b", "0x1c826b8dbad92932e3541b8752c70aaf87b63ae495e2248e1d19890672138816"],["0x184c2b526450d4458619c6454cd4ba41603e48c4f6112f992ddc41f8acd36526"]