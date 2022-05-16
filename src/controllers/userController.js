const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const validator = require("../utils/validation");




//    Post/Register  //////////////////////////////////////////////////////////////////////////////////


const createUser = async (req, res) => {

  try {

    let data = req.body;

    //Validate the Body

    if (!validator.isValidBody(data)) {
      return res.status(400).send({ status: false, message: "Enter user details" });
    }

    //check the title  

    if (!data.title) {
      return res.status(400).send({ status: false, message: "Title is required" });
    }

    //check the name
    if (!data.name) {
      return res.status(400).send({ status: false, message: "Name is required" });
    }

    //check the Phone

    if (!data.phone) {
      return res.status(400).send({ status: false, message: "Mobile number is required" });
    }

    //check the email

    if (!data.email) {
      return res.status(400).send({ status: false, message: "Email ID is required" });
    }

    //check the password

    if (!data.password) {
      return res.status(400).send({ status: false, message: "Password is required" });
    }

    //Validate the title

    if (validator.validTitle(data.title)) {
      return res.status(400).send({ status: false, message: "Title should be one of Mr, Mrs or Miss" });
    }

    //Validate  the name

    if (validator.validString(data.name)) {
      return res.status(400).send({ status: false, message: "Name should be valid and should not contains any numbers" });
    }

    //Validate the mobile number

    if (validator.validMobileNum(data.phone)) {
      return res.status(400).send({ status: false, message: "Enter a valid phone number" });
    }

    //Validate the email

    if (validator.validEmail(data.email)) {
      return res.status(400).send({ status: false, message: "Enter a valid email-id" });
    }

    //Validate the password

    if (validator.validPwd(data.password)) {
      return res.status(400).send({ status: false, message: "Password should be 8-15 characters long and must contain one of 0-9,A-Z,a-z and special characters" });
    }


    if (validator.isValidObjectType(data.address)) {
      return res.status(400).send({ status: false, message: "Enter address in a object with 'street','city' and 'pincode' as keys" })
    }

  
    // Cheking duplicate Entry Of User 
    let duplicateEntries = await userModel.find();
    let duplicateLength = duplicateEntries.length

    if (duplicateLength != 0) {

      // Checking duplicate phone
      const duplicatePhone = await userModel.findOne({ phone: data.phone });
      if (duplicatePhone) {
        return res.status(400).send({ status: false, msg: "User phone number already exists" });
      }

      // Checking duplicate email
      const duplicateEmail = await userModel.findOne({ email: data.email });
      if (duplicateEmail) {
        return res.status(400).send({ status: false, msg: "User emailId already exists" });
      }

    }


    //Password Encryption 

    data.password = await bcrypt.hash(data.password, 10);


    // Finally the registration of User is successful

    let userData = await userModel.create(data);

    res.status(201).send({ status: true, message: "User created successfully", data: userData });

  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }

};



//    Post/login  ///////////////////////////////////////////////////////////////////////////////////



const userLogin = async function (req, res) {

  try {

    let data = req.body;

    //Validate the body

    if (!validator.isValidBody(data)) {
      return res.status(400).send({ status: false, message: "Enter user details" });
    }

    //Check the email

    if (!data.email) {
      return res
        .status(400)
        .send({ status: false, message: "Email ID is required" });
    }

    //check the password

    if (!data.password) {
      return res
        .status(400)
        .send({ status: false, message: "Password is required" });
    }

    //Validate the email

    if (validator.validEmail(data.email)) {
      return res.status(400).send({ status: false, message: "Enter a valid email-id" });
    }

    //Validate the password

    if (validator.validPwd(data.password)) {
      return res.status(400).send({ status: false, message: "Enter a valid password" });
    }

    //Email check

    const checkValidUser = await userModel.findOne({ email: data.email });

    if (!checkValidUser) {
      return res
        .status(401)
        .send({ status: false, msg: "Email Id is not correct " });
    }

    //Password check

    let checkPassword = await bcrypt.compare(data.password, checkValidUser.password);

    if (!checkPassword) {
      return res
        .status(401)
        .send({ status: false, msg: "Password is not correct" });
    }

    // token generation for the logged in user 

    let token = jwt.sign(
      {
        userId: checkValidUser._id.toString(),
        iat: Math.floor(Date.now() / 1000), //issue date
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24//expiries in 1 hr
      },
      "Books-Management"
    );

    //set token to the header

    res.setHeader('x-api-key', token);

    res.status(200).send({ status: true, msg: "Successfully Login", data: token });

  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createUser, userLogin };
