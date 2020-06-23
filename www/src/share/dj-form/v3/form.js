!(function (angular, window, undefined) {
  var theModule = angular.module("dj-form-v3");

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
      return `<span>{{params[0].$index}}</span>`;
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
      var template = `<dform3-imgs class="padding-v-1" imgs="R.ngModel" on-change="onChange(imgs)" mode="{{config.mode}}"></dform3-imgs>`;
      function link($scope, $http, $q, $element, $compile, $timeout) {
        $scope.onChange = imgs => {
          $scope.R.ngModel = imgs;
        }
      }
      return {
        link,
        template
      };
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
      var template = `
      <div class="dform3-yn flex flex-left {{R.ngModel&&'yes'||'no'}}" ng-click="toggle()">
        <div class="top flex-cc">{{list[R.ngModel&&1||0]}}</div>
      </div>`;
      function link($scope, $http, $q, $element, $compile, $timeout) {
        $scope.list = ["否", "是",];

        $scope.toggle = () => {
          if ($scope.R.mode == "show") return;
          $scope.R.ngModel = $scope.R.ngModel ? "" : 1
        }
      }
      return {
        link,
        template
      };
    },

    combo: function () {
      var template = `
        <div class="info flex-1 flex-v-center cc">
          <input class="flex-1" ng-model="filterText" ng-change="filterChange()" ng-blur="blur($event)" ng-show="listShowing">
          <div class="text flex-1 flex-v-center {{textOfValue&&'text-0'||'text-c'}}"  ng-click="clickText(1)" ng-show="!listShowing">{{textOfValue||'未输入'}}</div>
        </div>
        <div class="caret flex-cc"  ng-click="clickCaret()" ng-if="config.mode!='show'"><i class="fa fa-caret-down"></i></div>
        <div class="list" ng-if="listShowing">
          <div class="bb-eee {{(item==value||item.title==value||item.value==value)&&'active'||''}}" ng-click="selectItem(item)" ng-repeat="item in list|filter:(config.showFilter&&filterText||'') track by $index">{{item.title||item.value}}</div>
          <div class="{{!value&&'active'||''}}" ng-click="selectItem('')"></div>
        </div>
        <div class="back" ng-click="clickBack()" ng-if="listShowing"></div>`;
      function link($scope, $http, $q, $element, $compile, $timeout) {
        $element.addClass("flex flex-stretch flex-v-center dform-combo-dropdown");

        var ajaxList = [];
        $scope.$watch("config", config => {
          ajaxList = getListByConfig(config, $http, $q).then(list => {
            return ajaxList = $scope.list = list.filter(a => a || a === 0).map(item => {
              if (!angular.isObject(item)) return { title: "" + item, value: "" + item };
              return item;
            });
          });
        });
        /** 过滤器 */
        $scope.filterText = "";

        /** 列表显示隐藏控制 */
        $scope.listShowing = false;
        var showList = $scope.showList = (bShow) => {
          $scope.listShowing = bShow;
        }
        $scope.clickBack = function () {
          $timeout(() => { showList(false); });
        }
        $scope.clickCaret = function () {
          if (showList.running) return;
          showList(!$scope.listShowing);
        }
        $scope.clickText = function () {
          if ($scope.config.mode == "show") return;
          showList(true);
          setTimeout(() => { $element.children().eq(0).children().eq(0)[0].focus(); });
        }
        $scope.filterChange = function (value) {
          showList(true);
          $scope.value = $scope.filterText || "";
        }


        /** 值处理 */
        $scope.value = "";
        /** 监听初始化 */
        $scope.$watch("R.ngModel", vNew => {
          $scope.value = vNew;
        });
        /** 监听用户修改 */
        $scope.selectItem = function (item) {
          $scope.value = item && item.title || item.value|| item || "";
          showList(false);
        }

        /** 值显示 */
        $scope.$watch("value", (vNew, vOld) => {
          $scope.R.ngModel = vNew;
          $scope.textOfValue = vNew || "";
          $scope.filterText = vNew || "";
        });
      }
      return {
        link,
        template
      };
    },

    "dj-dropdown": function () {
      var template = `
        <div class="info flex-1 flex-v">
          <input class="flex-1" ng-model="filterText" ng-change="filterChange()" ng-blur="blur($event)" ng-show="listShowing">
          <div class="text flex-1 flex-v-center {{textOfValue&&'text-0'||'text-c'}}"  ng-click="clickText(1)" ng-show="!listShowing">{{textOfValue||'未选择'}}</div>
        </div>
        <div class="caret flex-cc"  ng-click="clickCaret()" ng-if="config.mode!='show'"><i class="fa fa-caret-down"></i></div>
        <div class="list" ng-if="listShowing">
          <div class="bb-eee {{item.value==value&&'active'||''}}" ng-click="selectItem(item)" ng-repeat="item in list|filter:filterText track by $index">{{item.title||item.value}}</div>
          <div class="{{!value&&'active'||''}}" ng-click="selectItem({})"></div>
        </div>
        <div class="back" ng-click="clickBack()" ng-if="listShowing"></div>`;
      function link($scope, $http, $q, $element, $compile, $timeout) {
        $element.addClass("flex flex-stretch flex-v-center dform-combo-dropdown");

        var ajaxList = [];
        $scope.$watch("config", config => {
          // console.log("config=", config)
          ajaxList = getListByConfig(config, $http, $q).then(list => {
            return ajaxList = $scope.list = list.filter(a => a || a === 0).map(item => {
              if (!angular.isObject(item)) return { title: "" + item, value: "" + item, json: "" + item };
              return item;
            });
          });
        });


        /** 过滤器 */
        var filterText = $scope.filterText = "";

        /** 列表显示隐藏控制 */
        $scope.listShowing = false;
        var showList = $scope.showList = (bShow) => {
          $scope.listShowing = bShow;
        }
        $scope.clickBack = function () {
          $timeout(() => { showList(false); });
        }
        $scope.clickCaret = function () {
          if (showList.running) return;
          showList(!$scope.listShowing);
        }
        $scope.clickText = function () {
          if ($scope.config.mode == "show") return;
          showList(true);
          setTimeout(() => { $element.children().eq(0).children().eq(0)[0].focus(); });
        }
        $scope.filterChange = function () {
          showList(true)
        }

        /** 值处理 */
        $scope.value = "";
        /** 监听初始化 */
        $scope.$watch("R.ngModel", vNew => {
          $scope.value = vNew;
        });
        /** 监听用户修改 */
        $scope.selectItem = function (item) {
          $scope.value = item && item.value || "";
          showList(false);
        }

        /** 值显示 */
        $scope.$watch("value", (vNew, vOld) => {
          $scope.R.ngModel = vNew;
          $q.when(ajaxList).then(list => {
            var item = (list || []).find(item => item.value == vNew) || {};
            $scope.textOfValue = item.title || item.value || "";
          })
        });
      }
      return {
        link,
        template
      };
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
  function directive_djItem() {

    return {
      restrict: 'AE',
      scope: {
        ngModel: '=',
        ngChange: '&',
        config: '<',
        params: '<',
        mode: '@',
      },
      // require: '?ngModel', // 此指令所代替的函数
      controller: ["$scope", "$element", "$http", "$q", "$compile", "$timeout", function ($scope, $element, $http, $q, $compile, $timeout) {

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
          $scope.$emit("dj-item.valueChange", { config: $scope.config, value: vNew });
        });

      }]
    };
  }
  theModule.directive('djItem', directive_djItem);
  theModule.directive('dform3Item', directive_djItem);


  /**
   * 动态组件
   */
  theModule.component("djCaptions", {
    template: `
    <div class="caption {{caption.css||'flex'}}" ng-repeat="(nth_caption,caption) in captions track by $index" ng-switch="caption.type" on-finish-render>
      <dj-item ng-switch-when="row"
        config="cell"
        mode="{{$ctrl.mode||bindParams.mode}}"
        params="bindParams.calcuParams"
        ng-model="bindParams.value[cell.model]"
        class="{{bindParams.item_css||''}} {{cell.css||'flex-cc padding-v-1'}}"
        ng-repeat="cell in caption.cells track by $index"
      ></dj-item>
      <dj-caption-table ng-switch-when="table"
        mode="{{$ctrl.mode||bindParams.mode}}"
        bind-caption="caption"
        bind-params="bindParams"
        class="flex-v {{bindParams.item_css||caption.css||''}}"
      ></dj-caption-table>
    </div>
    `,
    bindings: {
      bindParams: '<',
      mode: '@',
    },
    controller: ["$scope", "$element", "$http", "$q", "$compile", "$timeout", function ($scope, $element, $http, $q, $compile, $timeout) {
      this.$onChanges = (changes) => {
        if (changes.bindParams && changes.bindParams.currentValue) {
          var bindParams = $scope.bindParams = changes.bindParams.currentValue || {};
        }
      }

      /** 查找配置中的计算项，生成表达式 */
      $scope.$watch("bindParams.config.captions", vNew => initExpress($scope.captions = vNew));
      function initExpress(captions) {
        captions.map(caption => {
          if (angular.isArray(caption.cells)) {
            caption.cells.filter(cell => cell.type == "calcu").map(cell => cell.express = angular.Express.parse(cell.text));
          }
        })
      }

      $scope.$on("dj-item.valueChange", (event, data) => {
        $scope.bindParams.dirty = true;
        $scope.bindParams.$on_item_change && $scope.bindParams.$on_item_change(data);
      });
      $scope.$on("ngRepeatFinished", event => {
        // console.log("ngRepeatFinished", event);
      });

    }]
  });


  /** 显示任务 - 组件 */
  theModule.component("djCaptionTable", {
    template: `
      <table class="dj-caption-table" >
        <tr class="bk-d b-900">
          <td class="center padding-v-1 w-em{{col.w}}" ng-repeat="col in caption.cols track by $index">{{col.title}}</td>
        </tr>
        <tr class="{{mode=='show'&&'bk-e'||active_row==$index&&'bk-info'||'bk-e'}}" ng-repeat="(nRow,row) in bindValue track by $index" ng-click="click_row($index)">
          <td style="width:{{col_w_100[nCol]}}%" col="{{nCol}}" class="{{col.td_css||'center'}}" ng-repeat="(nCol, col) in caption.cols track by $index">
            <dj-item
              config="col"
              mode="{{caption.readonly&&'show'|| mode}}"
              params="[{row:row, $index:nRow+1}]"
              ng-model="row[col.model]"
              class="{{col.item_css||'flex'}} {{bindParams.item_css_caption_cell||'caption-cell'}}"
            ></dj-item>
          </td>
        </tr>
        <tr class="bk-f" ng-if="!caption.readonly&&mode=='edit'">
          <td colspan="{{caption.cols.length}}">
            <div class="flex-left" >
              <div class="padding-h-3 padding-v-1 b-900 text-active" ng-click="insert_row()" ng-if="active_row>=0">{{'插入一行'}}</div>
              <div class="padding-h-3 padding-v-1 b-900 text-active" ng-click="remove_row()" ng-if="active_row>=0">{{'删除当前行'}}</div>
              <div class="padding-h-3 padding-v-1 b-900 text-active" ng-click="clean_rows()">{{'清除空行'}}</div>
              <div class="padding-h-3 padding-v-1 b-900 text-active" ng-click="append_row()">{{'添加一行'}}</div>
            </div>
          </td>
        </tr>
        <tr class="bk-d" ng-if="caption.sum">
          <td colspan=2 class="center b-900 padding-1">合计</td>
          <td class="{{col.css||'center'}}" ng-if="$index>=2" auto-sum="col.sum&&('td[col=\\''+nCol+'\\']')" ng-repeat="(nCol, col) in caption.cols track by $index">
          </td>
        </tr>
      </table>`,
    bindings: {
      mode: '@',
      bindParams: '<',
      bindCaption: "<",
    },
    controller: ["$scope", "$rootScope", "$http", "$q", "DjRouter", "DjState", function ctrl($scope, $rootScope, $http, $q, DjRouter, DjState) {

      this.$onChanges = (changes) => {
        if (changes.bindParams && changes.bindParams.currentValue) {
          $scope.bindParams = changes.bindParams.currentValue || {};
          initCaptionDatas();
        }
        if (changes.bindCaption && changes.bindCaption.currentValue) {
          $scope.caption = changes.bindCaption.currentValue || {};
          initCaptionDatas()
        }
        if (changes.mode) {
          $scope.mode = changes.mode.currentValue || "edit";
        };
      };

      $scope.$watch("bindParams.value", initCaptionDatas);
      $scope.$watch("caption.cols", initCaptionDatas);

      function initCaptionDatas() {
        if (!$scope.bindParams || !$scope.caption) return;
        $scope.active_row = -1;
        $scope.bindParams.value = $scope.bindParams.value || {};
        if (!angular.isArray($scope.bindParams.value[$scope.caption.model])) $scope.bindParams.value[$scope.caption.model] = [];
        $scope.bindValue = $scope.bindParams.value[$scope.caption.model];
        var totle_w = $scope.caption.cols.reduce((totle, item) => totle + (+item.w || 1), 0) / 100;
        $scope.col_w_100 = $scope.caption.cols.map(item => item.w / totle_w);
      }

      $scope.active_row = -1;
      $scope.click_row = (index) => {
        if ($scope.mode != "edit") return;
        $scope.active_row = index;
      }
      $scope.remove_row = () => {
        if ($scope.active_row < 0) return;
        $scope.bindValue.splice($scope.active_row, 1);
        $scope.active_row = -1;
        emitValue();
      }
      $scope.insert_row = () => {
        $scope.bindValue.splice($scope.active_row + 1, 0, {});
        $scope.active_row = $scope.active_row + 1;
        emitValue();
      }
      $scope.append_row = () => {
        $scope.bindValue.push({});
        $scope.active_row = -1;
        emitValue();
      }
      $scope.clean_rows = () => {
        $scope.active_row = -1;
        var good_values = $scope.bindValue.filter(row => {
          if (!angular.isObject(row)) return false;
          return Object.keys(row).find(k => !!row[k]);
        });
        $scope.bindValue.length = 0;
        angular.extend($scope.bindValue, good_values);
        emitValue();
      }


      $scope.$on("dj-item.valueChange", (event, data) => {
        if (data.config == $scope.caption) return;
        event.preventDefault();
        event.stopPropagation();
        emitValue();
      });
      function emitValue() {
        $scope.bindValue.map((item, i) => {
          $scope.bindValue[i] = angular.extend({}, $scope.bindValue[i]); // 防止出现空行时，这行为空数组 Array, 而不是 Object
        })
        $scope.$emit("dj-item.valueChange", { config: $scope.caption, value: $scope.bindValue });
      }


    }]
  });

})(angular, window);