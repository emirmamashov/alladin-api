let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;

// validate forms
let filterForm = require('../forms/filter');

module.exports = (app, db) => {
    let config = app.get('config');
    let filters = app.get('filters');

    // get all
    router.get('/', filters.user.authRequired(), (req, res) => {
        db.Filter.find().then(
            (filters) => {
                res.status(200).json({
                    success: true,
                    status: 'green',
                    message: 'Успешно получено',
                    data: {
                        code: 200,
                        message: 'ok',
                        data: {
                            filters: filters
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
    router.post('/add', filters.user.authRequired(), filters.input.validate(filterForm), (req, res) => {
      db.Filter.findOne({name: req.body.name}).then(
        (find_filter) => {
            if (find_filter) {
                return res.status(200).json({
                    success: false,
                    status: 'yellow',
                    message: 'Фильтер с таким именем уже зарегистрирован',
                    data: {
                        code: 403,
                        message: 'filter dublicate',
                        data: {
                            filter: find_filter
                        }
                    }
                });
            }

            let filter = new db.Filter(req.body);
            filter.save().then(
                (filter) => {
                    res.status(200).json({
                        success: true,
                        status: 'green',
                        message: 'Успешно добавлено',
                        data: {
                            code: 201,
                            message: 'add new',
                            data: {
                                user: filter
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
        }).catch(
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
    router.put('/update/:id', filters.user.authRequired(), filters.input.validate(filterForm), (req, res) => {
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
        db.Filter.findById(_id).then(
          (filter) => {
              if (!filter) {
                  return res.status(200).json({
                      success: false,
                      message: 'Фильтер не найдено',
                      status: 'yellow',
                      data: {
                          code: 404,
                          message: 'Filter not found'
                      }
                  });
              }

              filter.name = req.body.name ? req.body.name : filter.name;

              filter.save().then(
                  (updatedFilter) => {
                      res.status(200).json({
                          success: true,
                          status: 'green',
                          message: 'Данные о филтре успешно обнавлены',
                          data: {
                              code: 200,
                              message: 'Updated successful',
                              data: {
                                  filter: updatedFilter
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

        db.Filter.findByIdAndRemove(_id).then(
            (filter) => {
                if(!filter) {
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
                            filter: filter
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

    app.use('/filters', router);
}