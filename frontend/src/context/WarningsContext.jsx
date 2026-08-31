import { createContext, useContext, useState } from "react";

const WarningsContext = createContext();

// Shared open/close state for the "My Warnings" popup, so both the
// notification bell (click a warning item) and the background poller
// (a brand new warning just arrived) can trigger the same modal.
export const WarningsProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <WarningsContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </WarningsContext.Provider>
  );
};

export const useWarnings = () => useContext(WarningsContext);
