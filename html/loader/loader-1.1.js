/** 加载器 ver 1.1 支持离线加载 */
(function (window) {

  var DEBUG_MODE = true;
  var LOADER_VER = "1.0";
  var API_APP_SITE = "app/site";

  function ajax(url, callback, fail) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          var status = xhr.status;
          if (status >= 200 && status < 300) {
            callback(xhr.responseText, xhr.responseXML);
          } else {
            fail(status);
          }
        }
      }
      xhr.open("GET", url, true);
      xhr.send(null);
    } catch (e) {
      fail(status);
    }
  }
  function CLoader(apiRoot, moduleName, localStorageKeyName) {
    this.apiRoot = apiRoot;
    this.moduleName = moduleName;
    this.localStorageKeyName = localStorageKeyName;
  }
  CLoader.prototype = {
    run: function () {
      var moduleName = this.moduleName;
      ajax(this.apiRoot + API_APP_SITE + "?app=" + moduleName, (str) => {
        this.isOnline = true;
        try {
          var json = JSON.parse(str);
          runJson(json);
        } catch (e) {
          this.codes = [];
          console.error("fetch site config error", e);
        }
      }, (errorStatus) => {
        this.isOnline = false;
        var allJson = this.getLocalJson();
        var modules = allJson.modules;
        var thisModule = modules.find(a => a.name == moduleName);
        if (!thisModule) {
          console.error("无缓存，无法离线加载", moduleName)
        }
        var json = thisModule.json;
        runJson(json);
      });

      var runJson = (json) => {
        if (!json || !json.datas || json.errcode !== 0) {
          console.error("fetch site config error", json);
          return;
        }
        this.codesConfig = json.datas.codes;
        if (!this.codesConfig || !Array.isArray(this.codesConfig.files)) {
          console.error("fetch site config error", "no codes");
          return;
        }
        window.theSiteConfig = window.theSiteConfig || {};
        window.theSiteConfig.apiRoot = this.apiRoot;
        for (var k in json.datas) {
          window.theSiteConfig[k] = json.datas[k];
        }
        this.loadCodes({ name: moduleName, json });

      }
    },

    getLocalJson: function () {
      var strCodes = localStorage.getItem(this.localStorageKeyName) || "{}";
      if (strCodes[0] != "{") strCodes = "{}";
      try {
        var json = JSON.parse(strCodes) || {};
        if (!Array.isArray(json.allCodes)) json.allCodes = [];
        if (!Array.isArray(json.modules)) json.modules = [];
        var allCodes = json.allCodes;
        allCodes.sort((a, b) => b.t - a.t);
        // sure that localStorage used here less than 3M.
        if (strCodes.length > 3e6) {
          allCodes.pop();
          this.saveJsonToLocalStorage(json);
          return this.getLocalJson();
        }
        return json;
      } catch (e) {
        return { modules: [], allCodes: [] }
      }
    },

    saveToLocalStorage: function (args) {
      var moduleArgs = args.moduleArgs;
      var allJson = this.getLocalJson();
      var modules = allJson.modules;
      var thisModule = modules.find(a => a.name == moduleArgs.name);
      if (thisModule) {
        thisModule.json = moduleArgs.json;
      } else {
        modules.push(moduleArgs);
      }
      allJson.allCodes = args.allCodes;
      this.saveJsonToLocalStorage(allJson);
    },

    saveJsonToLocalStorage: function (json) {
      localStorage.removeItem(this.localStorageKeyName);
      localStorage.setItem(this.localStorageKeyName, JSON.stringify(json));
    },

    loadCodes: function (moduleArgs) {
      var allJson = this.getLocalJson();
      var allCodes = allJson.allCodes;
      var running = {
        next_nth: 0,
        pushRun: (param) => {
          // 
          if (param.nth == running.next_nth) {
            if (param.nth < this.codesConfig.files.length) this.execCodes(param.fn, param.text);
            else {
              // now all done.
              this.saveToLocalStorage({ moduleArgs, allCodes: param.allCodes });
            }
            running.next_nth = param.nth + 1;
            if (running.waiting[running.next_nth]) running.pushRun(running.waiting[running.next_nth]);
          }
          else {
            running.waiting[param.nth] = param;
          }
        },
        waiting: []
      }
      this.codesConfig.files.map((fn, nth) => {
        if (/\.css$/i.test(fn)) {
          return running.pushRun({ nth: nth, fn: fn });
        }
        var oldCode = allCodes.find(item => item.fn == fn);
        if (this.isOnline) {
          if (oldCode && oldCode.ver != LOADER_VER) {
            allCodes = allCodes.filter(a => a != oldCode);
            oldCode = false;
          }
          if (oldCode) {
            oldCode.t = +new Date();
            running.pushRun({ nth: nth, fn: fn, text: oldCode.text });
          }
          else ajax(this.codesConfig.assetsPath + fn, (str) => {
            oldCode = {
              t: +new Date(),
              ver: LOADER_VER,
              fn: fn,
              text: str,
            }
            allCodes.push(oldCode);
            running.pushRun({ nth: nth, fn: fn, text: oldCode.text });
          })
        }
        else {
          if (!oldCode || !oldCode.text) {
            console.error("无缓存, 无法离线加载", fn);
            return;
          }
          running.pushRun({ nth: nth, fn: fn, text: oldCode.text });
        }
      });
      running.pushRun({ nth: this.codesConfig.files.length, allCodes: allCodes });
    },

    execCodes: function (filename, fileContent) {
      if (/\.css$/i.test(filename)) {
        var css = document.createElement("link");
        css.setAttribute("rel", "stylesheet");
        css.setAttribute("type", "text/css");
        css.setAttribute("href", this.codesConfig.assetsPath + filename);
        document.head.appendChild(css);
      } else if (/\.js$/i.test(filename)) {
        if (DEBUG_MODE) fileContent = "try{" + fileContent + "}catch(e){alert(e);}";
        script = document.createElement("script");
        script.text = fileContent;
        document.head.appendChild(script).parentNode.removeChild(script);
      }
    },
  }

  window.Loader = {
    ajax: ajax,
    load: function (apiRoot, moduleName, localStorageKeyName) {
      new CLoader(apiRoot, moduleName, localStorageKeyName).run();
    },
  }
})(window);