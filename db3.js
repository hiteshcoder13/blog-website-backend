const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://hiteshnagpal:Hunnynagpal%402006@cluster0.jzero.mongodb.net/blogwebsite?retryWrites=true&w=majority").then(()=>{
    console.log("db success")
}).catch((e)=>{
    console.log(e)
});

const messageSchema = new mongoose.Schema({
    sender: {
        type: String
    },
    receiver: {
        type: String
    },
    messages: [
        {
            text: String,
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

const collection3 = mongoose.model("Chat", messageSchema);
module.exports = collection3;
