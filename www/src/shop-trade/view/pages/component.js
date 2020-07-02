!(function (angular, window, undefined) {

  var theModule = angular.module("order-mini");

  /** 商品小组件 */
  theModule.component("goodsItem", {
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

})(angular, window);