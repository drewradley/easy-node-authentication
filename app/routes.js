module.exports = function(app, passport) {
    const jwt = require('jwt-simple');
    var User       = require('../app/models/user');
    var nodemailer = require('nodemailer'); 
// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    // app.get('/profile', function(req, res) {
    //     res.render('index.ejs');
    // });
    app.get('/profile', isLoggedIn, function(req, res) {
        console.log("routes.js line 16 "+req.user.local.email)
        if(req.user.local.email=='drewradley@gmail.com' || req.user.local.email=='juliecmoss@berkeley.edu' || req.user.local.email=='sph.digital.learning@berkeley.edu'){
        let query = "SELECT * FROM `Proctors` ORDER BY studentName ASC"; // query database to get all the Proctors

        // execute query
        connection.query(query, (err, result) => {
            if (err) {
                res.redirect('/');
            }
            res.render('indexS.ejs', {
                title: 'Welcome to OOMPH | View Proctors'
                ,proctors: result,
                userEmail: req.user.local.email
            });
        });
    }
        else 
        {
            let query = "SELECT * FROM `Proctors` WHERE `Proctors`.`studentEmail` = '" + req.user.local.email + "'"; // query database to get all the Proctors

            //console.log(query)
            // execute query
            connection.query(query, (err, result) => {
                if (err) {
                    res.redirect('/');
                }
                //console.log(result)
                res.render('indexS.ejs', {
                    title: 'Welcome to OOMPH | View Proctors'
                    ,proctors: result,
                    userEmail: req.user.local.email
                });
            });
        }
        // res.render('profile.ejs', {
        //     user : req.user
        // });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

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
            successRedirect : '/profile', // redirect to the secure profile section
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
            successRedirect : '/login', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['public_profile', 'email'] }));

        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

        // handle the callback after twitter has authenticated the user
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '/',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

        // the callback after google has authenticated the user
        app.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect : '/',
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
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : ['public_profile', 'email'] }));

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

        // handle the callback after twitter has authorized the user
        app.get('/connect/twitter/callback',
            passport.authorize('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

        // the callback after google has authorized the user
        app.get('/connect/google/callback',
            passport.authorize('google', {
                successRedirect : '/profile',
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
            res.redirect('/');// /profile
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

//////////////
//Forgot Password /////////////////
////////////


app.get('/forgotpassword', function (req, res) {

    res.send('<form action="/passwordreset" method="POST">' +
        '<input type="email" name="email" value="" placeholder="Enter your email address..." />' +
        '<input type="submit" value="Reset Password" />' +
    '</form>');
});

app.post('/passwordreset', function (req, res) {
    if (req.body.email !== undefined) {
        var emailAddress = req.body.email;
        var userID=0;
        var secret=null;
        User.findOne({ 'local.email' :  emailAddress }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                console.log("MongoDB user: "+user.local.email)
                secret=user.local.password;
                console.log("MongoDB id: "+user._id)
                userID=user._id;
                console.log("userID "+userID)
                var payload = {
                    id: userID,        // User ID from database
                    email: emailAddress
                };
                var hashed=user.local.password;
                var token = jwt.encode(payload, secret);
                ////
                // var transporter = nodemailer.createTransport({
                //     service: 'gmail',
                //     auth: {
                //     user: process.env.GOOGLE_EMAIL,
                //     pass: process.env.GOOGLE_PW
                //     }
                // });
                const transporter = nodemailer.createTransport({
                    host: 'smtpout.secureserver.net',
                    port: 587,
                    auth: {
                        user: process.env.USER,
                        pass: process.env.PASSWORD
                    }
                });
                var mailOptions = {
                    from: process.env.USER,
                    to: emailAddress,
                    subject: 'OOMPH student password reset',
                    //text: `Please follow this link to reset your password: https://warm-ridge-77429.herokuapp.com/resetpassword/${userID}/${token}/${hashed}`
                    text: `Please follow this link to reset your password: http://localhost:8080/resetpassword/${userID}/${token}/${hashed}`
                };
                
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                    console.log(error);
                    } else {
                    console.log('Email sent: ' + info.response);
                    
                    }
                }); 

                /////
                res.send('You will receive an email with a link to reset your password. <a href="/">Home</a>');
                //res.redirect('/');
            //res.send('<a href="/resetpassword/' + userID + '/' + token +'">Reset password</a>');
                //return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {
                res.send('Email address not found. <a href="/">Home</a>');

                return;
               // return done(null, false, req.flash('signupMessage', 'Cannot find email.'));
            }

        });


        // TODO: Make this a one-time-use token by using the user's
        // current password hash from the database, and combine it
        // with the user's created date to make a very unique secret key!
        // For example:
        // var secret = user.password + ‘-' + user.created.getTime();
        //var secret = 'fe1a1915a379f3be5394b64d14794932-1506868106675';

       
     
        // TODO: Send email containing link to reset password.
        // In our case, will just return a link to click.
        
    } else {
        res.send('Email address is missing. <a href="/">Home</a>');
    }
});
app.get('/resetpassword/:id/:token/:hashed', function(req, res) {
    console.log(req.params.hashed)
    var secret = req.params.hashed;
    User.findOne({ '_id' :  req.params.id }, function(err, user) {
        // if there are any errors, return the error
        if (err)
            return done(err);

        // check to see if theres already a user with that email
        if (user) {
            console.log("MongoDB user: "+user.local.email)
            secret=user.local.password;
            console.log("MongoDB secret: "+secret)
            console.log("hashed"+req.params.hashed)
            if(secret==req.params.hashed)
            {
                res.send('<form action="/resetpassword" method="POST">' +
                '<input type="hidden" name="id" value="' + req.params.id + '" />' +
                '<input type="hidden" name="token" value="' + req.params.token + '" />' +
                '<input type="password" name="password" value="" placeholder="Enter your new password..." />' +
                '<input type="submit" value="Reset Password" />' +
                '</form>');
            } else {
                res.send('This link has expired. Please click on "Reset" again if you still need to change your password. <a href="/">Home</a>');
            }
            //return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
        } else {

            res.send('Email address not found. <a href="/">Home</a>');

        }
    });
    // TODO: Fetch user from database using
    // req.params.id
    // TODO: Decrypt one-time-use token using the user's
    // current password hash from the database and combine it
    // with the user's created date to make a very unique secret key!
    // For example,
    // var secret = user.password + ‘-' + user.created.getTime();
  
   // var payload = jwt.decode(req.params.token, secret);

    // TODO: Gracefully handle decoding issues.
    // Create form to reset password.
    // res.send('<form action="/resetpassword" method="POST">' +
    //     '<input type="hidden" name="id" value="' + req.params.id + '" />' +
    //     '<input type="hidden" name="token" value="' + req.params.token + '" />' +
    //     '<input type="password" name="password" value="" placeholder="Enter your new password..." />' +
    //     '<input type="submit" value="Reset Password" />' +
    // '</form>');
});
app.post('/resetpassword', function(req, res) {
    var secret = 'fe1a1915a379f3be5394b64d14794932-1506868106675';
    // console.log(req.body)
    User.findOne({ '_id' :  req.body.id }, function(err, user) {
        // if there are any errors, return the error
        if (err)
            return done(err);

        // check to see if theres already a user with that email
        if (user) {
            console.log("MongoDB user (reset): "+user.local.email)
            secret=user.local.password;
            console.log("MongoDB secret (reset): "+secret)
           var password = req.body.password;
           
            var newUser            = new User();

            newUser.local.email    = user.local.email;
            newUser.local.password = newUser.generateHash(password);
            console.log("newUser.local.password"+newUser.local.password)
            //User.updateOne({ '_id' :  req.body.id })
            //var newvalues = { $set: {password: newUser.local.password } };
            const query = { '_id' :  req.body.id };
            const update = {
            "$set": {
                "local": {
                "password": newUser.local.password,
                "email": newUser.local.email
                }
            }
};
            const options = { "upsert": false };
            User.updateOne(query, update, options)
            .then(result => {
                res.send(`Successfully updated password. <a href="/">Home</a>`)
                // const { matchedCount, modifiedCount } = result;
                // if(matchedCount && modifiedCount) {
                //     res.send(`Successfully updated password.`)
                // }
            })
            .catch(err => console.error(`Failed to update: ${err}`))
            // newUser.updateOne({ '_id' :  req.body.id },newvalues,function(err) {
            //     if (err)
            //         return (err);

            //     return (null, newUser);
            // });
            //return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
        } else {
            res.send('Email address not found. <a href="/">Home</a>');
           
        }
    });

    //var payload = jwt.decode(req.body.token, secret);

    // TODO: Gracefully handle decoding issues.
    // TODO: Hash password from
    // req.body.password
    res.send('Your password has been successfully changed. <a href="/">Home</a>');
});

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
