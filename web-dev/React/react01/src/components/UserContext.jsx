import { useState, createContext } from "react";

const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [name, setName] = useState("Shivani");
  return (
    <UserContext.Provider value={{ name, setName }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
export { UserContextProvider };