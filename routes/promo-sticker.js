let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;

let photoService = require('../services/photo');

// validate forms
let promoStickerForm = require('../forms/promo-sticker');

module.exports = (app, db) => {
    let config = app.get('config');
    let filters = app.get('filters');

    // get all
    router.get('/', (req, res) => {
        db.PromoSticker.find().then(
            (promoStickers) => {
                res.status(200).json({
                    success: true,
                    status: 'green',
                    message: 'Успешно получено',
                    data: {
                        code: 200,
                        message: 'ok',
                        data: {
                            promoStickers: promoStickers
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
                    message: 'Что то пошла не так',
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
        console.log(req.body);
        photoService.uploadOne(req, res).then(
            (file) => {
                console.log(file);
                // filters.input.validate(promoStickerForm);
                let newPromoSticker = new db.PromoSticker({
                    name: req.body.name,
                    image: '/uploads' + file.path.replace(config.UPLOAD_DIR, '')
                });
                newPromoSticker.save().then(
                    (promoSticker) => {
                        res.status(200).json({
                            success: true,
                            status: 'green',
                            message: 'Успешно добавлено',
                            data: {
                                code: 201,
                                message: 'add new',
                                data: {
                                    promoSticker: promoSticker
                                }
                            }
                        });
                    }
                ).catch(
                    (err) => {
                        //console.log(err);
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
                // filters.input.validate(promoStickerForm);
                let newPromoSticker = new db.PromoSticker({
                    name: req.body.name
                });
                newPromoSticker.save().then(
                    (promoSticker) => {
                        res.status(200).json({
                            success: true,
                            status: 'green',
                            message: 'Успешно добавлено',
                            data: {
                                code: 201,
                                message: 'add new',
                                data: {
                                    promoSticker: promoSticker
                                }
                            }
                        });
                    }
                ).catch(
                    (err) => {
                        //console.log(err);
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

        // update promosticker data
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

        photoService.uploadOne(req, res).then(
            (file) => {
                db.PromoSticker.findById(_id).then(
                    (promoSticker) => {
                        if (!promoSticker) {
                            return res.status(200).json({
                                success: false,
                                message: 'Промо стикер не найдено',
                                status: 'yellow',
                                data: {
                                    code: 404,
                                    message: 'promoSticker not found'
                                }
                            });
                        }
                        
                        let updateImage = req.body.image;
                        let removeImagesPromise = [];
                        if (updateImage && promoSticker.image) {
                            if (updateImage !== promoSticker.image) {
                                photoService.remove(promoSticker.image); // delete image
                                promoSticker.image = updateImage;
                                promoSticker.image = file.path ? '/uploads' + file.path.replace(config.UPLOAD_DIR, '') : '';
                            }
                        } 

                        promoSticker.name = req.body.name ? req.body.name : promoSticker.name;

                        promoSticker.save().then(
                            (updatedPromoSticker) => {
                                res.status(200).json({
                                    success: true,
                                    status: 'green',
                                    message: 'Данные промо стикера успешно обнавлены',
                                    data: {
                                        code: 200,
                                        message: 'Updated successful',
                                        data: {
                                            promoSticker: updatedPromoSticker
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

    app.use('/promo-stickers', router);
}