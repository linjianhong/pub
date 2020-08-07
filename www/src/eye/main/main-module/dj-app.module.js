!(function (angular, window, undefined) {

  var theApp = angular.module("dj-app", [
    "angularMoment",
    "ngAnimate",
    "dj-view",
  ])


  theApp.run(["DjState", "$http", function (DjState, $http) {
    var otherwise = window.theSiteConfig.otherwise;
    function otherwise_by_login() {
      return $http.post("用户登录/状态").then(() => otherwise.loged || otherwise || "").catch(() => otherwise.unloged || otherwise || "");
    }
    DjState.otherwise(otherwise_by_login);
  }]);

  theApp.config(["$sceDelegateProvider", "$locationProvider",
    function ($sceDelegateProvider, $locationProvider) {
      var oldList = $sceDelegateProvider.resourceUrlWhitelist();
      oldList.push(location.host);
      oldList.push('https://open.weixin.qq.com/**');
      oldList.push(
        "https://api.jdyhy.com/**",
        "https://jdyhy.com/**",
        "self"
      );
      $sceDelegateProvider.resourceUrlWhitelist(oldList);
      $locationProvider.hashPrefix("");
      $locationProvider.html5Mode(false);
      // $urlRouterProvider.otherwise("my-home");//"/page/ship-edit?mmsi=413691090");
    }
  ]);

  /** 签名配置 */
  theApp.run(["$rootScope", "$http", "sign", "UserToken", function ($rootScope, $http, sign, UserToken) {

    var ignorSignUrl = [
      /^(http(s)?\:)?\/\//,
      /^下拉列表-/,
      "获取下拉列表",
      "user/login",
      "sms/login",
      "app/xcx_code_login",
      "app/wx_code_login",
      "app/jsapi_sign",
      "sms/getcode",
      "app/site"
    ]
    function ignorSign(url) {
      return ignorSignUrl.find(item => {
        if (angular.isString(item)) {
          return new RegExp("^" + item + "$").test(url);
        }
        return (item instanceof RegExp) && item.test(url);
      })
    }

    sign.setApiRoot(window.theSiteConfig.apiRoot);
    sign.registerDefaultRequestHook((config, mockResponse) => {
      var url = config.url;
      var post = config.data;
      if (!ignorSign(url)) {
        if (!UserToken.hasToken()) {
          var errmsg = "未登录, 不请求";
          console.log(errmsg, { url, post })
          return mockResponse.reject({ errmsg, url, post });
        }
        post = angular.extend({}, UserToken.signToken(), config.data);
      }
      if (!/^(http(s)?\:)?\/\//.test(url)) {
        url = window.theSiteConfig.apiRoot + url
      }
      return {
        url,
        post
      }
    });

    sign.registerHttpHook({
      match: /^系统参数$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax = $http.post("缓存请求", { api: "app/site", data: { app: "shop-trade" }, delay: 6e5 });
        return mockResponse(ajax.then(json => angular.extend({}, window.theSiteConfig, json.datas)));
      }
    });
  }]);

})(angular, window);
