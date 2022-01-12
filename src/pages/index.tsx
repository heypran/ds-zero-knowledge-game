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
import {
  genPlanetHash,
  initializePosition,
  movePlayer,
} from "@/utils/tempZk/tempZk";

const Index = () => {
  // const router = useRouter();
  //useEagerConnect();
  const { login, logout } = useAuth();
  const { account } = useWeb3React();
  const darkSpaceCoreContract = useDarkSpaceCoreContract();
  const onVerify = async () => {
    console.log("calling initialize", account);
    try {
      const [a, b, c, input] = await initializePosition({ x: 42, y: 1 });
      console.log("abcinput", a, b, c, input);
      const tx = await darkSpaceCoreContract.methods
        .initializePlayer(a, b, c, input)
        .send({ from: account, gas: 5000000 })
        .on("errr", (e, r) => console.log("error", e, "\nreceipt", r));

      console.log(`tx----->`, tx);
    } catch (e) {
      console.log("error ", e);
    }
  };
  const onMove = async () => {
    console.log("calling onmove for", account);

    try {
      const [a, b, c, input] = await movePlayer({
        x: 42,
        y: 1,
        x2: 20,
        y2: 20,
      });
      console.log("abcinput", a, b, c, input);
      const tx = await darkSpaceCoreContract.methods
        .initializePlayer(a, b, c, input)
        .send({ from: account, gas: 5000000 })
        .on("errr", (e, r) => console.log("error", e, "\nreceipt", r));
      console.log(`txResponse----->`, tx);
    } catch (e) {
      console.log("error ", e);
    }
  };
  const genHash = async () => {
    console.log("calling onmove for", account);

    try {
      const [a, b, c, input] = await genPlanetHash({ x: 2, y: 2 });
      console.log("abcinput", a, b, c, input);
      console.log(`input is ======>`, input);
      const tx = await darkSpaceCoreContract.methods
        .initializePlayer(a, b, c, input)
        .send({ from: account, gas: 5000000 })
        .on("errr", (e, r) => console.log("error", e, "\nreceipt", r));
      console.log(`txResponse----->`, tx);
    } catch (e) {
      console.log("error ", e);
    }
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
          Initialize
        </Button>
        <Button variant="outlined" onClick={() => onMove()}>
          Move
        </Button>
        <Button variant="outlined" onClick={() => genHash()}>
          Generate Planet Hashes
        </Button>
      </Box>
    </Main>
  );
};

export default Index;

// 0x5FD6eB55D12E759a21C09eF703fe0CBa1DC9d88D,0x7b96aF9Bd211cBf6BA5b0dd53aa61Dc5806b6AcE

// P1 [41,1]
//["0x0a45627ff2861541bf02406325ef48e21075f3fdfdbf092f8b9669b879c75896", "0x146f233a4ca017d57833b8069112fe12ff396c2595fc9285bc2777b17dc35de1"],[["0x185f336c659c93b21f96891afcd10c5eb345eb9ddef4c35c9dd131b547d9b196", "0x1cbf0a59da8b43b150379df2931cbc1eaf92ed5568a0c689639649dd8e20be38"],["0x2397c91d6fce8c9b9da1b68fc2d55b21f604eb4e6ed4c354152487d696d3ce87", "0x0516bc56b0c2ada07c51014db7046acc101cf810e3ac320a8d813d0afe6cac73"]],["0x2b324048bbf790a81a87a3e6ab5e65470e95437e81eee0656e051b7e4aa3fda6", "0x07273ead504273c839cbcf8a0f8ac74cf224dcc92b6a76f7dc2322cf63b24994"],["0x170fae234286821ebe23b4b24b5e033f5b1df539b660b0dab97d85c30b550bc0"]
//p2 [42,1]
// ["0x2ad27ef3145f09a2629022a2addad356b83e2cc62d3c8c9fa7461cd6e7c66197", "0x28bd9c5c8b573400e249f40c13301d4b6aae3d26b8a34ec8d0e8c33aec73c550"],[["0x28e81aa73cf86d0dc9b458e4911de5190545509c1441b7426e502fd3c98b1376", "0x05e8d81e18d5278e41a96570e58494a7da8b64970a5e9a6d4f7fb36d152830e4"],["0x0822794f2cee532e26afe5be00f7a8492f1c1aaef61dec99da5604e02f140e80", "0x2dc6256badb80b148f6534888df4fef8c35cfc47f1e545405a1533dc48a002e6"]],["0x1b0df1398fb74a6f413c4be0ac7d73cf3a0d0da0de0e712ffbb172a449f8c988", "0x10dd6e71e4686972270ea2084fe309cb6cae377a1f9d2790c2253baf6070303a"],["0x07d68d94339a89053a2d45d109ce08ce4b1ddc53719f9d134e014a5a53d96168"]

// 2,2 0x266b29bf96dfa0b6e9e7c877f91d950b85ec632180c93a10c82dc5acba821101
// 10,10 0x105bb1ae3a8c33c2794db19ba79b1d74cfcc0edaebeb01923867af864a0da744
// 20,20 0x24054239755d657c8a10a3c95eaaafae3aa88f9b4bd31602b5737bf36c791d3b

// P1 [41,1] -> [2,2]
// P1->[2,2] -> [10,10]
// P2 ->[42,1] -> [10,10]
// P2 -> [10,10] -> [20,20]

// ["0x226982ac2a878c5e6664af1ed943284d4e95501e9b532adbd0cfd3a5308fdece", "0x0dc94954f3fea460778f3e4e7a3452f14b8104b013855fe1757736cabd9cb592"],[["0x1986ff1ef41e66a6805342f7d95f14b61c8ba69d97346badc621cc77c9bb32e8", "0x09251af5c895200b91eca0aa4c88cbb2186c21c8cdc21b9a1d9c2d96db7ddba7"],["0x05fc98fa16e012045b4379392384fde1aedde602362906d8da49487287314b51", "0x2030ae4cde3c8125959ae14ac6b43711798ec0c2b26e468f823a353a346419d9"]],["0x2cba6ed6eba7c4cdb3a4dda1eb59b98211523bc4803460392f73468493e8a42a", "0x1ddb1c595547a38c3dff186cb5855e67e527a63030edcfe2105ff3d720fb6924"],["0x266b29bf96dfa0b6e9e7c877f91d950b85ec632180c93a10c82dc5acba821101"]
