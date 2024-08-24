const mongoose = require('mongoose');

const dbURI = 'mongodb+srv://hiteshnagpal:Hunnynagpal%402006@cluster0.jzero.mongodb.net/blogwebsite?retryWrites=true&w=majority';

mongoose.connect(dbURI).then(() => {
    console.log("Connected to the database");
}).catch((e) => {
    console.log("Database connection error:", e);
});
const schema = new mongoose.Schema({
  email:{
    type:String
  },
  text:{
      type:String,
      
  },
  name:{
    type:String,
  },
  comments: {
    type: [String], // Adjust the type based on your data
    default: [],
},
commentemail:{
  type:[String],
  default:[],
},
likes: { type: Number, default: 0 },
likeEmails: [{ type: String }], // Array to store emails of users who liked the post
}, { timestamps: true });

const collection2 = new mongoose.model("collection2",schema);

module.exports = collection2;