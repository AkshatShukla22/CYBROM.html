import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./components/About";
import ContactUs from "./components/ContactUs";
import Home from "./components/Home";
import Layout from "./components/Layout";
import Support from "./components/Support";
import NoPage from "./components/NoPage";

const Rout = () => {
  return(
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
          <Route index element={<Home />}/>
          <Route path="Home" element={<Home />}/>
          <Route path="ContactUs" element={<ContactUs />}/>
          <Route path="About" element={<About />}/>
          <Route path="Support" element={<Support />}/>
          </Route>
          
          <Route path="*" element={<NoPage />}/>
        </Routes>
      </BrowserRouter>
    </>
  ) 
}

export default Rout;