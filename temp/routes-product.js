parserService.getChildCategories(mainCategoryLink).then(
    (data) => {
        /* data = {
          parentCategory: parentCategoryName,
            childCategories: childCategories
        }*/
        console.log(data, 'file: /router/product.js, line:562');
        if (!data || !data.parentCategory) {
            return res.status(200).json({
                success: true,
                status: 'yellow',
                message: 'не найдено!',
                data: {
                    code: 404,
                    message: 'not found!'
                }
            });
        }

        parserService.findCategory(db, { name: data.parentCategory }).then(
            (category) => {
                if (data.childCategories.length > 0) {
                    parserService.getChildCategories(data.childCategories[0]).then(
                        (childData) => {
                            /* childData = {
                              parentCategory: parentCategoryName,
                                childCategories: childCategories
                            }*/

                            console.log(childData, 'file: /router/product.js, line:585');
                            if (!childData || !childData.parentCategory) {
                                return res.status(200).json({
                                    success: true,
                                    status: 'yellow',
                                    message: 'не найдено!',
                                    data: {
                                        code: 404,
                                        message: 'not found!'
                                    }
                                });
                            }

                            parserService.findCategory(db,
                                { name: childData.parentCategory, parentCategory: category.id }).then(
                                (childCategory) => {

                                    parserService.getProductsLink(db, childData.childCategories[0]).then(
                                        (productsData) => {
                                            parserService.findCategory(db,
                                                { name: productsData.categoryName,parentCategory: childCategory.id }
                                            ).then(
                                                (productCategory) => {
                                                    if (!productCategory) {
                                                        return res.status(200).json({
                                                            success: true,
                                                            status: 'green',
                                                            message: 'ok',
                                                            data: {
                                                                code: 200,
                                                                message: 'ok',
                                                                data: {
                                                                    childCategory: childCategory,
                                                                    products: productsData,
                                                                    productCategory: productCategory
                                                                }
                                                            }
                                                        });
                                                    }
                                                    parserService.getProduct(db, productsData.productsLink[0], productCategory.id).then(
                                                        (productDetailsData) => {
                                                            res.status(200).json({
                                                                success: true,
                                                                status: 'green',
                                                                message: 'ok',
                                                                data: {
                                                                    code: 200,
                                                                    message: 'ok',
                                                                    data: {
                                                                        childCategory: childCategory,
                                                                        products: productsData,
                                                                        productCategory: productCategory,
                                                                        productDetailsData: productDetailsData
                                                                    }
                                                                }
                                                            }); 
                                                        }
                                                    ).catch(
                                                        (err) => {
                                                            res.status(200).json({
                                                                success: false,
                                                                status: 'red',
                                                                message: 'ok',
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
                                                        message: 'ok',
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
                                                message: 'ok',
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
                                        message: err,
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
                                    message: err,
                                    data: {
                                        code: 500,
                                        message: err
                                    }
                                });
                            }
                        );
                } else {
                    res.status(200).json({
                        success: true,
                        status: 'green',
                        message: 'ok',
                        data: {
                            code: 200,
                            message: 'ok',
                            data: category
                        }
                    });
                }
            }
        ).catch(
            (err) => {
                console.log(err);
                res.status(200).json({
                    success: false,
                    status: 'red',
                    message: err,
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
                message: err,
                data: {
                    code: 500,
                    message: err
                }
            });
        }
    );

    ///2

    parserService.findCategory(db,{ name: childData.parentCategory, parentCategory: category.id }).then(
        (childCategory) => {

            parserService.getProductsLink(db, childData.childCategories[0]).then(
                (productsData) => {
                    parserService.findCategory(db,
                        { name: productsData.categoryName,parentCategory: childCategory.id }
                    ).then(
                        (productCategory) => {
                            if (!productCategory) {
                                return res.status(200).json({
                                    success: true,
                                    status: 'green',
                                    message: 'ok',
                                    data: {
                                        code: 200,
                                        message: 'ok',
                                        data: {
                                            childCategory: childCategory,
                                            products: productsData,
                                            productCategory: productCategory
                                        }
                                    }
                                });
                            }
                            parserService.getProduct(db, productsData.productsLink[0], productCategory.id).then(
                                (productDetailsData) => {
                                    res.status(200).json({
                                        success: true,
                                        status: 'green',
                                        message: 'ok',
                                        data: {
                                            code: 200,
                                            message: 'ok',
                                            data: {
                                                childCategory: childCategory,
                                                products: productsData,
                                                productCategory: productCategory,
                                                productDetailsData: productDetailsData
                                            }
                                        }
                                    }); 
                                }
                            ).catch(
                                (err) => {
                                    res.status(200).json({
                                        success: false,
                                        status: 'red',
                                        message: 'ok',
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
                                message: 'ok',
                                data: {
                                    code: 500,
                                    message: err
                                }
                            });
                        }
                    );
                }
            )
            
        }
    )