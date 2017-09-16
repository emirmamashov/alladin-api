let multer = require('multer');
let config = require('../config');
let storage = require('./storage');
let request = require('request');

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
    },
    uploadNetwork (url, fileName) {
        console.log('-------------uploadNetwork-------------', url, fileName);
        return new Promise((resolve, reject) => {
            let uniqueName = fileName + '_' + Date.now().toString();
            let newurl = config.UPLOAD_DIR+'/' + uniqueName;
            let streamReq = request(url).on('response', (response, err) => {
                console.log('---------request download in network----------');
                if (response.statusCode === 200) {
                    var file = streamReq.pipe(fs.createWriteStream(newurl));
                    file.on('finish',function (err) {
                        console.log(err);
                        if (err) reject(err);
                        resolve('/uploads'+newurl.replace(config.UPLOAD_DIR, ''));
                    });
                } else {
                    reject(err);
                }
            });
        });
    }
}