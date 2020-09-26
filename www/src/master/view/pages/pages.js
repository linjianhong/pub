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
    pageTitle: "我的",
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

  var area = {};
  theModule.component("pageHome", {
    pageTitle: "首页",
    requireLogin: false,
    pageCss: "bk-f",
    header: { hide: true },
    footer: { hide: true },
    template: `
    <div class="flex-1" id="echart-amap-id-01"></div>
    `,
    controller: ["$scope", "$http", "$q", "$element", "Settings", "TMAP", function ctrl($scope, $http, $q, $element, Settings, MAP) {
      $element.addClass("flex-v flex-1");
      console.log("首页");

      MAP.attach("echart-amap-id-01", angular.extend({ zoom: 16 }, area)).then(Map => {
        // Map.removeControl("LOGO");
        // Map.removeControl("ZOOM");
        // Map.removeControl("ROTATION");
        // Map.addControl("FLOOR");
        Map.on_bounds_changed(function (a) {
          console.log("on_bounds_changed", a)
          var zoom = Map.getZoom();
          var center = Map.getCenter();
          area = { zoom, center };
          Settings.saveValue({area})
        })
      }).catch(e => {
        console.error("定位", e)
      });

      this.$onDestroy = () => {
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
    controller: ["$scope", "$http", "$q", "$element", "DjState", "HookDlg", function ctrl($scope, $http, $q, $element, DjState, HookDlg) {
      $element.addClass("flex-v flex-1");

      $scope.TAB = [
        { text: "标签1" },
        { text: "标签2" },
        { text: "标签3" },
      ];

      $scope.click_TAB = index => {
        DjState.replace("page2", { tab: index + 1 });
        HookDlg.modal({
          component: "login-by-wx-qrcode",
          backClose: 1,
        });
      }
    }]
  });






})(angular, window);
