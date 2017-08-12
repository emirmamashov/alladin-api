let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;
let jwt = require('jsonwebtoken');

// services
let crypto = require('../services/crypto');

// validate forms
let loginForm = require('../forms/login');

module.exports = (app, db) => {
    let config = app.get('config');
    let filters = app.get('filters');

    // login
    router.post('/login', filters.input.validate(loginForm), (req, res) => {
      console.log(req.body);
      let encryptPassword = crypto.encrypt(req.body.password);
      let email = req.body.email;

      db.User.findOne({
          email: email,
          password: encryptPassword
      }).then(
          (user) => {
              if (!user) {
                return res.status(200).json({
                    success: false,
                    status: 'yellow',
                    message: 'Пользователь с таким логином или паролем не найдено!',
                    data: {
                        code: 404,
                        message: 'user not found!'
                    }
                });
              }
              let token = jwt.sign(newAdmin, app.get('superSecret'), {
                expiresIn: 86400 // expires in 24 hours
              });
              res.status(200).json({
                success: true,
                status: 'green',
                message: 'Успешный вход',
                data: {
                    code: 200,
                    user: user,
                    token: token
                }
            });
          }
      ).catch(
          (err) => {
            console.log(err);
            res.status(200).json({
                success: false,
                status: 'red',
                message: 'Что то пошло не так',
                data: {
                    code: 500,
                    message: err
                }
            });
          }
      );
    });

    app.use('/auth', router);
}