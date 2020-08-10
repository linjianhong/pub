!(function (angular, window, undefined) {

  var theModule = angular.module("dj.hook-dlg");

  theModule.factory("HookDlg", ["$compile", "$rootScope", "$animateCss", "$q", function ($compile, $rootScope, $animateCss, $q) {
    var EMIT_CLICKBACK = "dj.hook-dlg clickBack";

    /**
     * 显示对话框
     * @param {element} options.parentElement 对话框的父级 dom｜JQLite 元素
     * @param {Scope} options.parentScope 对话框的父级上下文
     * @param {string} options.componentName 对话框的组件名
     * @param {string} options.component 对话框的组件名, componentName的替代属性
     * @param {Object} options.params 对话框的组件的 attr 参数, 这些参数自动绑定 parentScope
     * @param {array|null} options.emits 接收 scope.$emit 的消息名称列表, 接收到这些消息时，将关闭对话框，并将数据返回到承诺
     * @param {boolean} options.animationShow 显示对话框时，动画的 $animateCss 参数
     * @param {boolean} options.animationHide 关闭对话框时，动画的 $animateCss 参数
     * @param {boolean} options.backClose 点击背景空白处时，是否关闭对话框
     * 
     * @return {Promise} promise
     */
    function modal(options) {
      options = options || {};
      var componentName = (options.componentName || options.component || "").replace(/([A-Z])/g, "-$1");
      var attrs = angular.extend({ poping: 1 }, options.attrs);
      var parentElement = options.parentElement || document.body;
      var parentScope = options.parentScope || $rootScope;
      var scopeDlg = parentScope.$new();
      var attr = [];
      for (var k in attrs) {
        if (attrs.hasOwnProperty(k)) {
          if (k == "class" || k == "style") {
            attr.push(`${k}="${attrs[k]}"`);
          }
          else {
            attr.push(`${k.replace(/([A-Z])/g, "-$1").toLowerCase()}="${k}"`);
            scopeDlg[k] = attrs[k];
          }
        }
      }
      var template = `<${componentName} ${attr.join(' ')}></${componentName}>`;
      var elementDlg = angular.element(`<div class="${options.css || "djui-fixed-box"}" ng-click="clickBack($event)">${template}</div>`);
      scopeDlg.clickBack = function (event) {
        if (event.target != event.currentTarget) return;
        if (!options.backClose) return;
        event.preventDefault();
        event.stopPropagation();
        scopeDlg.$emit(EMIT_CLICKBACK, $q.reject("clickBack"));
      }
      angular.element(parentElement).append(elementDlg);
      elementDlg.scope(scopeDlg);
      $compile(elementDlg)(scopeDlg);

      /** 动画效果 */
      if (options.animationShow) {
        var animation = options.animationShow;
        if (angular.isFunction(animation)) {
          $q.when(animation({ element: elementDlg, scope: scopeDlg })).then(animation => {
            $animateCss(elementDlg, animation).start();
          })
        } else {
          $animateCss(elementDlg, animation).start();
        }
      }

      var listen = {
        element: elementDlg,
        scope: scopeDlg,
        animation: options.animationHide,
        emits: angular.extend([], options.emits).concat(EMIT_CLICKBACK),
        auto_destroy: true,
      }
      return $q.when((options.hookClose || listenCloseDlg)(listen));
    }

    /**
     * @param {element} options.element 对话框 JQLite 元素
     * @param {Scope} options.scope 对话框 上下文
     * @param {boolean} options.auto_destroy 是否自动销毁 对话框 JQLite 元素 和 上下文
     * @param {Object|function} options.animation 关闭动画的 $animateCss 参数
     * @param {array|null} options.emits 接收 scope.$emit 的消息名称列表
     */
    function listenCloseDlg(options) {
      var dlgDeferred = $q.defer();

      /** 对话框提交按钮，请求关闭 */
      function close_by_dlg_btn(event, data) {
        // console.log("关闭对话框", { event, data })
        event.preventDefault();
        event.stopPropagation();
        closeDjg(data);
      }
      (options.emits || []).map(msg_name => options.scope.$on(msg_name, close_by_dlg_btn));

      function auto_destroy() {
        if (options.auto_destroy === false) return;
        options.scope.$destroy();
        options.element && options.element.remove();
        options.element = null;
      }

      //显示时按浏览器的后退按钮：关闭对话框
      options.scope.$on("$locationChangeStart", function (event) {
        event.preventDefault();
        closeDjg("locationChange 1");
      });

      function closeDjg(data) {
        setTimeout(() => {
          /** 动画效果 */
          if (options.animation) {
            var animation = options.animation;
            if (angular.isFunction(options.animation)) animation = animation({ element: options.element, scope: options.scope });
            $animateCss(options.element, animation).start().finally(auto_destroy);
          }
          else auto_destroy();
          dlgDeferred.resolve(data);
        })
      }

      return dlgDeferred.promise;
    }


    return {
      modal,
      listenCloseDlg,
    }
  }])

})(angular, window);
