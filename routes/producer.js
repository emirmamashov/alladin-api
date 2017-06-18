let express = require('express');
let router = express.Router();

module.exports = (app, db) => {

    // get all
    router.get('/', (req, res) => {
        db.Producer.find().then(
            (producers) => {
                res.status(200).json({
                    success: true,
                    status: 'green',
                    message: 'Успешно выполнено',
                    data: {
                        code: 200,
                        message: 'ok',
                        data: {
                            producers: producers
                        }
                    }
                });
            }
        ).catch(
            (err) => {
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
    router.post('/add', (req, res) => {
        let newproducer = new db.Producer();
        newproducer.name = req.body.name;
        newproducer.description = req.body.description;
        newproducer.keywords = req.body.keywords;
        newproducer.author = req.body.author;

        newproducer.save().then(
            (producer) => {
                res.status(200).json({
                    success: true,
                    status: 'green',
                    message: 'Сохранено',
                    data: {
                        code: 201,
                        message: 'Create',
                        data: {
                            producer: producer
                        }
                    }
                });
            }
        ).catch(
            (err) => {
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

    app.use('/producers', router);
}