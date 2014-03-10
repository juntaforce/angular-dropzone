/**
 * # Controller
 *
 * Core application controller that includes all services needed to
 * kick-start the application
 */
angular.module('app').controller(
	'Controller',['$rootScope', '$scope', '$log','$timeout'
	,function
		($rootScope, $scope, $log,$timeout ) {
		
		$scope.dropZoneOptions =
		{
			maxFilesize:250,
			paramName:"uploadfile",
			maxFiles:3
		};

		var seconds = 3000;

		$scope.callbacks =
			{
				onFileUpload:function( file ) {
					console.log ( '++++++++++++++++++++++++++++++++++++++++++++++' )
					console.log ( 'AddModelController  >> onFileUpload', file )
					console.log ( '++++++++++++++++++++++++++++++++++++++++++++++' )
					seconds = seconds * 2;
					$timeout(function(){
						$scope.$emit('dropZone:completed',file);
					},seconds);
				},
				removedFile:function(file){
					console.log ( '++++++++++++++++++++++++++++++++++++++++++++++' )
					console.log ( 'AddModelController  >> removedFile', file )
					console.log ( '++++++++++++++++++++++++++++++++++++++++++++++' )
				}

			}


	}])
