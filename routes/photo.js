let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;

// forms
let photoForm = require('../forms/photo');

// services
let uploadFile = require('../services/upload');
let translitService = require('../services/translit');

module.exports = (app, db) => {
    let config = app.get('config');
    let filters = app.get('filters');

    router.get('/', (req, res) => {
        db.Photo.find().then(
            (photos) => {
                res.status(200).json({
                    success: true,
                    status: 'green',
                    message: 'Успешно получено',
                    data: {
                        code: 200,
                        message: 'get all Photos',
                        data: {
                            photos: photos
                        }
                    }
                });
            }
        ).catch(
            (err) => {
                console.log(err);
                res.status(200).json({
                    success: false,
                    status: 'red',
                    message: 'Что то пошло не так',
                    data: {
                        code: 500,
                        message: err
                    }
                });
            }
        );
    });

    router.post('/add', (req, res) => {
        uploadFile(req, res).then(
            (file) => {
                if (!file) {
                    return res.status(200).json({
                        success: false,
                        message: 'Что то пошло не так',
                        status: 'red',
                        data: {
                            code: 500,
                            message: 'file is not'
                        }
                    });
                }
                let urlPhoto = file ? '/uploads' + file.path.replace(config.UPLOAD_DIR, '') : '';
                req.body.url = urlPhoto;
                let newPhoto = db.Photo(req.body);

                filters.input.validate(photoForm);
                newPhoto.save().then(
                    (photo) => {
                        res.status(200).json({
                            success: true,
                            message: 'Успешно сохранено',
                            status: 'green',
                            data: {
                                code: 200,
                                message: 'ok',
                                data: {
                                    photo: photo
                                }
                            }
                        });
                    }
                ).catch(
                    (err) => {
                        console.log(err);
                        res.status(200).json({
                            success: false,
                            message: 'Что то пошло не так',
                            status: 'red',
                            data: {
                                code: 500,
                                message: err
                            }
                        });
                    }
                );
            }
        ).catch(
            (err) => {
                console.log(err);
                res.status(200).json({
                    success: false,
                    message: 'Что то пошло не так',
                    status: 'red',
                    data: {
                        code: 500,
                        message: err
                    }
                });
            }
        );
    });

    app.use('/photos', router);
}