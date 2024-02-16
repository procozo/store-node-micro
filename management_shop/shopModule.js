var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var ShopData = require("./Shop");

module.exports = {
  createshop: (data, user) => {
    let creationdata = {
      shop_id: user,
      data: data
    }
    return new Promise((resolve, reject) => {


      ShopData.findOne({ shop_id: user }, function (err, shops) {
        // console.log(userID);
        // console.log(err)
        if (err) resolve(err);
        if (!shops) {
          ShopData.create(creationdata, function (err, shop) {
            if (err) resolve(err);
            resolve({ message: "success", statusCode: 200, result: shop });
          });
        }

        if (shops) {
          ShopData.findOneAndUpdate(
            { shop_id: user },
            { $set: { data: data } },
            { upsert: true, new: true },
            function (err, shop) {
              if (err) {
                console.error(err);
                resolve(err);
              }

              console.log(shop);
              resolve({ message: 'success', statusCode: 200, result: shop });
            }
          );
        }

      });



    }).catch((err) => console.error(err));
  },
  getAllshopsItems: (data) => {

    let userID = data;
    console.log(userID)
    return new Promise((resolve, reject) => {
      ShopData.findOne({ shop_id: userID }, function (err, shops) {
        if (err) resolve(err);
        if (!shops) resolve({ message: "not found", statusCode: 404 });
        if (shops) {
          let totalShops = shops.data ? shops.data.length - 1 : 0
          const uniqueStoreIds = new Set(shops.data.map(item => item.store_id));
          resolve({ message: "found", data: shops, total: totalShops, stores: uniqueStoreIds.size - 1, statusCode: 200 });
        }
      });


    }).catch((err) => reject(err));
  },

  updateShop: (data, updatedProduct) => {
    return new Promise(async (resolve, reject) => {
      console.log({ shop_id: data.shopId, 'data._id': data.productId }, updatedProduct)
      const result = await ShopData.findOneAndUpdate(
        { shop_id: data.shopId, 'data._id': data.productId },
        { $set: { 'data.$': updatedProduct } },
        // { new: true }
      );
      if (result) {
        resolve({ message: 'Product updated successfully', data: result, statusCode: 200 });
      } else {
        resolve({ message: 'Product not updated ', data: result, statusCode: 400 });
      }

    }
    )
  },
  deleteShop: (data, updatedProduct) => {
    return new Promise(async (resolve, reject) => {
      console.log({ shop_id: data.shopId, 'data._id': data.productId }, updatedProduct)

      const result = await ShopData.findOneAndUpdate(
        { shop_id: data.shopId },
        { $pull: { data: { _id: data.productId } } },
        { new: true }
      );
      if (result) {
        resolve({ message: 'Product Deleted successfully', data: result, statusCode: 200 });
      } else {
        resolve({ message: 'Product not updated ', data: result, statusCode: 400 });
      }

    }
    )
  }

};

