"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type ModuleSelection = {
  /** 1-based module number, or null for no selection. */
  module: number | null;
  setModule: (m: number | null) => void;
};

const Ctx = createContext<ModuleSelection | null>(null);

/**
 * Shares a selected battery module between the 2D potential matrix and the
 * optional 3D pack view when both are on the same page. Components that do not
 * sit inside a provider (the homepage matrix, standalone use) fall back to
 * their own local state, so nothing depends on the provider being present.
 */
export function ModuleSelectionProvider({ children }: { children: ReactNode }) {
  const [module, setModule] = useState<number | null>(null);
  return <Ctx.Provider value={{ module, setModule }}>{children}</Ctx.Provider>;
}

export function useModuleSelection(): ModuleSelection {
  const shared = useContext(Ctx);
  const [module, setModule] = useState<number | null>(null);
  return shared ?? { module, setModule };
}
