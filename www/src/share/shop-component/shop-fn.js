!(function (angular, window, undefined) {

  var theModule = angular.module("dj-view")

  function get_goods_group(goods_list) {
    var DICK = [];
    goods_list.map(goods => {
      if (!goods || !goods.attr || !goods.attr.value) return;
      var value = goods.attr.value;
      add2dick(DICK, value["分类11"], value["分类12"], value["分类13"]);
      add2dick(DICK, value["分类21"], value["分类22"], value["分类23"]);
      add2dick(DICK, value["分类31"], value["分类32"], value["分类33"]);
    });
    return DICK;
  }
  function add2dick(DICK, k1, k2, k3) {
    if (k1) {
      var dick1 = DICK;
      var node1 = dick1.find(node => node.name && node.name == k1);
      if (!node1) {
        dick1.push(node1 = { name: k1 });
      }
      if (k2) {
        if (!angular.isArray(node1.sub)) node1.sub = [];
        var dick2 = node1.sub;
        var node2 = dick2.find(node => node.name && node.name == k2);
        if (!node2) {
          dick2.push(node2 = { name: k2 });
        }
        if (k3) {
          if (!angular.isArray(node2.sub)) node2.sub = [];
          var dick3 = node2.sub;
          var node3 = dick3.find(node => node.name && node.name == k3);
          if (!node3) {
            dick3.push(node3 = { name: k3 });
          }
        }
      }
    }
  }
  function fit(goods, dick1, dick2, dick3) {
    if (!goods || !goods.attr || !goods.attr.value) return false;
    var value = goods.attr.value;
    if (fit123(dick1, dick2, dick3, value["分类11"], value["分类12"], value["分类13"])) return true;
    if (fit123(dick1, dick2, dick3, value["分类21"], value["分类22"], value["分类23"])) return true;
    if (fit123(dick1, dick2, dick3, value["分类31"], value["分类32"], value["分类33"])) return true;
    return false;
  }
  function fit123(dick1, dick2, dick3, k1, k2, k3) {
    if (!k1 || k1 != dick1.name) return false;
    if (!k2 && !dick2) return true;
    if (!k2 || k2 != dick2.name) return false;
    if (!k3 && !dick3) return true;
    if (!k3 || k3 != dick3.name) return false;
    return true
  }


  function filter_group(item, arr) {
    if (!angular.isArray(arr)) return true;
    if (arr[0] && item.attr.value["分类11"] != arr[0]) return false;
    if (arr[1] && item.attr.value["分类12"] != arr[1]) return false;
    if (arr[2] && item.attr.value["分类13"] != arr[2]) return false;
    return true;
  }


  var GROUP = {
    sort_k: (nth) => {
      return (1e9 + (+nth || -1) + "-").substr(1, 99);
    },

    /**
     * 将数据库中的分类列表，转换为树结构
     */
    tree: function (base_list, goods_list) {
      var tree = [];
      base_list = angular.merge([], base_list);
      base_list.map(item => {
        item.attr = item.attr || { value: {} };
        item.attr.value = item.attr.value || {};
        item.name = item.attr.value["name"];
        var isParent = !item.attr.value["v1"];
        if (isParent) {
          tree.push(item);
          item.k = GROUP.sort_k(item.attr.value["v2"] || item.id);
          item.sub = item.sub || [];
        } else {
          var parent = base_list.find(a => a.id == item.attr.value["v1"] && !a.attr.value["v1"]);
          if (parent) {
            parent.sub = parent.sub || [];
            parent.sub.push(item);
            item.k = GROUP.sort_k(item.attr.value["v2"]);
          } else {
            tree.push(item);
            item.k = GROUP.sort_k(-item.id);
          }
        }
      });
      tree.sort((a, b) => a.k == b.k ? 0 : a.k > b.k ? 1 : -1);
      tree.map(item => item.sub && item.sub.sort((a, b) => a.k == b.k ? 0 : a.k > b.k ? 1 : -1));


      (goods_list || []).map(goods => {
        if (!goods || !goods.attr || !goods.attr.value) return;
        var value = goods.attr.value;
        add2dick(tree, value["分类11"], value["分类12"], value["分类13"]);
        add2dick(tree, value["分类21"], value["分类22"], value["分类23"]);
        add2dick(tree, value["分类31"], value["分类32"], value["分类33"]);
      });

      return tree;
    },

  }

  theModule.factory("SHOP_FN", [function () {
    return {
      get_goods_group,
      filter_group,
      fit,
      GROUP,
    }
  }])

  /**
   * 根据产品列表，分析得到所有分类树，用于多级联动控件
   */
  theModule.run(['sign', function (sign) {
    sign.registerHttpHook({
      match: /^get_goods_group$/,
      hookRequest: function (config, mockResponse, match) {
        var param = config.data;
        return mockResponse(get_goods_group(param));
      }
    });
  }]);

  /**
   * 一个函数
   */
  theModule.run(['sign', function (sign) {
    sign.registerHttpHook({
      match: /^filter_group$/,
      hookRequest: function (config, mockResponse, match) {
        var param = config.data;
        return mockResponse(filter_group);
      }
    });
  }]);


})(angular, window);
