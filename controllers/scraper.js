const express = require("express");
const path = require("path");
const cheerio = require("cheerio");

const Note = require("../models/Note.js");
const Article = require("../models/Article.js");

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