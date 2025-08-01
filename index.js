const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Mongoose schema and model
const itemSchema = new mongoose.Schema({
  itemName: String,
  startTime: String,
  endTime: String,
  amount: Number,
  quantity: Number,
  category: String,
  itemImage: {
    url: String // Store image URL instead of path
  }
});

const Item = mongoose.model('Item', itemSchema);

let server; // Declare server outside connectToDb to make it accessible for shutdown

// Connect to MongoDB and start the server
async function connectToDb() {
  let port = process.env.PORT || 8002;

  while (true) {
    try {
      await mongoose.connect('mongodb+srv://Gayathri:82209@cluster0.t3icp1c.mongodb.net/billing?retryWrites=true&w=majority&appName=Cluster0', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('DB Connection established');

      server = app.listen(port, () => { // Capture the server instance
        console.log(`Server is running on http://localhost:${port}`);
      });
      break;
    } catch (error) {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is in use, trying next port...`);
        port++;
      } else {
        console.error('Database connection or server startup error:', error);
        break;
      }
    }
  }
}

connectToDb();

// Graceful shutdown handler
function gracefulShutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully.`);

  server.close(() => { // Close the server, stopping new connections
    console.log('HTTP server closed.');
    mongoose.connection.close(() => { // Close MongoDB connection
      console.log('MongoDB connection closed.');
      process.exit(0); // Exit the process with success code 0
    });
  });

  // Optional: Force shutdown after a timeout if the server doesn't close gracefully
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1); // Exit with error code 1
  }, 5000); // 5 seconds timeout
}

// Listen for shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Add item endpoint
app.post('/items', async (req, res) => {
  try {
    const { itemName, startTime, endTime, amount, quantity, category, itemImage } = req.body;
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

// Update item endpoint
app.put('/items/:id', async (req, res) => {
  try {
    const { itemName, startTime, endTime, amount, quantity, category, itemImage } = req.body;
    const updateData = { itemName, startTime, endTime, amount, quantity, category, itemImage };

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json({
      status: 'success',
      message: 'Item updated successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({
      status: 'failure',
      message: 'Failed to update item',
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

// Delete item endpoint
app.delete('/items/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      status: 'failure',
      message: 'Failed to delete item',
      error: error.message
    });
  }
});

// Fetch item image endpoint
app.get('/fetch-item-image/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ status: 'failure', message: 'Item not found' });
    }

    const imageUrl = item.itemImage.url;
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'stream' // Ensure response type is stream to handle large files
    });

    // Set content type based on image type if known (e.g., 'image/jpeg', 'image/png')
    res.setHeader('Content-Type', 'image/jpeg'); // Adjust content type as per your image type

    // Pipe the image stream directly to the response object
    imageResponse.data.pipe(res);
  } catch (error) {
    console.error('Error fetching item image:', error);
    res.status(500).json({ status: 'failure', message: 'Failed to fetch item image' });
  }
});
// Get single item by ID
app.get('/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        status: 'failure',
        message: 'Item not found'
      });
    }
    res.status(200).json({
      status: 'success',
      item
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({
      status: 'failure',
      message: 'Failed to fetch item',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

