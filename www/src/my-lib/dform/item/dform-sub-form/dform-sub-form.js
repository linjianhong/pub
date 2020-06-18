

!(function (window, angular, undefined) {


  var theModule = angular.module('dform');

  theModule.component('dformSubForm', {
    bindings: {
      initValue: "<",
      config: "<",
      mode: '@',
    },
    template: `
      <div class="dform-array-text" ng-click="$ctrl.mode!='show'&&edit()" html-content="show_html"></div>
      <div class="row flex-left" ng-repeat="row in moreTextArray track by $index">
        <div class="" html-content="item" ng-repeat="item in row track by $index"></div>
      </div>`,
    controller: ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {

      var G = $scope.G = {};

      this.$onChanges = (changes) => {
        if (changes.config) {
          $scope.config = changes.config.currentValue || {};
          G.item_show_express = angular.Express.parse($scope.config.item_show);
          G.more_show_express = angular.Express.parse($scope.config.more_show);
          $scope.items = [];
          $http.post("解析输入字段", { list: $scope.config.items }).then(list => {
            $scope.items = list;
          }).catch(e => {
            console.log("数组输入， 错误", e);
          });
        }
        if (changes.initValue) {
          $scope.value = angular.extend({}, changes.initValue.currentValue);
          parseTexts();
        }
      }

      $scope.$on("input.component.initValue", (event, data) => {
        $scope.value = angular.extend({}, data.value);
        parseTexts();
        if (!angular.equals($scope.value, data.value)) $timeout(() => {
          $scope.$emit("input.component.valueChange", { value: $scope.value })
        });
      });

      $scope.edit = (index) => {
        $http.post("dform-dialog-form", {
          params: {
            param: {
              items: $scope.items,
              initValue: $scope.value,
            }
          },
          options: {
            css: "flex-cc pop-box"
          }
        }).then(value => {
          $scope.value = angular.extend({}, value);
          parseTexts();
          emitValue();
        });
      }

      function parseTexts() {
        $scope.show_html = G.item_show_express.calcu($scope.value);
        $scope.moreTextArray = G.more_show_express.calcu($scope.value);
        console.log("子表单, 文本=", $scope.show_html, $scope.moreTextArray);
      }

      function emitValue() {
        $scope.$emit("input.component.valueChange", { value: $scope.value });
      }
    }]
  });


})(window, angular);

