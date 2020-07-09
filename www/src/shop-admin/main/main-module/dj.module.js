
angular.module('dj-view', [
  'angularMoment',
  "dj.observable",
  "dj.router",
]).run(["moment", function (moment) {
  moment.locale('zh-cn');
}]);

angular.module("dj.router", ["dj.router.ver2" ]);

angular.module('dj-component', [
  'dj-form',
  'dj-pop'
]);

angular.module('dj-service', [
  'dj-http',
  'dj-localStorage-table',
]);

angular.module('dj-filter', [
]);

angular.module('dj-component').factory("APP", ['DjWaiteReady',
  function (DjWaiteReady) {
    return {
      DjWaiteReady
    }
  }]);
