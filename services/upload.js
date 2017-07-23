let multer = require('multer');
let config = require('../config');
let storage = require('./storage');

multer = multer({ storage: storage });
let uploadOne = multer.single('file');
let uploadMultiple = multer.array('file');

module.exports = {
    multiple(req, res) {
        return new Promise((resolve, reject) => {
            uploadMultiple(req, res, (err) => {
                if (err) {
                    reject(err);
                }

                console.log(req.body);
                resolve(req.files);
            });
        });
    },

    one(req, res) {
        return new Promise((resolve, reject) => {
            uploadOne(req, res, (err) => {
                if (err) {
                    reject(err);
                }

                console.log(req.body);
                resolve(req.file);
            });
        });
    }
}