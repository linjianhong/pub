!(function (angular, window, undefined) {

  var theModule = angular.module("dj-app");

  theModule.component("page404", {
    pageTitle: "404",
    requireLogin: false,
    pageCss: "bk-f",
    header: { hide: true },
    footer: { hide: true },
    template: `
      <div class="flex-1 flex-cc">
        <div class="em-50 b-900 text-stop">404</div>
      </div>`,
    controller: ["$scope", "$http", "$q", "$element", "DjState", function ctrl($scope, $http, $q, $element, DjState) {
      $element.addClass("flex-v flex-1");

    }]
  });

  theModule.component("pageMy", {
    pageTitle: "首页",
    requireLogin: true,
    pageCss: "bk-e",
    header: { hide: true },
    // footer: { hide: true },
    template: `
      <div class="flex header xp-warning padding-1">
        <div class="flex-1 flex-left flex-v-center padding-1">
          <div class="padding-1 em-15">{{title||'标题 - My'}}</div>
        </div>
      </div>`,
    controller: ["$scope", "$http", "$q", "$element", "DjState", function ctrl($scope, $http, $q, $element, DjState) {
      $element.addClass("flex-v flex-1");

    }]
  });

  theModule.component("pageIme", {
    pageTitle: "打字",
    requireLogin: false,
    pageCss: "bk-f",
    header: { hide: true },
    //footer: { hide: true },
    template: `
      <div class="flex header xp-warning padding-1">
        <div class="flex-1 flex-left flex-v-center padding-1">
          <div class="padding-1 em-15">{{title||'打字'}}</div>
        </div>
      </div>`,
    controller: ["$scope", "$http", "$q", "$element", "DjState", function ctrl($scope, $http, $q, $element, DjState) {
      $element.addClass("flex-v flex-1");

      this.$onDestroy=()=>{
        console.log("页面关闭", "打字");
      }
    }]
  });

  theModule.component("pagePage2", {
    pageTitle: "Page2",
    requireLogin: false,
    pageCss: "bk-e",
    header: { hide: true },
    //footer: { hide: true },
    template: `
      <div class="flex header xp-warning padding-1">
        <div class="flex-1 flex-left flex-v-center padding-1">
          <div class="padding-1 em-15">{{title||'Page2'}}</div>
        </div>
      </div>
      <div class="flex padding-3">
        <div class="padding-3 text-active" ng-click="click_TAB($index)" ng-repeat="item in TAB">{{item.text||item}}</div>
      </div>`,
    controller: ["$scope", "$http", "$q", "$element", "DjState", function ctrl($scope, $http, $q, $element, DjState) {
      $element.addClass("flex-v flex-1");

      $scope.TAB = [
        { text: "标签1" },
        { text: "标签2" },
        { text: "标签3" },
      ];

      $scope.click_TAB = index => {
        DjState.replace("page2", { tab: index + 1 });
      }
    }]
  });






})(angular, window);
