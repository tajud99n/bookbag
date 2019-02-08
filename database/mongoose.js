const mongoose = require('mongoose');


mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true }).then((client) => {
    console.log("success");
}).catch((err) => {
    console.log("failed", err);
});;

module.exports = mongoose;
