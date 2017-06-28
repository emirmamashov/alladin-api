let validator = require('validate.js');
let moment = require('moment');

validator.extend(validator.validators.datetime, {
    parse: (value, options) => {
        return moment.utc(value);
    },
    format: (value, options) => {
        let format = options.dateonly ? 'YYYY-MM-DD' : 'YYYY-MM-DD hh:mm:ss';
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
            message: '^наименование обьязательное поле'
        },
        length: {
            maximum: 100,
            message: '^Длина наименование должно быть меньше 100 символов'
        }
    },
    description: {

    },
    keywords: {

    },
    author: {

    }
};