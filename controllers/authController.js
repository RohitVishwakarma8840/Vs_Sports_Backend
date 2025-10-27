const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
require("dotenv").config();
const Turf = require('../models/Turf');


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
  if (!errors.isEmpty()) return res.status(400).json({ status:400, errors: errors.array() });

  const { name, email, password } = req.body; 
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ status: 400,  msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    
    user = new User({ name, email, password: hashed, userType: 'customer' });
    await user.save();

    const payload = { user: { id: user.id, userType: user.userType } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '4h' });

    res.json({ token, userType: user.userType, status:200, msg:'Registration successful' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ status: 500,msg:'Server Error' });
  }
};



const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ status: 400,  errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({  status: 400, msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({  status: 400, msg: 'Invalid credentials' });

    const payload = { 
      user: { id: user.id, userType: user.userType } 
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, userType: user.userType , status:200,msg:'Login successful', 
      user: { id: user.id, name: user.name, email: user.email, userType: user.userType }

    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, msg:'Server error'});
  }
};


const createManager = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({  status: 400, errors: errors.array() });

  const { name, email, password, secret } = req.body;

  
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({  status: 403, msg: 'Not authorized to create manager' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({  status: 400, msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    // console.log("control here");

    user = new User({
      name,
      email,
      password: hashed,
      userType: 'manager'
    });

    // console.log("manager create ", user);
    await user.save();


   
    const payload = { user: { id: user.id, userType: user.userType } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, userType: user.userType, msg: 'Manager created successfully' , status:200});
  } catch (err) {
    console.error(err.message);
    res.status(500).json({status:500,msg:'Server Error'});
  }
};


const getUserBookings  = async(req,res)=>{

  try {
    const { userId } = req.params;

    // 1️⃣ Find all turfs where any slot is booked by this user
    const turfs = await Turf.find({ "availableSlots.bookedBy": userId })
      .populate("availableSlots.bookedBy", "name email"); // optional: get user info

    // 2️⃣ Filter only the slots booked by this user
    const userBookings = turfs.map(turf => {
      return {
        turfId: turf._id,
        turfName: turf.name,
        location: turf.location,
        price: turf.price,
        bookedSlots: turf.availableSlots.filter(
          slot => slot.bookedBy && slot.bookedBy._id.toString() === userId
        ).map(slot => ({
          slotId: slot._id,
          time: slot.time,
          date: slot.date,
          isBooked: slot.isBooked,
          bookingStatus: slot.bookingStatus
        })),
      };
    });

    res.status(200).json({status:200 ,bookings: userBookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
}

module.exports = { register, login, createManager,getUserBookings };


