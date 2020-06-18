/* 主程序 */
!(function (angular, window, undefined) {

  var theModule = angular.module('dj-view');
  theModule.component('divShow', {
    template: ``,
    bindings: {
      div: "<"
    },
    controller: ['$scope', '$compile', '$element', function ctrl($scope, $compile, $element) {
      this.$onChanges = (changes) => {
        if (changes.div) {
          var div = $scope.div = changes.div.currentValue;
          console.log("div=", div)
          if (angular.isString(div)) {
            return $element.html(div);
          }
          if (angular.isArray(div)) {
            $element.html(`<div-show div="div" ng-repeat="div in div track by $index"></div-show>`);
            $compile($element.contents())($scope);
            return;
          }
          $element.html(`<div-show class="{{div.css||''}}" div="div.text"></div-show>`);
          $compile($element.contents())($scope);
          return;
          if (div.css) {
            $element.addClass(div.css);
          }
          if (div.text) {
            if (angular.isString(div.text)) {
              $element.html(div.text);
            }
            else {
              $element.html(`<div-show div="div.text"></div-show>`);
              $compile($element.contents())($scope);
            }
          }
        }
      }
    }]
  });


})(angular, window);
