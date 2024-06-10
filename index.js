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
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Mongoose schema and model
const itemSchema = new mongoose.Schema({
  itemName: String,
  startTime: String,
  endTime: String,
  amount: Number,
  quantity: Number,
  category: String,
  itemImage: String
});

const Item = mongoose.model('Item', itemSchema);

// Connect to MongoDB
async function connectToDb() {
  try {
    await mongoose.connect('mongodb+srv://Gayathri:82209@cluster0.t3icp1c.mongodb.net/billing?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('DB Connection established');
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  } catch (error) {
    console.error("Couldn't establish connection", error);
  }
}

connectToDb();

// Add item endpoint
app.post('/items', upload.single('itemImage'), async (req, res) => {
  try {
    const { itemName, startTime, endTime, amount, quantity, category } = req.body;
    const itemImage = req.file.path;
    const newItem = await Item.create({ itemName, startTime, endTime, amount, quantity, category, itemImage });
    res.status(201).json({
      status: 'success',
      message: 'Item added successfully',
      item: newItem
    });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({
      status: 'failure',
      message: 'Failed to add item',
      error: error.message
    });
  }
});

// Get items endpoint
app.get('/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json({ status: 'success', items });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      status: 'failure',
      message: 'Failed to fetch items',
      error: error.message
    });
  }
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
