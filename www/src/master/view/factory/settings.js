!(function (angular, window, undefined) {

  var theModule = angular.module("dj-app");


  theModule.factory("Settings", ["$q",function ($q) {
    /** 本地配置缓存 */
    var Settings = (function () {
      var KEY = "大锅饭配置";
      function load() {
        return $q.when(1).then(() => {
          var str = localStorage.getItem(KEY) || "{}";
          return JSON.parse(str);
        }).catch(e => {
          return {};
        });
      }

      function saveValue(moreData) {
        return load().then(data => {
          data = angular.extend({}, data, moreData);
          localStorage.removeItem(KEY);
          localStorage.setItem(KEY, JSON.stringify(data));
          return data;
        }).catch(e => {
          console.error(e);
          return$q.reject(e);
        });
      }
      return { load, saveValue };
    })();

    return Settings;

  }]);



})(angular, window);