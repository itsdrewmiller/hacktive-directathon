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

var cleanIds = function(callback) {
	return function(err, results) {
		_.each(results, function(result) {
			if (result) {
				result._id = result._id.toString();				
			}
		});
		callback(err, results);
	};
};

var cleanId = function(callback) {
	return function(err, result) {
		if (result && result._id) {
			result._id = result._id.toString();			
		}
		callback(err, result);
	};
};

var repo = function(voter) {

	var self = this;

	self.getAwards = function(callback) {
		awards.find({}).toArray(cleanIds(callback));
	};

	self.getProjects = function(callback) {
		projects.find({}).toArray(cleanIds(callback));
	};

	self.getVotes = function(callback) {
		votes.find({}).toArray(cleanIds(callback));
	};

	self.getMyVotes = function(callback) {
		votes.find({ voterId: voter._id }).toArray(cleanIds(callback));
	};

	self.getMyProject = function(callback) {
		projects.find({ authors: { $elemMatch: { _id: voter._id } } }).toArray(function(err, arr) {
			if (err) callback(err);
			if (arr.length === 0) {
				callback(null, null);
			} else if (arr.length === 1) {
				cleanId(callback)(null, arr[0]);
			} else {
				callback('Too many results');
			}
		});
	};

	self.createProject = function(project, callback) {
		project.authors = [ voter ];

		projects.insert(project, function(err, newProject) {
			cleanId(callback)(err, newProject);
		});

	};

	self.updateProject = function(project, callback) {

		project._id = new ObjectId(project._id);

		projects.save(project, function(err, proj) {
			callback(err, proj);
		});

	};

	self.saveVote = function(vote, callback) {
		vote.voterId = voter._id;
		console.dir('got here');
		votes.update({ voterId: vote.voterId, awardId: vote.awardId }, { $set: vote }, { upsert: true }, cleanId(callback));
		console.dir('and here');
	};

	self.saveVoter = function(newVoter, callback) {
		if (newVoter.facebookId) {
			voters.findOne({ facebookId: newVoter.facebookId }, function(err, match) {
				if (match) {
					// We cool
					cleanId(callback)(null, match);
				} else {
					// Gotta create
					voters.insert(newVoter, function(err) {
						voters.findOne({ facebookId: newVoter.facebookId }, function(err, match2) {
							cleanId(callback)(null, match2);
						});
					});
				}
			});
		} else {
			callback('Unknown voter type');
		}
	};

	self.getVoter = function(hexId, callback) {
		voters.findOne({ _id: new ObjectId(hexId) }, cleanId(callback));
	};
};

module.exports = repo;