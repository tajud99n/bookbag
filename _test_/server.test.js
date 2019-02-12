const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("./../server");
const Book = require("./../models/book");
const User = require("./../models/user");
const { books, seedBooks, users, seedUsers } = require("./seed/seed");

beforeEach(seedUsers);
beforeEach(seedBooks);

describe("GET /", () => {
	it("should response with a 200", done => {
		request(app)
			.get("/")
			.expect(200)
			.expect(res => {
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
			.post("/books")
			.set('x-auth', users[0].tokens[0].token)
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

				Book.find({ title })
					.then(result => {
						expect(result.length).toBe(1);
						expect(result[0].title).toEqual(title);
						done();
					})
					.catch(err => {
						done(err);
					});
			});
	});

	it("should not create a book if any of the required field is missing", done => {
		request(app)
			.post("/books")
			.set('x-auth', users[0].tokens[0].token)			
			.send({})
			.expect(400)
			.end(done);
	});
});

describe("GET /books", () => {
	it("should get all the books by a login user", done => {
		request(app)
			.get("/books")
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect(res => {
				expect(res.body.books.length).toBe(1);
			})
			.end(done);
	});
});

describe("GET /books/all", () => {
	it("should get all the books in the database", done => {
		request(app)
			.get("/books/all")
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
			.get(`/books/${books[0]._id.toHexString()}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(200, done);
	});

	it("should return 404 if no book is found when passed a valid ObjectID that does not exist in the database", done => {
		var bookID = new ObjectID().toHexString();

		request(app)
			.get(`/books/${bookID}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.expect(res => {
				expect(res.body.book).toBe(undefined);
			})
			.end(done);
	});

	it("should return 404 for an invalid ObjectID", done => {
		request(app)
			.get("/books/122345")
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.expect(res => {
				expect(res.body).toEqual({});
			})
			.end(done);
	});

	it("should not return a book object created by another user", done => {
		request(app)
			.get(`/books/${books[1]._id.toHexString()}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(404, done);
	});
});

describe("PATCH /books/:id", () => {
	it("should update a book record when provided with a valid ObjectID which exist in the database", done => {
		var bookID = books[0]._id.toHexString();
		var title = "test book";

		request(app)
			.patch(`/books/${bookID}`)
			.set('x-auth', users[0].tokens[0].token)
			.send({ title })
			.expect(200)
			.expect(res => {
				expect(res.body.book.title).toBe(title);
			})
			.end(done);
	});

	it("should not update a book record of another user", done => {
		var bookID = books[1]._id.toHexString();
		var title = "test book";

		request(app)
			.patch(`/books/${bookID}`)
			.set('x-auth', users[0].tokens[0].token)
			.send({ title })
			.expect(404)
			.end(done);
	});
});

describe("DELETE /books/:id", () => {
	it("should delete a book", done => {
		var bookID = books[0]._id.toHexString();

		request(app)
			.delete(`/books/${bookID}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect(res => {
				expect(res.body.book._id).toBe(bookID);
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Book.findById(res.body.book._id)
					.then(book => {
						expect(book).toBeNull();
						done();
					})
					.catch(err => {
						done();
					});
			});
	});

	it("should not delete a book by another user", done => {
		var bookID = books[0]._id.toHexString();

		request(app)
			.delete(`/books/${bookID}`)
			.set('x-auth', users[1].tokens[0].token)
			.expect(404)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Book.findById(bookID)
					.then(book => {
						expect(book).toBeTruthy();
						done();
					})
					.catch(err => {
						done();
					});
			});
	});

	it('should return a 404 if book is not found', done => {
		var bookID = new ObjectID().toHexString();

		request(app)
			.delete(`/books/${bookID}`)
			.set('x-auth', users[1].tokens[0].token)
			.expect(404)
			.end(done);
	});

	it('should return a 404 if book id is not valid', done => {
		request(app)
			.delete('/books/12345')
			.set('x-auth', users[1].tokens[0].token)
			.expect(404)
			.end(done);
	});
});

describe("GET /users/me", () => {
	it("should return user if authenticated", done => {
		request(app)
			.get("/users/me")
			.set("x-auth", users[0].tokens[0].token)
			.expect(200)
			.expect(res => {
				expect(res.body._id).toBe(users[0]._id.toHexString());
				expect(res.body.email).toBe(users[0].email);
			})
			.end(done);
	});

	it("should return 401 if not authenticated", done => {
		request(app)
			.get("/users/me")
			.expect(401)
			.expect(res => {
				expect(res.body).toEqual({});
			})
			.end(done);
	});
});

describe("POST /users", () => {
	it("should create a user", done => {
		var email = "example@example.com";
		var password = "password";

		request(app)
			.post("/users")
			.send({ email, password })
			.expect(200)
			.expect(res => {
				expect(res.headers["x-auth"]).toBeTruthy();
				expect(res.body._id).toBeTruthy();
				expect(res.body.email).toBe(email);
			})
			.end(err => {
				if (err) {
					return done(err);
				}

				User.findOne({ email })
					.then(user => {
						expect(user).toBeTruthy();
						done();
					})
					.catch(err => done(err));
			});
	});

	it("should return validation errors if request invalid", done => {
		var email = 'example"example.com';
		var password = "password";

		request(app)
			.post("/users")
			.send({ email, password })
			.expect(400)
			.end(done);
	});

	it("should not create user if email in use", done => {
        var email = "book@example.com";
        var password = "password";

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(400)
            .end(done);
	});
});

describe('POST /users/login', () => {
	it('should login user and return auth token', done => {
		request(app)
			.post('/users/login')
			.send({
				email: users[1].email,
				password: users[1].password
			})
			.expect(200)
			.expect(res => {
				expect(res.headers["x-auth"]).toBeTruthy();
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}

				User.findById(users[1]._id).then(user => {
					expect(user.tokens[1]).toMatchObject({ "token": res.headers['x-auth'] });
					done();
				}).catch(err => done(err));
			});
	});

	it('should reject invalid login', done => {
		request(app)
			.post('/users/login')
			.send({
				email: users[1].email,
				password: users[1].password + 'fake'
			})
			.expect(400)
			.expect(res => {
				expect(res.headers["x-auth"]).toBeFalsy();
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}

				User.findById(users[1]._id).then(user => {
					expect(user.tokens.length).toBe(1);
					done();
				}).catch(err => done(err));
			});
	});
});

describe('DELETE /users/me/token', () => {
	it('should remove auth token on logout', done => {
		request(app)
			.delete('/users/me/token')
			.set("x-auth", users[0].tokens[0].token)
			.expect(200)
			.end((err, res) => {
				if (err) {
					return done(err);
				}

				User.findById(users[0]._id).then(user => {
					expect(user.tokens.length).toBe(0);
					done();
				}).catch(err => done(err));
			});
	});
});