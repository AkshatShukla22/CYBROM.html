import { useSelector, useDispatch } from "react-redux";
import { bgcolorChange } from "./colorSlice";
import { useState } from "react";

const ThemeChange = () => {
  const clr = useSelector((state) => state.mycolor.color);
  const dispatch = useDispatch();
  const [txtval, setTxtVal] = useState("");

  const isValidColor = (strColor) => {
    const set = new Option().style;
    set.color = strColor;
    return set.color !== "";
  };

  const handleChangeColor = () => {
    if (isValidColor(txtval)) {
      dispatch(bgcolorChange(txtval));
    } else {
      alert("Invalid color name!");
    }
  };

  return (
    <>
      <h1>Welcome</h1>
      Enter Color:{" "}
      <input
        type="text"
        value={txtval}
        onChange={(e) => setTxtVal(e.target.value)}
      />
      <button onClick={handleChangeColor}>Change Color</button>
      <div
        style={{width: "400px", height: "200px", backgroundColor: clr, marginTop: "10px",}}
      ></div>
    </>
  );
};

export default ThemeChange;
