// Import express dan path
const express = require("express");
const path = require("path");

const app = express();
app.set('view engine', 'ejs');

// Middleware untuk serving static files
app.use('/landing/css', express.static(path.join(__dirname, 'views/landing/css')));
app.use('/landing/js', express.static(path.join(__dirname, 'views/landing/js')));
app.use('/landing/img', express.static(path.join(__dirname, 'views/landing/img')));
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// Endpoint root untuk landing page
app.get("/", (req, res) => {
  res.render('index')
});

app.get("/dashboard", (req, res) => {
  res.render('dashboard')
});

app.get("/login", (req, res) => {
  res.render('login')
});

app.get("/daftar", (req, res) => {
  res.render('daftar')
});

app.get("/acara", (req, res) => {
  res.render('acara')
});

app.get("/dana", (req, res) => {
  res.render('dana')
});

app.get("/vendor", (req, res) => {
  res.render('vendor')
});

app.get("/rsvp", (req, res) => {
  res.render('rsvp')
});

app.get("/katalog", (req, res) => {
  res.render('katalog')
});

app.get("/form/acara", (req, res) => {
  res.render('form/acara')
});

app.get("/form/dana", (req, res) => {
  res.render('form/dana')
});

app.get("/form/vendor", (req, res) => {
  res.render('form/vendor')
});

app.get("/form/rsvp", (req, res) => {
  res.render('form/rsvp')
});

// Routing untuk assets lainnya (contoh untuk file-icons)
app.use('/dashboard/assets/images/file-icons', express.static(path.join(__dirname, 'dashboard/assets/images/file-icons')));

// Server listen
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
