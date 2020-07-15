/* 系统参数 */
!(function (angular, window, undefined) {

  angular.module("dj-view").component("pageAdminArgs", {
    pageTitle: "系统参数",
    requireLogin: true,
    pageCss: "bk-d",
    footer: { hide: true },
    template: `
    <div class="flex flex-1 flex-stretch" >
      <div class="min-w-em60 flex-1 flex-v flex-left flex-stretch br-ccc bk-d padding-2 v-scroll">
        <div class="">
          <dj-captions class="flex-v" bind-params="FORM"></dj-captions>
          <div class="flex-arround bt-ccc padding-3">
            <div class="shop-edit-btn {{(FORM.ajaxing||btn.disabled||!btn.show.can_ac)&&'box-disabled'||btn.show.css||'box-primary'}}" ng-click="FORM.clickBtn(btn)" ng-repeat="btn in FORM.btns">{{btn.show.name}}</div>
          </div>
          <div class="flex-cc text-stop">{{prompt}}</div>
        </div>
      </div>
    </div>`,
    controller: ["$scope", "$http", "$q", "$element", "$timeout", function ctrl($scope, $http, $q, $element, $timeout) {
      $element.addClass("flex-v flex-1");

      var FORM = $scope.BindParams = $scope.FORM = {
        config: {},
        value: {},
        //params: {},
        item_css: "shop-edit-cell",
        item_css_caption_cell: "shop-edit-cell",
        initBtns: () => {
          console.log("初始化按钮", FORM.config)
          FORM.btns = FORM.config.btns.map(btn => {
            var params = PARAMS;
            if (angular.isObject(btn.$var)) {
              var params_var = angular.Express.calcu_var(btn.$var);
              params = [params_var, params];
            }
            var show = angular.Express.calcu(btn.show, params) || {};
            var disabled = !!angular.Express.calcu(btn.disabled || "", params);
            return {
              btn,
              show,
              params,
              mode: btn.mode,
              data: btn.data,
              next: btn.next,
              disabled,
            }
          })
        },

        updateDetailItems: (items) => {
          var detail = $scope.detail;
          if (angular.isObject(items)) Object.keys(items).map(update_k => {
            if (!update_k) return;
            var to_update = detail;
            var k_arr = update_k.split(".");
            while (k_arr.length > 1) {
              var first_k = k_arr.shift();
              if (!angular.isObject(to_update[first_k])) to_update[first_k] = {};
              to_update = to_update[first_k];
            }
            to_update[k_arr[0]] = items[update_k];
          });
        },

        initDetail: (detail) => {
          $scope.detail = angular.merge({}, detail.attr.value);
          FORM.value_unsave = angular.merge({}, detail.attr.value);
          FORM.value_last = angular.merge({}, detail.attr.value);
          FORM.value = angular.merge({}, detail.attr.value);
          FORM.dirty = false;
          FORM.calcuParams = PARAMS;
          PARAMS[0].code = detail.id;
          PARAMS[1] = detail;
        },

        $on_item_change: (data) => {
          //FORM.dirty = true;
          // console.log("$on_item_change", data);
          FORM.initBtns();
        },

        ajaxing: false,
        clickBtn: btn => {
          if (FORM.ajaxing || btn.disabled || !btn.show.can_ac) return;
          $scope.prompt = "正在提交...";
          FORM.ajaxing = true;
          $http.post("btn-action-compiled", { btn }).then(json => {
            if (json.datas.need_update) {
              FORM.updateDetailItems(json.datas.need_update);
              FORM.initDetail($scope.detail);
              FORM.initBtns();
            }
            // console.log("done", json, btn.show);
            $scope.prompt = "提交成功";
            $timeout(() => {
              $scope.prompt = "";
              FORM.ajaxing = false;
            }, 2000);
          }).catch(e => {
            console.error(e);
            $scope.prompt = btn.show.name + ": " + (e.errmsg || e);
            $timeout(() => {
              FORM.ajaxing = false;
            }, 2000);
          });
        }
      };

      var PARAMS = [
        { code: 0 },
        {},
        { $scope, $form: FORM },
        FORM,
      ];


      $http.post("admin/sys_config").then(json => {
        console.log("系统参数配置 : ", json);
        FORM.config = angular.merge({}, json.datas.config);
        FORM.initDetail(json.datas.value);
        FORM.initBtns();
      }).catch(e => {
        console.error("系统参数配置 Error: ", e.errmsg || e)
      });

    }]
  });


})(angular, window);
