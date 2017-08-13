module.exports = function(app) {
    /// error handlers
  
    // development error handler
    // will print stacktrace
  
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.json({
                message: err.message,
                error: err,
                title: 'error'
            });
        });
    }
  
    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: {},
            title: 'error'
        });
    });
  };
  