!(function (angular, window, undefined) {

  var theModule = angular.module("dj.router.frame");

  theModule.component("pageHome", {
    pageTitle: "商城 - 首页",
    requireLogin: true,
    autoDestroy: true,
    pageCss: "bk-e",
    header: { hide: true },
    footer: { hide: true },
    template: `
      <div class="flex header xp-warning padding-1">
        <div class="flex-1 flex-left flex-v-center padding-1">
          <div class="padding-1 em-15">通用微商城</div>
        </div>
        <div class="flex">
          <div class="flex-2 fa-icon {{icon.css}}" ng-repeat="icon in icons" ng-click="icon.click()">
            <i class="fa fa-{{icon.fa}}"></i>
          </div>
        </div>
      </div>
      <div class="flex-1 flex flex-top flex-stretch">
        <div class="w-em8 shrink0 group-list bk-d v-scroll">
          <div class="group-list-parent" ng-repeat="dick1 in D.DICK track by $index">
            <div class="item {{D.dick1==dick1&&!D.dick2&&'active'}}" ng-click="D.click_group(dick1)">{{dick1.name}}</div>
            <div class="group-list-parent" ng-repeat="dick2 in dick1.sub track by $index">
              <div class="item {{D.dick1==dick1&&D.dick2==dick2&&'active'}}" ng-click="D.click_group(dick1,dick2)">{{dick2.name}}</div>
            </div>
          </div>
        </div>
        <div class="flex-1 v-scroll pos-box">
          <div class="" ng-repeat="dick1 in D.DICK track by $index">

            <div class="goods-list-dick-name bb-ccc" pos="{{dick1.name}}" ng-if="dick1.list.length">{{dick1.name}}</div>
            <div class="flex bb-ccc bk-f" ng-repeat="item in dick1.list track by $index">
              <div class="flex-v flex-1 padding-2">
                <div class="em-15 b-900">{{item.item.attr.value['名称']}}</div>
                <div class="flex-left">
                  <div class="goods-tag" ng-if="item.item.attr.value['重量']">{{item.item.attr.value['重量']}}</div>
                  <div class="goods-tag" ng-if="item.item.attr.value['标签1']">{{item.item.attr.value['标签1']}}</div>
                  <div class="goods-tag" ng-if="item.item.attr.value['标签2']">{{item.item.attr.value['标签2']}}</div>
                  <div class="goods-tag" ng-if="item.item.attr.value['标签3']">{{item.item.attr.value['标签3']}}</div>
                </div>
                <div class="text-warning em-15 b-900" ng-if="item.item.attr.value['price1']">¥ {{item.item.attr.value['price1']|number:2}}</div>
                <div class="text-stop em-12" ng-if="!item.item.attr.value['price1']">时价</div>
              </div>
              <div class="flex flex-v-center shrink0 input-spin em-15">
                <div class="text-a em-15" ng-if="item.item.n">
                  <div ng-click="D.dec(item.item,1)"><i class="text-c fa fa-minus-square-o"></i></div>
                  <div ng-click="D.dec(item.item,10)"><i class="text-6 fa fa-minus-square-o"></i></div>
                </div>
                <div class="n padding-h-2" >{{item.item.n||''}}</div>
                <div class="text-info em-15">
                  <div ng-click="D.add(item.item,1)"><i class="fa fa-plus-square"></i></div>
                  <div ng-click="D.add(item.item,10)"><i class=" text-warning fa fa-plus-square"></i></div>
                </div>
              </div>
            </div>

            <div class="" ng-repeat="dick2 in dick1.sub track by $index">
              <div class="goods-list-dick-name bb-ccc" pos="{{dick1.name}}-{{dick2.name}}" ng-if="dick2.list.length">{{dick1.name}} - {{dick2.name}}</div>
              <div class="flex bb-ccc bk-f" ng-repeat="item in dick2.list track by $index">
                <div class="flex-v flex-1 padding-2">
                  <div class="em-15 b-900">{{item.item.attr.value['名称']}}</div>
                  <div class="flex-left">
                    <div class="goods-tag" ng-if="item.item.attr.value['重量']">{{item.item.attr.value['重量']}}</div>
                    <div class="goods-tag" ng-if="item.item.attr.value['标签1']">{{item.item.attr.value['标签1']}}</div>
                    <div class="goods-tag" ng-if="item.item.attr.value['标签2']">{{item.item.attr.value['标签2']}}</div>
                    <div class="goods-tag" ng-if="item.item.attr.value['标签3']">{{item.item.attr.value['标签3']}}</div>
                  </div>
                  <div class="text-warning em-15 b-900" ng-if="item.item.attr.value['price1']">¥ {{item.item.attr.value['price1']|number:2}}</div>
                  <div class="text-stop em-12" ng-if="!item.item.attr.value['price1']">时价</div>
                </div>
                <div class="flex flex-v-center shrink0 input-spin em-15">
                  <div class="text-a em-15" ng-if="item.item.n">
                    <div ng-click="D.dec(item.item,1)"><i class="text-c fa fa-minus-square-o"></i></div>
                    <div ng-click="D.dec(item.item,10)"><i class="text-6 fa fa-minus-square-o"></i></div>
                  </div>
                  <div class="n padding-h-2" >{{item.item.n||''}}</div>
                  <div class="text-info em-15">
                    <div ng-click="D.add(item.item,1)"><i class="fa fa-plus-square"></i></div>
                    <div ng-click="D.add(item.item,10)"><i class=" text-warning fa fa-plus-square"></i></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <div class="flex flex-stretch bt-ccc">
        <div class="padding-1 flex-v flex-cc br-ccc">
          <div class="text-8">共 <d class="text-stop">{{D.order.types||0}}</d> 种</div>
          <div class="text-0">计 <d class="text-stop">{{D.order.n||0}}</d> 件</div>
        </div>
        <div class="flex-1 text-warning em-15 b-900 flex-cc">¥ {{(D.order.money||0)|number:2}}</div>
        <div class="{{D.order.n&&'box-warning'||'box-disabled'}} w-em6 em-12 flex-cc">下单</div>
      </div>`,
    controller: ["$scope", "$http", "$q", "$element", "DjState", "SHOP_FN", function ctrl($scope, $http, $q, $element, DjState, SHOP_FN) {
      $element.addClass("flex-v flex-1");
      var H = (function () {
        var KEY_NAME = "user_oreder";
        function save(order) {
          console.log("Save order", order)
          var t = +new Date();
          window.localStorage.removeItem(KEY_NAME);
          window.localStorage.setItem(KEY_NAME, JSON.stringify({
            t,
            order,
          }))

        }
        function load() {
          var s = window.localStorage.getItem(KEY_NAME);
          var json = JSON.parse(s || "{}");
          if (!angular.isObject(json) || !json.t) json = { t: 0 };
          var t = +new Date();
          if (t - json.t > 18 * 3.6e6) json = { t, order: { list: [] } }
          return $q.when(json.order);
        }
        load();
        return { save, load };
      })();

      var D = $scope.D = {
        full_list: [],
        DICK: {},
        initList: () => {
          D.list = [];
          D.DICK.map(dick1 => {
            dick1.list = [];
            D.full_list.filter(item => SHOP_FN.fit(item, dick1, "")).map(item => {
              dick1.list.push({
                item,
                dick1,
              });
            });
            (dick1.sub || []).map(dick2 => {
              dick2.list = [];
              D.full_list.filter(item => SHOP_FN.fit(item, dick1, dick2)).map(item => {
                dick2.list.push({
                  item,
                  dick1,
                  dick2,
                });
              });
            })
          });
          D.DICK.map(dick => dick.sub = dick.sub && dick.sub.filter(a => a.list && a.list.length));
          D.DICK = D.DICK.filter(a => a.list && a.list.length || a.sub && a.sub.length);
          H.load().then(order => {
            console.log("order", order);
            (order.list || []).map(order_item => {
              var item = D.full_list.find(item => item.id == order_item.id);
              if (item) item.n = order_item.n;
            });
            D.calcu_order();
          })
        },
        click_group: (dick1, dick2) => {
          D.dick1 = dick1;
          D.dick2 = dick2;
          D.scrollto(dick1, dick2)
        },
        scrollto: (dick1, dick2) => {
          console.log("选择", dick1.name, dick2 && dick2.name)

          var ele_pos = document.querySelector("[pos='" + dick1.name + (dick2 ? "-" + dick2.name : "") + "']", $element[0]);
          var header = document.querySelector(".header", $element[0]);
          var box = document.querySelector(".pos-box", $element[0]);
          var top = ele_pos.offsetTop - header.offsetHeight;
          D.scrolling = true;
          box.scrollTo({
            top,
            behavior: 'smooth' //  smooth(平滑滚动),instant(瞬间滚动),默认auto
          });
          //setTimeout(() => D.scrolling = false, 500);
        },
        add: (item, n) => {
          item.n = (item.n || 0) + n;
          D.calcu_order();
          H.save(D.order);
        },
        dec: (item, n) => {
          item.n = item.n > 0 ? item.n - n : 0;
          if (item.n < 0) item.n = 0;
          D.calcu_order();
          H.save(D.order);
        },
        calcu_order: () => {
          D.order = {
            n: 0,
            types: 0,
            money: 0,
            list: [],
          };
          D.full_list.map(item => {
            if (item.n > 0) {
              D.order.n += item.n;
              D.order.types++;
              D.order.money += item.n * (item.attr.value['price1'] || 0);
              D.order.list.push({
                id: item.id,
                n: item.n,
                name: item.attr.value["名称"],
                price: item.attr.value["price1"]
              });
            }
          })
        },
      }

      setTimeout(() => {
        var box = document.querySelector(".pos-box", $element[0]);
        var header = document.querySelector(".header", $element[0]);
        var timerId;
        box.addEventListener('scroll', () => {
          if (D.scrolling) {
            clearTimeout(timerId);
            timerId = setTimeout(() => {
              D.scrolling = false;
            }, 100);
            return;
          }
          //console.log("识别位置", +new Date())
          var scrollTop = box.scrollTop + header.offsetHeight;
          var dick1, dick2;
          dick1 = D.DICK.find(dick1 => {
            var ele_pos = document.querySelector("[pos='" + dick1.name + "']", $element[0]).parentElement;
            if (ele_pos.offsetTop + ele_pos.offsetHeight >= scrollTop) {
              dick2 = (dick1.sub || []).find(dick2 => {
                var ele_pos = document.querySelector("[pos='" + dick1.name + "-" + dick2.name + "']", $element[0]).parentElement;
                return ele_pos.offsetTop <= scrollTop && ele_pos.offsetTop + ele_pos.offsetHeight >= scrollTop;
              });
              return true;
            }
          });
          D.dick1 = dick1;
          D.dick2 = dick2;
          $scope.$apply();
        });

      }, 1000);

      $http.post("店铺商品列表", 8008001).then(json => {
        $scope.row = json.datas.shop;
        $scope.goods = json.datas.goods;
        D.full_list = json.datas.goods || [];
        var groups = json.datas.groups || [];
        console.log("groups", groups);
        var baseDick = SHOP_FN.GROUP.tree(groups, D.full_list);
        D.DICK = baseDick;
        D.initList();
        console.log("D.DICK", D.DICK, "D.full_list", D.full_list)
        console.log("baseDick", baseDick);
        console.log("D.list", D.list);
      }).catch(e => console.error(e));

      $scope.icons = [
        { css: "text-e", fa: "home", text: "我的", click: () => { DjState.go("my", {}); } },
      ];
    }]
  });


  /** 产品详情 - 商城模式 */
  theModule.component("pageGoodsShop", {
    pageTitle: "产品详情",
    requireLogin: false,
    autoDestroy: true,
    pageCss: "bk-e",
    header: { hide: true },
    footer: { hide: true },
    template: `
    <a href="#/home" class="fixed rt2 flex-cc"><i class="fa fa-home b-900"></i></a>
    <a href="#/my" class="fixed rt1 flex-cc"><i class="fa fa-user-o b-900"></i></a>
    <goods-show-detail-shop detail="detail"></goods-show-detail-shop>
    <action-bar code="code"></action-bar>`,
    controller: ["$scope", "$http", "DjState", "DjRouter", function ctrl($scope, $http, DjState, DjRouter) {
      var code = $scope.code = DjRouter.$search.code;
      function reload_self() {
        $http.post("店铺商品列表", 8008001).then(json => {
          var list = json.datas.goods || [];
          var detail = $scope.detail = list.find(item => item.id == code);
          var values = detail.attr.value;
          if (angular.isArray(values["相关链接"])) {
            values["相关链接-详情"] = values["相关链接"].map(link => list.find(item => item.id == link.id)).filter(a => !!a);
          }
          var imgUrl = values['标题图'][0] || values['缩略图'][0] || values['置顶图'][0] || values['详情图'][0];
          values["描述"] = values["描述"] || "我的公司";
          setTimeout(() => {
            $http.post("WxJssdk/setShare", {
              title: values["名称"], // 分享标题
              desc: values["描述"], // 分享描述
              link: location.origin + location.pathname + "#/goods-shop?code=" + code, // 分享链接
              imgUrl: imgUrl || "https://jdyhy.oss-cn-beijing.aliyuncs.com/www/store/assert/images/xls.logo.png", // 分享图标
              type: 'link', // 分享类型,music、video或link，不填默认为link
            });
          }, 100);
        });
      }
      reload_self();
    }]
  });



})(angular, window);
