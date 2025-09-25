const Turf = require('../models/Turf');
const upload = require('../middleware/upload'); 

// Create a new turf
const createTurf = async (req, res) => {
  try {
    // Check image
    console.log(req.file);
    if (!req.file) {
      return res.status(400).json({ status: 400,  msg: 'Image is required' });
    }

    const { name, description, location, price, availableSlots } = req.body;

    // Validate fields
    if (!name || !description || !location || !price || !availableSlots ) {
      return res.status(400).json({ status: 400,  msg: 'All fields are required' });
    }

    // Parse slots
    let slots;
    // try {
    //   slots = typeof availableSlots === 'string'
    //     ? JSON.parse(availableSlots)
    //     : availableSlots;
    // } catch (err) {
    //   return res.status(400).json({ msg: 'Invalid availableSlots format' });
    // }

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

// Get all turfs
const getAllTurfs = async (req, res) => {
  try {
    const turfs = await Turf.find(); // Fetch all turfs from the database
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
    res.status(200).json({  status: 400, msg: 'Turf retrieved successfully', turf });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({status:500,msg:'Server error'});
  }
};


// Delete a turf by ID
const deleteTurfById = async (req, res) => {
  try {
    const turfId = req.params.id;

    // Check if the turf exists
    const turf = await Turf.findById(turfId);
    if (!turf) {
      return res.status(404).json({  status: 404, msg: 'Turf not found' });
    }
  

    // Delete the turf
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


module.exports = { createTurf,getAllTurfs, getTurfById,deleteTurfById };
