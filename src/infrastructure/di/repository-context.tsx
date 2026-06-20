"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  createIndexedDBContainer,
  type RepositoryContainer,
} from "./container";

const RepositoryContext = createContext<RepositoryContainer | null>(null);

interface RepositoryProviderProps {
  children: ReactNode;
  container?: RepositoryContainer;
}

export function RepositoryProvider({
  children,
  container,
}: RepositoryProviderProps) {
  const repos = container ?? createIndexedDBContainer();
  return (
    <RepositoryContext.Provider value={repos}>
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepositories(): RepositoryContainer {
  const context = useContext(RepositoryContext);
  if (!context) {
    throw new Error("useRepositories must be used within RepositoryProvider");
  }
  return context;
}
