const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const qr = require('qr-image');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'Tipping',
      allowedFormats:["png","jpg","jpeg"] ,
    }
  });
   
/**
 * Uploads a QR code to Cloudinary
 * @param {string} qrData - The data to encode in the QR code
 * @param {string} filename - The desired filename for the QR code
 * @returns {Promise<object>} - The Cloudinary upload result
 */
async function uploadQRCodeToCloudinary(qrData, filename) {
  const qrCodeStream = qr.image(qrData, { type: 'png' });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'Tipping/QRcodes', // Upload to a specific folder
        public_id: filename, // Define public ID for the file
        format: 'png', // Ensure the file format is PNG
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    qrCodeStream.pipe(uploadStream); // Pipe the QR code stream to Cloudinary upload stream
  });
}

module.exports = { cloudinary, storage, uploadQRCodeToCloudinary };