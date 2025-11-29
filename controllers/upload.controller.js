const fs = require('fs');
const path = require('path');

// Delete old file helper
const deleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log('🗑️ Deleted old file:', filePath);
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  }
};

exports.uploadImage = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate URL for frontend
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    res.status(200).json({
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        imageUrl: imageUrl,
        imagePath: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteImage = (req, res, next) => {
  try {
    const { filename } = req.params;
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const filePath = path.join(uploadDir, filename);

    deleteFile(filePath);

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports.deleteFile = deleteFile;
