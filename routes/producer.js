let express = require('express');
let router = express.Router();

// validate forms
let producerForm = require('../forms/producer');

// services
let photoService = require('../services/photo');

module.exports = (app, db) => {
    let filters = app.get('filters');
    let config = app.get('config');

    // get all
    router.get('/', (req, res) => {
        db.Producer.find().then(
            (producers) => {
                res.status(200).json({
                    success: true,
                    status: 'green',
                    message: 'Успешно выполнено',
                    data: {
                        code: 200,
                        message: 'ok',
                        data: {
                            producers: producers
                        }
                    }
                });
            }
        ).catch(
            (err) => {
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

    // add new
    router.post('/add', (req, res) => {
        console.log('------------- add new producer --------------');
        photoService.uploadMultiple(req, res).then(
            (files) => {
                let newproducer = new db.Producer(req.body);
                if (files && files.length > 0) {
                    let urlPhoto = files ? '/uploads' + files[0].path.replace(config.UPLOAD_DIR, '') : '';
                    newproducer.image = urlPhoto;
                    files.forEach((file) => {
                        if (file) {
                            newproducer.images.push('/uploads' + file.path.replace(config.UPLOAD_DIR, ''));
                        }
                    });
                }
                newproducer.save().then(
                    (producer) => {
                        res.status(200).json({
                            success: true,
                            status: 'green',
                            message: 'Сохранено',
                            data: {
                                code: 201,
                                message: 'Create',
                                data: {
                                    producer: producer
                                }
                            }
                        });
                    }).catch(
                        (err) => {
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
        }).catch(
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

    app.use('/producers', router);
}