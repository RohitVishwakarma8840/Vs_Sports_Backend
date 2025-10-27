const Turf = require('../models/Turf');
const upload = require('../middleware/upload'); 
const moment = require('moment');

// Create 
// const createTurf = async (req, res) => {
//   try {

//     console.log(req.file);
//     if (!req.file) {
//       return res.status(400).json({ status: 400,  msg: 'Image is required' });
//     }

//     const { name, description, location, price,availableSlots} = req.body;

//     if (!name || !description || !location || !price || !availableSlots  ) {
//       return res.status(400).json({ status: 400,  msg: 'All fields are required' });
//     }

    
//     let slots;
//     try {
//       slots = typeof availableSlots === 'string'
//         ? JSON.parse(availableSlots)
//         : availableSlots;
//     } catch (err) {
//       return res.status(400).json({ msg: 'Invalid availableSlots format' });
//     }

//     const turf = new Turf({
//       name,
//       description,
//       location,
//       price: Number(price),
//       image: req.file.path,
//       availableSlots: slots,
//       createdBy: req.user.id,
//     });

//     await turf.save();

//     // console.log("control here");

//     res.status(201).json({  status: 201, msg: 'Turf created successfully', turf });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({status:500, msg:'Server Error'});
//   }
// };


// Create Turf without date in slots
const createTurf = async (req, res) => {
  try {
    // 1️⃣ Check if image exists
    if (!req.file) {
      return res.status(400).json({ errors: { image: 'Image is required' } }); // Field-specific
    }

    const { name, description, location, price, availableSlots } = req.body;

    // 2️⃣ Validate required fields
    const requiredFields = { name, description, location, price, availableSlots };
    const missingFields = Object.keys(requiredFields).filter(key => !requiredFields[key]);
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        errors: { 
          general: `Missing required fields: ${missingFields.join(', ')}` 
        } 
      }); // Or map to specific: { [missingFields[0]]: 'All fields are required' }
    }

    // 3️⃣ Parse availableSlots
    let slots;
    try {
      slots = typeof availableSlots === 'string'
        ? JSON.parse(availableSlots)
        : availableSlots;
    } catch (err) {
      return res.status(400).json({ errors: { availableSlots: 'Invalid availableSlots format' } });
    }

    // 4️⃣ Process slots → calculate 1-hour endTime and remove duplicates
    const processedSlots = [];
    const slotSet = new Set(); // to check duplicates

    slots.forEach(slot => {
      let { time } = slot;

      if (!time) return; // skip invalid slots

      // Prevent duplicate times
      if (slotSet.has(time)) return;
      slotSet.add(time);

      // Calculate end time (1-hour slot)
      const startTimeMoment = moment(time, "hh:mm A");
      const endTimeMoment = startTimeMoment.clone().add(1, 'hours');
      const endTime = endTimeMoment.format("hh:mm A");

      processedSlots.push({
        startTime: time,
        endTime,
        isBooked: false,
      });
    });

    // 5️⃣ Create Turf
    const turf = new Turf({
      name,
      description,
      location,
      price: Number(price),
      image: req.file.path,
      availableSlots: processedSlots,
      createdBy: req.user.id,
    });

    await turf.save();

    res.status(201).json({ status: 201, msg: 'Turf created successfully', turf });
  } catch (err) {
    if (err.name === "ValidationError") {
      const fieldErrors = {}; // Object for field-specific
      Object.keys(err.errors).forEach(key => {
        fieldErrors[key] = err.errors[key].message;
      });
      return res.status(400).json({ errors: fieldErrors }); // e.g., { location: "Location must be at least 3..." }
    }
    console.error(err.message);
    res.status(500).json({ status: 500, msg: 'Server Error' });
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
    res.status(200).json({  status: 200, msg: 'Turf retrieved successfully', 
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
        updatedAt: turf.updatedAt,
        bookingStatus:turf.bookingStatus
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
    slot.date = date ? new Date(date) : new Date(); // save date, default to today if not provided by . 
    slot.bookingStatus = 'pending'; // setting to pending for approv


    // 5️⃣ Save the turf
    await turf.save();

    // 6️⃣ Return response
    res.status(200).json({status:200 ,msg: 'Turf booked successfully', turf });
  } catch (err) {
    console.error(err);
    res.status(500).json({status:500, msg: 'Server error' });
  }
};


// Delete a booking (Admin only)
const deleteBooking = async (req, res) => {
  try {
    const { turfId, slotId } = req.params;

    // 1️⃣ Find turf
    const turf = await Turf.findById(turfId);
    if (!turf) {
      return res.status(404).json({ status: 404, msg: 'Turf not found' });
    }

    // 2️⃣ Find slot
    const slot = turf.availableSlots.id(slotId);
    if (!slot) {
      return res.status(404).json({ status: 404, msg: 'Slot not found' });
    }

    // 3️⃣ Check if slot is actually booked
    if (!slot.isBooked) {
      return res.status(400).json({ status: 400, msg: 'This slot is not booked' });
    }

    // 4️⃣ Reset the slot to make it available again
    slot.isBooked = false;
    slot.bookedBy = null;
    slot.date = null;

    // 5️⃣ Save the turf
    await turf.save();

    res.status(200).json({ status: 200, msg: 'Booking deleted successfully', turf });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, msg: 'Server error' });
  }
};


const getAllBooking = async (req, res) => {
  try {
    // Find all turfs where at least one slot is booked
    const turfs = await Turf.find({ "availableSlots.isBooked": true })
      .populate("availableSlots.bookedBy", "name email"); // showing the user info 

    if (!turfs || turfs.length === 0) {
      return res.status(404).json({ status: 404, msg: "No bookings found" });
    }

    // Extracting only booked slots from each turf
    const bookings = turfs.map(turf => ({
      turfId: turf._id,
      name: turf.name,
      location: turf.location,
      bookings: turf.availableSlots
        .filter(slot => slot.isBooked) // only keep booked slots
        .map(slot => ({
          slotId: slot._id,
          time: slot.time,
          date: slot.date,
          bookedBy: slot.bookedBy, // populated user details 
          status: slot.bookingStatus

        }))
    }));

    res.status(200).json({
      status: 200,
      msg: "All booked slots retrieved successfully",
      bookings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, msg: "Server error" });
  }
};



const updateStatus = async (req, res) => {
  try {
    const { turfId, slotId } = req.params;
    const { bookingStatus } = req.body;

    // Validate bookingStatus
    if (!['pending', 'approved', 'rejected'].includes(bookingStatus)) {
      return res.status(400).json({ status: 400, msg: 'Invalid booking status' });
    }

    
    const turf = await Turf.findById(turfId);
    if (!turf) {
      return res.status(404).json({ status: 404, msg: 'Turf not found' });
    }

    
    const slot = turf.availableSlots.id(slotId);
    if (!slot) {
      return res.status(404).json({ status: 404, msg: 'Slot not found' });
    }

    // updating booking status
    slot.bookingStatus = bookingStatus;
    await turf.save();

    res.status(200).json({ status: 200, msg: 'Booking status updated', slot });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, msg: 'Server error' });
  }
};





module.exports = { createTurf, getAllTurfs, getTurfById, deleteTurfById, updateTurfById,
  bookTurf,deleteBooking ,
  getAllBooking, updateStatus


};



