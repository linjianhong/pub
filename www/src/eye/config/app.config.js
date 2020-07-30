!(function (window, angular, undefined) {

  /**
   * 网站通用配置
   */
  window.theSiteConfig = angular.extend({
    localStorage_KEY_UserToken: '__stock_user_token__',
    apiRoot: '../../api/src/eye/', //本地的API

    title: {
      hide: false,  // 默认是否隐藏上方标题栏
      text: "微商城" // 默认标题
    },

    wxShareParam: () => {
      return {
        title: shop_name || "打字", // 分享标题
        desc: "欢迎您！", // 分享描述
        link: location.origin + location.pathname + location.hash, // 分享链接
        imgUrl: "https://jdyhy.oss-cn-beijing.aliyuncs.com/www/store/assert/images/xls.logo.png", // 分享图标
      }
    },
  },
    window.theSiteConfig
  );

})(window, angular);
