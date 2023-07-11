import React, { createContext, useState } from "react";

export const IsLoggedContext = createContext();

export const IsLoggedProvider = ({ children }) => {
  const [IsLogged, setIsLogged] = useState(false);

  return (
    <IsLoggedContext.Provider value={{ IsLogged, setIsLogged }}>
      {children}
    </IsLoggedContext.Provider>
  );
};
