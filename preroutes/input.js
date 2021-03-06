let validate = require('validate.js');

module.exports = (filters) => {
    filters['input'] = filters['input'] || {};
    filters.input.validate = (constraints) => {
        return (req, res, next) => {
            console.log('--------filters.input.validate---------');
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
                        message: {
                            validates: err
                        },
                        status: 'yellow',
                        data: {
                            code: 403,
                            message: err
                        }
                    });
                }
            );
        }
    }
}