/* 我的页面 */
!(function (angular, window, undefined) {

  var theModule = angular.module("dj.router");

  var TPL_GOODS = [
    {
      name: "2019模板",
      list: [
        "http://xlsgdjj.oss-cn-beijing.aliyuncs.com/www/stock/assert/images/tpl-goods/2019-1.jpg",
        "http://xlsgdjj.oss-cn-beijing.aliyuncs.com/www/stock/assert/images/tpl-goods/2019-2.jpg",
        "http://xlsgdjj.oss-cn-beijing.aliyuncs.com/www/stock/assert/images/tpl-goods/2019-3.jpg",
        "http://xlsgdjj.oss-cn-beijing.aliyuncs.com/www/stock/assert/images/tpl-goods/2019-4.jpg",
        "http://xlsgdjj.oss-cn-beijing.aliyuncs.com/www/stock/assert/images/tpl-goods/2019-5.jpg",
        "http://xlsgdjj.oss-cn-beijing.aliyuncs.com/www/stock/assert/images/tpl-goods/2019-6.jpg",
        "http://xlsgdjj.oss-cn-beijing.aliyuncs.com/www/stock/assert/images/tpl-goods/2019-7.jpg",
      ]
    }
  ];

  function fileType(url) {
    if (/\.(jpeg|jpg|png|gif|bmp)$/i.test(url)) return "img";
    if (/\.(mp4|avi|mpeg)$/i.test(url)) return "video";
    return "";
  }


  theModule.component("goodsShow", {
    template: `
      <div class="flex-v">
        <div class="slides-box-row" ng-if="values['轮播图'].length">
          <slides class="slides" imgs="values['轮播图']"></slides>
        </div>
        <div class="em-16 bk-f padding-h-2 bb-ccc">
          <div class="text-warning b-900 flex-left"><span>￥</span> <span class="em-15" number2="{{values['价格']}}"></span></div>
          <div class="remove money b-900 flex-left"><span>￥</span> <span class="em-10" number2="{{values['原价']}}"></span></div>
        </div>
        <div class="bk-f padding-h-2 bb-ccc">
          <div class="em-16  padding-v-2"><div class="line___1">{{values['名称']}}</div></div>
          <div class="em-12 text-a flex">
            <span class="paddi ng-2" ng-repeat="s in values['选项'] track by $index"><i class="fa fa-check-circle-o"></i>{{s}}</span>
          </div>
        </div>
        <div class="goods-img-list">
          <div class="flex" ng-repeat="item in list track by $index">
            <img ng-click="preview($index,values['详情图'])" ng-src="{{item.url}}" ng-if="item.type=='img'">
            <video ng-src="{{item.url}}" controls="controls" ng-if="item.type=='video'"></video>
          </div>
          <div class="flex" ng-repeat="item in tplImgs track by $index">
            <img ng-click="preview($index,tplImgs)" ng-src="{{item}}">
          </div>
        </div>
      </div>`,
    bindings: {
      code: "<",
    },
    controller: ["$scope", "$http", "DjState", "IMG", function ($scope, $http, DjState, IMG) {
      $scope.preview = IMG.preview;

      this.$onChanges = (changes) => {
        if (changes.code && changes.code.currentValue) {
          var code = changes.code.currentValue;
          reload(code);
        }
      }

      function reload(code) {
        $http.post("缓存请求", { api: "qrcode/detail", data: { code }, delay: 2e6 }).then(json => {
          $scope.row = json.datas.detail;
          $scope.values = $scope.row.attr.value || {};
          $scope.list = ($scope.values['详情图'] || []).map(url => ({
            url,
            type: fileType(url),
          }));
          $scope.tplImgs = (TPL_GOODS.find(tpl => tpl.name == $scope.values["模板"])||{}).list;
        }).catch(e => {
          console.error(e)
        });
      }

      $scope.$on("qrcode-detail-reset", (event, data) => {
        if (this.code != data.code) return;
        reload(this.code);
      });

      // $scope.$on('$destroy', function () {
      //   console.log("$destroy");
      // });
    }]
  });
})(angular, window);
