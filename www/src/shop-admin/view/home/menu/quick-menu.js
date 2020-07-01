
/* 功能页面 */
!(function (angular, window, undefined) {

  angular.module("dj.router.frame").component("quickMenu", {
    template: `
      <div class="icon-cells-box" ng-if="otherPower[otherPowerName].length" ng-repeat="otherPowerName in otherPowerNames">
        <div class="icon-cell-caption text"><i class="fa fa-{{otherPowerFa[otherPowerName]}} text-warning em-15"></i>　{{otherPowerName}}</div>
        <div class="icon-cells flex-left flex-wrap">
          <div ng-click="clickBtn(btn)" class="flex-v flex-cc icon-3" ng-repeat="btn in otherPower[otherPowerName]" ng-style="{color: btn.color||'#008'}">
            <i class="flex-cc fa fa-{{btn.fa}}"></i>
            <div class="flex-cc">{{btn.text}}</div>
          </div>
        </div>
      </div>
      <div class="icon-cells-box" ng-if="dickPowers.length">
        <div class="icon-cell-caption text"><i class="fa fa-book text-warning em-15"></i>　字典</div>
        <div class="icon-cells flex-left flex-wrap">
          <div ng-click="clickBtn(btn)" class="flex-v flex-cc icon-3" ng-repeat="btn in dickPowers" ng-style="{color: btn.color||'#008'}">
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
        return json.datas.power || {};
      }).catch(e => {
        console.error("EEE", e);
        return {};
      });

      var ajax_iconRows = $http.post("my-dick").then(dick => Object.keys(dick.iconRows).map(k => dick.iconRows[k]))

      ajax_power.then(power => {

        ajax_iconRows.then(iconRows => {
          otherPowerNames.map(otherPowerName => {
            var myPower = power[otherPowerName] || [];
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

          ["字典权限"].map(otherPowerName => {
            var myPower = power[otherPowerName] || [];
            $scope.dickPowers = myPower.map(item => iconRows.find(iconRow => iconRow.text == item)).filter(item => !!item).map(iconRow => {
              return {
                text: iconRow.text,
                fa: iconRow.fa,
                color: iconRow.color,
                state: iconRow.state,
                search: iconRow.search || {},
              };
            })
          });

        });
      }).catch(e => {
        $scope.user = {};
        console.error("EEE", e)
      });


      $scope.clickFlow = {
        "流程列表": flow => DjState.go("query-list", { type: flow.type }),
        "新建流程": flow => {
          flow.create = flow.create || {};
          $http
            .post("qrcode/request_draft_id", {
              value: {
                'node_id': flow.create.node_id || 0,
                'type': flow.type,
                'name': flow.create.name || "",
                'v1': flow.create.v1 || "",
                'v2': flow.create.v2 || "",
              }
            })
            .then(json => {
              return json.datas.code
            })
            .then(code => setTimeout(() => DjState.go("id", { code })))
            .catch(e => {
              console.error("添加流程失败", e);
            });
        }
      }

      $scope.clickBtn = (btn) => {
        if (btn.mode == "download-http") {
          console.log(btn.url);
          $http.post(btn.url).then(json => {
            console.log("备份成功", json);
          }).catch(e => {
            console.error("备份失败", e);
          })
          return;
        }
        DjState.go(btn.state, btn.search || {});
      }


      function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
      }
    }]
  });
})(angular, window);
