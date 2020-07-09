/* 我的页面 */
!(function (angular, window, undefined) {

  angular.module("dj-view").component("pageMyInfo", {
    pageTitle: "个人信息",
    requireLogin: true,
    pageCss: "bk-d",
    footer: { hide: true },
    template: `
      <my-info-row class="info-rows" mode="my-info"></my-info-row>
      <div class="info-rows" ng-repeat="group in groups">
        <info-row d="row" ng-repeat="row in group"></info-row>
      </div>`,
    controller: ["$scope", "$http", "DjState", "$q", function ctrl($scope, $http, DjState, $q) {

      var ajaxMe = $http.post("我的-基本信息").then(json => json.datas);

      /** 根据字典来显示标签 */
      var theGroups = [
        ["mobile", "wx", "settings"],
        ["favorite"]
      ];
      var myRows = $scope.myRows = {};
      $http.post("my-dick").then(dick => dick.iconRows).then(iconRows => {
        $scope.groups = theGroups.map(group => group
          .filter(name => iconRows[name])
          .map(name => {
            var row = iconRows[name];
            return myRows[name] = {
              name,
              css: name,
              state: row.state,
              search: row.search || {},
              fa: row.fa,
              click: clickRow,
              t1: { text: row.text },
              t3: row.t3,
              next: 1,
            }
          })
          .filter(row => row.name != "my-info")
        ).filter(sub => sub.length);

        $q.when(ajaxMe).then(me => {
          if (me.stock_userinfo && me.stock_userinfo.mobile) {
            var mobileHide = me.stock_userinfo.mobile;
            myRows.mobile.t3.text = mobileHide.replace(/\d{4}(?=\d{4}$)/, "****");
          }
        });

      });

      function clickRow(row) {
        setTimeout(() => DjState.go(row.state, row.search || {}))
      }


    }]
  });
})(angular, window);
