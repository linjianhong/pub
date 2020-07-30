!(function (angular, window, undefined) {

  var theModule = angular.module("dj-ui");
  /** 多级联动选择组件 */
  theModule.component('chainSelect', {
    template: `
    <div class="" out-click-watch="!R.done" on-out-click="R.click_close()">
      <div class="flex">
        <div class="flex-left">
          <div class="chain-select-item {{$index==R.selecting&&'text-warning'||''}}"
            ng-click="R.setSelect($index)"
            ng-repeat="text in R.arr track by $index"
          ><span class="chain-select-item-sep" ng-if="$index">{{config.sep||''}}</span><span class="chain-select-item-text">{{text}}</span></div>
          <div class="chain-select-item text-warning" ng-click="R.setSelect(0)" ng-if="!R.arr.length">点击选择</div>
        </div>
        <div class="flex-right" ng-if="!R.done">
          <div class="padding-h-2 em-15" ng-if="R.arr.length>0 || !R.list.length" ng-click="R.click_clear()"><i class="fa fa-cut text-stop"></i></div>
          <div class="padding-h-2 em-15" ng-if="1" ng-click="R.click_done()"><i class="fa fa-check text-running"></i></div>
        </div>
      </div>
      <div class="chain-select-dropdown bt-ccc absolute" ng-if="!R.done">
        <div class="text-c" ng-if="R.list.length">{{R.selectPrompt[R.selecting]}}</div>
        <div class="flex-wrap flex-left">
          <div class="chain-select-dropdown-item {{text==R.arr[R.selecting]&&'box-active'||'bk-c text-f'}}"
            ng-click="R.select(text)"
            ng-repeat="text in R.list track by $index"
          >{{text}}</div>
        </div>
      </div>
    </div>`,
    bindings: {
      config: "<",
    },
    controller: ["$scope", "$element", "$q", "HandleMouse", function ctrl($scope, $element, $q, HandleMouse) {

      $element.addClass("relative");

      this.$onChanges = (changes) => {
        if (changes.config) {
          var config = $scope.config = changes.config.currentValue || {};
          if (angular.isArray(config.selectPrompt)) R.selectPrompt = config.selectPrompt;
          if (angular.isArray(config.DICK)) R.DICK = config.DICK;
          init(config);
        }
      }

      $scope.$watch("config.DICK", dick => {
        R.DICK = dick || DEFAULT_DICK;
        init($scope.config);
      })

      var R = $scope.R = {
        done: false,
        DICK: DEFAULT_DICK,
        arr: [],
        selecting: 0,
        selectPrompt: ["选择省份", "选择城市", "选择县区"],
        setSelect: index => {
          var good_index = (index < 0) ? 0 : index;
          R.done = false;
          R.selecting = good_index;
          index >= 0 && $scope.config.onselect && $scope.config.onselect(R.arr.slice(0, R.selecting + 1));
          R.list = GetList(good_index, R.arr, R.DICK);
        },
        select: text => {
          R.arr[R.selecting] = text;
          R.selecting++;
          R.arr.length = R.selecting;
          $scope.config.onselect && $scope.config.onselect(R.arr.slice(0, R.selecting));
          R.list = GetList(R.selecting, R.arr, R.DICK);
          if (!R.list || !R.list.length) {
            R.click_done();
          }
          else {
            // R.arr.push(R.selectPrompt[R.selecting]);
          }
        },

        click_clear: () => {
          R.arr = [];
          R.setSelect(-1);
          $scope.config.onselect && $scope.config.onselect([]);
        },

        click_done: () => {
          R.done = true;
          if (R.list && R.list.find(s => s == R.arr[R.selecting])) R.selecting++;
          if (R.arr.length > R.selecting) R.arr.length = R.selecting;
          $scope.config.value = R.arr.join(" ");
          $scope.config.ondone && $scope.config.ondone(R.arr);
        },

        click_close: () => {
          R.done = true;
          if (R.list && R.list.find(s => s == R.arr[R.selecting])) R.selecting++;
          R.selecting = R.arr.length;
          $scope.config.value = R.arr.join(" ");
          $scope.config.onselect && $scope.config.onselect(R.arr);
          $scope.config.ondone && $scope.config.ondone(R.arr);
          return "click_close!";
        },
      };

      function init(config) {
        var text = config.text || "";
        var sep = config.sep || " ";
        var arr = text && angular.isString(text) && text.split(sep) || [];
        R.arr = arr;// || [R.selectPrompt[0]];
        R.setSelect(arr.length);
        $scope.config.ondone && $scope.config.ondone(R.arr);
        R.done = !!arr;
      }

      //var handle_mouse = (function () {
      //
      //  var handle;
      //
      //  $scope.$watch("R.done", vNew => {
      //    // console.log("多级选择", vNew);
      //    if (!vNew) {
      //      // console.log("多级选择, 捕捉, handle=", handle);
      //      if (handle) handle.Listen();
      //      else handle = HandleMouse.HandleDown($element[0], event => {
      //        console.log("多级选择, 响应", event, "handle=", handle);
      //        R.click_close();
      //        $scope.$apply();
      //      });
      //    } else {
      //      // console.log("多级选择, 释放, handle=", handle);
      //      handle && handle.FinishListen();
      //    }
      //  })
      //})();

    }]
  });

  function GetList(nth, arr, root_node) {
    for (var i = 0; i < nth; i++) {
      if (!angular.isArray(root_node)) return [];
      sub_node = root_node.find(node => node.name == arr[i]) || {};
      root_node = sub_node.sub;
    }
    if (!angular.isArray(root_node)) return [];
    return root_node.map(node => node.name || node);
  }

  var DEFAULT_DICK = [
    {
      name: "福建", sub: [
        { name: "福州" },
        { name: "厦门" },
        {
          name: "莆田", sub: [
            { name: "城厢区" },
            { name: "荔城区" },
            { name: "仙游县" },
          ],
        },
      ],
    },
    {
      name: "广东", sub: [
        { name: "广州" },
        { name: "珠海" },
      ],
    },
  ];
})(angular, window);