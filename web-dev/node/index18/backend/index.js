// index.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 8000;

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:5173',  
    credentials: true
}));
app.use(cookieParser());

mongoose.connect('mongodb://127.0.0.1:27017/cookiesDB')
    .then(() => {
        console.log("DB Connected!!!");
    })
    .catch((err) => {
        console.log("DB Connection Failed:", err);
    });

app.get("/cookie", (req, res) => {
    const { myname = "defaultName", course = "defaultCourse" } = req.query;

    res.cookie("myname", myname, {
        maxAge: 60 * 1000,
        httpOnly: false,
        sameSite: "lax",
    });
    res.cookie("course", course, {
        maxAge: 60 * 1000,
        httpOnly: false,
        sameSite: "lax",
    });

    res.send(`Cookies set: myname=${myname}, course=${course}`);
});


app.get("/display", (req, res) => {
    const { myname, course } = req.cookies;
    console.log(req.cookies);
    res.send({ name: myname, course: course });
});

app.get("/clear-cookie", (req, res) => {
    res.clearCookie("myname");
    res.clearCookie("course");
    res.send("cookies cleared!");
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
