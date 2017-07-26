let multer = require('multer');
let config = require('../config');
let storage = require('./storage');

multer = multer({ storage: storage });
let singleUpload = multer.single('file');
let multipleUpload = multer.array('file');

let fs = require('fs');

module.exports = {
    uploadMultiple(req, res) {
        return new Promise((resolve, reject) => {
            multipleUpload(req, res, (err) => {
                if (err) {
                    reject(err);
                }

                console.log(req.body);
                resolve(req.files);
            });
        });
    },

    uploadOne(req, res) {
        return new Promise((resolve, reject) => {
            singleUpload(req, res, (err) => {
                if (err) {
                    reject(err);
                }

                console.log(req.body);
                resolve(req.file);
            });
        });
    },

    remove(url) {
        return new Promise((resolve, reject) => {
            if (url) {
                fs.unlink(config.STATIC_DIR + url, (err) => {
                    if (err) {
                        reject(err);
                    }

                    resolve('ok');
                });
            } else {
                reject('url is not defined');
            }
        });
    }
}