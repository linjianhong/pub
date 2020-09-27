/* 主程序 */
!(function (angular, window, undefined) {

  /** 首页地址，需要隐藏 home 按钮 */
  var homeState = "my";

  var theModule = angular.module('dj-app');

  theModule.component('myApp', {
    template: `
      <my-app-header class="header" d="header" ng-if="header && !header.hide"></my-app-header>
      <dj-frame class="{{isFirstRun&&''||'view-animate'}} {{isGoBack&&'back'||''}}" host-css="flex-v"></dj-frame>
      <div class="bottom-nav flex flex-arround" ng-if="!footer.hide && menu && menu.length">
        <div class="item flex-v flex-cc flex-1 {{isActive(item) && 'active'}}" ng-click="clickMenu(item)" ng-repeat="item in menu">
          <i class="fa fa-{{item.i}}" ng-if="item.i"></i>
          <span>{{item.text}}</span>
          <div class="n flex-cc" ng-if="item.n">{{item.n}}</div>
        </div>
      </div>`,
    bindings: {
    },
    controller: [
      '$scope', '$http', '$q', '$rootScope', 'DjState', '$element', '$timeout', 'Observable',
      function ($scope, $http, $q, $rootScope, DjState, $element, $timeout, Observable) {

        if ("首次打开页面，不要动画") {
          $scope.isFirstRun = true;
          setTimeout(() => $scope.isFirstRun = false, 200);
        }

        $http.post("系统参数").then(theSiteConfig => {
          $scope.menu = theSiteConfig.main_menu || "";
        });

        /**
         * 点击菜单响应
         */
        $scope.clickMenu = item => {
          // console.log('点击菜单,', item);
          DjState.go(item.path, item.param || {});
          $timeout(() => {
            $scope.a = $scope.a ? $scope.a + 1 : 0;
          }, 100)
          $timeout(() => {
            $scope.a = $scope.a ? $scope.a + 1 : 0;
          }, 500)
        }

        /**
         * 是否活动项
         */
        $scope.isActive = item => {
          return $scope.statePath == item.path;
        }

        function reshow() {
          var h = window.innerHeight;
          var w = document.body.clientWidth;
          setTimeout(() => {
            var box = $element.children();
            box.css({ width: '100vw' });

            var showHeader = !$scope.header.hide;
            var showFooter = $scope.menu && $scope.menu.length && !$scope.footer.hide;
            var nav_h = showHeader ? (box[0].offsetHeight + (showFooter ? box[2].offsetHeight : 0)) : showFooter ? box[1].offsetHeight : 0;
            box.eq(showHeader ? 1 : 0).css({
              height: (h - nav_h) + 'px',
            });;
          });
        }
        if ("window-resize") {
          $scope.$on('window-resize', function (event, data) {
            reshow();
          });
          reshow();
        }

        /** 标题栏 */
        (function () {

          var router = $scope.router = Observable("app-router");
          ["pageCss", "pageCssMore", "hideTitle", "hideFooter", "statePath"].map(name => {
            router.observe(name, function (v) {
              $scope[name] = v;
            });
          });

          var pageTitleValue = {}
          router.observe("pageTitle", function (pageTitle) {
            pageTitleValue.title = pageTitle;
            $http.post("设置页面标题", pageTitleValue);
          });
          router.observe("header", function (header) {
            pageTitleValue.hide = !!header.hide;
            $http.post("设置页面标题", pageTitleValue);
          });

          /** 后退按钮 */
          var btnGoback = {
            fa: "angle-left",
            click: function () {
              history.go(-1)
            }
          }

          /** 首页按钮 */
          var btnHome = {
            fa: "home",
            click: function () {
              setTimeout(() => DjState.go(homeState));
            }
          }
          /** header 数据 */
          $scope.header = {
            hide: {},
            text: "标题",
            left: [btnGoback],
            right: [btnHome],
          };
          $scope.footer = {
            hide: {},
          };
          router.observe("pageTitle", function (pageTitle) {
            $scope.header.text = pageTitle;
          });
          router.observe("hideHeader", function (v) {
            $scope.header.hide = !!v;
            reshow();
          });
          router.observe("header", function (v) {
            angular.extend($scope.header, v);
            $scope.header.hide = !!v.hide;
            reshow();
          });
          router.observe("footer", function (v) {
            angular.extend($scope.footer, v);
            $scope.footer.hide = !!v.hide;
            reshow();
          });

        })();

        var oldState = { id: 0 };
        /** 路由和历史监听 */
        $rootScope.$on("$DjPageNavgateSuccess", function (event, newPage) {
          var newState = newPage.state;
          $scope.isGoBack = oldState && oldState.id > newState.id;
          $scope.canBack = newState.id > 1;
          // console.log("newState: ", oldState.id, " -> ", newState.id);
          oldState = newState;
        });

      }]
  })


  theModule.component("myAppHeader", {
    template: `
      <div class="header flex flex-between flex-stretch">
        <div class="left btns flex-left flex-1 flex-stretch">
          <div class="flex flex-cc" ng-click="clickBtn(btn(item))" ng-if="!btn(item).hide" ng-repeat="item in $ctrl.d.left">
            <i class="fa fa-{{btn(item).fa}}"> </i>
            <div class="text info">{{btn(item).text}}</div>
          </div>
        </div>
        <div class="text flex-cc flex-2">{{$ctrl.d.text}}</div>
        <div class="right btns flex-right flex-1 flex-stretch">
          <div class="flex flex-cc" ng-click="clickBtn(btn(item))" ng-if="!btn(item).hide" ng-repeat="item in $ctrl.d.right">
            <i class="fa fa-{{btn(item).fa}}"> </i>
            <div class="text info">{{btn(item).text}}</div>
          </div>
        </div>
      </div>`,
    bindings: {
      d: "<"
    },
    controller: ["$scope", "DjState", "$location", function ctrl($scope, DjState, $location) {

      /** 后退按钮 */
      var btnGoback = {
        fa: "angle-left",
        click: function () {
          history.go(-1)
        }
      }

      /** 关闭对话框按钮 */
      var btnCloseDialog = {
        fa: "angle-left",
        click: function () {
          $location.path("");
        }
      }

      /** 首页按钮 */
      var btnHome = {
        fa: "home",
        click: function () {
          setTimeout(() => DjState.go(homeState));
        }
      }

      var btns = {
        home: btnHome,
        back: btnGoback,
        closeDialog: btnCloseDialog,
      }

      $scope.btn = function (nameOrBtn) {
        return btns[nameOrBtn] || nameOrBtn;
      }

      $scope.clickBtn = function (btn) {
        if (angular.isFunction(btn.click)) {
          return btn.click(btn);
        }
        if (btn.state) {
          return setTimeout(() => DjState.go(btn.state.name, btn.state.search));
        }
      }
    }]
  });






  /**
   * 页面路由参数监听（Observable）
   */
  theModule.run([
    "$rootScope",
    "$q",
    "$http",
    "Observable",
    function ($rootScope, $q, $http, Observable) {
      var router = Observable("app-router");

      function when(param, name, newPage) {
        var value = param[name];
        if (angular.isFunction(value)) {
          value = value(newPage, $q, $http);
        }
        return $q.when(value)
      }

      $rootScope.$on("$DjPageNavgateSuccess", function (event, newPage, oldPage) {
        console.log();
        router.newPage = newPage;
        router.oldPage = oldPage;
        router.newState = newPage.state;
        router.newComponent = newPage.component;

        var param = (newPage.component || {}).param;
        param && ["pageTitle", "pageCss", "pageCssMore", "hideTitle", "hideFooter"].map(name => {
          when(param, name, newPage).then(v => {
            if (!angular.equals(router[name], v))
              router[name] = v;
          });
        });
        param && ["header", "footer"].map(name => {
          when(param, name, newPage).then(v => {
            v = v || {};
            if (!angular.equals(router[name], v))
              router[name] = v;
          });
        });

        /** 观察标题 */
        when(newPage, "state").then(state => {
          router.state = state;
          router.statePath = state.path;
        });
      });
    }]);




  /**
   * 设置页面标题
   * 由 $http 拦截服务实现
   */
  theModule.run(["sign", "$http", "$q", function (sign, $http, $q) {

    var theSiteConfig = $http.post("系统参数").then(v => theSiteConfig = v);

    /**
     * 设置 html 页面标题
     */
    function setHtmlTitle(title) {
      document.title = title;
      if (navigator.userAgent.indexOf("MicroMessenger") > 0) {
        // hack在微信等webview中无法修改document.title的情况
        var body = document.body,
          iframe = document.createElement('iframe');
        iframe.src = "/null.html";
        iframe.style.display = "none";
        iframe.onload = function () {
          setTimeout(function () {
            body.removeChild(iframe);
          }, 0);
        }
        body.appendChild(iframe);
      }
    }
    /**
     * 设置页面标题, 根据是否显示标题栏，显示不同内容
     */
    function setTitleAuto(title) {
      $q.when(theSiteConfig).then(theSiteConfig => {
        var defaultTitle = theSiteConfig.sys_common && theSiteConfig.sys_common['主标题'] || theSiteConfig.app_name || (theSiteConfig.title && theSiteConfig.title.text) || "APP";
        title = title || "";
        var hide = !!title.hide;
        title = title.title || title.text || title || "";
        if (hide) {
          setHtmlTitle((title && (title + ' - ') || '') + defaultTitle)
        }
        else {
          setHtmlTitle(defaultTitle);
        }
      });
    }

    /**
     * $http 拦截
     */
    sign.registerHttpHook({
      match: /^设置页面标题$/,
      hookRequest: function (config, mockResponse, match) {
        var param = config.data;
        setTitleAuto(param || {});
        return mockResponse.resolve(1);
      }
    });
  }]);







})(angular, window);