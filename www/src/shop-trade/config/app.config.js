!(function (window, angular, undefined) {

  /**
   * 网站通用配置
   */
  window.theSiteConfig = angular.extend({
    localStorage_KEY_UserToken: '__stock_user_token__',
    apiRoot: '../../api/src/shop/', //本地的API

    title: {
      hide: false,  // 默认是否隐藏上方标题栏
      text: "微商城" // 默认标题
    },
  },
    window.theSiteConfig
  );

})(window, angular);
