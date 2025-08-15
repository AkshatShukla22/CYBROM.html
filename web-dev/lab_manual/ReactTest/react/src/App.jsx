import {BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Insert from "./pages/Insert";
import Display from "./pages/Display";
import Update from "./pages/Update";
import Search from "./pages/Search";
import Edit from "./pages/Edit";
import NoPage from "./pages/NoPage";
import TotalTYQ from "./pages/TotalTYQ"

function App() {

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />}/>
        <Route path="Home" element={<Home />}/>
        <Route path="Insert" element={<Insert />}/>
        <Route path="Display" element={<Display />}/>
        <Route path="Update" element={<Update />}/>
        <Route path="Search" element={<Search />}/>
        <Route path="Edit/:id" element={<Edit />}/>
        <Route path="TotalTYQ" element={<TotalTYQ />}/>
      </Route>

        <Route path="*" element={<NoPage />}/>

    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
