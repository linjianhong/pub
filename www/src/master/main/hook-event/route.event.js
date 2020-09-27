!(function (angular, window, undefined) {

  var theConfigModule = angular.module("dj-app");


  /** 路由监听 */
  theConfigModule.run(["$rootScope", "$http", "$q", "DjState", "UserToken", function ($rootScope, $http, $q, DjState, UserToken) {

    var theSiteConfig_promise = $http.post("系统参数").then(theSiteConfig => {
      theSiteConfig_promise = theSiteConfig;
      return theSiteConfig_promise;
    });

    /** 是否要求登录 */
    function checkNeedLogin(page) {
      var state = page.state;
      var component = page.component;
      if (checkNeedLogin.loginPaths.indexOf(state.path) >= 0) return false;
      var requireLogin = component.param.requireLogin;
      while (angular.isFunction(requireLogin)) {
        requireLogin = requireLogin(DjState);
      }
      if (requireLogin === false) return false;
      if (!requireLogin) return true; // 不是 false 的其它情况
      return requireLogin;
    }
    checkNeedLogin.loginPaths = [
      "wx-code-login"
    ];


    /** 路由监听，微信分享 */
    $rootScope.$on("$DjPageNavgateSuccess", function (event, newPage, oldPage) {
      var param = (newPage.component || {}).param || {};

      /** 微信分享 */
      var wxShareParam = param.wxShareParam;
      if (wxShareParam !== false) {
        if (angular.isFunction(wxShareParam)) wxShareParam = wxShareParam(newPage, $http, $q);
        if (!wxShareParam) {
          $q.when(theSiteConfig_promise).then(theSiteConfig => {
            $scope.theSiteConfig = theSiteConfig;
            var title = theSiteConfig["wxShare"]["title"] || "分享标题";
            var desc = theSiteConfig["wxShare"]["desc"] || "分享描述";
            var link = theSiteConfig["wxShare"]["link"] || (location.origin + location.pathname + location.hash);
            var imgUrl = theSiteConfig["wxShare"]["imgUrl"] || "https://jdyhy.oss-cn-beijing.aliyuncs.com/www/store/assert/images/xls.logo.png";

            // console.log("使用默认分享", wxShareParam);
            return $http.post("WxJssdk/setShare", {
              title,
              desc,
              link,
              imgUrl,
              type: "link", // 分享类型,music、video或link，不填默认为link
            }).then(json => {
              // console.log("分享成功", json);
            });
          }).catch(json => {
            // console.error("分享错误", json);
          });
        } else {
          console.log("指定分享", wxShareParam);
          $q.when(wxShareParam).then(wxShareParam => {
            console.log("指定分享， wxShareParam=", wxShareParam);
            $http.post("WxJssdk/setShare", wxShareParam);
          });
        }
      }
    });


    /** 监听路由, 检查登录 */
    DjState.register("can_load_page", newPage => {
      console.log("can_load_page, newPage=", newPage);
      var newState = newPage.state;
      return $q.when(checkNeedLogin(newPage)).then(needLogin => {
        if (!needLogin) return "无需登录";
        return UserToken.login_test().then(token => {
          // console.log("原已登录", token);
        }).catch(msg => {
          return UserToken.login_by_wx(newState.hash()).then(token => {
            // console.log("登录成功", token);
          }).catch(e => {
            // DjState.go(-1);
            return $q.reject(e);
          });
        });
      });
    });
  }]);

  /** 微信登录成功，监听 */
  theConfigModule.run(["$rootScope", "$timeout", "DjState", function ($rootScope, $timeout, DjState) {
    $rootScope.$on("$wxCodeLoginSuccess", function (event, data) {
      console.log("收到：微信登录成功， data = ", data);
      $timeout(() => {
        DjState.replace(data.hash, {}, 1000, "要显示页面");
      })
    });
  }]);

})(angular, window);