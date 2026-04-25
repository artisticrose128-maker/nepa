declare global {
  interface Window {
    stellar?: {
      getPublicKey: () => Promise<string>;
      signTransaction: (transaction: string) => Promise<string>;
    };
  }
}

export {};
