export interface WebsnarkProof {
  pi_a: [string, string, string];
  pi_b: [[string, string], [string, string], [string, string]];
  pi_c: [string, string, string];
}

declare global {
  interface Window {
    // gameManager: any;
    // mimcHash: any;
    //ethereum: WindowEthereumObject;
    // from websnark's function injected into window
    genZKSnarkProof: (
      witness: ArrayBuffer,
      provingKey: ArrayBuffer
    ) => Promise<WebsnarkProof>;
  }
}
