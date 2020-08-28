!(function (angular, window, undefined) {

  var theModule = angular.module("dj-app");

  var TMP_STATUS = "临时";

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
    "nextMenu",
    "onMenu",
    "nextMenu",
  ];


  theModule.factory("MENU", ["$q", function ($q) {

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

      close(nextMenu) {
        return $q.resolve(nextMenu);
      }
    }
    function Menu(options) { return new CMenu(options); }

    return {
      CMenu,
      Menu,
    };

  }]);

})(angular, window);