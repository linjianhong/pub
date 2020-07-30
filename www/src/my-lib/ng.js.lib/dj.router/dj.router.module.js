
!(function (angular, window, undefined) {

  (function ver1(routerModuleName) {
    var stateModuleName = "dj.router.state.ver1";
    var frameModuleName = "dj.router.frame.ver1";
    angular.module(stateModuleName, []);
    angular.module(frameModuleName, ["ngAnimate", stateModuleName]);
    angular.module(routerModuleName, [frameModuleName, stateModuleName]);
  })("dj.router.ver1");


  (function ver2(routerModuleName) {
    angular.module(routerModuleName, ["ngAnimate"]);
  })("dj.router.ver2");


  angular.module("dj.router", ["dj.router.ver2"]);

})(angular, window);