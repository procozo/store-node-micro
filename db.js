var mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false, // Set this option to false
  })
  .then((res) => {
    console.log("connected to MongoDB");
  });


