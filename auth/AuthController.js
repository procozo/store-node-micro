var express = require("express");
var authRouter = express.Router();
var bodyParser = require("body-parser");

var VerifyToken = require("./VerifyToken");
var tokenList = {};
// authRouter.use(bodyParser.urlencoded({ extended: false }));
authRouter.use(bodyParser.json());
const request = require("request-promise");

var User = require("../user/User");
var jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens
var bcrypt = require("bcryptjs");
var config = require("../config"); // get config file
var userHelper = require("../authValidation/userHelper");
var foodData = [];

authRouter.post("/login", async function (req, res) {
  console.log(req.body);
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) return res.status(500).send("Error on the server.");
    // console.log(user);
    if (!user)
      return res
        .status(200)
        .send({ message: "User not found", sendCode: 500, error: user });

    // check if the password is valid
    // console.log(user.password, req.body.password)
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    console.log(passwordIsValid)
    if (!passwordIsValid)
      return res.status(401).send({ auth: false, token: null });

    // if user is found and password is valid
    // create a token
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 84600, // expires in 24 hours
    });
    // Create Refresh Token
    const refreshToken = jwt.sign({ id: user._id }, config.refreshTokenSecret, {
      expiresIn: 84600,
    });

    // return the information including token as JSON
    res.status(200).send({
      message: "successfully logged in ",
      auth: true,
      statusCode: 200,
      token: token,
      userID: user._id,
      type: user.type,
      refreshToken,
    });
  });
});

authRouter.get("/logout", function (req, res) {
  res.status(200).send({ auth: false, token: null });
});

authRouter.post("/register", function (req, res) {
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  console.log(req.body);
  try {
    User.create(
      {
        email: req.body.email,
        password: hashedPassword,
        registeredDate: Date.now(),
        type: req.body.type
      },
      function (err, user) {
        if (err) {
          // console.log(err)
          return res.status(500).send({
            message: "you are allready registered",
            statusCode: "500",
            error: err
          });
        }

        var token = jwt.sign({ id: user._id }, config.secret, {
          expiresIn: 86400, // expires in 24 hours
        });

        const refreshToken = jwt.sign(
          { id: user._id },
          config.refreshTokenSecret,
          {
            expiresIn: 10000,
          }
        );
        const updateData = {
          token: token,
          refreshToken: refreshToken,
        };
        userHelper.updateUserDetails(user._id, updateData).then((response) => {
          if (response.statusCode === 200) {
            // res.status(200).send(response);
            res.status(200).send({
              message: "successfully Registered in ",
              update: response,
              auth: true,
              statusCode: 200,
              token: token,
              refreshToken: refreshToken,
            });
          } else {
            res.status(500).send(response);
          }
        });
        // return the information including token as JSON
      }
    );
  } catch (e) {
    console.log(e);
    res.send(e);
  }
});

authRouter.post("/userstatus", function (req, res) {
  // console.log(req.body);
  try {
    User.findOne(
      {
        email: req.body.email,
      },
      function (err, user) {
        if (err) {
          return res.status(200).send({
            message: "you are allready registered",
            statusCode: "403",
          });
        }
        if (user) {
          console.log(user);
          message = "user ";
          res.status(200).send({
            message: "User exists",
            statusCode: 200,
            status: true,
            data: req.body.email,
          });
        } else {
          message = "user doesn't exist";
          res.status(200).send({
            message: "User not exist",
            statusCode: 200,
            status: false,
            data: req.body.email,
          });
        }

        // return the information including token as JSON
      }
    );
  } catch (e) {
    console.log(e);
    res.send(e);
  }
});

authRouter.post("/check", (req, res) => {
  res.send(req.body);
});
authRouter.post("/token", VerifyToken, (req, res) => {
  // const postData = req.body;
  console.log(req.userId);
  User.findOne({ _id: req.userId }, function (err, user) {
    if (err) return res.status(500).send("Error on the server.");
    // console.log(user);
    if (user) {
      res.status(200).send({
        message: "Found ",
        result: user,
      });
    }
  });
  // refresh the damn token
  // const postData = req.body;
  // // if refresh token exists
  // if (postData.refreshToken && postData.refreshToken in tokenList) {
  //   const user = {
  //     email: postData.email,
  //     name: postData.name,
  //   };
  //   const token = jwt.sign(user, config.secret, {
  //     expiresIn: config.tokenLife,
  //   });
  //   const response = {
  //     token: token,
  //   };
  //   // update the token in the list
  //   tokenList[postData.refreshToken].token = token;
  //   res.status(200).json(response);
  // } else {
  //   res.status(404).send("Invalid request");
  // }
});

authRouter.put("/updateregister", VerifyToken, async function (req, res) {
  // console.log(req);
  await userHelper.updateUserDetails(req.userId, req.body).then((response) => {
    if (response.statusCode === 200) {
      res.status(200).send(response);
    } else {
      res.status(500).send(response);
    }
  });
});

authRouter.get("/me", VerifyToken, function (req, res, next) {
  // console.log(req);
  User.findById(req.userId, { password: 0 }, function (err, user) {
    if (err)
      return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");
    res.status(200).send(user);
  });
});

authRouter.get("/mycart", VerifyToken, function (req, res, next) {
  var usersProjection = {
    __v: false,
    createdBy: false,
  };
  // console.log(req);
  User.findById(req.userId, "cartArray", async function (err, user) {
    if (err)
      return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");
    let quantity = 0;
    let total = 0;
    console.log("user is", user);
    if (user.cartArray.length > 0) {
      user.cartArray.map((val) => {
        quantity = quantity + val.quantity;
        console.log(val.price, val.quantity);
        if (val.quantity > 0) total = total + val.price * val.quantity;
        console.log("quantituy added", quantity);
      });
    } else {
      quantity = 0;
    }
    res.status(200).send({
      message: "success",
      result: user,
      total: quantity,
      cartTotalAmount: total,
      statusCode: 200,
    });
  });
});

authRouter.get("/mycartfood", VerifyToken, async function (req, res, next) {
  var usersProjection = {
    __v: false,
    createdBy: false,
  };

  // console.log(req);
  User.findById(req.userId, "cartArray", async function (err, user) {
    if (err)
      return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");
    let quantity = 0;
    console.log("user is", user);

    if (user.cartArray.length > 0) {
      let cartLength = user.cartArray.length;
      // var items = Food.find({ _id: { $in: user.useritems } });
      // res.send(items.toArray());
      user.cartArray.map((val) => {
        foodHelper.getfoodById(val._id).then(async (response) => {
          // res.status(200).send(response);
          console.log(
            val.quantity,
            foodData.length,
            user.cartArray.length,
            val._id
          );
          // if (val.quantity !== 0) {
          response.quantity = val.quantity;
          await foodData.push(response);
          if (foodData.length === cartLength)
            await res.send({
              message: "success",
              statusCode: 200,
              result: foodData,
            });
          // }
          // else {
          //   response.quantity = val.quantity;
          //   cartLength--;
          //   // if (foodData.length === cartLength)
          //   //   res.send({
          //   //     message: "success",
          //   //     statusCode: 200,
          //   //     result: foodData,
          //   //   });
          // }
        });
        // foodData.push(quantity);
        quantity = quantity + val.quantity;
        console.log("quantituy added", quantity);
        // console.log(foodData);
      });
    } else {
      res.send({ message: "success", statusCode: 200, result: [] });
    }
    // console.log(foodData);
  });
});

authRouter.put("/updateCart", VerifyToken, async function (req, res) {
  // console.log(req);
  await userHelper
    .updateUserCartDetails(req.userId, req.body)
    .then((response) => {
      if (response.statusCode === 200) {
        res.status(200).send(response);
      } else {
        res.status(500).send(response);
      }
    });
});

authRouter.put("/replaceCart", VerifyToken, async function (req, res) {
  // console.log(req);
  await userHelper
    .updateCartCompleteDetails(req.userId, req.body)
    .then((response) => {
      if (response.statusCode === 200) {
        res.status(200).send(response);
      } else {
        res.status(500).send(response);
      }
    });
});

authRouter.post("/sendnotification", VerifyToken, async function (req, res) {
  // let _tokens = [
  //   "fJWCdObeS06mXGMSKfhY4r:APA91bHERhfaLdaeQg4UmU8vpbJ_viJzvl3XAFIyUotbtHHJI0zjAZTsynWDYThS4DQJCstRQ3xZO9C9RFpwPQdwQYgxxn-bZwispwC3fwvA5XHRIpbMj0baP0ZURpN22qxFGKJGBpU9",
  //   "eL_y89JVQNmo86r4pGIZRv:APA91bEEF-_r9es1oIRRVLgJdVpDhhmh_h35zhp_LKHOgAdPXY95CTUukqqtxvLXXeatcFWA8197xbVi_bq8qMx9l3edM6NrlrtcKcvzJkSvKiLsEykjgIa1WeKk4Hlk14dY9GED0pWn",
  //   "dHVS5tQKSjOT7YFRCBxjP8:APA91bFXh0SdB7G4f3RzWgGbXp8zQ3sdX3rcVnk9ajPBhvgKwa7mHcDX2-LFCwxnT5AKcvIs8vGYcMdxXgNUGZRaBuPkpoVCLSGV_f409sPgrSlhF5SXREGLqi7mEPWKwkjmmYjJTcdH",
  //   "cFbiq_O-Sq6VAVlxNxdW8k:APA91bGTxlSz9smJpyGndC2T_pJIXCaZramwvHIj2GkDaEZlHZsdsaX5mXw9ci08wBA_feucRSxDqDsFOeeKCCCXc0ou_jBg__iXGSazuBixyCCEoXhV7sYl1Qkh4NCHNPrMQPL7jC2_",
  // ];
  req.body.notificationbody.icon =
    "https://dfcimages.s3.ap-south-1.amazonaws.com/paneer+tikka.jpg";
  var data = {
    to: req.body.token,

    // notification: req.body.notificationbody,
    data: {
      image: req.body.notificationbody.image,
      message: req.body.notificationbody.title,
      // AnotherActivity: "True",
    },
    apns: {
      payload: {
        aps: {
          "mutable-content": 1,
        },
      },
      fcm_options: {
        image: req.body.notificationbody.image,
      },
    },
    notification: {
      body: req.body.notificationbody.body,
      title: req.body.notificationbody.title,
      image: req.body.notificationbody.image,
    },
    // data: {
    //   body: "Body of Your Notification in Data",
    //   title: "Title of Your Notification in Title",
    //   icon: "https://dfcimages.s3.ap-south-1.amazonaws.com/paneer+tikka.jpg",
    // },
    icon: "https://dfcimages.s3.ap-south-1.amazonaws.com/paneer+tikka.jpg",
  };
  let options = {
    method: "POST",
    uri: "https://fcm.googleapis.com/fcm/send",
    body: data,
    json: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.AUTH_KEY,
    },
  };
  request(options)
    .then(function (response) {
      res.status(200).json(response);
      // res.status(200).send(json(response));
    })
    .catch(function (err) {
      console.log(err);
      res.send({ message: "Message not sent", statusCode: 500 });
    });
});

authRouter.get("/getAllUsers", VerifyToken, async function (req, res) {
  await userHelper.getAllUseres().then((response) => {
    res.status(200).send(response);
  });
});
module.exports = authRouter;
