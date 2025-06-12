import { useContext } from "react";
import UserContext from "./UserContext";

const Cybrom02 = ({ children }) => {
  const { name } = useContext(UserContext);
  return (
    <div>
      <h1>Welcome To Cybrom! {name}</h1>
      {children}
    </div>
  );
};

export default Cybrom02;