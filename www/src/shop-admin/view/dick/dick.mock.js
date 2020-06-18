
!(function (angular, window, undefined) {

  var theModule = angular.module("mock");

  /** 下拉列表 */
  theModule.run(["sign", "$http", "$q", function (sign, $http, $q) {

    sign.registerHttpHook({
      match: /^下拉列表-我的产品仓库$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax = $http.post("缓存请求", { api: "dick/my_stock", data: {}, delay: 1.2e6 });
        return mockResponse.OK(ajax.then(json => {
          var list = (json.datas.list || []).filter(row => row.type == "产品仓库").map(row => {
            return {
              value: row.value,
              title: row.title
            }
          });
          return { list };
        }));
      }
    });

    sign.registerHttpHook({
      match: /^下拉列表-公司员工$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax = $http.post("缓存请求", { api: "dick/stock_user", data: {}, delay: 1.2e6 });
        return mockResponse.OK(ajax.then(json => {
          var list = (json.datas.list || []).map(row => {
            var attr = row.attr || {};
            return {
              value: row.stock_uid,
              title: `${row.name} (${row.stock_uid})`,
              role: row.role,
              t1: row.t1,
              t2: row.t2,
            }
          });
          return { list };
        }));
      }
    });


    sign.registerHttpHook({
      match: /^下拉列表-木工字典$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax = $http.post("缓存请求", { api: "dick/worker", data: {}, delay: 1.2e6 });
        return mockResponse.OK(ajax.then(json => {
          var list = (json.datas.list || []).filter(row => row.uid&&row.group=="木工").map(row => {
            return {
              value: row.uid,
              title: `${row.name}`,
              group: row.group,
              t1: row.t1,
              t2: row.t2,
            }
          });
          return { list };
        }));
      }
    });

    sign.registerHttpHook({
      match: /^下拉列表-工人$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax = $http.post("缓存请求", { api: "dick/worker", data: {}, delay: 1.2e6 });
        return mockResponse.OK(ajax.then(json => {
          var list = (json.datas.list || []).filter(row => row.uid).map(row => {
            var attr = row.attr || {};
            return {
              value: row.uid,
              title: `${row.name}`,
              group: row.group,
              t1: row.t1,
              t2: row.t2,
            }
          });
          return { list };
        }));
      }
    });

    function Worker_of_type(list, group) {
      list = list.filter(user => user.group == group)
      list.map(row => {
        return {
          value: row.uid,
          title: `${row.name}`,
          group: row.group,
          t1: row.t1,
          t2: row.t2,
        }
      });
      return list;
    }

    var USER_TYPES = [
      { name: "全部", },
      { name: "开料", userType: "开料", dinner: 1 },
      { name: "木工", userType: "木工", dinner: 1 },
      { name: "磨工", userType: "磨工", dinner: 1 },
      { name: "刮磨", userType: "刮磨", dinner: 1 },
      { name: "杂工", userType: "杂工", dinner: 1 },
      { name: "食堂", userType: "食堂", dinner: 1 },
      { name: "管理人员", userType: "管理人员", dinner: 1 },
      { name: "游客", userType: "游客", },
    ];
    USER_TYPES.map(ut => ut.name).map(group => {
      sign.registerHttpHook({
        match: new RegExp(`^下拉列表-工人-${group}$`),
        hookRequest: function (config, mockResponse, match) {
          var ajax = $http.post("缓存请求", { api: "dick/worker", data: {}, delay: 1.2e6 });
          return mockResponse.OK(ajax.then(json => {
            var list = Worker_of_type(json.datas.list, group);
            return { list };
          }));
        }
      });
    });


    sign.registerHttpHook({
      match: /^(下拉列表-产品字典)|产品字典$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax = $http.post("缓存请求", { api: "dick/cp", data: {}, delay: 1.2e6 });
        return mockResponse.OK(ajax.then(json => {
          var list = (json.datas.list || []).filter(a => !a.t2).map(row => {
            var priceTable = angular.extend([], (row.attr || {})['价格表']);
            var price = {};
            var priceTime = {};
            priceTable.map(item => {
              var rq = item["生效日期"];
              var mc = item["木材"];
              if (!priceTime[mc] || rq > priceTime[mc]) {
                priceTime[mc] = rq;
                price[mc] = item["价格"];
              }
            })
            return {
              id: row.id,
              value: row.id,
              title: row.name,
              type: row.type,
              t1: row.t1,
              t2: row.t2,
              "价格表": priceTable,
              "计件价格表": (row.attr || {})['计件价格表'] || [],
              "标准重量": (row.attr || {})['标准重量'],
              price,
              q: priceTable.length ? "价格表" : "无价格未定价",
            }
          });
          return { list };
        }));
      }
    });
    sign.registerHttpHook({
      match: /^(下拉列表-dform-dropdown-产品名)|(下拉列表-产品名)$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax = $http.post("缓存请求", { api: "dick/cp", data: {}, delay: 1.2e6 });
        return mockResponse.OK(ajax.then(json => {
          var list = (json.datas.list || []).filter(a => !a.t2).map(row => {
            var list = JSON.parse(row.v2 || "[]");
            return {
              value: row.name,
              title: row.name,
            }
          });
          return { list };
        }));
      }
    });

    sign.registerHttpHook({
      match: /^(下拉列表-dform-dropdown-木材(种类(字典)?)?)|(下拉列表-木材种类字典)$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax = $http.post("缓存请求", { api: "dick/common", data: {}, delay: 1.2e6 });
        return mockResponse.OK(ajax.then(json => {
          var list = (json.datas.list || []).filter(row => row.k1 == "木材种类").map(row => ({ value: row.v1, fullName: row.v2 }));
          return { list };
        }));
        return mockResponse.OK({ list: ['缅花', '血檀', '鸡翅木', '白酸枝'] });
      }
    });


    /**
     * 套件字典
     * 沙发套件，根据"大茶几"自动生成
     */
    var CTJ = (function () {
      var BASE_sofa = {
        base: ["大茶几", "小茶几", "三人座", "二人座", "单人座", "花几", "炕几", "小方凳"],
        list: [
          {// 六件套（113）
            tj_suffix: "六件套（113）", cp: [
              { cp_suffix: "大茶几", n: 1 },
              { cp_suffix: "三人座", n: 1 },
              { cp_suffix: "单人座", n: 2 },
              { cp_suffix: "花几", n: 2 },
            ]
          },
          {// 八件套（113）
            tj_suffix: "八件套（113）", cp: [
              { cp_suffix: "大茶几", n: 1 },
              { cp_suffix: "三人座", n: 1 },
              { cp_suffix: "单人座", n: 2 },
              { cp_suffix: "花几", n: 2 },
              { cp_suffix: "小方凳", n: 2 },
            ]
          },
          {// 六件套（123）
            tj_suffix: "六件套（123）", cp: [
              { cp_suffix: "大茶几", n: 1 },
              { cp_suffix: "三人座", n: 1 },
              { cp_suffix: "单人座", n: 1 },
              { cp_suffix: "二人座", n: 1 },
              { cp_suffix: "花几", n: 2 },
            ]
          },
          {// 六件套（223）
            tj_suffix: "六件套（223）", cp: [
              { cp_suffix: "大茶几", n: 1 },
              { cp_suffix: "三人座", n: 1 },
              { cp_suffix: "二人座", n: 2 },
              { cp_suffix: "花几", n: 2 },
            ]
          },
          {// 八件套（123）
            tj_suffix: "八件套（123）", cp: [
              { cp_suffix: "大茶几", n: 1 },
              { cp_suffix: "三人座", n: 1 },
              { cp_suffix: "单人座", n: 1 },
              { cp_suffix: "二人座", n: 1 },
              { cp_suffix: "花几", n: 2 },
              { cp_suffix: "小方凳", n: 2 },
            ]
          },
          {// 十一件套
            tj_suffix: "十一件套", cp: [
              { cp_suffix: "大茶几", n: 1 },
              { cp_suffix: "三人座", n: 1 },
              { cp_suffix: "单人座", n: 4 },
              { cp_suffix: "花几", n: 2 },
              { cp_suffix: "小茶几", n: 2 },
              { cp_suffix: "炕几", n: 1 },
            ]
          },
          {// 十三件套
            tj_suffix: "十三件套", cp: [
              { cp_suffix: "大茶几", n: 1 },
              { cp_suffix: "三人座", n: 1 },
              { cp_suffix: "单人座", n: 4 },
              { cp_suffix: "花几", n: 2 },
              { cp_suffix: "小茶几", n: 2 },
              { cp_suffix: "炕几", n: 1 },
              { cp_suffix: "小方凳", n: 2 },
            ]
          },
          {// 九件套（1123）
            tj_suffix: "九件套（1123）", cp: [
              { cp_suffix: "大茶几", n: 1 },
              { cp_suffix: "三人座", n: 1 },
              { cp_suffix: "二人座", n: 1 },
              { cp_suffix: "单人座", n: 2 },
              { cp_suffix: "花几", n: 2 },
              { cp_suffix: "小茶几", n: 1 },
              { cp_suffix: "炕几", n: 1 },
            ]
          },
        ]
      };
      function findAllTJ(cpDick) {
        /** 沙发 */
        var cp1Array = cpDick.filter(cp => /大茶几$/.test(cp.title));
        var TJ = [];
        cp1Array.map(cp1 => {
          findTJ_Sofa(cp1, cpDick).map(tj => TJ.push(tj));
        });
        return TJ;
      }
      /** 根据大茶几，查找沙发套件 */
      function findTJ_Sofa(cp1, cpDick) {
        var preName = cp1.title.substr(0, cp1.title.length - 3);
        var TJ = [];
        var sub_cp = {};
        BASE_sofa.base.map(cp_suffix => {
          var cp = cpDick.find(cp => cp.title == preName + cp_suffix);
          if (cp) sub_cp[cp_suffix] = cp;
        });
        //console.log(preName, sub_cp);
        BASE_sofa.list.map(item => {
          var bad = item.cp.find(row => !sub_cp[row.cp_suffix]);
          //console.log(preName, item.tj_suffix, "bad=", bad);
          if (!bad) TJ.push({
            value: preName + item.tj_suffix,
            title: preName + item.tj_suffix,
            list: item.cp.map(row => ({
              v1: sub_cp[row.cp_suffix].id,
              sl: row.n,
            }))
          });
        });
        //console.log("找到套件：", preName, TJ);
        return TJ;
      }

      return {
        findAllTJ
      }
    })();
    sign.registerHttpHook({
      match: /^(下拉列表-dform-dropdown-产品套件字典)|((下拉列表-)?产品套件字典)$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax = $http.post("缓存请求", { api: "dick/common", data: {}, delay: 1.2e6 });
        return mockResponse.OK(ajax.then(json => {
          var list = (json.datas.list || []).filter(row => row.k1 == "产品套件字典").map(row => {
            var list = JSON.parse(row.v2 || "[]");
            return {
              list,
              id: row.id,
              price: row.v3,
              value: row.v1,
              title: row.v1,
            }
          });
          return { list };
        }));
      }
    });

    sign.registerHttpHook({
      match: /^(下拉列表-dform-dropdown-自动套件)|((下拉列表-)?自动套件)$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax_db_list = $http.post("产品套件字典").then(json => json.datas.list);
        var cpDick = $http.post("产品字典").then(json => json.datas.list);
        return mockResponse.OK(ajax_db_list.then(db_list => {
          return $q.when(cpDick).then(cpDick => {
            var auto_TJ = CTJ.findAllTJ(cpDick).filter(tj => !db_list.find(tj_db => tj_db.title == tj.title));
            //console.log("自动套件：", auto_TJ);
            var list = db_list.concat(auto_TJ);
            return { list };
          }).catch(e => {
            console.error(e);
            return { list: [] }
          });
        }));
      }
    });

    sign.registerHttpHook({
      match: /^分解套件$/,
      hookRequest: function (config, mockResponse, match) {
        var tj_list = angular.merge([], config.data);
        var goodValue = [];
        tj_list.map((tj_item, item_index) => {
          tj_item.$nth = +item_index + 1;
          if (["分组"].indexOf(tj_item.type) >= 0) {
            tj_item.list.map(dj => {
              goodValue.push({
                $nth: tj_item.$nth,
                "分组": {
                  jg: tj_item.jg,
                  tjid: tj_item.tjid,
                  name: tj_item.name,
                  sl: tj_item.sl,
                },
                type: dj.type || "产品",
                name: dj.name || tj_item.name,
                sl: dj.sl * tj_item.sl,
                v1: dj.v1,
              });
            });
          } else {
            goodValue.push(tj_item);
          }
        });
        return mockResponse(goodValue);
      }
    });

    sign.registerHttpHook({
      match: /^合并套件$/,
      hookRequest: function (config, mockResponse, match) {
        var goodValue = config.data || {};
        var showList = [];
        var showListIndexed = {};
        goodValue.map(value_item => {
          if (value_item["套件"] && "旧代码，过渡完成后，删除") {
            var tj_name = value_item["name"] + "-" + value_item["套件"];
            var oldItem = showList.find(item => item.type == "分组" && item.text == tj_name);
            if (!oldItem) {
              oldItem = {
                type: "分组",
                text: tj_name,
                tjid: value_item["套件"],
                name: value_item["name"],
                jg: value_item["套件jg"],
                sl: +value_item["套件sl"] || 0,
                list: [],
              };
              showList.push(oldItem);
            }
            oldItem.list.push({
              type: value_item.type,
              name: value_item.name,
              sl: value_item.sl / value_item["套件sl"],
              v1: value_item.v1,
            });
            return;
          }
          if (!value_item["分组"]) return showList.push(value_item);
          if (value_item.$nth) {
            $nth = value_item.$nth;
            showListIndexed[$nth] = showListIndexed[$nth] || {
              type: "分组",
              text: value_item["分组"].name + "-" + value_item["分组"].tjid,
              jg: value_item["分组"].jg,
              tjid: value_item["分组"].tjid,
              name: value_item["分组"].name,
              sl: value_item["分组"].sl,
              list: [],
            };
            showListIndexed[$nth].list.push({
              type: value_item.type,
              name: value_item.name,
              sl: value_item.sl / value_item["分组"].sl,
              v1: value_item.v1,
            });
          }
        });
        Object.keys(showListIndexed).map($nth => {
          showList.push(showListIndexed[$nth]);
        })
        return mockResponse(showList);
      }
    });

    sign.registerHttpHook({
      match: /^识别套件$/,
      hookRequest: function (config, mockResponse, match) {
        var value = config.data || {};
        if (!angular.isObject(value)) return mockResponse.reject("无效数据");
        if (value.type != "分组") return mockResponse(value);
        var promise_tj_row = $http.post("自动套件").then(json => json.datas.list).then(tj_Dick => {
          var tj = tj_Dick.find(tj => tj.title == value.tjid);
          console.log("识别套件,tj=", tj)
          if (!tj) return value;
          var tj_row = {
            type: "分组",
            text: value.name + "-" + value.tjid,
            name: value.name,
            tjid: value.tjid,
            jg: value.jg,
            sl: value.sl,
            list: angular.merge([], tj.list),
          }
          return tj_row;
        }).catch(e => {
          console.error(e);
        });
        return mockResponse(promise_tj_row);
      }
    });



    sign.registerHttpHook({
      match: /^(下拉列表-dform-dropdown-开料单字典)|(下拉列表-开料单字典)$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax = $http.post("缓存请求", { api: "dick/common", data: {}, delay: 1.2e6 });
        return mockResponse.OK(ajax.then(json => {
          var list = (json.datas.list || []).filter(row => row.k1 == "开料单字典").map(row => {
            var list = JSON.parse(row.v2 || "[]");
            return {
              list,
              id: row.id,
              value: row.v1,
              title: row.v1,
            }
          });
          return { list };
        }));
      }
    });


    sign.registerHttpHook({
      match: /^((下拉列表-dform-dropdown-)?客户(字典)?)|(下拉列表-客户字典)$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax = $http.post("缓存请求", { api: "dick/kh", data: {}, delay: 1.2e6 });
        return mockResponse.OK(ajax.then(json => {
          var list = (json.datas.list || [])
          list.map(row => {
            if (!angular.isString(row.attr) || row.attr.substr(0, 1) != "{") row.attr = "{}";
            var attr = JSON.parse(row.attr);
            if (!angular.isString(row.type) || row.type.substr(0, 1) != "[") row.type = "[]";
            row.type = JSON.parse(row.type || "[]");
            row.value = row.id;
            row.address = attr.address;
            row.title = row.name + " " + row.mobile;
          });
          return { list };
        }));
      }
    });


    sign.registerHttpHook({
      match: /^(下拉列表-dform-dropdown-展厅(字典)?)|(下拉列表-展厅(字典)?)$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax = $http.post("下拉列表-客户字典");
        return mockResponse.OK(ajax.then(json => {
          var list = (json.datas.list || []).filter(item => item.type.indexOf("展厅") >= 0);
          return { list };
        }));
      }
    });


    sign.registerHttpHook({
      match: /^下拉列表-产品分类$/,
      hookRequest: function (config, mockResponse, match) {
        return mockResponse.OK({ list: ['缅花产品', '血檀产品', '鸡翅木产品'] });
      }
    });


    sign.registerHttpHook({
      match: /^(下拉列表-(dform-dropdown-)?)?(全部单据|资产单据|现金单据|流程名称)$/,
      hookRequest: function (config, mockResponse, match) {
        console.log("下拉列表-名称", match)
        var ajax = $http.post("缓存请求", { api: "dick/common", data: {}, delay: 1.2e6 });
        return mockResponse.OK(ajax.then(json => {
          var list = (json.datas.list || []).filter(row => row.k1 == match[3]).map(row => row.v1);
          return { list };
        }));
      }
    });

  }]);
})(angular, window);