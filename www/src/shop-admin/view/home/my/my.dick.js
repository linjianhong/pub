
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

      "admin-查看价格": {
        fa: "bank",
        color: "#F80",
        text: "查看价格",
        t3: { text: "查看价格" },
        poweronly: "权限标志",
      },

      "admin-user": {
        fa: "users",
        color: "#808",
        text: "用户管理",
        t3: { text: "添加或移除用户，管理用户权限" },
        state: "admin-user"
      },
      "admin-user-create": {
        fa: "user-plus",
        color: "#806",
        text: "添加用户",
        t3: { text: "添加用户，在赋与权限和绑定手机后，可自动对应生效" },
        state: "admin-user-create"
      },
      "admin-user-list": {
        fa: "users",
        color: "#33c",
        text: "用户列表",
        t3: { text: "添加或移除用户，管理用户权限" },
        state: "admin-user-list"
      },
      "admin-role": {
        fa: "user-circle-o",
        color: "#585",
        text: "角色管理",
        t3: { text: "管理角色配置，方便管理用户权限" },
        state: "admin-role"
      },
      "admin-power-dick": {
        fa: "book",
        color: "#855",
        text: "权限字典",
        t3: { text: "添加或移除用户，管理用户权限" },
        state: "admin-power-dick"
      },

      "产品套件字典": {
        fa: "book",
        color: "#855",
        text: "产品套件字典",
        state: "dick-edit",
        search: { type: "产品套件字典" },
      },
      "产品字典": {
        fa: "book",
        color: "#585",
        text: "产品字典",
        state: "dick-edit",
        search: { type: "产品字典" },
      },
      "客户字典": {
        fa: "book",
        color: "#558",
        text: "客户字典",
        state: "dick-edit",
        search: { type: "客户字典" },
      },
      "木工字典": {
        fa: "book",
        color: "#f80",
        text: "木工字典",
        state: "dick-edit",
        search: { type: "木工字典" },
      },
      "开料单字典": {
        fa: "book",
        color: "#f80",
        text: "开料单字典",
        state: "dick-edit",
        search: { type: "开料单字典" },
      },


      "快速查询1": {
        fa: "binoculars",
        color: "#860",
        text: "生产状态",
        state: "query-q-produce",
      },
      "油漆统计表": {
        fa: "shield",
        color: "#d63",
        text: "油漆统计表",
        state: "query-more-quick",
        search: { type: "油漆统计表" },
      },
      "油漆验收报表": {
        fa: "shield",
        color: "#d63",
        text: "油漆验收报表",
        state: "query-more-quick",
        search: { type: "油漆验收报表" },
      },
      
      "任务": {
        fa: "table",
        color: "#008",
        text: "任务",
        state: "task-list",
        search: { },
      },
      
      "签到": {
        fa: "coffee",
        color: "#f80",
        text: "签到",
        state: "signin-report",
        search: { },
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