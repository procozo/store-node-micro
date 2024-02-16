var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  registeredDate: Date,
  type: String,
});
UserSchema.plugin(uniqueValidator);
mongoose.model("User", UserSchema);

module.exports = mongoose.model("User");
