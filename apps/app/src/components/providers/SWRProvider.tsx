"use client";

import { debugSWR } from "@/utils/middleware";
import { SWRConfig } from "swr";

export const SWRProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <SWRConfig
      value={{
        use: [debugSWR],
      }}
    >
      {children}
    </SWRConfig>
  );
};
