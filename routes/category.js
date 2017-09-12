let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;

// validate forms
let categoryForm = require('../forms/category');

// services
let photoService = require('../services/photo');

module.exports = (app, db) => {
    let filters = app.get('filters');
    let config = app.get('config');

    // get all
    router.get('/', (req, res) => {

        let searchText = req.query.searchtext;
        let query = {};
        if (searchText)  {
            let regex = new RegExp(searchText, 'i');
            query =  { name: regex };
        }
        console.log('query: ', query, 'searchText: ', searchText);
        db.Category.count(query).then(
            (count) => {
                console.log(count);
                let page = parseInt(req.query.page) || 1;
                let limit = parseInt(req.query.limit) || count;
                console.log(req.query, page, limit);
                db.Category.paginate(query, { page: page, limit: limit },(err, result) => {
                    if (err) {
                        console.log(err);
                        return res.status(200).json({
                            success: false,
                            status: 'red',
                            message: 'Что то пошло не так(',
                            data: {
                                code: 500,
                                message: err
                            }
                        });
                    }
                    res.status(200).json({
                        success: true,
                        status: 'green',
                        message: 'Успешно',
                        data: {
                            code: 200,
                            message: 'ok',
                            data: {
                                categories: result.docs,
                                count: count
                            }
                        }
                    });
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

    // add new category
    router.post('/add', (req, res) => {
        console.log('------------- add new category --------------');
        console.log(req.body);
        photoService.uploadMultiple(req, res).then(
            (files) => {
                filters.input.validate(categoryForm);
                let newCategory = new db.Category(req.body);
                if (files && files.length > 0) {
                    let urlPhoto = files ? '/uploads' + files[0].path.replace(config.UPLOAD_DIR, '') : '';
                    newCategory.image = urlPhoto;
                    files.forEach((file) => {
                        if (file) {
                            newCategory.images.push('/uploads' + file.path.replace(config.UPLOAD_DIR, ''));
                        }
                    });
                }
                newCategory.parentCategory = ObjectId.isValid(newCategory.parentCategory) ? newCategory.parentCategory : null;
                newCategory.save().then(
                    (category) => {
                        res.status(200).json({
                            success: true,
                            status: 'green',
                            message: 'Успешно',
                            data: {
                                code: 200,
                                message: 'Успешно',
                                data: {
                                    category: category
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
                cosnole.log(err);
                let newCategory = new db.Category(req.body);
                newCategory.parentCategory = ObjectId.isValid(newCategory.parentCategory) ? newCategory.parentCategory : null;
                newCategory.save().then(
                    (category) => {
                        res.status(200).json({
                            success: true,
                            status: 'green',
                            message: 'Успешно',
                            data: {
                                code: 200,
                                message: 'Успешно',
                                data: {
                                    category: category
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
        );
    });

    // add categories
    router.post('/add-many', (req, res) => {
        let newCategories = req.body.categories || [];
        let categoriesSavePromise = [];

        newCategories.map((category) => {
            let newCategory = new db.Category(req.body);
            categoriesSavePromise.push(newCategory);
        });

        Promise.all(categoriesSavePromise).then(
            (categories) => {
                res.status(200).json({
                    success: true,
                    message: 'Сохранено',
                    status: 'green',
                    data: {
                        code: 200,
                        message: 'Сохранено',
                        data: {
                            categories: categories
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
                filters.input.validate(categoryForm);
                db.Category.findById(_id).then(
                    (category) => {
                        if (!category) {
                            return res.status(200).json({
                                success: false,
                                message: 'Категория не найдено',
                                status: 'yellow',
                                data: {
                                    code: 404,
                                    message: 'category not found'
                                }
                            });
                        }
                        
                        let updateImagesArr = req.body.images;
                        let removeImagesPromise = [];
                        if (updateImagesArr && category.images && category.images.length > 0) {
                            category.images.forEach((url) => {
                                let imageFind = updateImagesArr.filter(x => x === url);
                                if (imageFind.length === 0) {
                                    removeImagesPromise.push(photoService.remove(url)); // delete image
                                    category.images = category.images.filter(x => x !== url);
                                }
                            });
                        }
                        
                        if (files && files.length > 0) {
                            let urlPhoto = files ? '/uploads' + files[0].path.replace(config.UPLOAD_DIR, '') : '';
                            category.image = urlPhoto;
                            files.forEach((file) => {
                                if (file) {
                                    category.images.push('/uploads' + file.path.replace(config.UPLOAD_DIR, ''));
                                }
                            });
                        }

                        category.name = req.body.name ? req.body.name : category.name;
                        category.parentCategory = ObjectId.isValid(req.body.parentCategory) ? req.body.parentCategory : category.parentCategory;
                        category.description = req.body.description ? req.body.description : category.description;
                        category.keywords = req.body.keywords ? req.body.keywords : category.keywords;
                        category.author = req.body.author ? req.body.author : category.author;
                        category.viewInMenu = req.body.viewInMenu || false;
                        category.viewInLikeBlock = req.body.viewInLikeBlock || false;
                        category.showInMainPageLeft = req.body.showInMainPageLeft || false;
                        category.showInMainPageRight = req.body.showInMainPageRight || false;

                        category.save().then(
                            (updatedCategory) => {
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
                                            category: updatedCategory
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
                db.Category.findById(_id).then(
                    (category) => {
                        if (!category) {
                            return res.status(200).json({
                                success: false,
                                message: 'Категория не найдено',
                                status: 'yellow',
                                data: {
                                    code: 404,
                                    message: 'category not found'
                                }
                            });
                        }

                        let updateImagesArr = req.body.images;
                        let removeImagesPromise = [];
                        if (updateImagesArr && category.images && category.images.length > 0) {
                            category.images.forEach((url) => {
                                let imageFind = updateImagesArr.filter(x => x === url);
                                if (imageFind.length === 0) {
                                    removeImagesPromise.push(photoService.remove(url)); // delete image
                                    category.images = category.images.filter(x => x !== url);
                                }
                            });
                        }

                        category.name = req.body.name ? req.body.name : category.name;
                        category.parentCategory = ObjectId.isValid(req.body.parentCategory) ? req.body.parentCategory : category.parentCategory;
                        category.description = req.body.description ? req.body.description : category.description;
                        category.keywords = req.body.keywords ? req.body.keywords : category.keywords;
                        category.author = req.body.author ? req.body.author : category.author;
                        category.viewInMenu = req.body.viewInMenu ? req.body.viewInMenu : category.viewInMenu;
                        category.viewInMenu = req.body.viewInLikeBlock ? req.body.viewInLikeBlock : category.viewInLikeBlock;

                        category.save().then(
                            (updatedCategory) => {
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
                                            category: updatedCategory
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

        db.Category.findByIdAndRemove(_id).then(
            (category) => {
                if(!category) {
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
                if (category.images && category.images.length > 0) {
                    category.images.forEach((url) => {
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
                            category: category
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

    app.use('/categories', router);
}