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

      var title = "看见";
      var desc = "是我";
      var imgUrl = "";
      $http.post("WxJssdk/setShare", {
        title: title, // 分享标题
        desc: desc, // 分享描述
        link: location.origin + location.pathname + "#/my", // 分享链接
        imgUrl: imgUrl || "https://jdyhy.oss-cn-beijing.aliyuncs.com/www/store/assert/images/xls.logo.png", // 分享图标
        type: 'link', // 分享类型,music、video或link，不填默认为link
      });
    }]
  });

  var area = {};
  theModule.component("pageHome", {
    pageTitle: "看看",
    requireLogin: false,
    pageCss: "bk-f",
    header: { hide: true },
    footer: { hide: true },
    template: `
    <div class="flex-1" id="echart-amap-id-01"></div>
    <div class="fixed lb flex fa-btns">
      <div class="fa-btn flex-cc" ng-click="setCenter()">
        <i class="fa fa-crosshairs em-16 text-info"></i>
      </div>
      <div class="fa-btn flex-cc" out-click-watch="POP.open" on-out-click="POP.open=false">
        <div class="fa-btn-inner flex-cc" ng-click="popMenu()"><i class="fa fa-bars em-12 text-8"></i></div>
        <div class="fa-btn-menu up flex-v flex-stretch" ng-if="POP.open">
          <div class="item bb-ccc" ng-click="gotoHome();POP.open=false">个人中心</div>
          <div class="item" ng-click="gotoSettings()">设置</div>
          <div class="item" ng-click="setCenter(0)">精确定位</div>
          <div class="item" ng-click="setCenter(1)">微信定位</div>
          <div class="item" ng-click="setCenter(2)">IP定位</div>
          <div class="item">最后定位: {{Geo.last_good_mode}}</div>
        </div>
      </div>
    </div>
    `,
    controller: ["$scope", "$http", "$q", "$element", "Settings", "DjState", "TMAP", function ctrl($scope, $http, $q, $element, Settings, DjState, MAP) {
      $element.addClass("flex-v flex-1");
      console.log("首页");



      MAP.attach("echart-amap-id-01", angular.extend({ zoom: 16 }, area)).then(Map => {
        $scope.Map = Map;
        Map.on_bounds_changed(function (a) {
          // console.log("on_bounds_changed", a)
          var zoom = Map.getZoom();
          var center = Map.getCenter();
          area = { zoom, center };
          Settings.saveValue({ area });
        })
      }).catch(e => {
        console.error("定位", e)
      });

      var Geo = $scope.Geo = {
        last_good_mode: "",
        modes: [
          { name: "精确定位", fn: "getQQGeoPosition", next_t: +new Date, error_count: 0 },
          { name: "微信定位", fn: "getWxPosition", next_t: +new Date, error_count: 0 },
          { name: "IP定位", fn: "getQQIpPosition", next_t: +new Date, error_count: 0 },
        ],
        t: +new Date,
        getPosition_by_mode: (mode) => {
          var now = +new Date;
          if (mode.next_t > now) return $q.reject("未到重新尝试时间");
          return MAP[mode.fn]().then(data => {
            mode.error_count = 0;
            mode.next_t = now;
            Geo.last_good_mode = mode.name;
            return data;
          }).catch(e => {
            mode.error_count++;
            mode.next_t = now + (10 << mode.error_count);
            return $q.reject(e)
          });
        },
        getPosition: () => {
          Geo.getPosition_by_mode(Geo.modes[0])
            //.catch(e => Geo.getPosition_by_mode(Geo.modes[1]))
            .catch(e => Geo.getPosition_by_mode(Geo.modes[2]))
            .then(pos => {
              if (!$scope.Map) return;
              $scope.Map.panTo(pos);
            }).catch(e => {
              console.error("重新定位失败", e)
            })
        },
      }
      $scope.setCenter = (n) => {
        if (angular.isNumber(n)) {
          Geo.getPosition_by_mode(Geo.modes[n])
            .then(pos => {
              if (!$scope.Map) return;
              $scope.Map.panTo(pos);
            }).catch(e => {
              console.error("重新定位失败", e)
            })
        } else {
          console.log("定位居中");
          Geo.getPosition();
        }
      }

      $scope.gotoHome = () => {
        DjState.go("my")
        console.log("个人中心");
      }

      $scope.gotoSettings = () => {
        console.log("设置");
      }

      var POP = $scope.POP = $scope.popMenu = () => {
        if (POP.open) {
          POP.open = false;
          return;
        }
        POP.open = true;
      }

      this.$onDestroy = () => {
        console.log("页面关闭", "打字");
      }
    }]
  });

  theModule.component("pageFriends", {
    pageTitle: "通讯录",
    requireLogin: false,
    pageCss: "bk-e",
    header: { hide: true },
    //footer: { hide: true },
    template: `
      <div class="flex header xp padding-1">
        <div class="flex-1 flex-left flex-v-center padding-1">
          <div class="padding-1 em-15">通讯录</div>
        </div>
        <div class="flex flex-stretch padding-h-1">
          <div class="flex-cc em-15 padding-h-2"><i class="fa fa-search"></i></div>
          <div class="flex-cc em-15 padding-h-2"><i class="fa fa-plus"></i></div>
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
        DjState.replace("friends", { tab: index + 1 });
        // HookDlg.modal({
        //   component: "login-by-wx-qrcode",
        //   backClose: 1,
        // });
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
