import React, { createContext, ReactNode, useContext, useState } from "react";

interface NotebookContextType {
  notebookId: string;
  noteId: string;
  setNotebook: (nbId: string, nId: string) => void;
}

const NotebookContext = createContext<NotebookContextType | undefined>(undefined);

export function NotebookProvider({ children }: { children: ReactNode }) {
  const [notebookId, setNotebookId] = useState("9GUpKdkjXZ8HCzRBdNE8");
  const [noteId, setNoteId] = useState("x5EbllepXnjjoTJyjyX4");

  const setNotebook = (nbId: string, nId: string) => {
    setNotebookId(nbId);
    setNoteId(nId);
  };

  return (
    <NotebookContext.Provider value={{ notebookId, noteId, setNotebook }}>
      {children}
    </NotebookContext.Provider>
  );
}

export function useNotebook() {
  const ctx = useContext(NotebookContext);
  if (!ctx) throw new Error("useNotebook must be used within NotebookProvider");
  return ctx;
}
