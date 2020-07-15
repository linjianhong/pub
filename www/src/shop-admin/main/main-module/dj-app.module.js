!(function (angular, window, undefined) {

  var theApp = angular.module("dj-app", [
    "ngTouch",
    "angularMoment",
    "ngAnimate",
    "dj-view",
    "dj-service",
    "dj-filter",

    "js-express",

    "dj-login",
    "dj-wx-login",
    "wx-jssdk",
    "my",

    "mock",

    "dform",

    "dj-form-v3",
  ])


  var sub = angular.module("test", []);
  /** 签名配置 */
  // sub.run(["$rootScope", "$location", function ($rootScope, $location) {
  //   console.log("sub run1:");
  // }]);
  // theApp.run(["AA", function (AA) {
  //   console.log("AA1:", AA);
  // }]);
  // theApp.run(["AA", function (AA) {
  //   console.log("AA2:", AA);
  // }]);
  // 
  // sub.factory("AA", [function () {
  //   console.log("AA");
  //   return {}
  // }]);
  // sub.run([function () {
  //   console.log("sub run2:");
  // }]);


  theApp.config(["$sceDelegateProvider", "$locationProvider",
    function ($sceDelegateProvider, $locationProvider) {
      var oldList = $sceDelegateProvider.resourceUrlWhitelist();
      oldList.push(location.host);
      oldList.push('https://open.weixin.qq.com/**');
      oldList.push(
        "https://api.esunion.com/**",
        "https://api.jdyhy.com/**",
        "https://esunion.com/**",
        "https://jdyhy.com/**",
        "http://192.168.31.166/**",
        "http://192.168.31.166:8001/**",
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
          console.log("未登录, 不请求", url)
          return mockResponse.reject("未登录, 不请求");
        }
        post = angular.extend({}, UserToken.signToken(), config.data);
      }
      if (!/^(http(s)?\:)?\/\//.test(url)) {
        url = window.theSiteConfig.apiRoot + url
      }
      return { url, post }
    });

    sign.registerHttpHook({
      match: /^系统参数$/,
      hookRequest: function (config, mockResponse, match) {
        return mockResponse($http.post("缓存请求", { api: "app/site", data: { app: "shop-admin" }, delay: 6e5 }).then(json => json.datas));
      }
    });
  }]);

})(angular, window);
