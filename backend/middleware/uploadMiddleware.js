const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure destination directories exist
const uploadDirs = [
  path.join(__dirname, '..', 'uploads'),
  path.join(__dirname, '..', 'uploads', 'doctors'),
  path.join(__dirname, '..', 'uploads', 'hospitals'),
  path.join(__dirname, '..', 'uploads', 'pharmacies'),
  path.join(__dirname, '..', 'uploads', 'medicines'),
  path.join(__dirname, '..', 'uploads', 'reports'),
  path.join(__dirname, '..', 'uploads', 'prescriptions'),
  path.join(__dirname, '..', 'uploads', 'refunds'),
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads';
    if (file.fieldname === 'medicalLicense' && req.body.role === 'Doctor') {
      folder = 'uploads/doctors';
    } else if (file.fieldname === 'medicalLicense' && req.body.role === 'Hospital') {
      folder = 'uploads/hospitals';
    } else if (file.fieldname === 'profileImage') {
      folder = req.body.role === 'Doctor' ? 'uploads/doctors' : 'uploads';
    } else if (file.fieldname === 'medicineImage') {
      folder = 'uploads/medicines';
    } else if (file.fieldname === 'reportFile') {
      folder = 'uploads/reports';
    } else if (file.fieldname === 'qrCodeImage') {
      folder = 'uploads/refunds';
    }
    cb(null, path.join(__dirname, '..', folder));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|pdf|doc|docx/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedExtensions.test(file.mimetype) || file.mimetype.includes('pdf') || file.mimetype.includes('image');

  if (extname || mimetype) {
    return cb(null, true);
  }
  cb(new Error('Invalid file format. Allowed formats: images (jpg, png, webp) and documents (pdf, doc).'));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
});

module.exports = upload;
