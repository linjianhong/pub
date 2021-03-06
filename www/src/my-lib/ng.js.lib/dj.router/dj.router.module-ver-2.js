/** 路由 ver 2 */

!(function (angular, window, undefined) {
  /**
   *  路由需求

1、页面可以先登录判断，发出请求，得到承诺后显示

2、首页登录页，登录后直接替换页面。可显示登录中，也可以不显示

3、页面数据不变，只替换参数

4、只替换URL，不改变页面

5、只改变页面，不替换URL

6、当改变页面前，用户可以拦截

7、改变页面前，旧页面可以拦截

8、新页面可以禁止改变前的拦截

9、页面可以改变时，生成标题，可以是承诺

10、页面可以改变时，可以设置分享参数等

11、页面改变可以判断前进还是后退

12、监听URL，跳到新页面

13、监听URL，识别仅替换情况

路由事件
1、 进入系统
2、 输入新地址
3、 前进后退
4、 DjState.go
5、 DjState.replace
6、 DjState.otherwise
7、 DjState.when
   */
  var defaultRootModuleName = "dj-app";
  var routerModuleName = "dj.router.ver2";
  var routerModule = angular.module(routerModuleName, ["ngAnimate"]);

  var BASE = (function () {
    var STATE_ID = 0;
    var STATE_t = +new Date();

    function is_good_state(state) {
      return state && state.t == STATE_t && state.id > 0;
    }

    function to_good_state(state) {
      if (!is_good_state(state)) return {};
      return angular.extend({}, state);
    }

    function get_good_state() {
      return { t: STATE_t, id: ++STATE_ID };
    }

    function replace_state(url, state) {
      return history.replaceState(state, null, url);
    }

    /** 组件类 */
    class Component {
      /**
       * @param {string} name 组件名称，驼峰格式
       * @param {object} param 组件参数
       */
      constructor(name, param) {
        this.name = name;
        this.param = param;
      }
      static searchFromRootModule(componentName, rootModuleName) {
        var module = angular.module(rootModuleName);
        var component = module._invokeQueue
          .filter(a => a[1] == "component")
          .map(invoke => invoke[2])
          .find(component => component[0] == componentName);
        if (component) return component;
        for (var i = 0, length = module.requires.length; i < length; i++) {
          component = Component.searchFromRootModule(componentName, module.requires[i]);
          if (component) return component;
        }
        return false;
      }
      /**
       * @param {string} componentName 驼峰格式的组件名
       * @param {string} rootModuleName qngualrJs 模块名
       * @return {Component|false} 返回查到的组件实例
       */
      static getComponent(componentName, rootModuleName) {
        if (!componentName) { return false; }
        rootModuleName = rootModuleName || defaultRootModuleName;
        try {
          // 确保 根模块有效，其它子模块，已由 angularJs 把关
          angular.module(rootModuleName);
        } catch (e) {
          return false;
        }
        var component = Component.searchFromRootModule(componentName, rootModuleName);
        return component && new Component(componentName, component[1]);
      }
    };

    /** 查找页面的组件 */
    function getComponent(state) {
      var orginComponentName = BASE.transformStr(state.path);
      return BASE.Component.getComponent(BASE.transformStr("page-" + orginComponentName));
    }

    /** 字符串转成驼峰 */
    function transformStr(str) {
      return str.replace(/-(\w)/g, function ($0, $1) {
        return $1.toUpperCase();
      });
    }

    /** 驼峰转成-字符串 */
    function untransformStr(str) {
      return str.replace(/([A-Z])/g, function ($0, $1) {
        return "-" + $1.toLowerCase();
      });
    }

    function hash_of_url(url) {
      var match = url.match(/#(!)?\/([^\?]+)(\?(.*))?$/);
      return (match || [""])[0];
    }

    /** 解析 url 中的 queryString 参数
     * @return search
     */
    function parseSearch(queryString) {
      var search = undefined;
      queryString && decodeURIComponent(queryString).replace(/([^?&=]+)=([^&]+)/g, (_, k, v) => (search = search || {})[k] = v);
      return search;
    }

    /** 根据参数，生成 hash */
    function hash(path, search) {
      search = search || {};
      var queryString = Object.keys(search).map(k => `${k}=${encodeURIComponent(search[k])}`).join("&");
      return path + (queryString && ("?" + queryString) || "");
    }
    function href(path, search) {
      return location.origin + location.pathname + "#/" + hash(path, search);
    }

    function setPage(page) {
      BASE.page = page;
      BASE.DjState.$search = page.state.search || {};
    }

    return {
      is_good_state,
      to_good_state,
      get_good_state,
      replace_state,
      getComponent,

      Component,
      hash_of_url,
      transformStr,
      untransformStr,
      parseSearch,
      hash,
      href,

      page: {},
      setPage,

      DjState: { $search: {} },
    }
  })();

  /** State 类及相关 */
  routerModule.run(["$rootScope", "$q", function ($rootScope, $q) {

    function parseHash(url) {
      if (!angular.isString(url)) return new State("", {});
      var match = url.match(/#(!)?\/([^\?]+)(\?(.*))?$/);
      if (!match) {
        if (/^http(s)?/.test(url)) match = [];
        else match = url.match(/(\/)?([^\?]+)(\?(.*))?$/) || []
      }
      var pathName = match[2] || "";
      var queryString = match[4];
      var search = BASE.parseSearch(queryString);
      return new State(pathName, search);
    }


    /** 状态类 */
    class State {
      constructor(path, search) {
        this.id = -1;
        if (path instanceof (State)) {
          this.path = path.path;
          this.search = angular.extend({}, search, path.search);
          return;
        }
        this.search = search;
        this.path = path;
      }

      hash() {
        return BASE.hash(this.path, this.search);
      }
      href() {
        return BASE.href(this.path, this.search);
      }
      equals(state) {
        return state && state.hash && this.hash() == state.hash() || this.hash() == state;
      }
    }

    angular.extend(BASE, {
      State,
      parseHash,
    });
  }]);


  /** 工厂用 基类 */
  routerModule.run(["$q", function ($q) {

    var LAST_HASH = "";

    function go(path, search) {
      if (path instanceof (BASE.State)) return go(path.path, path.search);
      var hash = "#/" + BASE.hash(path, search);
      var hash = BASE.hash(path, search) || ""; if (hash) hash = "#/" + hash;
      // console.log("[路由] go  ", { path, search }, { LAST_HASH, hash });
      //if (LAST_HASH != hash) {
        LAST_HASH = hash;
        location.hash = hash;
        // console.log("准备显示", hash);
      //}
    }

    function replace(path, search) {
      var hash = "#/" + BASE.hash(path, search);
      var history_state = history.state;
      // console.log("[路由] replace  ", path, search, history_state);
      BASE.replace_state(hash, history_state);
    }

    function when(state) {
      return BASE.DjState;
    }

    function otherwise(state) {
      BASE.Router_otherwise = state;
      return BASE.DjState;
    }

    BASE.on_otherwise = function (state) {
      state = new BASE.State(state);
      var component = BASE.getComponent(state);
      if (component) return {
        component,
        state,
      };
      var otherwise = BASE.Router_otherwise;
      if (angular.isFunction(otherwise)) otherwise = otherwise(base_state);
      if (!otherwise) return {
        component: component || {},
        state,
      };
      console.log("otherwise", "#/" + BASE.hash(otherwise), location.hash);
      if (!otherwise.then) return BASE.on_otherwise(otherwise);
      return $q.when(otherwise).then(state => {
        // LAST_HASH = location.hash = "#/" + BASE.hash(state);
        //go(state);
        return BASE.on_otherwise(state);
      }).catch(e => console.error(e))
    }

    angular.extend(BASE.DjState, {
      go,
      replace,
      when,
      otherwise,
      $search: {}
    });

  }]);

  routerModule.factory("DjState", [function () { return BASE.DjState; }]);



  routerModule.run(["$rootScope", function ($rootScope) {

    var _FIRST_RUN = 1;
    var LAST_STATE = {};

    $rootScope.$on("$locationChangeStart", (event, newUrl, oldUrl, c, d) => {
      var newHash = BASE.hash_of_url(newUrl);
      var oldHash = BASE.hash_of_url(oldUrl);
      if (newUrl == oldUrl && !_FIRST_RUN) {
        var history_state = BASE.to_good_state(history.state);
        // console.log("[路由] Start 同一地址 ", newUrl.split("#/")[1], oldUrl.split("#/")[1], c, d, _FIRST_RUN && "程序开始" || "", history_state);
        // event.preventDefault();
        // 如果 preventDefault, 那么，history 将被改变，导致 replace 错乱
        return;
      }
      var newState = BASE.parseHash(newHash);
      var oldState = BASE.parseHash(oldHash);
      if (location.hash != newHash && location.hash == oldHash) {
        console.warn("[路由] Start 非常规路由, 可能是otherwise导致。若不是，请注意。", { newState, oldState });
        // newState = oldState;
        // console.log("[路由] Start 非常规状态   ", location.hash, { oldHash, newHash }, { c, d }, _FIRST_RUN && "程序开始" || "", location.hash);
      }

      if ($rootScope.$broadcast("$DjRouteChangeStart", newState, oldState).defaultPrevented) {
        // console.log("DjState.go 被阻止", newState);
        event.preventDefault();
        // console.log("[路由] Start 被阻止   ", newUrl.split("#/")[1], oldUrl.split("#/")[1], c, d, _FIRST_RUN && "程序开始" || "");
        return;
      }

      // console.log("[路由] Start 成功   ", { oldHash, newHash }, c, d, _FIRST_RUN && "程序开始" || "");
    });

    $rootScope.$on("$locationChangeSuccess", (event, newUrl, oldUrl, c, d) => {
      var newHash = BASE.hash_of_url(newUrl);
      var oldHash = BASE.hash_of_url(oldUrl);

      if (_FIRST_RUN) setTimeout(() => _FIRST_RUN = 0);
      if (newUrl == oldUrl && !_FIRST_RUN) {
        // console.log("[路由] Success 同一地址", { oldHash, newHash }, { c, d }, _FIRST_RUN && "程序开始" || "");
        return;
      }

      var newState = BASE.parseHash(newHash);
      var oldState = BASE.parseHash(oldHash);
      var history_state = BASE.to_good_state(history.state);

      /** 是替换页面？ */
      if (history_state.t && angular.equals(LAST_STATE, history_state)) {
        // console.log("[路由] Success 替换state", { oldHash, newHash }, { c, d }, _FIRST_RUN && "程序开始" || "");
        return;
      }

      if (location.hash != newHash) {
        console.warn("[路由] Success 非常规路由, 可能是otherwise导致。若不是，请注意。", location.hash, { oldHash, newHash });
        // newState = oldState;
      }

      // BASE.DjState.go(newState);
      !(function () {
        if (!BASE.is_good_state(history_state)) {
          var new_history_state = BASE.get_good_state();
          var hash = newState.hash() || ""; if (hash) hash = "#/" + hash;
          // console.log("[路由] Success replace_state  ", { history_state, newState, new_history_state }, { hash });
          BASE.replace_state(hash, history_state = new_history_state);
        }
        newState.id = history_state.id;
      })();

      // console.log("发布 DjRouteChangeSuccess", newState);
      broadcast_DjRouteChangeSuccess(newState);
      // console.log("[路由] ●●●●　显示  ", { LAST_STATE, history_state }, { newState, oldState }, { oldHash, newHash }, { c, d }, _FIRST_RUN && "程序开始" || "");
      LAST_STATE = BASE.to_good_state(history_state);

      var newPage = BASE.on_otherwise(newState);
      if (newPage.then) {
        newPage.then(newPage => {
          BASE.setPage(newPage);
          $rootScope.$broadcast("$DjPageNavgateStart", newPage);
        });
      } else {
        BASE.setPage(newPage);
        $rootScope.$broadcast("$DjPageNavgateStart", newPage);
      }
    });

    function broadcast_DjRouteChangeSuccess(newState) {
      var oldState = broadcast_DjRouteChangeSuccess.oldState;
      broadcast_DjRouteChangeSuccess.oldState = newState;
      return $rootScope.$broadcast("$DjRouteChangeSuccess", newState, oldState);
    }

  }]);


  /** 页面插座 */
  routerModule.directive("djFrameHost", ["$parse", "$compile", function ($parse, $compile) {
    return {
      restrict: "AE",
      scope: {
        p: "=",
      },
      //template: "<div></div>",
      link: function (scope, element, attr) {
        var componentName = {};
        var oldComponentName = {};
        scope.$watch("p", function (pageData) {
          // console.log("页面插座", pageData);
          if (!pageData
            || !pageData.state
            || !pageData.component
            || !pageData.component.name
          ) {
            scope.state = "";
            componentName = oldComponentName;
            // element.html("");
            // return;
          } else {
            pageData.$scope = scope;
            scope.state = pageData.state;
            pageData.component.param = pageData.component.param || {};
            componentName = BASE.untransformStr(pageData.component.name);
          }
          if (oldComponentName == componentName) return;
          oldComponentName = componentName;
          /** 新建一个组件DOM */
          var template = (`<${componentName} serach="state.search" ng-if="state"></${componentName}>`);
          element.html(template);
          $compile(element.contents())(scope);
          // var ele = $compile(template)(scope);
          // element.append(ele);
        });
      }
    };
  }]);

  routerModule.component("djFrame", {
    template: `
      <dj-frame-host class="{{$ctrl.hostCss||''}} {{page.component.param.pageCss}}"
        ng-show="page.visible"
        p="page.visible&&page"
        ng-repeat="page in PAGES track by $index"
      ></dj-frame-host>`,
    bindings: {
      hostCss: "@"
    },
    controller: ["$scope", function ctrl($scope) {
      $scope.BASE = BASE;

      $scope.$watch("BASE.page", (vNew, vOld) => {
        // console.log("页面改变", vNew, vOld);
        vNew && vNew.component && reshow(vNew, vOld);
      });

      var oldPage = {};
      var PAGES = $scope.PAGES = [oldPage, {}];
      function reshow() {
        oldPage.visible = false;
        BASE.page.visible = true;
        var newIndex = PAGES[0] == oldPage ? 1 : 0;
        PAGES[newIndex] = oldPage = BASE.page;
      }
    }]
  });
})(angular, window);