const jwt = require('jsonwebtoken');
const { isValidObjectId } = require('../utils/validation');
const Book = require('../models/bookModel');



const authentication = (req, res, next) => {
  try {
    let token = req.headers['x-Api-key'];
    if (!token) {
      token = req.headers['x-api-key'];
    }
    if (!token) return res.status(400).send({ status: false, message: "Token is missing" });

    let decodedToken = jwt.verify(token, "Books-Management");

    if (!decodedToken) return res.status(400).send({ status: false, message: "Token is incorrect" })

    next();
  } catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}




const authorization = async (req, res, next) => {
  try {
    let token = req.headers['x-Api-key'];
    token = req.headers['x-api-key'];

    let decodedToken = jwt.verify(token, "Books-Management");
    if (!decodedToken) return res.status(400).send({ status: false, message: "Token is incorrect" })

    let loggedInUser = decodedToken.userId;
    let userLogging;

    if (req.body.hasOwnProperty('userId')) {
      if (!isValidObjectId(req.body.userId)) return res.status(400).send({ status: false, message: "Enter a valid user id" });
      userLogging = req.body.userId;
    }
    if (req.params.hasOwnProperty('bookId')) {
      if (!isValidObjectId(req.params.bookId)) return res.status(400).send({ status: false, message: "Enter a valid book id" });
      let bookData = await Book.findById(req.params.bookId);
      if (!bookData) return res.status(400).send({ status: false, message: "Error! Please check book id and try again" });
      userLogging = bookData.userId.toString();
    }

    if (!userLogging) return res.status(400).send({ status: false, message: "User Id is required" });

    if (loggedInUser !== userLogging) return res.status(403).send({ status: false, message: 'Error, authorization failed' })
    next()
  } catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}
module.exports = { authentication, authorization };