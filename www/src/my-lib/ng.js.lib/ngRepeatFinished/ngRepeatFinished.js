!(function (window, angular, undefined) {

  var theModule = angular.module("dj-ui");
  theModule.directive("onFinishRender", ["$timeout", function ($timeout) {
    return {
      restrict: "A",
      link: function (scope, element, attr) {
        if (scope.$last === true) {    //判断是否是最后一条数据
          $timeout(function () {
            scope.$emit("ngRepeatFinished"); //向父级scope传送ngRepeatFinished命令
          });
        }
      }
    };
  }]);

})(window, angular);