!(function (window, angular, undefined) {
  /**
   * 用户登录总控模块
   *
   * 功能：
   * 1. 请求登录 $http.post("用户登录/请求登录", {mode: "手机验证码登录"}).then(...)
   * 2. 清除登录 $http.post("用户登录/清除登录").then(...)
   * 3. 查询用户登录状态 $http.post("用户登录/状态").then(tokenData=>{})
   * 4. 提供api签名承诺 $http.post("用户登录/签名").then(signDatas => { })
   * 5. 等待登录成功 $http.post("用户登录/等待登录成功").then(promise => { promise.then(tokenData=>{})})
   * 6. 自动发布登录状态改变
   * 7. 登录模式兼容
   *
   * 请求方式：
   * 1. $http.post("用户登录/状态").then(...)
   * 2. $http.post("用户登录", "状态").then(...)
   *
   * 登录状态监听：
   * $rootScope.$on("用户登录状态", (event, status)=>{
   *   var isLogged = !!status.mode;
   *   var token_data = status.data;
   * })
   */

  var theSiteConfig = window.theSiteConfig || {};


  var theModule = angular.module("dj.usertoken");
  var isWx = (/micromessenger/i).test(navigator.userAgent);
  var MSG = {
    "用户登录状态": "用户登录状态",
  }

  var LOGIN_HASH = "/wx-code-login";
  var API_PATH = "app/wx_code_login";
  var localStorage_KEY = theSiteConfig.localStorage_KEY_token || theSiteConfig.localStorage_KEY || "__jdyhy_user_token__";
  var idWxLoginDiv = "wx-lg_cnt_" + (+new Date());

  /**
   * 模块变量
   */
  var Base = {
    LOGIN_HASH,
    localStorage_KEY,

    data: {},
    timestampOffset: 0, // 时间偏差

    loadToken: function () {
      var k = Base.localStorage_KEY;
      var str = localStorage.getItem(k) || "{}";
      if (!/^\{.*\}/.test(str)) str = "{}"
      UserToken.data = JSON.parse(str);
      return UserToken;
    },

    saveToken: function (data) {
      var k = Base.localStorage_KEY;
      localStorage.removeItem(k);
      localStorage.setItem(k, JSON.stringify(UserToken.data = data || {}));
      return UserToken;
    },

    copyToken: function () {
      return angular.merge({}, UserToken.data);
    },

    hasToken: function (data) {
      data = data || Base.loadToken().data;
      return data && data.tokenid && data.token;
    },

    /** 校准与服务器的时间偏差 */
    adjustTimestamp: function (timestampServer) {
      var dt = new Date();
      var timestampHere = Math.round((dt.getTime() / 1000));
      UserToken.timestampOffset = timestampServer - timestampHere;
    },

    /** 用于 http 签名 */
    signToken: function (tokenData) {
      if (!tokenData) {
        Base.loadToken()
        tokenData = UserToken.data
      }
      var tokenid = tokenData.tokenid;
      var token = tokenData.token;
      var phone = tokenData.phone;
      var uid = tokenData.uid;
      if (!tokenid || !token) {
        return {};
      }
      var dt = new Date();
      var timestamp = Math.round((dt.getTime() / 1000));
      timestamp += UserToken.timestampOffset; // 修正误差
      var sign = md5(token + timestamp);
      var r = { tokenid, timestamp, sign }
      if (phone) r.phone = phone;
      if (uid) r.uid = uid;
      return r;
    },
  }
  /**
   * 全局变量
   */
  var UserToken = (function () {

    var R = {
      get uid() {
        return UserToken.data.uid;
      },
      set_sys_config: function (fn) {
        if (!angular.isFunction(fn)) {
          console.error("设置系统参数入口, 只接受函数");
          return;
        }
        Base.get_sys_config_fn = fn;
      },
    };

    ["hasToken", "signToken", "copyToken", "adjustTimestamp"].map(fn => R[fn] = Base[fn]);

    return R;
  })();

  /** 用户登录票据, 工厂模式 */
  theModule.factory("UserToken", ["$q", "login_base", "login_by_wx", function ($q) {

    function get_sys_config() {
      if (!Base.get_sys_config_fn) {
        console.error("未设置系统参数入口, 请使用 run() 调用 UserToken.set_sys_config(function(){return obj/promise})");
        return $q.reject("未设置系统参数入口");
      }

      return $q.when(Base.get_sys_config_fn());
    }

    angular.extend(Base, {
      get_sys_config,
    });
    return UserToken;
  }]);


  /** login 相关 */
  theModule.factory("login_base", ["$rootScope", "$q", "$http", function ($rootScope, $q, $http) {
    var LOGIN = {

      begin: function () {
        if (!LOGIN.deferred) LOGIN.deferred = $q.defer();
        LOGIN.promise = LOGIN.deferred.promise;
        return LOGIN.promise;
      },
      OK: function (token) {
        if (!LOGIN.deferred) return;
        LOGIN.deferred.resolve(token);
        $rootScope.$broadcast(MSG["用户登录状态"], { logged: true, token });
        LOGIN.promise = false;
      },
      error: function (data) {
        if (!LOGIN.deferred) return;
        LOGIN.deferred.reject(data);
        LOGIN.promise = false;
      },

      test: function () {
        if (UserToken.hasToken()) {
          return $q.when(UserToken.copyToken());
        }
        if (!LOGIN.promise) return $q.reject("状态: 未登录");
        return $q.when(LOGIN.promise);
      },

      "等待登录成功": function () {
        if (UserToken.hasToken()) {
          return $q.when(UserToken.copyToken());
        }
        var defer = $q.defer();
        $rootScope.$on(MSG["用户登录状态"], (event, data) => {
          var isLogged = !!data.logged;
          if (isLogged) defer.resolve(data.token);
        });
        return defer.promise;
      },

    }
    angular.extend(Base, { LOGIN });


    function login_by_phone() {
      console.error("未提供手机登录入口");
      return $q.reject("未提供手机登录入口");
    }

    function login_test() {
      if (Base.hasToken()) {
        return $q.when(Base.copyToken());
      }
      if (!login_test.promise) return $q.reject("状态: 未登录");
      return $q.when(login_test.promise);
    }

    angular.extend(UserToken, {
      login_by_phone,
      login_test,
    });

    return UserToken;
  }]);

  /** wx login 基本依赖，不输出 */
  theModule.factory("login_by_wx_dependency", [function () {

    function getAuthParam(hash, wx_app) {
      var loginHash = (/\#\!/.test(window.location.hash) ? "#!" : "#") + Base.LOGIN_HASH;
      var appid = wx_app.appid;
      var state = encodeURIComponent((hash || "").match(/^\#?(.*)/)[1]);
      var para1 = wx_app.name;
      var para2 = encodeURIComponent(btoa(window.location.origin + window.location.pathname + loginHash));
      var redirect_uri = `${wx_app.redirect_uri}/${para1}/${para2}`;
      return {
        appid,
        state,
        redirect_uri,
      }
    }
    angular.extend(Base, { getAuthParam });

    return {};
  }]);

  /** wx login 相关 */
  theModule.factory("login_by_wx", ["$rootScope", "$q", "$http", "$location", "HookDlg", "login_by_wx_dependency", function ($rootScope, $q, $http, $location, HookDlg) {

    function getAuthParam(hash, wx_app) {
      var loginHash = (/\#\!/.test(window.location.hash) ? "#!" : "#") + Base.LOGIN_HASH;
      var appid = wx_app.appid;
      var state = encodeURIComponent((hash || "").match(/^\#?(.*)/)[1]);
      var para1 = wx_app.name;
      var para2 = encodeURIComponent(btoa(window.location.origin + window.location.pathname + loginHash));
      var redirect_uri = `${wx_app.redirect_uri}/${para1}/${para2}`;
      return {
        appid,
        state,
        redirect_uri,
      }
    }

    angular.extend(Base, { getAuthParam })

    function login_by_wx(hash) {
      return Base.get_sys_config().then(json_datas => {
        /** 微信浏览器，跳转到网页授权 */
        if (isWx) {
          var wx_app = json_datas.app_wx;
          var authParam = Base.getAuthParam(hash || location.hash, wx_app);
          var wxAuthUrl =
            "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + authParam.appid +
            "&redirect_uri=" + authParam.redirect_uri +
            "&response_type=code&scope=snsapi_base&state=" + authParam.state +
            "#wechat_redirect";
          //setTimeout(() => {
          window.location.href = wxAuthUrl;
          //});
        }

        /** 非微信浏览器，显示二维码 */
        else {
          return HookDlg.modal({
            parentScope: $rootScope,
            component: "loginByWxQrcode",
            backClose: 1,
            attrs: {
              hash: hash || location.hash
            }
          }).catch(e => {
            console.error("微信二维码登录", e);
            return $q.reject(e);
          });
        }
      });
    }

    function login_by_phone() {

    }

    function login_test() {
      if (Base.hasToken()) {
        return $q.when(Base.copyToken());
      }
      if (!login_test.promise) return $q.reject("状态: 未登录");
      return $q.when(login_test.promise);
    }

    angular.extend(UserToken, {
      login_by_wx,
      login_by_phone,
      login_test,
    });

    return UserToken;
  }]);


  /**
   * 微信二维码登录组件
   */
  if (!isWx) theModule.component("loginByWxQrcode", {
    template: `<div id="${idWxLoginDiv}" class="flex-cc">Loading weixin ...</div>`,
    bindings: {
      hash: "<"
    },
    controller: ["$scope", "$http", "$q", "login_by_wx_dependency", function ($scope, $http, $q) {
      this.$onInit = () => {
        Base.get_sys_config().then(json_datas => json_datas.app_wx3).then(wx_app => {
          var authParam = Base.getAuthParam(this.hash || location.hash, wx_app);
          if (typeof (window.WxLogin) == "undefined") {
            !(function (a, b, c) {
              function d(a) {
                var c = "default";
                a.self_redirect === !0 ? c = "true" : a.self_redirect === !1 && (c = "false");
                var d = b.createElement("iframe")
                  , e = "https://open.weixin.qq.com/connect/qrconnect?appid=" + a.appid + "&scope=" + a.scope + "&redirect_uri=" + a.redirect_uri + "&state=" + a.state + "&login_type=jssdk&self_redirect=" + c;
                e += a.style ? "&style=" + a.style : "",
                  e += a.href ? "&href=" + a.href : "",
                  d.src = e,
                  d.frameBorder = "0",
                  d.allowTransparency = "true",
                  // 增加下面一行，解决 Chrome70 的 iframe 跨域问题
                  d.sandbox = "allow-scripts allow-top-navigation allow-same-origin",
                  d.scrolling = "no",
                  d.width = "300px",
                  d.height = "400px";
                var f = b.getElementById(a.id);
                f.innerHTML = "",
                  f.appendChild(d)
              }
              a.WxLogin = d
            })(window, document);
            showWxLogin(authParam);
          } else {
            showWxLogin(authParam);
          }
        }).catch(e => {
          console.error(e)
        });
      }
      function showWxLogin(authParam) {
        new WxLogin(angular.extend({}, authParam, {
          id: idWxLoginDiv,
          scope: "snsapi_login",
          style: "",
          href: ""
        }));
      }
    }]
  });

  /**
   * 默认对时
   */
  theModule.run(["$http", function ($http) {
    $http.post("系统参数").then(json_datas => {
      // console.log("对时", json);
      UserToken.adjustTimestamp(json_datas.timestamp);
    });
  }]);



  /**
   * 请求拦截
   */
  theModule.run(["$rootScope", "$http", "$q", "$location", "sign", function ($rootScope, $http, $q, $location, sign) {
    /**
     * 登录返回监听
     */
    $rootScope.$on("$locationChangeStart", function (event, newUrl, oldUrl, newS, oldS) {
      // console.log("微信登录 $locationChangeStart", newUrl, oldUrl);
      var pathName = $location.path();
      var search = $location.search(); // {code, app, state}
      if (pathName != LOGIN_HASH || !search || !search.code || !angular.isString(search.code) || search.code.length < 32) return;

      // 正在登录，先阻止 location 事件
      event.preventDefault();

      var name = search.app;
      var code = search.code;
      var hash = decodeURIComponent(search.state);

      console.log("监测到 微信登录 $locationChangeStart", { newUrl, oldUrl, name, code, hash });
      // 登录后，登录到需要的地址
      $http.post("我的-基本信息", { reset: 1 }).then(() => $http.post("我的-基本信息"));

      Base.LOGIN.begin();
      /** 用 code 登录 */
      $http.post(API_PATH, { code, name }).then(json => {
        var token = json.datas;
        Base.saveToken(token);
        Base.LOGIN.OK();
        $rootScope.$broadcast("$wxCodeLoginSuccess", { hash, name });
        console.log("微信code登录, 成功");
        return { token };
      }).catch(e => {
        console.log("微信code登录, 失败3", e);
        return $q.reject(e);
      });
    });


    var FN = {

      "开始登录": function (param) {
        if (!FN["正在登录_defer"]) FN["正在登录_defer"] = $q.defer();
        FN["正在登录_promise"] = FN["正在登录_defer"].promise;
        return FN["正在登录_promise"];
      },
      "登录成功": function (data) {
        if (!FN["正在登录_defer"]) return;
        FN["正在登录_defer"].resolve(data);
        FN["正在登录_promise"] = false;
      },
      "登录失败": function (data) {
        if (!FN["正在登录_defer"]) return;
        FN["正在登录_defer"].reject(data);
        FN["正在登录_promise"] = false;
      },


      call: function (name, data) { return FN[name](data); },

      "状态": function () {
        if (UserToken.hasToken()) {
          return UserToken.copyToken();
        }
        if (!FN["正在登录_promise"]) return $q.reject("状态: 未登录");
        return $q.when(FN["正在登录_promise"]);
      },

      "等待登录成功": function () {
        if (UserToken.hasToken()) {
          return $q.when(UserToken.copyToken());
        }
        var defer = $q.defer();
        $rootScope.$on("用户登录状态", (event, status) => {
          var isLogged = !!status.mode;
          if (isLogged) defer.resolve(status.tokenData);
        });
        setTimeout(() => {
          if (UserToken.hasToken()) {
            defer.resolve(UserToken.copyToken());
          }
        }, 2000);
        return defer.promise;
      },

      "请求登录": function (param) {
        console.log("请求登录, param=", param);
        FN["开始登录"]();
        var mode = param && param.mode;
        if (!mode) return FN.call("状态");
        return $http.post(`自定义登录-${param.mode}`, param.data).then(json => {
          var token = json && (json.token || json.datas && json.datas.token);
          /** 登录失败，不破坏原登录状态 */
          if (!UserToken.hasToken(token)) {
            // $rootScope.$broadcast("用户登录状态", { mode: false, prompt: "登录失败" });
            FN["登录失败"]("票据无效");
            return $q.reject("登录失败");
          }
          /** 登录成功 */
          Base.saveToken(token);
          var tokenData = UserToken.copyToken();
          $rootScope.$broadcast("用户登录状态", { mode, tokenData });
          FN["登录成功"](tokenData);
          return tokenData;
        }).catch(e => {
          console.log("请求登录失败, e", e, ",param=", param);
          FN["登录失败"](e);
          return $q.reject(e);
        });
      },

      "清除登录": function (param) {
        var tokenData = UserToken.copyToken();
        $rootScope.$broadcast("用户即将退出登录", tokenData);
        Base.saveToken({});
        $rootScope.$broadcast("用户登录状态", { oldTokenData: tokenData, mode: false });
      },

      "签名": function (param) {
        if (!UserToken.hasToken(param)) {
          return $q.reject("未登录");
        }
        return UserToken.signToken(param);
      },
    }

    sign.registerHttpHook({
      match: /^用户登录(\/(.*))?$/,
      hookRequest: function (config, mockResponse, match) {
        var param = config.data;
        var fn = match[2] || param;
        if (!FN[fn]) return mockResponse.reject("用户登录-非法请求");

        return mockResponse(FN[fn](param));
      }
    });

    sign.registerHttpHook({
      match: /^uid$/,
      hookRequest: function (config, mockResponse, match) {
        return mockResponse(UserToken.data.uid);
      }
    });
  }]);


  /**
   * 程序开始, 自动发布一次用户登录成功
   */
  theModule.run(["$http", function ($http) {
    $http.post("用户登录/状态").then(tokenData => {
      $rootScope.$broadcast("用户登录状态", { mode: "程序开始", tokenData });
    }).catch(e => {
      $rootScope.$broadcast("用户登录状态", { mode: false, reason: e });
    });
  }]);

})(window, angular);
