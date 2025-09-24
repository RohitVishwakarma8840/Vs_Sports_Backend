const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
require("dotenv").config();


// const register = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

//   const { name, email, password, userType } = req.body;
//   try {
//     let user = await User.findOne({ email });
//     if (user) return res.status(400).json({ msg: 'User already exists' });

//     const salt = await bcrypt.genSalt(10);
//     const hashed = await bcrypt.hash(password, salt);

//     // only allow "customer" on normal register
//     const role = userType;

//     user = new User({ name, email, password: hashed, userType: role });
//     await user.save();

//     const payload = { 
//       user: { id: user.id, userType: user.userType } 
//     };

//     const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

//     res.json({ token, userType: user.userType });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server error');
//   }
// };

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body; // ignore userType
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Force 'customer' role for normal registration
    user = new User({ name, email, password: hashed, userType: 'customer' });
    await user.save();

    const payload = { user: { id: user.id, userType: user.userType } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, userType: user.userType });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};



const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { 
      user: { id: user.id, userType: user.userType } 
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, userType: user.userType });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};


const createManager = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, secret } = req.body;

  // Only allow if secret matches your server-side key
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ msg: 'Not authorized to create manager' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashed,
      userType: 'manager'
    });

    await user.save();

    // Optional: generate token for the manager
    const payload = { user: { id: user.id, userType: user.userType } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, userType: user.userType, msg: 'Manager created successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


module.exports = { register, login, createManager };


