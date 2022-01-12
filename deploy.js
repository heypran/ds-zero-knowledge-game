const verifierContract = require("./build/contracts/Verifier.json");
const darkSpace = require("./build/contracts/DarkSpaceCore.json");
const Web3 = require("web3");

const HDWalletProvider = require("@truffle/hdwallet-provider");

const bytecode = verifierContract.bytecode.trim();
const abi = verifierContract.abi;
const darkSapceCoreAbi = darkSpace.abi;

const provider = new HDWalletProvider(
  "0x39302f6c4d880f474e6314b9a967b7930821add58a983347225a302b029ca334",
  "https://api.s0.b.hmny.io"
);

const web3 = new Web3(provider);

const deploy = async () => {
  console.log("Deploying....");

  const accounts = await web3.eth.getAccounts();
  const result = await new web3.eth.Contract(abi)
    .deploy({ data: bytecode })
    .send({ gas: "3000000", from: accounts[0] });

  console.log("Contract deployed to", result.options.address);

  const darkSapceResult = await new web3.eth.Contract(darkSapceCoreAbi)
    .deploy({ data: bytecode ,arguments:[result.options.address]})
    .send({ gas: "3000000", from: accounts[0] });

  console.log("Contract deployed to", darkSapceResult.options.address);
  process.exit();
};

deploy();

// fury resource sphere update payment tired zebra only grape coyote cloud gospel cabin claw afford ring interest reject cry sock thrive indoor grace fever
// verifier - 0x66dfBd752130421b0CC164c75D41cA0f0acDD584