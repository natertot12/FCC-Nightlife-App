/*
var mongoUrl     = 'mongodb://localhost:27017/polls';
var mongo        = require('mongodb').MongoClient();
mongo.connect(mongoUrl, function(err, db) {
    if(err) throw err;
*/
module.exports = function(app, passport, search) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    /*
    app.get('/', function(req, res) {
        
        if(req.isAuthenticated()) {
            res.render('main.ejs', {
                user: req.user
            });
        //} else if(req.user.local.email == undefined && req.user.facebook.token == undefined && req.user.twitter.token == undefined) {
        } else res.render('index.ejs');
        
        fs.readFile((path.join(__dirname + '/views/index.html')), function(err, data) {
        if (err) throw err;
            res.write(data);
            res.end();
        });
    });
    */
    
    app.get('/index', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    
// handle posts  ===============================================================
/*
    app.post('/search', function(req, res) {
        //search(req, res);
        var search = req.body.search;
        //console.log(search);
        client.search({
            term: "Bars",
            categories: "Bars",
            location: search
        }).then(function (data) {
            //res.write--------
            for(var a = 0; a < data.length; a++) {
                res.write('<div class="container center-block well" id="resuts"><img src="' + data[a].snippet_image_url + '" style="float: left; margin-left: 35px; padding-right: 20px;"><form action="/add/' + a + '" method="post" class="center-block"><fieldset class="form-group"><input id="submit" class="btn btn-secondary" type="submit" value="'+  data[a].rating + 'Going"/></fieldset><h4>'+ data[a].name + '</h4><p>'+ data[a].snippet_text + '</p></div>');
            }
            //console.log("Searched. found this");
            //console.log(data);
        });
    });
    
    */
    
    
    
    
    
    
    
    
// functions     ===============================================================
    

    
    
    
    
    
    
    
    
    
    
    
    

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================
    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });
        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/search?search=' + search, // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));
        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });
        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/search?search=' + search, // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));
    // facebook -------------------------------
        // send to facebook to do the authentication
        app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/search?search=' + search,
                failureRedirect : '/search?search=' + search
            }));
    // twitter --------------------------------
        // send to twitter to do the authentication
        app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));
        // handle the callback after twitter has authenticated the user
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '/search?search=' + search,
                failureRedirect : '/search?search=' + search
            }));
// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================
    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/search?search=' + search, // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));
    // facebook -------------------------------
        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/search?search=' + search,
                failureRedirect : '/search?search=' + search
            }));
    // twitter --------------------------------
        // send to twitter to do the authentication
        app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));
        // handle the callback after twitter has authorized the user
        app.get('/connect/twitter/callback',
            passport.authorize('twitter', {
                successRedirect : '/search?search=' + search,
                failureRedirect : '/search?search=' + search
            }));
// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future
    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            if(err) throw err;
            res.redirect('/');
        });
    });
    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            if(err) throw err;
            res.redirect('/');
        });
    });
    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            if(err) throw err;
            res.redirect('/');
        });
    });
    
};//module exports close
//});//close mongodb



// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
