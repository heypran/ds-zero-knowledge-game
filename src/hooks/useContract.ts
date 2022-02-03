import {
  getDarkSpaceCoreContract,
  getMyVerifyContract,
  getScContract,
  getSemContract,
} from "./../utils/contractHelpers";
import { useMemo } from "react";
import useWeb3 from "./useWeb3";

export const useVerifierContract = () => {
  const web3 = useWeb3();
  return useMemo(() => getMyVerifyContract(web3), [web3]);
};
export const useDarkSpaceCoreContract = () => {
  const web3 = useWeb3();
  return useMemo(() => getDarkSpaceCoreContract(web3), [web3]);
};

export const useSemaphoreClientContract = () => {
  const web3 = useWeb3();
  return useMemo(() => getScContract(web3), [web3]);
};
export const useSemaphoreContract = () => {
  const web3 = useWeb3();
  return useMemo(() => getSemContract(web3), [web3]);
};
export default { useVerifierContract, useDarkSpaceCoreContract };
