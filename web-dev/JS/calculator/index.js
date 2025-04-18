let inputField = document.getElementById("input");
    let resultField = document.getElementById("result");
    let sound = document.getElementById("clickSound");

    function playClick() {
      sound.currentTime = 0;
      sound.play();
    }

    function append(value) {
      inputField.value += value;
    }

    function clearAll() {
      inputField.value = "";
      resultField.textContent = "";
    }

    function backspace() {
      inputField.value = inputField.value.slice(0, -1);
    }

    function calculate() {
      let expression = inputField.value
        .replace(/√\(/g, "Math.sqrt(")
        .replace(/sin\(/g, "Math.sin(")
        .replace(/cos\(/g, "Math.cos(")
        .replace(/tan\(/g, "Math.tan(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(")
        .replace(/\^/g, "**")
        .replace(/(\d+)%/g, "($1/100)");

      try {
        let result = eval(expression);
        resultField.textContent = "= " + result;
      } catch (err) {
        resultField.textContent = "Error";
      }
    }