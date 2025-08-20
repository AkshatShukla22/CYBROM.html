const express = require("express");
const app = express();

app.use((req, res, next) => {
    console.log("This is App level Middleware!");
    next();
});

app.get("/home", (req, res) => {
    console.log("Welcome To Home Page");
    res.send("OKK Home !");
});

app.get("/about", 
    (req, res, next) => {
        console.log("this is Path level About middleware!");
        next();
    }, 
    (req, res) => {
        console.log("This is About Page!");
        res.send("About OKK!");
    }
);

app.get("/contact", 
    (req, res, next) => {
        console.log("This is Contact 1 middleware");
        next();
    },
    (req, res, next) => {
        console.log("This is contact 2 middleware");
        next();
    },
    (req, res) => {
        console.log("Welcome To Contact Page");
        res.send("OKK Contact !");
    }
);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
