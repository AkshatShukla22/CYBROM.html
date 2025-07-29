const stuModel = require('../models/stuModel'); 

const homePage = (req, res) => {
    res.render("home");
};

const insertPage = (req, res) => {
    res.render("insert");
};

const displayPage = (req, res) => {
    res.render("display");
};

const stuSave = (req, res) => {
    const { rollno, Studentname, classname, subject } = req.body;  

    const data = new stuModel({
        rollno,
        name: Studentname,
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

const displayStu = (req, res) => {
    stuModel.find()
        .then((data) => {
            res.render("display", { students: data });
        })
        .catch((err) => {
            console.log(err);
            res.send("Error retrieving data.");
        });
};  

const deleteStu = (req, res) => {
    const id = req.params.id;

    stuModel.findByIdAndDelete(id)

    .then(() => {
        res.redirect("/display");
    })
    .catch((err) => {
        console.log(err);
        res.send("Error deleting data.");
    });
};    

const editPage = (req, res) => {
    const id = req.params.id;

    stuModel.findById(id)
        .then(student => {
            res.render("edit", { student });
        })
        .catch(err => {
            console.log(err);
            res.send("Error fetching student for edit.");
        });
};

const updateStu = (req, res) => {
    const id = req.params.id;
    const { rollno, Studentname, classname, subject } = req.body;

    stuModel.findByIdAndUpdate(id, {
        rollno,
        name: Studentname,
        classname,
        subject
    })
    .then(() => {
        res.redirect("/display");
    })
    .catch(err => {
        console.log(err);
        res.send("Error updating student.");
    });
}



module.exports = { homePage, insertPage, displayPage, stuSave, displayStu, deleteStu, editPage, updateStu };