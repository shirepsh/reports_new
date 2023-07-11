import React, { createContext, useState } from "react";

export const UserTypeContext = createContext();

export const UserTypeProvider = ({ children }) => {
  const [UserType, setUserType] = useState("");

  return (
    <UserTypeContext.Provider value={{ UserType, setUserType }}>
      {children}
    </UserTypeContext.Provider>
  );
};
