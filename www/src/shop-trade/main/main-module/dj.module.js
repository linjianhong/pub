
angular.module('dj-view', [
  'dj-pop',
  'dj-ui',
  "dj.observable",
  "dj.router",
]).run(["moment", function (moment) {
  moment.locale('zh-cn');
}]);

angular.module('dj-service', [
  'dj-http',
]);

angular.module('dj-filter', [
]);


/** 有版本区分的模块 */
angular.module("dj.router", ["dj.router.ver2" ]);
