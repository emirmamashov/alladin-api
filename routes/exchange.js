let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;

// services
let exchageService = require('../services/exchange');

// validate forms
let exchangeForm = require('../forms/exchange');

module.exports = (app, db) => {
    let config = app.get('config');
    let filters = app.get('filters');

    // get all
    router.get('/', filters.user.authRequired(), (req, res) => {

        db.Exchange.findOne().then(
            (exchange) => {
                if (!exchange) {
                    return exchageService.dailyExchange().then(
                        (result) => {
                            let newExchange = new db.Exchange(result);
                            if (!newExchange.usd) newExchange.usd = 69;
                            console.log(result);
                            newExchange.save().then(
                                (savedExchange) => {
                                    res.status(200).json({
                                        success: true,
                                        status: 'green',
                                        message: 'Успешно получено',
                                        data: {
                                            code: 200,
                                            message: 'ok',
                                            data: {
                                                exchange: savedExchange
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
                }

                let updateDate = new Date(exchange.update_at);
                let dateNow = new Date();
                if (updateDate.getDate() != dateNow.getDate() || updateDate.getMonth() != dateNow.getMonth()
                || updateDate.getFullYear() != dateNow.getFullYear()) {
                    return exchageService.dailyExchange().then(
                        (result) => {
                            if (result.usd) {
                                exchange.usd = result.usd;
                            }
                            if (result.eur) {
                                exchange.eur = result.eur;
                            }
                            if (result.kzt) {
                                exchange.kzt = result.kzt;
                            }
                            if (result.rub) {
                                exchange.rub = result.rub;
                            }
                            exchange.save().then(
                                (savedExchange) => {
                                    res.status(200).json({
                                        success: true,
                                        status: 'green',
                                        message: 'Успешно получено',
                                        data: {
                                            code: 200,
                                            message: 'ok',
                                            data: {
                                                exchange: savedExchange
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
                }
                console.log('last version');
                res.status(200).json({
                    success: true,
                    status: 'green',
                    message: 'Успешно получено',
                    data: {
                        code: 200,
                        message: 'ok',
                        data: {
                            exchange: exchange
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

    // update exchange data
    router.put('/update/:id', filters.user.authRequired(), filters.input.validate(exchangeForm), (req, res) => {
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

        db.Exchange.findById(_id).then(
          (exchange) => {
              if (!exchange) {
                  return res.status(200).json({
                      success: false,
                      message: 'exchange не найдено',
                      status: 'yellow',
                      data: {
                          code: 404,
                          message: 'exchange not found'
                      }
                  });
              }

              if (req.body.dollar) blog.dollar = req.body.dollar;
              if (req.body.euro) blog.euro = req.body.euro;
              if (req.body.ruble) blog.ruble = req.body.ruble;
              if (req.body.tenge) blog.tenge = req.body.tenge;
              if (req.body.yen) blog.yen = req.body.yen;

              exchange.save().then(
                  (updatedExchange) => {
                      res.status(200).json({
                          success: true,
                          status: 'green',
                          message: 'Данные о курсах успешно обнавлены',
                          data: {
                              code: 200,
                              message: 'Updated successful',
                              data: {
                                  exchange: updatedExchange
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

    app.use('/exchange', router);
}