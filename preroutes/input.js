let validate = require('validate.js');

module.exports = (filters) => {
    filters['input'] = filters['input'] || {};
    filters.input.validate = (constraints) => {
        return (req, res, next) => {
            for (let idx in req.body) {
                if (!constraints[idx]) {
                    delete req.body[idx];
                }
            }

            validate.async(req.body, constraints).then(
                (attributes) => {
                    req.body = attributes;
                    next();
                },
                (err) => {
                    console.log(err);
                    return res.status(200).json({
                        success: false,
                        message: 'Ошибка',
                        status: 'red',
                        data: {
                            code: 500,
                            message: err
                        }
                    });
                });
        }
    }
}