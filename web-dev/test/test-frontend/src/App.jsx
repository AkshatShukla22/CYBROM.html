import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Layout04 from "./components/Layout";
import NoPage from "./pages/NoPage";
import Display from "./pages/Display";
import About from "./pages/About";

const App = () => {
  return(
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout04 />}>
          <Route index element={<Home />}/>
          <Route path="Home" element={<Home />}/>
          <Route path="Display" element={<Display />}/>
          <Route path="About" element={<About />}/>
          </Route>
          
          <Route path="*" element={<NoPage />}/>
        </Routes>
      </BrowserRouter>
    </>
  ) 
}

export default App;
