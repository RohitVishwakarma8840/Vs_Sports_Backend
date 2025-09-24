const Turf = require('../models/Turf');
const upload = require('../middleware/upload'); 

// Create a new turf
const createTurf = async (req, res) => {
  try {
    // Check image
    console.log(req.file);
    if (!req.file) {
      return res.status(400).json({ msg: 'Image is required' });
    }

    const { name, description, location, price, availableSlots } = req.body;

    // Validate fields
    if (!name || !description || !location || !price || !availableSlots) {
      return res.status(400).json({ msg: 'All fields are required' });
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

    res.status(201).json({ msg: 'Turf created successfully', turf });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = { createTurf };
