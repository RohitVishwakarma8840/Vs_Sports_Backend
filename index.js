const express = require('express');
const app = express();
const mongoose = require('mongoose');
const upload = require('./middleware/upload');

require("dotenv").config();
app.use(express.json()); 


const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Turf routes
const turfRoutes = require('./routes/turf.route');
app.use('/api/turfs', turfRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error("MongoDB connection error:", err.message));