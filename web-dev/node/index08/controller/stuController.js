

const homePage = (req, res) => {
  res.render('home', { title: 'Home Page' });
}

const contactPage = (req, res) => {
  res.render('contact', { title: 'Contact Page' });
}

const aboutPage = (req, res) => {
  res.render('about', { title: 'About Page' });
}

module.exports = {
  homePage,
    contactPage,
    aboutPage
};