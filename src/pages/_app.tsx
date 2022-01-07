import { AppProps } from 'next/app';

import Providers from '../utils/Providers';
// import '../styles/global.css';

const MyApp = ({ Component, pageProps }: AppProps) => (
  <Providers>
    <Component {...pageProps} />
  </Providers>
);

export default MyApp;
