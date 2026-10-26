const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Pharmacy = require('../models/Pharmacy');
const Appointment = require('../models/Appointment');
const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const AdminLog = require('../models/AdminLog');

const { logAdminAction } = require('../services/adminLogService');

const {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendServerError,
  sendUnauthorized,
} = require('../utils/responseHandler');


// ============================================================
// ADMIN DASHBOARD
// ============================================================

// @desc    Get admin dashboard metrics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)

const getDashboard = async (req, res) => {
  try {
    // ============================================================
    // USER COUNTS
    // ============================================================

    const [
      totalUsers,
      totalPatients,
      totalDoctors,
      totalHospitals,
      totalPharmacies,
      activeUsers,
      blockedUsers,
      pendingUsers,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        role: 'Patient',
      }),

      User.countDocuments({
        role: 'Doctor',
      }),

      User.countDocuments({
        role: 'Hospital',
      }),

      User.countDocuments({
        role: 'Pharmacy',
      }),

      User.countDocuments({
        status: 'active',
      }),

      User.countDocuments({
        status: 'blocked',
      }),

      User.countDocuments({
        status: 'pending',
      }),
    ]);


    // ============================================================
    // PROVIDER APPROVALS
    // ============================================================

    const [
      pendingHospitals,
      pendingPharmacies,
      pendingDoctors,
    ] = await Promise.all([
      Hospital.countDocuments({
        status: 'pending',
      }),

      Pharmacy.countDocuments({
        status: 'pending',
      }),

      Doctor.countDocuments({
        status: 'pending',
      }),
    ]);

    const pendingApprovals =
      pendingHospitals +
      pendingPharmacies +
      pendingDoctors;


    // ============================================================
    // MEDICINE VERIFICATION
    // ============================================================

    const [
      totalMedicines,
      approvedMedicines,
      pendingMedicineReviews,
      blockedMedicines,
    ] = await Promise.all([
      Medicine.countDocuments(),

      Medicine.countDocuments({
        approvalStatus: 'Approved',
      }),

      Medicine.countDocuments({
        approvalStatus: 'Pending Review',
      }),

      Medicine.countDocuments({
        approvalStatus: 'Blocked',
      }),
    ]);


    // ============================================================
    // APPOINTMENTS
    // ============================================================

    const [
      totalAppointments,
      upcomingAppointments,
      ongoingAppointments,
      completedAppointments,
      cancelledAppointments,
    ] = await Promise.all([
      Appointment.countDocuments(),

      Appointment.countDocuments({
        status: {
          $in: ['Upcoming', 'Scheduled'],
        },
      }),

      Appointment.countDocuments({
        status: 'Ongoing',
      }),

      Appointment.countDocuments({
        status: 'Completed',
      }),

      Appointment.countDocuments({
        status: 'Cancelled',
      }),
    ]);


    // ============================================================
    // ORDERS
    // ============================================================

    const [
      totalOrders,
      deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      Order.countDocuments(),

      Order.countDocuments({
        orderStatus: 'Delivered',
      }),

      Order.countDocuments({
        orderStatus: 'Cancelled',
      }),
    ]);


    // ============================================================
    // MONTHLY USER GROWTH
    // Last 7 months
    // ============================================================

    const monthlyUserGrowth = await User.aggregate([
      {
        $match: {
          role: {
            $in: [
              'Patient',
              'Doctor',
              'Hospital',
              'Pharmacy',
            ],
          },
        },
      },

      {
        $group: {
          _id: {
            year: {
              $year: '$createdAt',
            },

            month: {
              $month: '$createdAt',
            },
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },

      {
        $limit: 7,
      },
    ]);


    // ============================================================
    // RECENT ADMIN ACTIVITY
    // ============================================================

    const recentLogs = await AdminLog.find()
      .populate(
        'adminId',
        'name email role'
      )
      .sort({
        createdAt: -1,
      })
      .limit(10);


    // ============================================================
    // RECENT PENDING PROVIDERS
    // ============================================================

    const recentPendingDoctors =
      await Doctor.find({
        status: 'pending',
      })
        .select(
          'name email specialization createdAt'
        )
        .sort({
          createdAt: -1,
        })
        .limit(5);


    const recentPendingHospitals =
      await Hospital.find({
        status: 'pending',
      })
        .select(
          'name email city createdAt'
        )
        .sort({
          createdAt: -1,
        })
        .limit(5);


    const recentPendingPharmacies =
      await Pharmacy.find({
        status: 'pending',
      })
        .select(
          'name email city createdAt'
        )
        .sort({
          createdAt: -1,
        })
        .limit(5);


    // ============================================================
    // RESPONSE
    // ============================================================

    return sendSuccess(
      res,
      'Admin dashboard metrics fetched successfully.',
      {
        counts: {
          totalUsers,
          totalPatients,
          totalDoctors,
          totalHospitals,
          totalPharmacies,

          activeUsers,
          blockedUsers,
          pendingUsers,

          pendingApprovals,
          pendingHospitals,
          pendingPharmacies,
          pendingDoctors,

          totalMedicines,
          approvedMedicines,
          pendingMedicineReviews,
          blockedMedicines,

          totalAppointments,
          upcomingAppointments,
          ongoingAppointments,
          completedAppointments,
          cancelledAppointments,

          totalOrders,
          deliveredOrders,
          cancelledOrders,
        },

        monthlyUserGrowth,

        pendingProviders: {
          doctors: recentPendingDoctors,
          hospitals: recentPendingHospitals,
          pharmacies: recentPendingPharmacies,
        },

        recentLogs,
      }
    );

  } catch (error) {
    return sendServerError(
      res,
      'Failed to fetch admin dashboard.',
      error
    );
  }
};


// ============================================================
// ADMIN USER MANAGEMENT
// ============================================================

// @desc    Get users list with role tabs, search, status,
//          blood group and location filters
// @route   GET /api/admin/users
// @access  Private (Admin)

const getUsers = async (req, res) => {
  try {
    const {
      tab,
      bloodGroup,
      location,
      search,
      status,
    } = req.query;


    const normalizedBloodGroup =
      bloodGroup &&
        bloodGroup !== 'All Blood Groups' &&
        bloodGroup !== 'All'
        ? bloodGroup
        : null;


    const normalizedLocation =
      location?.trim() || null;


    const normalizedSearch =
      search?.trim() || null;


    const normalizedStatus =
      status && status !== 'All'
        ? status
        : null;


    // ============================================================
    // DOCTORS
    // ============================================================

    if (tab === 'Doctors') {
      const query = {};


      if (normalizedBloodGroup) {
        query.bloodGroup =
          normalizedBloodGroup;
      }


      if (normalizedLocation) {
        query.city = {
          $regex: normalizedLocation,
          $options: 'i',
        };
      }


      if (normalizedStatus) {
        query.accountStatus =
          normalizedStatus.toLowerCase();
      }


      if (normalizedSearch) {
        query.$or = [
          {
            name: {
              $regex: normalizedSearch,
              $options: 'i',
            },
          },

          {
            email: {
              $regex: normalizedSearch,
              $options: 'i',
            },
          },

          {
            specialization: {
              $regex: normalizedSearch,
              $options: 'i',
            },
          },

          {
            doctorId: {
              $regex: normalizedSearch,
              $options: 'i',
            },
          },
        ];
      }


      const doctors = await Doctor.find(query)
        .populate(
          'userId',
          'email phone city bloodGroup status isDonorAvailable isVerified createdAt'
        )
        .sort({
          createdAt: -1,
        });


      return sendSuccess(
        res,
        'Doctors fetched successfully.',
        doctors
      );
    }


    // ============================================================
    // PATIENTS
    // ============================================================

    if (tab === 'Patients') {
      const query = {};


      if (normalizedBloodGroup) {
        query.bloodGroup =
          normalizedBloodGroup;
      }


      if (normalizedLocation) {
        query.city = {
          $regex: normalizedLocation,
          $options: 'i',
        };
      }


      if (normalizedStatus) {
        query.status =
          normalizedStatus.toLowerCase();
      }


      if (normalizedSearch) {
        query.$or = [
          {
            name: {
              $regex: normalizedSearch,
              $options: 'i',
            },
          },

          {
            email: {
              $regex: normalizedSearch,
              $options: 'i',
            },
          },

          {
            patientId: {
              $regex: normalizedSearch,
              $options: 'i',
            },
          },
        ];
      }


      const patients = await Patient.find(query)
        .populate(
          'userId',
          'email phone city bloodGroup status isDonorAvailable isVerified createdAt'
        )
        .sort({
          createdAt: -1,
        });


      return sendSuccess(
        res,
        'Patients fetched successfully.',
        patients
      );
    }


    // ============================================================
    // HOSPITALS
    // ============================================================

    if (tab === 'Hospitals') {
      const query = {};


      if (normalizedStatus) {
        query.status =
          normalizedStatus;
      }


      if (normalizedSearch) {
        query.$or = [
          {
            name: {
              $regex: normalizedSearch,
              $options: 'i',
            },
          },

          {
            email: {
              $regex: normalizedSearch,
              $options: 'i',
            },
          },

          {
            city: {
              $regex: normalizedSearch,
              $options: 'i',
            },
          },

          {
            hospitalId: {
              $regex: normalizedSearch,
              $options: 'i',
            },
          },
        ];
      }


      const hospitals = await Hospital.find(query)
        .populate(
          'userId',
          'email phone city status isVerified createdAt'
        )
        .sort({
          createdAt: -1,
        });


      return sendSuccess(
        res,
        'Hospitals fetched successfully.',
        hospitals
      );
    }


    // ============================================================
    // PHARMACIES
    // ============================================================

    if (tab === 'Pharmacies') {
      const query = {};


      if (normalizedStatus) {
        query.status =
          normalizedStatus;
      }


      if (normalizedSearch) {
        query.$or = [
          {
            name: {
              $regex: normalizedSearch,
              $options: 'i',
            },
          },

          {
            email: {
              $regex: normalizedSearch,
              $options: 'i',
            },
          },

          {
            city: {
              $regex: normalizedSearch,
              $options: 'i',
            },
          },
        ];
      }


      const pharmacies =
        await Pharmacy.find(query)
          .populate(
            'userId',
            'email phone city status isVerified createdAt'
          )
          .sort({
            createdAt: -1,
          });


      return sendSuccess(
        res,
        'Pharmacies fetched successfully.',
        pharmacies
      );
    }


    return sendValidationError(
      res,
      'Invalid user category.'
    );

  } catch (error) {
    console.error(
      'Admin getUsers error:',
      error
    );

    return sendServerError(
      res,
      'Failed to fetch users.',
      error
    );
  }
};


// ============================================================
// ADMIN APPROVALS
// ============================================================

// @desc    Get all pending approvals
// @route   GET /api/admin/approvals
// @access  Private (Admin)

const getPendingApprovals = async (req, res) => {
  try {
    const [
      doctors,
      hospitals,
      retailPharmacies,
      hospitalPharmacies,
    ] = await Promise.all([

      // ----------------------------------------------------------
      // PENDING DOCTORS
      // ----------------------------------------------------------

      Doctor.find({
        status: 'pending',
      })
        .populate(
          'userId',
          'email phone city bloodGroup status isDonorAvailable isVerified'
        )
        .sort({
          createdAt: -1,
        }),


      // ----------------------------------------------------------
      // PENDING HOSPITALS
      // ----------------------------------------------------------

      Hospital.find({
        status: 'pending',
      })
        .populate(
          'userId',
          'email phone city status isVerified'
        )
        .sort({
          createdAt: -1,
        }),


      // ----------------------------------------------------------
      // PENDING RETAIL PHARMACIES
      // ----------------------------------------------------------

      Pharmacy.find({
        status: 'pending',
        type: 'Retail',
      })
        .populate(
          'userId',
          'email phone city status isVerified'
        )
        .sort({
          createdAt: -1,
        }),


      // ----------------------------------------------------------
      // PENDING HOSPITAL PHARMACIES
      // ----------------------------------------------------------

      Pharmacy.find({
        status: 'pending',
        type: 'Hospital',
      })
        .populate(
          'userId',
          'email phone city status isVerified'
        )
        .populate(
          'hospitalId',
          'name hospitalId'
        )
        .sort({
          createdAt: -1,
        }),
    ]);


    return sendSuccess(
      res,
      'Pending approvals fetched successfully.',
      {
        doctors,
        hospitals,
        retailPharmacies,
        hospitalPharmacies,
      }
    );

  } catch (error) {
    console.error(
      'Get pending approvals error:',
      error
    );

    return sendServerError(
      res,
      'Failed to fetch pending approvals.',
      error
    );
  }
};


// ============================================================
// APPROVE DOCTOR
// ============================================================

// @desc    Approve doctor
// @route   PUT /api/admin/doctor/approve/:id
// @access  Private (Admin)

const approveDoctor = async (req, res) => {
  try {
    const doctor =
      await Doctor.findById(req.params.id);


    if (!doctor) {
      return sendNotFound(
        res,
        'Doctor not found.'
      );
    }


    doctor.status = 'verified';

    await doctor.save();


    await logAdminAction({
      adminId: req.user._id,

      action: 'APPROVE_DOCTOR',

      targetType: 'Doctor',

      targetId: doctor._id,

      description:
        `Approved doctor ${doctor.name}`,

      ipAddress: req.ip,
    });


    return sendSuccess(
      res,
      `Doctor ${doctor.name} approved successfully.`,
      doctor
    );

  } catch (error) {
    console.error(
      'Approve doctor error:',
      error
    );

    return sendServerError(
      res,
      'Failed to approve doctor.',
      error
    );
  }
};


// ============================================================
// REJECT DOCTOR
// ============================================================

// @desc    Reject doctor
// @route   PUT /api/admin/doctor/reject/:id
// @access  Private (Admin)

const rejectDoctor = async (req, res) => {
  try {
    const doctor =
      await Doctor.findById(req.params.id);


    if (!doctor) {
      return sendNotFound(
        res,
        'Doctor not found.'
      );
    }


    const rejectionReason =
      req.body?.rejectionReason?.trim() || '';


    doctor.status = 'rejected';

    await doctor.save();


    const reasonText = rejectionReason
      ? ` Reason: ${rejectionReason}`
      : '';


    await logAdminAction({
      adminId: req.user._id,

      action: 'REJECT_DOCTOR',

      targetType: 'Doctor',

      targetId: doctor._id,

      description:
        `Rejected doctor ${doctor.name}.${reasonText}`,

      ipAddress: req.ip,
    });


    return sendSuccess(
      res,
      `Doctor ${doctor.name} rejected successfully.`,
      doctor
    );

  } catch (error) {
    console.error(
      'Reject doctor error:',
      error
    );

    return sendServerError(
      res,
      'Failed to reject doctor.',
      error
    );
  }
};


// ============================================================
// APPROVE HOSPITAL
// ============================================================

// @desc    Approve hospital
// @route   PUT /api/admin/hospital/approve/:id
// @access  Private (Admin)

const approveHospital = async (req, res) => {
  try {
    const hospital =
      await Hospital.findById(req.params.id);


    if (!hospital) {
      return sendNotFound(
        res,
        'Hospital not found.'
      );
    }


    hospital.status = 'verified';

    await hospital.save();


    await logAdminAction({
      adminId: req.user._id,

      action: 'APPROVE_HOSPITAL',

      targetType: 'Hospital',

      targetId: hospital._id,

      description:
        `Approved hospital ${hospital.name}`,

      ipAddress: req.ip,
    });


    return sendSuccess(
      res,
      `Hospital ${hospital.name} approved successfully.`,
      hospital
    );

  } catch (error) {
    console.error(
      'Approve hospital error:',
      error
    );

    return sendServerError(
      res,
      'Failed to approve hospital.',
      error
    );
  }
};


// ============================================================
// REJECT HOSPITAL
// ============================================================

// @desc    Reject hospital
// @route   PUT /api/admin/hospital/reject/:id
// @access  Private (Admin)

const rejectHospital = async (req, res) => {
  try {
    const hospital =
      await Hospital.findById(req.params.id);


    if (!hospital) {
      return sendNotFound(
        res,
        'Hospital not found.'
      );
    }


    const rejectionReason =
      req.body?.rejectionReason?.trim() || '';


    hospital.status = 'rejected';

    await hospital.save();


    const reasonText = rejectionReason
      ? ` Reason: ${rejectionReason}`
      : '';


    await logAdminAction({
      adminId: req.user._id,

      action: 'REJECT_HOSPITAL',

      targetType: 'Hospital',

      targetId: hospital._id,

      description:
        `Rejected hospital ${hospital.name}.${reasonText}`,

      ipAddress: req.ip,
    });


    return sendSuccess(
      res,
      `Hospital ${hospital.name} rejected successfully.`,
      hospital
    );

  } catch (error) {
    console.error(
      'Reject hospital error:',
      error
    );

    return sendServerError(
      res,
      'Failed to reject hospital.',
      error
    );
  }
};


// ============================================================
// APPROVE PHARMACY
// ============================================================

// @desc    Approve pharmacy
// @route   PUT /api/admin/pharmacy/approve/:id
// @access  Private (Admin)

const approvePharmacy = async (req, res) => {
  try {
    const pharmacy =
      await Pharmacy.findById(req.params.id);


    if (!pharmacy) {
      return sendNotFound(
        res,
        'Pharmacy not found.'
      );
    }


    pharmacy.status = 'verified';

    await pharmacy.save();


    await logAdminAction({
      adminId: req.user._id,

      action: 'APPROVE_PHARMACY',

      targetType: 'Pharmacy',

      targetId: pharmacy._id,

      description:
        `Approved pharmacy ${pharmacy.name}`,

      ipAddress: req.ip,
    });


    return sendSuccess(
      res,
      `Pharmacy ${pharmacy.name} approved successfully.`,
      pharmacy
    );

  } catch (error) {
    console.error(
      'Approve pharmacy error:',
      error
    );

    return sendServerError(
      res,
      'Failed to approve pharmacy.',
      error
    );
  }
};


// ============================================================
// REJECT PHARMACY
// ============================================================

// @desc    Reject pharmacy
// @route   PUT /api/admin/pharmacy/reject/:id
// @access  Private (Admin)

const rejectPharmacy = async (req, res) => {
  try {
    const pharmacy =
      await Pharmacy.findById(req.params.id);


    if (!pharmacy) {
      return sendNotFound(
        res,
        'Pharmacy not found.'
      );
    }


    const rejectionReason =
      req.body?.rejectionReason?.trim() || '';


    pharmacy.status = 'rejected';

    await pharmacy.save();


    const reasonText = rejectionReason
      ? ` Reason: ${rejectionReason}`
      : '';


    await logAdminAction({
      adminId: req.user._id,

      action: 'REJECT_PHARMACY',

      targetType: 'Pharmacy',

      targetId: pharmacy._id,

      description:
        `Rejected pharmacy ${pharmacy.name}.${reasonText}`,

      ipAddress: req.ip,
    });


    return sendSuccess(
      res,
      `Pharmacy ${pharmacy.name} rejected successfully.`,
      pharmacy
    );

  } catch (error) {
    console.error(
      'Reject pharmacy error:',
      error
    );

    return sendServerError(
      res,
      'Failed to reject pharmacy.',
      error
    );
  }
};


// ============================================================
// BLOCK USER
// ============================================================

// @desc    Block user
// @route   PUT /api/admin/users/block/:id
// @access  Private (Admin)

const blockUser = async (req, res) => {
  try {
    const user =
      await User.findById(req.params.id);


    if (!user) {
      return sendNotFound(
        res,
        'User not found.'
      );
    }


    user.status = 'blocked';

    await user.save({
      validateBeforeSave: false,
    });


    // ----------------------------------------------------------
    // Sync role table status
    // ----------------------------------------------------------

    if (user.role === 'Patient') {
      await Patient.findOneAndUpdate(
        {
          userId: user._id,
        },
        {
          status: 'blocked',
        }
      );
    }


    if (user.role === 'Doctor') {
      await Doctor.findOneAndUpdate(
        {
          userId: user._id,
        },
        {
          accountStatus: 'blocked',
        }
      );
    }


    if (user.role === 'Hospital') {
      await Hospital.findOneAndUpdate(
        {
          userId: user._id,
        },
        {
          accountStatus: 'blocked',
        }
      );
    }


    if (user.role === 'Pharmacy') {
      await Pharmacy.findOneAndUpdate(
        {
          userId: user._id,
        },
        {
          accountStatus: 'blocked',
        }
      );
    }


    // ----------------------------------------------------------
    // Log admin action
    // ----------------------------------------------------------

    await logAdminAction({
      adminId: req.user._id,

      action: 'BLOCK_USER',

      targetType: 'User',

      targetId: user._id,

      description:
        `Blocked user ${user.email} (${user.role})`,

      ipAddress: req.ip,
    });


    return sendSuccess(
      res,
      `User ${user.email} has been blocked successfully.`,
      user
    );

  } catch (error) {
    return sendServerError(
      res,
      'Failed to block user.',
      error
    );
  }
};


// ============================================================
// ACTIVATE USER
// ============================================================

// @desc    Activate user
// @route   PUT /api/admin/users/activate/:id
// @access  Private (Admin)

const activateUser = async (req, res) => {
  try {
    const user =
      await User.findById(req.params.id);


    if (!user) {
      return sendNotFound(
        res,
        'User not found.'
      );
    }


    user.status = 'active';

    await user.save({
      validateBeforeSave: false,
    });


    // ----------------------------------------------------------
    // Sync role table status
    // ----------------------------------------------------------

    if (user.role === 'Patient') {
      await Patient.findOneAndUpdate(
        {
          userId: user._id,
        },
        {
          status: 'active',
        }
      );
    }


    if (user.role === 'Doctor') {
      await Doctor.findOneAndUpdate(
        {
          userId: user._id,
        },
        {
          accountStatus: 'active',
        }
      );
    }


    if (user.role === 'Hospital') {
      await Hospital.findOneAndUpdate(
        {
          userId: user._id,
        },
        {
          accountStatus: 'active',
        }
      );
    }


    if (user.role === 'Pharmacy') {
      await Pharmacy.findOneAndUpdate(
        {
          userId: user._id,
        },
        {
          accountStatus: 'active',
        }
      );
    }


    // ----------------------------------------------------------
    // Log admin action
    // ----------------------------------------------------------

    await logAdminAction({
      adminId: req.user._id,

      action: 'ACTIVATE_USER',

      targetType: 'User',

      targetId: user._id,

      description:
        `Activated user ${user.email} (${user.role})`,

      ipAddress: req.ip,
    });


    return sendSuccess(
      res,
      `User ${user.email} has been activated successfully.`,
      user
    );

  } catch (error) {
    return sendServerError(
      res,
      'Failed to activate user.',
      error
    );
  }
};


// ============================================================
// ADMIN PROFILE
// ============================================================

// @desc    Get logged-in admin profile
// @route   GET /api/admin/profile
// @access  Private (Admin)

const getAdminProfile = async (req, res) => {
  try {
    const admin =
      await User.findById(req.user._id)
        .select(
          'name email phone department role status isVerified profileImage createdAt updatedAt'
        );


    if (!admin || admin.role !== 'Admin') {
      return sendNotFound(
        res,
        'Admin profile not found.'
      );
    }


    return sendSuccess(
      res,
      'Admin profile fetched successfully.',
      admin
    );

  } catch (error) {
    return sendServerError(
      res,
      'Failed to fetch admin profile.',
      error
    );
  }
};


// @desc    Update logged-in admin profile
// @route   PUT /api/admin/profile
// @access  Private (Admin)

const updateAdminProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      department,
    } = req.body;


    const admin =
      await User.findById(req.user._id);


    if (!admin || admin.role !== 'Admin') {
      return sendNotFound(
        res,
        'Admin profile not found.'
      );
    }


    if (!name || !name.trim()) {
      return sendValidationError(
        res,
        'Validation failed',
        [
          'Full name is required.',
        ]
      );
    }


    if (!email || !email.trim()) {
      return sendValidationError(
        res,
        'Validation failed',
        [
          'Email address is required.',
        ]
      );
    }


    const normalizedEmail =
      email.trim().toLowerCase();


    // ----------------------------------------------------------
    // Check duplicate email
    // ----------------------------------------------------------

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
        _id: {
          $ne: admin._id,
        },
      });


    if (existingUser) {
      return sendValidationError(
        res,
        'Validation failed',
        [
          'This email address is already in use.',
        ]
      );
    }


    admin.name = name.trim();

    admin.email =
      normalizedEmail;

    admin.phone =
      phone
        ? phone.trim()
        : '';

    admin.department =
      department
        ? department.trim()
        : '';


    await admin.save();


    await logAdminAction({
      adminId: req.user._id,

      action: 'UPDATE_PROFILE',

      targetType: 'User',

      targetId: admin._id,

      description:
        `Admin updated own profile (${admin.email})`,

      ipAddress: req.ip,
    });


    return sendSuccess(
      res,
      'Administrator details updated successfully.',
      {
        id: admin._id,

        name: admin.name,

        email: admin.email,

        phone: admin.phone,

        department:
          admin.department,

        role: admin.role,

        status: admin.status,

        isVerified:
          admin.isVerified,

        profileImage:
          admin.profileImage,
      }
    );

  } catch (error) {
    return sendServerError(
      res,
      'Failed to update admin profile.',
      error
    );
  }
};


// ============================================================
// CHANGE ADMIN PASSWORD
// ============================================================

// @desc    Change logged-in admin password
// @route   PUT /api/admin/profile/password
// @access  Private (Admin)

const changeAdminPassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;


    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return sendValidationError(
        res,
        'Validation failed',
        [
          'Current password, new password and confirmation are required.',
        ]
      );
    }


    if (newPassword.length < 6) {
      return sendValidationError(
        res,
        'Validation failed',
        [
          'New password must be at least 6 characters.',
        ]
      );
    }


    if (
      newPassword !==
      confirmPassword
    ) {
      return sendValidationError(
        res,
        'Validation failed',
        [
          'New password and confirmation do not match.',
        ]
      );
    }


    const admin =
      await User.findById(
        req.user._id
      ).select('+password');


    if (!admin || admin.role !== 'Admin') {
      return sendNotFound(
        res,
        'Admin profile not found.'
      );
    }


    const isMatch =
      await admin.matchPassword(
        currentPassword
      );


    if (!isMatch) {
      return sendUnauthorized(
        res,
        'Current password is incorrect.'
      );
    }


    admin.password =
      newPassword;


    await admin.save();


    await logAdminAction({
      adminId: req.user._id,

      action: 'CHANGE_PASSWORD',

      targetType: 'User',

      targetId: admin._id,

      description:
        'Admin changed own account password',

      ipAddress: req.ip,
    });


    return sendSuccess(
      res,
      'Security password updated successfully.'
    );

  } catch (error) {
    return sendServerError(
      res,
      'Failed to update password.',
      error
    );
  }
};
// ============================================================
// ADMIN MEDICINE MANAGEMENT
// ============================================================

// @desc    Get all medicines for admin verification
// @route   GET /api/admin/medicines
// @access  Private (Admin)
const getAdminMedicines = async (req, res) => {
  try {
    const { search, approvalStatus } = req.query;

    const query = {};

    if (approvalStatus && approvalStatus !== 'All') {
      query.approvalStatus = approvalStatus;
    }

    if (search?.trim()) {
      const searchValue = search.trim();

      query.$or = [
        {
          name: {
            $regex: searchValue,
            $options: 'i',
          },
        },
        {
          genericName: {
            $regex: searchValue,
            $options: 'i',
          },
        },
        {
          manufacturer: {
            $regex: searchValue,
            $options: 'i',
          },
        },
      ];
    }

    const medicines = await Medicine.find(query)
      .populate(
        'pharmacyId',
        'name email phone city state pharmacyId status accountStatus'
      )
      .populate(
        'hospitalId',
        'name email phone city state hospitalId status accountStatus'
      )
      .sort({
        createdAt: -1,
      });

    return sendSuccess(
      res,
      'Admin medicines fetched successfully.',
      medicines
    );
  } catch (error) {
    console.error(
      'Admin get medicines error:',
      error
    );

    return sendServerError(
      res,
      'Failed to fetch medicines.',
      error
    );
  }
};


// @desc    Approve medicine
// @route   PUT /api/admin/medicines/:id/approve
// @access  Private (Admin)
const approveMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(
      req.params.id
    );

    if (!medicine) {
      return sendNotFound(
        res,
        'Medicine not found.'
      );
    }

    medicine.approvalStatus = 'Approved';
    medicine.reviewedDate = new Date();
    medicine.banReason = null;

    await medicine.save();

    await logAdminAction({
      adminId: req.user._id,
      action: 'APPROVE_MEDICINE',
      targetType: 'Medicine',
      targetId: medicine._id,
      description:
        `Approved medicine ${medicine.name}`,
      ipAddress: req.ip,
    });

    return sendSuccess(
      res,
      `Medicine ${medicine.name} approved successfully.`,
      medicine
    );
  } catch (error) {
    console.error(
      'Approve medicine error:',
      error
    );

    return sendServerError(
      res,
      'Failed to approve medicine.',
      error
    );
  }
};


// @desc    Reject medicine
// @route   PUT /api/admin/medicines/:id/reject
// @access  Private (Admin)
const rejectMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(
      req.params.id
    );

    if (!medicine) {
      return sendNotFound(
        res,
        'Medicine not found.'
      );
    }

    const rejectionReason =
      req.body?.rejectionReason?.trim() || '';

    medicine.approvalStatus = 'Rejected';
    medicine.reviewedDate = new Date();
    medicine.banReason =
      rejectionReason || null;

    await medicine.save();

    const reasonText = rejectionReason
      ? ` Reason: ${rejectionReason}`
      : '';

    await logAdminAction({
      adminId: req.user._id,
      action: 'REJECT_MEDICINE',
      targetType: 'Medicine',
      targetId: medicine._id,
      description:
        `Rejected medicine ${medicine.name}.${reasonText}`,
      ipAddress: req.ip,
    });

    return sendSuccess(
      res,
      `Medicine ${medicine.name} rejected successfully.`,
      medicine
    );
  } catch (error) {
    console.error(
      'Reject medicine error:',
      error
    );

    return sendServerError(
      res,
      'Failed to reject medicine.',
      error
    );
  }
};


// @desc    Block medicine
// @route   PUT /api/admin/medicines/:id/block
// @access  Private (Admin)
const blockMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(
      req.params.id
    );

    if (!medicine) {
      return sendNotFound(
        res,
        'Medicine not found.'
      );
    }

    const banReason =
      req.body?.banReason?.trim() || '';

    medicine.approvalStatus = 'Blocked';
    medicine.reviewedDate = new Date();
    medicine.banReason =
      banReason || null;
    medicine.isAvailable = false;

    await medicine.save();

    const reasonText = banReason
      ? ` Reason: ${banReason}`
      : '';

    await logAdminAction({
      adminId: req.user._id,
      action: 'BLOCK_MEDICINE',
      targetType: 'Medicine',
      targetId: medicine._id,
      description:
        `Blocked medicine ${medicine.name}.${reasonText}`,
      ipAddress: req.ip,
    });

    return sendSuccess(
      res,
      `Medicine ${medicine.name} blocked successfully.`,
      medicine
    );
  } catch (error) {
    console.error(
      'Block medicine error:',
      error
    );

    return sendServerError(
      res,
      'Failed to block medicine.',
      error
    );
  }
};


// @desc    Unblock medicine
// @route   PUT /api/admin/medicines/:id/unblock
// @access  Private (Admin)
const unblockMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(
      req.params.id
    );

    if (!medicine) {
      return sendNotFound(
        res,
        'Medicine not found.'
      );
    }

    medicine.approvalStatus = 'Approved';
    medicine.reviewedDate = new Date();
    medicine.banReason = null;
    medicine.isAvailable = medicine.stock > 0;

    await medicine.save();

    await logAdminAction({
      adminId: req.user._id,
      action: 'UNBLOCK_MEDICINE',
      targetType: 'Medicine',
      targetId: medicine._id,
      description:
        `Unblocked medicine ${medicine.name}`,
      ipAddress: req.ip,
    });

    return sendSuccess(
      res,
      `Medicine ${medicine.name} unblocked successfully.`,
      medicine
    );
  } catch (error) {
    console.error(
      'Unblock medicine error:',
      error
    );

    return sendServerError(
      res,
      'Failed to unblock medicine.',
      error
    );
  }
};


// @desc    Delete medicine
// @route   DELETE /api/admin/medicines/:id
// @access  Private (Admin)
const deleteAdminMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(
      req.params.id
    );

    if (!medicine) {
      return sendNotFound(
        res,
        'Medicine not found.'
      );
    }

    const medicineName = medicine.name;
    const medicineId = medicine._id;

    await Medicine.findByIdAndDelete(
      medicineId
    );

    await logAdminAction({
      adminId: req.user._id,
      action: 'DELETE_MEDICINE',
      targetType: 'Medicine',
      targetId: medicineId,
      description:
        `Deleted medicine ${medicineName}`,
      ipAddress: req.ip,
    });

    return sendSuccess(
      res,
      `Medicine ${medicineName} deleted successfully.`
    );
  } catch (error) {
    console.error(
      'Delete medicine error:',
      error
    );

    return sendServerError(
      res,
      'Failed to delete medicine.',
      error
    );
  }
};

// ============================================================
// ADMIN REPORTS
// ============================================================

// @desc    Get admin reports and system analytics
// @route   GET /api/admin/reports
// @access  Private (Admin)

const getReports = async (req, res) => {
  try {
    const totalAppointments =
      await Appointment.countDocuments();


    const completedAppointments =
      await Appointment.countDocuments({
        status: 'Completed',
      });


    const cancelledAppointments =
      await Appointment.countDocuments({
        status: 'Cancelled',
      });


    const totalOrders =
      await Order.countDocuments();


    const deliveredOrders =
      await Order.countDocuments({
        orderStatus: 'Delivered',
      });


    const revenueResult =
      await Order.aggregate([
        {
          $match: {
            orderStatus: {
              $ne: 'Cancelled',
            },
          },
        },

        {
          $group: {
            _id: null,

            totalSales: {
              $sum: '$totalAmount',
            },
          },
        },
      ]);


    const totalSales =
      revenueResult[0]?.totalSales || 0;


    const logs =
      await AdminLog.find()
        .populate(
          'adminId',
          'email'
        )
        .sort({
          createdAt: -1,
        })
        .limit(50);


    return sendSuccess(
      res,
      'Platform reports fetched successfully.',
      {
        analytics: {
          totalAppointments,

          completedAppointments,

          cancelledAppointments,

          appointmentCompletionRate:
            totalAppointments > 0
              ? Number(
                (
                  (
                    completedAppointments /
                    totalAppointments
                  ) * 100
                ).toFixed(1)
              )
              : 0,

          totalOrders,

          deliveredOrders,

          totalSales,
        },

        logs,
      }
    );

  } catch (error) {
    return sendServerError(
      res,
      'Failed to fetch reports.',
      error
    );
  }
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  // Dashboard
  getDashboard,

  // User management
  getUsers,
  blockUser,
  activateUser,

  // Approvals
  getPendingApprovals,
  approveDoctor,
  rejectDoctor,
  approveHospital,
  rejectHospital,
  approvePharmacy,
  rejectPharmacy,

  // Medicine management
  getAdminMedicines,
  approveMedicine,
  rejectMedicine,
  blockMedicine,
  unblockMedicine,
  deleteAdminMedicine,

  // Reports
  getReports,

  // Admin profile
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
};