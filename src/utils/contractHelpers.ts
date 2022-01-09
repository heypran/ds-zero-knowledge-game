import Web3 from "web3";
import { AbiItem } from "web3-utils";
import web3NoAccount from "./web3";

// ABI
import verfierAbi from "../../build/contracts/Verifier.json";
import darkSapceCoreAbi from "../../build/contracts/DarkSpaceCore.json";
import { verfierAddress, darkSapceCoreAddress } from "@/config/constants";

const getContract = (abi: any, address: string, web3?: Web3) => {
  const _web3 = web3 ?? web3NoAccount;
  return new _web3.eth.Contract(abi as unknown as AbiItem, address);
};

export const getMyVerifyContract = (web3?: Web3): any => {
  //const addresss = Web3.utils.toChecksumAddress(verfierAddress);
  return getContract(verfierAbi.abi, verfierAddress, web3);
};

export const getDarkSpaceCoreContract = (web3?: Web3): any => {
  //const addresss = Web3.utils.toChecksumAddress(darkSapceCoreAddress);
  return getContract(darkSapceCoreAbi.abi, darkSapceCoreAddress, web3);
};
