let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;

// services
let crypto = require('../services/crypto');

// validate forms
let userForm = require('../forms/user');

module.exports = (app, db) => {
    let config = app.get('config');
    let filters = app.get('filters');

    // get all
    router.get('/', filters.user.authRequired(), (req, res) => {
        db.User.find().then(
            (users) => {
                if (users.length > 0) {
                    users.forEach((user) => {
                        user.password = crypto.decrypt(user.password);
                    });
                }
                res.status(200).json({
                    success: true,
                    status: 'green',
                    message: 'Успешно получено',
                    data: {
                        code: 200,
                        message: 'ok',
                        data: {
                            users: users
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
                    message: 'Что то пошла не так',
                    data: {
                        code: 500,
                        message: err
                    }
                });
            }
        );
    });

    // add new
    router.post('/add', filters.user.authRequired(), filters.input.validate(userForm), (req, res) => {
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
        
            user.save().then(
                (saveUser) => {
                    res.status(200).json({
                        success: true,
                        status: 'green',
                        message: 'Успешно добавлено',
                        data: {
                            code: 201,
                            message: 'add new',
                            data: {
                                user: saveUser
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

    // update user data
    router.put('/update/:id', filters.user.authRequired(), filters.input.validate(userForm), (req, res) => {
        let _id = req.params.id;
        if (!_id || !ObjectId.isValid(_id)) {
            return res.status(200).json({
                success: false,
                status: 'yellow',
                message: 'Параметер неправильно передано',
                data: {
                    code: 403,
                    message: 'Parameters not valid'
                }
            });
        }
        console.log(req.body);
        db.User.findById(_id).then(
          (user) => {
              if (!user) {
                  return res.status(200).json({
                      success: false,
                      message: 'Пользователь не найдено',
                      status: 'yellow',
                      data: {
                          code: 404,
                          message: 'user not found'
                      }
                  });
              }

              user.first_name = req.body.first_name ? req.body.first_name : user.first_name;
              user.last_name = req.body.last_name ? req.body.last_name : user.last_name;
              user.phone = req.body.phone ? req.body.phone : user.phone;
              user.address = req.body.address ? req.body.address : user.address;
              user.email = req.body.email ? req.body.email : user.email;

              let encryptPassword = crypto.encrypt(req.body.password);
              user.password = encryptPassword ? encryptPassword : user.password;
              user.isAdmin = req.body.isAdmin || false;

              user.save().then(
                  (updatedUser) => {
                      res.status(200).json({
                          success: true,
                          status: 'green',
                          message: 'Данные о пользователе успешно обнавлены',
                          data: {
                              code: 200,
                              message: 'Updated successful',
                              data: {
                                  user: updatedUser
                              }
                          }
                      });
                  }).catch(
                      (err) => {
                          console.log(err);
                          res.status(200).json({
                              success: false,
                              status: 'red',
                              message: 'что то пошло не так',
                              data: {
                                  code: 500,
                                  message: err
                              }
                          });
                      }
                  );
              }).catch(
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

    router.delete('/remove/:id', filters.user.authRequired(), (req, res) => {
        let _id = req.params.id;
        if(!_id || !ObjectId.isValid(_id)) {
            return res.status(200).json({
                success: false,
                status: 'yellow',
                message: 'Параметры неправильного формата',
                data: {
                    code: 403,
                    message: 'Parameter not valid'
                }
            });
        }

        db.User.findByIdAndRemove(_id).then(
            (user) => {
                if(!user) {
                    return res.json({
                        success: false,
                        status: 'yellow',
                        message: 'Не найдено',
                        data: {
                            code: 404,
                            message: 'not found'
                        }
                    });
                }

                res.status(200).json({
                    success: true,
                    status: 'green',
                    message: 'Успешно удалено',
                    data: {
                        code: 200,
                        message: 'Success delete user',
                        data: {
                            user: user
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

    app.use('/users', router);
}