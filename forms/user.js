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
    first_name: {
        presence: {
            message: '^Наименование объязательное поле'
        },
        length: {
            maximum: 25,
            message: '^Длина наименование должно быть меньше 25-символов'
        }
    },
    last_name: {
        presence: {
            message: '^Фамилия объязательное поле'
        },
        length: {
            maximum: 25,
            message: '^Длина наименование должно быть меньше 25-символов'
        }
    },
    phone: {
        presence: {
            message: '^Телефон объязательное поле'
        }
    },
    address: {

    },
    email: {

    },
    password: {
        presence: {
            message: '^Пароль объязательное поле'
        }
    },
    isAdmin: {
        
    }
};