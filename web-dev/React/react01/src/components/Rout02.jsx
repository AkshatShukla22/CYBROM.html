import 'bootstrap/dist/css/bootstrap.min.css';
import './CSS/style.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./components/About";
import ContactUs from "./components/ContactUs";
import Home from "./components/Home";
import NoPage from "./components/NoPage";
import Layout02 from './components/Layout02';
import Support from "./components/Support"

const App = () => {
  return(
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout02 />}>
          <Route index element={<Home />}/>
          <Route path="Home" element={<Home />}/>
          <Route path="ContactUs" element={<ContactUs />}/>
          <Route path="Support" element={<Support />}/>
          <Route path="About" element={<About />}/>
          </Route>
          
          <Route path="*" element={<NoPage />}/>
        </Routes>
      </BrowserRouter>
    </>
  ) 
}

export default App;