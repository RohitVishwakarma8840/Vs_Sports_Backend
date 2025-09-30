const Turf = require('../models/Turf');
const upload = require('../middleware/upload'); 

// Create 
const createTurf = async (req, res) => {
  try {

    console.log(req.file);
    if (!req.file) {
      return res.status(400).json({ status: 400,  msg: 'Image is required' });
    }

    const { name, description, location, price,availableSlots} = req.body;

    if (!name || !description || !location || !price || !availableSlots  ) {
      return res.status(400).json({ status: 400,  msg: 'All fields are required' });
    }

    
    let slots;
    try {
      slots = typeof availableSlots === 'string'
        ? JSON.parse(availableSlots)
        : availableSlots;
    } catch (err) {
      return res.status(400).json({ msg: 'Invalid availableSlots format' });
    }

    const turf = new Turf({
      name,
      description,
      location,
      price: Number(price),
      image: req.file.path,
      availableSlots: slots,
      createdBy: req.user.id,
    });

    await turf.save();

    console.log("control herr")

    res.status(201).json({  status: 201, msg: 'Turf created successfully', turf });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({status:500, msg:'Server Error'});
  }
};

// Get turfs
const getAllTurfs = async (req, res) => {
  try {
    const turfs = await Turf.find(); 
    if (!turfs || turfs.length === 0) {
      return res.status(404).json({ status: 404,  msg: 'No turfs found' });
    }
    res.status(200).json({status:200, msg: 'Turfs retrieved successfully', turfs });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({status:500, msg:'Server Error'});
  }
};

const getTurfById = async (req, res) => {
  try {
    const turf = await Turf.findById(req.params.id);
    if (!turf) {
      return res.status(404).json({ status: 404,  msg: 'Turf not found' });
    }
    res.status(200).json({  status: 400, msg: 'Turf retrieved successfully', 
      turf: {
        id: turf._id,
        name: turf.name,
        description: turf.description,
        location: turf.location,
        price: turf.price,
        image: turf.image,
        availableSlots: turf.availableSlots,
        isBooked: turf.isBooked,
        createdBy: turf.createdBy,
        createdAt: turf.createdAt,
        updatedAt: turf.updatedAt
      }
     });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({status:500,msg:'Server error'});
  }
};


// Delete a turf by ID
const deleteTurfById = async (req, res) => {
  try {
    const turfId = req.params.id;

 
    const turf = await Turf.findById(turfId);
    if (!turf) {
      return res.status(404).json({  status: 404, msg: 'Turf not found' });
    }
  

    // Delete 
    await Turf.findByIdAndDelete(turfId);

    res.status(200).json({ status: 200,  msg: 'Turf deleted successfully' });
  } catch (err) {
    console.error(err.message);
 
    if (err.kind === 'ObjectId') {
      return res.status(400).json({  status: 400, msg: 'Invalid turf ID' });
    }
    res.status(500).send({status:500, msg:'Server Error'});
  }
};


// Update a turf by ID
const updateTurfById = async (req, res) => {
  try {
    const turfId = req.params.id;
    const { name, description, location, price, availableSlots } = req.body;

    
    const turf = await Turf.findById(turfId);
    if (!turf) {
      return res.status(404).json({ status: 404, msg: 'Turf not found' });
    }

  
    if (name) turf.name = name;
    if (description) turf.description = description;
    if (location) turf.location = location;
    if (price) turf.price = Number(price);
    if (availableSlots) turf.availableSlots = availableSlots;

   
    if (req.file) {
      turf.image = req.file.path;
    }

    await turf.save();

    res.status(200).json({ status: 200, msg: 'Turf updated successfully', turf });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ status: 400, msg: 'Invalid turf ID' });
    }
    res.status(500).json({ status: 500, msg: 'Server Error' });
  }
};



const bookTurf = async (req, res) => {
  try {
    const { turfId } = req.params;
    const { slotId, userId, date } = req.body; // add date here

    // 1️⃣ Find the turf
    const turf = await Turf.findById(turfId);
    if (!turf) {
      return res.status(404).json({status:404, msg: 'Turf not found' });
    }

    // 2️⃣ Find the slot
    const slot = turf.availableSlots.id(slotId);
    if (!slot) {
      return res.status(404).json({status:404, msg: 'Slot not found' });
    }

    // 3️⃣ Check if slot is already booked
    if (slot.isBooked) {
      return res.status(400).json({ status:400,msg: 'Slot already booked' });
    }

    // 4️⃣ Book the slot
    slot.isBooked = true;
    slot.bookedBy = userId; // link the user
    slot.date = date ? new Date(date) : new Date(); // save date, default to today if not provided

    // 5️⃣ Save the turf
    await turf.save();

    // 6️⃣ Return response
    res.status(200).json({status:200 ,msg: 'Turf booked successfully', turf });
  } catch (err) {
    console.error(err);
    res.status(500).json({status:500, msg: 'Server error' });
  }
};





module.exports = { createTurf, getAllTurfs, getTurfById, deleteTurfById, updateTurfById,bookTurf };



