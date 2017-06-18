let multer = require('multer');
let fs = require('fs');
let mkdirp = require('mkdirp');
let path = require('path');
let config = require('../config');

module.exports = multer.diskStorage({
    destination: (req, file, callback) => {
        let date = new Date();
        let uploadDir = path.join(config.UPLOAD_DIR, date.getFullYear().toString(), date.getMonth().toString());

        fs.stat(uploadDir, (err) => {
            if (err) {
                return mkdirp(uploadDir, (err) => {
                    if (err) {
                        return callback(err, null);
                    }
                    return callback(null, uploadDir);
                });
            }
            return callback(null, uploadDir);
        });
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
});
