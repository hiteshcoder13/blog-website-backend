const express = require('express');
const app = express();
const path = require('path')
const cors = require('cors');
const mongoose = require('mongoose')
const collection= require('./db');
const collection2 = require('./db2')
const multer = require('multer');
app.use(express.json());
app.use(cors())
const collection3 = require('./db3');

app.get('/',async(req,res)=>{
   const data = await collection.find();
   res.send(data)
});

app.post('/',async (req,res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const data = new collection({
        name:name,email:email,password:password   
        });
        const result = await data.save();
        res.status(200).json(result)
    } catch (error) {
        res.status(401).json({error:error.message})
    }
   });
//----------------------------------------------------//
   const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // e.g., 1615000000000.jpg
    },
  });
  const upload = multer({ storage: storage });
  
  app.use(express.static('uploads'));
//----------------------------------------------------//

app.get('/chatapp/:email',async(req,res)=>{
  try {
    const email = req.params.email;
    const data = await collection.findOne({email});
    res.status(201).json(data)
  } catch (error) {
    res.status(401).json(error)
  }
}
);


app.get('/sender/:sender/receiver/:receiver', async (req, res) => {
  try {
    const { sender, receiver } = req.params;

    // Find the document that matches the sender-receiver pair
    const chat = await collection3.findOne({ sender, receiver });

    if (chat) {
      res.status(200).json({ messages: chat.messages });
    } else {
      res.status(200).json({ messages: [] });
    }
  } catch (error) {
    console.error("Error retrieving messages:", error);
    res.status(500).json({ error: "An error occurred while retrieving messages" });
  }
});

app.post('/message', async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    // Find an existing document for this sender-receiver pair
    let chat = await collection3.findOne({ sender, receiver });

    const newMessage = { text: message, timestamp: new Date() };

    if (chat) {
      // If a document exists, push the new message to the messages array
      chat.messages.push(newMessage);
      await chat.save();
    } else {
      // If no document exists, create a new one
      chat = new collection3({
        sender,
        receiver,
        messages: [newMessage]
      });
      await chat.save();
    }

    res.status(200).json({ message: "Message stored successfully" });
  } catch (error) {
    console.error("Error storing message:", error);
    res.status(500).json({ error: "An error occurred while storing the message" });
  }
});



app.post('/upload', upload.single('image'), async (req, res) => {
    try {
      const text = req.body.inputText;
      const email= req.body.email;
      const name = req.body.name;

      const newImage = new collection2({
        name:name,
        email:email,
        text:text,
        filename: req.file.filename,
        path: req.file.path,
        contentType: req.file.mimetype,
      });
  
      await newImage.save();
      res.json({ message: newImage.path });
    } catch (error) {
      console.error('Error saving image:', error);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  })
  app.patch('/addcomment/:id', async (req, res) => {
    try {
        const { id } = req.params; // Get the ID from the URL params
        const { newcomment,commentemail } = req.body; // Get the new data from the request body

        // Find the document by ID and update it
        const updatedDocument = await collection2.findByIdAndUpdate(
            id,
            { $push: { comments: newcomment } }, // Push the new data to the array
            { new: true, useFindAndModify: false } // Return the updated document
        );


        const updateDocument = await collection2.findByIdAndUpdate(
          id,
          { $push: { commentemail: commentemail } }, // Push the new data to the array
          { new: true, useFindAndModify: false } // Return the updated document
      );
      if (!updateDocument) {
        return res.status(404).json({ error: 'Document not found' });
    }

        if (!updatedDocument) {
            return res.status(404).json({ error: 'Document not found' });
        }

        res.status(200).json({ message: 'Data added successfully', updatedDocument });
    } catch (error) {
        res.status(500).json({ error: 'Error adding data' });
    }
});


  app.patch('/:id', async (req, res) => {
    try {
      const _id = req.params.id;
      
      if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ error: 'Invalid or missing ID' });
      }
      
      const name = req.body.name;
      const text = req.body.text;
      
      const update = await collection2.findByIdAndUpdate(_id, { name, text }, { new: true });
      
      if (!update) {
        return res.status(404).json({ message: 'No record found with this ID' });
      }
      
      res.status(200).json(update);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/upload',async(req,res)=>{
    const data = await collection2.find();
    res.json(data);
  })

  const storages = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'profileuploads/') // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) // Appending extension
    }
});
const uploading = multer({ storage: storages });
app.use('/profileuploads', express.static(path.join(__dirname, 'profileuploads')));

  app.patch('/updateprofile/:email', uploading.single('profileImage'), async (req, res) => {
    try {
        const { email } = req.params;
        const { name, password } = req.body;
        
        const updateData = { name, password };
        
        if (req.file) {
            updateData.profileImage = req.file.filename;
        }

        const updatedUser = await collection.findOneAndUpdate(
            { email: email },
            { $set: updateData },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Profile updated successfully', });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' })
    }
});


app.get('/profileblog/:email',async(req,res)=>{
  const email = req.params.email
  const data = await collection2.find({email:email});
  res.send(data)
})
 
app.patch('/like/:id', async (req, res) => {
  const { email } = req.body;

  try {
    const blog = await collection2.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Check if the email has already liked the post
    if (blog.likeEmails.includes(email)) {
      return res.status(400).json({ error: 'User has already liked this post' });
    }

    // Update the blog post with the new like
    blog.likes += 1;
    blog.likeEmails.push(email);

    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while liking the blog post' });
  }
});

  app.get('/userprofile/:email',async (req,res) => {
    try {
      const email = req.params.email;
      const data = await collection.findOne({email});
      res.status(201).json(data)
    } catch (error) {
      res.status(401).json(error)
    }
    

  }
  )
  app.get('/:id',async(req,res)=>{
    try {
      const _id = req.params.id
    const data = await collection2.findById(_id);
    res.send(data)
    } catch (error) {
      console.log(error)
      res.send(error)
    }
    
  })




  app.delete('/:id',async (req,res) => {
    const _id = req.params.id;
    const data = await  collection2.deleteOne({ _id: _id }); 
    console.log(data);
res.status(200).json(data)
  })
  //--------------------------------------------------//


   app.post('/login',async (req,res) => {
    const email = req.body.email;
    const password = req.body.password
    try {
        const data = await collection.findOne({email});
        if(data.email==email){
            if(data.password==password){
                res.status(200).json(data)
                console.log('true')
               
            }
        }
    } catch (error) {
        res.status(401).json({error:error.message})
    }
   })
app.listen(3000)
