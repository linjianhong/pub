/* 用户管理 */
!(function (angular, window, undefined) {

  angular.module("dj.router.frame").component("pageAdminUser", {
    pageTitle: "用户管理",
    requireLogin: true,
    pageCss: "bk-d",
    footer: { hide: true },
    template: `
    <div class="flex flex-1 flex-stretch" >
      <div resize-x class="flex-v w-em20 bk-f8 shrink0" >
        <div class="flex bb-ccc header xp">
          <div class="flex-1 flex-v padding-1 padding-h-2">
            <input class="white radius" ng-model="R.text_filter" placeholder="关键词筛选">
          </div>
          <div class="flex-cc em-15 padding-2 text-primary" ng-click="R.add.showing=1"><i class="fa fa-plus"></i></div>
        </div>
        <div class="flex-1 flex-v v-scroll">
          <div class="bb-ccc padding-3 {{R.active==item&&'box-primary'||'text-6'}}" ng-click="R.edit(item)" ng-repeat="item in R.list|filter:R.text_filter track by $index">
            <div>{{item.uid}}：{{item.admin.name||'[未命名]'}}</div>
          </div>
        </div>
      </div>
      <div class="min-w-em60 flex-1 flex-v flex-left flex-stretch br-ccc bk-d padding-2 v-scroll">
        <div class="padding-1" ng-if="R.active">
          <div class="flex-left padding-1">
            <div class="padding-1 w-em6">用户名称</div>
            <input class="w-em20 good-style radius" ng-model="R.editing.admin.name" ng-change="R.calcuNewValue()">
          </div>
          <div class="flex-left padding-1" ng-repeat="n in '12345'">
            <div class="padding-1 w-em6">角色 {{n}}</div>
            <input class="w-em20 good-style radius" ng-model="R.editing.admin['角色'+n]" ng-change="R.calcuNewValue()">
          </div>
          <div class="btns flex-wrap flex-right padding-3">
            <div class="{{R.dirty&&'box-primary'||'box-disabled'}} radius" ng-click="R.save()">保存</div>
          </div>
        </div>
        <div class="flex-cc text-stop">{{prompt}}</div>
      </div>
    </div>
    <div class="modal-dlg flex-cc" ng-if="R.add.showing">
      <div class="radius bk-e">
        <div class="padding-2 flex-cc bb-ccc">添加用户</div>
        <div class="padding-3 flex bb-ccc">
          <div class="padding-1 shrink0">用户ID</div>
          <input class="white radius w-em8" ng-model="R.add.uid">
        </div>
        <div class="flex">
          <div class="padding-2 flex-1 flex-cc text-8" ng-click="R.add.showing=false">取消</div>
          <div class="padding-2 flex-1 flex-cc text-active br-ccc" ng-click="R.add()">添加</div>
        </div>
        <div class="flex-cc padding-2 text-stop" ng-if="R.add.prompt">
        </div>
      </div>
    </div>`,
    controller: ["$scope", "$http", "$element", "$timeout", "DjState", function ctrl($scope, $http, $element, $timeout, DjState) {
      $element.addClass("flex-v flex-1");

      var R = $scope.R = {
        text_filter: "",
        list: [],

        init: () => {
          R.list.map(user => {
            user.uid = user.uid || "";
            user.name = user.name || "";
            user.mobile = user.mobile || "";
            user.admin = user.admin || {};
            user.admin.roles = user.admin.roles || [];
          });
        },

        /** 添加 */
        add: () => {
          $http.post("admin/user_create", { uid: R.add.uid }).then(json => {
            R.list.push(json.datas.user);
            R.init();
            R.edit(json.datas.user);
          }).catch(e => {
            R.add.prompt = e.errmsg || e;
            $timeout(() => {
              R.add.prompt = "";
            }, 2000);
            console.error(e);
          });
        },

        edit: user => {
          R.active = user;
          R.editing = {
            uid: user.uid,
            name: user.name,
            mobile: user.mobile,
            admin: user.admin,
          };
        },

        save: user => {
          if (!R.active || !R.dirty || R.ajaxing) {
            $scope.prompt = "数据未改变";
            return;
          }
          R.ajaxing = false;
          R.prompt = "正在保存...";
          $http.post("显示对话框/confirm", { title: "更新角色的权限？", body: "更新后，对应用户的权限将立即改变。确认要更新？" }).then(() => {
            $http.post("admin/role_update", { id: R.active.id, name: R.roleName, powers: R.newValue }).then(json => {
              R.active.attr.powers = R.newValue;
              R.active.name = R.roleName;
              R.dirty = false;
              R.prompt = "保存成功";
              $timeout(() => {
                R.ajaxing = false;
                R.prompt = "";
              }, 800)
            }).catch(e => {
              console.error(e);
            })
          });
        },

        toggle: (group, role) => {
          role.b = !role.b;
          R.calcuNewValue();
          $scope.prompt = "";
        },

        calcuNewValue: () => {
          R.newValue = {};
          R.groups.map(group => {
            var names = [];
            group.list.map(item => {
              item.b && names.push(item.name);
            });
            names.length > 0 && (R.newValue[group.name] = names);
          });
          R.dirty = !angular.equals(R.newValue, R.active.attr.powers) || R.active.name != R.roleName;
        },
      }

      $http.post("admin/user_list").then(json => {
        R.role_names = json.datas.role_names;
        R.list = json.datas.users;
        R.init();
        console.log("json", json)
      }).catch(e => {
        console.error(e)
      });

    }]
  });


})(angular, window);
