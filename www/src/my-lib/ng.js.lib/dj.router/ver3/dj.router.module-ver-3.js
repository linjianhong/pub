/**
 * @license 路由 v3
 * (c) 2020-08-08 LJH
 */

!(function (angular, window, undefined) {

  /** log 开关 */
  var console = window.console;
  !(function () {
    var SHOW_LOG = false;
    if (!SHOW_LOG) {
      var non = () => 0;
      console = { log: non, info: non, error: non, warn: non, }
    }
  })();

  var defaultRootModuleName = "dj-app";
  var routerModule = angular.module("dj.router-ver3", ["ngAnimate", "dj.core-sign"]);

  var BASE = (function () {
    var STATE_ID = 0;
    var STATE_t = +new Date();

    function is_good_state(state) {
      return state && state.t == STATE_t && state.id > 0;
    }

    function make_state(id) {
      return { t: STATE_t, id };
    }

    function get_good_state() {
      return { t: STATE_t, id: ++STATE_ID };
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
      if (path[0] == "/") path = path.substr(1, 999);
      search = search || {};
      var queryString = Object.keys(search).map(k => `${k}=${encodeURIComponent(search[k])}`).join("&");
      return path + (queryString && ("?" + queryString) || "");
    }
    function href(path, search) {
      return location.origin + location.pathname + "#/" + hash(path, search);
    }

    return {
      is_good_state,
      make_state,
      get_good_state,

      getComponent,

      Component,
      hash_of_url,
      transformStr,
      untransformStr,
      parseSearch,
      hash,
      href,

      page: {},

      DjState: { $search: {} },
    }
  })();

  /** State 类及相关 */
  routerModule.run(["$rootScope", "$q", "$timeout", "$location", function ($rootScope, $q, $timeout, $location) {

    function parseHash(url) {
      if (!angular.isString(url)) return new State("", {});
      var match = url.match(/#(!)?\/([^\?]+)(\?(.*))?$/);
      if (!match) {
        if (/^http(s)?/.test(url)) match = [];
        else match = url.match(/(\/)?([^\?]+)(\?(.*))?$/) || []
      }
      var pathName = match[2] || "";
      var queryString = match[4];
      var search = BASE.parseSearch(queryString) || {};
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
        this.search = search || {};
        this.path = path;
      }

      hash() {
        return BASE.hash(this.path, this.search);
      }

      href() {
        return BASE.href(this.path, this.search);
      }

      clean_hash() {
        var hash = this.hash() || ""; if (hash) hash = "#/" + hash;
        return hash;
      }

      equals(state) {
        return state && state.hash && this.hash() == state.hash() || this.hash() == state;
      }

      setGoodState(state) {
        BASE.is_good_state(state) && (this.id = state.id);
        if (this.id <= 0) this.id = BASE.get_good_state().id;
        return BASE.make_state(this.id);
      }

      pushState() {
        setTimeout(() => {
          var history_state = this.setGoodState();
          var hash = this.clean_hash();
          history.pushState(history_state, null, location.pathname + hash);
          BASE.pushedState = new State(this);
        });
      }

      replaceState() {
        setTimeout(() => {
          //var lastState=history.state;
          //if(is_good_state(lastState))
          var history_state = this.setGoodState(history.state);
          var hash = this.clean_hash();
          history.replaceState(history_state, null, location.pathname + hash);
          BASE.pushedState = new State(this);
        });
      }
    }

    class Page {
      constructor(state, component) {
        this.state = state || {};
        this.component = component || {};
      }

      ready(nth) {
        nth = nth || 0;
        var list = BASE.DjState_register_list["can_load_page"];
        if (list.length <= nth) return $q.when(this);
        var res = list[nth];
        while (angular.isFunction(res)) res = res(this);
        return $q.when(res).then(() => this.ready(nth + 1));
      }

      on_page_load(nth) {
        nth = nth || 0;
        var list = BASE.DjState_register_list["on_page_load"];
        if (list.length <= nth) return $q.when(this);
        var res = list[nth];
        while (angular.isFunction(res)) res = res(this);
        return $q.when(res).then(() => this.on_page_load(nth + 1));
      }
    }

    function setPage(newPage) {
      $timeout.cancel(setPage.timerID);
      setPage.timerID = $timeout(() => {
        BASE.page = newPage;
        BASE.DjState.$search = newPage.state.search || {};
        $rootScope.$broadcast("$DjPageNavgateSuccess", newPage);
        console.log("显示页面   ", newPage);
      }, 16)
    }

    function showPage$broadcast(newPage) {
      var data = { newPage, promise: false };
      $rootScope.$broadcast("$DjPageNavgateStart", data);
      if (data.promise) {
        return data.promise.then(() => newPage);
      }
      return $q.when(newPage);
    }

    function broadcast_and_showPage(newPage) {
      return showPage$broadcast(newPage).then(newPage => {
        BASE.setPage(newPage);
        return newPage;
      });
    }

    function get_final_page(base_state) {
      _get_final_page.history = [];
      return $q.when(_get_final_page(base_state));
    }

    function _get_final_page(base_state) {
      if (!base_state) return new Page();
      var state = new BASE.State(base_state);
      var component = BASE.getComponent(state);
      if (component) return new Page(state, component);
      var Router_otherwise = BASE.Router_otherwise;
      while (angular.isFunction(Router_otherwise)) Router_otherwise = Router_otherwise(base_state);
      if (!Router_otherwise.then) {
        // console.log("Router otherwise = ", Router_otherwise, "#/", BASE.hash(Router_otherwise), location.hash);
        return _get_final_page(Router_otherwise);
      }
      return $q.when(Router_otherwise).then(state => {
        // console.log("Router otherwise Promise = ", state, ", 查找历史=", _get_final_page.history, ", location.hash=", location.hash);
        if (_get_final_page.history.indexOf(state) >= 0) {
          console.error("路由错误: 无法定位或重定向路由 ", state)
          return new Page();
        }
        _get_final_page.history.push(state);
        return _get_final_page(state);
      }).catch(e => console.error(e))
    }

    angular.extend(BASE, {
      State,
      Page,
      parseHash,
      setPage,
      get_final_page,
      broadcast_and_showPage,
    });
  }]);


  /** 工厂用 基类 */
  routerModule.run(["$q", "$rootScope", function ($q, $rootScope) {

    function goto$404() {
      var state_404 = { path: "404" };
      var component = BASE.getComponent(state_404);
      if (!component) return $q.reject("404页面未定义");
      var newPage = new BASE.Page(state_404, component);
      BASE.page = newPage;
    }

    function go(path, search) {
      if (path === -1) {
        console.log("DjState 后退", BASE.lastPage);
        if (BASE.lastPage) {
          return go(BASE.lastPage.state)
        }
        return goto$404();
      }
      if (!(path instanceof (BASE.State))) return go(new BASE.State(path, search));
      var newState = path;
      if (newState.equals(BASE.pushedState)) return;

      return BASE.get_final_page(newState).then(newPage => newPage.ready()).then(newPage => {
        newPage.state.setGoodState();
        console.log("DjState.go  ", { newPage, newState });
        BASE.broadcast_and_showPage(newPage).then(newPage => {
          console.log("DjState.go 成功  ", newPage);
          newPage.state.pushState();
        });
      }).catch(e => {
        console.error("[路由] 失败", e);
        return $q.reject(e);
      });
    }

    function replace(path, search, reshow) {
      if (!(path instanceof (BASE.State))) return replace(new BASE.State(path, search), "", reshow);
      var newState = path;
      if (reshow) {
        return BASE.get_final_page(newState).then(newPage => newPage.ready()).then(newPage => {
          newPage.state.setGoodState();
          console.log("DjState.replace  ", { newPage, newState });
          BASE.broadcast_and_showPage(newPage).then(newPage => {
            console.log("DjState.replace 成功  ", newPage);
            newPage.state.replaceState();
          });
        }).catch(e => {
          console.error("[路由] 失败", e);
          return $q.reject(e);
        });
      } else {
        newState.replaceState();
      }
    }

    function when(state) {
      return BASE.DjState;
    }

    function otherwise(state) {
      BASE.Router_otherwise = state;
      return BASE.DjState;
    }

    var DjState_register_list = {
      "can_load_page": [],
      "on_page_load": [],
      "when": [],
    }
    function register(name, arg) {
      if (!DjState_register_list[name] || !arg) return BASE.DjState;
      DjState_register_list[name].push(arg);
      return BASE.DjState;
    }

    angular.extend(BASE, {
      DjState_register_list,
      DjState: {
        register,
        go,
        replace,
        when,
        otherwise,
        $search: {}
      }
    });

  }]);

  routerModule.factory("DjState", [function () { return BASE.DjState; }]);

  routerModule.run(["$rootScope", "$q", "$location", function ($rootScope, $q, $location) {

    var _FIRST_RUN = 1;
    var LAST_STATE = {};

    $rootScope.$on("$locationChangeStart", (event, newUrl, oldUrl, c, d) => {
      // var newHash = BASE.hash_of_url(newUrl);
      // if (newHash == location.hash && !_FIRST_RUN) {
      //   console.log("Start 同一地址", { oldUrl, newHash, hash: location.hash }, _FIRST_RUN && "程序开始" || "");
      //   event.preventDefault();
      // }
    });

    $rootScope.$on("$locationChangeSuccess", (event, newUrl, oldUrl, c, d) => {
      var newHash = BASE.hash_of_url(newUrl);
      var oldHash = BASE.hash_of_url(oldUrl);
      var newState = BASE.parseHash(newHash);
      var oldState = BASE.parseHash(oldHash);

      if (_FIRST_RUN) setTimeout(() => _FIRST_RUN = 0);
      if (newUrl == oldUrl && !_FIRST_RUN) {
        console.log("Success 同一地址", { oldHash, newHash }, { c, d }, _FIRST_RUN && "程序开始" || "");
        return;
      }

      /** 是替换页面？ */
      if (BASE.is_good_state(history.state) && angular.equals(LAST_STATE, history.state)) {
        console.log("Success 替换state", { LAST_STATE, oldHash, newHash }, { c, d }, _FIRST_RUN && "程序开始" || "");
        return;
      } else {
        console.log("不是替换页面", history.state, { LAST_STATE, c, d });
      }

      if (location.hash != newHash) {
        console.warn("[路由] Success 非常规路由, 可能是otherwise导致。若不是，请注意。", location.hash, { oldHash, newHash });
      }

      console.warn("[路由] Success 核对最后一个页面", { newState: newState.path, BASE: (BASE.page.state || {}).path }, { oldHash, newHash }, { c, d });
      return BASE.get_final_page(newState).then(newPage => {
        if (newPage.state.equals(BASE.page.state)) {
          LAST_STATE = history.state;
          console.log("同一页面", { newPage, BASE: BASE.page }, { oldHash, newHash }, { c, d }, _FIRST_RUN && "程序开始" || "");
          return;
        }

        newPage.ready().then(newPage => {
          var goodState = newPage.state.setGoodState(history.state);
          console.log("Success 准备显示  ", { goodState, newState, pushedState: BASE.pushedState }, { oldHash, newHash }, { c, d });
          LAST_STATE = goodState;

          BASE.broadcast_and_showPage(newPage).then(newPage => {
            console.log("●●●●　显示成功  ", newPage);
            newPage.state.replaceState();
            newPage.on_page_load();
          });
        });
      });
    });

  }]);


  /** 页面插座 */
  routerModule.directive("djFrameHost", ["$parse", "$compile", function ($parse, $compile) {
    return {
      restrict: "AE",
      scope: {
        p: "=",
      },
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
        });
      }
    };
  }]);

  routerModule.component("djFrame", {
    template: `
      <dj-frame-host class="{{$ctrl.hostCss||''}} {{page.component.param.pageCss}}"
        ng-if="page.visible"
        p="page.visible&&page"
        ng-repeat="page in PAGES track by $index"
      ></dj-frame-host>`,
    bindings: {
      hostCss: "@"
    },
    controller: ["$scope", function ctrl($scope) {
      $scope.BASE = BASE;

      $scope.$watch("BASE.page", (vNew, vOld) => {
        vNew && vNew.component && reshow(vNew, vOld);
      });

      var oldPage = {};
      var PAGES = $scope.PAGES = [oldPage];
      function reshow() {
        oldPage.visible = false;
        BASE.page.visible = true;
        var newIndex = PAGES[0] == oldPage ? 1 : 0;
        PAGES[newIndex] = oldPage = BASE.page;
      }
    }]
  });
})(angular, window);