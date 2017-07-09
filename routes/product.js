let express = require('express');
let router = express.Router();

// services
let uploadFile = require('../services/upload');

// valudate forms
let productForm = require('../forms/producer');

module.exports = (app, db) => {
    let config = app.get('config');
    let filters = app.get('filters');

    // get all products
    router.get('/', (req, res) => {
        db.Product.find().then(
            (products) => {

                res.status(200).json({
                    success: true,
                    status: 'green',
                    message: 'Успешно получено',
                    data: {
                        code: 200,
                        message: 'Успешно получено',
                        data: {
                            products: products
                        }
                    }
                });
            }
        ).catch(
            (err) => {
                res.status(200).json({
                    success: false,
                    status: 'red',
                    message: 'Что то пошло не так(',
                    data: {
                        code: 500,
                        message: err
                    }
                });
            }
        );
    });

    // get by id
    router.get('/:id', (req, res) => {
        let id = req.params.id;
        db.Product.findById(id).then(
            (product) => {
                res.status(200).json({
                    success: false,
                    status: 'green',
                    message: 'Успешно',
                    data: {
                        code: 200,
                        message: 'успешно',
                        data: {
                            product: product
                        }
                    }
                });
            }
        ).catch(
            (err) => {
                res.status(200).json({
                    success: false,
                    status: 'red',
                    message: 'Что то пошло не так(',
                    data: {
                        code: 500,
                        message: err
                    }
                });
            }
        );
    });

    // add new product
    router.post('/add', (req, res) => {
        uploadFile(req, res).then(
            (file) => {
                let name = req.body.name;
                if (!name) return res.status(200).json({
                    success: false,
                    status: 'yellow',
                    message: 'Введите наименование товара',
                    data: {
                        code: 403,
                        message: 'name is null'
                    }
                });

                console.log(req.body);
                let newProduct = new db.Product({
                    name: name,
                    htmlH1: req.body.htmlH1 || '',
                    htmlTitle: req.body.htmlTitle || '',
                    metaDescription: req.body.metaDescription || '',
                    metaKeywords: req.body.metaKeywords || '',
                    description: req.body.description || '',
                    tegs: req.body.tegs || '',
                    phone: req.body.phone || null,
                    price: req.body.price || null,
                    priceStock: req.body.priceStock || null,
                    seoUrl: req.body.seoUrl ? req.body.seoUrl : '',
                    promoStickers: req.body.promoStickers || [],
                    image: file ? '/uploads' + file.path.replace(config.UPLOAD_DIR, '') : '',
                    producerId: req.body.producerId || null,
                    categoryId: req.body.categoryId || null,
                    categories: req.body.categories || []
                });

                console.log(newProduct);

                newProduct.save().then(
                    () => {
                        res.status(200).json({
                            success: true,
                            status: 'green',
                            message: 'Успешно',
                            data: {
                                code: 200,
                                message: 'Успешно',
                                data: {
                                    product: newProduct
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
                                code: 200,
                                message: err
                            }
                        });
                    }
                );
            }
        ).catch(
            (err) => {
                console.log(err);
                let name = req.body.name;
                if (!name) return res.status(200).json({
                    success: false,
                    status: 'yellow',
                    message: 'Введите наименование товара',
                    data: {
                        code: 403,
                        message: 'name is null'
                    }
                });
                let newProduct = new db.Product({
                    name: req.body.name || '',
                    htmlH1: req.body.htmlH1 || '',
                    htmlTitle: req.body.htmlTitle || '',
                    metaDescription: req.body.metaDescription || '',
                    metaKeywords: req.body.metaKeywords || '',
                    description: req.body.description || '',
                    tegs: req.body.tegs || '',
                    phone: req.body.phone || null,
                    price: req.body.price || null,
                    priceStock: req.body.priceStock || null,
                    seoUrl: req.body.seoUrl || '',
                    promoStickers: req.body.promoStickers || [],
                    producerId: req.body.producerId || null,
                    categoryId: req.body.categoryId || null,
                    categories: req.body.categories || []
                });

                newProduct.save().then(
                    () => {
                        res.status(200).json({
                            success: true,
                            status: 'green',
                            message: 'Успешно',
                            data: {
                                code: 200,
                                message: 'Успешно',
                                data: {
                                    product: newProduct
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
                                code: 200,
                                message: err
                            }
                        });
                    }
                );
            }
        );
    });

    router.put('/edit', (req, res) => {
        uploadFile(req, res).then(
            (file) => {
                console.log(req.body);
                let name = req.body.name;
                if (!name) return res.status(200).json({
                    success: false,
                    status: 'yellow',
                    message: 'Введите наименование товара',
                    data: {
                        code: 403,
                        message: 'name is null'
                    }
                });
                req.body.image = file ? '/uploads' + file.path.replace(config.UPLOAD_DIR, '') : '';
                db.Product.findById(req.body._id).then(
                    (product) => {
                        console.log(product);
                        if (!product) {
                            return res.status(200).json({
                                success: false,
                                status: 'yellow',
                                message: 'Товар не найдено',
                                data: {
                                    code: 404,
                                    message: 'product not found'
                                }
                            });
                        }

                        product.name = req.body.name;
                        product.htmlH1 = req.body.htmlH1;
                        product.htmlTitle = req.body.htmlTitle;
                        product.metaDescription = req.body.metaDescription;
                        product.metaKeywords = req.body.metaKeywords;
                        product.description = req.body.description;
                        product.tegs = req.body.tegs;
                        product.phone = req.body.phone;
                        product.price = req.body.price;
                        product.priceStock = req.body.priceStock;
                        product.seoUrl = req.body.seoUrl;
                        product.promoStickers = req.body.promoStickers;
                        product.image = file ? '/uploads' + file.path.replace(config.UPLOAD_DIR, '') : '';
                        product.producerId = req.body.producerId;
                        product.categoryId = req.body.categoryId;
                        product.categories = req.body.categories;

                        product.save().then(
                            () => {
                                res.status(200).json({
                                    success: true,
                                    status: 'green',
                                    message: 'Сохранено',
                                    data: {
                                        code: 200,
                                        message: 'Update success!',
                                        data: {
                                            product: product
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
                    }
                ).catch(
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
                console.log(req.body);
                let name = req.body.name;
                if (!name) return res.status(200).json({
                    success: false,
                    status: 'yellow',
                    message: 'Введите наименование товара',
                    data: {
                        code: 403,
                        message: 'name is null'
                    }
                });
                req.body.image = file ? '/uploads' + file.path.replace(config.UPLOAD_DIR, '') : '';
                db.Product.findById(req.body._id).then(
                    (product) => {
                        console.log(product);
                        if (!product) {
                            return res.status(200).json({
                                success: false,
                                status: 'yellow',
                                message: 'Товар не найдено',
                                data: {
                                    code: 404,
                                    message: 'product not found'
                                }
                            });
                        }

                        product.name = req.body.name;
                        product.htmlH1 = req.body.htmlH1;
                        product.htmlTitle = req.body.htmlTitle;
                        product.metaDescription = req.body.metaDescription;
                        product.metaKeywords = req.body.metaKeywords;
                        product.description = req.body.description;
                        product.tegs = req.body.tegs;
                        product.phone = req.body.phone;
                        product.price = req.body.price;
                        product.priceStock = req.body.priceStock;
                        product.seoUrl = req.body.seoUrl;
                        product.promoStickers = req.body.promoStickers;
                        product.image = file ? '/uploads' + file.path.replace(config.UPLOAD_DIR, '') : '';
                        product.producerId = req.body.producerId;
                        product.categoryId = req.body.categoryId;
                        product.categories = req.body.categories;

                        product.save().then(
                            () => {
                                res.status(200).json({
                                    success: true,
                                    status: 'green',
                                    message: 'Сохранено',
                                    data: {
                                        code: 200,
                                        message: 'Update success!',
                                        data: {
                                            product: product
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
                    }
                ).catch(
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

    app.use('/products', router);
}