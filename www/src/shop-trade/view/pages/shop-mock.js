/* 查询结果列表 */
!(function (angular, window, undefined) {

  angular.module("dj.router.frame").run(["sign", "$http", function (sign, $http) {

    /** 我的订单列表 */
    sign.registerHttpHook({
      match: /^我的订单列表$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax = $http.post("buyer/my_order_list", {}).then(json => {
          json.datas.orders.map(item => {
            item.list = item.list || [];
          });
          return json
        });

        return mockResponse(ajax);
      }
    });


    /** 店铺商品列表 */
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

  }]);

})(angular, window);
