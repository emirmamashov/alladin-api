let express = require('express');
let router = express.Router();
let uploadFile = require('../services/upload');

module.exports = (app, db) => {
    let config = app.get('config');
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
        uploadFile(req, res).then(
            (file) => {
                console.log(file);
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
                    message: 'Что пошло не так',
                    data: {
                        code: 500,
                        message:err
                    }
                });
            }
        );
    });

    app.use('/promo-stickers', router);
}