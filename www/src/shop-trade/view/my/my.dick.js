
!(function (angular, window, undefined) {

  var theModule = angular.module("my");

  theModule.run(["sign", "$http", function (sign, $http) {
    /** 基本标签 */
    var iconRows = {
      "me": {
        fa: "user",
        color: "#888",
        text: "游客",
        t3: { text: "尚无用户数据" },
        state: "my-info"
      },
      "my-info": {
        fa: "user",
        color: "#888",
        text: "游客",
        t3: { text: "尚无用户数据" },
        state: "my-info-edit"
      },

      "pre-order": {
        fa: "list",
        color: "#880",
        text: "我的订单",
        t2: { text: "尚无" },
        t3: { text: "尚无数据" },
        state: "pre-order-list"
      },


      "mobile": {
        fa: "mobile",
        color: "#888",
        text: "绑定手机",
        t3: { text: "未绑定" },
        state: "bind-mobile"
      },

      "wx": {
        fa: "weixin",
        color: "#888",
        text: "关注微信公众号",
        t3: { text: "" },
        state: "wx"
      },
      "settings": {
        fa: "cogs",
        color: "#888",
        text: "设置",
        t3: { text: "个人设置，一些开关项" },
        state: "my-settings"
      },
      "favorite": {
        text: "收藏",
        color: "#909",
        t3: { text: "收藏起来，有空看看" },
        fa: "cube",
        filter: { favorite: "1" },
        state: "my-favorite"
      },
      "about": {
        fa: "info-circle",
        color: "#888",
        text: "关于",
        t3: { text: "版本信息" },
        state: "about"
      },

      "商城菜单-商城首页": {
        fa: "bank",
        color: "#c60",
        text: "商城首页",
        t3: { text: "商城首页" },
        state: "home"
      },

      "商城菜单-我的订单": {
        fa: "folder",
        color: "#088",
        text: "我的订单",
        t3: { text: "商城首页" },
        state: "home"
      },

      "商城菜单-地址设置": {
        fa: "folder",
        color: "#088",
        text: "地址设置",
        t3: { text: "商城首页" },
        state: "goods-group"
      },

      "商城菜单-订单处理": {
        fa: "folder",
        color: "#088",
        text: "订单处理",
        t3: { text: "商城首页" },
        state: "goods-group"
      },
    }


    /**
     * 返回字典
     */
    sign.registerHttpHook({
      match: /^my-dick$/,
      hookRequest: function (config, mockResponse, match) {
        return mockResponse.resolve({
          iconRows,
        });
      }
    });

    /**
     * 下拉列表
     */
    sign.registerHttpHook({
      match: /^下拉列表-123$/,
      hookRequest: function (config, mockResponse, match) {
        return mockResponse.resolve({ list });
      }
    });

  }]);

})(angular, window);