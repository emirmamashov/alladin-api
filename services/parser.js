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
                console.log(mainCategroies, 'file: /services/parser.js, line:9');
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
    getChildCategories(link) {
        return new Promise((resolve, reject) => {
            console.log(link, 'file: /services/parser.js, line:24');
            xray(link, '.middle .container@html')((err, results) => {
                // console.log(results);
                if (err) reject(err);

                xray(results, 'h1')((err, parentCategoryName) => {
                    console.log(parentCategoryName, 'file: /services/parser.js, line:30');
                    if (err) reject(err);

                    xray(results, '.right-data', ['a@href'])((err, childCategories) => {
                        // console.log(childCategories);
                        if (err) reject(err);
                        resolve({
                            parentCategory: parentCategoryName,
                            childCategories: childCategories
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
            parentCategory: ''
        }
        */
        return new Promise((resolve, reject) => {
            if (!category || !category.name || !db) {
                console.log('Параметры неправильно переданы');
                reject('Параметры неправильно переданы');
            }
            db.Category.findOne({ name: category.name }).then(
                (findedCategory) => {
                    if (!findedCategory) {
                        let newCategory = new db.Category({
                            name: category.name
                        });

                        newCategory.save().then(
                                (savedCategory) => {
                                    resolve(savedCategory);
                                }
                            ).catch(
                                (err) => {
                                    console.log(err);
                                    reject(err);
                                }
                            );
                    } else {
                        if (category.parentCategory) {
                            findedCategory.parentCategory = category.parentCategory;
                            findedCategory.save().then(
                                (savedCategory) => {
                                    resolve(savedCategory);
                                }
                            ).catch(
                                (err) => {
                                    reject(err);
                                }
                            );
                        } else {
                            resolve(findedCategory);
                        }
                    }
                }
            ).catch(
                (err) => {
                    console.log(err);
                    reject(err);
                }
            );
        });
    },

    getProductsLink(db, link) {
        return new Promise((resolve, reject) => {
            console.log(link, 'file: /services/parser.js, line:97');
            xray(link, '.middle .container@html')((err, results) => {
                // console.log(results);
                if (err) reject(err);
                xray(results, 'h1')((err, categoryName) => {
                    console.log('----------' + categoryName, 'file: /services/parser.js, line:125');
                    if (err) reject(err);

                    xray(results, '.image_wrapper_block', ['a@href'])((err, productsLink) => {
                        if (err) reject(err);
                        resolve({
                            categoryName: categoryName,
                            productsLink: productsLink
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
                if (err) reject(err);
                xray(results, 'h1')((err, productName) => {
                    console.log(productName, 'file: /services/parser.js, line:129');
                    if (err) reject(err);

                    xray(results, '.catalog_detail .price')((err, price) => {
                        console.log(price.replace(/\s*/g, ''), 'file: /services/parser.js, line:134');
                        if (err) reject(err);
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
                                                    reject(err);
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
                                                    reject(err);
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
                                            reject(err);
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
                reject('Неправильно переданы параметры');
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
                                reject(err);
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
                                reject(err);
                            }
                        );
                    }
                }
            ).catch(
                (err) => {
                    reject(err);
                }
            );
        });
    }
}