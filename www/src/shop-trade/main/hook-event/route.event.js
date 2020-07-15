!(function (angular, window, undefined) {

  var theConfigModule = angular.module('dj-view');


  /** 路由监听 */
  theConfigModule.run(['$rootScope', '$http', '$q', 'DjState', function ($rootScope, $http, $q, DjState) {

    var theSiteConfig_promise = $http.post("系统参数").then(theSiteConfig => {
      theSiteConfig_promise = theSiteConfig;
      return theSiteConfig_promise;
    });

    /** 是否要求登录 */
    function checkNeedLogin(state) {
      if (checkNeedLogin.loginPaths.indexOf(state.path) >= 0) return false;
      var requireLogin = state.requireLogin;
      if (angular.isFunction(requireLogin)) {
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
      console.log("微信分享", wxShareParam);
      if (wxShareParam !== false) {
        if (angular.isFunction(wxShareParam)) wxShareParam = wxShareParam(newPage, $http, $q);
        if (!wxShareParam) {
          $q.when(theSiteConfig_promise).then(theSiteConfig => {
            $scope.theSiteConfig = theSiteConfig;
            var shop_name = theSiteConfig['sys_common']['主标题'] || theSiteConfig.shop_name || '迷你订单系统';

            // console.log("使用默认分享", wxShareParam);
            return $http.post("WxJssdk/setShare", {
              title: shop_name || "迷你订单系统", // 分享标题
              desc: "欢迎您！", // 分享描述
              link: location.origin + location.pathname, // 分享链接
              imgUrl: "https://jdyhy.oss-cn-beijing.aliyuncs.com/www/store/assert/images/xls.logo.png", // 分享图标
              type: 'link', // 分享类型,music、video或link，不填默认为link
              success: function (res) {
                console.log("默认分享成功", res);
                deferAppMessage.resolve(res);
              },
              cancel: function (res) {
                console.log("默认分享失败", res);
                deferAppMessage.reject(res);
              }
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
    function onRouterCheckLogin(data, lastPromiseData) {
      if (data.promise) return data.promise.then(promiseData => {
        data.promise = false;
        return onRouterCheckLogin(data, promiseData);
      });

      data.promise = $http.post("用户登录/状态").then(() => {
        // console.log("用户登录/状态", tokenData);
        return "已登录";
      }).catch(e => {
        var newPage = data.newPage;
        var newState = newPage.state;
        return $q.when(checkNeedLogin(newState)).then(needLogin => {
          if (!needLogin) return "无需登录";
          return $http.post("自动微信登录", { newState }).then(() => lastPromiseData);
        });
      });
    }

    /** 路由监听 */
    $rootScope.$on('$DjPageNavgateStart', function (event, data, lastPromiseData) {
      onRouterCheckLogin(data, lastPromiseData);
    });
  }]);

  /** 微信登录成功，监听 */
  theConfigModule.run(['$rootScope', '$timeout', 'DjState', function ($rootScope, $timeout, DjState) {
    $rootScope.$on("$wxCodeLoginSuccess", function (event, data) {
      console.log("收到：微信登录成功， data = ", data);
      $timeout(() => {
        DjState.replace(data.hash, {}, 1000, "要显示页面");
      })
    });
  }]);

})(angular, window);
