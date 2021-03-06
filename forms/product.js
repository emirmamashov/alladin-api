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
    htmlH1: {

    },
    htmlTitle: {

    },
    metaDescription: {

    },
    metaKeywords: {

    },
    description: {

    },
    tegs: {

    },
    photos: {
        presence: true
    },
    phone: {
        numericality: {
            message: '^Телефон - введите только цифры'
        }
    },
    price: {
        presence: {
            message: '^Цена - объязательное поле'
        },
        numericality: {
            message: '^Цена - введите только число'
        }
    },
    priceStock: {
        numericality: {
            message: '^Цена акция - введите только число'
        }
    },
    seoUrl: {
        length: {
            maximum: 200,
            message: '^SeoURL - Длина должна быть меньше 200 симолов'
        }
    },
    promoStickerId: {

    },
    producerId: {

    },
    categoryId: {
        presence: {
            message: '^Выберите категории'
        }
    },
    categories: {

    }
};