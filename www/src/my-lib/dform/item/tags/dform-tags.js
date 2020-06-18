(function () {

  angular.module('dform')
    .component('dformTags', {
      template: `
        <div class="box flex flex-left flex-wrap">
          <div class="flex dform-tags-item {{item.selected&&'selected'||''}}" ng-click="clickItem(item)" ng-repeat="item in list track by $index">
            <i class="fa fa-{{item.selected&&'check-square-o'||'square-o'}}"></i>
            <div class="text">{{item.text}}</div>
          </div>
        </div>`,
      bindings: {
        tags: "<",
        config: "<",
        mode: '@'
      },
      controller: ["$scope", "$http", "$q", function ctrl($scope, $http, $q) {

        var value = [];
        $scope.list = []

        this.$onChanges = (changes) => {
          if (changes.config) {
            var list = (changes.config.currentValue || {}).list || "";
            initList(list);
          }
          if (changes.tags) {
            value = angular.merge([], changes.tags.currentValue);
            setSelected();
          }
          if (changes.mode) {
            $scope.mode = changes.mode.currentValue || "";
          }
        }
        function initList(list) {
          if (!list)
            return $scope.list = [];
          if (angular.isArray(list))
            return setupListForSearch(list);
          /** 以消息的方式，请求一下，若收到下拉列表，就使用 */
          var param = {}
          $scope.$emit("下拉列表-dform-dropdown", { list, param });
          if (param.list) {
            console.log("收到：下拉列表-dform-dropdown", list, param);
            return setupListForSearch(param.list);
          }
          /** 没收到下拉列表，使用通用的请求 */
          ajaxList = $http.post(`下拉列表-dform-dropdown-${list}`, { list }).then(json => {
            setupListForSearch(json.datas.list);
          }).catch(e => {
            return $scope.list = [];
          });
        }
        function setupListForSearch(listPromise) {
          $q.when(listPromise).then((json) => {
            var list = json.datas && json.datas.list || json.list || json;
            list = angular.merge([], list);
            $scope.list = list.filter(a => a || a === 0).map(item => ({ text: item.title || item }));
            setSelected();
          });
        }

        function setSelected() {
          $scope.list.map(item => {
            item.selected = value.indexOf(item.text) >= 0
          })
        }

        $scope.clickItem = item => {
          if ($scope.mode == "show") return;
          item.selected = !item.selected;
          value = $scope.list.filter(item => item.selected).map(item => item.text);
          $scope.$emit("input.component.valueChange", { value });
        }

      }]
    });
})();
