!(function (window, angular, undefined) {

  // alert(location.href);
  if (location.search) { location.href = location.pathname + location.hash; }

  angular.module('my-app', ['dj-app']);

  angular.bootstrap(document, ['my-app']);

})(window, angular);
