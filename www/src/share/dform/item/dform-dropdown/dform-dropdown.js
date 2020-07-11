
!(function (window, angular, undefined) {
  var theModule = angular.module("dj.router");
  theModule.component("dformDropdown", {
    template: `
    <div class="info flex-1">
      <input class="flex-1" ng-model="filterText" ng-change="filterChange()" ng-blur="blur($event)" ng-show="listShowing">
      <div class="text flex-1 flex-v-center {{textOfValue&&'text-0'||'text-c'}}"  ng-click="clickText(1)">{{textOfValue||'未选择'}}</div>
    </div>
    <div class="caret flex-cc"  ng-click="clickCaret()" ng-if="config.mode!='show'"><i class="fa fa-caret-down"></i></div>
    <div class="list" ng-if="listShowing">
      <div class="bb-eee {{item.value==value&&'active'||''}}" ng-click="selectItem(item)" ng-repeat="item in list|filter:{json:filterText} track by $index">{{item.title||item.value}}</div>
      <div class="{{!value&&'active'||''}}" ng-click="selectItem({})"></div>
    </div>
    <div class="back" ng-click="clickBack()" ng-if="listShowing"></div>`,
    bindings: {
      config: "<"
    },
    controller: ["$scope", "$http", "$q", "$element", "$timeout", function ctrl($scope, $http, $q, $element, $timeout) {
      $element.addClass("flex flex-stretch flex-v-center dform-combo-dropdown");
      this.$onChanges = (changes) => {
        if (changes.config) {
          var config = $scope.config = changes.config.currentValue || {};
          var list = config.list || "";
          initList(list);
        }
      }
      var ajaxList = [];
      function initList(list) {
        return ajaxList = initDropdownList(list, $scope).then(list => {
          return $scope.list = list.filter(a => a || a === 0).map(item => {
            if (!angular.isObject(item)) return { title: "" + item, value: "" + item, json: "" + item };
            item.json = JSON.stringify(item);
            return item;
          });
        });
      }


      /** 过滤器 */
      var filterText = $scope.filterText = "";
      $scope.$watch("filterText", (vNew, vOld) => {
        if (vNew == vOld) return;
        if (vNew == filterText) return;
      });


      /** 列表显示隐藏控制 */
      $scope.listShowing = false;
      var showList = $scope.showList = (bShow) => {
        $scope.listShowing = bShow;
      }
      $scope.clickBack = function () {
        $timeout(() => { showList(false); });
      }
      $scope.clickCaret = function () {
        if (showList.running) return;
        showList(!$scope.listShowing);
      }
      $scope.clickText = function () {
        if ($scope.config.mode == "show") return;
        showList(true);
        setTimeout(() => { $element.children().eq(0).children().eq(0)[0].focus(); });
      }
      $scope.filterChange = function () {
        showList(true)
      }

      /** 值处理 */
      $scope.value = "";
      $scope.$on("input.component.initValue", (event, data) => {
        // console.log("收到 插座 初始化", data)
        $scope.value = data.value;
      });
      $scope.selectItem = function (item) {
        $scope.value = item && item.value || "";
        showList(false);
        $scope.$emit("input.component.valueChange", { value: $scope.value });
      }
      $scope.$watch("value", (vNew, vOld) => {
        $q.when(ajaxList).then(list => {
          var item = (list || []).find(item => item.value == vNew) || {};
          $scope.textOfValue = item.title || item.value || "";
        })
      });
    }]
  });

  /** 组合框 */
  theModule.component("dformCombo", {
    template: `
    <div class="info flex-1">
      <input class="flex-1" ng-model="filterText" ng-change="filterChange()" ng-blur="blur($event)" ng-show="listShowing">
      <div class="text flex-1 flex-v-center {{textOfValue&&'text-0'||'text-c'}}"  ng-click="clickText(1)">{{textOfValue||'未输入'}}</div>
    </div>
    <div class="caret flex-cc"  ng-click="clickCaret()" ng-if="config.mode!='show'"><i class="fa fa-caret-down"></i></div>
    <div class="list" ng-if="listShowing">
      <div class="bb-eee {{item.value==value&&'active'||''}}" ng-click="selectItem(item)" ng-repeat="item in list|filter:(!config.hideFilter&&filterText||'') track by $index">{{item.title||item.value}}</div>
      <div class="{{!value&&'active'||''}}" ng-click="selectItem({})"></div>
    </div>
    <div class="back" ng-click="clickBack()" ng-if="listShowing"></div>`,
    bindings: {
      config: "<"
    },
    controller: ["$scope", "$http", "$q", "$element", "$timeout", function ctrl($scope, $http, $q, $element, $timeout) {
      $element.addClass("flex flex-stretch flex-v-center dform-combo-dropdown");
      this.$onChanges = (changes) => {
        if (changes.config) {
          var config = $scope.config = changes.config.currentValue || {};
          var list = config.list || "";
          initList(list);
        }
      }
      function initList(list) {
        return initDropdownList(list, $scope).then(list => {
          $scope.list = list.filter(a => a || a === 0).map(item => {
            if (!angular.isObject(item)) return { title: "" + item, value: "" + item, json: "" + item };
            item.json = JSON.stringify(item);
            return item;
          });
        });
      }


      /** 过滤器 */
      $scope.filterText = "";


      /** 列表显示隐藏控制 */
      $scope.listShowing = false;
      var showList = $scope.showList = (bShow) => {
        $scope.listShowing = bShow;
      }
      $scope.clickBack = function () {
        // console.log("clickBack");
        $timeout(() => { showList(false); });
      }
      $scope.clickCaret = function () {
        if (showList.running) return;
        showList(!$scope.listShowing);
      }
      $scope.clickText = function () {
        if ($scope.config.mode == "show") return;
        showList(true);
        setTimeout(() => { $element.children().eq(0).children().eq(0)[0].focus(); });
      }
      $scope.filterChange = function (value) {
        showList(true);
        // console.log("filterChange", $scope.filterText);
        $scope.value = $scope.filterText || "";
        $scope.$emit("input.component.valueChange", { value: $scope.value });
      }

      /** 值处理 */
      $scope.value = "";
      $scope.$on("input.component.initValue", (event, data) => {
        // console.log("收到 插座 初始化", data)
        $scope.value = data.value;
        $scope.filterText = data.value || "";
      });
      $scope.selectItem = function (item) {
        $scope.value = item && item.value || "";
        showList(false);
        $scope.$emit("input.component.valueChange", { value: $scope.value });
      }
      $scope.$watch("value", (vNew, vOld) => {
        // console.log("watch value", vNew, vOld)
        $scope.textOfValue = vNew || "";
        $scope.filterText = vNew || "";
      });
    }]
  });


  var initDropdownList = function (list, $scope) { };

  theModule.run(["sign", "$http", "$q", function (sign, $http, $q) {

    initDropdownList = function (list, $scope) {
      //console.log('获取下拉列表, param =', param);
      if (!list) return $q.when([]);
      if (angular.isFunction(list)) {
        return $q.when(list());
      }
      if (angular.isArray(list)) {
        return $q.all(list);
      }
      if (angular.isString(list)) {
        /**
         * 以消息的方式，请求一下
         * 若收到下拉列表，就使用
         * 消息方式，可以使下拉列表随当前页面状态不同而不同
         */
        var param = {}
        $scope.$emit("下拉列表-dform-dropdown", { list, param });
        if (param.list) {
          // console.log("收到：下拉列表-dform-dropdown", list, param);
          return $q.when(param.list);
        }
        /**
         * 消息的方式没收到下拉列表
         * 使用通用的请求
         * 通用请求与当前页面无关，除非在拦截中识别
         */
        return $http.post(`下拉列表-dform-dropdown-${list}`, { list }).then(json => {
          return $q.when(json.datas.list);
        }).catch(e => {
          return $q.when([]);
        });
      }
      console.error("无效列表参数", list);
      return $q.when([]);
    }

  }]);

})(window, angular);