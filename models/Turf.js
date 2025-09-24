const mongoose = require('mongoose');

const TurfSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description : {type:String,required:true},
  location: { type: String, required: true },
  price: { type: Number, required: true },
  image:{type:String, required:true},
  availableSlots: [{
    time: { type: String, required: true }, // e.g., "10:00 AM"
    isBooked: { type: Boolean, default: false }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the manager 
}, { timestamps: true });

module.exports = mongoose.model('Turf', TurfSchema);
