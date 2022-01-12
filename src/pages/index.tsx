import React from "react";

import { Box, Button } from "@mui/material";
import { useRouter } from "next/router";

import useAuth, { connectorLocalStorageKey } from "@/hooks/useAuth";
import useEagerConnect from "@/hooks/useEagerConnect";
import { Meta } from "@/layout/Meta";
import { Main } from "@/templates/Main";
import { ConnectorNames } from "@/utils/web3react";
import {
  useDarkSpaceCoreContract,
  useVerifierContract,
} from "@/hooks/useContract";
import SnarkArgsHelper, {
  generateWitness,
  makeZkProof,
  wasmFile,
  zkey,
} from "@/utils/zk/snarks";
import { useWeb3React } from "@web3-react/core";

const Index = () => {
  // const router = useRouter();
  //useEagerConnect();
  const { login, logout } = useAuth();
  const { account } = useWeb3React();
  const darkSpaceCoreContract = useDarkSpaceCoreContract();
  const onVerify = async () => {
    console.log("calling verfiy", account);
    //calculateWitness(["2"], wasmFile);
    //generateWitness(["2"]);
    //makeZkProof(["2"], wasmFile, zkey);

    //const snarkHelper = await SnarkArgsHelper.create();
    //const intiArgs = snarkHelper.getInitArgs(2);

    const tx = await darkSpaceCoreContract.methods
      .initializePlayer(a, b, c, input)
      .send({ from: account });
    console.log(`tx----->`, tx);
    // try {
    //   verifierContract.methods.verifyProof();
    // } catch (e) {
    //   console.log("Error calling contract: ", e);
    // }
  };
  return (
    <Main meta={<Meta title="DS ZK base game" description="" />}>
      <Box>
        <Button
          variant="outlined"
          onClick={() => {
            window.localStorage.setItem(
              connectorLocalStorageKey,
              ConnectorNames.Metamask
            );
            login(ConnectorNames.Metamask);
          }}
        >
          Connect
        </Button>
        <Button variant="outlined" onClick={() => logout()}>
          DisConnect
        </Button>
        <Button variant="outlined" onClick={() => onVerify()}>
          Verify
        </Button>
      </Box>
    </Main>
  );
};

export default Index;

const a = [
  "0x1bd0f9791dc76fe265da38d92dec703cac24ae806b9be9106aafc08042a17d68",
  "0x2c62b8f868d9e4dea65ec006adbc2cbab44d88c6ea189210cafe0167fe21de5f",
];
const b = [
  [
    "0x2e50c2f63579b76ccf13104a500b40b4dbd6b2aa35243f08cc9bc7c1a297f35f",
    "0x1517d806a72ca4511b8a4411059c202d5b3d27c30b50a87df76e6107f99d8c51",
  ],
  [
    "0x0f131ea9611a098ac1cbe1aadc2c3bfbf89902cafe5ec77543e54fc7b37023c3",
    "0x1099d4ab414757155e74354dbc56da3215a2cd81ee11b8a73f056db6cf601b67",
  ],
];

const c = [
  "0x2be301cc8c175b9609d9b2b51f9cbe396197d4f7c22e2aab0e65826e872e0c2a",
  "0x2e47769a52835be8e3e505c5abe71e8f9eceacf099e83d51494cd3854aead287",
];
const input = [
  "0x210f6b63008f0983117bebf8297a0c0622543037e3c644009d26e4b153eb83d1",
];
