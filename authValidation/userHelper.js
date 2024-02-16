var User = require("../user/User");

var multer = require("multer");

module.exports = {
  getUserDetails: (userId) => {
    return new Promise((resolve, reject) => {
      User.findById(userId, { password: 0 }, function (err, user) {
        if (err)
          //   return res.status(500).send("There was a problem finding the user.");
          resolve({
            message: "There was a problem finding the user",
            statusCode: 500,
          });
        if (!user)
          resolve({
            message: "No user Found",
            statusCode: 404,
          });
        resolve({
          message: "user Found",
          statusCode: 200,
          result: user,
        });
      });
    });
  },

  getAllUseres: (userId) => {
    return new Promise((resolve, reject) => {
      User.find({}, { password: 0 }, function (err, user) {
        if (err)
          //   return res.status(500).send("There was a problem finding the user.");
          resolve({
            message: "There was a problem finding the user",
            statusCode: 500,
          });
        if (!user)
          resolve({
            message: "No user Found",
            statusCode: 404,
          });
        resolve({
          message: "user Found",
          statusCode: 200,
          result: user,
        });
      });
    });
  },
  updateUserDetails: (id, data) => {
    console.log(id, data);
    return new Promise((resolve, reject) => {
      User.findByIdAndUpdate(id, data, { new: true }, function (err, user) {
        if (err) resolve(err);
        resolve({ message: "Added Data to backend", statusCode: 200 });
      });
    }).catch((er) => reject(err));
  },

  updateCartCompleteDetails: (id, data) => {
    console.log(id, data);
    return new Promise((resolve, reject) => {
      User.findByIdAndUpdate(id, data, { new: true }, function (err, user) {
        if (err) resolve(err);
        resolve({ message: "Added Data to backend", statusCode: 200 });
      });
    }).catch((er) => reject(err));
  },

  updateUserCartDetails: async (id, data) => {
    console.log(id, data);
    var usersProjection = {
      __v: false,
      createdBy: false,
    };
    // console.log(req);
    return new Promise(async (resolve, reject) => {
      await User.findById(id, "cartArray", function (err, cartData) {
        if (err)
          return res.status(500).send("There was a problem finding the user.");
        if (!cartData) return res.status(404).send("No user found.");

        let quantity = 0;

        let status = cartData.cartArray.find((el) => {
          console.log(el);
          if (el._id === data.cartArray[0]._id) {
            el.quantity = data.cartArray[0].quantity;

            return true;
          } else {
          }
        });
        if (status != undefined) {
        } else {
          cartData.cartArray.push(data.cartArray[0]);
        }
        if (cartData.cartArray.length > 1) {
          cartData.cartArray.map((val, index) => {
            quantity = quantity + val.quantity;
          });
        } else {
          quantity = cartData.cartArray[0].quantity;
        }
        if (data.cartArray[0].quantity === 0) {
          console.log("no data need to remove", cartData.cartArray);
          let index = cartData.cartArray.findIndex((el) => el.quantity === 0);
          // console.log(index);
          cartData.cartArray.splice(index, 1);
          console.log(index);
        }
        User.findByIdAndUpdate(id, cartData, { new: true }, function (
          err,
          user
        ) {
          if (err) resolve(err);
          resolve({
            message: "Added Data to backend",
            total: quantity,
            statusCode: 200,
          });
        });
      });
    }).catch((er) => reject(err));
  },
};
