
/** 字符串类扩展 */
!(function () {

  /** 含有数字时，按数字大小比较两串大小 */
  !(function () {
    function compUseNumber(a, b) {
      var aa = ((a || "") + "").match(/(\d+|[^\d]+)/g) || [];
      var bb = ((b || "") + "").match(/(\d+|[^\d]+)/g) || [];
      var length = aa.length;
      for (var i = 0; i < length; i++) {
        if (bb.length < i) {
          this.console.log("太短了")
        }
        if (Number.isInteger(+aa[i]) && Number.isInteger(+bb[i])) {
          var c = aa[i] - bb[i];
          if (c) return c;
        }
        else {
          var c = aa[i].localeCompare(bb[i] || "")
          if (c) return c;
        }
      }
      return bb.length > aa.length ? -1 : 0;
    }
    String.compUseNumber = compUseNumber;
    String.prototype.compUseNumber = function (b) {
      return compUseNumber(this.toString(), b);
    };
  })();


  /** 按顺序，计算两串的可断共同子串最大长度 */
  !(function () {
    function max_fitLength(a, b, pos_a, pos_b) {
      if (a.length <= pos_a || b.length <= pos_b) return 0;
      if (a[pos_a] == b[pos_b]) return max_fitLength(a, b, pos_a + 1, pos_b + 1) + 1;
      var l1 = max_fitLength(a, b, pos_a + 1, pos_b);
      var l2 = max_fitLength(a, b, pos_a, pos_b + 1);
      return l1 > l2 ? l1 : l2;
    }
    function fitLength(a, b) {
      return max_fitLength(a, b, 0, 0);
    }
    String.fitLength = fitLength;
    String.prototype.fitLength = function (b) {
      return fitLength(this.toString(), b);
    };
  })();


  /** 无序，计算两串共同拥有的字符数量 */
  !(function () {
    function sameChars(a, b) {
      a = a.split("").sort();
      b = b.split("").sort();
      var pos_a = a.length - 1;
      var pos_b = b.length - 1;
      var n = 0;
      for (; pos_a >= 0 && pos_b >= 0;) {
        if (a[pos_a] == b[pos_b]) {
          n++;
          pos_a--;
          pos_b--;
        }
        else if (a[pos_a] > b[pos_b]) {
          pos_a--;
        } else {
          pos_b--;
        }
      }
      return n;
    }
    String.sameChars = sameChars;
    String.prototype.sameChars = function (b) {
      return sameChars(this.toString(), b);
    };
  })();

})();