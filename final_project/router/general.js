const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Unable to register user." });
  }

  if (users.some((user) => user.username === username)) {
    return res.status(404).json({ message: "User already exists!" });
  }

  users.push({ username: username, password: password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  return res.status(200).json(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const booksWithAuthor = [];
  const isbnKeys = Object.keys(books);

  isbnKeys.forEach((isbn) => {
    if (books[isbn].author === author) {
      booksWithAuthor.push({ [isbn]: books[isbn] });
    }
  });

  return res.status(200).json(booksWithAuthor);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const booksWithTitle = [];
  const isbnKeys = Object.keys(books);

  isbnKeys.forEach((isbn) => {
    if (books[isbn].title === title) {
      booksWithTitle.push({ [isbn]: books[isbn] });
    }
  });

  return res.status(200).json(booksWithTitle);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  return res.status(200).json(books[isbn].reviews);
});

// Task 10: Get all books using async-await with Axios
public_users.get('/async/books', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return res.status(200).send(response.data);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching books list' });
  }
});

// Task 11: Get book by ISBN using Promise with Axios
public_users.get('/async/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Validate ISBN to ensure it only contains expected characters before using it in a URL
  const isbnPattern = /^[0-9Xx-]+$/;
  if (!isbnPattern.test(isbn)) {
    return res.status(400).json({ message: 'Invalid ISBN format' });
  }

  axios
    .get(`${BASE_URL}/isbn/${isbn}`)
    .then((response) => res.status(200).json(response.data))
    .catch(() => res.status(500).json({ message: 'Error fetching book by ISBN' }));
});

// Task 12: Get books by author using Promise with Axios
public_users.get('/async/author/:author', function (req, res) {
  const author = req.params.author;
  axios
    .get(`${BASE_URL}/author/${encodeURIComponent(author)}`)
    .then((response) => res.status(200).json(response.data))
    .catch(() => res.status(500).json({ message: 'Error fetching books by author' }));
});

// Task 13: Get books by title using async-await with Axios
public_users.get('/async/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching books by title' });
  }
});

module.exports.general = public_users;
