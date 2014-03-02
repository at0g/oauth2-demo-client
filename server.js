var   express   = require('express')
    , site      = require('./site')
    , server    = process.env.SERVER || 'http://oauth-demo-lb-1153782776.ap-southeast-2.elb.amazonaws.com'
    , host      = process.env.HOST || 'http://oauth-demo-client-lb-1876871782.ap-southeast-2.elb.amazonaws.com'
;


var app = express();

// Set the view engine to parse html as hbs
app.engine('html', require('consolidate').handlebars);
app.set('view engine', 'html');
app.set('views', './templates');

app.use(express.bodyParser());

app.get('/', site.home);

app.get('/login', function(req, res){
    res.redirect(server + '/dialog/authorize?response_type=code&client_id=abc123&redirect_uri=' + host + '/oauth')
});


function convertAccessCodeToToken(req, res, next){
    if(req.query.code){
        require('request').post(server + '/oauth/token',
            {
                form: {
                    code: req.query.code,
                    client_id: 'abc123',
                    client_secret: 'ssh-secret',
                    redirect_uri: host + '/oauth',
                    grant_type: 'authorization_code'
                }
            },
            function(e, response, body){
                var json = JSON.parse(body);
                res.json(json);
            }
        );
    }else{
        next();
    }
}

app.get('/oauth', convertAccessCodeToToken, site.oauth);


app.get('/client-credentials', function(req, res){
    var   request   = require('request')
        , step      = require('step')
        ;

    step(
        function(){
            request.post(server + '/oauth/token', {
                form: {
                    client_id: 'abc123',
                    client_secret: 'ssh-secret',
                    grant_type: 'client_credentials'
                }
            }, this)
        },
        function(e, response, body){
            request.get(server + '/protected-endpoint?access_token=' + JSON.parse(body).access_token, this);
        },
        function(e, response, body){
            res.send(body);
        }
    );

});



app.listen(process.env.PORT || 3001);