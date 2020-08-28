!(function (angular, window, undefined) {

  var theModule = angular.module("dj-app");

  theModule.component("imePage", {
    template: `
    <div class="flex-1 flex flex-stretch em-12">
      <process-box class="ime-course br-ccc flex" course="v" fire="left" text="上一个" ng-click="COURSE.left()"></process-box>
      <div class="ime-middle flex-1 flex-v">
        <process-box class="ime-course br-ccc flex" course="h" fire="up" text="菜单" ng-click="COURSE.up()"></process-box>
        <div class="ime-content flex-1 padding-1 flex-v flex-stretch ">
          <textarea rows=3 class="em-30 b-900" ng-model="D.text">显示内容</textarea>
          <div class="ime-bh-row flex flex-v-center em-20 b-900 text-f padding-1">
            <div class="flex-1 shrink0">{{D.keys}}</div>
            <div class="flex-1 line___1">{{D.words.join(' ').substr(0,50)}}</div>
          </div>
          <div class="ime-item-list flex-wrap flex-left align-top flex-1 padding-v-1 v-scroll">
            <div class="ime-item {{item.fn}} flex-cc em-20 b-900 {{$index==D.activeIndex&&'active'}}"
              ng-click="EXEC.run(item)"
              ng-show="$index>=D.firstIndex"
              ng-repeat="item in D.items track by $index"
            >{{item.name||item}}</div>
          </div>
        </div>
        <process-box class="ime-course br-ccc flex" course="h" fire="down" text="确定" ng-click="COURSE.down()">
          <div class="flex">
            <div class="text-b">栈:{{D.panelCache.length||0}} 　项:{{D.items.length||0}}</div>
            <div class="text-b">{{D.activeMenu.name}} | {{D.activeMenu.status}} | {{D.status}}</div>
          </div>
        </process-box>
      </div>
      <process-box class="ime-course br-ccc flex" course="v" fire="right" text="下一个" ng-click="COURSE.right()"></process-box>
    </div>`,
    controller: [
      "$scope",
      "$http",
      "$q",
      "$element",
      "$animateCss",
      "CPanelBH", "Settings",
      function ($scope, $http, $q, $element, $animateCss, CPanelBH, Settings) {

        var myPanel = CPanelBH.create({});
        var D = $scope.D = myPanel.data;


        $scope.$on("process-box-done", (event, data) => {
          var fire = data.fire;
          // console.log("收到", fire, data);
          myPanel.course(fire).catch(e => {
            console.error(e);
          });
        });

        $scope.$watch("D.bh", (bh) => {
          if (!bh) {
            D.words = [];
            return;
          }
          myIME.getPreshow(bh).then(function (words) {
            D.words = words;
          });
        });

        $scope.$watch("D.text", (inputing) => {
          Settings.saveValue({ inputing });
          var textarea = $element.find('textarea')[0];
          textarea.blur();
          setTimeout(() => {
            //textarea.selectionStart = textarea.selectionEnd = R.pos;
            textarea.focus();
          }, 20);
        });
      }
    ]
  });


})(angular, window);