const name = "Akshat";
const age = 20;

const sub = <ol>
    <li>React</li>
    <li>Rust</li>
    <li>Ruby</li>
    <li>JS</li>
    <li>Html</li>
</ol>

const App = () => {
  return(
    <>
    <h1>Hello {name} you are {age} years old.</h1>
    my sub = {sub}

    <h1>My application form</h1><br/>
    Enter name: <input type="text" /><br/>
    Enter city: <input type="text" />
    </>
  )
}

export default App;