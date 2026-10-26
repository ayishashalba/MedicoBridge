const Bed = require('../models/Bed');
const Hospital = require('../models/Hospital');

const {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendServerError,
} = require('../utils/responseHandler');

// Convert both old DB fields and new schema fields
// into one common API format.
const normalizeBed = (bed) => {
  const raw = bed.toObject ? bed.toObject() : bed;

  return {
    _id: raw._id,

    hospitalId: raw.hospitalId,

    bedNumber: raw.bedNumber || '',

    ward:
      raw.ward ||
      raw.wardName ||
      '',

    roomNumber:
      raw.roomNumber ||
      '',

    type:
      raw.type ||
      raw.bedType ||
      'General',

    status:
      raw.status ||
      'Available',

    departmentId:
      raw.departmentId || null,

    departmentName:
      raw.departmentName || '',

    patientId:
      raw.patientId || null,

    patientName:
      raw.patientName ||
      '',

    dailyRate:
      raw.dailyRate !== undefined
        ? raw.dailyRate
        : raw.dailyCharge !== undefined
          ? raw.dailyCharge
          : 1000,

    admittedAt:
      raw.admittedAt || null,

    notes:
      raw.notes || '',

    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

// @desc    Get hospital beds
// @route   GET /api/hospital/beds
// @access  Private (Hospital)
const getHospitalBeds = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({
      userId: req.user._id,
    });

    if (!hospital) {
      return sendNotFound(res, 'Hospital profile not found.');
    }

    const {
      ward,
      status,
      type,
    } = req.query;

    // Get all beds for this hospital.
    // We intentionally don't query ward/type here because
    // old DB records use wardName/bedType.
    const beds = await Bed.find({
      hospitalId: hospital._id,
    })
      .populate('patientId', 'name phone email')
      .populate('departmentId', 'name')
      .lean();

    let normalizedBeds = beds.map((bed) => {
      const normalized = normalizeBed(bed);

      // Populate may replace patientId with an object
      if (bed.patientId && typeof bed.patientId === 'object') {
        normalized.patientId = bed.patientId._id;

        normalized.patientName =
          bed.patientId.name || normalized.patientName;

        normalized.patientPhone =
          bed.patientId.phone || '';

        normalized.patientEmail =
          bed.patientId.email || '';
      }

      if (
        bed.departmentId &&
        typeof bed.departmentId === 'object'
      ) {
        normalized.departmentId = bed.departmentId._id;

        normalized.departmentName =
          bed.departmentId.name ||
          normalized.departmentName;
      }

      return normalized;
    });

    // Apply filters after normalization so both old and new
    // database records work.
    if (ward && ward !== 'All') {
      normalizedBeds = normalizedBeds.filter(
        (bed) =>
          bed.ward.toLowerCase() ===
          ward.toLowerCase()
      );
    }

    if (status && status !== 'All') {
      normalizedBeds = normalizedBeds.filter(
        (bed) =>
          bed.status.toLowerCase() ===
          status.toLowerCase()
      );
    }

    if (type && type !== 'All') {
      normalizedBeds = normalizedBeds.filter(
        (bed) =>
          bed.type.toLowerCase() ===
          type.toLowerCase()
      );
    }

    // Sort by ward and bed number
    normalizedBeds.sort((a, b) => {
      const wardCompare =
        a.ward.localeCompare(b.ward);

      if (wardCompare !== 0) {
        return wardCompare;
      }

      return a.bedNumber.localeCompare(
        b.bedNumber,
        undefined,
        {
          numeric: true,
          sensitivity: 'base',
        }
      );
    });

    const totalBeds = normalizedBeds.length;

    const availableBeds = normalizedBeds.filter(
      (bed) => bed.status === 'Available'
    ).length;

    const occupiedBeds = normalizedBeds.filter(
      (bed) => bed.status === 'Occupied'
    ).length;

    const reservedBeds = normalizedBeds.filter(
      (bed) => bed.status === 'Reserved'
    ).length;

    // Group by normalized ward
    const wardMap = {};

    normalizedBeds.forEach((bed) => {
      const wardName = bed.ward || 'Not Provided';

      if (!wardMap[wardName]) {
        wardMap[wardName] = {
          _id: wardName,
          total: 0,
          available: 0,
          occupied: 0,
          reserved: 0,
        };
      }

      wardMap[wardName].total += 1;

      if (bed.status === 'Available') {
        wardMap[wardName].available += 1;
      }

      if (bed.status === 'Occupied') {
        wardMap[wardName].occupied += 1;
      }

      if (bed.status === 'Reserved') {
        wardMap[wardName].reserved += 1;
      }
    });

    const wardSummary = Object.values(wardMap).sort(
      (a, b) =>
        a._id.localeCompare(b._id)
    );

    return sendSuccess(
      res,
      'Beds fetched successfully.',
      {
        beds: normalizedBeds,

        stats: {
          total: totalBeds,
          available: availableBeds,
          occupied: occupiedBeds,
          reserved: reservedBeds,

          occupancyRate:
            totalBeds > 0
              ? Number(
                (
                  (occupiedBeds / totalBeds) *
                  100
                ).toFixed(1)
              )
              : 0,
        },

        wardSummary,
      }
    );
  } catch (error) {
    console.error(
      'GET HOSPITAL BEDS ERROR:',
      error
    );

    return sendServerError(
      res,
      'Failed to fetch hospital beds.',
      error
    );
  }
};

// @desc    Add new bed
// @route   POST /api/hospital/beds
// @access  Private (Hospital)
const addBed = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({
      userId: req.user._id,
    });

    if (!hospital) {
      return sendNotFound(
        res,
        'Hospital profile not found.'
      );
    }

    const {
      bedNumber,
      ward,
      departmentId,
      departmentName,
      type,
      status,
      dailyRate,
      notes,
    } = req.body;

    if (!bedNumber || !ward) {
      return sendValidationError(
        res,
        'Validation failed',
        ['Bed number and ward are required.']
      );
    }

    const existingBeds = await Bed.find({
      hospitalId: hospital._id,
    }).lean();

    const duplicate = existingBeds.find(
      (bed) =>
        (bed.bedNumber || '').trim().toLowerCase() ===
        bedNumber.trim().toLowerCase() &&
        (
          bed.ward ||
          bed.wardName ||
          ''
        ).trim().toLowerCase() ===
        ward.trim().toLowerCase()
    );

    if (duplicate) {
      return sendValidationError(
        res,
        'Validation failed',
        [
          `Bed ${bedNumber} already exists in ward ${ward}.`,
        ]
      );
    }

    const bed = await Bed.create({
      hospitalId: hospital._id,
      bedNumber: bedNumber.trim(),
      ward: ward.trim(),
      departmentId: departmentId || null,
      departmentName: departmentName || '',
      type: type || 'General',
      status: status || 'Available',
      dailyRate:
        dailyRate !== undefined &&
          dailyRate !== ''
          ? Number(dailyRate)
          : 1000,
      notes: notes || '',
    });

    return sendSuccess(
      res,
      'Bed added successfully.',
      bed,
      201
    );
  } catch (error) {
    console.error(
      'ADD BED ERROR:',
      error
    );

    return sendServerError(
      res,
      'Failed to add bed.',
      error
    );
  }
};

// @desc    Update bed details / status / patient assignment
// @route   PUT /api/hospital/beds/:id
// @access  Private (Hospital)
const updateBed = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({
      userId: req.user._id,
    });

    if (!hospital) {
      return sendNotFound(
        res,
        'Hospital profile not found.'
      );
    }

    const bed = await Bed.findOne({
      _id: req.params.id,
      hospitalId: hospital._id,
    });

    if (!bed) {
      return sendNotFound(
        res,
        'Bed not found in this hospital.'
      );
    }

    const {
      bedNumber,
      ward,
      departmentId,
      departmentName,
      type,
      status,
      patientId,
      patientName,
      dailyRate,
      notes,
    } = req.body;

    if (bedNumber !== undefined) {
      bed.bedNumber =
        bedNumber.trim();
    }

    if (ward !== undefined) {
      bed.ward =
        ward.trim();
    }

    if (departmentId !== undefined) {
      bed.departmentId =
        departmentId || null;
    }

    if (departmentName !== undefined) {
      bed.departmentName =
        departmentName;
    }

    if (type !== undefined) {
      bed.type = type;
    }

    if (status !== undefined) {
      bed.status = status;

      if (
        status === 'Occupied' &&
        !bed.admittedAt
      ) {
        bed.admittedAt = new Date();
      }

      if (status === 'Available') {
        bed.patientId = null;
        bed.patientName = '';
        bed.admittedAt = null;
      }
    }

    if (patientId !== undefined) {
      bed.patientId =
        patientId || null;
    }

    if (patientName !== undefined) {
      bed.patientName =
        patientName;
    }

    if (dailyRate !== undefined) {
      bed.dailyRate =
        Number(dailyRate);
    }

    if (notes !== undefined) {
      bed.notes = notes;
    }

    await bed.save();

    return sendSuccess(
      res,
      'Bed updated successfully.',
      bed
    );
  } catch (error) {
    console.error(
      'UPDATE BED ERROR:',
      error
    );

    return sendServerError(
      res,
      'Failed to update bed.',
      error
    );
  }
};

// @desc    Delete bed
// @route   DELETE /api/hospital/beds/:id
// @access  Private (Hospital)
const deleteBed = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({
      userId: req.user._id,
    });

    if (!hospital) {
      return sendNotFound(
        res,
        'Hospital profile not found.'
      );
    }

    const bed =
      await Bed.findOneAndDelete({
        _id: req.params.id,
        hospitalId: hospital._id,
      });

    if (!bed) {
      return sendNotFound(
        res,
        'Bed not found.'
      );
    }

    return sendSuccess(
      res,
      'Bed removed successfully.'
    );
  } catch (error) {
    console.error(
      'DELETE BED ERROR:',
      error
    );

    return sendServerError(
      res,
      'Failed to delete bed.',
      error
    );
  }
};

module.exports = {
  getHospitalBeds,
  addBed,
  updateBed,
  deleteBed,
};