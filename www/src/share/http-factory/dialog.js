!(function (angular, window, undefined) {

  var theConfigModule = angular.module('dj-pop')

  /**
   * 显示对话框
   */
  theConfigModule.run(['sign', 'DjPop', function (sign, DjPop) {
    var paramMaps = [
      { type: "input", arg: ["title", "text"] },
      { type: "toast", arg: ["text", "delay"] },
      { type: "alert", arg: ["body", "title", "options"] },
      { type: "confirm", arg: ["body", "title", "options"] },
      { type: "gallery", arg: ["params", "options"] },
      { type: "gallery", arg: ["params", "options"] },
      { type: "dialog", arg: ["componentName", "params", "options"] },
    ];
    sign.registerHttpHook({
      match: /^显示对话框\/(.*)$/,
      hookRequest: function (config, mockResponse, match) {
        console.log("显示对话框",config)
        var param = config.data;
        if (!angular.isArray(param) && angular.isObject(param)) {
          var paramList = paramMaps.find(item => item.type == match[1]);
          if (paramList && paramList.arg) {
            param = paramList.arg.map(k => param[k]);
          }
          else {
            param = Object.keys(param).map(k => param[k]);
          }
        }
        var dlg = DjPop[match[1]].apply({}, param);
        dlg.catch(e => console.error(e));
        return mockResponse.resolve(dlg);
      }
    });
  }]);


})(angular, window);
