const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).json({ message: "Username and password are required" });
  }
  let username = req.body.username;
  let password = req.body.password;
  if (!isValid(username)) {
    res.status(404).json({ message: "User already exists" });
  } else {
    users.push({ "username": username, "password": password });
    return res.status(200).json({ message: "User created successfully" });
  }
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
try {
    const getBooks = () => {
      return new Promise((resolve, reject) => {
        resolve(books);
      });
    };

    const bookList = await getBooks();
    res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books" });
  }
});

const axios = require('axios');

public_users.get('/', async function (req, res) {
  try {
    // We call our own API endpoint asynchronously
    const response = await axios.get("http://localhost:5000/"); 
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching book list", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
const isbn = req.params.isbn;
  const findBook = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  });

  findBook
    .then((book) => res.status(200).send(JSON.stringify(book, null, 4)))
    .catch((err) => res.status(404).json({ message: err }));
});

function findBookByIsbn(isbn) { return Object.values(books).find(book => book.isbn === isbn); }

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
const author = req.params.author;
  
  try {
    const getBooksByAuthor = await new Promise((resolve, reject) => {
      const filteredBooks = Object.values(books).filter(b => b.author === author);
      resolve(filteredBooks);
    });

    res.status(200).send(JSON.stringify(getBooksByAuthor, null, 4));
  } catch (error) {
    res.status(500).json({ message: "Error fetching books by author" });
  }
});

public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    // Requesting the list of books for a specific author from the API
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    
    // Send the retrieved data back to the client
    res.status(200).json(response.data);
  } catch (error) {
    // Handle cases where the author is not found or the server is down
    res.status(error.response?.status || 500).json({ 
      message: "Error retrieving books by author", 
      error: error.message 
    });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
const title = req.params.title;

  const getBooksByTitle = new Promise((resolve, reject) => {
    const filteredBooks = Object.values(books).filter(b => b.title === title);
    resolve(filteredBooks);
  });

  getBooksByTitle.then((result) => {
    res.status(200).send(JSON.stringify(result, null, 4));
  });
});
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    // Calling the API to get books matching the specific title
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    
    // Send the filtered results back to the client
    res.status(200).json(response.data);
  } catch (error) {
    // Handle cases where the title is not found or the request fails
    res.status(error.response?.status || 500).json({ 
      message: "Error retrieving books by title", 
      error: error.message 
    });
  }
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  res.send(findBookByIsbn(req.params.isbn).reviews);
});


module.exports.general = public_users;
