/* 用户 - 组件 */
!(function (angular, window, undefined) {

  var theModule = angular.module('dj-view');

  theModule.component('userName', {
    template: `{{userName}}`,
    bindings: {
      uid: "<"
    },
    controller: ['$scope', '$http', '$q', '$element', function ctrl($scope, $http, $q, $element) {
      this.$onChanges = (changes) => {
        if (changes.uid && angular.isString(changes.uid.currentValue)) {
          $http.post("缓存请求", { api: "user/uid2name", data: { uid: changes.uid.currentValue }, delay: 2e6 }).then((json) => {
            $scope.userName = json.datas;
          });
        }
      }
    }]
  });

})(angular, window);
