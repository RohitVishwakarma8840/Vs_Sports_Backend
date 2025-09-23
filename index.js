const express = require('express');
const app = express();
const mongoose = require('mongoose');


require("dotenv").config();
app.use(express.json()); 


const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);


app.get('/', (req, res) => {
  res.send('Hello from Express!');
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error("MongoDB connection error:", err.message));