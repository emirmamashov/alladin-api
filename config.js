module.exports = {
    ROOT_DIR: __dirname,
    DB_URL: process.env.DB_URL || 'mongodb://localhost/alladin',
    UPLOAD_DIR: __dirname + '/public/uploads',
    secret: 'asddpfosjkgnalskdoierj'
}