/* 编辑用户 */
!(function (angular, window, undefined) {

  angular.module("dj.router.frame").component("pageAdminUserEdit", {
    pageTitle: (newPage, $q, $http) => {
      var search = newPage.state.search;
      return $q.when(`编辑用户 - ${search.stock_uid || ''}`);
    },
    requireLogin: true,
    pageCss: "bk-d",
    footer: { hide: true },
    template: `
      <div class="padding-3 flex-cc text-primary" ng-if="stock_userinfo&&!stock_userinfo.stock_uid">没有权限</div>
      <div class="id-result bk-f padding-v-3" ng-if="user && stock_userinfo.stock_uid">
        <div dform-form="formInfo" ></div>
        <div class="flex em-12 padding-v-3">
          <div class="flex-1 text-danger">{{formInfo.prompt}}</div>
          <fa-button class="danger" d="{fa:'save',title:'启用'}" disabled="userRunning||formInfo.enableUser.submiting" ng-click="formInfo.enableUser()"></fa-button>
          <fa-button class="danger" d="{fa:'save',title:'禁用'}" disabled="!userRunning||formInfo.disableUser.submiting" ng-click="formInfo.disableUser()"></fa-button>
          <fa-button class="warning" d="{fa:'save',title:'更新'}" disabled="!formInfo.valid||!formInfo.dirty||formInfo.updateUser.submiting" ng-click="formInfo.updateUser()"></fa-button>
        </div>
      </div>
      <div class="id-result bk-f padding-v-3 margin-v-2" ng-if="user && stock_userinfo.stock_uid">
        <div dform-form="formMobile" ></div>
        <div class="flex em-12 padding-v-3">
          <div class="flex-1 text-danger">{{formMobile.prompt}}</div>
          <fa-button class="warning" d="{fa:'save',title:'更新'}" disabled="!formMobile.valid||!formMobile.dirty||formMobile.updateMobile.submiting" ng-click="formMobile.updateMobile()"></fa-button>
        </div>
      </div>
      <div class="id-result bk-f padding-v-3 margin-v-2" ng-if="user && stock_userinfo.stock_uid">
        <div dform-form="formPowers" class="form-power"></div>
        <div class="flex em-12 padding-v-3">
          <div class="flex-1 text-danger">{{formPowers.prompt}}</div>
          <fa-button class="warning" d="{fa:'save',title:'更新权限'}" disabled="!formPowers.dirty||formPowers.updatePower.submiting" ng-click="formPowers.updatePower()"></fa-button>
        </div>
      </div>
      <div class="padding-3 flex-cc text-primary" ng-if="!user">正在加载...</div>
      `,
    controller: ["$scope", "$http", "$timeout", "DjRouter", "DjState", function ctrl($scope, $http, $timeout, DjRouter, DjState) {
      var stock_uid = DjRouter.$search.stock_uid;
      if (!stock_uid) return;

      $http.post("仙龙山用户信息")
        .then(stock_userinfo => $scope.stock_userinfo = stock_userinfo)
        .catch(e => $scope.stock_userinfo = {});

      var now = new Date().format("yyyy-MM-dd HH:mm:ss");
      var ajax_user = $http.post("admin/get_user", { stock_uid }).then(json => {
        return $scope.user = json.datas.user || {};
      }).catch(e => {
        return $scope.user = { attr: {} };
      });
      ajax_user.then(user => {
        formInfo.initValue = user.attr && user.attr.value || {};
        formMobile.initValue = { mobile: user.mobile, "展厅": user.attr["展厅"] };
        formPowers.initValue = user.attr && user.attr.power || {};
        $scope.userRunning = user.t1 && user.t1 < now && (!user.t2 || user.t2 > now);
      }).catch(e => {
        $scope.user = {};
      });



      var formInfo = $scope.formInfo = {
        items: [
          { name: 'pos', title: '岗位', type: 'input', valid: { required: 1, minlength: 2 }, invalid: { required: '请输入', minlength: '至少2个字符' } },
          { name: 'remark', title: '说明', type: 'input' },
        ],
        /** 仅支持一次性提交，防止重复提交 */
        updateUser: () => {
          if (formInfo.updateUser.submiting) return;
          formInfo.updateUser.submiting = true;
          if (!formInfo.valid) return formInfo.prompt = "数据输入不完整";
          $http.post("admin/update_user", { stock_uid: $scope.user.stock_uid, value: formInfo.value }).then(json => {
            formInfo.prompt = "提交成功.";
            formInfo.dirty = false;
          }).catch(e => {
            formInfo.prompt = e.errmsg || "提交失败";
          }).finally(e => {
            $timeout(() => { formInfo.updateUser.submiting = false; }, 1200);
          })
        },

        enableUser: () => {
          if (formInfo.enableUser.submiting) return;
          formInfo.enableUser.submiting = true;
          $http.post("admin/enable_user", { stock_uid: $scope.user.stock_uid }).then(json => {
            formInfo.prompt = "已启用该用户.";
            $scope.userRunning = 1;
          }).catch(e => {
            console.log("EEE", e);
            formInfo.prompt = e.errmsg || "提交失败";
          }).finally(e => {
            $timeout(() => { formInfo.enableUser.submiting = false; }, 1200);
          })
        },

        disableUser: () => {
          if (formInfo.disableUser.submiting) return;
          formInfo.disableUser.submiting = true;
          $http.post("admin/disable_user", { stock_uid: $scope.user.stock_uid }).then(json => {
            formInfo.prompt = "已禁用该用户.";
            $scope.userRunning = 0;
          }).catch(e => {
            formInfo.prompt = e.errmsg || "提交失败";
          }).finally(e => {
            $timeout(() => { formInfo.disableUser.submiting = false; }, 1200);
          })
        }
      }


      var formMobile = $scope.formMobile = {
        items: [
          {
            "name": "mobile",
            "title": "手机号码",
            "type": "input",
            "valid": {
              "required": 1,
              "pattern": /^1(\d|\d-){10}$/,
            },
            "invalid": {
              "required": '手机号码不可空',
              "pattern": '手机号码不合法',
            },
          },
          { name: '展厅', title: '展厅', type: 'dropdown', list: "展厅" },
        ],
        /** 仅支持一次性提交，防止重复提交 */
        updateMobile: () => {
          if (formMobile.updateMobile.submiting) return;
          formMobile.updateMobile.submiting = true;
          if (!formMobile.valid) return formMobile.prompt = "数据输入不完整";
          $http.post("admin/update_mobile", { stock_uid: $scope.user.stock_uid, value: formMobile.value }).then(json => {
            formMobile.prompt = "提交成功.";
            formMobile.dirty = false;
          }).catch(e => {
            formMobile.prompt = e.errmsg || "提交失败";
          }).finally(e => {
            $timeout(() => { formMobile.updateMobile.submiting = false; }, 1200);
          })
        },
      }


      var formPowers = $scope.formPowers = {
        init: () => {
          $http.post("admin/get_power_define", {}).then(json => {
            // ajax_user.then(user => formPowers.initValue = user.attr && user.attr.power || {});
            formPowers.items = (json.datas.groups || []).map(item => {
              item.title = item.name;
              item.type = "tags";
              return item;
            });
          }).catch(e => {
            //$scope.user = {};
          });
        },
        /** 仅支持一次性提交，防止重复提交 */
        updatePower: () => {
          if (formPowers.updatePower.submiting) return;
          formPowers.updatePower.submiting = true;
          if (!formPowers.dirty) return formPowers.prompt = "数据未改变";
          $http.post("admin/update_power", { stock_uid: $scope.user.stock_uid, value: formPowers.value }).then(json => {
            formPowers.prompt = "提交成功.";
            formPowers.dirty = false;
          }).catch(e => {
            formPowers.prompt = e.errmsg || "提交失败";
          }).finally(e => {
            $timeout(() => { formPowers.updatePower.submiting = false; }, 1200);
          })
        },
      };
      formPowers.init();

    }]
  });


})(angular, window);
