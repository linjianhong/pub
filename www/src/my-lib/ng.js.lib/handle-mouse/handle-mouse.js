!(function (angular, window, undefined) {

  var theModule = angular.module("dj-ui");

  var HandleMouseBase = (function () {

    var HANDLE_ID = 0;
    var defaultOptions = {
      names: [],
      preventDefault: true,
      stopPropagation: true,
      callback: false,
      rootElement: false,
      OnMouse: false,
    };

    class HandleMouseBase {
      constructor(options) {
        this.options = angular.extend({}, defaultOptions, options);
        this.id = ++HANDLE_ID;
        this.listening = false;
        var self = this;
        this._OnMouse = function (event) {
          if (self.options.OnMouse) return self.options.OnMouse(event, self);
          self.OnMouse(event);
        };
      }

      isChild(ele) {
        for (; ele;) {
          if (ele == this.options.rootElement) return true;
          ele = ele.parentElement;
        }
        return false;
      }
      OnMouse(event) {
        if (this.options.rootElement && this.isChild(event.target)) return;
        this.FinishListen();
        this.options.callback && this.options.callback(event, this);
        this.options.stopPropagation && event.stopPropagation();
        this.options.preventDefault && event.preventDefault();
        this.options.OnMouseEnd && this.options.OnMouseEnd(event, this);
      }
      Listen() {
        if (this.listening) return;
        this.listening = true;
        // console.log("开始监听", this.id, this.options.name, this.options);
        (this.options.names || []).map(name => {
          document.addEventListener(name, this._OnMouse, { passive: false });
        });
      }

      FinishListen() {
        if (!this.listening) return;
        this.listening = false;
        // console.log("结束监听", this.id, this.options.name, this.options);
        (this.options.names || []).map(name => {
          document.removeEventListener(name, this._OnMouse, { passive: false });
        });
      }
    }

    return HandleMouseBase

  })();

  var HandleDown = function (rootElement, callback, HandleNow = true) {
    function OnMouseEnd() {
      HandleUp();
    }
    var handle = new HandleMouseBase({
      name: "鼠标按下",
      names: ["mousedown", "touchstart"],
      OnMouseEnd,
      rootElement,
      callback
    });
    HandleNow && handle.Listen();
    return handle;
  };

  var HandleUp = function (callback, HandleNow = true) {
    var handle = new HandleMouseBase({ name: "鼠标放开", names: ["mouseup", "touchend"], callback });
    HandleNow && handle.Listen();
    return handle;
  };


  /** 鼠标监控 */
  theModule.factory('HandleMouse', ["$http", "$q", function ($http, $q) {

    return {
      HandleMouseBase,
      HandleDown,
      HandleUp,
    }

  }]);

  theModule.directive('outClickWatch', ["HandleMouse", function (HandleMouse) {
    return function (scope, element, attrs) {
      var watching = false;
      var watcher;
      scope.$watch(function () {
        var vNew = !!scope.$eval(attrs.outClickWatch);
        if (vNew == watching) return;
        watching = vNew;
        if (vNew) {
          // console.log("多级选择, 捕捉, watcher=", watcher);
          if (watcher) watcher.Listen();
          else watcher = HandleMouse.HandleDown(element[0], event => {
            watcher.FinishListen();
            // console.log("多级选择, 响应", event, "watcher=", watcher);
            var handle = scope.$eval(attrs.onOutClick);
            // console.log("handle=", handle);
            //R.click_close();
            scope.$apply();
          });
        } else {
          // console.log("多级选择, 释放, watcher=", watcher);
          watcher && watcher.FinishListen();
        }
      });

    };
  }]);

})(angular, window);