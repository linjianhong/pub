/* 用户列表 */
!(function (angular, window, undefined) {

  angular.module("dj.router.frame").component("pageAdminRole", {
    pageTitle: "角色管理",
    requireLogin: true,
    pageCss: "bk-d",
    footer: { hide: true },
    template: `
      <table class="query bk-f" ng-if="colDefine">
        <tr class="title center">
          <td class="index">序号</td>
          <td class="{{col.css||''}} sortby{{col.$sortby||0}}" ng-click="sortby(col)" ng-repeat="col in colDefine.cols">{{col.title}}</td>
        </tr>
        <tr class="data" ng-repeat="row in list track by $index">
          <td class="index center">{{$index+1}}</td>
          <td class="{{col.css||''}}" ng-repeat="col in colDefine.cols" ng-click="clickCell(row, col)">{{row[col.keyName]}}</td>
        </tr>
      </table>
      <div class="padding-3 flex-cc text-primary" ng-if="!colDefine">正在查询...</div>
      `,
    controller: ["$scope", "$http", "$q", "DjRouter", "DjState", function ctrl($scope, $http, $q, DjRouter, DjState) {
      
      $http.post("admin/userlist", { type }).then(json => {
      }).catch(e => {
        console.error(e)
      });

      $scope.clickCell = (row, col) => {
      }

    }]
  });


})(angular, window);
