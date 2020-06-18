
!(function (angular, window, undefined) {

  var theModule = angular.module("mock");

  /** 请求支付 */
  theModule.run(["sign", "$http", function (sign, $http) {
    sign.registerHttpHook({
      match: /^请求支付$/,
      hookRequest: function (config, mockResponse, match) {
        var pay_param = config.data;
        console.log("响应请求支付, pay_param=", pay_param);
        if (!pay_param) return mockResponse.reject("支付参数无效");
        if (PAY[pay_param.pay_mode])
          return mockResponse(PAY[pay_param.pay_mode](pay_param.payParam, pay_param.order));
        return mockResponse.reject({ errmsg: "未支持的支付方式", pay_param });
      }
    });

    var PAY = {
      "WxPay.JsApiPay": (payParam, order) => {
        return $http.post("请求微信支付-JsApiPay", { payParam, order });
      },
      "WxPay.Qrocde2": (payParam, order) => {
        return $http.post("请求微信支付-Qrocde2", { payParam, order });
      },
    }
  }]);

  /** 请求微信支付-JsApiPay */
  theModule.run(["sign", "$http", "$q", function (sign, $http, $q) {
    sign.registerHttpHook({
      match: /^请求微信支付-JsApiPay$/,
      hookRequest: function (config, mockResponse, match) {
        var param = config.data;
        var payParam = param.payParam;
        var deferred = $q.defer();
        wx.chooseWXPay({
          timestamp: payParam.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的 timeStamp 字段名需大写其中的S字符
          nonceStr: payParam.nonceStr, // 支付签名随机串，不长于 32 位
          package: payParam.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
          signType: payParam.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
          paySign: payParam.paySign, // 支付签名
          success: function (res) {
            // 支付成功后的回调函数
            deferred.resolve({ errmsg: "支付成功", res });
            console.log("支付成功", res);
            alert("支付成功");
          },
          fail: function (res) {
            deferred.reject({ errmsg: "支付失败", res });
            console.log("支付失败", res);
            alert("支付失败");
          },
          cancel: function (res) {
            deferred.reject({ errmsg: "支付已取消", res });
            console.log("支付被取消", res);
            alert("支付被取消");
          },
        });
        return mockResponse(deferred.promise);
      }
    });
  }]);


})(angular, window);