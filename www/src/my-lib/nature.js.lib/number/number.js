/** 数字类扩展 */
!(function () {

  if (!Number.isInteger) {
    Number.isInteger = function (num) {
      return typeof num == "number" && num % 1 == 0;
    };
  }

})();