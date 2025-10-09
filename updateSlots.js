// const mongoose = require("mongoose");
// const Turf = require("./models/Turf");

// mongoose.connect("mongodb+srv://rohit8840185_db_user:L4nWGVQXImwHrK11@cluster0.jiu1nlc.mongodb.net/", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const updateOldSlots = async () => {
//   try {
//     await Turf.updateMany(
//       { "availableSlots.bookingStatus": { $exists: false } },
//       { $set: { "availableSlots.$[].bookingStatus": "pending" } }
//     );
//     console.log("Old slots updated successfully!");
//   } catch (err) {
//     console.error("Error updating slots:", err);
//   } finally {
//     mongoose.connection.close();
//   }
// };

// updateOldSlots();
