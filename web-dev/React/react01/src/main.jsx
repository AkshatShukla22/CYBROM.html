import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import App01 from './components/components/App01.jsx'
import { name } from './components/components/App01.jsx'

createRoot(document.getElementById('root')).render(

    <>
    <App />
    <App01 />  
    <h1>{name}</h1> 
    </>

)
