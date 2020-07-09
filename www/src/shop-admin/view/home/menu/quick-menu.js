
/* 功能页面 */
!(function (angular, window, undefined) {

  angular.module("dj-view").component("quickMenu", {
    template: `
      <div class="icon-cells-box" ng-if="otherPower[otherPowerName].length" ng-repeat="otherPowerName in otherPowerNames">
        <div class="icon-cell-caption text"><i class="fa fa-{{otherPowerFa[otherPowerName]}} text-warning em-15"></i>　{{otherPowerName}}</div>
        <div class="icon-cells flex-left flex-wrap">
          <div ng-click="clickBtn(btn)" class="flex-v flex-cc icon-3" ng-repeat="btn in otherPower[otherPowerName]" ng-style="{color: btn.color||'#008'}">
            <i class="flex-cc fa fa-{{btn.fa}}"></i>
            <div class="flex-cc">{{btn.text}}</div>
          </div>
        </div>
      </div>`,
    controller: ["$scope", "$http", "$q", "DjState", function ctrl($scope, $http, $q, DjState) {

      $scope.otherPowerFa = { "基本权限": "folder-open-o", "商城后台": "user-o", "系统权限": "cogs" };
      var otherPowerNames = $scope.otherPowerNames = Object.keys($scope.otherPowerFa);
      var otherPower = $scope.otherPower = {};

      var ajax_power = $http.post("shop/get_my_power", {}).then(json => {
        return json.datas.power || [];
      }).catch(e => {
        console.error("EEE", e);
        return {};
      });

      var ajax_iconRows = $http.post("my-dick").then(dick => Object.keys(dick.iconRows).map(k => dick.iconRows[k]))

      ajax_power.then(powers => {
        ajax_iconRows.then(iconRows => {
          otherPowerNames.map(otherPowerName => {
            var myPower = (powers.find(power => power.name == otherPowerName) || {}).list || [];
            otherPower[otherPowerName] = myPower.map(item => iconRows.find(iconRow => iconRow.text == item)).filter(item => item && !item.poweronly).map(iconRow => {
              return {
                text: iconRow.text,
                fa: iconRow.fa,
                color: iconRow.color,
                state: iconRow.state,
                mode: iconRow.mode,
                url: iconRow.url,
              };
            })
          });
        });
      }).catch(e => {
        $scope.user = {};
        console.error("EEE", e)
      });

      $scope.clickBtn = (btn) => {
        DjState.go(btn.state, btn.search || {});
      }

    }]
  });
})(angular, window);
