!(function (window, angular, undefined) {

  /**
   * 网站通用配置
   */
  window.theSiteConfig = angular.extend({
    localStorage_KEY_UserToken: "__stock_user_token__",
    apiRoot: "../../api/src/master/", //本地的API
    otherwise: "home",
  }, window.theSiteConfig);

})(window, angular);
