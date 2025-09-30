const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const turfController = require('../controllers/turfController');
// const auth = require('../middleware/auth');
const {auth,managerOnly} = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create Turf (only manager/admin)
router.post(
  '/create',
  auth,
  managerOnly,
   upload.single('image'),
  [
    check('name', 'Name is required').not().isEmpty(),
    check('location', 'Location is required').not().isEmpty(),
    check('price', 'Price is required').isNumeric(),
  ],
  turfController.createTurf
);

// Get all Turfs (public)
router.get('/all-turfs', turfController.getAllTurfs);

// Get single Turf by ID (public)
router.get('/:id', turfController.getTurfById);

// Update Turf (only manager/admin)
router.put(
  '/:id',
  auth,
  managerOnly,
  upload.single('image'),
  [
    check('name', 'Name is required').optional().not().isEmpty(),
    check('location', 'Location is required').optional().not().isEmpty(),
    check('price', 'Price should be numeric').optional().isNumeric(),
  ],
  turfController.updateTurfById
);

// Delete Turf (only manager/admin)
router.delete('/:id', auth,managerOnly, turfController.deleteTurfById);

// Booking  a Turf 
router.post('/:turfId/book',auth, turfController.bookTurf);

module.exports = router;
