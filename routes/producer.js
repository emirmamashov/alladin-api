let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;

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


    // update category data
    router.put('/update/:id', (req, res) => {
        let _id = req.params.id;
        if (!_id || !ObjectId.isValid(_id)) {
            return res.status(200).json({
                success: false,
                status: 'yellow',
                message: 'Параметер неправильно передано',
                data: {
                    code: 403,
                    message: 'Parameters not valid'
                }
            });
        }

        photoService.uploadMultiple(req, res).then(
            (files) => {
                db.Producer.findById(_id).then(
                    (producer) => {
                        if (!producer) {
                            return res.status(200).json({
                                success: false,
                                message: 'Производитель не найден',
                                status: 'yellow',
                                data: {
                                    code: 404,
                                    message: 'producer not found'
                                }
                            });
                        }
                        
                        let updateImagesArr = req.body.imagesString.split(',');
                        let removeImagesPromise = [];
                        if (updateImagesArr && producer.images && producer.images.length > 0) {
                            producer.images.forEach((url) => {
                                let imageFind = updateImagesArr.filter(x => x === url);
                                if (imageFind.length === 0) {
                                    removeImagesPromise.push(photoService.remove(url)); // delete image
                                    producer.images = producer.images.filter(x => x !== url);
                                }
                            });
                        }
                        
                        if (files && files.length > 0) {
                            let urlPhoto = files ? '/uploads' + files[0].path.replace(config.UPLOAD_DIR, '') : '';
                            producer.image = urlPhoto;
                            files.forEach((file) => {
                                if (file) {
                                    producer.images.push('/uploads' + file.path.replace(config.UPLOAD_DIR, ''));
                                }
                            });
                        }

                        producer.name = req.body.name ? req.body.name : producer.name;
                        producer.description = req.body.description ? req.body.description : producer.description;
                        producer.keywords = req.body.keywords ? req.body.keywords : producer.keywords;
                        producer.author = req.body.author ? req.body.author : producer.author;

                        producer.save().then(
                            (updatedProducer) => {
                                Promise.all(removeImagesPromise).then(
                                    (response) => {
                                        console.log(response);
                                    }).catch((err) => {
                                        console.log(err);
                                    });
                                res.status(200).json({
                                    success: true,
                                    status: 'green',
                                    message: 'Данные производителя успешно обнавлены',
                                    data: {
                                        code: 200,
                                        message: 'Updated successful',
                                        data: {
                                            producer: updatedProducer
                                        }
                                    }
                                });
                            }).catch(
                                (err) => {
                                    console.log(err);
                                    res.status(200).json({
                                        success: false,
                                        status: 'red',
                                        message: 'что то пошло не так',
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
            }
        ).catch(
            (err) => {
                console.log(err);
                db.Producer.findById(_id).then(
                    (producer) => {
                        if (!producer) {
                            return res.status(200).json({
                                success: false,
                                message: 'Производитель не найдено',
                                status: 'yellow',
                                data: {
                                    code: 404,
                                    message: 'producer not found'
                                }
                            });
                        }

                        let updateImagesArr = req.body.imagesString.split(',');
                        let removeImagesPromise = [];
                        if (updateImagesArr && producer.images && producer.images.length > 0) {
                            producer.images.forEach((url) => {
                                let imageFind = updateImagesArr.filter(x => x === url);
                                if (imageFind.length === 0) {
                                    removeImagesPromise.push(photoService.remove(url)); // delete image
                                    producer.images = producer.images.filter(x => x !== url);
                                }
                            });
                        }

                        producer.name = req.body.name ? req.body.name : producer.name;
                        producer.description = req.body.description ? req.body.description : producer.description;
                        producer.keywords = req.body.keywords ? req.body.keywords : producer.keywords;
                        producer.author = req.body.author ? req.body.author : producer.author;

                        producer.save().then(
                            (updatedProducer) => {
                                Promise.all(removeImagesPromise).then(
                                    (response) => {
                                        console.log(response);
                                    }).catch((err) => {
                                        console.log(err);
                                    });
                                res.status(200).json({
                                    success: true,
                                    status: 'green',
                                    message: 'Данные категории успешно обнавлены',
                                    data: {
                                        code: 200,
                                        message: 'Updated successful',
                                        data: {
                                            producer: updatedProducer
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
                                    message: 'что то пошло не так',
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
                            status: 'red',
                            message: 'Что то пошло не так',
                            data: {
                                code: 500,
                                message: err
                            }
                        });
                    }
                );
            }
        );
        
    });

    app.use('/producers', router);
}