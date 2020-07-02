/* 用户管理 */
!(function (angular, window, undefined) {

  angular.module("dj.router.frame").component("pageAdminUser", {
    pageTitle: "用户管理",
    requireLogin: true,
    pageCss: "bk-d",
    footer: { hide: true },
    template: `
      <div class="info-rows" ng-repeat="group in groups">
        <info-row d="row" ng-repeat="row in group"></info-row>
      </div>`,
    controller: ["$scope", "$http", "DjState", "$q", function ctrl($scope, $http, DjState, $q) {

      // var ajaxMe = $http.post("我的-基本信息").then(json => json.datas);

      var ajax_power = $http.post("shop/get_my_power", {}).then(json => {
        return json.datas.power || {};
      }).catch(e => {
        console.error("EEE", e);
        return {};
      });

      /** 根据字典来显示标签 */
      var ajaxGroup = [["admin-user-create", "admin-user-list"], ["admin-role", "admin-power-dick"]];
      var myRows = $scope.myRows = {};
      $http.post("my-dick").then(dick => dick.iconRows).then(iconRows => {
        $q.when(ajaxGroup).then(groups => {
          $scope.groups = groups.map(group => group
            .filter(name => iconRows[name])
            .map(name => {
              var row = iconRows[name];
              return myRows[name] = angular.extend({
                name,
                color: row.color,
                css: name,
                fa: row.fa,
                click: clickRow,
                t1: angular.extend({ text: row.text }, row.t1),
                t3: row.t3,
                next: 1,
              }, row);
            })
          ).filter(sub => sub.length);

          $q.when(ajax_power).then(me => {
            if (me.mobile) {
              myRows.mobile.t3.text = me.mobile
            }
          });
        }).catch(e => {
          console.error(e);
        });
      });

      function clickRow(row) {
        DjState.go(row.state);
      }


    }]
  });


})(angular, window);
