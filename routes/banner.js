let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;

// validate forms
let bannerForm = require('../forms/banner');

// services
let photoService = require('../services/photo');

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
        photoService.uploadMultiple(req, res).then(
            (files) => {
                let newBanner = new db.Banner(req.body);

                if (files && files.length > 0) {
                    let urlPhoto = files ? '/uploads' + files[0].path.replace(config.UPLOAD_DIR, '') : '';
                    newBanner.image = urlPhoto;
                    files.forEach((file) => {
                        if (file) {
                            newBanner.images.push('/uploads' + file.path.replace(config.UPLOAD_DIR, ''));
                        }
                    });
                }
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
                db.Banner.findById(_id).then(
                    (banner) => {
                        if (!banner) {
                            return res.status(200).json({
                                success: false,
                                message: 'Баннер не найдено',
                                status: 'yellow',
                                data: {
                                    code: 404,
                                    message: 'banner not found'
                                }
                            });
                        }
                        
                        let updateImagesArr = req.body.images;
                        let removeImagesPromise = [];
                        if (updateImagesArr && banner.images && banner.images.length > 0) {
                            banner.images.forEach((url) => {
                                let imageFind = updateImagesArr.filter(x => x === url);
                                if (imageFind.length === 0) {
                                    removeImagesPromise.push(photoService.remove(url)); // delete image
                                    banner.images = banner.images.filter(x => x !== url);
                                }
                            });
                        }
                        
                        if (files && files.length > 0) {
                            let urlPhoto = files ? '/uploads' + files[0].path.replace(config.UPLOAD_DIR, '') : '';
                            banner.image = urlPhoto;
                            files.forEach((file) => {
                                if (file) {
                                    banner.images.push('/uploads' + file.path.replace(config.UPLOAD_DIR, ''));
                                }
                            });
                        }

                        banner.name = req.body.name ? req.body.name : banner.name;
                        banner.category = ObjectId.isValid(req.body.category) ? req.body.category : banner.category;
                        banner.buttonLink = req.body.buttonLink ? req.body.buttonLink : banner.buttonLink;
                        banner.buttonName = req.body.buttonName ? req.body.buttonName : banner.buttonName;
                        banner.isShowInMainPage = req.body.isShowInMainPage;
                        banner.showInMainPageLeft = req.body.showInMainPageLeft;
                        banner.showInMainPageRight = req.body.showInMainPageRight;
                        console.log(banner);
                        banner.save().then(
                            (updatedBanner) => {
                                Promise.all(removeImagesPromise).then(
                                    (response) => {
                                        console.log(response);
                                    }).catch((err) => {
                                        console.log(err);
                                    });
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

    router.delete('/remove/:id', (req, res) => {
        let _id = req.params.id;
        if(!_id || !ObjectId.isValid(_id)) {
            return res.status(200).json({
                success: false,
                status: 'yellow',
                message: 'Параметры неправильного формата',
                data: {
                    code: 403,
                    message: 'Parameter not valid'
                }
            });
        }

        db.Banner.findByIdAndRemove(_id).then(
            (banner) => {
                if(!banner) {
                    return res.status(200).json({
                        success: false,
                        status: 'yellow',
                        message: 'Не найдено',
                        data: {
                            code: 404,
                            message: 'not found'
                        }
                    });
                }
                let photoRemovePromise = [];
                if (banner.images && banner.images.length > 0) {
                    banner.images.forEach((url) => {
                        photoRemovePromise.push(photoService.remove(url));
                    });
                }

                Promise.all(photoRemovePromise).then(
                    (response) => {
                        console.log(response);
                    }).catch((err) => {
                        console.log(err);
                    });

                res.status(200).json({
                    success: true,
                    status: 'green',
                    message: 'Успешно удалено',
                    data: {
                        code: 200,
                        message: 'Success delete category',
                        data: {
                            banner: banner
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

    app.use('/banners', router);
}