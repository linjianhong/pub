/* 主程序 */
!(function (angular, window, undefined) {

  var theModule = angular.module('dj-view');
  theModule.component('fixedMenu', {
    transclude: true,
    template: `
      <div class="menu-back" ng-if="showMenu">
      </div>
      <div class="menu-btn">
        <img src="https://jdyhy.oss-cn-beijing.aliyuncs.com/www/msa/assert/images/menu.gif" ng-click="clickMenu($event)">
      </div>
      <pop-menu-box-menu class="left-bottom" ng-if="showMenu" ng-transclude></pop-menu-box-menu>
      `,
    bindings: {
    },
    controller: ['$scope', '$http', '$q', '$element', function ctrl($scope, $http, $q, $element) {
      $scope.showMenu = false;
      $scope.clickMenu = function (event) {
        if ($scope.showMenu) {
          //console.log('1')
        }
        else {
          //console.log('2')
          $scope.showMenu = true;
          event.stopPropagation();
          autoCloseMenu();
        }
      }

      function autoCloseMenu() {
        var closeMenu = function () {
          $scope.showMenu = false;
          $scope.$apply();
          document.removeEventListener('click', closeMenu);
        }
        document.addEventListener('click', closeMenu);
      }

    }]
  });

  theModule.component('popMenuBox', {
    template: `
      <div class="pop-menu-box-back" ng-if="showMenu"></div>
      <div class="pop-menu-box-body">
        <div class="{{$ctrl.cssBody||''}}" ng-transclude="body" ng-click="clickMenu($event)"></div>
        <div ng-if="showMenu">
          <div class="pop-menu-box-menu popup-menu {{$ctrl.cssMenu||'bottom-left'}}" ng-transclude="menu"></div>
        </div>
      </div>
      `,
    transclude: {
      'body': '?popMenuBoxBody',
      'menu': '?popMenuBoxMenu'
    },
    bindings: {
      cssBody: "<",
      cssMenu: "<",
      close: "&"
    },
    controller: ['$scope', '$http', '$q', '$element', function ($scope, $http, $q, $element) {
      $scope.showMenu = false;

      $scope.clickMenu = function (event) {
        if (!$scope.showMenu) {
          $scope.showMenu = true;
          event.stopPropagation();
          autoCloseMenu();
        }
      }

      var autoCloseMenu = function () {
        var closeMenu = function () {
          $scope.showMenu = false;
          this.close();
          $scope.$apply();
          document.removeEventListener('click', closeMenu);
        }
        document.addEventListener('click', closeMenu);
      }

    }]
  });

})(angular, window);
