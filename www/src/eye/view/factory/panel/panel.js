!(function (angular, window, undefined) {

  var theModule = angular.module("dj-app");

  var MAX_PANEL_CACHE_LENGTH = 8;
  var DEFAULT_COURSE = {
    up: "menu",
    down: "enter",
    left: "prev",
    right: "next",
  }
  var DEFAULT_FN_MAP = {
    "text": "onString",
    "key": "onInput",
    "menu": "gotoMenuByName",
    "退格": "backspace",
  }

  theModule.factory("CPanel", ["$q", "$timeout", "MENU", "Settings", function ($q, $timeout, MENU, Settings) {
    var nullMenu = MENU.Menu({})

    class CPanel {
      constructor(options) {
        this.menus = options.menus;
        this.KEYS = options.KEYS;
        this.COURSE = options.COURSE || DEFAULT_COURSE;
        this.FN_MAP = angular.extend({}, DEFAULT_FN_MAP, options.FN_MAP);
        this.COLUMNS = options.COLUMNS || 5;
        this.ROWS = options.ROWS || 5;
        this.hooks = [];
        this.data = {
          keys: "",
          text: "",
          status: "就绪",
          words: [],
          activeMenu: nullMenu,
          activeIndex: 0,
          firstIndex: 0,
          nextMenu: nullMenu,
        };
        this.panelCache = [];
      }
      static create(options) {
        return new CPanel(options)
      }

      pushPanel() {
        var D = this.data;
        this.panelCache.push({ activeMenu: D.activeMenu, items: D.items, activeIndex: D.activeIndex, firstIndex: D.firstIndex });
        if (this.panelCache.length > MAX_PANEL_CACHE_LENGTH) this.panelCache.shift();
      }
      popPanel() {
        var D = this.data;
        if (this.panelCache.length > MAX_PANEL_CACHE_LENGTH) this.panelCache.shift();
        if (this.panelCache.length > 0) {
          var panel = this.panelCache.pop();
          angular.extend(D, panel);
          return $q.resolve(panel);
        }
        return $q.reject("不可后退");
      }

      getNextMenu() {
        var menu = this.menus.find(menu => {
          if (!menu.canShow) return false;
          return menu.canShow(this.data);
        });
        if (menu) return $q.when(menu);
        /** 指定跳转时 */
        var activeMenu = this.data.activeMenu;
        if (activeMenu.onMenu) {
          var onMenu = activeMenu.onMenu;
          while (angular.isFunction(onMenu)) onMenu = onMenu(D, this);
          return $q.when(onMenu);
        }
        return $q.reject("无匹配菜单");
      }

      getMenuByName(name) {
        name = name && name.name || name;
        if (!name) return false;
        return this.menus.find(menu => menu.name == name);
      }

      gotoMenuByName(name) {
        var menu = this.getMenuByName(name);
        if (!menu) return $q.reject("无此菜单: " + name);
        return this.gotoMenu(menu);
      }

      setIndex(n) {
        var D = this.data;
        D.activeIndex = +n || 0;
        if (D.activeIndex < 0) D.activeIndex = D.items.length - 1;
        if (D.activeIndex >= D.items.length) D.activeIndex = 0;
        if (D.activeIndex - D.firstIndex >= this.COLUMNS * this.ROWS) D.firstIndex = ~~(D.activeIndex / this.COLUMNS - 2) * this.COLUMNS;
        if (D.activeIndex - D.firstIndex < 0) D.firstIndex = ~~(D.activeIndex / this.COLUMNS) * this.COLUMNS;
        if (D.firstIndex < 0) D.firstIndex = 0;
      }

      run(menu) {
        var fn = menu.fn;
        if (fn == "call") fn = menu.name;
        fn = this.FN_MAP[fn] || fn;
        if (fn == "run") return $q.reject("错误的功能");
        if (angular.isFunction(this[fn])) return $q.when(this[fn](menu)).then(() => {
          if (menu.nextMenu) return this.gotoMenu(menu.nextMenu)
        });
        return $q.reject("未定义功能");
      }

      course(name) {
        var fn = "course_" + this.COURSE[name];
        if (angular.isFunction(this[fn])) return $q.when(this[fn]());
        return $q.reject(`未定义方向:${name}, fn=${fn}`);
      }

      course_menu() {
        var D = this.data;
        /** 需要返回上级菜单 */
        if (D.activeMenu.mustReturn(D)) {
          this.popPanel();
          return;
        }
        /** 匹配下级菜单 */
        this.getNextMenu().then((next_menu) => {
          this.pushPanel();
          this.gotoMenu(next_menu);
          return;
        }).catch(e => {
          /** 无匹配，则显示主菜单 */
          this.gotoMenuByName("主菜单");
        });
      }

      course_enter() {
        var D = this.data;
        this.run(D.items[D.activeIndex]);
      }
      course_prev() { this.setIndex(this.data.activeIndex - 1); }

      course_next() { this.setIndex(this.data.activeIndex + 1); }

      backspace() {
        return this.setInput(-1).then(() => {
          return "keys"
        }).catch(e => {
          return this.setText(-1);
        });
      }

      onString(menu) {
        var input = menu.text || menu.name;
        if (!input) return $q.reject("不是输入文字");
        this.setText(input, "+");
        $timeout(() => this.setInput(""));
        return $q.when({ input, text: this.data.text });
      }

      onInput(menu) {
        var input = menu.text || menu.name;
        if (this.KEYS.indexOf(input) < 0) return $q.reject("不合法输入");
        this.setInput(input, "+");
        return $q.when({ input, keys: this.data.keys });
      }

      setInput(input, mode = "") {
        if (input === -1 || mode == "backspace" || mode == "-" || mode < 0) {
          if (this.data.keys.length <= 0) return $q.reject("无已输入");
          this.data.keys = this.data.keys.substr(0, this.data.keys.length - 1);
        }
        else if (mode == "append" || mode == "+" || mode > 0) this.data.keys += input;
        else this.data.keys = input;
        this.hooks.filter(hook => hook.name == "on-input").map(hook => hook.callback(this.data.keys, this));
        return $q.when(this.data.keys);
      }

      setText(text, mode = "") {
        if (text === -1 || mode == "backspace" || mode == "-" || mode < 0) {
          if (this.data.text.length <= 0) return $q.reject("无内容可退格");
          text = -1;
          this.data.text = this.data.text.substr(0, this.data.text.length - 1);
        }
        else if (mode == "append" || mode == "+" || mode > 0) this.data.text += text;
        else this.data.text = text;
        this.hooks.filter(hook => hook.name == "on-text").map(hook => hook.callback(text, this.data.text, this.data));
        return $q.when(this.data.text);
      }

      registHook(name, callback) {
        this.hooks.push({ name, callback });
      }

      setWords(words) {
        if (words.length <= 0) return $q.reject("无备选字词");
        this.data.firstIndex = 0;
        this.data.words = angular.extend([], words);
        var subMenu = this.data.words.filter((a, n) => n < 80);
        subMenu.push(this.getMenuByName("各种输入"));
        return this.gotoMenu(MENU.Menu({
          status: "选字", //MENU.TMP_STATUS,
          subfn: "text",
          subMenu,
        })).then(words_menu => {
          return words;
        });
      }

      gotoMenu(nextMenu) {
        var D = this.data;
        while (angular.isFunction(nextMenu)) nextMenu = nextMenu(D, this);
        return D.activeMenu.close(nextMenu).then((nextMenu) => {
          D.activeMenu = nextMenu;
          D.firstIndex = 0;
          D.items = angular.extend([], nextMenu.getItems());
          this.setIndex(nextMenu.defaultIndex || 0);
          return nextMenu;
        });
      }

      "选字"(item) {
        this.setWords(this.data.words);
        this.data.words = [];
      }

      "第一字"(item) {
        var D = this.data;
        if (!D.words || !D.words[0]) return $q.reject("无备选字词");
        return this.onString({ text: D.words[0] });
      }

      "全屏"(item) {
        toggleFullScreen();
      }
      "速度+"(item) {
        Settings.load().then(data => {
          var duration = data.duration || 0.9;
          duration -= 0.1;
          if (duration < 0.3) duration = 0.3;
          Settings.saveValue({ duration });
        });
      }

      "速度-"(item) {
        Settings.load().then(data => {
          var duration = data.duration || 0.9;
          duration += 0.1;
          if (duration > 2) duration = 2;
          Settings.saveValue({ duration });
        });
      }
    }

    return CPanel;

  }]);

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