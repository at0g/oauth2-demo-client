var   querystring   = require('querystring')
    , http          = require('http')
    ;

exports.home = function(req, res){
    res.render('layout', {
        title: 'Home',
        partials: {
            body: 'partials/home'
        }
    })
};

exports.oauth = function(req, res){
    res.send('Oauth callback');
};