/* 字典页面 */
!(function (angular, window, undefined) {


  angular.module("dj.router.frame").component("pageDickEdit", {
    pageTitle: newPage => {
      return newPage.state.search.type
    },
    pageCss: "bk-e",
    requireLogin: true,
    autoDestroy: true,
    footer: { hide: true },
    bindings: {
      serach: "<"
    },
    template: `<div class="flex-1 flex flex-top flex-stretch">
        <div class="dick-edit-left v-scroll">
          <div class="flex flex-stretch dick-edit-list-header">
            <div class="dick-edit-filter flex-1 flex-cc w-em5"><input ng-model="filterText"></div>
            <div class="flex-cc em-15 padding-h-2 text-primary {{activeItem=='添加'&&'active'||''}}" ng-click="add()"><i class="fa fa-plus"></i></div>
          </div>
          <div class="dick-edit-item {{activeItem==item&&'active'||''}}" ng-click="edit(item)" ng-repeat="item in list|filter:filterText.split(' ')[0]|filter:filterText.split(' ')[1]|filter:filterText.split(' ')[2] track by $index">{{item.listTitle||item.title||item.value}}</div>
        </div>
        <div class="dick-edit-body padding-3 flex-1 v-scroll">
          <div class="flex-cc em-15">{{formEdit.title||'请选择'}}</div>
          <div dform-form2="formEdit" class="form-power" ng-if="formEdit.api"></div>
          <div class="flex em-12 padding-v-3" ng-if="formEdit.api">
            <div class="flex-1 text-danger">{{formEdit.prompt}}</div>
            <fa-button class="warning" d="{fa:'save',title:'保存'}" disabled="!formEdit.dirty||!formEdit.valid||formEdit.save.submiting" ng-click="formEdit.save()"></fa-button>
          </div>
        </div>
      </div>`,
    controller: ["$scope", "$http", "$q", "$timeout", "$element", "DjRouter", function ($scope, $http, $q, $timeout, $element, DjRouter) {
      var type = DjRouter.$search.type;
      if (!type) return;
      $element.addClass("flex-1 flex-v");

      $scope.filterText = "";

      /** 计算标题 */
      function calcuTitle(item) {
        if (!calcuTitle.express) return;
        item.listTitle = calcuTitle.express.calcu(item);
      }

      var ajaxQrcodeConfig = $http.post("字典操作配置").then(json => json.datas["字典配置"] || []);
      var ajaxDickList = $http.post(`下拉列表-${type}`).then(json => json.datas.list || []);

      var valueMap;
      ajaxQrcodeConfig.then(dickConfig => {
        var config = dickConfig.find(item => item.name == type);
        valueMap = config.valueMap;
        ajaxDickList.then(dickList => {
          console.log("config=", config, ",dickList=", dickList);
          $scope.list = dickList;
          if (config.title) {
            calcuTitle.express = angular.Express.parse(config.title);
            dickList.map(item => calcuTitle(item))
          }
          formEdit.setConfigItems(config.items);
        }).catch(e => {
          console.log("dickList EEE", e)
        });
      }).catch(e => {
        console.log("字典页面 EEE", e)
      });

      $scope.add = () => {
        if ($scope.activeItem == "添加" && !formEdit.dirty) {
          // 第二次点击，清空数值
          formEdit.initValue = {};
          Object.keys(valueMap).map(k => formEdit.initValue[valueMap[k]] = "");
          return;
        }
        formEdit.dirty = false;
        $scope.activeItem = "添加";
        formEdit.api = "dick/create_item";
        formEdit.title = `${type} - 添加`;
        formEdit.prompt = ".";
      }

      $scope.edit = (item) => {
        $scope.activeItem = item;
        formEdit.api = "dick/update_item";
        formEdit.title = `${type} - 修改`;

        //$timeout(()=>formEdit.dirty = false,1);
        formEdit.initValue = {};
        Object.keys(valueMap).map(k => formEdit.initValue[valueMap[k]] = item[k]);
        //formEdit.initValue = item.initValue || item;
        formEdit.prompt = ".";
      }

      var formEdit = $scope.formEdit = {
        title: "",
        items: [],

        setConfigItems: (items) => {
          formEdit.items = items.map(item => {
            return angular.merge({
              theme: 'ttb'
            }, item);
          })
        },

        /** 仅支持一次性提交，防止重复提交 */
        save: () => {
          if (formEdit.save.submiting) return;
          formEdit.save.submiting = true;
          if (!formEdit.valid) return formEdit.prompt = "数据输入不完整";
          var post = { type, value: formEdit.value };
          if ($scope.activeItem.id) {
            post.id = $scope.activeItem.id;
          }
          $http.post(formEdit.api, post).then(json => {
            formEdit.prompt = "提交成功.";
            formEdit.dirty = false;
            if ($scope.activeItem.id) {
              Object.keys(valueMap).map(k => $scope.activeItem[k] = formEdit.value[valueMap[k]]);
              calcuTitle($scope.activeItem);
              return;
            }
            if ($scope.activeItem === "添加") $timeout(() => {
              if (json.datas && json.datas.id) {
                var newItem = { id: json.datas.id };
                Object.keys(valueMap).map(k => newItem[k] = formEdit.value[valueMap[k]]);
                $scope.list.unshift(newItem);
                $scope.edit(newItem);
                calcuTitle(newItem);
                return;
              }
              formEdit.api = "";
              $scope.activeItem = false;
            }, 1200);
          }).catch(e => {
            console.error("提交失败", e);
            formEdit.prompt = e.errmsg || "提交失败";
          }).finally(e => {
            $timeout(() => { formEdit.save.submiting = false; }, 1200);
          })
        },
      }

    }]
  });
})(angular, window);
