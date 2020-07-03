/* 角色管理 */
!(function (angular, window, undefined) {

  angular.module("dj.router.frame").component("pageAdminRole", {
    pageTitle: "角色管理",
    requireLogin: true,
    pageCss: "bk-d",
    footer: { hide: true },
    template: `
    <div class="flex flex-1 flex-stretch" >
      <div resize-x class="flex-v w-em20 bk-f8 shrink0" >
        <div class="flex-stretch bb-ccc header xp">
          <div class="w-em10 flex-v padding-1 padding-h-2">
            <input class="white radius" ng-model="R.text_filter" placeholder="关键词筛选">
          </div>
          <div class="flex-cc em-15 padding-2 text-primary" ng-click="R.add()"><i class="fa fa-plus"></i></div>
        </div>
        <div class="flex-1 flex-v v-scroll">
          <div class="bb-ccc padding-3 {{R.active==item&&'box-primary'||'text-6'}}" ng-click="R.edit(item)" ng-repeat="item in R.list|filter:R.text_filter track by $index">
            <div>{{item.name||'[未命名]'}}</div>
          </div>
        </div>
      </div>
      <div class="min-w-em60 flex-1 flex-v flex-left flex-stretch br-ccc bk-d padding-2 v-scroll">
        <div class="" ng-if="R.active">
          <div class="flex-left padding-2">
            <div class="padding-1">角色名称</div>
            <input class="w-em20 good-style radius" ng-model="R.roleName" ng-change="R.calcuNewValue()">
          </div>
          <div class="margin-2" ng-repeat="group in R.groups">
            <div class="padding-h-1">{{group.name}}</div>
            <div class="flex-wrap flex-left padding-1 box-ccc radius bk-f">
              <div class="padding-2" ng-repeat="role in group.list track by $index" ng-click="R.toggle(group,role)">
                <div class="flex {{role.b&&'text-0'||'text-c'}}">
                  <i class="em-12 fa fa-{{role.b&&'check-'||''}}square-o"> </i>
                  <div class="padding-h-1">{{role.name}}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="btns flex-wrap flex-right padding-3">
            <div class="{{R.dirty&&'box-primary'||'box-disabled'}} radius" ng-click="R.save()">保存</div>
          </div>
        </div>
        <div class="flex-cc text-stop">{{prompt}}</div>
      </div>
    </div>`,
    controller: ["$scope", "$http", "$q", "$element", "SHOP_FN", "$timeout", function ctrl($scope, $http, $q, $element, SHOP_FN, $timeout) {
      $element.addClass("flex-v flex-1");

      var R = $scope.R = {
        text_filter: "",
        list: [],

        init: () => {
          R.list.map(role => {
            role.name = role.name || "";
            role.attr = role.attr || {};
            role.attr.powers = role.attr.powers || {};
          })
          R.groups = R.powers.map(group => {
            var name = group.name;
            var list = group.list.map(name => {
              return { name, b: 0 };
            });
            return { name, list };
          });
        },

        /** 添加 */
        add: () => {
          $http.post("显示对话框/confirm", { title: "您确定要添加一个角色？", body: "添加后，你可以编辑相关数据后" }).then(() => {
            $http.post("admin/role_create").then(json => {
              R.list.push(json.datas.role);
              R.init();
              R.edit(json.datas.role);
            }).catch(e => {
              console.error(e);
            })
          });
        },

        edit: role => {
          R.active = role;
          R.roleName = R.active.name;
          var powers = role.attr.powers;
          R.groups.map(group => {
            group.list.map(item => {
              item.b = powers[group.name] && powers[group.name].indexOf(item.name) >= 0;
            });
          });
        },

        save: role => {
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

      $http.post("admin/role_list").then(json => {
        R.powers = json.datas.powers;
        R.list = json.datas.roles;
        R.init();
        console.log("json", json)
      }).catch(e => {
        console.error(e)
      });

    }]
  });


})(angular, window);
