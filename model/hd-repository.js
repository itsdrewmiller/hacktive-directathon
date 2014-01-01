var Mongolian = require('mongolian');
var ObjectId = Mongolian.ObjectId;
var db = (new Mongolian()).db('hd');
var _ = require('lodash');
var nconf = require('nconf');

var votes = db.collection('votes');
var awards = db.collection('awards');
var projects = db.collection('projects');
var voters = db.collection('voters');
voters.drop();

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


var repo = {

	getAwards: function(callback) {
		awards.find({}, { _id: false }).toArray(callback);
	},

	getProjects: function(callback) {
		projects.find({}, { _id: false }).toArray(callback);
	},

	getVotes: function(callback) {
		votes.find({}, { _id: false }).toArray(callback);
	},

	saveVote: function(vote, callback) {
		// a vote looks like:
		// { voter: { .. who knows .. }, award: :awardId, votes: [:firstPlaceProjectId, :secondPlaceProjectId, .. ]}
	},

	saveVoter: function(voter, callback) {
		if (voter.facebookId) {
			voters.findOne({ facebookId: voter.facebookId }, function(err, match) {
				if (match) {
					// We cool
					callback(null, match);
				} else {
					// Gotta create
					voters.insert(voter, function(err) {
						voters.findOne({ facebookId: voter.facebookId }, function(err, match2) {
							callback(null, match2);
						});
					});
				}
			});
		} else {
			callback('Unknown voter type');
		}
	},

	getVoter: function(hexId, callback) {
		voters.findOne({ _id: new ObjectId(hexId) }, callback);
	}
};

module.exports = repo;