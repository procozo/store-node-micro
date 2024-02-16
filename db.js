var mongoose = require("mongoose");
mongoose
  .connect("mongodb+srv://test:9WErW5oL7MAQXyVZ@vinayak.syeubam.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false, // Set this option to false
  })
  .then((res) => {
    console.log("connected to MongoDB");
  });


