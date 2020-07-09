/* 我的页面 */
!(function (angular, window, undefined) {

  angular.module("dj-view").component("pageMy", {
    pageTitle: "我的首页",
    requireLogin: true,
    pageCss: "bk-d",
    header: { hide: true },
    footer: { hide: true },
    template: `
      <my-info-row class="info-rows" mode="me"></my-info-row>
      <quick-menu></quick-menu>`,
    controller: ["$scope", "$http", "DjState", "$q", function ctrl($scope, $http, DjState, $q) {
    }]
  });
})(angular, window);
