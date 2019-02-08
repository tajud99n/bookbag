const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const Book = require('./../../models/book');
const User = require('./../../models/user');

const books = [{
        _id: new ObjectID(),
        title: "dummy book one",
        author: "dummy author one",
        isbn: "123-00994",
        rating: 5
    },
    {
        _id: new ObjectID(),
        title: "dummy book two",
        author: "dummy author two",
        isbn: "123-00s-555994",
        rating: 2
    }
];

const seedBooks = done => {
    Book.deleteMany({})
        .then(() => {
            Book.insertMany(books);
        })
        .then(() => done());
};

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
    _id: userOneId,
    email: "book@example.com",
    password: "password",
    tokens: [{
        access: "auth",
        token: jwt.sign({ _id: userOneId, access: 'auth' }, "appSecret").toString()
    }]
}, {
    _id: userTwoId,
    email: "john@doe.com",
    password: "password"
}];

const seedUsers = done => {
    User.deleteMany({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo])
    }).then(() => done());
};

module.exports = {books, seedBooks, users, seedUsers};