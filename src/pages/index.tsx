import React from "react";

import { Box, Button } from "@mui/material";
import { useRouter } from "next/router";

import useAuth from "@/hooks/useAuth";
import useEagerConnect from "@/hooks/useEagerConnect";
import { Meta } from "@/layout/Meta";
import { Main } from "@/templates/Main";
import { ConnectorNames } from "@/utils/web3react";

const Index = () => {
  // const router = useRouter();
  useEagerConnect();
  const { login, logout } = useAuth();

  return (
    <Main meta={<Meta title="DS ZK base game" description="" />}>
      <Box>
        <Button
          variant="outlined"
          onClick={() => login(ConnectorNames.Metamask)}
        >
          Connect
        </Button>
        <Button variant="outlined" onClick={() => logout()}>
          DisConnect
        </Button>
      </Box>
    </Main>
  );
};

export default Index;
