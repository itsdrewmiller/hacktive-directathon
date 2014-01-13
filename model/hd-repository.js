var Mongolian = require('mongolian');
var ObjectId = Mongolian.ObjectId;
var db = (new Mongolian()).db('hd');
var _ = require('lodash');
var nconf = require('nconf');

var votes = db.collection('votes');
var awards = db.collection('awards');
var projects = db.collection('projects');
var voters = db.collection('voters');

nconf
	.argv()
	.env()
	.file({ file: './config.json' });

var awardsToUpsert = nconf.get('awards');

_.each(awardsToUpsert, function(award) {
	awards.update(
		{ id: award.id }, 
		{ $set: award },
		{ upsert: true});
});

var projectsToUpsert = nconf.get('projects');

_.each(projectsToUpsert, function(project) {
	projects.update(
		{ id: project.id }, 
		{ $set: project },
		{ upsert: true});
});

var repo = function(voter) {

	var self = this;

	self.getAwards = function(callback) {
		awards.find({}, { _id: false }).toArray(callback);
	};

	self.getProjects = function(callback) {
		projects.find({}, { _id: false }).toArray(callback);
	};

	self.getVotes = function(callback) {
		votes.find({}, { _id: false }).toArray(callback);
	};

	self.getMyProject = function(callback) {
		console.log(voter._id);
		projects.find({ authors: { $elemMatch: { _id: voter._id } } }, { _id: false }).toArray(function(err, arr) {
			if (err) callback(err);
			if (arr.length === 0) {
				callback(null, null);
			} else if (arr.length === 1) {
				callback(null, arr[0]);
			} else {
				callback('Too many results');
			}
		});
	};

	self.createProject = function(project, callback) {
		project.authors = [ voter ];

		projects.insert(project, callback);

	};

	self.getMyVotes = function(callback) {
		projects.find({ voter: { $elemMatch: { _id: voter._id } } }, { _id: false }).toArray(callback);
	};

	self.saveVote = function(vote, callback) {
		// a vote looks like:
		// { voter: { .. who knows .. }, award: :awardId, votes: [:firstPlaceProjectId, :secondPlaceProjectId, .. ]}
	};

	self.saveVoter = function(newVoter, callback) {
		if (newVoter.facebookId) {
			voters.findOne({ facebookId: newVoter.facebookId }, function(err, match) {
				if (match) {
					// We cool
					callback(null, match);
				} else {
					// Gotta create
					voters.insert(newVoter, function(err) {
						voters.findOne({ facebookId: newVoter.facebookId }, function(err, match2) {
							callback(null, match2);
						});
					});
				}
			});
		} else {
			callback('Unknown voter type');
		}
	};

	self.getVoter = function(hexId, callback) {
		voters.findOne({ _id: new ObjectId(hexId) }, callback);
	};
};

module.exports = repo;