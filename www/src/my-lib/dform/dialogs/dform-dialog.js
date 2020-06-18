!(function (window, angular, undefined) {

  var theModule = angular.module('dform');

  theModule.run(["$rootScope", "$http", "$q", "sign", "$compile", "$animateCss", function ($rootScope, $http, $q, sign, $compile, $animateCss) {

    function listenCloseDlg(scopeDjPop, dlg, options, dlgDeferred) {
      scopeDjPop.$on("dform-pop-box-close", function (event, data) {
        event.preventDefault();
        event.stopPropagation();
        closeDjg(data.btnName && data || { btnName: data, param: scopeDjPop.param });
      });


      /** 最后的监听有效 */
      function waitNextThenClose(data) {
        data.push(scopeDjPop.$id);
        var defaultPrevented = $rootScope.$broadcast("pop-box-close-locationChangeStart", data);
        if (!defaultPrevented.defaultPrevented) {
          event.preventDefault();
          // console.log("最前的对话框", scopeDjPop.$id, data);
          closeDjg("locationChange 1");
        } else {
          // console.log("前面还有对话框", scopeDjPop.$id, data);
        }
      }
      scopeDjPop.$on("pop-box-close-locationChangeStart", function (event, data) {
        // console.log("新消息", scopeDjPop.$id, data);
        if (data.indexOf(scopeDjPop.$id) >= 0) {
          // console.log("自己替换", scopeDjPop.$id, data);
          return;
        }
        event.preventDefault();
        // console.log("重新替换", scopeDjPop.$id, data);
        waitNextThenClose(data);
      });



      //显示时按浏览器的后退按钮：关闭对话框
      scopeDjPop.$on("$locationChangeStart", function (event) {
        // console.log("后退按钮", scopeDjPop.$id, event.defaultPrevented);
        if (event.defaultPrevented) return;
        event.preventDefault();
        waitNextThenClose([]);
      });
      //显示时按浏览器的后退按钮：关闭对话框
      var listener3 = scopeDjPop.$on("$DjRouteChangeStart", function (event) {
        // 最后的监听有效
        if (event.defaultPrevented) return;
        event.preventDefault();
        closeDjg("locationChange");
      });
      function closeDjg(data) {
        setTimeout(() => {
          /** 动画效果 */
          if (options.animationHide) {
            var animation = options.animationHide;
            if (angular.isFunction(options.animation)) animation = animation({ element: dlg, scope: scopeDjPop });
            $animateCss(dlg, animation).start().finally(() => {
              scopeDjPop.$destroy();
              dlg && dlg.remove();
              dlg = null;
            });
          }
          else {
            scopeDjPop.$destroy();
            dlg && dlg.remove();
            dlg = null;
            //console.log('对话框关闭', data);
          }
          dlgDeferred.resolve(data);
        })
      }
    }

    /**
     * 组件对话框
     * @param {string} component
     * @param {object} options
     * @param {function|false} options.beforeClose: 将要关闭，返回 false, 或 reject, 不可关闭
     * @param {function|false} options.onClose: 关闭时回调
     */
    function dialogComponent(componentName, params, options) {
      // 默认标志弹出状态为真
      params = angular.extend({}, params);
      options = options || {};
      var dlgDeferred = $q.defer();
      var element = options.element || document.body;
      var scopeParent = options.scope || $rootScope;
      var scopeDjPop = scopeParent.$new();
      var attr = [];
      for (var k in params) {
        if (params.hasOwnProperty(k)) {
          if (k == "class" || k == "style") {
            attr.push(`${k}="${params[k]}"`);
          }
          else {
            attr.push(`${k.replace(/([A-Z])/g, "-$1").toLowerCase()}="${k}"`);
            scopeDjPop[k] = params[k];
          }
        }
      }
      var template = `<${componentName} ${attr.join(' ')}></${componentName}>`;
      var dlg = angular.element(`<div class="djui-fixed-box ${options.css || ""}" ng-click="clickBack($event)">${template}</div>`);
      scopeDjPop.clickBack = function (event) {
        if (event.target != event.currentTarget) return;
        if (!params.backClose) return;
        event.preventDefault();
        event.stopPropagation();
        scopeDjPop.$emit("dform-pop-box-close", "clickBack");
      }
      angular.element(element).append(dlg);
      dlg.scope(scopeDjPop);
      $compile(dlg)(scopeDjPop);

      /** 动画效果 */
      if (options.animationShow) {
        var animation = options.animationShow;
        if (angular.isFunction(options.animation)) {
          $q.when(animation({ element: dlg, scope: scopeDjPop })).then(animation => {
            $animateCss(dlg, animation).start();
          })
        } else {
          $animateCss(dlg, animation).start();
        }
      }

      /** 关闭对话框功能 */
      if (options.hookClose !== false) listenCloseDlg(scopeDjPop, dlg, options, dlgDeferred);

      /** 返回承诺 */
      return dlgDeferred.promise;
    }

    function dialog(componentName, params, options) {
      return dialogComponent(componentName, params, options).then(result => {
        var btnName = result && result.btnName || result;
        if (btnName != "OK") {
          return $q.reject(btnName)
        }
        return result;
      });
    }


    sign.registerHttpHook({
      match: /^dform-dialog-form$/,
      hookRequest: function (config, mockResponse, match) {
        var param = config.data;
        //var formParam = {items: param.items, initValue: param.initValue };
        //var params = angular.extent({ param: formParam }, param.params);
        var dlg = dialog("dlg-dform-form", param.params, param.options).then(data => data.value);
        return mockResponse.resolve(dlg);
      }
    });

    sign.registerHttpHook({
      match: /^dform-dialog-component$/,
      hookRequest: function (config, mockResponse, match) {
        var param = config.data;
        var dlg = dialogComponent(param.component, param.params, param.options).then(data => data.value);
        return mockResponse.resolve(dlg);
      }
    });

  }]);


  /* 表单对话框 对话框 */
  theModule.component("dlgDformForm", {
    bindings: {
      param: "<",
    },
    template: `
      <div class="pop-title flex-cc  em-12" ng-if="$ctrl.param.title">{{$ctrl.param.title}}</div>
      <div class="padding-3 bk-f flex-1 v-scroll" dform-form2="form" ></div>
      <div class="pop-footer flex padding-h-3 bt-ccc em-12 padding-v-1">
        <div class="flex-1 text-danger">{{R.prompt}}</div>
        <fa-button class="default" d="R.cancel.d" ng-click="R.cancel.click()" ng-if="R.cancel"></fa-button>
        <fa-button class="warning" d="R.OK.d" disabled="R.OK.disabled()" ng-click="R.OK.click()" ng-if="R.OK"></fa-button>
      </div>`,
    controller: ["$scope", "$q", "$timeout", function ctrl($scope, $q, $timeout) {
      var code, status, ac, data_row, acConfig;

      this.$onChanges = (changes) => {
        if (changes.param) {
          initForm(changes.param.currentValue || {});
          //console.log("表单对话框", changes.param.currentValue)
        }
      }

      function initForm(param) {
        if (param.form) {
          $scope.form = param.form;
        }
        else {
          $scope.form = {
            items: (param.items || []).map(item => angular.merge({ theme: 'ttb', }, item)),
            /** 数据初始化 */
            initValue: angular.merge({}, param.initValue),
          };
        }

        /** 表单按钮 */
        R.cancel = param.cancel || param.cancel !== false && {
          d: { fa: 'sign-out', title: '取消' },
          click: R.oncancel,
        }
        R.OK = param.OK || param.OK !== false && {
          d: { fa: 'send', title: '确定' },
          disabled: () => R.save.submiting || !$scope.form.valid || !$scope.form.dirty,
          click: R.save,
        }
      }

      var R = $scope.R = {

        onItemValueChange: () => {
          R.prompt = "";
        },


        /** 仅支持一次性提交，防止重复提交 */
        save: () => {
          if (!$scope.form.valid) return R.prompt = "数据输入不完整";
          if (R.save.submiting) return;
          R.save.submiting = true;

          var param = { value: $scope.form.value };
          if (data_row) param.data_id = data_row.id;
          $q.when(1).then(() => {
            return $q.when($scope.form.onSubmit && $scope.form.onSubmit({ value: $scope.form.value })).then(json => {
              $scope.$emit("dform-pop-box-close", { btnName: "OK", value: $scope.form.value });
            });
          }).catch(e => {
            $timeout(() => {
              R.save.submiting = false;
              console.log("提交错误", e);
            });
          });
        },

        oncancel: () => {
          $scope.$emit("dform-pop-box-close", { btnName: "cancel" });
        }
      }
    }]
  });

})(window, angular);