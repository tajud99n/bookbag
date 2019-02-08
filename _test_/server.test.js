const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("./../server");
const Book = require("./../models/book");

const books = [
    {
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

beforeEach(done => {
    Book.deleteMany({})
        .then(() => {
            Book.insertMany(books);
        })
        .then(() => done());
});

describe("GET /", () => {
    it("should response with a 200", done => {
        request(app)
            .get("/")
            .expect(200)
            .expect((res) => {
                expect(res.body.msg).toBe("welcome");
            })
            .end(done);
    });
});

describe("POST /books", () => {
    it("should create a new book", done => {
        const book = {
            title: "book1",
            author: "author1",
            isbn: "12344",
            rating: 3
        };

        request(app)
            .post('/books')
            .send(book)
            .expect(200)
            .expect(res => {
                expect(res.body.title).toBe(book.title);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                var { title } = book;
                
                Book.find({title})
                    .then((result) => {
                        expect(result.length).toBe(1);
                        expect(result[0].title).toEqual(title);
                        done();
                    }).catch((err) => {
                        done(err);
                    });
            });
    });

    it("should not create a book if any of the required field is missing", done => {
        request(app)
            .post("/books")
            .send({})
            .expect(400)
            .end(done);
    });
});

describe("GET /books", () => {
    it("should get all the todos", done => {
        request(app)
            .get("/books")
            .expect(200)
            .expect(res => {
                expect(res.body.books.length).toBe(2);
            })
            .end(done);
    });
});

describe("GET /books/:id", () => {
    it("should return a book object", done => {
        request(app)
            .get(`/books/${books[1]._id.toHexString()}`)
            .expect(200, done);
    });

    it("should return 404 if no book is found when passed a valid ObjectID that does not exist in the database", done => {
        var bookID = new ObjectID().toHexString();

        request(app)
            .get(`/books/${bookID}`)
            .expect(404)
            .expect(res => {
                expect(res.body.book).toBe(undefined);
            })
            .end(done);
    });

    it("should return 404 for an invalid ObjectID", done => {
        request(app)
            .get("/books/122345")
            .expect(404)
            .expect(res => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe("PATCH /books/:id", () => {
    it("should update a book record when provided with a valid ObjectID which exist in the database", done => {
        var bookID = books[0]._id.toHexString();
        var title = "test book";

        request(app)
            .patch(`/books/${bookID}`)
            .send({ title })
            .expect(200)
            .expect(res => {
                expect(res.body.book.title).toBe(title);
            })
            .end(done);
    });
});

describe("DELETE /books/:id", () => {
    it("should delete a book", done => {
        var bookID = books[0]._id.toHexString();

        request(app)
            .delete(`/books/${bookID}`)
            .expect(200)
            .expect(res => {
                expect(res.body.book._id).toBe(bookID);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                };
                Book.findById(res.body.book._id).then((book) => {
                    expect(book).toBeNull();
                    done();
                }).catch((err) => {
                    done();
                });
            });
    });
});
