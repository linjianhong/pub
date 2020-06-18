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


  /**
   * 动态组件
   * 
   * 消息
   * @event dform.initValueChange 接收 初始化数据
   * @event dform.parentvalue 接收 整个表单中某值改变事件。子组件中仍有效。需要联动时，监听此事件
   * @event input.component.valueChange 接收 子组件上传数据
   * @event input.component.initValue 发送 向子组件发送初始化数据
   */
  theModule.directive('dformInput2', function () {

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
        name: "edit-line",
        template: `
          <div class="flex-left dform-input-item edit-line padding-v-1">
            <div class="prompt-text padding-h-1">{dform-input-title}</div>
            <div class="flex-1 body padding-h-1 {{dformInput.type||dformInput.component||''}} {{!valid&&'invalid'||''}}">{dform-input-input}</div>
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

        var template = `<input type="number" pattern="[0-9\.-]*" ng-model="value">`;
        function link(dformInput, $scope, $http, $q, $element, $compile) {
          $scope.$on("input.component.initValue", (event, data) => {
            $scope.value = +data.value || 0;
          });
          $scope.$watch("value", (vNew) => {
            $scope.value = +vNew || 0;
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

      yn: function (dformInput) {
        // console.log("标签组件", dformInput)
        return `<dform-yn class="padding-v-1" yn="value" config="dformInput" mode="{{dformInput.mode}}"></dform-yn>`;
      },

      combo: function (dformInput) {
        // console.log("标签组件", dformInput)
        return `<dform-combo class="padding-v-1" config="dformInput" mode="{{dformInput.mode}}"></dform-combo>`;
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
        dformInput2: '<',
      },
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

        var formObjectItem;
        $scope.$watch("dformInput2", function (vNew) {
          //console.log("dformInput", dformInput, vNew)
          if (angular.equals(formObjectItem, vNew)) return;
          formObjectItem = $scope.formObjectItem = vNew;
          $element.html("");
          if (!(formObjectItem instanceof CDformObjectItem)) return;
          var config = $scope.dformInput = formObjectItem.config;
          $scope.datas = formObjectItem.datas;

          $q.when(CDform.getTemplate(config)).then(inputTemplate => {
            if (angular.isObject(inputTemplate) && angular.isFunction(inputTemplate.link)) inputTemplate.link(config, $scope, $http, $q, $element, $compile);
            var theme = Themes.find(item => item.name == config.theme) || Themes[0];
            var template = theme.template;
            template = template.replace(/\{dform-input-input\}/g, inputTemplate.template || inputTemplate);
            template = template.replace(/\{dform-input-star\}/g, starTemplate);
            template = template.replace(/\{dform-input-title\}/g, titleTemplate);
            template = template.replace(/\{dform-input-prompt\}/g, promptTemplate);
            $element.html(template);
            $compile($element.contents())($scope);
          });
        });

        $scope.$watch("datas.valid", valid => $scope.valid = valid);
        $scope.$watch("datas.invalidInfo", invalidInfo => $scope.invalidInfo = invalidInfo);
        $scope.$watch("datas.value", function (vNew, vOld) {
          if (!(formObjectItem instanceof CDformObjectItem)) return;
          //console.log("数据监听", vNew);
          $scope.value = vNew;
          formObjectItem.setValue(vNew);
          $timeout(() => {
            // console.log("初始化",dformInput,$scope.value);
            $scope.$broadcast("input.component.initValue", { value: $scope.value, initValueChange: true });
          }, 80);
        });


        $scope.$watch("value", function (vNew, vOld) {
          if (!(formObjectItem instanceof CDformObjectItem)) return;
          formObjectItem.setValue(vNew);
        });
        $scope.$on("input.component.valueChange", (event, data) => {
          if (!(formObjectItem instanceof CDformObjectItem)) return;
          formObjectItem.setValue(data.value);
          event.preventDefault();
          event.stopPropagation();
        });

      }]
    };
  });


  theModule.directive('dformForm2', function () {

    return {
      restrict: 'A',
      scope: {
        dformForm2: '<',
      },
      template: `
        <div dform-input2="item" ng-repeat="item in items track by $index"></div>`,
      controller: ["$scope", "$element", "$http", "$q", "$compile", "$timeout", function ($scope, $element, $http, $q, $compile, $timeout) {

        var formObject = new CDformObject($scope);
        $scope.$watch("dformForm2", vNew => formObject.setForm(vNew));
        $scope.$watch("dformForm2.initValue", (vNew) => formObject.setInitValue(vNew));
        $scope.$watch("dformForm2.initValue2", (vNew) => formObject.setItemValues(vNew));
        $scope.$watch("dformForm2.items", vNew => formObject.setItems(vNew));
        $scope.$on("dformForm2.setItemValues", (event, data) => formObject.setItemValues(data));

      }]
    };
  });


  theModule.directive('dformItem', function () {
    return {
      restrict: 'AE',
      scope: {
        type: '@',
        value: '=',
        onChange: '&',
      },
      template: `<div dform-form2="form"></div>`,
      controller: ["$scope", "$element", "$http", "$q", "$compile", "$timeout", function ($scope, $element, $http, $q, $compile, $timeout) {
        var old_value = {};
        $scope.form = {
          theme: "none",
          onItemValueChange: (name, value) => {
            // console.log("name=", name, "收到值:", value)
            if (value == old_value || !name) return;
            $scope.onChange && $scope.onChange({ $value: value });
          }
        };
        $scope.$watch("type", vNew => {
          $scope.form.items = [{ name: "k", type: vNew }];
        });

        $scope.$watch("value", vNew => {
          // console.log("值监听:", vNew)
          $timeout(() => $scope.form.initValue2 = { k: old_value = vNew });
        });
      }]
    };
  });



  /**
   * 动态表单封装
   * 
   * 组件数据：
   * @param {Array} items: 配置, 异步
   * @param {Object} initValue: 初始化值, 异步
   *
   *
   * 数据变化情况
   * 1.1 在 form, 由 form.initValue, item.initValue 设置值
   *
   *
   * 1.2 在 form, 由控件上传
   *
   *
   * 1.3 在 form, 由 dformForm2.items 改变配置
   *
   *
   * 2.1 在 item, 由 form.initValue 下发
   *
   *
   * 2.2 在 item, 自己改变
   *
   *
   * 3.3 在 item, 由 dformForm2.items 改变配置
   *
   *
   */
  class CDformObject {
    constructor(scope) {
      this.scope = scope;
      this.children = [];
      this.value = {};
      this.dirtys = {}
      this.invalids = {}
      this.valid = true;
      this.dirty = false;
      this.form = false;
    }
    /** 复制数据到 */
    copyTo(r) {
      r.value = this.copyofValue();
      r.valid = this.valid;
      r.dirty = this.dirty;
    }

    /** 只有效的字段，才复制数据 */
    copyofValue() {
      var value = {};
      (this.items || []).map(item => {
        if (this.value.hasOwnProperty(item.name)) value[item.name] = this.value[item.name];
      });
      return value;
    }

    /** 只有效的字段，才比较 */
    sameAs(r) {
      return r.valid == this.valid && r.dirty == this.dirty && angular.equals(r.value, this.copyofValue());
    }


    setForm(form) {
      this.form = form || {};
    }


    setItems(items) {
      if (!angular.isArray(items)) return;
      this.items = angular.extend([], items);
      this.scope.items = this.items.map(item => {
        item.theme = item.theme || this.form.theme || "ttb";
        var formObjectItem = new CDformObjectItem(this, item);
        if (item.hasOwnProperty("initValue")) {
          formObjectItem.setInitValue(copyof(item.initValue));
          this.value[item.name] = copyof(item.initValue);
        }
        return formObjectItem;
      });
      this.setInitValue(this.initValue);
    }

    setInitValue(initValue) {
      if (!angular.isObject(initValue)) return;
      this.initValue = angular.extend({}, initValue);
      if (this.items) {
        this.scope.items.map(formObjectItem => {
          var itemName = formObjectItem.config.name;
          if (initValue.hasOwnProperty(itemName)) {
            formObjectItem.setInitValue(copyof(initValue[itemName]));
            this.value[itemName] = copyof(initValue[itemName]);
          }
          formObjectItem.calcuValid();
          formObjectItem.emitValid();
        });
        this.dirty = false;
        this.copyTo(this.form);
        this.form.onItemValueChange && this.form.onItemValueChange();
      }
    }

    setItemValues(values) {
      if (!angular.isObject(values) || !this.scope.items) return;
      this.scope.items.map(formObjectItem => {
        var itemName = formObjectItem.config.name;
        if (values.hasOwnProperty(itemName)) {
          formObjectItem.setValue(copyof(values[itemName]));
          this.value[itemName] = copyof(values[itemName]);
        }
      });
      this.copyTo(this.form);
    }

    onItemValue(name, value) {
      if (!this.items.find(item => item.name == name)) return;
      if (angular.equals(this.value[name], value)) return;
      this.value[name] = copyof(value);
      this.dirty = true;
      this.copyTo(this.form);
      this.form.onItemValueChange && this.form.onItemValueChange(name, value);
    }

    onItemValid(name, valid) {
      if (!this.items.find(item => item.name == name)) return;
      this.invalids[name] = !valid;
      this.valid = !this.items.find(item => this.invalids[item.name]);
      this.copyTo(this.form);
    }

    getChild(name) {
      return this.children.find(item => item.config.name == name);
    }
  }
  class CDformObjectItem {
    constructor(parent, config) {
      this.parent = parent;
      this.config = config;
      /** 用于上下文, 可监听 */
      this.datas = {};
    }

    setInitValue(value) {
      this.datas.initValue = value;
      this.setValue(value);
    }

    setValue(value) {
      if (angular.equals(this.value, value)) return;
      this.value = copyof(value);
      this.datas.value = value;
      this.calcuValid();
      this.emitValid();
      this.emitValue();
    }

    calcuValid() {
      this.datas.invalidInfo = getInvalid(this.config, this.datas.value) || {};
      this.datas.valid = this.datas.invalidInfo.valid;
    }

    emitValue() {
      this.parent.onItemValue(this.config.name, this.datas.value);
      this.config.onChange && this.config.onChange(this.datas.value);
    }

    emitValid() {
      this.parent.onItemValid(this.config.name, this.datas.valid);
    }
  }

  /**
   * 检查字段的无效信息
   * @param {Object} dformInput 字段配置
   * @param {any} value 字段值
   * @return {{valid:boolean,required:boolean,prompt:String}} 错误提示
   */
  function getInvalid(inputConfig, value) {

    var config = {
      valid: inputConfig.param && inputConfig.param.valid || inputConfig.valid || {},
      invalid: angular.extend({ required: "required" }, inputConfig.invalid, inputConfig.param && inputConfig.param.invalid)
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
        R.prompt = config.invalid.required || "请输入";
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
        R.prompt = config.invalid.pattern || "不符合规则";
        return R;
      }
    }
    if (config.valid.max) {
      var not_number = typeof (value) == "object" || Number.isNaN(Number(value));
      var error = not_number || +value > config.valid.max;
      if (error) {
        R.valid = false;
        R.prompt = (not_number ? config.invalid.number : config.invalid.max) || `最大值:${config.valid.min}`;
        return R;
      }
    }
    if (config.valid.min) {
      var not_number = typeof (value) == "object" || Number.isNaN(Number(value));
      var error = not_number || +value < config.valid.min;
      if (error) {
        R.valid = false;
        R.prompt = (not_number ? config.invalid.number : config.invalid.min) || `最小值:${config.valid.min}`;
        return R;
      }
    }
    if (config.valid.maxlength) {
      var v = value || '';
      var error = !v.hasOwnProperty('length') || v.length > config.valid.maxlength;
      if (error) {
        R.valid = false;
        R.prompt = config.invalid.maxlength || `最多:${config.valid.maxlength}`;
        return R;
      }
    }
    if (config.valid.minlength) {
      var v = value || '';
      var error = !v.hasOwnProperty('length') || v.length < config.valid.minlength;
      if (error) {
        R.valid = false;
        R.prompt = config.invalid.minlength || `最少:${config.valid.minlength}`;
        return R;
      }
    }
    return R;
  }


})(window, angular);