const container = document.getElementById("container");

// container.innerHTML = "";

let angry = () => {
    container.innerHTML = "😠";
}

let sad = () => {
    container.innerHTML = "😔";
}

let happy = () => {
    container.innerHTML = "😊";
}

let excited = () => {
    container.innerHTML = "🤩";
}

let random = () => {
    let rand = Math.trunc(Math.random()*10);
    console.log(rand);
    if(rand>=0 && rand<=2){
        container.innerHTML = "😠";
    }
    else if(rand>2 && rand<=5){
        container.innerHTML = "😔";
    }
    else if(rand>5 && rand<=7){
        container.innerHTML = "😊";
    }
    else if(rand>7 && rand<=10){
        container.innerHTML = "🤩";
    }
}

// function add () {
//     let a;
//     a= 5+4;
//     concole.log(a);
// }

// let fun = rand = () => {
//     console.log(54);
// }

// console.log(fun);
