
angular.module("dj.router.frame").component("dropdownCp", {
  template: `
    <div class="info flex-1">
      <input class="flex-1" ng-model="filterText" ng-change="filterChange()" ng-blur="blur($event)" ng-show="listShowing">
      <div class="text flex-1 flex-v-center {{textOfValue&&'text-0'||'text-c'}}"  ng-click="clickText(1)">{{textOfValue||'未选择'}}</div>
    </div>
    <div class="caret flex-cc"  ng-click="clickCaret()"><i class="fa fa-caret-down"></i></div>
    <div class="list" ng-if="listShowing">
      <div class="{{item.value==value&&'active'}}" ng-click="selectItem(item)" ng-repeat="item in list|filter:{json:filterText} track by $index">{{item.title}}</div>
      <div ng-click="selectItem({})"></div>
    </div>
    <div class="back" ng-click="clickBack()" ng-if="listShowing"></div>`,
  bindings: {
    serach: "<"
  },
  controller: ["$scope", "$http", "$q", "$element", "$timeout", function ctrl($scope, $http, $q, $element, $timeout) {
    $element.addClass("flex flex-stretch flex-v-center");
    // var inputBox = $element.children().eq(0);
    // var listBox = $element.children().eq(3);

    var ajaxList = $http.post(`下拉列表-产品字典`).then(json => {
      $scope.list = angular.merge([], json.datas.list);
      $scope.list.map(item => {
        item.json = JSON.stringify(item);
      });
      return $scope.list;
    });


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
      showList(true);
      setTimeout(() => { $element.children().eq(0).children().eq(0)[0].focus(); });
    }
    $scope.filterChange = function () {
      showList(true)
    }

    /** 值处理 */
    $scope.value = "";
    $scope.$on("input.component.initValue", (event, data) => {
      $scope.value = data.value;
    });
    $scope.selectItem = function (item) {
      $scope.value = item.value || "";
      showList(false);
      $scope.$emit("input.component.valueChange", { value: $scope.value });
    }
    $scope.$watch("value", (vNew, vOld) => {
      ajaxList.then(list => {
        var item = (list || []).find(item => item.value == vNew);
        $scope.textOfValue = (item || {}).title || "";
      })
    });
  }]
});