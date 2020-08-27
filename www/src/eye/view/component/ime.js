!(function (angular, window, undefined) {

  var theModule = angular.module("dj-app");

  var MAX_PANEL_CACHE_LENGTH = 8;
  var TMP_STATUS = "临时";

  var MENU = (function () {

    var MENU_KEYS = [
      "name",
      "text",
      "fn",
      "subfn",
      "statusFrom",
      "status",
      "subMenu",
      "defaultIndex",
      "menuCache",  // clear | undefined
      "canShow",
      "needReturn", // 函数, 返回值: 当按菜单键时，是否需要返回上级菜单。默认值： status==TMP_STATUS
    ];

    class CMenu {
      constructor(options) {
        this.extend(options);
      }

      extend(options) {
        MENU_KEYS.map(k => {
          if (options.hasOwnProperty(k)) this[k] = options[k];
        });
        return this;
      }

      extendCopy(options) {
        return new CMenu(this).extend(options);
      }

      getItems() {
        var subMenu = this.subMenu;
        if (angular.isString(subMenu)) subMenu = subMenu.split("");
        if (!angular.isArray(subMenu)) return false;
        return subMenu.map(subItem => Menu({
          fn: this.subfn,
          name: subItem,
        }).extend(subItem));
      }

      mustReturn(D) {
        if (angular.isFunction(this.needReturn)) return this.needReturn(D);
        return D.status == TMP_STATUS;
      }
    }

    function Menu(options) { return new CMenu(options); }


    var
      Menu_BH = Menu({ name: "笔画", status: "笔画", fn: "menu", subfn: "key", subMenu: ["一", "丨", "丿", "丶", "乛"] }),
      Menu_$ = Menu({ name: "符号", status: "连续输入", fn: "menu", subfn: "text", subMenu: "，。！？；：“”…" }),
      Menu_123 = Menu({ name: "数字", status: "连续输入", fn: "menu", subfn: "text", subMenu: "1234567890.-+×÷" }),
      Menu_abc = Menu({ name: "abc", status: "连续输入", fn: "menu", subfn: "text", subMenu: "abcdefghijklmnopqrstuvwxya" }),
      Menu_ABC = Menu({ name: "ABC", status: "连续输入", fn: "menu", subfn: "text", subMenu: "ABCDEFGHIJKLMNOPQRSTUVWXYA" }),
      Menu_SETTINGS = Menu({ name: "功能", status: "菜单", fn: "menu", subfn: "call", subMenu: ["全屏", "速度+", "速度-"] }),
      Menu_RETURN = Menu({ name: "换行", fn: "text", text: "\n" }),
      Menu_BACKSPACE = Menu({ name: "退格", fn: "call" }),

      Menu_INPUTS = Menu({ name: "各种输入", status: "菜单", fn: "menu", subMenu: [Menu_$, Menu_123, Menu_abc, Menu_ABC, Menu_RETURN] }),
      Menu_HOME = Menu({
        name: "主菜单",
        status: "菜单",
        subMenu: [
          Menu_BH,
          Menu_INPUTS,
          Menu_SETTINGS,
          Menu_RETURN,
        ],
      });
    var ALL_MENUS = [
      Menu_BH, Menu_$, Menu_123, Menu_abc, Menu_ABC, Menu_SETTINGS, Menu_RETURN, Menu_BACKSPACE, Menu_INPUTS, Menu_HOME,

      Menu_BH.extendCopy({
        statusFrom: "选字",
        needReturn: (D) => { return !D.bh; },
      }),

      Menu({
        name: "正在输入笔画时弹出",
        statusFrom: "笔画",
        canShow: (D) => { return D.bh && D.bh.length; },
        status: TMP_STATUS,
        subMenu: [
          { name: "第一字", fn: "call" },
          { name: "选字", fn: "call" },
          { name: "退格", fn: "call" },
        ]
      }),

      Menu({
        name: "无笔画时弹出",
        statusFrom: "笔画",
        canShow: (D) => { return !D.bh || !D.bh.length; },
        status: TMP_STATUS,
        subMenu: [
          Menu_INPUTS,
          Menu_BACKSPACE,
          Menu_SETTINGS,
          Menu_RETURN,
        ]
      }),

      Menu({
        name: "连续输入时弹出",
        statusFrom: "连续输入",
        canShow: (D) => { return 1; },
        status: TMP_STATUS,
        subMenu: [
          Menu_BH,
          Menu_INPUTS,
          Menu_BACKSPACE,
          Menu_SETTINGS,
          Menu_RETURN,
        ]
      }),
    ];

    ALL_MENUS.push();

    function getMenuByStatus(statusFrom, D) {
      if (!statusFrom) return false;
      return ALL_MENUS.find(menu => {
        if (menu.statusFrom != statusFrom) return false;
        if (!D) return true;
        if (!menu.canShow) return true;
        return menu.canShow(D);
      });
    }

    function getMenuByName(name) {
      if (!name) return false;
      return ALL_MENUS.find(menu => menu.name == name);
    }


    return {
      TMP_STATUS,
      getMenuByStatus,
      getMenuByName,
      CMenu,
      Menu,
    }
  })();


  theModule.component("imePage", {
    template: `
    <div class="flex-1 flex flex-stretch em-12">
      <div class="ime-course v br-ccc flex" ng-click="D.COURSE.left()">
        <div class="process flex-v flex-stretch" ng-if="D.processing=='left'">
          <div class="flex-1"></div>
          <div class=""></div>
          <div class="flex-1"></div>
        </div>
        <div class="top flex-cc" ng-mouseover="D.over('left',$event)" ng-mouseout="D.out('left',$event)">菜<br>单</div>
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
            <div class="ime-item {{item.fn}} flex-cc em-20 b-900 {{$index==D.item_index&&'active'}}" ng-click="D.exec(item)" ng-repeat="item in D.items track by $index">{{item.name||item}}</div>
          </div>
        </div>
        <div class="ime-course h bt-ccc bk-c flex-cc" ng-click="D.COURSE.down()">
          <div class="process flex flex-stretch" ng-if="D.processing=='down'">
            <div class="flex-1"></div>
            <div class=""></div>
            <div class="flex-1"></div>
          </div>
          <div class="flex">
            <div class="text-b">栈:{{D.panelCache.length||0}} 　项:{{D.items.length||0}}</div>
            <div class="text-b">{{D.status}}</div>
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

      /** 本地配置缓存 */
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

      var firstMenu = MENU.getMenuByName("笔画");

      /** 核心功能 */
      var D = $scope.D = {
        text: "",
        bh: "",
        pretext: "",

        words: [],
        setWords: (words) => {
          D.words = angular.extend([], words);
          if (D.words.length <= 0) D.setMenu(MENU.getMenuByName("笔画"));
          else {
            var subMenu = D.words.filter((a, n) => n < 80);
            subMenu.push(MENU.getMenuByName("各种输入"));
            D.setMenu(MENU.Menu({
              status: "选字", //MENU.TMP_STATUS,
              subfn: "text",
              subMenu,
            }));
          };
        },


        item_index: firstMenu.defaultIndex || 0,
        status: firstMenu.status || "就绪",
        items: firstMenu.getItems(),
        menu: firstMenu,
        panelCache: [],
        pushPanel: () => {
          D.panelCache.push({ status: D.status, items: D.items, item_index: D.item_index });
          if (D.panelCache.length > MAX_PANEL_CACHE_LENGTH) D.panelCache.shift();
        },
        popPanel: () => {
          if (D.panelCache.length > MAX_PANEL_CACHE_LENGTH) D.panelCache.shift();
          if (D.panelCache.length > 0) {
            var panel = D.panelCache.pop();
            angular.extend(D, panel);
            return panel;
          }
          return false;
        },

        setMenu: (next_menu) => {
          if (next_menu.name == "主菜单") D.panelCache.length = 0;
          /** 跳到笔画界面时，不是在“选字”状态，就清笔画 */
          if (next_menu.name == "笔画" && D.status != "选字") D.bh = "";

          D.menu = next_menu;
          D.items = angular.extend([], next_menu.getItems());
          D.status = next_menu.status || MENU.TMP_STATUS;
          D.item_index = next_menu.defaultIndex || 0;
        },

        COURSE: {
          left: () => {
            /** 需要返回上级菜单 */
            if (D.menu.mustReturn(D)) {
              D.popPanel();
              return;
            }
            /** 匹配下级菜单 */
            var next_menu = MENU.getMenuByStatus(D.status, D);
            if (next_menu) {
              D.pushPanel();
              D.setMenu(next_menu);
              return;
            }
            /** 无匹配，则显示主菜单 */
            D.setMenu(MENU.getMenuByName("主菜单"));
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
          "menu": (menu) => {
            D.setMenu(menu);
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
                D.item_index = 0;
              }).catch(function (e) {
                D.setWords([]);
                D.item_index = 0;
              });
            }
          },

          "key": item => {
            if (D.EXEC[item.name]) return D.EXEC[item.name](item);
            D.bh += item.name;
          },

          "call": item => {
            console.log(item)
            if (D.EXEC[item.name]) return D.EXEC[item.name](item);
          },

          "全屏": item => {
            toggleFullScreen();
          },

          "退格": item => {
            if (D.bh.length) D.bh = D.bh.substr(0, D.bh.length - 1);
            else D.text = D.text.substr(0, D.text.length - 1);
          },

          "选字": item => {
            D.status = "选字";
            D.setWords(D.words);
            D.item_index = 0;
          },

          "第一字": item => {
            D.status = "选字";
            D.words && D.words[0] && D.EXEC["text"]({ text: D.words[0] });
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
          event.stopPropagation();
          event.preventDefault();
          var e = angular.element(event.target);
          while (e && !e.hasClass("ime-course")) e = e.parent();
          if (!e) return;
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
          console.log("over,", name, "D.processing=", D.processing, "target=", event.target);
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
                console.log(D.processing != name && "取消动画" || "动画完成");
                if (D.processing != name) return;
                D.processing = "完成";
                D.COURSE[name]();
              });
            });
          })
        },
        "out": (name, event) => {
          D.processing && D.animator && D.animator.end()
          D.processing = "移出";
          console.log("移出,", name, "D.processing=", D.processing)
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
      });

      $scope.$watch("D.text", () => {
        var textarea = $element.find('textarea')[0];
        textarea.blur();
        setTimeout(() => {
          //textarea.selectionStart = textarea.selectionEnd = R.pos;
          textarea.focus();
        }, 20);
      });
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