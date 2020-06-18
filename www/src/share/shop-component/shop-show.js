/* info-row */
!(function (angular, window, undefined) {

  var theModule = angular.module("dj.router");

  theModule.component("haibao", {
    template: `
      <img class="bk" ng-src="{{row.attr.value['海报'][0]}}">
      <div class="subscribe" ng-if="0">
        <img class="headimg" ng-src="{{ DATAS.share_user && DATAS.share_user.headimgurl || '/images/default-headimg.jpg'}}">
        <div class="nickname">{{DATAS.share_user && DATAS.share_user.xd || DATAS.share_user.nickname || '莆仙'}}{{shop.nextname || '微商城'}}</div>
        <a href='#/frame/home' class="block"><i class="fa fa-user a"> </i> <div class=b>个人中心</div></a>
        <div class="sep"></div>
        <div class="block" ng-click="sc()"><i class="fa fa-star-o a"> </i> <div class=b>收藏本店</div></div>
        <div class="sep"></div>
        <div class="block"><div class="a color-00f">{{shop.totle||'216'}}</div><div class=b>全部产品</div></div>
      </div>`,
    bindings: {
      row: "<",
    },
    controller: ["$scope", "$http", "DjState", function ($scope, $http, DjState) {
      this.$onChanges = (changes) => {
        if (changes.row && changes.row.currentValue) {
          $scope.row = changes.row.currentValue;
        }
      }
    }]
  });

  theModule.component("shopShow", {
    template: `
      <div class="flex-v">
        <haibao class="haibao" row="row" ng-if="row.attr.value['海报'].length"></haibao>
        <div class="goods-list flex-wrap flex-top flex-left">
          <goods-item ng-click="showGoods(code)" code="code" ng-repeat="code in goods"></goods-item>
        </div>
      </div>`,
    bindings: {
      code: "<",
      mode: "@",
    },
    controller: ["$scope", "$http", "DjState", function ($scope, $http, DjState) {
      this.$onChanges = (changes) => {
        if (changes.code && changes.code.currentValue) {
          var code = changes.code.currentValue;
          $http.post("缓存请求", { api: "shop/shop_goods", data: { code }, delay: 2e5 }).then(json => {
            $scope.row = json.datas.shop;
            $scope.goods = json.datas.goods;
          });
        }
      }
      $scope.showGoods = code => DjState.go(this.mode || "goods", { code });
    }]
  });


  theModule.component("goodsItem", {
    template: `
      <div class="goods-item-body">
        <div height-width class="mini-goods-img-box flex-cc">
          <img class="bk" ng-src="{{values['缩略图'][0]||values['置顶图'][0]||values['详情图'][0]}}?x-oss-process=image/resize,m_fill,h_200,w_200">
          <div class="subscribe" ng-if="0">
          </div>
        </div>
        <div class="goods-name line___1">{{values['名称']}}</div>
        <div class="money flex em-12">
          <div class="remove b-900" money="{{values['原价']}}"></div>
          <div class="text-warning b-900" money="{{values['价格']}}"></div>
        </div>
      </div>`,
    bindings: {
      code: "<",
    },
    controller: ["$scope", "$http", "$element", function ($scope, $http, $element) {

      this.$onChanges = (changes) => {
        if (changes.code && changes.code.currentValue) {
          var code = changes.code.currentValue;
          $http.post("缓存请求", { api: "qrcode/detail", data: { code }, delay: 2e5 }).then(json => {
            $scope.row = json.datas.detail;
            $scope.values = (json.datas.detail.attr || {}).value;
          });
        }
      }
    }]
  });


})(angular, window);
