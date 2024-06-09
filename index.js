// const bodyParser = require('body-parser')
// const cors = require('cors')
// const express = require('express')
// const mongoose = require('mongoose')
// const { LoginDB } = require('./schema.js')

// const app = express()
// app.use(bodyParser.json())
// app.use(cors())


// async function connectToDb() {
//   try{   
//    await mongoose.connect('mongodb+srv://Gayathri:82209@cluster0.t3icp1c.mongodb.net/billing?retryWrites=true&w=majority&appName=Cluster0')
//     console.log('DB Connection established')
//     const port=process.env.PORT || 8000
//     app.listen(port,function(){
//         console.log(`Listening on port ${port}` )
//     })
//   }catch(error){
//     console.log(error)
//     console.log("Couldn't establish connection")
//   }
// }

// connectToDb()

// app.post('/add-user', async function(request, response) {
//   try {
//     const newUser = await LoginDB.create({
//       username: request.body.username,
//       password: request.body.password
//     })
//     response.status(201).json({
//       status: 'success',
//       message: 'User created successfully',
//      user: newUser
//     })
//   } catch (error) {
//     console.error('Error creating user:', error)
//     response.status(500).json({
//       status: 'failure',
//       message: 'Failed to create user',
//       error: error.message
//     })
//   }
// })


// app.get('/get-user', async function(request, response) {
//   try {
//     const users = await LoginDB.find();
//     response.status(200).json(users);
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     response.status(500).json({
//       status: 'failure',
//       message: 'Failed to fetch users',
//       error: error.message
//     })
//   }
// })




const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

// MongoDB connection
mongoose.connect('mongodb+srv://Gayathri:82209@cluster0.t3icp1c.mongodb.net/billing?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Item Schema
const itemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  image: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  amount: { type: Number, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true },
});

const Item = mongoose.model('Item', itemSchema);

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Route to handle adding a new item
app.post('/items', upload.single('itemImage'), async (req, res) => {
  try {
    const { itemName, startTime, endTime, amount, quantity, category } = req.body;
    const newItem = new Item({
      itemName,
      image: req.file.path,
      startTime,
      endTime,
      amount,
      quantity,
      category
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
