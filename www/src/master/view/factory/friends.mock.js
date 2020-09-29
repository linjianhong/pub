!(function (angular, window, undefined) {

  var theModule = angular.module("dj-app");

  /** 签名配置 */
  theApp.run(["$http", "sign", function ($http, sign) {

    sign.registerHttpHook({
      match: /^获取通讯录$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax = $http.post("缓存请求", { api: "friends/me", data: {}, delay: 6e5 });
        return mockResponse(ajax.then(json => angular.extend({}, window.theSiteConfig, json.datas)));
      }
    });

    sign.registerHttpHook({
      match: /^重置通讯录$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax = $http.post("缓存请求", { api: "friends/me", data: {}, reset: 1 });
        return mockResponse(ajax);
      }
    });

  }]);


  theModule.factory("Friends", ["$q", "$http", function ($q, $http) {

    var D = {
      groups: [],
      friends: [],
    }

    function ready() {
      return $http.post("获取通讯录");
    }

    function datas() {
      return D;
    }

    function addGroup(name, parent) {
      $http.post("重置通讯录");
    }

    function addUser(id, groups) {
      $http.post("重置通讯录");
    }


    return {
      ready,
      datas,
      addGroup,
      addUser,
    };
  }]);



})(angular, window);