

!(function (angular, window, undefined) {
  var theModule = angular.module("dj-form-v2");


  function copyof(source) {
    if (!source || angular.isFunction(source) || !angular.isObject(source)) return source;
    return angular.merge(angular.isArray(source) ? [] : {}, source);
  }

  /**
   * 初始化下拉列表
   * @param {*} param 要初始化列表的参数
   */
  function getListByConfig(config, $http, $q) {
    var list = config.list || config.param && config.param.list;
    return getList(list, $http, $q);
  }
  function getList(list, $http, $q) {
    //console.log('获取下拉列表, param =', param);
    if (!list) return $q.when([]);
    if (angular.isFunction(list)) {
      return $q.when(list());
    }
    if (angular.isString(list)) {
      return $http.post(`下拉列表-${list}`).then(json => {
        return $q.when(json.list || json.datas.list);
      }).catch(e => {
        return $http.post('获取下拉列表', list).then(json => {
          //console.log('获取下拉列表, json =', json);
          return $q.when(json.list || json.datas.list);
        }).catch(e => {
          console.log("获取下拉列表（" + json.list + "）, 失败: ", e);
          return $q.reject([]);
        })
      })
    }
    return $q.when(list);
  }


  var item_template = {
    input: function () {
      return `
        <input ng-model="R.ngModel" ng-if="R.mode=='edit'">
        <span ng-if="R.mode=='show'">{{R.ngModel}}</span>
      `;
    },
    text: function () {
      return `<span>{{config.text}}</span>`;
    },
    autoindex: function () {
      return `<span>{{params.$index}}</span>`;
    },
    calcu: function () {
      return `<span>{{config.express.calcu({$$:[config.params,params]})}}</span>`;
    },

    date: function () {
      function link($scope, $http, $q, $element, $compile, $timeout) {
        var oldValue = {};
        $scope.date = new Date;

        $scope.$watch("R.ngModel", (vNew, vOld) => {
          vNew = vNew || "";
          console.log("日期变化", vNew, vOld)
          if (angular.equals(vNew, oldValue)) return;
          oldValue = vNew;
          $scope.date = new Date(Date.parse(vNew.replace(/-/g, "/")));
        });

        $scope.on_change = (date) => {
          var ms = +date || "";
          $scope.R.ngModel = new Date(ms).format("yyyy-MM-dd") || "";
        };
      }
      return {
        link,
        template: `
          <input type="date" ng-model="date" ng-change="on_change(date)" ng-if="R.mode=='edit'">
          <span ng-if="R.mode=='show'">{{R.ngModel}}</span>
        `,
      };
    },

    number: function () {
      function link($scope, $http, $q, $element, $compile) {
        $scope.$watch("ngModel", (vNew, vOld) => {
          if (angular.equals(vNew, vOld)) return;
          var n = +vNew;
          if (isNaN(n)) {
            n = "";
          }
          $scope.ngModel = n;
        });
      }
      return {
        link,
        template: `
          <input type="number" pattern="[0-9\.-]*" ng-model="R.ngModel" ng-if="R.mode=='edit'">
          <span ng-if="R.mode=='show'">{{R.ngModel}}</span>
        `,
      };
    },

    textarea: function () {
      return `
        <textarea ng-model="R.ngModel" ng-if="R.mode=='edit'"></textarea>
        <span ng-if="R.mode=='show'">{{R.ngModel}}</span>
      `;
    },

    imgs: function () {
      var template = `<dform-imgs class="padding-v-1" imgs="ngModel" mode="{{dformInput.mode}}"></dform-imgs>`;
      return template;
    },

    tags: function () {
      // console.log("标签组件", dformInput)
      return {
        template: `
          <div class="box flex flex-left flex-wrap">
            <div class="flex dform-tags-item {{item.selected&&'selected'||''}}" ng-click="clickItem(item)" ng-repeat="item in list track by $index">
              <i class="fa fa-{{item.selected&&'check-square-o'||'square-o'}}"></i>
              <div class="text">{{item.text}}</div>
            </div>
          </div>`,
        link: function ($scope, $http, $q, $element, $compile, $timeout) {
          $scope.list = []

          $scope.$watch("config.list", listParam => {
            getList(listParam, $http, $q).then(list => {
              // console.log("标签组件 list=", list, config)
              $scope.list = list.filter(a => a || a === 0).map(item => ({ text: item.title || item }));
              setSelected();
            });
          });

          $scope.$watch("R.ngModel", vNew => {
            $scope.value = angular.merge([], vNew);
            setSelected();
          });

          function setSelected() {
            var ngModel = angular.extend([], $scope.R.ngModel);
            $scope.list.map(item => {
              item.selected = ngModel.indexOf(item.text) >= 0
            })
          }

          $scope.clickItem = item => {
            if ($scope.R.mode == "show") return;
            item.selected = !item.selected;
            $scope.R.ngModel = $scope.list.filter(item => item.selected).map(item => item.text);
          }
        },
      };
    },

    yn: function () {
      // console.log("标签组件", dformInput)
      return `<dform-yn class="padding-v-1" yn="ngModel" config="dformInput" mode="{{dformInput.mode}}"></dform-yn>`;
    },

    combo: function () {
      // console.log("标签组件", )
      return `<dform-combo class="padding-v-1" config="dformInput" mode="{{dformInput.mode}}"></dform-combo>`;
    },

    dropdown: function () {
      function link($scope, $http, $q, $element, $compile) {
        $scope.$watch("config", config => {
          getListByConfig(config, $http, $q).then(list => {
            $scope.list = $scope.list_full = list;
            selectValue();
          });
        });

        $scope.value = "";
        $scope.$watch("R.ngModel", vNew => {
          $scope.value = vNew;
          selectValue();
        });

        $scope.on_change = (value) => {
          $scope.R.ngModel = value;
        };

        function selectValue() {
          $scope.active_item = ($scope.list || []).find(item => item == $scope.R.ngModel || item.value == $scope.R.ngModel)
        }
      }
      return {
        link,
        template: `
          <select class="" ng-model="value" ng-change="on_change(value)" ng-if="R.mode=='edit'">
            <option value=""></option>
            <option ng-repeat="item in list track by $index" value="{{item.value||item}}">{{item.title||item.value||item}}</option>
          </select>
          <span ng-if="R.mode=='show'">{{active_item.title||active_item.value||active_item}}</span>
        `,
      };
    },
  }

  /**
   * 动态组件
   */
  theModule.directive('djItem', function () {

    return {
      restrict: 'AE',
      replace: true,
      scope: {
        ngModel: '=',
        ngChange: '&',
        config: '<',
        params: '<',
        mode: '@',
      },
      // require: '?ngModel', // 此指令所代替的函数
      controller: ["$scope", "$element", "$http", "$q", "$compile", "$timeout", function ($scope, $element, $http, $q, $compile, $timeout) {

        /**
         * 解决 iOS 键盘弹出后错位问题
         */
        !(function () {
          setTimeout(() => {
            ["input", "textarea", "select"].map(name => {
              var obj = $element[0].querySelector(name);
              obj && obj.addEventListener('blur', iosOnBlur);
            })
          });
          function iosOnBlur() {
            // console.log("blur", event);
            setTimeout(function () {
              var scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0;
              window.scrollTo(0, Math.max(scrollHeight - 1, 0));
            }, 100);
          }
        })();

        var R = $scope.R = {
          ngModel: "",
          config: "",
          params: "",
          mode: "none",

          calcu_mode: () => {
            R.mode = !$scope.config && "none" || ($scope.mode == "show" || $scope.config.readonly) && "show" || "edit";
          },
        };

        $scope.$watch("config", R.calcu_mode);
        $scope.$watch("mode", R.calcu_mode);

        $scope.$watch("config.type", function (config_type) {
          if (!config_type) return;
          var fn_template = item_template[config_type] || item_template.input;
          R.result = $q.when(fn_template()).then(result => {
            R.result = result;
            if (angular.isObject(result) && angular.isFunction(result.link)) {
              result.link($scope, $http, $q, $element, $compile, $timeout);
            }
            //$timeout(() => {
              var template = result.template || result;
              if (angular.isFunction(template)) template = template($scope, $http, $q);
              $q.when(template).then(template => {
                $element.html(template);
                $compile($element.contents())($scope);
              });
            //});
          });
        });

        /** 数据绑定中继 */
        $scope.$watch("ngModel", (vNew, vOld) => {
          if (angular.equals(vNew, R.ngModel)) return;
          R.ngModel = copyof(vNew);
          $scope.ngChange && $scope.ngChange({ $value: vNew });
        });

        $scope.$watch("R.ngModel", (vNew, vOld) => {
          if (angular.equals(vNew, $scope.ngModel)) return;
          $scope.ngModel = copyof(vNew);
        });

      }]
    };
  });

})(angular, window);