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
    res.send("welcome to book-bag API.visit https://github.com/tajud99n/bookbag.git for more documentation");
});

// Books Routes
app.post('/books', authenticate, (req, res) => {
    var book = new Book({
        title: req.body.title,
        author: req.body.author,
        isbn: req.body.isbn,
        rating: req.body.rating,
        _creator: req.user._id
    });

    book.save().then((book) => {
        res.send(book);        
    }).catch((err) => {
        res.status(400).send();
    });
});

app.get("/books", authenticate, (req, res) => {
    Book.find({_creator: req.user._id}).then((books) => {
        res.send({ books });
    }).catch((err) => {
        res.status(404).send(err);
    });
});

app.get("/books/all", (req, res) => {
    Book.find().then((books) => {
        res.send({ books });
    }).catch((err) => {
        res.status(404).send(err);
    });
});

app.get('/books/:id', authenticate, (req, res) => {
    var bookID = req.params.id;

    if (!ObjectID.isValid(bookID)) {
        return res.status(404).send();
    }

    Book.findOne({_id: bookID, _creator: req.user.id}).then(book => {
        if (!book) {
            return res.status(404).send();
        }
        res.send({ book });
    }).catch((err) => {
        res.status(404).send();
    });
});

app.patch('/books/:id', authenticate, (req, res) => {
    var bookID = req.params.id;
    var body = _.pick(req.body, ['title', 'author', 'isbn', 'rating']);

    if (!ObjectID.isValid(bookID)) {
        return res.status(404).send();
    }

    Book.findOne({_id: bookID, _creator: req.user.id}).then((book) => {
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

        return Book.findOneAndUpdate({_id: bookID, _creator: req.user.id}, { $set: body }, { new: true });
    }).then((book) => {
            if (!book) {
                return res.status(404).send();
            }

            res.send({
                book
            });
        }).catch((err) => {
        res.status(400).send();
    });
});

app.delete('/books/:id', authenticate, (req, res) => {
    var bookID = req.params.id;

    if (!ObjectID.isValid(bookID)) {
        return res.status(404).send();
    }

    Book.findOneAndDelete({_id: bookID, _creator: req.user.id}).then((book) => {
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

app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then(token => {
            res.header('x-auth', token).send(user);
        });
    }).catch((err) => {
        res.status(400).send();
    });
});

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }).catch(err => res.status(400).send());
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};