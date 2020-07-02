/* 添加用户 */
!(function (angular, window, undefined) {

  angular.module("dj.router.frame").component("pageAdminUserCreate", {
    pageTitle: "添加用户",
    requireLogin: true,
    pageCss: "bk-d",
    footer: { hide: true },
    template: `
      <div dform class="id-result bk-f padding-v-3" ng-if="stock_userinfo.stock_uid">
        <div dform-input="{theme:'ttb', name:'pos', title:'岗位', type:'input',valid:{ required: 1,minlength:2},invalid:{required: '请输入',minlength:'至少2个字符'}}"></div>
        <div dform-input="{theme:'ttb', name:'remark', title:'说明', type:'input'}"></div>
        <div class="flex em-12 padding-v-3">
          <div class="flex-1 text-danger">{{prompt}}</div>
          <fa-button class="warning" d="{fa:'save',title:'创建'}" disabled="!form.valid" ng-click="clickBtn(btn)"></fa-button>
        </div>
      </div>
      <div class="padding-3 flex-cc text-primary" ng-if="stock_userinfo&&!stock_userinfo.stock_uid">没有权限</div>
      <div class="padding-3 flex-cc text-primary" ng-if="!stock_userinfo">正在加载...</div>
      `,
    controller: ["$scope", "$http", "$q", "DjRouter", "DjState", function ctrl($scope, $http, $q, DjRouter, DjState) {

      $http.post("仙龙山用户信息")
        .then(stock_userinfo => $scope.stock_userinfo = stock_userinfo)
        .catch(e => $scope.stock_userinfo = {});

      $scope.form = {};
      $scope.$on("dform.formvalue", (event, data) => {
        event.preventDefault();
        // console.log("收到 dform.formvalue", data, "$id=", $scope.$id);
        $scope.form.value = data.form.value;
        $scope.form.valid = data.form.valid;
        $scope.form.dirty = data.form.dirty;
        $scope.prompt = "";
      });

      /** 仅支持一次性提交，防止重复提交 */
      var submited = false;
      var submiting = false;
      $scope.clickBtn = () => {
        if (submited || submiting) return;
        submiting = true;
        if (!$scope.form.valid) {
          $scope.prompt = "数据输入不完整";
          return;
        }
        $http.post("admin/create_user", { value: $scope.form.value }).then(json => {
          submited = true;
          $scope.prompt = "提交成功, 正在跳转...";
          $scope.form.valid = false;
          setTimeout(() => {
            DjState.go("admin-user-list", {});
          }, 1200);
        }).catch(e => {
          submiting = false;
          $scope.prompt = e.errmsg || "提交失败";
          console.log("", e);
        })
      };

    }]
  });


})(angular, window);
