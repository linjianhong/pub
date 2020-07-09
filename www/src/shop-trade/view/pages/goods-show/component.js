!(function (angular, window, undefined) {

  var theModule = angular.module("dj-view");

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

})(angular, window);