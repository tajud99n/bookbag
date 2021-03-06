var mongoose = require('mongoose');

var Book = mongoose.model('Book', {
    title: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    author: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
    },
    isbn: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        maxlength: 1
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true        
    }
});

module.exports = Book;