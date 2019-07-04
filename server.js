const express = require("express");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const axios = require("axios");
const cheerio = require("cheerio");
const logger = require("morgan");


const db = require("./models");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/reason-scraper";

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

mongoose.connect(MONGODB_URI).then(() => {
    console.log('Mongoose is connected');
}, (err) => console.log(err));

mongoose.connection.once('open', () => console.log('Good to go!'))
    .on('error', (error) => {
        console.warn('Warning', error);
    });

//figure out handlebars after scraper is working properly 
  //app.engine("handlebars", exphbs({
     // defaultLayout: "main"
    //})
 // );

  //app.set("view engine", "handlebars");
  
  require("./routes/htmlRoute")(app);
 
  app.get("/scrape", function(req, res) {
    axios.get("https://reason.com/").then(function(response) {
      var $ = cheerio.load(response.data);
      $("p.title").each(function(i, element) {
        var result = {};
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      db.Article.create(result)
        .then( dbArticle =>  {
          console.log(dbArticle);
          res.render("index", {this: title});
        })
        .catch(function (err) {
          console.log(err);
        });
      });

      res.send("Scrape Complete");
    });
  });

  app.get("/articles", function(req, res) {
    db.Article.find({})
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });
  
  app.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
      .populate("note")
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  app.post("/articles/:id", function(req, res) {
    db.Note.create(req.body)
      .then(function(dbNote) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  })

  app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
  });