// core
let xray = require('x-ray')();

// services
let photoService = require('../services/photo');
let chunkService = require('../services/chunk');

// global
let chunkSize = 50;
let linksOfProductDetailsChunks = [];
let url = 'http://pioner.kg/catalog';
let rootUrl = 'http://pioner.kg';
let countImportProducts = 0;

// parser for pioner.kg
module.exports = {
    getMainCategories() {
        return new Promise((resolve, reject) => {
            xray(url, '.section_info ul', ['.name a@href'])((err, mainCategroies) => {
                console.log(mainCategroies, 'file: /services/parser.js, line:20');
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

    getChildCategoriesRecursive(data) {
        /*data = {
            categoryId: data.category.id, // string
            chunkChildCategoriesLink: [],// Array<>
            results: []
        }*/
        return new Promise((resolve, reject) => {
            if (!data || !data.chunkChildCategoriesLink || data.chunkChildCategoriesLink.length < 1) {
                console.log('parameters not valid');
                return resolve(data.results);
            }

            let getChildCategoriesPromise = [];
            data.chunkChildCategoriesLink[0].forEach((datas) => {
                getChildCategoriesPromise.push(this.getChildCategories(datas.data, data.categoryId));
            });

            Promise.all(getChildCategoriesPromise).then(
                (results) => {
                    data.results = data.results.join(results);
                    data.chunkChildCategoriesLink = data.chunkChildCategoriesLink.slice(1, data.chunkChildCategoriesLink.length);
                    return this.getChildCategoriesRecursive(data);
                }
            ).catch(
                (err) => {
                    console.log(err);
                    resolve(data.results);
                }
            );
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
                        if (category.parentCategory && !findedCategory.parentCategory) {
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
                                        category: findedCategory,
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
                console.log(link, 'file: /services/parser.js, line:162');
                console.log(results?true:false, 'file: /services/parser.js, line:164');
                if (!results) {
                    return resolve({
                        categoryName: '',
                        productsLink: [],
                        categoryId: categoryId
                    });
                }
                xray(results, 'h1')((err, categoryName) => {
                    console.log('categoryName = ' + categoryName, 'file: /services/parser.js, line:166');
                    if (!categoryName) {
                        return resolve({
                            categoryName: '',
                            productsLink: [],
                            categoryId: categoryId
                        });
                    }

                    xray(results, '.catalog_block .image_wrapper_block', ['a@href'])((err, productsLink) => {
                        if (!productsLink) {
                            return resolve({
                                categoryName: categoryName,
                                productsLink: [],
                                categoryId: categoryId
                            });
                        }

                        xray(results, '.module-pagination .flex-direction-nav .flex-nav-next a@href')((err, nextPageLink) =>{
                            if (!nextPageLink) {
                                return resolve({
                                    categoryName: categoryName,
                                    productsLink: productsLink,
                                    categoryId: categoryId
                                });
                            }
                            resolve(this.nextPage(nextPageLink, {
                                categoryName: categoryName,
                                productsLink: productsLink,
                                categoryId: categoryId
                            }));
                        });
                    });
                });
            });
        });
    },

    nextPage(link, data) {
        return new Promise((resolve, reject) => {
            if (!link) {
                return resolve({
                        categoryName: data.categoryName,
                        productsLink: data.productsLink,
                        categoryId: data.categoryId
                    });
            }
            xray(link, '.middle .container@html')((err, results) => {
                if (!results) {
                    return resolve(
                        {
                            categoryName: data.categoryName,
                            productsLink: data.productsLink,
                            categoryId: data.categoryId
                        }
                    );
                }
                xray(results, '.catalog_block .image_wrapper_block', ['a@href'])((err, productsLink) =>{
                    if (!productsLink) {
                        return resolve(
                            {
                                categoryName: data.categoryName,
                                productsLink: data.productsLink,
                                categoryId: data.categoryId
                            }
                        );
                    }

                    xray(results, '.ajax_load .module-pagination .flex-direction-nav .disabled a@href')((err, disabledNextPageLink) =>{
                        if (disabledNextPageLink) {
                            return resolve(
                                {
                                    categoryName: data.categoryName,
                                    productsLink: data.productsLink.concat(productsLink),
                                    categoryId: data.categoryId
                                }
                            );
                        }
                        xray(results, '.ajax_load .module-pagination .flex-direction-nav .flex-nav-next a@href')((err, nextPageLink) =>{
                            if (!nextPageLink) {
                                return resolve(productsLinks);
                            }
                            resolve(this.nextPage(nextPageLink, 
                                {
                                    categoryName: data.categoryName,
                                    productsLink: data.productsLink.concat(productsLink),
                                    categoryId: data.categoryId
                                }));
                        });
                    });
                });
            });
        });
    },

    getProduct(db, link, categoryId) {
        return new Promise((resolve, reject) => {
            xray(link, '.middle .container@html')((err, results) => {
                // console.log(results);
                console.log(results?true:false, 'file: /services/parser.js, line:205');
                console.log(link, 'file: /services/parser.js, line:206');
                if (err || !results) {
                    return resolve();
                }
                xray(results, 'h1')((err, productName) => {
                    // console.log('productName= ' + productName, 'file: /services/parser.js, line:211');
                    if (err || !productName) {
                        return resolve();
                    }

                    xray(results, '.catalog_detail .price')((err, price) => {
                        console.log(price.replace(/\s*/g, ''), 'file: /services/parser.js, line:294');
                        xray(results, '.tabs_section .detail_text')((err, details) => {
                            let parsePrice = price.replace(/\s*/g, '').replace(/[^-0-9]/gim,'');
                            // console.log(parsePrice, 'file: /services/parser.js, line:222');
                            let product = {
                                name: productName,
                                price: parsePrice,
                                description: details,
                                categoryId: categoryId
                            };
                            // console.log(details, 'file: /services/parser.js, line:137');
                            
                            xray(results, '.catalog_detail .current img@src')((err, imgUrl) => {
                                product.image = imgUrl;
                                this.findProduct(db, product).then(
                                    (saveProduct) => {
                                        resolve(saveProduct);
                                    }
                                ).catch(
                                    (err) => {
                                        resolve();
                                    }
                                );
                            });
                            
                        });
                    });
                });
            });
        });
    },
    findProduct(db, product) {
        return new Promise((resolve, reject) => {
            // console.log(product, '----file: /service/parser.js, line: 253');
            if (!db || !product || !product.name) {
                console.log('Неправильно переданы параметры, ----------file: /services/parser.js, line: 326');
                return resolve();
            }
            db.Product.findOne({ name: product.name }).then(
                (findProduct) => {
                    db.Exchange.findOne().then(
                        (exchange) => {
                            if(!findProduct) {
                                let newProduct = new db.Product(product);
                                if (newProduct.price && exchange && exchange.usd) {
                                    newProduct.price = (newProduct.price / exchange.usd).toFixed(2);
                                }
                                if (newProduct.image) {
                                    photoService.uploadNetwork(newProduct.image, newProduct.name).then(
                                        (saveUrl) => {
                                            newProduct.image = saveUrl;
                                            newProduct.images = [ newProduct.image ];
                                            
                                            newProduct.save().then(
                                                (savedProduct) => {
                                                    return resolve(savedProduct);
                                                }
                                            ).catch(
                                                (err) => {
                                                    return resolve();
                                                }
                                            );
                                        }
                                    ).catch(
                                        (err) => {
                                            return resolve();
                                        }
                                    );
                                } else {
                                    newProduct.save().then(
                                        (savedProduct) => {
                                            resolve(savedProduct);
                                        }
                                    ).catch(
                                        (err) => {
                                            return resolve();
                                        }
                                    );
                                }
                            } else {
                                let categoryIdsNotChangePrice = [
                                    '59c3e813f901dd3cb699910c', '59c3e813f901dd3cb6999114', '59c3e813f901dd3cb69990ca',
                                    '59c3e813f901dd3cb69990e6', '59c3e813f901dd3cb69990fa', '59c3e813f901dd3cb699910d',
                                    '59c3e69cf901dd3cb69990aa'
                                ];
                                let findCategory = categoryIdsNotChangePrice.filter(x => x == findCategory.parentCategory);
                                if (findCategory.length == 0 && findProduct.price && exchange && exchange.usd) {
                                    findProduct.price = (findProduct.price / exchange.usd).toFixed(2);
                                    findProduct.description = product.description;
                                }

                                if (findProduct.image) {
                                    findProduct.save().then(
                                        (savedProduct) => {
                                            return resolve(savedProduct);
                                        }
                                    ).catch(
                                        (err) => {
                                            return resolve(findProduct);
                                        }
                                    );
                                } else {
                                    photoService.uploadNetwork(product.image, productName).then(
                                        (saveUrl) => {
                                            findProduct.image = saveUrl;
                                            findProduct.images = [ product.image ];

                                            findProduct.save().then(
                                                (savedProduct) => {
                                                    return resolve(savedProduct);
                                                }
                                            ).catch(
                                                (err) => {
                                                    return resolve(findProduct);
                                                }
                                            );
                                        }
                                    ).catch(
                                        (err) => {
                                            return resolve(findProduct);
                                        }
                                    );
                                }
                            }
                        }
                    ).catch(
                        (err) => {
                            console.log(err);
                            return resolve();
                        }
                    );
                }
            ).catch(
                (err) => {
                    console.log(err);
                    return resolve();
                }
            );
        });
    },
    beginParsing(db) {
        this.getMainCategories().then(
            (mainCategroies) => {
                console.log(mainCategroies.length, 'file: /services/parser.js, line:429');

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
                            /* -> data = {
                              parentCategory: parentCategoryName,
                                childCategories: childCategories
                            }*/
                            findCategoryForMainPromises.push(
                                this.findCategory(db, 
                                {
                                    name: data.parentCategory,
                                    childCategoriesLink: data.childCategories
                                })
                            );
                        });

                        if (findCategoryForMainPromises.length < 1) {
                            return {
                                success: false
                            }
                        }

                        Promise.all(findCategoryForMainPromises).then(
                            (categories) => {
                                if (!categories || categories.length < 1) {
                                    return {
                                        success: false
                                    }
                                }
                                let findChildCategoriesForChildPromise = [];
                                categories.forEach((data) => {
                                    if (data.childCategoriesLink && data.childCategoriesLink.length > 0) {
                                        /*let chunkChildCategoriesLink = chunkService.chunk(data.childCategoriesLink, chunkSize);
                                        let datas = {
                                            categoryId: data.category.id,
                                            chunkChildCategoriesLink: chunkChildCategoriesLink,
                                            results: []
                                        }*/
                                        // findChildCategoriesForChildPromise.push(this.getChildCategoriesRecursive(datas));
                                        data.childCategoriesLink.forEach((link) => {
                                            findChildCategoriesForChildPromise.push(this.getChildCategories(link, data.category.id));
                                        });
                                    }
                                });

                                if (findChildCategoriesForChildPromise.length < 1) {
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
                                                                let links = [];
                                                                productCategories.forEach((productCategory) => {
                                                                    if (productCategory && 
                                                                        productCategory.productsLink && 
                                                                        productCategory.productsLink.length > 0) {
                                                                        productCategory.productsLink.forEach((link) => {
                                                                            links.push({
                                                                                link: link,
                                                                                categoryId: productCategory.category.id
                                                                            });
                                                                        });
                                                                    }
                                                                });

                                                                console.log(links.length);

                                                                linksOfProductDetailsChunks = chunkService.chunk(links, 200);
                                                                this.getProductDetails(db, linksOfProductDetailsChunks[0].data).then(
                                                                    (resProductImport) => {
                                                                        console.log(resProductImport.length);
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
    },
    getProductDetails(db, datas) {
        return new Promise((resolve, reject) => {
            if (!datas || datas.length === 0) {
                return resolve();
            }

            let getProductDetailsPromise = [];
            datas.forEach((data) => {
                if (data.link) {
                    getProductDetailsPromise.push(
                        this.getProduct(db, data.link, data.categoryId)
                    );
                }
            });

            if (getProductDetailsPromise.length === 0) {
                return resolve();
            }

            Promise.all(getProductDetailsPromise).then(
                (productDetails) => {
                    console.log('----- getProductDetailsPromise end -----');
                    countImportProducts = + productDetails.filter(x => x).length;
                    console.log('----Товары импортированные' + productDetails.filter(x => x).length);
                    console.log('----Все Товары импортированные' +countImportProducts);
                    linksOfProductDetailsChunks = linksOfProductDetailsChunks.slice(1, linksOfProductDetailsChunks.length);
                    resolve(this.getProductDetails(db, linksOfProductDetailsChunks[0].data));
                }
            ).catch(
                (err) => {
                    console.log(err);
                    resolve();
                }
            );
        });
    },
    testParsing(db) {
        return new Promise((resolve, reject) => {
            let testParsingPromise = [];
            for(let i=0; i<500; i++) {
                testParsingPromise.push(this.getProduct(db, 'http://pioner.kg/catalog/tovary_dlya_doma_i_byta/pitanie/napitki/fanta_kulpunay_0_5_l_281300/'));
            }

            Promise.all(testParsingPromise).then(
                (results) => {
                    console.log('спарсено: ' +results.filter(x => !x).length);
                    console.log('не спарсено: ' +results.filter(x => x).length);
                    resolve(results);
                }
            ).catch(
                (err) => {
                    console.log(err);
                    resolve();
                }
            );
        });
    },

    test() {
        return new Promise((resolve, reject) => {
                parserService.testParsing(db).then(
                    (results) => {
                        resolve(results);
                        // console.log('итог спарсено: ' + results5.filter(x => !x).length);
                        // console.log('итог не спарсено: ' + results5.filter(x => x).length);
                    }
                ).catch(
                    (err) => {
                        resolve();
                    }
                );
            }
        );
    }
}