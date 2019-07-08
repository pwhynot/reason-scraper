const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const logger = require("morgan");
const exphbs = require("express-handlebars");

const db = require("./models");

const PORT = process.env.PORT || 3000;

const app = express();

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true}));
app.use(express.json());

app.use(express.static("views"));

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true
});

require("./routes/htmlRoutes");
  

  

  app.get("/scrape", function(req, res) {
    axios.get("https://reason.com/stossel/").then(function(response) {
      var $ = cheerio.load(response.data);
      $("h4").each(function(i, element) {
        var result = {};
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

        db.Article.create(result)
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {
          console.log(err);
        })
      console.log(result);
      });

      res.send("Scrape Complete!");
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