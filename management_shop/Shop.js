var mongoose = require("mongoose");
const { object } = require("mongoose/lib/utils");
var shopSchma = new mongoose.Schema({
  shop_id: String,
  data: [{
    store_id: String,
    product_name: String,
    sku: String,
    price: String,
    date: String,
  }]
});
mongoose.model("store_data", shopSchma);

module.exports = mongoose.model("store_data");
