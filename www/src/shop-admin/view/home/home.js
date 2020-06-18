/* 我的页面 */
!(function (angular, window, undefined) {

  angular.module("dj.router.frame").component("pageMy", {
    pageTitle: "我的 - 首页",
    requireLogin: true,
    pageCss: "bk-d",
    footer: { hide: true },
    template: `
      <my-info-row class="info-rows" mode="me" ng-if="groups"></my-info-row>
      <quick-menu></quick-menu>`,
    controller: ["$scope", "$http", "DjState", "$q", function ctrl($scope, $http, DjState, $q) {
    }]
  });
})(angular, window);
