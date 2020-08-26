!(function (angular, window, undefined) {

  var theModule = angular.module("dj-app");

  var MENUS = [
    { name: "笔画", fn: "menu", subfn: "key", sub: ["一", "丨", "丿", "丶", "乛", "退一笔", "选字", "第一字"] },
    { name: "符号", fn: "menu", subfn: "text", sub: "，。！？；：“”…" },
    { name: "数字", fn: "menu", subfn: "text", sub: "1234567890.-+×÷" },
    { name: "abc", fn: "menu", subfn: "text", sub: "abcdefghijklmnopqrstuvwxya" },
    { name: "ABC", fn: "menu", subfn: "text", sub: "ABCDEFGHIJKLMNOPQRSTUVWXYA" },
    {
      name: "功能",
      fn: "menu",
      subfn: "call",
      sub: [
        "全屏", "速度+", "速度-"
      ]
    },
    { name: "换行", fn: "text", text: "\n" },
  ];

  theModule.component("imePage", {
    template: `
    <div class="flex-1 flex flex-stretch em-12">
      <div class="ime-course v br-ccc flex" ng-click="D.COURSE.left()">
        <div class="process flex-v flex-stretch" ng-if="D.processing=='left'">
          <div class="flex-1"></div>
          <div class=""></div>
          <div class="flex-1"></div>
        </div>
        <div class="top flex-cc" ng-mouseover="D.over('left',$event)" ng-mouseout="D.out('left',$event)">功<br>能</div>
      </div>
      <div class="ime-middle flex-1 flex-v">
        <div class="ime-course h bb-ccc bk-c flex-cc" ng-click="D.COURSE.up()">
          <div class="process flex flex-stretch" ng-if="D.processing=='up'">
            <div class="flex-1"></div>
            <div class=""></div>
            <div class="flex-1"></div>
          </div>
          <div class="top flex-cc" ng-mouseover="D.over('up',$event)" ng-mouseout="D.out('up',$event)">上一个</div>
        </div>
        <div class="ime-content flex-1 padding-1 flex-v flex-stretch ">
          <textarea rows=3 class="em-30 b-900" ng-model="D.text">显示内容</textarea>
          <div class="ime-bh-row flex flex-v-center em-20 b-900 text-f padding-1">
            <div class="flex-1 shrink0">{{D.bh}}</div>
            <div class="flex-1 line___1">{{D.words.join(' ').substr(0,50)}}</div>
          </div>
          <div class="ime-item-list flex-wrap flex-left align-top flex-1 padding-v-1 v-scroll">
            <div class="ime-item flex-cc em-20 b-900 {{$index==D.item_index&&'active'}}" ng-click="D.exec(item)" ng-repeat="item in D.items track by $index">{{item.name||item}}</div>
          </div>
        </div>
        <div class="ime-course h bt-ccc bk-c flex-cc" ng-click="D.COURSE.down()">
          <div class="process flex flex-stretch" ng-if="D.processing=='down'">
            <div class="flex-1"></div>
            <div class=""></div>
            <div class="flex-1"></div>
          </div>
          <div class="top flex-cc" ng-mouseover="D.over('down',$event)" ng-mouseout="D.out('down',$event)">下一个</div>
        </div>
      </div>
      <div class="ime-course v br-ccc flex" ng-click="D.COURSE.right()">
        <div class="process flex-v flex-stretch" ng-if="D.processing=='right'">
          <div class="flex-1"></div>
          <div class=""></div>
          <div class="flex-1"></div>
        </div>
        <div class="top flex-cc" ng-mouseover="D.over('right',$event)" ng-mouseout="D.out('left',$event)">确<br>定</div>
      </div>
    </div>`,
    controller: ["$scope", "$http", "$q", "$element", "$animateCss", "IME", "ImeBH", function ctrl($scope, $http, $q, $element, $animateCss, IME, ImeBH) {
      //$element.addClass("flex-v flex-1");

      var myIME = IME.create({ getPreshow: ImeBH.getPreshow });

      var Settings = $scope.Settings = (function () {
        var KEY = "打字配置";
        function load() {
          return $q.when(1).then(() => {
            var str = localStorage.getItem(KEY) || "{}";
            return JSON.parse(str);
          }).catch(e => {
            return {};
          });
        }

        function saveValue(moreData) {
          return load().then(data => {
            data = angular.extend({}, data, moreData);
            localStorage.removeItem(KEY);
            localStorage.setItem(KEY, JSON.stringify(data));
            return data;
          }).catch(e => {
            console.error(e);
            return$q.reject(e);
          });
        }
        return { load, saveValue };
      })();

      var D = $scope.D = {
        text: "",
        bh: "",
        pretext: "",
        item_index: 0,
        items: MENUS,

        words: [],
        setWords: (words) => {
          D.words = angular.extend([], words);
          if (D.words.length <= 0) D.EXEC["menu"](MENUS[0]);
          else D.items = D.words.filter((a, n) => n < 80).map(text => ({
            fn: "text",
            name: text,
          }));
        },

        COURSE: {
          left: () => {
            if (D.status == "选字") {
              D.EXEC["menu"](MENUS[0]);
              return;
            }
            D.items = MENUS;
            D.item_index = 0;
          },
          right: () => {
            D.exec(D.items[D.item_index]);
          },
          up: () => { D.item_index--; if (D.item_index < 0) D.item_index = D.items.length - 1; },
          down: () => { D.item_index++; if (D.item_index >= D.items.length) D.item_index = 0; },
        },

        exec: item => {
          if (D.EXEC[item.fn]) return D.EXEC[item.fn](item);
        },

        EXEC: {
          "menu": item => {
            if (item.name == "笔画") {
              if (D.status != "选字") D.bh = "";
              D.status = "笔画";
            }
            if (item.subfn) {
              var sub = item.sub;
              if (angular.isString(sub)) sub = sub.split("");
              D.items = sub.map(text => ({
                fn: item.subfn,
                name: text,
              }));
              D.item_index = 0;
            }
          },
          "text": item => {
            var input = item.text || item.name;
            if (!input) {
              return;
            }
            D.text += input;
            if (D.status == "选字") {
              D.bh = "";

              myIME.selectPreshow(input).then(function (words) {
                D.setWords(words);
              }).catch(function (e) {
                D.setWords([]);
              });
            }
            var textarea = $element.find('textarea')[0];
            textarea.blur();
            setTimeout(
              function () {
                //textarea.selectionStart = textarea.selectionEnd = R.pos;
                textarea.focus();
              }, 20
            );
          },
          "key": item => {
            if (D.EXEC[item.name]) return D.EXEC[item.name](item);
            if (item.name == "退一笔") {
              if (D.bh.length) D.bh = D.bh.substr(0, D.bh.length - 1);
              else D.text = D.text.substr(0, D.text.length - 1);
            }
            else D.bh += item.name;
          },
          "call": item => {
            console.log(item)
            if (D.EXEC[item.name]) return D.EXEC[item.name](item);
          },

          "全屏": item => {
            toggleFullScreen();
          },

          "选字": item => {
            D.status = "选字";
            D.setWords(D.words);
            D.item_index = 0;
          },

          "第一字": item => {
            D.status = "选字";
            D.words && D.words[0] && D.EXEC["text"]({ text: D.words[0] });
            // D.EXEC["menu"](MENUS[0]);
          },

          "速度+": item => {
            Settings.load().then(data => {
              var duration = data.duration || 0.9;
              duration -= 0.1;
              if (duration < 0.3) duration = 0.3;
              Settings.saveValue({ duration });
            });
          },

          "速度-": item => {
            Settings.load().then(data => {
              var duration = data.duration || 0.9;
              duration += 0.1;
              if (duration > 2) duration = 2;
              Settings.saveValue({ duration });
            });
          },
        },

        "over": (name, event) => {
          var e = angular.element(event.target);
          if (!e.hasClass("ime-course")) e = e.parent();
          console.log("over,", name, e);
          D.processing = name;
          var attrName = ["up", "down"].indexOf(name) < 0 && "height" || "width";
          var animatorParams = {
            from: {},
            to: {},
            //easing: 'ease',
            duration: 0.8 // 秒
          }
          animatorParams.from[attrName] = "100%";
          animatorParams.to[attrName] = 0;
          setTimeout(() => {
            Settings.load().then(data => {
              var duration = data.duration || 0.9;
              animatorParams.duration = duration;
              D.animator = $animateCss(e.children().eq(0).children().eq(1), animatorParams);
              D.animator.start().then(() => {
                if (D.processing != name) return;
                console.log("动画完成");
                D.processing = "";
                D.COURSE[name]();
              });
            });
          })
        },
        "out": (name, event) => {
          D.processing && D.animator && D.animator.end()
          console.log("out,", name, event)
          D.processing = "";
        },
      }


      $scope.$watch("D.bh", (bh) => {
        if (!bh) {
          D.words = [];
          return;
        }
        myIME.getPreshow(bh).then(function (words) {
          D.words = words;
        });
      })
    }]
  });


  /**
   * 全屏切换
   */
  function toggleFullScreen() {
    if (toggleFullScreen.fullScreen) {
      document.webkitCancelFullScreen();
      toggleFullScreen.fullScreen = false;
    }
    else {
      document.body.webkitRequestFullscreen();
      toggleFullScreen.fullScreen = true;
    }
  }

})(angular, window);