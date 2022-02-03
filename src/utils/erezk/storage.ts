import { Identity } from "@/types/identity.types";
import config from "../../../exported_config.json";

function getStorage() {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}
const localStorage = getStorage();

// The storage key depends on the mixer contracts to prevent conflicts
const postfix = config.chain.contracts.SemaphoreClient.slice(2).toLowerCase();
const key = `SU_${postfix}`;
const keyNew = `SU_NEW`;

const initStorage = () => {
  if (!localStorage?.getItem(keyNew)) {
    localStorage?.setItem(keyNew, "");
  }
};

const storeNewId = (serializedId: string) => {
  // const { identityNullifier, identityTrapdoor } = identity;
  // const iN = identityNullifier.toString();
  // const iT = identityTrapdoor.toString();
  //console.log(`serializedId`, serializedId);
  localStorage?.setItem(keyNew, serializedId);
};

const retrieveNewId = (): string => {
  // @ts-ignore
  //const identity = JSON.parse(localStorage?.getItem(keyNew));
  // const { iT, iN } = identity;
  //return { identityTrapdoor: iT, identityNullifier: iN };

  return localStorage?.getItem(keyNew) ?? "";
};

const hasNewId = (): boolean => {
  const d = localStorage?.getItem(keyNew);
  return d != null && d.length > 0;
};

export { initStorage, storeNewId, retrieveNewId, hasNewId };
