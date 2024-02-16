var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
// var env = require("../env/config");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var Shop = require("./Shop");
let shopPerticularData = [];
var totalArray = [];
module.exports = {
  createshop: (data, user) => {
    // console.log(data);
    return new Promise((resolve, reject) => {
      Shop.create(data, function (err, shop) {
        if (err) resolve(err);
        resolve({ message: "success", statusCode: 200, result: shop });
      });
      //   resolve(data);
    }).catch((err) => console.error(err));
  },
  updateshopDetails: (data) => {
    try {
      // console.log(data._id);
      return new Promise((resolve, reject) => {
        // console.log("promise");
        Shop.findByIdAndUpdate({ _id: data._id }, data, function (err, doc) {
          if (err) {
            // err: any errors that occurred
            console.log(err);
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    } catch (error) { }
  },

  getAllshops: () => {
    var usersProjection = {
      _id: true,
    };
    return new Promise((resolve, reject) => {
      Shop.find(
        {},
        function (err, shops) {
          if (err) resolve(err);
          console.log(shops);
          resolve(shops);
        }
      );
    }).catch((err) => reject(err));
  },
  getAllYourshops: (userId) => {
    shopPerticularData = [];
    console.log(userId);
    return new Promise((resolve, reject) => {
      //   console.log(shop.find({}).project({ _id: 1 }).toArray());

      shop.find({}, function (err, shops) {
        if (err) resolve(err);
        shops.map((val) => {
          //   console.log(val.createdBy._id, userId);
          if (String(val.createdBy._id) === String(userId))
            shopPerticularData.push(val);
          // console.log(String(val.createdBy._id) === String(userId));
        });
        // console.log(shopPerticularData);
        resolve({
          message: "success",
          statusCode: 200,
          result: shopPerticularData,
        });
      });
    }).catch((err) => reject(err));
  },

  getshopById: (shopId) => {
    console.log(shopId);
    return new Promise((resolve, reject) => {
      Shop.findById(shopId, function (err, shops) {
        console.log(shops);
        if (err) resolve(err);
        if (!shops) resolve({ message: "not found", statusCode: 404 });
        resolve({ message: "found", data: shops, statusCode: 200 });
      });
    }).catch((err) => console.log(err));
  },
  getshopByName: (shopName) => {
    // console.log(shopName);
    return new Promise((resolve, reject) => {
      Shop.find({ shop_name: shopName }, function (err, shops) {
        console.log(shops);
        if (err) resolve(err);
        if (!shops) resolve({ message: "not found", statusCode: 404 });
        resolve(shops);
      });
    }).catch((err) => console.log(err));
  },

  deleteshopByID: (shopId) => {
    return new Promise((resolve, reject) => {
      shop
        .findByIdAndRemove(shopId, function (err, shop) {
          console.log("shop is", shop);
          if (err) resolve(err);
          if (shop === null) {
            resolve({ message: "not found", statusCode: 404 });
          } else {
            resolve({ message: "success", statusCode: 200, result: shop._id });
          }
        })
        .catch((err) => reject(err));
    });
  },
  updateshop: (id, data) => {
    return new Promise((resolve, reject) => {
      shop.findByIdAndUpdate(id, data, { new: true }, function (err, shop) {
        if (err) resolve(err);
        resolve({ message: "success", statusCode: 200, result: shop });
      });
    });
  },
}

