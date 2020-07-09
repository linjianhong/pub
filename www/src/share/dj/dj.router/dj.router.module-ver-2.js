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

14、
   */
  var defaultRootModuleName = "dj-app";
  var routerModuleName = "dj.router.ver2";
  var stateModuleName = "dj.router.state.ver2";
  var frameModuleName = "dj.router.frame.ver2";
  var stateModule = angular.module(stateModuleName, []);
  var frameModule = angular.module(frameModuleName, ["ngAnimate", stateModuleName]);
  var routerModule = angular.module(routerModuleName, [frameModuleName, stateModuleName]);

  var BASE = (function () {
    var STATE_ID = 0;
    var STATE_t = +new Date();

    function is_good_state(state) {
      return state && state.t == STATE_t && state.id > 0;
    }

    function get_good_state(state) {
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
      return (match || ["无"])[0];
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

      ready(callback) {
        if (this.path.then) {
          return this.path.then(path => {
            var new_state = new State(path, this.search);
            this.path = new_state.path;
            this.search = new_state.search;
            return this.ready(callback);
          })
        }
        return $q.when(this).then(callback);
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
  routerModule.run(["$rootScope", "$location", "$q", "$timeout", function ($rootScope, $location, $q, $timeout) {

    var LAST_HASH = "";

    function go(path, search) {
      //if (state != "my") return DjState.replace(state);
      var hash = "#/" + BASE.hash(path, search);
      if (LAST_HASH != hash) {
        LAST_HASH = hash;
        location.hash = hash;
        console.log("准备显示", hash);
      }
      var history_state = history.state;
      if (!BASE.is_good_state(history_state)) {
        BASE.replace_state(hash, history_state = BASE.get_good_state());
      }
      return history_state.id;
    }

    function replace(path, search) {
      console.log("替换", path, search);
      var hash = "#/" + BASE.hash(path, search);
      var history_state = history.state;
      $timeout(() => {
        BASE.replace_state(hash, history_state);
        //$location.replace();
      });
    }

    function when(state) {
      return BASE.DjState;
    }

    function otherwise(state) {
      BASE.Router_otherwise = state;
      return BASE.DjState;
    }

    BASE.on_otherwise = function (bad_state) {
      var otherwise = BASE.Router_otherwise;
      if (!otherwise) return;
      if (angular.isFunction(otherwise)) otherwise = otherwise(bad_state);
      return $q.when(otherwise).then(state => {
        go(state);
      })
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
  routerModule.factory("DjRouter", [function () { return BASE.DjState; }]);



  routerModule.run(["$rootScope", "$location", "$browser", "DjState", function ($rootScope, $location, $browser, DjState) {

    var _FIRST_RUN = 1;
    var LAST_STATE = {};

    $rootScope.$on("$locationChangeStart", (event, newUrl, oldUrl, c, d) => {
      if (_FIRST_RUN) setTimeout(() => _FIRST_RUN = 0);
      newHash = BASE.hash_of_url(newUrl);
      oldHash = BASE.hash_of_url(oldUrl);
      var newState = BASE.parseHash(newHash);
      var oldState = BASE.parseHash(oldHash);
      if (location.hash != oldHash) {
        console.log("非常规状态  ", newHash, oldHash, location.hash);
      } else {
        if ($rootScope.$broadcast("$DjRouteChangeStart", newState, oldState).defaultPrevented) {
          // console.log("DjState.go 被阻止", newState);
          event.preventDefault();
          return;
        }
      }
      var component = BASE.getComponent(newState);
      if (!component) BASE.on_otherwise(newState);
    });

    $rootScope.$on("$locationChangeSuccess", (event, newUrl, oldUrl, c, d) => {
      newHash = BASE.hash_of_url(newUrl);
      oldHash = BASE.hash_of_url(oldUrl);
      var newState = BASE.parseHash(newHash);
      var history_state = history.state;

      if (newHash == oldHash && !_FIRST_RUN) {
        console.log("禁止 1： 阻止 ", newHash, oldHash, history_state);
        event.preventDefault();
        return;
      }
      var state_id = DjState.go(newHash.substr(2));
      newState.id = state_id;
      console.log("发布 DjRouteChangeSuccess", newState);
      broadcast_DjRouteChangeSuccess(newState);

      /** 是替换页面？ */
      if (angular.equals(LAST_STATE, history_state)) {
        return;
      }
      LAST_STATE = angular.extend({}, history_state);

      console.log("显示!!!", newHash);
      var component = BASE.getComponent(newState) || {};
      var newPage = {
        state: newState,
        component,
      };
      BASE.setPage(newPage);
      $rootScope.$broadcast("$DjPageNavgateStart", newPage);
    });

    function broadcast_DjRouteChangeSuccess(newState) {
      var oldState = broadcast_DjRouteChangeSuccess.oldState;
      broadcast_DjRouteChangeSuccess.oldState = newState;
      return $rootScope.$broadcast("$DjRouteChangeSuccess", newState, oldState);
    }

  }]);


  /** 页面插座 */
  frameModule.directive("djFrameHost", ["$parse", "$compile", function ($parse, $compile) {
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
          // element.html(template);
          // $compile(element.contents())(scope);
          var ele = $compile(template)(scope);
          element.append(ele);
        });
      }
    };
  }]);

  frameModule.component("djFrame", {
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
        console.log("页面改变", vNew, vOld);
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
    }
    ]
  });
})(angular, window);