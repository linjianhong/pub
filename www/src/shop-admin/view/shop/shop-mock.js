/* 查询结果列表 */
!(function (angular, window, undefined) {

  var theModule = angular.module("dj-app");

  theModule.run(["sign", "$http", function (sign, $http) {
    /**  */
    sign.registerHttpHook({
      match: /^商城配置$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax = $http.post("shop_admin/get_config");
        return mockResponse(ajax);
      }
    });

    /**  */
    sign.registerHttpHook({
      match: /^(下拉列表-)?商城商品$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax = $http.post("shop_admin/li").then(json => {
          var list = json.datas.list.map(item => {
            item.attr = item.attr || { value: {} };
            item.attr.value = item.attr.value || {};
            return {
              value: item.id,
              title: item.id + ": " + item.attr.value["名称"],
            };
          });
          return { list }
        });

        return mockResponse(ajax);
      }
    });

    /**  */
    sign.registerHttpHook({
      match: /^(下拉列表-)?商品分类$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax = $http.post("shop_admin/li").then(json => {
          var list = json.datas.groups.map(item => {
            item.attr = item.attr || { value: {} };
            item.attr.value = item.attr.value || {};
            return item;
          }).filter(item => !item.attr.value["v1"]).map(item => {
            return {
              value: item.id,
              title: item.attr.value["name"],
            };
          });
          return { list }
        });

        return mockResponse(ajax);
      }
    });

    /**  */
    sign.registerHttpHook({
      match: /^(下拉列表-)?商品分类2$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax = $http.post("shop_admin/li").then(json => {
          var list = json.datas.groups.map(item => {
            item.attr = item.attr || { value: {} };
            item.attr.value = item.attr.value || {};
            return item;
          }).filter(item => item.attr.value["v1"]).map(item => {
            return {
              value: item.id,
              title: item.attr.value["name"],
            };
          });
          return { list }
        });

        return mockResponse(ajax);
      }
    });

  }]);

  theModule.run(["sign", "$http", "$q", "$rootScope", "DjState", function (sign, $http, $q, $rootScope, DjState) {
    var CALCU = angular.Express.calcu;
    /**  */
    sign.registerHttpHook({
      match: /^btn-action-compiled$/,
      hookRequest: function (config, mockResponse, match) {
        var args = config.data || {};
        var btn = args.btn;
        var params = btn.params;
        var exec = execBtnCommand(btn, params);

        return mockResponse(exec);
      }
    });

    function execBtnCommand(btn, params) {
      if (!btn.mode) return btn;
      if (btn.show && !btn.show.can_ac) return $q.reject("不可操作");
      /** 已编译的，不再有 $var 参数 */
      // if (btn.$var && angular.isObject(btn.$var)) {
      //   var params_var = angular.Express.calcu_var(btn.$var);
      //   params = [params_var, params];
      // }
      var next = btn.next;
      return $q.when(CALCU(btn.mode, params)).then(mode => {
        if (AC[mode]) return AC[mode](btn, mode, params).then(res => {
          if (next) return execBtnCommand(next, params);
          return res;
        });
        return $q.reject("未知操作");
      });
    }

    var AC = {
      confirm: (btn, mode, params) => {
        return $q.when(CALCU(btn.data, params)).then(data => {
          var title = data.title;
          var body = data.body;
          return $http.post(`显示对话框/${mode}`, { title, body });
        });
      },

      warning: (btn, mode, params) => {
        return AC.confirm(btn, "warning", params)
      },

      setFormValue: (btn, mode, params) => {
        return $q.when(CALCU(btn.data, params)).then(data => {
          console.log("设置表单值", data);
          var initValue = {};
          data.map(item => {
            var saveTo = initValue;
            if (!angular.isArray(item[0]) || item[0].length < 1) {
              console.error("setFormValue 配置错误", btn.data); // 防止覆盖整个 initValue
              return;
            }
            var last_k = item[0].pop();
            item[0].map(k => {
              if (!angular.isObject(saveTo[k])) saveTo[k] = angular.isNumber(k) ? [] : {};
              saveTo = saveTo[k];
            });
            saveTo[last_k] = item[1];
          });
          params.$form.initValue2 = initValue;
          params.$form.dirty = 1;
          return initValue2;
        });
      },

      ajax: (btn, mode, params) => {
        return $q.when(CALCU(btn.data, params)).then(data => {
          return $http.post(data.api, data.search);
        });
      },

      "ajax-json": (btn, mode, params) => {
        return $q.when(CALCU(btn.data, params)).then(data => {
          return $http.post(data.api, { data: JSON.stringify(data.search) });
        });
      },

      state: (btn, mode, params) => {
        return $q.when(CALCU(btn.data, params)).then(data => {
          DjState.go(data.state, data.search);
        });
      },

      href: (btn, mode, params) => {
        return $q.when(CALCU(btn.data, params)).then(data => {
          if (!data.href) return;
          if (data.target) window.open(data.href, data.target);
          else window.location.href = data.href;
        });
      },

      "ng-emit": (btn, mode, params) => {
        console.log("按钮 ng-emit", btn, params)
        return $q.when(CALCU(btn.data, params)).then(data => {
          var scope = data.$scope
          if (!scope || !scope.$emit) {
            scope = CALCU("=$scope", params);
          }
          if (!scope || !scope.$emit) return $q.reject("缺少 $scope");;
          return scope.$emit(data.title, data.data);
        });
      },

      "$run": (btn, mode, params) => {
        console.log("按钮 $run", btn, params)
        return $q.when(CALCU(btn.data, params));
      },

      scan: (btn, mode, params) => {
        return $q.reject("要扫描，未处理");
      },
    };


  }]);


})(angular, window);
