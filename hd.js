var express = require('express');
var path = require('path');
var hdRepo = require('./model/hd-repository');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var async = require('async');
var nconf = require('nconf');

nconf
	.argv()
	.env()
	.file({ file: './config.json' })
	.defaults({
		'PORT': 3000,
		'sessionSecret': 'This could be more secure'
	});

var app = express();

var port = nconf.get('PORT');
var fbSettings = nconf.get('fbSettings');
var FACEBOOK_APP_ID = fbSettings.APP_ID;
var FACEBOOK_APP_SECRET = fbSettings.APP_SECRET;
var SESSION_SECRET = nconf.get('sessionSecret');

app.set('port', port);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ secret: 'buck futter' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/lib', express.static(path.join(__dirname, 'lib')));


passport.use(new FacebookStrategy({
	clientID: FACEBOOK_APP_ID,
	clientSecret: FACEBOOK_APP_SECRET,
	callbackURL: "http://localhost:" + port + "/auth/facebook/callback"
	},
	function(accessToken, refreshToken, profile, done) {
		// we want to create or update the user based on their facebook id
		hdRepo.saveVoter({ facebookId: profile.id, name: profile.displayName }, function(err, user) {
			return done(null, user);
		});
	}
));

passport.serializeUser(function(user, done) {
	if (user && user._id) {
		done(null, user._id.toString());
	} else {
		done(null, null);
	}
});

passport.deserializeUser(function(id, done) {
	hdRepo.getVoter(id, done);
});

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function(req, res) {
	// Successful authentication, redirect home.
	res.redirect('/');
});

app.get('/', function(req, res){
	// Load the main page - project description and list of awards
	// async/await would be nice

	async.parallel({
		awards: hdRepo.getAwards,
		projects: hdRepo.getProjects,
		votes: hdRepo.getVotes
	},
	function(err, results) {
		res.render('index', {
			awards: results.awards,
			projects: results.projects,
			votes: results.votes,
			user: req.user
		});
	});
});

app.get('/awards', function(req, res) {
	// return all the possible voting categories, with priority ordering
	hdRepo.getAwards(function(err, awards) {
		res.send(awards);
	});
});

app.post('/awards/:award/vote', function(req, res) {
	// provide an IRV ranking for this category
});

app.get('/projects', function(req, res) {
	hdRepo.getProjects(function(err, projects) {
		res.send(projects);
	});
});

app.listen(port);

console.log('Listening on port ' + port);