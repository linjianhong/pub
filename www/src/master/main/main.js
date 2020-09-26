!(function (window, angular, undefined) {

  angular.isPC = !/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
  angular.isWindows = !/Windows/i.test(navigator.userAgent);

  // alert(location.href + "\n\n" + decodeURIComponent(location.href));

  if (location.search) {
    history.replaceState({}, null, location.pathname + location.hash);
    setTimeout(boot, 200)
  } else {
    boot();
  }

  function boot() {
    angular.module('my-app', ['dj-app']);
    angular.bootstrap(document, ['my-app']);
  }

})(window, angular);
