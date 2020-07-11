/**
 * 动态表单组件
 * ver: 0.2.1
 * build: 2019-08-06
 * power by LJH.
 */
!(function (window, angular, undefined) {
  var theModule = angular.module('dform');

  function copyof(source) {
    if (!source || angular.isFunction(source) || !angular.isObject(source)) return source;
    return angular.merge(angular.isArray(source) ? [] : {}, source);
  }

  theModule.directive('dform', function () {
    return {
      restrict: 'A',
      // scope: {
      //   dform: '<',
      // },
      controller: ['$scope', '$timeout', function ($scope, $timeout) {

        var dformDefault = {
          fields: [],
          value: {},
          valids: {},
          dirtys: {},
          valid: false,
          dirty: false,
        };
        var dform = angular.merge({}, dformDefault)

        /**
         * 初始化数据的处理
         * 
         * @event dform.initValueChange
         *   向下广播
         *   携带 $id 以识别不同的表单
         *   该消息总是向下广播
         *   所以，凡是收到id不同的这种消息，就将其停止
         *   以保证自己的数据项不被上级表单影响
         * @event 收到后
         *   可监听 initValue
         *   可监听 initValue.field
         *   总是将数据返回，以数据事件 @event dform.itemValueChange 向上提交
         */
        var __dform_nitValue = {};
        $scope.$watch("dform.initValue", (vNew) => {
          if (angular.equals(__dform_nitValue, vNew)) return;
          __dform_nitValue = angular.merge({}, vNew);
          //console.log("数据初始化 1", vNew);
          $timeout(() => {
            //console.log("数据初始化 2", { id: $scope.$id }, vNew);
            $scope.$broadcast("dform.initValueChange", { id: $scope.$id, value: vNew });
            // console.log("数据初始化, 完成", vNew);
          });
        });
        $scope.$on("dform.initValueChange", (event, data) => {
          if (data.id != $scope.$id) {
            //console.log("别人的 数据初始化");
            event.preventDefault();
            // event.stopPropagation();
          }
        });
        $scope.$on("dform.setFields", (event, fields) => {
          ["value", "valids", "dirtys"].map(name => {
            Object.keys(dform[name]).map(k => {
              if (fields.indexOf(k) < 0) delete dform[name][k]
            });
          });
          dform.valid = !Object.keys(dform.valids).find(k => !dform.valids[k]);
          dform.dirty = !Object.keys(dform.dirtys).find(k => !dform.dirtys[k]);
          notifyFormValueTimer(dform);
        });

        /**
         * 数据事件处理
         * @event dform.itemValueChange 子组件值改变
         * @event dform.itemValidChange 子组件valid改变
         * @event dform.formvalue 向上通知，本表单的值改变
         */
        $scope.$on("dform.itemValueChange", (event, data) => {
          //console.log("收到 子组件值改变", data)
          // 限制本表单
          // event.preventDefault();
          dform.value[data.name] = data.value;
          dform.valids[data.name] = data.valid;
          dform.dirtys[data.name] = !data.valueIniting && data.dirty;
          dform.valid = !Object.keys(dform.valids).find(k => !dform.valids[k]);
          dform.dirty = Object.keys(dform.dirtys).find(k => dform.dirtys[k]);
          notifyFormValueTimer(dform);
        });
        $scope.$on("dform.itemValidChange", (event, data) => {
          //console.log("收到 子组件valid改变", data)
          // 限制本表单
          // event.preventDefault();
          dform.valids[data.name] = data.valid;
          dform.valid = !Object.keys(dform.valids).find(k => !dform.valids[k]);
          notifyFormValueTimer(dform);
        });
        /** 发送消息，防止多次发送 */
        function notifyFormValueTimer(dform) {
          var newData = {
            value: dform.value,
            valid: dform.valid,
            dirty: dform.dirty,
            valids: dform.valids,
            dirtys: dform.dirtys,
          }
          notifyFormValueTimer.lastData = angular.merge({}, newData);
          if (notifyFormValueTimer.timerId) return;// clearTimeout(notifyFormValueTimer.timerId);
          // console.log("延时通知", dform);
          notifyFormValueTimer.timerId = $timeout(() => {
            if (angular.equals(notifyFormValueTimer.lastData, notifyFormValueTimer.oldData)) return;
            $scope.$emit("dform.formvalue", { id: $scope.$id, form: notifyFormValueTimer.lastData });
            $scope.$broadcast("dform.parentvalue", { id: $scope.$id, form: notifyFormValueTimer.lastData });
            notifyFormValueTimer.oldData = angular.merge({}, notifyFormValueTimer.lastData);
            notifyFormValueTimer.timerId = 0;
            $scope.$apply();
          });
        }
      }]
    };
  });


  /**
   * 动态组件
   * 
   * 消息
   * @event dform.initValueChange 接收 初始化数据
   * @event dform.parentvalue 接收 整个表单中某值改变事件。子组件中仍有效。需要联动时，监听此事件
   * @event input.component.valueChange 接收 子组件上传数据
   * @event input.component.initValue 发送 向子组件发送初始化数据
   */
  theModule.directive('dformInput', function () {

    var Themes = [
      {
        name: "default",
        template: `{dform-input-input}`
      },
      {
        name: "ttb",
        template: `
          <div class="dform-input-item ttb">
            <div class="flex top">
              <div class="flex title">
                <div class="required">{dform-input-star}</div>
                <div class="prompt-text">{dform-input-title}</div>
              </div>
              <div class="prompt error">{dform-input-prompt}</div>
            </div>
            <div class="body {{dformInput.type||dformInput.component||''}} {{!valid&&'invalid'||''}}">{dform-input-input}</div>
          </div>`
      },
      {
        name: "show",
        template: `
          <div class="flex-left padding-v-1">
            <div class="prompt-text padding-h-1">{dform-input-title}</div>
            <div class="flex-1 body padding-h-1 {{dformInput.type||dformInput.component||''}} {{!valid&&'invalid'||''}}">{dform-input-input}</div>
          </div>`
      },
      {
        name: "show-data",
        template: `
          <div class="flex-left padding-v-1">
            <div class="flex-1 body padding-h-1 {{dformInput.type||dformInput.component||''}} {{!valid&&'invalid'||''}}">{dform-input-input}</div>
          </div>`
      },
    ];
    var starTemplate = "{{invalidInfo.required && '*' || ''}}";
    var titleTemplate = "{{dformInput.title || '无标题'}}";
    var promptTemplate = "{{invalidInfo.prompt || ''}}";
    var CDform = {
      getTemplate: function (dformInput) {
        if (dformInput.template) return dformInput.template;
        var component = dformInput.component;
        if (component) return `<${component.name || component} config="dformInput" class="${component.css || component.name || component}"></${component.name || component}>`;

        var type = dformInput.type || "input";
        if (!angular.isFunction(CDform[type])) return CDform.input();
        return CDform[type](dformInput);
      },

      /**
       * 检查字段的无效信息
       * @param {Object} dformInput 字段配置
       * @param {any} value 字段值
       * @return {{valid:boolean,required:boolean,prompt:String}} 错误提示
       */
      getInvalid: function (dformInput, value) {

        var config = {
          valid: dformInput.param && dformInput.param.valid || dformInput.valid || {},
          invalid: angular.extend({ required: "required" }, dformInput.invalid, dformInput.param && dformInput.param.invalid)
        }

        if (config.valid.minLength) config.valid.minlength = config.valid.minlength || config.valid.minLength; // 允许名字兼容
        if (config.valid.maxLength) config.valid.maxlength = config.valid.maxlength || config.valid.maxLength; // 允许名字兼容

        /** 先假定数据有效，然后再验证 */
        var R = {
          valid: true,
          required: config.valid.required,
          prompt: ""
        }
        /** 开始验证 */
        if (!value && value !== 0) {
          if (config.valid.required) {
            R.valid = false;
            R.prompt = config.invalid.required || "";
            return R;
          }
          // 不要求输入，且值为空，就不检查了
          return R;
        }

        if (config.valid.pattern) {
          if (!(config.valid.pattern instanceof RegExp)) {
            config.valid.pattern = new RegExp(config.valid.pattern);
          }
          if (!config.valid.pattern.test(value)) {
            R.valid = false;
            R.prompt = config.invalid.pattern || "";
            return R;
          }
        }
        if (config.valid.max) {
          var not_number = typeof (value) == "object" || Number.isNaN(Number(value));
          var error = not_number || +value > config.valid.max;
          if (error) {
            R.valid = false;
            R.prompt = (not_number ? config.invalid.number : config.invalid.max) || "";
            return R;
          }
        }
        if (config.valid.min) {
          var not_number = typeof (value) == "object" || Number.isNaN(Number(value));
          var error = not_number || +value < config.valid.min;
          if (error) {
            R.valid = false;
            R.prompt = (not_number ? config.invalid.number : config.invalid.min) || "";
            return R;
          }
        }
        if (config.valid.maxlength) {
          var v = value || '';
          var error = !v.hasOwnProperty('length') || v.length > config.valid.maxlength;
          if (error) {
            R.valid = false;
            R.prompt = config.invalid.maxlength || "";
            return R;
          }
        }
        if (config.valid.minlength) {
          var v = value || '';
          var error = !v.hasOwnProperty('length') || v.length < config.valid.minlength;
          if (error) {
            R.valid = false;
            R.prompt = config.invalid.minlength || "";
            return R;
          }
        }
        return R;
      },

      input: function (dformInput) {
        var template = `<input ng-model="value">`;
        var templateShow = `<div>{{value}}</div>`;
        return dformInput && dformInput.mode == "show" && templateShow || template;
      },

      "array": function (dformInput) {
        // console.log("数组输入", dformInput)
        return `<dform-array class="" init-value="value" config="dformInput" mode="{{dformInput.mode}}"></dform-array>`;
      },

      date: function (dformInput) {
        var template = `<dform-date str="value" config="dformInput"></dform-date>`;
        var templateShow = `<div>{{value}}</div>`;
        return dformInput.mode == "show" && templateShow || template;
      },

      number: function (dformInput) {
        if (dformInput.mode == "show") return `<div>{{value}}</div>`;

        var template = `<input type="number" pattern="[0-9\.-]*" ng-model="number">`;
        function link(dformInput, $scope, $http, $q, $element, $compile) {
          $scope.$on("input.component.initValue", (event, data) => {
            $scope.number = +data.value || 0;
          });
          $scope.$watch("number", function (vNew, vOld) {
            $scope.value = vNew;
          });
        }
        return { template, link };
      },

      textarea: function (dformInput) {
        if (dformInput.mode == "show") return `<div>{{value}}</div>`;
        var template = `<textarea ng-model="value"></textarea>`;
        return template;
      },

      imgs: function (dformInput) {
        var template = `<dform-imgs class="padding-v-1" imgs="value" mode="{{dformInput.mode}}"></dform-imgs>`;
        return template;
      },

      tags: function (dformInput) {
        // console.log("标签组件", dformInput)
        return `<dform-tags class="padding-v-1" tags="value" config="dformInput" mode="{{dformInput.mode}}"></dform-tags>`;
      },

      dropdown: function (dformInput) {
        if (dformInput.mode == "show") {
          var template = `<div>{{item.value||item}}</div>`;
          function link(dformInput, $scope, $http, $q, $element, $compile) {
            initDropdownList(dformInput, $http, $q).then(list => {
              $scope.list = $scope.list_full = list;
            });
            $scope.$watch("value", vNew => {
              $scope.item = ($scope.list || []).find(item => item == vNew || item.value == vNew)
            })
          }
          return { template, link };
        }
        var template = `
          <select class="" ng-model="value"">
            <option value=""></option>
            <option ng-repeat="item in list track by $index" value="{{item.value||item}}">{{item.title||item.value||item}}</option>
          </select>
        `;
        function link(dformInput, $scope, $http, $q, $element, $compile) {
          initDropdownList(dformInput, $http, $q).then(list => {
            $scope.list = $scope.list_full = list;
          });
        }
        return { template, link };
      },

    }

    /**
     * 初始化下拉列表
     * @param {*} param 要初始化列表的参数
     */
    function initDropdownList(dformInput, $http, $q) {
      var list = dformInput.list || dformInput.param && dformInput.param.list;
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

    return {
      restrict: 'A',
      scope: {
        dformInput: '<',
      },
      controller: ["$scope", "$element", "$http", "$q", "$compile", "$timeout", function ($scope, $element, $http, $q, $compile, $timeout) {

        setTimeout(() => {
          ["input", "textarea", "select"].map(name => {
            var obj = $element[0].querySelector(name);
            obj && obj.addEventListener('blur', iosOnBlur);
          })
        });

        function iosOnBlur() {
          console.log("blur", event);
          setTimeout(function () {
            var scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0;
            window.scrollTo(0, Math.max(scrollHeight - 1, 0));
          }, 100)

        }



        var dformInput = {};
        $scope.$watch("dformInput", function (vNew) {
          // console.log("dformInput", dformInput, vNew)
          if (angular.equals(dformInput, vNew)) return;
          //dformInput = $scope.dformInput = angular.extend({}, vNew);
          dformInput = $scope.dformInput = vNew;
          //var inputTemplate = CDform.getTemplate(dformInput);
          $q.when(CDform.getTemplate(dformInput)).then(inputTemplate => {
            if (angular.isObject(inputTemplate) && angular.isFunction(inputTemplate.link)) inputTemplate.link(dformInput, $scope, $http, $q, $element, $compile);
            var theme = Themes.find(item => item.name == dformInput.theme) || Themes[0];
            var template = theme.template;
            template = template.replace(/\{dform-input-input\}/g, inputTemplate.template || inputTemplate);
            template = template.replace(/\{dform-input-star\}/g, starTemplate);
            template = template.replace(/\{dform-input-title\}/g, titleTemplate);
            template = template.replace(/\{dform-input-prompt\}/g, promptTemplate);
            $element.html(template);
            $compile($element.contents())($scope);
          });
        });

        /**
         * @event dform.itemFiledNameConfirm 收到通知, 要求核对表单字段
         */
        $scope.$on("dform.itemFiledNameConfirm", (event, data) => {
          data.fields.push(dformInput.name);
        });

        $scope.$on("dform.initValueChange", (event, data) => {
          //console.log("值改变1", data);
          if (!data.value || !data.value.hasOwnProperty(dformInput.name)) return;
          $timeout(() => {
            $scope.value = copyof(data.value[dformInput.name]);
            //console.log("值改变", $scope.value);
            $scope.$broadcast("input.component.initValue", { value: $scope.value, initValueChange: true });
          })
        });

        //$scope.value = "";
        var valueIniting = true;
        $timeout(() => { valueIniting = false }, 100);
        $scope.valid = true;
        $timeout(() => {
          $scope.invalidInfo = CDform.getInvalid(dformInput, $scope.value);
          $scope.valid = $scope.invalidInfo.valid;
          $scope.$emit("dform.itemValidChange", {
            name: dformInput.name,
            valid: $scope.valid,
            dirty: false,
          });
          $scope.$watch("value", function (vNew, vOld) {
            if (vNew === undefined || vNew === null) {
              if (vOld === undefined || vOld === null) return;
            }
            $scope.invalidInfo = CDform.getInvalid(dformInput, vNew);
            $scope.valid = $scope.invalidInfo.valid;
            // console.log("字段值改变", dformInput.name, "=", vNew)
            $scope.$emit("dform.itemValueChange", {
              name: dformInput.name,
              value: vNew,
              valid: $scope.valid,
              dirty: !valueIniting,
            });
          });
        });

        $scope.$on("input.component.valueChange", (event, data) => {
          // console.log("dform 收到二维码", event.targetScope.$id, data)
          $scope.value = copyof(data.value);
          event.preventDefault();
          event.stopPropagation();
        });


        /**
         * 需要联动时，在此增加代码
         */
        $scope.$on("dform.parentvalue", (event, data) => {
        });

      }]
    };
  });



  /**
   * 动态表单封装
   */
  theModule.directive('dformForm', function () {

    return {
      restrict: 'A',
      scope: {
        dformForm: '<',
      },
      template: `
        <div dform></div>
        <div dform-input="item" ng-repeat="item in items track by $index"></div>`,
      controller: ["$scope", "$element", "$http", "$q", "$compile", "$timeout", function ($scope, $element, $http, $q, $compile, $timeout) {

        $scope.$watch("dformForm.items", vNew => {
          $scope.items = vNew || [];
          $scope.items.map(item => item.theme = item.theme || $scope.dformForm.theme || "ttb");
          /** 有时，表单配置比较晚兑现，这时，要重新初始化数据 */
          $scope.dform.initValue = copyof($scope.dform.initValue);
          $timeout(() => {
            $scope.$broadcast("dform.initValueChange", { id: $scope.$id, value: $scope.dform.initValue });
          });
        });


        $scope.dform = {};
        $scope.$watch("dformForm.initValue", vNew => {
          $scope.dform.initValue = vNew;
          $timeout(() => {
            $scope.$broadcast("dform.initValueChange", { id: $scope.$id, value: vNew });
          });
        });

        var valueIniting = true;
        $timeout(() => { valueIniting = false }, 100);
        $scope.$on("dform.formvalue", (event, data) => {
          $scope.dformForm.value = data.form.value;
          $scope.dformForm.valid = data.form.valid;
          $scope.dformForm.dirty = data.form.dirty;
          $scope.dformForm.onFormValue && $scope.dformForm.onFormValue(angular.extend({}, data, { valueIniting }));
          // console.log("动态表单封装 dform.formvalue", data)
        });
        $scope.$on("dform.itemValueChange", (event, data) => {
          $timeout(() => $scope.dformForm.onItemValueChange && $scope.dformForm.onItemValueChange(angular.extend({}, data, { valueIniting })), 100);
          //$scope.dformForm.onItemValueChange && $scope.dformForm.onItemValueChange(angular.extend({}, data, { valueIniting }));
        });

      }]
    };
  });


})(window, angular);