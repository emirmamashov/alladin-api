let multer = require('multer');
let config = require('../config');
let storage = require('./storage');

multer = multer({ storage: storage });
let upload = multer.single('file');

module.exports = (req, res) => {
    return new Promise((resolve, reject) => {
        upload(req, res, (err) => {
            if (err) {
                reject(err);
            }

            console.log(req.body);
            resolve(req.file);
        });
    });
}