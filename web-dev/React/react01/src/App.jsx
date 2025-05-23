import Cybrom from "./components/Cybrom";
const fees = 15000;
const add = "Bhopal raisen";

const student={
  name: "Akshat Shukla",
  city: "Bhopal",
  address: "Raisen Bhopal",
  fees: 15000
}


const App = () => {
  return(
    <>
  <h1>Welcome!!</h1>
  {/* <Cybrom nm="Akshat" city="Bhopal" address={add} fs={fees} /> */}
  <Cybrom nm={student.name} city={student.city} address={student.address} fs={student.fees} />
    </>
  )
}

export default App;