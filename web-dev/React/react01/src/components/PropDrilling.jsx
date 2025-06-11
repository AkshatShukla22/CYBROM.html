import { useState } from "react"; 
import { createContext } from "react";
import Component01 from "./components/Component01";

const UserContext  = createContext();

const App = () => {
  const [user, setUser] = useState("Akshat");
  return(
    <>
    <div>
    <h1>Welcome - {user}!!!</h1>
    {/* <Component01 user={user} /> */}
    </div>

    <hr />

    <div>
      <UserContext.Provider value={{user}}>
        <Component01 />
      </UserContext.Provider>
    </div>

    </>
  ) 
}

export default App;
export {UserContext};