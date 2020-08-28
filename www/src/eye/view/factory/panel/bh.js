!(function (angular, window, undefined) {

  var theModule = angular.module("dj-app");

  var TMP_STATUS = "临时";

  theModule.factory("CPanelBH", ["$q", "CPanel", "MENU", "IME", "ImeBH", "Settings", function ($q, CPanel, MENU, IME, ImeBH, Settings) {

    var myIME = IME.create({ getPreshow: ImeBH.getPreshow });

    var Menu = MENU.Menu;
    var KEYS = ["一", "丨", "丿", "丶", "乛"];

    var ALL_MENUS = (function () {
      var
        Menu_BH = Menu({ name: "笔画", status: "笔画", fn: "menu", subfn: "key", subMenu: KEYS, onMenu: () => Menu_HOME, }),
        Menu_Symbol = Menu({ name: "符号", status: "连续输入", fn: "menu", subfn: "text", subMenu: "，。！？；：“”…" }),
        Menu_123 = Menu({ name: "数字", status: "连续输入", fn: "menu", subfn: "text", subMenu: "1234567890.-+×÷" }),
        Menu_abc = Menu({ name: "abc", status: "连续输入", fn: "menu", subfn: "text", subMenu: "abcdefghijklmnopqrstuvwxya" }),
        Menu_ABC = Menu({ name: "ABC", status: "连续输入", fn: "menu", subfn: "text", subMenu: "ABCDEFGHIJKLMNOPQRSTUVWXYA" }),
        Menu_SETTINGS = Menu({ name: "功能", status: "菜单", fn: "menu", subfn: "call", subMenu: ["全屏", "速度+", "速度-"] }),
        Menu_RETURN = Menu({ name: "换行", fn: "text", text: "\n" }),
        Menu_BACKSPACE = Menu({ name: "退格", fn: "call" }),

        Menu_INPUTS = Menu({ name: "各种输入", status: "菜单", fn: "menu", subMenu: [Menu_Symbol, Menu_123, Menu_abc, Menu_ABC, Menu_RETURN] }),
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
        Menu_BH, Menu_Symbol, Menu_123, Menu_abc, Menu_ABC, Menu_SETTINGS, Menu_RETURN, Menu_BACKSPACE, Menu_INPUTS, Menu_HOME,

        Menu_BH.extendCopy({
          canShow: (D) => { return D.activeMenu && D.activeMenu.status == "连续输入" },
          onMenu: Menu_HOME,
          needReturn: (D) => { return !D.keys; },
        }),

        Menu({
          name: "正在输入笔画时弹出",
          canShow: (D) => { return D.activeMenu && D.activeMenu.status == "笔画" && D.keys && D.keys.length; },
          status: TMP_STATUS,
          subMenu: [
            { name: "第一字", fn: "call" },
            { name: "选字", fn: "call" },
            { name: "退格", fn: "call" },
          ]
        }),

        Menu({
          name: "无笔画时弹出",
          canShow: (D, preMenu) => { return D.activeMenu && D.activeMenu.status == "笔画" && (!D.keys || !D.keys.length); },
          onMenu: Menu_BH,
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
          canShow: (D) => { return D.activeMenu && D.activeMenu.status == "选字"; },
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

      return ALL_MENUS;
    })();

    class CPanelBH extends CPanel {

      constructor(options) {
        options = angular.extend({}, options, {
          KEYS,
          menus: ALL_MENUS,
          FN_MAP: {

          }
        })
        super(options);
        this.init();
      }
      static create(options) {
        return new CPanelBH(options)
      }

      init() {
        var D = this.data;
        Settings.load().then(data => {
          D.text = data.inputing || "";
        });
        this.gotoMenuByName("笔画");

        this.registHook("on-input", bh => {
          if (!bh) {
            D.words = [];
            return;
          }
          myIME.getPreshow(bh).then(function (words) {
            D.words = words;
          });
        });

        this.registHook("on-text", (input, text, D) => {
          if (!input || input === -1 || D.activeMenu.status == "连续输入") {
            return;
          }
          /** 词语联想 */
          myIME.selectPreshow(input).then((words) => {
            return this.setWords(words);
          }).catch(function (e) {
            return this.gotoMenuByName("笔画");
          });
        });
      }

    }


    return CPanelBH;

  }]);

})(angular, window);