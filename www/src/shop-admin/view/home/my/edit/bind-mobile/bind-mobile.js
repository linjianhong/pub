/* 我的页面 */
!(function (angular, window, undefined) {

  var theModule = angular.module("dj.router.frame");

  theModule.component("pageBindMobile", {
    pageTitle: "绑定手机",
    requireLogin: true,
    autoDestroy: true,
    pageCss: "bk-d",
    footer: { hide: true },
    template: `
      <my-info-row class="info-rows" mode="me"></my-info-row>
      <div class="padding-3 bk-e">
        <dlg-mobile-confirm mode="bind" class=""></dlg-mobile-confirm>
      </div>`,
    controller: ["$scope", "$http", "DjState", "$q", function ctrl($scope, $http, DjState, $q) {
      $scope.$on("dj-pop-box-close", (event, data) => {
        event.preventDefault();
        console.log("绑定成功", data);
        $http.post("我的-基本信息", { reset: 1 });
        $scope.$broadcast("phone-number-binded");
        $scope.$broadcast("node-form-prompt", { prompt: "绑定成功" });
      });
    }]
  });


  theModule.component("dlgMobileConfirm", {
    template: `
        <div class="padding-3 " dform-form="formEdit" ></div>
        <div class="pop-footer flex padding-h-3 bt-ccc em-12 padding-v-1">
          <div class="flex-1 text-danger">{{formEdit.prompt}}</div>
          <fa-button class="warning" d="{fa:'send',title:'绑定'}" disabled="formEdit.submit.submiting||!formEdit.valid" ng-click="formEdit.submit()"></fa-button>
        </div>`,
    bindings: {
      mode: "@"
    },
    controller: ["$scope", "$http", "$q", function ctrl($scope, $http, $q) {

      var formEdit = $scope.formEdit = {
        items: [
          {
            name: "mobile", title: "手机号码", type: "input",
            valid: {
              "required": 1,
              "pattern": /^1(\d|\d-){10}$/,
            },
            invalid: {
              "required": '手机号码不可空',
              "pattern": '手机号码不合法',
            },
            list: "产品分类"
          },
          {
            name: "code",
            title: "验证码",
            component: "mobile-code-input",
            valid: { required: 1, },
            invalid: { required: '验证码不可空', },
          },
        ],

        onItemValueChange: data => {
          console.log(data)
          if (data.name == "mobile") {
            $scope.mobileValid = data.valid;
            $scope.$broadcast("phone-number-valid", { valid: data.valid });
          }
        },
        /** 仅支持一次性提交，防止重复提交 */
        submit: () => {
          if (formEdit.submit.submiting) return;
          formEdit.submit.submiting = true;
          if (!formEdit.valid) return formEdit.prompt = "数据输入不完整";

          var phone = formEdit.value.mobile;
          var code = formEdit.value.code;
          $http.post(`sms/${this.mode || "login"}`, { phone, code }).then(json => {
            $scope.$emit('dj-pop-box-close', { btnName: 'OK', token: angular.extend({ phone }, json.datas) });
            //$scope.$emit('sms-login-success', json);
          }).catch(e => {
            formEdit.prompt = e.errmsg || e;
            $scope.$broadcast("node-form-prompt", { prompt: formEdit.prompt });
            $scope.valid = false;
            console.log("登录失败: ", e);
          });
        },

        getCode: () => {
          if (!$scope.mobileValid) return;
          console.log("发送验证码");
          $http.post("sms/getcode", { phone: formEdit.value.mobile }).then(json => {
            $scope.$broadcast("phone-number-valid", { text: '验证码已发送', valid: false });
            phoneCodeTimerSeconds = 60;
            phoneCodeTimerId = setInterval(() => {
              $scope.$apply(() => {
                console.log('倒计时', phoneCodeTimerSeconds);
                $scope.$broadcast("phone-number-valid", { text: `${phoneCodeTimerSeconds}秒后再次获取`, valid: false });
                phoneCodeTimerSeconds--;
                if (phoneCodeTimerSeconds <= 0) {
                  clearInterval(phoneCodeTimerId);
                  $scope.$broadcast("phone-number-valid", { text: $scope.mobileValid && "重新获取验证码", valid: $scope.mobileValid });
                }
              })
            }, 1005);
          }).catch(e => {
            formEdit.prompt = e.errmsg || e;
          })
        },

        binded: (event) => {
          clearInterval(phoneCodeTimerId);
          event.preventDefault();
          formEdit.prompt = "绑定成功";
        },
      }


      $scope.$on("require-get-mobile-code", formEdit.getCode);
      $scope.$on("phone-number-binded", formEdit.binded);

      var phoneCodeTimerId;
      $scope.$on('$destroy', function () {
        clearInterval(phoneCodeTimerId);
      });
    }]
  });

  theModule.component("mobileCodeInput", {
    template: `
      <div class="flex flex-v-center mobile-code-input-box">
        <input class="mobile-code-input flex-1" ng-model="value" ng-change="change(value)">
        <div class="mobile-code-btn flex-cc djui-box-{{disabled&&'disabled'||'warning'}}" ng-click="getCode()">{{text||'获取验证码'}}</div>
      </div>`,
    bindings: {
      onChange: '&',
    },
    controller: ["$scope", "$http", "$q", function ctrl($scope, $http, $q) {
      $scope.disabled = true;
      $scope.getCode = () => {
        var a = $scope.$emit("require-get-mobile-code");
      };
      $scope.$on("phone-number-valid", (event, data) => {
        $scope.text = data.text || $scope.text || "";
        $scope.disabled = !data.valid;
      });
      $scope.change = (value) => {
        $scope.$emit("input.component.valueChange", { value });
      };
    }]
  });
})(angular, window);
