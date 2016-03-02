// server.js

//all credit for twitter facebook and login/signup integration ---> https://github.com/scotch-io/easy-node-authentication/tree/twitter

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');


// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
//require('./app/routes.js')(app, passport, search); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);

var fs = require("fs");
var path = require("path");

var nodeSchedule = require("node-schedule");      //should reset all stats at 6 o'clock every morning

var mongo = require('mongodb').MongoClient;
var mongoUrl = 'mongodb://localhost:27017/mongo';

var yelp         = require("node-yelp");

var client = yelp.createClient({
    oauth: {
        "consumer_key": "N8VB2iHY7gmcVPrV6CMOKA",
        "consumer_secret": "0uK5eiO0HJAQCkhZmwHx6dgcuio",
        "token": "GCASBmJ6Eo3jrvKU0QQADdSRZvrZ03E_",
        "token_secret": "ldBcUwXFkcT63TWWknti_hSPI2E"
    },
    httpClient: {
        maxSockets: 10
    }
});

var location;//log user location and route to after login

mongo.connect(mongoUrl, function(err, db) {
    if(err) throw err;
    
// normal routes ===============================================================

app.get('/', function(req, res) {
        fs.readFile((path.join(__dirname + '/views/index.html')), function(err, data) {
        if (err) throw err;
            res.write(data);
            res.end();
    });
});

app.get('/search', function(req, res) {
        var query = req.query['search'];
        location = query;
        fs.readFile((path.join(__dirname + '/views/index.html')), function(err, data) {
        if (err) throw err;
            res.write(data);
            client.search({
                term: "Bars",
                categories: "Bars",
                location: query || "San Francisco"
            }).then(function (data) {
                var places = data.businesses;
                var a = 0;
                places.forEach(function(doc) {
                    //if(db.collection("mongo").find({_id: doc.id}).count() == 0) {
                        db.collection("mongo").insert({_id: doc.id, total: 0, votedBy: [] });
                    //    console.log("inserted");
                    //}
                    
                    db.collection("mongo").findOne({_id: doc.id}, function(err, data) {
                        if(err) throw err;
                        //console.log(data);
                        //console.log(data["total"]);
                        if(data != null) {
                            //console.log(data["total"]);
                            //going = data.total || 0;
                            //going = data.total;
                            res.write('<div class="container center-block well" id="resuts"><img src="' + doc.image_url + '" style="float: left; margin-left: 35px; padding-right: 20px;"/><img src="' + doc.rating_img_url + '" style="float: left; margin-left: 35px; padding-right: 20px;"/><form id="' + doc.id + '" action="/add' + doc.id + '" method="get" class="center-block"><fieldset class="form-group"><input id="submit" class="btn btn-secondary" type="submit" value="' + data.total + ' Going"/></fieldset><a href="'+ doc.mobile_url + '" style="text-decoration: none;"><h4>'+ doc.name + '</h4><p>'+ doc.snippet_text + '</p><p>' + doc.id + '</p></a></form></div>');
                        }
                        a++;
                        if(a == places.length) {
                            res.end();
                        }
                    });
                    
                   //res.write('<div class="container center-block well" id="resuts"><img src="' + doc.image_url + '" style="float: left; margin-left: 35px; padding-right: 20px;"><img src="' + doc.rating_img_url + '" style="float: left; margin-left: 35px; padding-right: 20px;"><form action="/add/' + doc.id + '" method="post" class="center-block"><fieldset class="form-group"><input id="submit" class="btn btn-secondary" type="submit" value="' + going + ' Going"/></fieldset><a href="'+ doc.mobile_url + '" style="text-decoration: none;"><h4>'+ doc.name + '</h4><p>'+ doc.snippet_text + '</p></a></div>');
                }, function(err) {
                    if(err) throw err;
                    res.end();
                });
            });
        });
    });
    
    
    app.get('/last', function(req, res) {
        fs.readFile((path.join(__dirname + '/views/index.html')), function(err, data) {
        if (err) throw err;
            res.write(data);
            client.search({
                term: "Bars",
                categories: "Bars",
                location: location || "San Francisco"
            }).then(function (data) {
                var places = data.businesses;
                var a = 0;
                places.forEach(function(doc) {
                    db.collection("mongo").findOne({_id: doc.id}, function(err, data) {
                        if(err) throw err;
                        if(data != null) {
                            res.write('<div class="container center-block well" id="resuts"><img src="' + doc.image_url + '" style="float: left; margin-left: 35px; padding-right: 20px;"/><img src="' + doc.rating_img_url + '" style="float: left; margin-left: 35px; padding-right: 20px;"/><form id="' + doc.id + '" action="/add' + doc.id + '" method="get" class="center-block"><fieldset class="form-group"><input id="submit" class="btn btn-secondary" type="submit" value="' + data.total + ' Going"/></fieldset><a href="'+ doc.mobile_url + '" style="text-decoration: none;"><h4>'+ doc.name + '</h4><p>'+ doc.snippet_text + '</p><p>' + doc.id + '</p></a></form></div>');
                        }
                        a++;
                        if(a == places.length) {
                            res.end();
                        }
                    });
                }, function(err) {
                    if(err) throw err;
                    res.end();
                });
            });
        });
    });
    


    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

app.get('/add:yelp', isLoggedIn, function(req, res) {
    
    
    var yelpID = req.params.yelp;
    //var user = req.user._id.toString();
    var user = req.user._id.toString();
    console.log(user);
    console.log(yelpID);
    
    var query = { _id: yelpID, votedBy: { $nin:  [user]  } };
    var test = db.collection("mongo");
    
    //test.update({_id: yelpID}, { $inc: { total: 1 }}, {upsert: true});           //adds the file if it doesn't exist
    test.findOne(query, function(err, result) {
        if(err) throw err;
        if(result != null) {
            console.log("Found");
            test.update(query, { $inc: { total: 1  }, $push: {votedBy: user }  }, {multi: true});
            console.log("Added that you are going");
        }
        else {
            test.update({_id: yelpID, votedBy: { $in: [user]}}, { $inc: { total: -1 }, $pull: {votedBy: user }  }, {multi: true});
            console.log("Not Found");
        }
    });
    //db.mongo.update({_id: "knollwood-tavern-dayton"}, { $inc: {total: -1}, $pull: {votedBy: "56d61ce34887eb7210371622"}})
    //db.mongo.update({_id: "knollwood-tavern-dayton"}, { $inc: {total: 1}, $push: {votedBy: "56d61ce34887eb7210371622"}})
    res.redirect("/last");
    
});

// posts  ======================================================================

// functions ===================================================================

function reset() {
    db.collection("mongo").remove(
        {total: { $exists: true }},
        false
    );
}

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
            successRedirect : '/last', // redirect to the secure profile section
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
            successRedirect : '/last', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));
    // facebook -------------------------------
        // send to facebook to do the authentication
        app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/last',
                failureRedirect : '/'
            }));
    // twitter --------------------------------
        // send to twitter to do the authentication
        app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));
        // handle the callback after twitter has authenticated the user
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '/last',
                failureRedirect : '/'
            }));
// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================
    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));
    // facebook -------------------------------
        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/last',
                failureRedirect : '/'
            }));
    // twitter --------------------------------
        // send to twitter to do the authentication
        app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));
        // handle the callback after twitter has authorized the user
        app.get('/connect/twitter/callback',
            passport.authorize('twitter', {
                successRedirect : '/last',
                failureRedirect : '/'
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
// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

//nodeSchedule.scheduleJob("* * 6 * * 1-7", reset());

});