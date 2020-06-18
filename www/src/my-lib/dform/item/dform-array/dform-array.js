

!(function (window, angular, undefined) {


  var theModule = angular.module('dform');

  theModule.component('dformArray', {
    bindings: {
      initValue: "<",
      config: "<",
      mode: '@',
    },
    template: `
      <div class="row flex-stretch" ng-repeat="html in textArray track by $index">
        <div class="dform-array-text" ng-click="$ctrl.mode!='show'&&editRow($index)" html-content="html"></div>
        <div class="text-primary padding-h-2 flex-cc" ng-click="deleteRow($index)" ng-if="$ctrl.mode!='show'">删除</div>
      </div>
      <div class="row flex-left" ng-repeat="row in moreTextArray track by $index">
        <div class="" html-content="item" ng-repeat="item in row track by $index"></div>
      </div>
      <div class="add-btn bt-ccc" ng-click="addRow()" ng-if="$ctrl.mode!='show'">添加...</div>
      `,
    controller: ['$scope', '$http', '$q', function ($scope, $http, $q) {

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
          $scope.array = angular.merge([], changes.initValue.currentValue);
          parseTexts();
        }
      }

      $scope.addRow = () => {
        $http.post("dform-dialog-form", {
          params: {
            param: {
              items: $scope.items,
              initValue: {},
            }
          },
          options: {
            css: "flex-cc pop-box"
          }
        }).then(value => {
          $scope.array.push(value);
          emitValue();
        });
      }

      $scope.editRow = (index) => {
        $http.post("dform-dialog-form", {
          params: {
            param: {
              items: $scope.items,
              initValue: $scope.array[index],
            }
          },
          options: {
            css: "flex-cc pop-box"
          }
        }).then(value => {
          $scope.array.splice(index, 1, value);
          emitValue();
        });
      }

      $scope.deleteRow = (index) => {
        $scope.array.splice(index, 1);
        emitValue();
      }


      function parseTexts() {
        $scope.textArray = [$scope.array.map(() => "")];
        $q.all($scope.array.map(item => {
          return $q.when(G.item_show_express.calcu(item)).then(text_rows => {
            if (!text_rows) return "";
            if (!angular.isArray(text_rows)) text_rows = [text_rows];
            return text_rows.join("\n");
          });
        })).then(textArray => {
          $scope.textArray = textArray;
          return $q.when(G.more_show_express.calcu({ rows: $scope.array })).then(moreTextArray => {
            $scope.moreTextArray = moreTextArray;
          });
        });
      }


      function emitValue() {
        $scope.$emit("input.component.valueChange", { value: $scope.array });
        parseTexts();
      }
    }]
  });


})(window, angular);

