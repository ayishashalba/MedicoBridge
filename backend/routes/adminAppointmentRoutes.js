const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const {
    getAdminAppointments,
    getAdminAppointmentById,
} = require('../controllers/adminAppointmentController');

router.use(protect);
router.use(authorizeRoles('Admin'));

router.get('/', getAdminAppointments);
router.get('/:id', getAdminAppointmentById);

module.exports = router;