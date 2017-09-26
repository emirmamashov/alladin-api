module.exports = {
    setLevelCategories(db) {
        db.Category.find({ parentCategory: null }).then(
            (parentCategories) => {
                if (!parentCategories || parentCategories.length === 0) {
                    return;
                }

                let parentCategoryIds = [];
                parentCategories.forEach((category) => {
                    parentCategoryIds.push(category.id);
                    category.level = 0;
                    category.save();
                });

                this.setCategoryLevelForChildren(db, parentCategoryIds, 1);
            }
        ).catch(
            (err) => {
                console.log(err);
            }
        );
    },
    setCategoryLevelForChildren(db, parentCategoryIds, level) {
        if (!parentCategoryIds || parentCategoryIds.length === 0 || !level) return;

        db.Category.find({ parentCategory: { $in: parentCategoryIds } }).then(
            (childrendCategories) => {
                let ids = [];
                childrendCategories.forEach((category) => {
                    ids.push(category.id);

                    if (category.level !== level) {
                        category.level = level;
                        category.save();
                    }
                });
                this.setCategoryLevelForChildren(db, ids, level + 1);
            }
        ).catch(
            (err) => {
                console.log(err);
            }
        );
    }
}