var express = require("express");
var shopRouter = express.Router();
var bodyParser = require("body-parser");

const mongoose = require('mongoose');
const multer = require('multer');
const csvParser = require('csv-parser');


var VerifyToken = require("../auth/VerifyToken");

const fs = require('fs');
const stream = require('stream');



// Define MongoDB schema
const pricingRecordSchema = new mongoose.Schema({
  store_id: String,
  product_name: String,
  sku: String,
  price: Number,
  date: Date,
});

const PricingRecord = mongoose.model('PricingRecord', pricingRecordSchema);

// Set up file upload using multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


shopRouter.use(bodyParser.json());


var shop = require("./Shop");
var foodHelper = require("./shop_helper");

var shop_helper = require("./shopModule");


var userHelper = require("../authValidation/userHelper");
let globlData = [];
// CREATES A NEW food

shopRouter.post("/shop", async function (req, res) {
  console.log(req.body);
  foodHelper.createshop(req.body, null).then((response) => {
    console.log(response);
    res.status(200).send(response);
  });
});


var jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens
var config = require("../config"); // get our config file



// RETURNS ALL THE foods IN THE DATABASE
// VerifyToken;
shopRouter.get("/getAllStoreItems", VerifyToken, async function (req, res) {
  var token = req.headers["auth-header"];
  console.log(token)

  jwt.verify(token, config.secret, async function (err, decoded) {
    if (err)
      return res
        .status(200)
        .send({
          auth: false,
          message: "Failed to authenticate token.",
          statusCode: 401,
        });

    // if everything is good, save to request for use in other routes
    req.userId = decoded.id;
    console.log(req.userId)
    await shop_helper.getAllshopsItems(req.userId).then((response) => {
      res.status(200).send(response);
    });
  });

});






// Define API endpoint for file upload
shopRouter.post('/upload', upload.single('file'), (req, res) => {
  console.log("uploading", req.body.data)
  const fileBuffer = req.file.buffer.toString('utf-8');
  const records = [];
  const readableStream = new stream.Readable();
  readableStream.push(fileBuffer);
  readableStream.push(null); // Mark the end of the stream

  // Parse CSV and convert it to an array of objects



  var token = req.headers["auth-header"];
  console.log(token)

  jwt.verify(token, config.secret, async function (err, decoded) {
    if (err)
      return res
        .status(500)
        .send({
          auth: false,
          message: "Failed to authenticate token.",
          statusCode: 401,
        });

    // if everything is good, save to request for use in other routes
    req.userId = decoded.id;
    console.log(req.userId)
    readableStream
      .pipe(csvParser({ headers: true }))
      .on('data', (data) => {
        const mappedData = {
          store_id: data._0,
          product_name: data._1,
          sku: data._2,
          price: data._3,
          date: data._4,
        };

        // Add storeId to each record
        // mappedData.storeId = storeId;
        records.push(mappedData);
        // records.push(data);
      })
      .on('end', () => {
        // console.log(records)
        shop_helper.createshop(records, req.userId).then((response) => {
          // console.log(response);
          res.status(200).send(response);
        });
      });
  });




});






// Update a product by _id
shopRouter.put('/updateProduct', async (req, res) => {
  try {


    var token = req.headers["auth-header"];
    console.log(req.body)

    jwt.verify(token, config.secret, async function (err, decoded) {
      if (err)
        return res
          .status(500)
          .send({
            auth: false,
            message: "Failed to authenticate token.",
            statusCode: 401,
          });


      // const { shopId } = req.params;
      const updatedProduct = req.body; // Assuming the updated data is sent in the request body

      shop_helper.updateShop({ shopId: decoded.id, productId: req.body._id }, updatedProduct).then((response) => {
        console.log(response);
        res.status(200).send(response);
      });
    })

  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a product by _id
// shopRouter.delete('/deleteProduct/:shopId/:productId', async (req, res) => {
//   try {
//     const { shopId, productId } = req.params;

//     const result = await ShopData.findOneAndUpdate(
//       { shop_id: shopId },
//       { $pull: { data: { _id: productId } } },
//       { new: true }
//     );

//     res.json({ message: 'Product deleted successfully', data: result });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


// Update a product by _id
shopRouter.delete('/deleteProduct', async (req, res) => {
  try {


    var token = req.headers["auth-header"];
    console.log(req.body)

    jwt.verify(token, config.secret, async function (err, decoded) {
      if (err)
        return res
          .status(500)
          .send({
            auth: false,
            message: "Failed to authenticate token.",
            statusCode: 401,
          });


      // const { shopId } = req.params;
      const updatedProduct = req.body; // Assuming the updated data is sent in the request body

      shop_helper.deleteShop({ shopId: decoded.id, productId: req.body._id }, updatedProduct).then((response) => {
        console.log(response);
        res.status(200).send(response);
      });
    })

  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = shopRouter;
