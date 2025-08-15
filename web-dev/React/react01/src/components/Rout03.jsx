import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./components/About";
import ContactUs from "./components/ContactUs";
import Home from "./components/Home";
import Layout03 from "./components/Layout03";
import Support from "./components/Support";
import NoPage from "./components/NoPage";
import Insert from "./components/Insert";
import Display from "./components/Display";
import Update from "./components/Update";
import Update02 from "./components/Update02";
import Search from "./components/Search";
import Edit from "./components/Edit";

const App = () => {
  return(
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout03 />}>
          <Route index element={<Home />}/>
          <Route path="Home" element={<Home />}/>
          <Route path="ContactUs" element={<ContactUs />}/>
          <Route path="About" element={<About />}/>
          <Route path="Support" element={<Support />}/>
          <Route path="Insert" element={<Insert />}/>
          <Route path="Display" element={<Display />}/>
          <Route path="Update" element={<Update />}/>
          <Route path="Search" element={<Search />}/>
          <Route path="Update02" element={<Update02 />}/>
          <Route path="/Edit/:id" element={<Edit />} />
          </Route>
          
          <Route path="*" element={<NoPage />}/>
        </Routes>
      </BrowserRouter>
    </>
  ) 
}

export default App;