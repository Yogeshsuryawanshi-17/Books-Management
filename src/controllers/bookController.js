
const bookModel = require('../models/bookModel')
const userModel = require('../models/userModel')
const reviewModel = require('../models/reviewModel')
const validator = require('../utils/validation')





//  POST /books  //////////////////////////////////////////////////////////////////////////////////////////





const createBook = async function (req, res) {
  try {


    const Bookbody = req.body;


    const query = req.query;
    if (validator.isValidBody(query)) {
      return res.status(400).send({ status: false, msg: "Invalid parameters" });
    }


    //Validate body
    if (!validator.isValidBody(Bookbody)) {
      return res.status(400).send({ status: false, msg: "body should not be empty" });
    }

    const { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt } = Bookbody;

    //Validate title
    if (!validator.isValid(title)) {
      return res.status(400).send({ status: false, msg: "Book title is required" });
    }

    //Validate excerpt
    if (!validator.isValid(excerpt)) {
      return res.status(400).send({ status: false, msg: "Book excerpt is required" });
    }

    //Validate userId
    if (!validator.isValid(userId)) {
      return res.status(400).send({ status: false, msg: "userId is required" });
    }


    // Validation of userId
    if (!validator.isValidObjectId(userId)) {
      return res.status(400).send({ status: false, msg: "Invalid userId" });
    }


    //Validate ISBN
    if (!validator.isValid(ISBN)) {
      return res.status(400).send({ status: false, msg: "ISBN is required" });
    }

    // Validation of ISBN
    if (!validator.isValidateISBN(ISBN)) {
      return res.status(400).send({ status: false, msg: "ISBN validation is required" });
    }

    //Validate category
    if (!validator.isValid(category)) {
      return res.status(400).send({ status: false, msg: "category is required" });
    }

    //Validate subcategory
    if (!validator.isValid(subcategory)) {
      return res.status(400).send({ status: false, msg: "subcategory is required" });
    }

    //Validate releasedAt
    if (!validator.isValid(releasedAt)) {
      return res.status(400).send({ status: false, msg: "releasedAt is required" });
    }

    // Validation of releasedAt
    if (validator.isValidDate(releasedAt)) {
      return res.status(400).send({ status: false, message: "Enter a valid released date in (YYYY-MM-DD) format" })
    }


    // Cheking duplicate Entry Of Book 
    let duplicateEntries = await bookModel.find();
    let duplicateLength = duplicateEntries.length

    if (duplicateLength != 0) {

      // Checking duplicate title
      const duplicateTitle = await bookModel.findOne({ title: title });
      if (duplicateTitle) {
        return res.status(400).send({ status: false, msg: `${title} title already exists` });
      }


      //Checking  duplicate Excerpt       
      const duplicateExcerpt = await bookModel.findOne({ excerpt: excerpt });
      if (duplicateExcerpt) {
        return res.status(400).send({ status: false, msg: `${excerpt} excerpt already exists` });
      }


      // Checking duplicate ISBN
      const duplicateISBN = await bookModel.findOne({ ISBN: ISBN });
      if (duplicateISBN) {
        return res.status(400).send({ status: false, msg: `${ISBN} ISBN already exists` });
      }

    }

    let user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).send({ status: false, msg: "UserId not found" })
    }


    const bookData = {
      title,
      excerpt,
      userId,
      ISBN,
      category,
      subcategory,
      reviews,
      releasedAt: releasedAt ? releasedAt : "releasedAt is required",
    };

    let savedBook = await bookModel.create(bookData);
    return res.status(201).send({ status: true, msg: "New book created  successfully ", data: savedBook })
  }
  catch (err) {
    return res.status(500).send({ status: false, msg: "Error", error: err.message })
  }
}

module.exports.createBook = createBook




//  GET /books ///////////////////////////////////////////////////////////////////////////////////////////////

const getBook = async function (req, res) {
  try {
    const queryParams = req.query;

    const body = req.body;

    if (validator.isValidBody(body)) {
      return res.status(400).send({ status: false, msg: "Body must not be present" })
    }


    if (!validator.isValidBody(queryParams)) {
      return res.status(400).send({ status: false, msg: "Query filter  must be present" })
    }

    let filter = {
      isDeleted: false
    }

    if (req.query.userId) {
      if (!(validator.isValid(req.query.userId) && validator.isValidObjectId(req.query.userId))) {
        return res.status(400).send({ status: false, msg: "UserId not valid" })
      }
      filter["userId"] = req.query.userId
    }

    if (req.query.category) {
      if (!validator.isValid(req.query.category)) {
        return res.status(400).send({ status: false, msg: "Book Category not valid" })
      }
      filter["category"] = req.query.category
    }

    if (req.query.subcategory) {
      if (!(validator.isValid(req.query.subcategory))) {
        return res.status(400).send({ status: false, msg: "subcategory not valid" })
      }
      filter["subcategory"] = req.query.subcategory
    }



    let bookData = await bookModel.find(filter).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 });

    const bookDetail = bookData.sort(function (a, b) {
      if (a.title.toLowerCase() < b.title.toLowerCase()) { return -1 };
      if (a.title.toLowerCase() > b.title.toLowerCase()) { return 1 };
      return 0;
    })

    if (bookData.length > 0) {
      return res.status(200).send({ status: true, count: bookDetail.length, message: 'Books list', data: bookDetail })
    } else {
      return res.status(404).send({ status: false, msg: "Book not found" })
    }

  } catch (err) {
    return res.status(500).send({ status: false, msg: "Error", error: err.message })
  }
}

module.exports.getBook = getBook





//  GET /books/:bookId ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const getBookWithReview = async function (req, res) {

  try {
    const _id = req.params.bookId;


    // Book Id not valid
    if (!validator.isValidObjectId(_id)) {
      return res.status(400).send({ status: false, msg: "BookId is not valid" })
    }


    // Body must not be present
    const body = req.body;
    if (validator.isValidBody(body)) {
      return res.status(400).send({ status: false, msg: "Body must not be present" })
    }

    // Query must not be present
    const query = req.query;
    if (validator.isValidBody(query)) {
      return res.status(400).send({ status: false, msg: "Query parameters must not be present" });
    }


    // if (Object.keys(_id).length === 0) {
    //   return res.status(400).send({ status: false, msg: "Invalid request" });
    // }


    // Book Details with Book Id
    let bookDetails = await bookModel.findOne({ _id, isDeleted: false });
    if (!bookDetails) {
      return res.status(404).send({ status: false, message: "No book found" });
    }

    const { title, excerpt, userId, ISBN, category, subcategory, releasedAt, deletedAt, isDeleted, reviews, createdAt, updatedAt } = bookDetails;

    let reviewData = await reviewModel.find({ bookId: _id, isDeleted: false });

    const book = { _id, title, excerpt, userId, category, subcategory, isDeleted, reviews: reviewData.length, deletedAt, releasedAt, createdAt, updatedAt, reviewsData: reviewData };

    return res.status(200).send({ status: true, data: book })
  }

  catch (err) {
    return res.status(500).send({ status: false, msg: "Error", error: err.message })
  }
}

module.exports.getBookWithReview = getBookWithReview






// PUT /books/:bookId  - update ///////////////////////////////////////////////////////////////////////////////////////////////////

const updateBooks = async function (req, res) {

  try {

    let bookId = req.params.bookId
    if (!bookId) return res.status(400).send({ status: false, msg: "bookId is required" })

    let body = req.body

    //Validate body

    if (!validator.isValidBody(body)) {
      return res.status(400).send({ status: false, msg: "body should not be empty" });
    }

    // Query must not be present
    const query = req.query;
    if (validator.isValidBody(query)) {
      return res.status(400).send({ status: false, msg: "Invalid parameters" });
    }


    let { title, excerpt, releasedAt, ISBN, subcategory } = req.body

    let titleExist = await bookModel.findOne({ title: title })
    if (titleExist) return res.status(400).send({ status: false, msg: "title exist already" })

    let isbnExist = await bookModel.findOne({ ISBN: ISBN })
    if (isbnExist) return res.status(400).send({ status: false, msg: "ISBN exist already" })

    let excerptExist = await bookModel.findOne({ excerpt: excerpt })
    if (excerptExist) return res.status(400).send({ status: false, msg: "excerpt exist already" })


    // Validation of releasedAt
    if (validator.isValidDate(releasedAt)) {
      return res.status(400).send({ status: false, msg: "Enter a valid released date in (YYYY-MM-DD) format" })
    }


    let data = await bookModel.findById(bookId)
    if (!data.isDeleted == false) {
      return res.status(404).send({ status: false, msg: "data is already deleted" })
    }
    if (subcategory) {
      let dbsubcategory = data.subcategory;
      subcategory = [...dbsubcategory, subcategory];
      subcategory = subcategory.filter((val, index, arr) => arr.indexOf(val) == index)
      req.body.subcategory = subcategory

    }
    let updatedBook = await bookModel.findByIdAndUpdate({ _id: bookId, isDeleted: false }, req.body, { new: true })
    return res.status(200).send({ status: true, data: updatedBook })

  }
  catch (err) {
    return res.status(500).send({ status: false, msg: "Error", error: err.message })
  }
}

module.exports.updateBooks = updateBooks







// DELETE /books/:bookId ///////////////////////////////////////////////////////////////////////////////////////////////////////////////// //

const deleteBook = async function (req, res) {
  try {
    const bookId = req.params.bookId
    //Validate id
    if (!validator.isValidBody(bookId)) {
      return res.status(400).send({ status: false, msg: " book Id not present" });
    }

    if (!(validator.isValid(bookId) && validator.isValidObjectId(bookId))) {
      return res.status(400).send({ status: false, msg: "BookId not valid" })
    }

    let data = await bookModel.findById(bookId)
    if (data.isDeleted == true) {
      return res.status(404).send({ status: false, msg: "This book is already deleted" })
    }

    if (data.isDeleted == false) {

      await bookModel.findByIdAndUpdate({ _id: bookId, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true })

      return res.status(200).send({ status: true, msg: "Book deleted successfully" })
    }
  }
  catch (err) {
    return res.status(500).send({ status: false, msg: "Error", error: err.message })
  }
}

module.exports.deleteBook = deleteBook



