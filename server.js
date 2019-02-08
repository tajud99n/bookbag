require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _ = require('lodash');

var { mongoose } = require('./database/mongoose');
var Book = require('./models/book');
var User = require('./models/user');
var { authenticate } = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.get('/', (req, res) => {
    var msg = "welcome";
    res.send({msg});
});

// Books Routes
app.post('/books', (req, res) => {
    var book = new Book({
        title: req.body.title,
        author: req.body.author,
        isbn: req.body.isbn,
        rating: req.body.rating
    });

    book.save().then((book) => {
        res.send(book);        
    }).catch((err) => {
        res.status(400).send();
    });
});

app.get("/books", (req, res) => {
    Book.find().then((books) => {
        res.send({ books });
    }).catch((err) => {
        res.status(404).send(err);
    });
});

app.get('/books/:id', (req, res) => {
    var bookID = req.params.id;

    if (!ObjectID.isValid(bookID)) {
        return res.status(404).send();
    }

    Book.findById(bookID).then(book => {
        if (!book) {
            return res.status(404).send();
        }
        res.send({ book });
    }).catch((err) => {
        res.status(404).send();
    });
});

app.patch('/books/:id', (req, res) => {
    var bookID = req.params.id;
    var body = _.pick(req.body, ['title', 'author', 'isbn', 'rating']);

    if (!ObjectID.isValid(bookID)) {
        return res.status(404).send();
    }

    Book.findById(bookID).then((book) => {
        if (!book) {
            return res.status(404).send();
        }

        if (body.title) {
            book.title = body.title
        } else if (body.author) {
            book.author = body.author;
        } else if (body.isbn) {
            book.isbn = body.isbn;
        } else if (body.rating) {
            book.rating = body.rating;
        }

        Book.findByIdAndUpdate(bookID, {$set: body}, {new: true}).then((book) => {
            if (!book) {
                return res.status(404).send();
            }

            res.send({ book });
        }).catch((err) => {
            res.status(400).send();
        });
    }).catch((err) => {
        res.status(400).send();
    });
});

app.delete('/books/:id', (req, res) => {
    var bookID = req.params.id;

    if (!ObjectID.isValid(bookID)) {
        return res.status(404).send();
    }

    Book.findByIdAndDelete(bookID).then((book) => {
        if (!book) {
            return res.status(404).send();
        }
        
        res.send({book});
    }).catch((err) => {
        res.status(400).send();
    });
});

// Users
app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);
    
    user.save().then(() => {
        return user.generateAuthToken();       
    }).then(token => {
        res.header('x-auth', token).send(user);
    }).catch((err) => {
        res.status(400).send(err);
    });
});



app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};