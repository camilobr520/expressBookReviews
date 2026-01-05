const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  if (users.some(user => user.username === username)) {
    return false;
  }
  return true;
}

const authenticatedUser = (username, password) => { //returns boolean
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      username: username
    }, 'access', { expiresIn: 86400 });
    return res.status(200).json({ message: "User logged in successfully", accessToken: accessToken });
  }
  return res.status(404).json({ message: "Error logging in" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const bookEntry = findBookByIsbn(req.params.isbn);
  if (!bookEntry) {
    return res.status(404).json({ error: "Libro no encontrado" });
  }

  const username = req.user;
  const reviewText = req.body.reviews;

  // Verificar si ya existe review de este usuario
  const existsReview = validateReview(bookEntry, username);

  if (existsReview) {
    // Actualizar la review existente
    bookEntry.reviews = bookEntry.reviews.map(r =>
      r.username === username ? { username, review: reviewText } : r
    );
    res.send(`The review for the book with ISBN ${req.params.isbn} has been updated.`);
  } else {
    // Agregar nueva review
    bookEntry.reviews.push({ username, review: reviewText });
    res.send(`The review for the book with ISBN ${req.params.isbn} has been added.`);
  }
});



function validateReview(bookEntry, username) {
  if (!bookEntry || !bookEntry.reviews) {
    return false;
  }
  return bookEntry.reviews.some(r => r.username === username);
}

function findBookByIsbn(isbn) { return Object.values(books).find(book => book.isbn === isbn); }



regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user;

  const bookEntry = findBookByIsbn(isbn);
  if (!bookEntry) {
    return res.status(404).json({ message: "Libro no encontrado" });
  }

  const existsReview = validateReview(bookEntry, username);

  if (existsReview) {
    // Filtrar las reviews y eliminar la del usuario
    bookEntry.reviews = bookEntry.reviews.filter(r => r.username !== username);

    return res.status(200).json({
      message: `Review for ISBN ${isbn} posted by ${username} has been deleted.`
    });
  } else {
    return res.status(404).json({
      message: "No review found for this user on this book."
    });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
