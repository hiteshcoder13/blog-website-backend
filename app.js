const express = require('express');
const app = express();
const path = require('path')
const cors = require('cors');
const mongoose = require('mongoose')
const collection= require('./db');
const collection2 = require('./db2')
const multer = require('multer');
app.use(express.json())
app.get('/',async(req,res)=>{
   const data = await collection.find();
   res.send(data)
});
app.use(cors())
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
//    const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'uploads/');
//     },
//     filename: function (req, file, cb) {
//       cb(null, Date.now() + path.extname(file.originalname)); // e.g., 1615000000000.jpg
//     },
//   });
//   const upload = multer({ storage: storage });
  
//   app.use(express.static('uploads'));
// //----------------------------------------------------//
// app.use('/uploads', express.static('profileuploads'));







app.post('/upload', async (req, res) => {
    try {
      const text = req.body.inputText;
      const email= req.body.email;
      const name = req.body.name;

      const newImage = new collection2({
        name:name,
        email:email,
        text:text,
      });
  
      await newImage.save();
      res.json({ message: newImage });
    } catch (error) {
      console.error('Error saving image:', error);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  });

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
    res.json(data)
  })

  app.patch('/updateprofile/:email', async (req, res) => {
    try {
      const email = req.params.email;
    const newpassword = req.body.newpassword;
    
    const newname = req.body.newname;
   const data = await collection.findOneAndUpdate({email},{name:newname,password:newpassword});
   res.status(201).json(data)
   
    } catch (error) {
      res.status(401).json(error)
    }
    
});
 
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