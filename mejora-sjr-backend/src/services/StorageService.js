const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
    api_key: process.env.CLOUDINARY_API_KEY || '12345',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'abcde'
});

class StorageService {
    async subirImagen(buffer) {
        return new Promise((resolve, reject) => {
            if (!process.env.CLOUDINARY_CLOUD_NAME) {
                console.warn('⚠️ Mock Cloudinary: Simulando subida de imagen porque faltan las credenciales reales en .env');
                return resolve('https://res.cloudinary.com/demo/image/upload/v1614777508/sample.jpg');
            }

            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'mejora_sjr_reportes' },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result.secure_url);
                }
            );

            streamifier.createReadStream(buffer).pipe(uploadStream);
        });
    }
}

module.exports = StorageService;
