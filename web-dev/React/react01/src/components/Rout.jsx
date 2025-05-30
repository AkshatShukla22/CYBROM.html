import About from "./components/About";
import ContactUs from "./components/ContactUs";
import Home from "./components/Home";
import Layout from "./components/Layout";
import {Routes, Route, BrowserRouter} from 'react-router-dom';

const Rout = () => {
  return(
    <>
      <BrowserRouter>
      <Routes>
          <Route path="/" element={<Layout />}>
          <Route index element={<Home />}/>
          <Route path="Home" element={<Home />}/>
          <Route path="About" element={<About />}/>
          <Route path="ContactUs" element={<ContactUs />}/>
        </Route>
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default  Rout