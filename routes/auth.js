let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;
let jwt = require('jsonwebtoken');

// services
let crypto = require('../services/crypto');

// validate forms
let loginForm = require('../forms/login');
let registerForm = require('../forms/register');

module.exports = (app, db) => {
    let config = app.get('config');
    let filters = app.get('filters');

    // login
    router.post('/login/admin', filters.input.validate(loginForm), (req, res) => {
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
              if (!user.isAdmin) {
                return res.status(200).json({
                    success: false,
                    status: 'yellow',
                    message: 'Доступ запрещен!',
                    data: {
                        code: 403,
                        message: 'user not admin!'
                    }
                });
              }
              let token = jwt.sign(user, app.get('superSecret'), {
                expiresIn: 86400 // expires in 24 hours
              });
              res.status(200).json({
                success: true,
                status: 'green',
                message: 'Успешный вход',
                data: {
                    code: 200,
                    data: {
                        user: user,
                        token: token
                    }
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

    // add new
    router.post('/register/admin', filters.input.validate(registerForm), (req, res) => {
        console.log(req.body);
        db.User.findOne({email: req.body.email}).then(
            (find_user) => {
                if (find_user) {
                    return res.status(200).json({
                        success: false,
                        status: 'yellow',
                        message: 'Пользователь с такой почтой уже зарегистрирован',
                        data: {
                            code: 403,
                            message: 'user dublicate',
                            data: {
                                user: find_user
                            }
                        }
                    });
                }
                let encryptPassword = crypto.encrypt(req.body.password);
                let user = new db.User(req.body);
                user.password = encryptPassword;
                user.isAdmin = true;
            
                user.save().then(
                    (promoSticker) => {
                        res.status(200).json({
                            success: true,
                            status: 'green',
                            message: 'Успешно добавлено',
                            data: {
                                code: 201,
                                message: 'add new',
                                data: {
                                    user: user
                                }
                            }
                        });
                    }
                ).catch(
                    (err) => {
                        //console.log(err);
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
            }
        ).catch(
            (err) => {
                //console.log(err);
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