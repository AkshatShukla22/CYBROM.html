
const homePage = (req,res)=>{ res.send("</h1>Welcome to my student Home Page!</h1>"); }
const aboutPage = (req,res)=>{ res.send("</h1>Welcome to my student About Page!</h1>"); }
const subjectPage = (req,res)=>{ res.send("</h1>Welcome to my student Subject Page!</h1>"); }
const feesPage = (req,res)=>{ res.send("<h1>Welcome to my student Fees Page!</h1>"); }

module.exports = { homePage, aboutPage, subjectPage, feesPage }
