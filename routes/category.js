let express = require('express');
let router = express.Router();

// validate forms
let categoryForm = require('../forms/category');

// services
let uploadFile = require('../services/upload');

module.exports = (app, db) => {
    let filters = app.get('filters');
    let config = app.get('config');

    // get all
    router.get('/', (req, res) => {
        db.Category.find().then(
            (categories) => {
                res.status(200).json({
                    success: true,
                    status: 'green',
                    message: 'Успешно',
                    data: {
                        code: 200,
                        message: 'Успешно',
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

    // add new category
    router.post('/add', (req, res) => {
        console.log('------------- add new category --------------');
        console.log(req.body);
        uploadFile(req, res).then(
            (file) => {
                console.dir(file);
                let newCategory = new db.Category(req.body);
                newCategory.parentCategory = newCategory.parentCategory || null;
                newCategory.image = file ? '/uploads' + file.path.replace(config.UPLOAD_DIR, '') : '';
                newCategory.save().then(
                    (category) => {
                        res.status(200).json({
                            success: true,
                            message: 'Успешно',
                            status: 'green',
                            data: {
                                code: 200,
                                message: 'Добавлено',
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
        }).catch(
            (err) => {
                console.log(err);
                let newCategory = new db.Category(req.body);
                newCategory.parentCategory = newCategory.parentCategory || null;
                newCategory.save().then(
                    (category) => {
                        res.status(200).json({
                            success: true,
                            message: 'Успешно',
                            status: 'green',
                            data: {
                                code: 200,
                                message: 'Добавлено',
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
            let newCategory = new db.Category();
            newCategory.name = req.body.name;
            newCategory.parentCategory = req.body.parentCategory;
            newCategory.description = req.body.description;
            newCategory.keywords = req.body.keywords;
            newCategory.author = req.body.author;

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

    router.put('/update/:id', filters.input.validate(categoryForm), (req, res) => {
        let _id = req.params.id;
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

                category.name = req.body.name ? req.body.name : category.name;
                category.parentCategory = req.body.parentCategory ? req.body.parentCategory : category.parentCategory;
                category.description = req.body.description ? req.body.description : category.description;
                category.keywords = req.body.keywords ? req.body.keywords : category.keywords;
                category.author = req.body.author ? req.body.author : category.author;
                category.photo = req.body.photo ? req.body.photo : category.photo;
                category.viewInMenu = req.body.viewInMenu ? req.body.viewInMenu : category.viewInMenu;

                category.save().then(
                    (updatedCategory) => {
                        res.status(200).json({
                            success: true,
                            status: 'green',
                            message: 'Данные категории успешно обнавлены',
                            data: {
                                code: 200,
                                message: 'Updated successful',
                                category: updatedCategory
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

    app.use('/categories', router);
}