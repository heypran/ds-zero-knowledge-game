
   
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
// ["0x26b0d3dce69901f8e689ba53bd44293126c78bdc6802c80d38434585bf23ccf0", "0x000fccda190ce4376b2b46e85d0589bd1f17b0fb2037ed1c2eed585ec241c580"],[["0x2c8b9a596cebbc3f47e317643076ce2e61a25b37c216cd59dc32c2ddd00263c2", "0x1445164c2ea622499aabcd0c6541c3d10d65046987646c1ec63ca18d182bbcb6"],["0x05da1ef741a4ab95c3ab5823c386417cf5cf9846e10c1ef36689c4770c4166ec", "0x000c6487f09f78262e595698d956fc9074b7a7534687ef2df0b7fcfa112a1e22"]],["0x168463952b552d485c14896ea181d1eb2bb9af8c0993e3ff84ef534e0bc605ce", "0x09bd366db7a7128ae5b8f30cafcc01bbdb2e7662d3ebad6fd7ce1ff0498c16c7"],["0x210f6b63008f0983117bebf8297a0c0622543037e3c644009d26e4b153eb83d1"]