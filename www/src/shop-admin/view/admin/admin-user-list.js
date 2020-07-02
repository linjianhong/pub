/* 用户列表 */
!(function (angular, window, undefined) {

  angular.module("dj.router.frame").component("pageAdminUserList", {
    pageTitle: "用户列表",
    requireLogin: true,
    autoDestroy: true,
    pageCss: "bk-d",
    footer: { hide: true },
    template: `
      <div class="bk-f" ng-if="stock_userinfo.stock_uid">
        <div class="padding-2 bb-ccc row-next" ng-click="showUser(user)" ng-repeat="user in list">
          <div class="flex text-{{user.userRunning&&'3'||'c'}}">
            <div class="em-12 b-900">{{user.stock_uid}}</div>
            <div class="text-6">{{user.mobile||'未绑定手机'}}</div>
          </div>
          <div class="flex">
            <div class="text-8">{{user.attr.value.pos||''}} {{user.attr.value.remark||''}}</div>
            <div class="text-{{user.userRunning&&'info'||'danger'}}">{{user.userRunning&&'已启用'||'无效'}}</div>
          </div>
        </div>
      </div>
      <div class="padding-3 flex-cc text-primary" ng-if="stock_userinfo&&!stock_userinfo.stock_uid">没有权限</div>
      <div class="padding-3 flex-cc text-primary" ng-if="!list">正在加载...</div>
      `,
    controller: ["$scope", "$http", "$q", "DjRouter", "DjState", function ctrl($scope, $http, $q, DjRouter, DjState) {
      $http.post("仙龙山用户信息")
        .then(stock_userinfo => $scope.stock_userinfo = stock_userinfo)
        .catch(e => $scope.stock_userinfo = {});

      var now = new Date().format("yyyy-MM-dd HH:mm:ss");
      $http.post("admin/list_user", {}).then(json => {
        $scope.list = (json.datas.list||[]).map(user=>{
          user.userRunning =  user.t1 && user.t1 < now && (!user.t2 || user.t2 > now);
          return user;
        });
      }).catch(e => {
        $scope.list = [];
      });

      $scope.showUser = user => {
        DjState.go("admin-user-edit", { stock_uid: user.stock_uid });
      }

    }]
  });


})(angular, window);
