const mongoose = require('mongoose');
const TestItem = require('./testSchema');

async function connectDB() {
  try {
    await mongoose.connect('mongodb+srv://choudharymanawi:choudharymanawi@cluster0.wzyousl.mongodb.net/?appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB Atlas (CribConnect DB)');

    // Insert a test document to trigger DB creation
   
  } catch (err) {
    console.error('Connection or Insertion error:', err);
  }
}

// connectDB();
module.exports = connectDB;