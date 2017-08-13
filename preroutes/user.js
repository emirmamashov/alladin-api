module.exports = (filters) => {
    // ---------------------------------------------------------
    // route middleware to authenticate and check token
    // ---------------------------------------------------------

    filters['user'] = filters['user'] || {};
    filters.user.authRequired = () => {
        return (req, res, next) => {
            if (!req.decoded) {
                return res.status(200).json({
                    success: false,
                    message: 'Вы не авторизованы',
                    status: 'yellow',
                    data: {
                        code: 403,
                        message: 'Not authorize',
                        data: {
                            isNotAuth: true
                        }
                    }
                });
            }
            req.user = req.decoded._doc;
            next();
        }
    }
}