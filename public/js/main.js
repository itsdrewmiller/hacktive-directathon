// All the angular stuff needed to get the page set up

var app = angular.module('hacktive-directathon', ['ngResource']);

// var MainCtrl = function($scope) {

// };

app.service('$$hd', ['projects','awards', function(projects, awards) {
	return {
		projects: projects,
		awards: awards
	};
}]);

app.controller('MainCtrl', function($scope, $$hd) {
	$scope.projects = $$hd.projects;
	$scope.awards = $$hd.awards;
});

