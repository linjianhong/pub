
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

      "action-list": {
        fa: "list",
        color: "#888",
        text: "功能",
        t3: { text: "功能1" },
        state: "action-list"
      },

      "my-qrcode": {
        fa: "qrcode",
        color: "#888",
        text: "二维码列表",
        t3: { text: "我可以查看或打印的二维码列表" },
        state: "my-qrcode-list"
      },

      "create-qrcode": {
        fa: "qrcode",
        color: "#888",
        text: "添加二维码",
        t3: { text: "添加产品、原料、仓库等二维码" },
        state: "create-qrcode"
      },

      "query": {
        fa: "search",
        color: "#08f",
        text: "查询",
        t3: { text: "查询2" },
        state: "query"
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

      "admin-备份数据": {
        fa: "database",
        color: "#080",
        text: "备份数据",
        t3: { text: "打包数据库并下载，仅系统管理员用户" },
        mode: "download-http",
        //url: window.theSiteConfig.apiRoot+"admin/backup_db",
        url: "admin/backup_db",
      },

      "admin-商品上架": {
        fa: "bank",
        color: "#c60",
        text: "商品上架",
        t3: { text: "商品上架管理，仅系统管理员用户" },
        state: "shop-edit",
      },

      "admin-分组配置": {
        fa: "object-group",
        color: "#06c",
        text: "分组配置",
        t3: { text: "商品分组配置，仅系统管理员用户" },
        state: "group-edit",
      },

      "admin-user": {
        fa: "users",
        color: "#808",
        text: "用户管理",
        t3: { text: "添加或移除用户，管理用户权限" },
        state: "admin-user"
      },
      "admin-role": {
        fa: "user-secret",
        color: "#386",
        text: "角色管理",
        t3: { text: "角色管理, 各用户根据角色，获得权限" },
        state: "admin-role"
      },

      "商城后台-订单列表": {
        fa: "book",
        color: "#855",
        text: "订单列表",
        state: "order-list",
      },
      "商城后台-订单统计": {
        fa: "book",
        color: "#585",
        text: "订单--------统计",
        state: "query",
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