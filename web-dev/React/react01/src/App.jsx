// import './CSS/index01.css'

// const Data1 = {
//   color: "red",
//   fontFamily: "arial",
//   fontSize: "40px"
// }

// const Data2 = {
//   color: "blue",
//   fontFamily: "arial",
//   fontSize: "20px"
// }

const outerBox = {
  height: "20vh",
  backgroundColor: "aqua",
  borderRadius: "20px",
  border: "5px solid blue",
  width:  "30vw"
}

const outerBox2 = {
  height: "15vh",
  backgroundColor: "yellow",
  borderRadius: "20px",
  border: "5px solid green",
  width:  "20vw",
  margin: "2vh auto"
}

const outerBox3 = {
  height: "8vh",
  backgroundColor: "orange",
  borderRadius: "10px",
  border: "5px solid red",
  width:  "10vw",
  margin: "2.5vh auto",
  color: "red",
  padding: "0vh 3vw",
  textAlign: "center"
}


const App = () => {
  return(
    <>
    {/* <h1 style={{color: "red", fontFamily: "arabic", textDecoration: "underLine"}}>Welcome to Cybrom</h1>
    <h1 style={{color: "blue", textDecoration: "overLine"}}>We are React developer</h1> */}

    {/* <h1 style={Data1}>Welcome to Cybrom!!</h1>
    <h1 style={Data2}>We are React developer</h1> */}

    <div style={outerBox}>

      <div style={outerBox2}>
        <div style={outerBox3}>Cybrom</div>

      </div>
    </div>

    {/* <div>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic minima temporibus numquam, iusto sit, totam corporis laborum facere, consectetur cum cupiditate veniam voluptatem debitis! Laboriosam illo saepe autem quia? Maiores?
    </div> */}
    </>
  )
}

export default App;