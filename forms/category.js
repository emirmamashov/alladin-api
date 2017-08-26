let validator = require('validate.js');
let moment = require('moment');

validator.extend(validator.validators.datetime, {
    parse: (value, options) => {
        return moment.utc(value);
    },
    format: (value, options) => {
        let format = options.dateOnly ? 'YYYY-MM-DD' : 'YYYY-MM-DD hh:mm:ss';
        return moment.utc(value).format(format);
    }
});

validator.options = {
    format: 'flat'
};

validator.async.options = {
    format: 'flat',
    clearAttributes: false
};

module.exports = {
    name: {
        presence: {
            message: '^Наименование объязательное поле'
        },
        length: {
            maximum: 25,
            message: '^Длина наименование должно быть меньше 25-символов'
        }
    },
    parentCategory: {

    },
    description: {

    },
    keywords: {

    },
    author: {

    },
    viewInMenu: {

    },
    image: {
        
    },
    images: {
        
    },
    banner: {
        
    },
    showInMainPageLeft: {

    },
    showInMainPageRight: {
        
    }
};