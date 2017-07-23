let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;

// validate forms
let bannerForm = require('../forms/banner');

// services
let upload = require('../services/upload');

module.exports = (app, db) => {
    let filters = app.get('filters');
    let config = app.get('config');

    // get all
    router.get('/', (req, res) => {
        db.Banner.find().then(
            (banners) => {
                res.status(200).json({
                    success: true,
                    status: 'green',
                    message: 'Успешно',
                    data: {
                        code: 200,
                        message: 'Успешно',
                        data: {
                            banners: banners
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

    // add new banner
    router.post('/add', (req, res) => {
        console.log('------------- add new banner --------------');
        console.log(req.body);
        upload.multiple(req, res).then(
            (files) => {
                filters.input.validate(bannerForm);
                let newBanner = new db.Banner(req.body);
                let urlPhoto = files ? '/uploads' + files[0].path.replace(config.UPLOAD_DIR, '') : '';
                newBanner.image = urlPhoto;
                files.forEach((file) => {
                    if (file) {
                        newBanner.images.push('/uploads' + file.path.replace(config.UPLOAD_DIR, ''));
                    }
                });
                newBanner.category = ObjectId.isValid(newBanner.category) ? newBanner.category : null;
                newBanner.save().then(
                    (banner) => {
                        res.status(200).json({
                            success: true,
                            message: 'Успешно',
                            status: 'green',
                            data: {
                                code: 200,
                                message: 'Добавлено',
                                data: {
                                    banner: banner
                                }
                            }
                        });
                    }).catch(
                        (err) => {
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
                let newBanner = new db.Banner(req.body);
                newBanner.save().then(
                    (banner) => {
                        let bannerPhotoIdString = banner.photo ? banner.photo.toString() : '';
                        db.Photo.findById(bannerPhotoIdString).then(
                            (photo) => {
                                banner.photo = photo || {};

                                res.status(200).json({
                                    success: true,
                                    message: 'Успешно',
                                    status: 'green',
                                    data: {
                                        code: 200,
                                        message: 'Добавлено',
                                        data: {
                                            banner: banner
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
                    }).catch(
                        (err) => {
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
        );
    });


    // update banner data
    router.put('/update/:id', filters.input.validate(bannerForm), (req, res) => {
        let _id = req.params.id;
        db.Banner.findById(_id).then(
            (banner) => {
                if (!banner) {
                    return res.status(200).json({
                        success: false,
                        message: 'Баннер не найден',
                        status: 'yellow',
                        data: {
                            code: 404,
                            message: 'Banner not found'
                        }
                    });
                }

                banner.name = req.body.name ? req.body.name : banner.name;
                banner.photo = req.body.photo ? req.body.photo : banner.photo;
                if (banner.buttonLink || req.body.buttonLink) {
                    banner.buttonLink = req.body.buttonLink ? req.body.buttonLink : category.buttonLink;
                }
                if (banner.buttonName || req.body.buttonName) {
                    banner.buttonName = req.body.buttonName ? req.body.buttonName : category.buttonName;
                }

                banner.save().then(
                    (updatedBanner) => {
                        res.status(200).json({
                            success: true,
                            status: 'green',
                            message: 'Данные баннера успешно обнавлены',
                            data: {
                                code: 200,
                                message: 'Updated successful',
                                data: {
                                    banner: updatedBanner
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
    });

    app.use('/banners', router);
}