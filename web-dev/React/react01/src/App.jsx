import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Layout04 from "./components/Layout04";
import NoPage from "./components/NoPage";
import Insert from "./components/Insert";
import Pagination from "./components/Pagination";
import Update from "./components/Update";
import Search from "./components/Search";

const App = () => {
  return(
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout04 />}>
          <Route index element={<Home />}/>
          <Route path="Home" element={<Home />}/>
          <Route path="Insert" element={<Insert />}/>
          <Route path="Pagination" element={<Pagination />}/>
          <Route path="Update" element={<Update />}/>
          <Route path="Search" element={<Search />}/>
          </Route>
          
          <Route path="*" element={<NoPage />}/>
        </Routes>
      </BrowserRouter>
    </>
  ) 
}

export default App;