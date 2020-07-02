!(function (angular, window, undefined) {

  var theModule = angular.module("order-mini");

  /** 商品小组件 */
  theModule.component("orderRow", {
    template: `
      <div class="order-row">
        <div class="flex padding-1 bb-ccc">
          <div class="text-info">订单号：{{order['id']}}</div>
          <div class="text-8">{{order['t_order']}}</div>
        </div>
        <div class="bk-f">
          <div class="bb-ccc padding-1 flex" ng-repeat="row in order.list track by $index">
            <div class="" ng-init="values=goods[row.code].attr.value">
              <div class="em-15 b-900">{{goods[row.code].attr.value['名称']}}</div>
              <div class="flex-left">
                <div class="goods-tag" ng-if="goods[row.code].attr.value['重量' ]">{{goods[row.code].attr.value['重量']}}</div>
                <div class="goods-tag" ng-if="goods[row.code].attr.value['标签1']">{{goods[row.code].attr.value['标签1']}}</div>
                <div class="goods-tag" ng-if="goods[row.code].attr.value['标签2']">{{goods[row.code].attr.value['标签2']}}</div>
                <div class="goods-tag" ng-if="goods[row.code].attr.value['标签3']">{{goods[row.code].attr.value['标签3']}}</div>
              </div>
              <div class="remove money em-12">¥ {{goods[row.code].attr.value['price1']|number:2}}</div>
            </div>
            <div class="">
              <div class="em-15 text-3 b-900" number2="{{row.price}}"></div>
              <div class="">× {{row.n}}</div>
            </div>
          </div>
        </div>
        <div class="flex-right padding-1">
          <div class="text-8">总价：</div>
          <div class="em-15 text-warning b-900" number2="{{order.totle}}"></div>
        </div>
      </div>`,
    bindings: {
      order: "<",
    },
    controller: ["$scope", "$http", "$element", function ($scope, $http, $element) {

      this.$onChanges = (changes) => {
        if (changes.order && changes.order.currentValue) {
          $scope.order = changes.order.currentValue;
          console.log($scope.order)
        }
      }

      $scope.$watch("order.list")

      $http.post("店铺商品列表", 8008001).then(json => {
        $scope.goods = {};
        json.datas.goods.map(item => $scope.goods[item.id] = item);
        console.log("$scope.goods=", $scope.goods)
      }).catch(e => console.error(e));

    }]
  });


})(angular, window);