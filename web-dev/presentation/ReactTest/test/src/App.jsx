import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Layout from "./components/Layout";
import NoPage from "./components/NoPage";
import CounterApp from "./components/CounterApp";
import ThemeChange from "./components/ThemeChange";
import ToDoList from "./components/ToDoList";
import ContactUs from "./components/ContactUs";

const App = () => {
  return(
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
          <Route index element={<Home />}/>
          <Route path="Home" element={<Home />}/>
          <Route path="CounterApp" element={<CounterApp />}/>
          <Route path="ThemeChange" element={<ThemeChange />}/>
          <Route path="ToDoList" element={<ToDoList />}/>
          <Route path="ContactUs" element={<ContactUs />}/>
          </Route>
          
          <Route path="*" element={<NoPage />}/>
        </Routes>
      </BrowserRouter>
    </>
  ) 
}

export default App;

