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
    router.put('/update', filters.user.authRequired(), filters.input.validate(exchangeForm), (req, res) => {
        console.log(req.body);

        db.Exchange.findOne().then(
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

              if (req.body.usd) exchange.usd = req.body.usd;
              if (req.body.eur) exchange.eur = req.body.eur;
              if (req.body.kzt) exchange.kzt = req.body.kzt;
              if (req.body.rub) exchange.rub = req.body.rub;

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