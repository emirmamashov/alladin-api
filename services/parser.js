let xray = require('x-ray')();
let url = 'http://pioner.kg/catalog';
let rootUrl = 'http://pioner.kg';

// services
let photoService = require('../services/photo');

// parser for pioner.kg
module.exports = {
    getMainCategories() {
        return new Promise((resolve, reject) => {
            xray(url, '.section_info ul', ['.name a@href'])((err, mainCategroies) => {
                console.log(mainCategroies, 'file: /services/parser.js, line:13');
                if (err) {
                    reject('Что то пошло не так! Пожалуйста обратитесь к разработчику emir.mamashov@gmail.com');
                }

                if (!mainCategroies || mainCategroies.length === 0) {
                    reject('Категории не найдены! Пожалуйста обратитесь к разработчику emir.mamashov@gmail.com');
                }

                resolve(mainCategroies);
            });
        });
    },
    getChildCategories(link, categoryId) {
        return new Promise((resolve, reject) => {
            console.log(link, 'file: /services/parser.js, line:27');
            xray(link, '.middle .container@html')((err, results) => {
                // console.log(results);
                if (err || !results) {
                    return resolve({
                        parentCategory: '',
                        childCategories: [],
                        categoryId: categoryId
                    });
                }

                xray(results, 'h1')((err, parentCategoryName) => {
                    console.log(parentCategoryName, 'file: /services/parser.js, line:39');
                    if (err || !parentCategoryName) {
                        resolve({
                            parentCategory: '',
                            childCategories: [],
                            categoryId: categoryId
                        });
                    }

                    xray(results, '.right-data', ['a@href'])((err, childCategories) => {
                        // console.log(childCategories);
                        if (err) {
                            return resolve({
                                parentCategory: '',
                                childCategories: [],
                                categoryId: categoryId
                            });
                        }
                        resolve({
                            parentCategory: parentCategoryName,
                            childCategories: childCategories,
                            categoryId: categoryId
                        });
                    });
                });
            });
        });
    },
    findCategory(db, category) {
        /*
        category = {
            name: '',
            parentCategory: '',
            childCategoriesLink: [],
            productsLink: []
        }
        */
        return new Promise((resolve, reject) => {
            if (!category || !category.name || !db) {
                console.log('Параметры неправильно переданы');
                return resolve();
            }
            db.Category.findOne({ name: category.name }).then(
                (findedCategory) => {
                    if (!findedCategory) {
                        let newCategory = new db.Category({
                            name: category.name
                        });

                        newCategory.save().then(
                                (savedCategory) => {
                                    resolve(
                                        {
                                            category: savedCategory,
                                            parentCategory: category.parentCategory,
                                            childCategoriesLink: category.childCategoriesLink
                                        }
                                    );
                                }
                            ).catch(
                                (err) => {
                                    console.log(err);
                                    resolve(
                                        {
                                            category: '',
                                            parentCategory: category.parentCategory,
                                            childCategoriesLink: category.childCategoriesLink,
                                            productsLink: category.productsLink
                                        }
                                    );
                                }
                            );
                    } else {
                        if (category.parentCategory) {
                            findedCategory.parentCategory = category.parentCategory;
                            findedCategory.save().then(
                                (savedCategory) => {
                                    resolve({
                                        category: savedCategory,
                                        parentCategory: category.parentCategory,
                                        childCategoriesLink: category.childCategoriesLink,
                                        productsLink: category.productsLink
                                    });
                                }
                            ).catch(
                                (err) => {
                                    resolve({
                                        category: '',
                                        parentCategory: category.parentCategory,
                                        childCategoriesLink: category.childCategoriesLink,
                                        productsLink: category.productsLink
                                    });
                                }
                            );
                        } else {
                            resolve(
                                {
                                    category: findedCategory,
                                    parentCategory: category.parentCategory,
                                    childCategoriesLink: category.childCategoriesLink,
                                    productsLink: category.productsLink
                                }
                            );
                        }
                    }
                }
            ).catch(
                (err) => {
                    console.log(err);
                    resolve({
                        category: '',
                        parentCategory: category.parentCategory,
                        childCategoriesLink: category.childCategoriesLink
                    });
                }
            );
        });
    },

    getProductsLink(db, link, categoryId) {
        return new Promise((resolve, reject) => {
            //console.log(link, 'file: /services/parser.js, line:156');
            xray(link, '.middle .container@html')((err, results) => {
                console.log(link, 'file: /services/parser.js, line:156');
                console.log(results?true:false, 'file: /services/parser.js, line:158');
                if (!results) {
                    return resolve({
                        categoryName: '',
                        productsLink: [],
                        categoryId: categoryId
                    });
                }
                xray(results, 'h1')((err, categoryName) => {
                    console.log('----------' + categoryName, 'file: /services/parser.js, line:166');
                    if (!categoryName) {
                        return resolve({
                            categoryName: '',
                            productsLink: [],
                            categoryId: categoryId
                        });
                    }

                    xray(results, '.image_wrapper_block', ['a@href'])((err, productsLink) => {
                        if (!productsLink) {
                            return resolve({
                                categoryName: categoryName,
                                productsLink: [],
                                categoryId: categoryId
                            });
                        }
                        resolve({
                            categoryName: categoryName,
                            productsLink: productsLink,
                            categoryId: categoryId
                        });
                    });
                });
            });
        });
    },

    getProduct(db, link, categoryId) {
        return new Promise((resolve, reject) => {
            console.log(link, 'file: /services/parser.js, line:124');
            xray(link, '.middle .container@html')((err, results) => {
                // console.log(results);
                if (err || !results) {
                    return resolve();
                }
                xray(results, 'h1')((err, productName) => {
                    console.log(productName, 'file: /services/parser.js, line:129');
                    if (err || !productName) {
                        return resolve();
                    }

                    xray(results, '.catalog_detail .price')((err, price) => {
                        console.log(price.replace(/\s*/g, ''), 'file: /services/parser.js, line:134');
                        if (err) {
                            return resolve();
                        }
                        xray(results, '.tabs_section .detail_text')((err, details) => {
                            let parsePrice = price.replace(/\s*/g, '').replace(/[^-0-9]/gim,'');
                            console.log(parsePrice, 'file: /services/parser.js, line:137');
                            let product = {
                                name: productName,
                                price: parsePrice,
                                description: details,
                                categoryId: categoryId
                            };
                            console.log(details, 'file: /services/parser.js, line:137');
                            
                            xray(results, '.catalog_detail .current img@src')((err, imgUrl) => {
                                if (imgUrl) {
                                    // imgUrl = rootUrl + imgUrl;
                                    console.log(imgUrl);
                                    photoService.uploadNetwork(imgUrl, productName).then(
                                        (saveUrl) => {
                                            product.image = saveUrl;
                                            this.findProduct(db, product).then(
                                                (product) => {
                                                    resolve(product);
                                                }
                                            ).catch(
                                                (err) => {
                                                    return resolve();
                                                }
                                            );
                                        }
                                    ).catch(
                                        (err) => {
                                            console.log(err, 'file: service/parser.js, line: 168');
                                            this.findProduct(db, product).then(
                                                (product) => {
                                                    resolve(product);
                                                }
                                            ).catch(
                                                (err) => {
                                                    return resolve();
                                                }
                                            );
                                        }
                                    );
                                } else {
                                    this.findProduct(db, product).then(
                                        (product) => {
                                            resolve(product);
                                        }
                                    ).catch(
                                        (err) => {
                                            return resolve();
                                        }
                                    );
                                }
                            });
                            
                        });
                    });
                });
            });
        });
    },
    findProduct(db, product) {
        return new Promise((resolve, reject) => {
            console.log(product, '----file: /service/parser.js, line: 167');
            if (!db || !product || !product.name || !product.price) {
                console.log('Неправильно переданы параметры, ----------file: /services/parser.js, line: 158');
                return resolve();
            }
            db.Product.findOne({name: product.name}).then(
                (findProduct) => {
                    if(!findProduct) {
                        let newProduct = new db.Product(product);
                        newProduct.images = [product.image];
                        newProduct.save().then(
                            (savedProduct) => {
                                resolve(savedProduct);
                            }
                        ).catch(
                            (err) => {
                                return resolve();
                            }
                        );
                    } else {
                        findProduct.image = product.image;
                        findProduct.description = product.description;
                        findProduct.images = [product.image];
                        findProduct.save().then(
                            (savedProduct) => {
                                resolve(savedProduct);
                            }
                        ).catch(
                            (err) => {
                                return resolve();
                            }
                        );
                    }
                }
            ).catch(
                (err) => {
                    return resolve();
                }
            );
        });
    },
    beginParsing(db) {
        this.getMainCategories().then(
            (mainCategroies) => {
                console.log(mainCategroies, 'file: /router/product.js, line:555');
                let getChildCategoriesForMainCategoriesPromise = [];
                mainCategroies.forEach((mainCategoryLink) => {
                    getChildCategoriesForMainCategoriesPromise.push(this.getChildCategories(mainCategoryLink));
                });
                Promise.all(getChildCategoriesForMainCategoriesPromise).then(
                    (datas) => {
                        if (!datas || datas.length == 0) {
                            return {
                                success: false
                            }
                        }
                        let findCategoryForMainPromises = [];
                        datas.forEach((data) => {
                            /* data = {
                              parentCategory: parentCategoryName,
                                childCategories: childCategories
                            }*/
                            findCategoryForMainPromises.push(this.findCategory(db, {
                                name: data.parentCategory,
                                childCategoriesLink: data.childCategories}
                            ));
                        });

                        if (findCategoryForMainPromises.length === 0) {
                            return {
                                success: false
                            }
                        }
                        Promise.all(findCategoryForMainPromises).then(
                            (categories) => {
                                if (!categories || categories.length === 0) {
                                    return {
                                        success: false
                                    }
                                }
                                let findChildCategoriesForChildPromise = [];
                                categories.forEach((data) => {
                                    if (data.childCategoriesLink && data.childCategoriesLink.length > 0) {
                                        data.childCategoriesLink.forEach((link) => {
                                            findChildCategoriesForChildPromise.push(this.getChildCategories(link, data.category.id));
                                        });
                                    }
                                });

                                if (findChildCategoriesForChildPromise.length === 0) {
                                    return {
                                        success: true,
                                        status: 'green',
                                        message: 'ok',
                                        data: {
                                            code: 200,
                                            message: 'ok',
                                            mainCategories: categories
                                        }
                                    }
                                }

                                Promise.all(findChildCategoriesForChildPromise).then(
                                    (childDatas) => {
                                        if (!childDatas || childDatas.length === 0) {
                                            return {
                                                success: true,
                                                status: 'green',
                                                message: 'ok',
                                                data: {
                                                    code: 200,
                                                    message: 'ok',
                                                    mainCategories: categories
                                                }
                                            }
                                        }

                                        let findCategoriesForChildPromise = [];
                                        childDatas.forEach((childData) => {
                                            if (childData && childData.parentCategory) {
                                                findCategoriesForChildPromise.push(
                                                    this.findCategory(db,{
                                                        name: childData.parentCategory,
                                                        parentCategory: childData.categoryId,
                                                        childCategoriesLink: childData.childCategories
                                                    })
                                                );
                                            }
                                        });

                                        if (findCategoriesForChildPromise.length === 0) {
                                            return {
                                                success: false
                                            }
                                        }

                                        Promise.all(findCategoriesForChildPromise).then(
                                            (childCategories) => {
                                                if (!childCategories || childCategories.length === 0) {
                                                    return {
                                                        success: true,
                                                        status: 'green',
                                                        message: 'ok',
                                                        data: {
                                                            code: 200,
                                                            message: 'ok',
                                                            mainCategories: categories,
                                                            childDatas: childDatas
                                                        }
                                                    }
                                                }

                                                let getProductsLinkForChildCategory = [];
                                                childCategories.forEach((childCategory) => {
                                                    if (childCategory.childCategoriesLink && childCategory.childCategoriesLink.length > 0) {
                                                        childCategory.childCategoriesLink.forEach((link) => {
                                                            getProductsLinkForChildCategory.push(
                                                                this.getProductsLink(db, link, childCategory.category.id)
                                                            );
                                                        })
                                                    }
                                                });

                                                console.log(getProductsLinkForChildCategory.length);

                                                if (getProductsLinkForChildCategory.length === 0) {
                                                    return {
                                                        success: true,
                                                        status: 'green',
                                                        message: 'ok',
                                                        data: {
                                                            code: 200,
                                                            message: 'ok',
                                                            mainCategories: categories,
                                                            childDatas: childDatas
                                                        }
                                                    }
                                                }

                                                Promise.all(getProductsLinkForChildCategory).then(
                                                    (productsDatas) => {
                                                        console.log('getProductsLinkForChildCategory: end');
                                                        if (!productsDatas || productsDatas.length === 0) {
                                                            return;
                                                        }
                                                        let findCategoryForProductPromise = [];
                                                        productsDatas.forEach((productsData) => {
                                                            if (productsData && productsData.categoryName) {
                                                                findCategoryForProductPromise.push(
                                                                    this.findCategory(db,{
                                                                        name: productsData.categoryName,
                                                                        parentCategory: productsData.categoryId,
                                                                        productsLink: productsData.productsLink
                                                                    })
                                                                );
                                                            }
                                                        });

                                                        if (findCategoryForProductPromise.length === 0) {
                                                            return {
                                                                success: true,
                                                                status: 'green',
                                                                message: 'ok',
                                                                data: {
                                                                    code: 200,
                                                                    message: 'ok',
                                                                    mainCategories: categories,
                                                                    childDatas: childDatas,
                                                                    childCategories: childCategories,
                                                                    productsDatas: productsDatas
                                                                }
                                                            }
                                                        }
                                                        Promise.all(findCategoryForProductPromise).then(
                                                            (productCategories) => {
                                                                console.log('findCategoryForProductPromise: end');
                                                                if (!productCategories || productCategories.length === 0) {
                                                                    return {};
                                                                }
                                                                let getProductDetailsPromise = [];
                                                                productCategories.forEach((productCategory) => {
                                                                    if (productCategory && productCategory.productsLink && productCategory.productsLink.length > 0) {
                                                                        productCategory.productsLink.forEach((link) => {
                                                                            getProductDetailsPromise.push(
                                                                                this.getProduct(db, link, productCategory.category.id)
                                                                            );
                                                                        });
                                                                    }
                                                                });
                                                                if (getProductDetailsPromise.length === 0) {
                                                                    return {};
                                                                }
                                                                Promise.all(getProductDetailsPromise).then(
                                                                    (productDetails) => {
                                                                        console.log('getProductDetailsPromise: end');
                                                                        console.log(productDetails);
                                                                        return {
                                                                            success: true,
                                                                            status: 'green',
                                                                            message: 'ok',
                                                                            data: {
                                                                                code: 200,
                                                                                message: 'ok',
                                                                                mainCategories: categories,
                                                                                childDatas: childDatas,
                                                                                childCategories: childCategories,
                                                                                productsDatas: productsDatas,
                                                                                productCategories: productCategories,
                                                                                productDetails: productDetails
                                                                            }
                                                                        }
                                                                    }
                                                                );
                                                            }
                                                        );
                                                    }
                                                );
                                            }
                                        );
                                    }
                                );
                            }
                        )
                    }
                )
                
            }).catch(
                (err) => {
                    console.log(err);
                    return {
                        success: false,
                        status: 'red',
                        message: err,
                        data: {
                            code: 500,
                            message: err
                        }
                    };
                }
            );
    }
}