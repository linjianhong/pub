!(function (angular, window, undefined) {

  var theModule = angular.module("dj-app");


  theModule.component("processBox", {
    template: `
      <div class="process flex-{{course}} flex-stretch" ng-if="D.processing==$ctrl.fire">
        <div class="flex-1"></div>
        <div class=""></div>
        <div class="flex-1"></div>
      </div>
      <div class="transclude" ng-transclude></div>
      <div class="top {{course}} flex-cc" ng-mouseover="D.over($event)" ng-mouseout="D.out($event)">{{$ctrl.text}}</div>
      `,
    transclude: true,
    bindings: {
      course: "@",
      fire: "@",
      text: "@",
    },
    controller: ["$scope", "$q", "$element", "$animateCss", "Settings", function ctrl($scope, $q, $element, $animateCss, Settings) {
      $element.addClass("flex process-box");

      $scope.$watch("$ctrl.course", course => {
        var courses = (course || "h").split("");
        var h = courses.indexOf("h") >= 0 && "h" || "";
        var v = courses.indexOf("v") >= 0 && "v" || "";
        $element.removeClass("h v");
        h && $element.addClass(h);
        v && $element.addClass(v);
        $scope.course = h || v || "h"
      });

      /** 核心功能 */
      var D = $scope.D = {
        "over": (event) => {
          var fire = $scope.$ctrl.fire;
          if (!fire) {
            console.error("没有名字");
            return;
          }
          var e = angular.element(event.target);
          while (e && !e.hasClass("process-box")) e = e.parent();
          if (!e) return;
          D.processing = fire;
          var attrName = $scope.course == "v" && "height" || "width";
          var animatorParams = {
            from: {},
            to: {},
            //easing: 'ease',
            duration: 0.8 // 秒
          }
          animatorParams.from[attrName] = "100%";
          animatorParams.to[attrName] = 0;
          // console.log("over,", fire, "D.processing=", D.processing, "target=", event.target);
          setTimeout(() => {
            var parent = e.children().eq(0);
            if (!parent || !parent.hasClass("process")) {
              D.processing = "无效";
              console.error("无效1", parent);
              return;
            }
            var ele = parent.children().eq(1);
            if (!ele || !ele.length) {
              D.processing = "无效";
              console.error("无效2");
              return;
            }
            Settings.load().then(data => {
              var duration = data.duration || 0.9;
              animatorParams.duration = duration;
              if (ele.length > 1) console.error("动画", ele);
              D.animator = $animateCss(ele, animatorParams);
              D.animator.start().then(() => {
                // console.log(D.processing != fire && "取消动画" || "动画完成");
                if (D.processing != fire) return;
                D.processing = "完成";
                $scope.$emit("process-box-done", { fire, text: $scope.$ctrl.text })
              });
            });
          })
        },
        "out": (event) => {
          D.processing && D.animator && D.animator.end()
          D.processing = "移出";
          var fire = $scope.$ctrl.fire;
          // console.log("移出,", fire, "D.processing=", D.processing)
        },
      }

    }]
  });


})(angular, window);