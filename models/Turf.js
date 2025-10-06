const mongoose = require('mongoose');

const TurfSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description : {type:String,required:true},
  location: { type: String, required: true },
  price: { type: Number, required: true },
  image:{type:String, required:true},
  availableSlots: [{
    time: { type: String}, // e.g., "10:00 AM"
    isBooked: { type: Boolean, default: false },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      date: { type: Date, default: null } ,
      bookingStatus:{
        type:String,
        enum:['pending','approved','rejected'],
        default:'pending'
      },

  }],
  // availableSolts: {type:String,required:true}, // Comma-separated time slots
  // isBooked: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the manager 
}, { timestamps: true });

module.exports = mongoose.model('Turf', TurfSchema);
