(function () {

  angular.module('dform')
    .component('dformYn', {
      template: `
        <div class="box flex flex-left {{value&&'yes'||'no'}}" ng-click="toggle()">
          <div class="top flex-cc">{{list[value]}}</div>
        </div>`,
      bindings: {
        config: "<",
        mode: '@'
      },
      controller: ["$scope", "$http", "$timeout", function ctrl($scope, $http, $timeout) {

        $scope.value = 0;
        $scope.list = ["否", "是",];

        this.$onChanges = (changes) => {
          if (changes.config) {
            // $scope.list = (changes.config.currentValue || {}).list || "";
          }
          if (changes.mode) {
            $scope.mode = changes.mode.currentValue || "";
          }
        }
        $scope.$on("input.component.initValue", (event, data) => {
          if (data.value === undefined || data.value === null) return;
          $scope.value = data.value && (data.value !== "0" && data.value != "否" && data.value != "false") ? 1 : 0;
          if ($scope.value !== data.value) $timeout(() => {
            $scope.$emit("input.component.valueChange", { value: $scope.value })
          });
        });

        $scope.toggle = () => {
          if ($scope.mode == "show") return;
          $scope.$emit("input.component.valueChange", { value: $scope.value = $scope.value ? 0 : 1 });
        }

      }]
    });
})();
