let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;

// services
let crypto = require('../services/crypto');

// validate forms
let blogForm = require('../forms/blog');

module.exports = (app, db) => {
    let config = app.get('config');
    let filters = app.get('filters');

    // get all
    router.get('/', filters.user.authRequired(), (req, res) => {
        db.Blog.find().then(
            (blogs) => {
                res.status(200).json({
                    success: true,
                    status: 'green',
                    message: 'Успешно получено',
                    data: {
                        code: 200,
                        message: 'ok',
                        data: {
                            blogs: blogs
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
    router.post('/add', filters.user.authRequired(), filters.input.validate(blogForm), (req, res) => {
      console.log(req.body);
      db.Blog.findOne({name: req.body.name}).then(
        (find_blog) => {
            if (find_blog) {
                return res.status(200).json({
                    success: false,
                    status: 'yellow',
                    message: 'Блог с таким именем уже зарегистрирован',
                    data: {
                        code: 403,
                        message: 'blog dublicate',
                        data: {
                            blog: find_blog
                        }
                    }
                });
            }
            let blog = new db.Blog(req.body);
        
            blog.save().then(
                (saveBlog) => {
                    res.status(200).json({
                        success: true,
                        status: 'green',
                        message: 'Успешно добавлено',
                        data: {
                            code: 201,
                            message: 'add new',
                            data: {
                                blog: saveBlog
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
    router.put('/update/:id', filters.user.authRequired(), filters.input.validate(blogForm), (req, res) => {
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
        db.Blog.findById(_id).then(
          (blog) => {
              if (!blog) {
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

              if (req.body.name) blog.name = req.body.name;
              if (req.body.htmlH1) blog.htmlH1 = req.body.htmlH1;
              if (req.body.htmlTitle) blog.htmlTitle = req.body.htmlTitle;
              if (req.body.metaDescription) blog.metaDescription = req.body.metaDescription;
              if (req.body.metaKeywords) blog.metaKeywords = req.body.metaKeywords;
              if (req.body.text) blog.text = req.body.text;
              if (req.body.seoUrl) blog.seoUrl = req.body.seoUrl;
              if (req.body.countViewers) blog.countViewers = req.body.countViewers;
              blog.isShowInMainPage = req.body.isShowInMainPage || false;

              blog.save().then(
                  (updatedBlog) => {
                      res.status(200).json({
                          success: true,
                          status: 'green',
                          message: 'Данные о блоге успешно обнавлены',
                          data: {
                              code: 200,
                              message: 'Updated successful',
                              data: {
                                  blog: updatedBlog
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

        db.Blog.findByIdAndRemove(_id).then(
            (blog) => {
                if(!blog) {
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
                            blog: blog
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

    app.use('/blogs', router);
}