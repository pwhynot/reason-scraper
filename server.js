const express = require("express");
const mongoose = require("mongoose");

const axios = require("axios");
const cheerio = require("cheerio");
const logger = require("morgan");


const db = require("./models");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//app.use(express.static("public"));

app.use(express.static(process.cwd() + "/public"));
const exphbs = require("express-handlebars");
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

mongoose.connect(MONGODB_URI).then(() => {
    console.log("Mongoose is connected");
}, (err) => console.log(err));

mongoose.connection.once("open", () => console.log("Good to go!"))
    .on("error", (error) => {
        console.warn("Warning", error);
    });
  
  //require("./routes/htmlRoute")(app);

  const routes = require("./controllers/scraper");
  app.use("/", routes);
 
  
  app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
  });