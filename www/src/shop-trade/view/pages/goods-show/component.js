!(function (angular, window, undefined) {

  var theModule = angular.module("dj.router.frame");

  /** 图片、视频 - 类型识别 */
  function fileType(url) {
    if (/\.(jpeg|jpg|png|gif|bmp)$/i.test(url)) return "img";
    if (/\.(mp4|avi|mpeg)$/i.test(url)) return "video";
    return "";
  }

  /** 商品小组件 */
  theModule.component("goodsMiniItem", {
    template: `
      <div class="goods-item-body">
        <div height-width class="mini-goods-img-box flex-cc">
          <img class="bk" ng-src="{{values['标题图'][0]||values['缩略图'][0]||values['置顶图'][0]||values['详情图'][0]}}?x-oss-process=image/resize,m_fill,h_200,w_200">
        </div>
        <div class="goods-name line___1">{{values['名称']}}</div>
        <div class="em-12 text-a flex-left line___1">
          <span class="padding-1" ng-repeat="s in values['选项'] track by $index" ng-if="$index<3"><i class="fa fa-check-circle-o"></i>{{s}}</span>
        </div>
      </div>`,
    bindings: {
      detail: "<",
    },
    controller: ["$scope", "$http", "$element", function ($scope, $http, $element) {

      this.$onChanges = (changes) => {
        if (changes.detail && changes.detail.currentValue) {
          $scope.detail = changes.detail.currentValue || { attr: { value: {} } };
          $scope.values = $scope.detail.attr.value;
        }
      }
    }]
  });

  /** 微信分享预览 */
  theModule.component("goodsWxLink", {
    template: `
    <div class="em-14 b-900">{{$ctrl.values['名称']}}</div>
    <div class="flex flex-top">
      <div class="flex-1 padding-v-2 text-8">{{$ctrl.values['描述']}}</div>
      <img class="wx-share-img margin-1" ng-src="{{$ctrl.values['标题图'][0]||$ctrl.values['缩略图'][0]||$ctrl.values['置顶图'][0]||$ctrl.values['详情图'][0]}}?x-oss-process=image/resize,m_fill,h_200,w_200">
    </div>`,
    bindings: {
      values: "<",
    },
    controller: ["$scope", "$http", "$timeout", "IMG", function ($scope, $http, $timeout, IMG) {
    }]
  });

  /** 商品详情 - 营销 */
  theModule.component("goodsShowDetail", {
    template: `
      <goods-wx-link class="margin-1 em-12 flex-v padding-1 bk-f radius" values="values"></goods-wx-link>

      <div ng-if="user.show_more.length">
        <div class="margin-1 em-15 padding-1 bk-f radius">
          <div class="flex margin-2">
            <i class="text-floder fa fa-folder-open-o" ng-click="R.show_more=0" ng-if="R.show_more"></i>
            <i class="text-floder fa fa-folder" ng-click="R.show_more=1" ng-if="!R.show_more"></i>
            <div class="flex-1 text-3 b-900 padding-h-1" ng-click="R.show_more=!R.show_more">参考数据</div>
            <a href="#/goods-shop?code={{detail.id}}" class="text-primary">查看商城</a>
          </div>
          <div class="flex-left padding-2 bt-ccc" ng-repeat="k in user.show_more track by $index" ng-if="R.show_more">
            <div class="text-8">{{k[0]}}：</div>
            <div class="text-0 b-900 padding-h-2">{{values[k[1]||k[0]]}}</div>
          </div>
        </div>
      </div>

      <div class="margin-1 em-12 flex-top padding-1 bk-f radius">
        <img class="wx-share-img" ng-src="{{user.headimg}}">
        <div class="flex-1 flex-v">
          <div class="em-14 b-900 text-primary">{{user.name}}</div>
          <div class="em-12 padding-v-1 text-0 wx-share-desc" html-content="values['描述']"></div>
          <div class="wx-share-img9 padding-v-2 flex-wrap flex-left totle-{{imgs.length}}">
            <img height-width class="img{{$index}}"
              ng-src="{{img}}?x-oss-process=image/resize,m_fill,h_200,w_200"
              ng-click="clickImg($index)"
              ng-repeat="img in imgs track by $index">
          </div>
        </div>
      </div>

      <div class="padding-1">　</div>
      <div class="margin-2 em-12" ng-if="values['相关链接-详情'].length">相关链接：</div>
      <a href="#/goods-dick?code={{link.id}}" ng-repeat="link in values['相关链接-详情']">
        <goods-wx-link class="margin-1 em-12 flex-v padding-1 bk-f radius" values="link.attr.value"></goods-wx-link>
      </a>`,
    bindings: {
      detail: "<",
    },
    controller: ["$scope", "$http", "$timeout", "IMG", function ($scope, $http, $timeout, IMG) {

      var R = $scope.R = {};

      $http.post("店铺用户").then(datas => {
        $scope.user = datas.user;
      });

      this.$onChanges = (changes) => {
        if (changes.detail && changes.detail.currentValue) {
          $scope.detail = changes.detail.currentValue || { attr: { value: {} } };
          var values = $scope.values = $scope.detail.attr.value;
          $scope.imgs = values["原图"] || values["详情图"];
          console.log("values", values)
        }
      }

      $scope.clickImg = (n) => {
        IMG.preview(n, $scope.imgs);
      }

      $scope.$watch("imgs.length", (vNew) => {
        /** 触发图片高度调整 */
        $timeout(() => { }, 100);
      })
    }]
  });

  /** 商品详情 - 商城 */
  theModule.component("goodsShowDetailShop", {
    template: `
    <div class="flex-v">
      <div class="slides-box-row" ng-if="values['轮播图'].length">
        <slides class="slides" imgs="values['轮播图']"></slides>
      </div>
      <div class="em-12 bk-f padding-h-2 bb-ccc">
        <div class="em-16 padding-v-1"><div class="line___1">{{values['名称']}}</div></div>
        <div class="text-warning b-900 flex-left"><span>￥</span> <span class="em-15" number2="{{values.price2}}"></span></div>
        <div class="remove money b-900 flex-left" ng-if="values.price3"><span>￥</span> <span class="em-10" number2="{{values.price3}}"></span></div>
        <div class="em-10 text-a flex-left flex-wrap padding-v-1">
          <span class="margin-1" ng-repeat="s in values['选项'] track by $index"><i class="fa fa-check-circle-o"></i>{{s}}</span>
        </div>
      </div>
      <div class="goods-img-list">
        <div class="flex" ng-repeat="item in list track by $index">
          <img ng-click="clickImg($index)" ng-src="{{item.url}}?x-oss-process=image/resize,w_600" ng-if="item.type=='img'">
          <video ng-src="{{item.url}}" controls="controls" ng-if="item.type=='video'"></video>
        </div>
      </div>
    </div>`,
    bindings: {
      detail: "<",
    },
    controller: ["$scope", "$http", "$timeout", "IMG", function ($scope, $http, $timeout, IMG) {

      $http.post("店铺用户").then(datas => {
        $scope.user = datas.user;
      });

      this.$onChanges = (changes) => {
        if (changes.detail && changes.detail.currentValue) {
          $scope.detail = changes.detail.currentValue || { attr: { value: {} } };
          var values = $scope.values = $scope.detail.attr.value;
          $http.post("店铺模板", values["商城模板"]).then(datas => {
            $scope.tpl = datas;
            $scope.imgs = [].concat(datas.before || [], values["详情图"] || values["原图"] || [], datas.after || []);
            $scope.list = $scope.imgs.map(url => ({
              url,
              type: fileType(url),
            }));
          });
        }
      }

      $scope.clickImg = (n) => {
        if (!$scope.imgs.length) return;
        IMG.preview(n, $scope.imgs);
      }

      $scope.$watch("imgs.length", (vNew) => {
        /** 触发图片高度调整 */
        $timeout(() => { }, 100);
      })
    }]
  });
})(angular, window);