var jwt = require('jsonwebtoken');

module.exports = (app) => {
  app.use((req, res, next) => {
    console.log(req.body);
    let token = req.body.token || req.param('token') || req.headers['alladin-access-token'];
    jwt.verify(token, app.get('superSecret'), (err, decoded) => {
      req.decoded = decoded;
      next();
    });
  });
};
