const mongoose = require('mongoose');
const validator = require('validator');
const sanitizeHtml = require('sanitize-html');


const TurfSchema = new mongoose.Schema({
  name: { type: String, 
    required: [true,"Name is Required"]
    ,
    minlength: [3,"Name must be greater than 3"],
    maxlength: [20, 'Name should not be greater than that '],
    trim: true, 
    unique:true,
     validate: {
    validator: function (v) {
      return validator.isAlphanumeric(validator.blacklist(v, ' '));
    },
    message: "Invalid name — letters and numbers only",
  },
      set: v => sanitizeHtml(v, { allowedTags: [], allowedAttributes: {} }),

   },
  description : {type:String,required:true,
    minlength: [50,"Description should be greater than that "],
    maxlength: [500,"Description should not be greater than 300"],
    trim:true,
    unique:true,
    set: v => sanitizeHtml(v, { allowedTags: [], allowedAttributes: {} }),


  },
  location: { type: String, required: true,
    minlength: [3, "Location must be at least 3 characters long"],
      maxlength: [20, "Location should not exceed 100 characters"],
      trim: true,
   },
  price: { type: Number, required: true,
     min: [100, "Price must be at least ₹100"],
      max: [100000, "Price must not exceed ₹10,000"],
      validate: {
        validator: Number.isFinite,
        message: "Price must be a valid number",
      },

   },
  image:{type:String, required:true},
  availableSlots: [{
    startTime: { type: String}, // e.g., "10:00 AM"
    endTime: {type:String},
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
