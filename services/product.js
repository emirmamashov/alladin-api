// services
let categoryService = require('../services/category');

module.exports = {
    getCountProductsByCategoryId(db, categoryId) {
        return new Promise((resolve, reject) => {
            if (!db || !categoryId) {
                console.log('parameters not valid');
                return resolve();
            }
            let parentCategoryIds = [];
            parentCategoryIds.push(categoryId);

            categoryService.getAllChildrenCategoriesId(db, parentCategoryIds, []).then(
                (categoryIds) => {
                    if (!categoryIds || categoryIds.length < 1) {
                        return resolve();
                    }
                    resolve(this.getCount(db, categoryIds));
                }
            ).catch(
                (err) => {
                    console.log(err);
                    return resolve();
                }
            );
        });
    },
    getCount(db, categoryIds) {
        return new Promise((resolve, reject) => {
            db.Product.count({ categoryId: { $in: categoryIds } }).then(
                (count) => {
                    console.log(count);
                    resolve(count);
                }
            ).catch(
                (err) => {
                    // console.log(err);
                    resolve();
                }
            );
        });
    }
}