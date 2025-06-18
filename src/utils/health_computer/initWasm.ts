import init from "@/utils/health_computer/index";

let isInitialized = false;
let initPromise: Promise<void> | null = null;

export const initializeWasm = (): Promise<void> => {
  if (isInitialized) {
    return Promise.resolve();
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = init()
    .then(() => {
      isInitialized = true;
    })
    .catch((error) => {
      throw error;
    });

  return initPromise;
};

export const isWasmInitialized = (): boolean => {
  return isInitialized;
};
