/* 我的页面 */
!(function (angular, window, undefined) {

  angular.module("dj.router.frame").component("myInfoRow", {
    template: `<info-row d="myInfo"></info-row>`,
    bindings: {
      mode: '@',
    },
    controller: ["$scope", "$http", "DjState", "$q", function ctrl($scope, $http, DjState, $q) {
      this.$onChanges = (changes) => {
        if (changes.mode && changes.mode.currentValue) {
          if (["me", "my-info"].indexOf(changes.mode.currentValue) >= 0)
            init(changes.mode.currentValue);
        }
      }

      var ajaxMe = $http.post("我的-基本信息").then(json => json.datas);
      var ajaxIconRows = $http.post("my-dick").then(dick => dick.iconRows);

      function init(rowName) {
        ajaxIconRows.then(iconRows => {
          var row = iconRows[rowName];
          if (!row) return;
          $scope.myInfo = {
            name: rowName,
            css: rowName,
            state: row.state,
            search: row.search || {},
            fa: row.fa,
            click: clickRow,
            t1: { text: row.text },
            t3: row.t3,
            next: 1,
          };

          $q.when(ajaxMe).then(me => {

            $scope.myInfo.t2 = { text: me.uid ,css:"em-12 b-900"};
            if (me.mobile) {
              $scope.mobile = me.mobile;
              $scope.mobileHide = $scope.mobile;
              $scope.myInfo.t3.text = $scope.mobileHide.replace(/\d{4}(?=\d{4}$)/, "****");
            }

            if (me.wx && me.wx.headimgurl) {
              $scope.myInfo.img = {
                url: me.wx.headimgurl,
                css: "headimgurl-1"
              };
            }

            $scope.myInfo.t1.text = me.nick || me.wx && me.wx.nickname || "游客"
          });
        });

      }

      function clickRow(row) {
        setTimeout(() => DjState.go(row.state, row.search || {}))
      }


    }]
  });
})(angular, window);
