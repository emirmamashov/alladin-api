let express = require('express');
let router = express.Router();
let XLSX = require('xlsx');
let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;


// services
let photoService = require('../services/photo');
let translitService = require('../services/translit');

// valudate forms
let productForm = require('../forms/product');

module.exports = (app, db) => {
    let config = app.get('config');
    let filters = app.get('filters');

    // get all products
    router.get('/', (req, res) => {
        db.Product.find().then(
            (products) => {
                db.Photo.find().then(
                    (photos) => {
                        res.status(200).json({
                            success: true,
                            status: 'green',
                            message: 'Успешно',
                            data: {
                                code: 200,
                                message: 'ok',
                                data: {
                                    products: products,
                                    photos: photos
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
        photoService.uploadMultiple(req, res).then(
            (files) => {
                console.log(req.body);
                filters.input.validate(productForm);
                let newProduct = new db.Product(req.body);
                if (files && files.length > 0) {
                    let urlPhoto = files ? '/uploads' + files[0].path.replace(config.UPLOAD_DIR, '') : '';
                    newProduct.image = urlPhoto;
                    newProduct.images = newProduct.images || [];
                    files.forEach((file) => {
                        if (file) {
                            newProduct.images.push('/uploads' + file.path.replace(config.UPLOAD_DIR, ''));
                        }
                    });
                }

                newProduct.promoStickerId = ObjectId.isValid(newProduct.promoStickerId) ? newProduct.promoStickerId : null;
                newProduct.producerId = ObjectId.isValid(newProduct.producerId) ? newProduct.producerId : null;
                newProduct.categoryId = ObjectId.isValid(newProduct.categoryId) ? newProduct.categoryId : null;
                if (newProduct.categories && newProduct.categories.length > 0) {
                    newProduct.categories.forEach((categoryId) => {
                        if (ObjectId.isValid(categoryId)) {
                            newProduct.categories.push(categoryId);
                        }
                    });
                }

                console.log(newProduct);
                newProduct.save().then(
                    (product) => {
                        res.status(200).json({
                            success: true,
                            status: 'green',
                            message: 'Успешно',
                            data: {
                                code: 200,
                                message: 'Успешно',
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
                console.log(err);
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
    });

    router.put('/update', (req, res) => {
        photoService.uploadMultiple(req, res).then(
            (files) => {
                console.log(req.body);
                let name = req.body.name;
                if (!name) {
                    return res.status(200).json({
                        success: false,
                        status: 'yellow',
                        message: 'Введите наименование товара',
                        data: {
                            code: 403,
                            message: 'name is null'
                        }
                    });
                }

                const _id = req.body._id;
                if(!ObjectId.isValid(req.body._id)) {
                    return res.status(200).json({
                        success: false,
                        status: 'yellow',
                        message: 'Параметры переданы неправильном формате',
                        data: {
                            code: 403,
                            message: 'parameter not valid data'
                        }
                    });
                }

                db.Product.findById(_id).then(
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

                        let updateImagesArr = req.body.images || [];
                        let removeImagesPromise = [];
                        if (updateImagesArr && product.images && product.images.length > 0) {
                            product.images.forEach((url) => {
                                let imageFind = updateImagesArr.filter(x => x === url);
                                if (imageFind.length === 0) {
                                    removeImagesPromise.push(photoService.remove(url)); // delete image
                                    product.images = product.images.filter(x => x !== url);
                                }
                            });
                        }
                        
                        if (files && files.length > 0) {
                            let urlPhoto = files ? '/uploads' + files[0].path.replace(config.UPLOAD_DIR, '') : '';
                            product.image = urlPhoto;
                            files.forEach((file) => {
                                if (file) {
                                    product.images.push('/uploads' + file.path.replace(config.UPLOAD_DIR, ''));
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
                        product.isHot = req.body.isHot || false;            

                        product.promoStickerId = ObjectId.isValid(product.promoStickerId) ? product.promoStickerId : null;
                        product.producerId = ObjectId.isValid(product.producerId) ? product.producerId : null;
                        product.categoryId = ObjectId.isValid(product.categoryId) ? product.categoryId : null;
                        if (product.categories && product.categories.length > 0) {
                            product.categories.forEach((categoryId) => {
                                if (ObjectId.isValid(categoryId)) {
                                    product.categories.push(categoryId);
                                }
                            });
                        }

                        product.save().then(
                            () => {
                                Promise.all(removeImagesPromise).then(
                                    (response) => {
                                        console.log(response);
                                    }).catch((err) => {
                                        console.log(err);
                                    });
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

    router.post('/import', (req, res) => {
        let multiparty = require('multiparty');
        let form = new multiparty.Form();

        form.parse(req, (err, fields, files) => {
            console.log(files.file[0]);
            let fileUrl = files.file[0].path;

            /* Call XLSX */
            let workbook = XLSX.readFile(fileUrl);
            //console.log(workbook);
            let first_sheet_name = workbook.SheetNames[0];
            let address_of_cell = 'A1';

            /* Get worksheet */
            let worksheet = workbook.Sheets[first_sheet_name];

            /* Find desired cell */
            let desired_cell = worksheet[address_of_cell];

            /* Get the value */
            let desired_value = desired_cell.v;
            let resultsExelJson = XLSX.utils.sheet_to_json(worksheet,{raw:true});
            console.log(resultsExelJson);
            
            let productsPromise = [];
            let importFailedProducts = [];
            resultsExelJson.forEach((product) => {
                let name = product['Название товара'];
                let translit_name = translitService.translitToLatin(name);
                let translit_for_seo = translitService.translitToLatinForSeoUrl(name);
                if (name) {
                    console.log(mongoose.Types.ObjectId.isValid('53cb6b9b4f4ddef1ad47f943'));
                    let product_categoryIds_string = product['ID категорий где будет отображаться товар, через запятую'] || '';
                    let categoryIds = [];
                    if (product_categoryIds_string) {
                        categoryIds = product_categoryIds_string.split(',');
                    }
                    categoryIds.forEach((categoryId) => {
                        if (!ObjectId.isValid(categoryId)) {
                            categoryIds = categoryIds.filter(x => x !== categoryId);
                        }
                    });

                    let newProductValid = {
                        name: product['Название товара'] || '',
                        htmlH1: translit_name,
                        htmlTitle: translit_name,
                        metaDescription: translit_name,
                        metaKeywords: translit_name,
                        description: translit_name,
                        tegs: translit_name + ',' || '',
                        phone: product['Телефон'] || 000,
                        price: product['Цена'] || 0,
                        priceStock: product['Цена акции'] || 0,
                        seoUrl: translit_for_seo,
                        producerId: product['ID производителя'] || '',
                        categoryId: product['ID категория'] || '',
                        categories: categoryIds
                    }
                    console.log(newProductValid);
                    if (ObjectId.isValid(newProductValid.producerId) && ObjectId.isValid(newProductValid.categoryId)) {
                        let newProduct = new db.Product(newProductValid);
                        productsPromise.push(newProduct.save());
                    } else {
                        console.log('--name is null');
                        importFailedProducts.push({
                            product: product,
                            error: 'ID производителя или ID категорий неправильного формата!'
                        });
                    }
                } else {
                    console.log('--name is null');
                    importFailedProducts.push({
                        product: product,
                        error: 'Наименование отсутствует или неправильного формата'
                    });
                }
            });

            Promise.all(productsPromise).then(
                (products) => {
                    res.status(200).json({
                        success: true,
                        status: 'green',
                        message: 'Успешно',
                        data: {
                            code: 200,
                            message: 'ok',
                            data: {
                                import_products_count: products.length,
                                import_failed_products: importFailedProducts
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
    });

    router.delete('/remove/:id', (req, res) => {
        let _id = req.params.id;
        console.log(_id);
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

        db.Product.findByIdAndRemove(_id).then(
            (product) => {
                if(!product) {
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
                if (product.images && product.images.length > 0) {
                    product.images.forEach((url) => {
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
                        message: 'Success delete product',
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
    });


    app.use('/products', router);
}