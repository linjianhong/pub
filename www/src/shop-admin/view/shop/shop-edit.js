/* 查询结果列表 */
!(function (angular, window, undefined) {

  angular.module("dj-view").component("pageShopEdit", {
    footer: { hide: true },
    requireLogin: true,
    autoDestroy: true,
    pageTitle: (newPage, $q, $http) => {
      var type = newPage.state.search && newPage.state.search.type || "";
      return `商品上架`;
    },
    template: `
    <div class="flex flex-1 flex-stretch" >
      <div resize-x class="flex-v w-em30 bk-f8 shrink0" >
        <div class="flex-stretch bb-ccc header xp">
          <div class="flex-1 flex">
            <div class="text-8">分类:</div>
            <chain-select class="shop-edit-group-box flex-1 text-primary" config="GROUP"></chain-select>
          </div>
          <div class="w-em10 flex-v padding-1 padding-h-2">
            <input class="white radius" ng-model="R.text_filter" placeholder="关键词筛选">
          </div>
        </div>
        <div class="flex-stretch bb-ccc header xp">
          <tab-bar class="text-c" list="TAB.list"
            tab-click="TAB.click($n, item)"
            change="TAB.change($n, item)"
            active="{{TAB.active}}"
          ></tab-bar>
          <div class="flex-cc em-15 padding-2 text-primary" ng-click="add()"><i class="fa fa-plus"></i></div>
        </div>
        <div class="flex-1 flex-v v-scroll">
          <div class="bb-ccc padding-3 {{code==item.id&&'box-primary'||'text-primary'}}" ng-click="editCode(item.id)" ng-repeat="item in R.list|filter:(TAB.status&&{status:TAB.status}||'')|filter:R.text_filter  track by $index">
            <div><span class="text-8">[{{item.attr.value['分类11']||'未分类'}}]</span> <span class="">{{item.attr.value['名称']||'[未命名]'}}</span></div>
          </div>
        </div>
      </div>
      <div class="min-w-em60 flex-1 flex-v flex-left flex-stretch br-ccc bk-d padding-2 v-scroll">
        <dj-captions class="flex-v" bind-params="FORM" ng-if="code"></dj-captions>
        <div class="flex-arround bt-ccc padding-3" ng-if="code">
          <div class="shop-edit-btn {{(FORM.ajaxing||btn.disabled||!btn.show.can_ac)&&'box-disabled'||btn.show.css||'box-primary'}}" ng-click="FORM.clickBtn(btn)" ng-repeat="btn in FORM.btns">{{btn.show.name}}</div>
        </div>
        <div class="flex-cc text-stop" ng-if="code">{{prompt}}</div>
      </div>
      <div class="flex-v em-20 w-em18 v-scroll" ng-if="0">
        <goods-show class="em-05 margin-1 box-ccc" code="code"></goods-show>
      </div>
    </div>`,
    controller: ["$scope", "$http", "$q", "$element", "SHOP_FN", "$timeout", "DjState", function ctrl($scope, $http, $q, $element, SHOP_FN, $timeout, DjState) {
      $element.addClass("flex-v flex-1");
      var tab = angular.extend({ tab: 2 }, DjState.$search).tab;

      var R = $scope.R = {
        text_filter: "",
      }

      var TAB_LIST = [
        { text: "全部", test_status: () => 1 },
        { text: "草稿", test_status: (status) => status == "已启用", status: "已启用" },
        { text: "上架", test_status: (status) => status == "已上架", status: "已上架" },
        { text: "下架", test_status: (status) => status == "已下架", status: "已下架" }
      ];
      /** 标签功能 */
      var TAB = $scope.TAB = {
        list: TAB_LIST,
        active: tab,
        status: (TAB_LIST[tab] || {}).status || "",
        change: (index, name) => {
          if (!TAB.list[index]) return;
          TAB.active = index;
          TAB.status = TAB.list[index].status || "";
          $scope.code = "";
          DjState.replace("shop-edit", { tab: index })
        },
        setActiveByCode: (code) => {
          var theItem = R.list.find(item => item.id == code);
          if (!theItem || !theItem.attr || !theItem.attr.value) return false;
          $scope.detail = theItem;
          R.value = angular.merge({}, theItem.attr.value);
          FORM.initDetail(theItem);
          FORM.initBtns();
          if (!TAB.list[TAB.active] || !TAB.list[TAB.active].test_status(theItem.status)) {
            var index = TAB.list.findIndex(item => item.status && item.test_status(theItem.status));
            if (index < 0) return false;
            TAB.active = index;
          }
          TAB.status = TAB.list[TAB.active].status || "";
          return true;
        },
      };

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
            TAB.setActiveByCode($scope.detail.id);
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

      $http.post("商城配置").then(json => {
        FORM.config = angular.merge({}, json.datas.config);
      }).catch(e => {
        console.error("商城配置 Error: ", e)
      });

      /** 初始化 */
      function reload() {
        return $http.post("shop_admin/li").then(json => {
          R.full_list = (json.datas.list || []).map(item => {
            item.attr = item.attr || { value: {} };
            item.attr.value = item.attr.value || {};
            return item;
          }).sort((a, b) => (a.attr.value["名称"] || "").compUseNumber(b.attr.value["名称"] || ""));
          R.list = angular.extend([], R.full_list);
          R.list.map(item => item.status = item.status || "已启用");
          GROUP.DICK = SHOP_FN.get_goods_group(R.list);
        }).catch(e => {
          console.error(e);
        });
      }
      reload();

      /** 产品分类筛选功能 */
      var GROUP = $scope.GROUP = {
        text: "",
        selectPrompt: ["选择主分类", "选择分类2", "选择分类3"],
        sep: "~",
        showing: false,
        toggle: () => GROUP.showing = !GROUP.showing,
        ondone: (arr) => {
          GROUP.showing = false;
          var text = arr.join(GROUP.sep);
          if (GROUP.text != text) {
            GROUP.text = text;
            R.list = (R.full_list || []).filter(item => SHOP_FN.filter_group(item, arr));
          }
        }
      }

      /** 添加 */
      $scope.add = () => {
        $http.post("显示对话框/confirm", { title: "您确定要添加一个商品？", body: "添加后，你可以编辑相关数据后，进行上架" }).then(() => {
          $http.post("shop_admin/create").then(json => {
            console.log("添加", json);
            if (json.datas.code) {
              reload().then(() => $scope.editCode(json.datas.code));
            }
          }).catch(e => {
            console.error(e);
          })
        });
      }

      /** 进入编辑 */
      $scope.editCode = (code) => {
        $scope.code = code;
        TAB.setActiveByCode(code);
      }

    }]
  });


})(angular, window);
