!(function (angular, window, undefined) {

  var theModule = angular.module("dj-view");

  theModule.component("pageHome", {
    pageTitle: "商城首页",
    requireLogin: true,
    autoDestroy: true,
    pageCss: "bk-e",
    header: { hide: true },
    footer: { hide: true },
    template: `
      <div class="flex header xp-warning padding-1">
        <div class="flex-1 flex-left flex-v-center padding-1">
          <div class="padding-1 em-15">{{title||'标题'}}</div>
        </div>
      </div>`,
    controller: ["$scope", "$http", "$q", "$element", "DjState", function ctrl($scope, $http, $q, $element, DjState) {
      $element.addClass("flex-v flex-1");      

    }]
  });

  theModule.component("pagePage2", {
    pageTitle: "Page2",
    requireLogin: true,
    autoDestroy: true,
    pageCss: "bk-e",
    header: { hide: true },
    //footer: { hide: true },
    template: `
      <div class="flex header xp-warning padding-1">
        <div class="flex-1 flex-left flex-v-center padding-1">
          <div class="padding-1 em-15">{{title||'Page2'}}</div>
        </div>
      </div>`,
    controller: ["$scope", "$http", "$q", "$element", "DjState", function ctrl($scope, $http, $q, $element, DjState) {
      $element.addClass("flex-v flex-1");      

    }]
  });






})(angular, window);
