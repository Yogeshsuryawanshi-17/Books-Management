const express = require('express');
const { createUser, userLogin } = require('../controllers/userController');
const { createBook, getBook, getBookWithReview, updateBooks, deleteBook } = require('../controllers/bookController');
const { authentication, authorization } = require('../middleware/auth');
const { bookReview, updateReview, deleteReview } = require('../controllers/reviewController')

const router = express.Router();

//Users API
router.post('/register', createUser);
router.post('/login', userLogin);

//Books API
router.post('/books', authentication, authorization, createBook);
router.get('/books', authentication, getBook);
router.get('/books/:bookId', authentication, getBookWithReview);
router.put('/books/:bookId', authentication, authorization, updateBooks)
router.delete('/books/:bookId', authentication, authorization, deleteBook);

// Review API
router.post('/books/:bookId/review', bookReview)
router.put('/books/:bookId/review/:reviewId', updateReview)
router.delete('/books/:bookId/review/:reviewId', deleteReview)


module.exports = router