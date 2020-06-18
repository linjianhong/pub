/* 用户管理 */
!(function (angular, window, undefined) {

  var theModule = angular.module('dj-view');

  theModule.directive('popPageBox', function () {
    return {
      restrict: 'AE',
      template: `<ng-transclude></ng-transclude>`,
      transclude: true,
      replace: true,
      controller: ['$scope', '$element', function ($scope, $element) {
        $element.addClass("flex-v pop-page-box");
      }]
    }
  });

  theModule.directive('popPageBoxTitle', function () {
    return {
      restrict: 'AE',
      controller: ['$scope', '$element', function ($scope, $element) {
        $element.addClass("pop-page-box-title flex shrink0");
        $scope.cancle = () => {
          $scope.$emit('dj-pop-box-close', 0);
        }
      }]
    }
  });

  theModule.directive('popPageBoxBody', function () {
    return {
      restrict: 'AE',
      controller: ['$scope', '$element', function ($scope, $element) {
        $element.addClass("flex-1 flex-v");
      }]
    }
  });


})(angular, window);
