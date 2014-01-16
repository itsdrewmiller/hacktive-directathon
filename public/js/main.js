// All the angular stuff needed to get the page set up

var app = angular.module('hacktive-directathon', ['ngResource','ui.bootstrap','ui.sortable']);

// var MainCtrl = function($scope) {

// };

app.service('$$hd', ['project', 'projects' ,'awards', 'votes', '$resource', function(project, projects, awards, votes, $resource) {

	var projectApi = $resource('/projects/:projectId', { projectId: '@_id' });
	var voteApi = $resource('/votes/:voteId', { projectId: '@_id' });

	var serv = {};

	serv.project = project;
	serv.projects = projects;
	serv.awards = awards;
	serv.votes = votes;

	serv.saveProject = function(proj, callback) {

		var process = function(result) {
			serv.project = result;
			if (typeof callback === 'function') {
				callback(result);
			}
		};

		projectApi.save(proj, process);
	};

	serv.saveVote = function(vote) {

		var updateVotes = function(result) {
			_.each(votes, function(checkVote, index) {
				if (checkVote.awardId === vote.awardId) {
					votes[index] = vote;
				}
			});
		};

		voteApi.save(vote, updateVotes);

	};

	return serv;

}]);

var VoteCtrl = function($scope, $modalInstance, $$hd, award, vote) {
	var projects = $$hd.projects.slice();

	if (vote) {

		var sortMap = {};

		for (var i=0;i<vote.projectIds.length;i++) {
			sortMap[vote.projectIds[i]] = i;
		}

		console.dir(sortMap);

		var compare = function(a,b) {
			if (sortMap[a._id] === undefined) {
				return 1;
			}
			if (sortMap[b._id] === undefined) {
				return -1;
			}

			return sortMap[a._id] - sortMap[b._id];
		};

		projects.sort(compare);

		console.dir(projects);

	}

	$scope.projects = projects;

	$scope.saveVote = function() {
		vote = {
			awardId: award._id,
			projectIds: _.map($scope.projects, function(project) {
				return project._id;
			})
		};
		$$hd.saveVote(vote);
		$modalInstance.close();
	};
};

app.controller('MainCtrl', function($scope, $modal, $$hd) {

	$scope.project = $$hd.project;
	$scope.awards = $$hd.awards;
	$scope.votes = $$hd.votes;

	$scope.projectTmpl = {
		url: $scope.project ? 'existing-project.tmpl.html' : 'new-project.tmpl.html'
	};

	$scope.editProject = function() {
		$scope.projectTmpl = {
			url: 'edit-project.tmpl.html'
		};
	};

	$scope.saveProject = function() {
		$$hd.saveProject($scope.project, function(project) {
			$scope.project = project;
			$scope.projectTmpl = {
				url: 'existing-project.tmpl.html'
			};
		});
	};

	$scope.deleteProject = function() {
		alert('Deleted!');
	};

	$scope.openVote = function(award) {
		var modal = $modal.open({
			controller: VoteCtrl,
			templateUrl: 'vote.tmpl.html',
			resolve: {
				award: function() {
					return award;
				},
				vote: function() {
					return _.find($scope.votes, function(vote) {
						return vote.awardId === award._id;
					});
				}
			}
		});
	};

});

