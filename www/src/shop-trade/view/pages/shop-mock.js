/* 查询结果列表 */
!(function (angular, window, undefined) {

  angular.module("dj.router.frame").run(["sign", "$http", function (sign, $http) {
    /**  */
    sign.registerHttpHook({
      match: /^店铺商品列表$/,
      hookRequest: function (config, mockResponse, match) {
        var shopid = (+config.data) || 8008001;
        var ajax = $http.post("缓存请求", { api: "shop/shop_goods", data: { code: shopid }, delay: 2e5 }).then(json => {
          json.datas.goods.map(item => {
            item.attr = item.attr || { value: {} };
            item.attr.value = item.attr.value || {};
          });
          return json
        }).catch(e => console.error(e));

        return mockResponse(ajax);
      }
    });

    /**  */
    var DEFAULT_HEAD_IMG = "https://jdyhy.oss-cn-beijing.aliyuncs.com/www/store/assert/images/xls.logo.png";
    var DEFAULT_USERNAME = "游客";
    sign.registerHttpHook({
      match: /^店铺用户$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax = $http.post("shop/me").then(json => {
          var attr = json.datas.attr || {};
          var wx = json.datas.wx || {};
          var name = attr.name || wx.nickname || DEFAULT_USERNAME;
          var headimg = wx.headimgurl || DEFAULT_HEAD_IMG;
          var show_more = json.datas.show_more || [];
          return {
            user: {
              attr, wx, name, headimg, show_more
            }
          }
          console.log("店铺用户", json.datas);
        });

        return mockResponse(ajax);
      }
    });

    /**  */
    sign.registerHttpHook({
      match: /^店铺模板$/,
      hookRequest: function (config, mockResponse, match) {
        var tplName = config.data;
        return mockResponse(TPL_GOODS.find(item => item.name == tplName) || {});
      }
    });
  }]);


  var TPL_GOODS = [
    {
      name: "2019模板",
      before: [],
      after: [
        "http://xlsgdjj.oss-cn-beijing.aliyuncs.com/www/stock/assert/images/tpl-goods/2019-1.jpg",
        "http://xlsgdjj.oss-cn-beijing.aliyuncs.com/www/stock/assert/images/tpl-goods/2019-2.jpg",
        "http://xlsgdjj.oss-cn-beijing.aliyuncs.com/www/stock/assert/images/tpl-goods/2019-3.jpg",
        "http://xlsgdjj.oss-cn-beijing.aliyuncs.com/www/stock/assert/images/tpl-goods/2019-4.jpg",
        "http://xlsgdjj.oss-cn-beijing.aliyuncs.com/www/stock/assert/images/tpl-goods/2019-5.jpg",
        "http://xlsgdjj.oss-cn-beijing.aliyuncs.com/www/stock/assert/images/tpl-goods/2019-6.jpg",
        "http://xlsgdjj.oss-cn-beijing.aliyuncs.com/www/stock/assert/images/tpl-goods/2019-7.jpg",
      ]
    }
  ];

})(angular, window);
