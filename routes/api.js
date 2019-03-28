/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

const { expect } = require("chai");
const { ObjectID } = require("mongodb");

module.exports = (app, collection) => {
  app
    .route("/api/books")
    .get((req, res) => {
      collection
        .find()
        .toArray()
        .then(items => {
          items.map(result => {
            result.commentcount = result.comments.length;
            delete result.comments;
          });
          return res.json(items);
        })
        .catch(err => console.error(`Failed to find documents: ${err}`));
    })

    .post((req, res) => {
      const { title } = req.body;
      if (!title) return res.send("missing title");
      return collection
        .insertOne({ title, comments: [] })
        .then(result => {
          res.send(result.ops[0]);
        })
        .catch(err => console.error(`Failed to insert item: ${err}`));
    })

    .delete((req, res) => {
      // if successful response will be 'complete delete successful'
      collection
        .deleteMany({})
        .then(() => res.send("complete delete successful"));
    });

  app
    .route("/api/books/:id")
    .get((req, res) => {
      const bookid = req.params.id;

      collection
        .findOne({ _id: ObjectID(bookid) })
        .then(result => {
          if (!result) return res.send("no book exists");

          return res.json(result);
        })
        .catch(err => console.error(`Failed to find document: ${err}`));
    })

    .post((req, res) => {
      const bookid = req.params.id;
      const { comment } = req.body;

      collection
        .findOneAndUpdate(
          { _id: ObjectID(bookid) },
          { $push: { comments: comment } },
          { returnOriginal: false }
        )
        .then(updatedDocument => {
          return res.json(updatedDocument.value);
        })
        .catch(err =>
          console.error(`Failed to find and update document: ${err}`)
        );
    })

    .delete((req, res) => {
      const bookid = req.params.id;
      // if successful response will be 'delete successful'
      collection.deleteOne({ _id: bookid }).then(() => {
        return res.send("delete successful");
      });
    });
};
