const stuModel = require('../models/stuModel'); 

const homePage = (req, res) => {
    res.render("home");
};

const insertPage = (req, res) => {
    res.render("insert");
};

const stuSave = (req, res) => {
    const { rollno, Studentname, classname, subject } = req.body;  

    const data = new stuModel({
        rollno,
        Studentname,
        classname,
        subject
    });
    data.save()
        .then(() => { req.body; 
          res.render("insert"); })
        .catch((err) => {
            console.log(err);
            res.send("Error saving data.");
        });
};


module.exports = { homePage, insertPage, stuSave };