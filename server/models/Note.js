const mongoose = require('mongoose');

// Metadata for an admin-uploaded notes PDF. The actual file lives on
// Cloudinary as an `authenticated` asset — it is never publicly reachable
// without a short-lived signed URL generated for entitled users.
const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  publicId: {
    type: String,
    required: true, // Cloudinary public_id
  },
  resourceType: {
    type: String,
    default: 'image', // PDFs stored as image assets so we can render page previews
  },
  format: {
    type: String,
    default: 'pdf',
  },
  bytes: {
    type: Number,
    default: 0,
  },
  uploadedBy: {
    type: String, // admin email
  },
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
