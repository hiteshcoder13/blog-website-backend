const mongoose = require('mongoose');

const dbURI = 'mongodb+srv://hiteshnagpal:Hunnynagpal%402006@cluster0.jzero.mongodb.net/blogwebsite?retryWrites=true&w=majority';

mongoose.connect(dbURI).then(() => {
    console.log("Connected to the database");
}).catch((e) => {
    console.log("Database connection error:", e);
});

const schema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    text: {
        type: String,
    },
    filename: {
        type: String,
    },
    path: {
        type: String,
    },
    contentType: {
        type: String,
    },
   
});

const collection = mongoose.model("collection", schema);

module.exports = collection;
