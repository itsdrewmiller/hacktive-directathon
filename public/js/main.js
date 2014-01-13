// All the angular stuff needed to get the page set up

var app = angular.module('hacktive-directathon', ['ngResource']);

// var MainCtrl = function($scope) {

// };

app.service('$$hd', ['project','awards', '$resource', function(project, awards, $resource) {

	var projects = $resource('/projects/:projectId');

	return {
		project: project,
		awards: awards,
		saveProject: function(newProject) {
			var self = this;
			console.dir(newProject);
			projects.save(newProject, function() {
				self.project = newProject;
			});
		}
	};
}]);

app.controller('MainCtrl', function($scope, $$hd) {

	$scope.project = $$hd.project;
	$scope.awards = $$hd.awards;

	$scope.projectTmpl = {
		url: $scope.project ? 'edit-project.html' : 'new-project.html'
	};

	$scope.createProject = function() {
		$scope.projectTmpl = {
			url: 'create-project.html'
		};
	};

	$scope.saveProject = function() {
		$$hd.saveProject($scope.newProject);
	};

});

