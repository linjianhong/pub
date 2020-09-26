/** 腾讯地图 */
!(function (angular, window, undefined) {

  class CMAP {
    constructor(TMAP) {
      this.MAP = TMAP;
      this.controls = {}
    }

    LatLng(lat, lng) {
      return new this.MAP.LatLng(lat, lng);
    }

    getCenter() {
      return this.map.getCenter();
    }

    setCenter(center) {
      this.map.setCenter(center);
      return this;
    }

    getZoom() {
      return this.map.getZoom();
    }

    setZoom(zoom) {
      this.map.setZoom(zoom);
      return this;
    }

    on_bounds_changed(callback) {
      // this.map.on("bounds_changed", (a, b, c) => {
      //   callback(a.bounds);
      // });
      this.MAP.event.addListener(
        this.map,
        'zoom_changed',
        function (a) {
          callback(a);
        }
      );
    }
    // 移除缩放控件
    removeControl(name) {
      this.controls[name] = this.controls[name] || this.map.getControl(name);
      if (!this.map.getControl(name)) { // 如果map上不存在该控件则直接返回
        return;
      }
      this.map.removeControl(name);
      return this;
    }

    // 把存储的缩放控件添加到地图上
    addControl(name) {
      var control = this.map.getControl(name);
      if (control || !this.controls[name]) return;
      this.map.addControl(this.controls[name]);
      return this;
    }

    attach(id, options) {
      var ele = document.getElementById(id)
      var mapOptions = angular.extend({ zoom: 15 }, options);
      // 构造腾讯地图
      var theMap = new this.MAP.Map(ele, mapOptions);
      this.map = theMap;

      if (mapOptions.center) {
        theMap.setCenter(mapOptions.center)
      } else if (mapOptions.autoCenter !== false) {
        CMAP.getPosition().then(data => {
          console.log("定位", data)
          var center = this.LatLng(data.lat, data.lng)
          //this.setCenter(center)
        }).catch(e => {
          console.error("定位失败", e)
        })
      }

      // 隐藏 腾讯 LOGO
      // ele.querySelector(".logo-text").parentElement.style.display = "none"

      return this;
    }
  }

  /** 地理位置 */
  angular.module('tmap').factory("TMAP", ["$q", function ($q) {

    //  var url = "https://map.qq.com/api/js?v=2.exp&key=NBLBZ-2WKCW-UP2RA-RYWTX-E673J-F5BE4";
    //  //var url = "https://mapapi.qq.com/jsapi_v2/2/4/135/main.js";
    //  var theAmapDefer = $q.defer();
    //  var theAmapPromise = theAmapDefer.promise;
    //  var jsapi = document.createElement('script');
    //  jsapi.charset = 'utf-8';
    //  jsapi.src = url;
    //  document.head.appendChild(jsapi);
    //  //alert("高德地图初始化")
    //  jsapi.onload = function () {
    //    setTimeout(() => {
    //      CMAP.MAP = window.qq.maps;
    //      theAmapDefer.resolve(theAmapPromise = window.qq.maps);
    //      //alert("高德地图就绪")
    //    });
    //  }

    function ready() {
      var MAP = window.qq.maps;
      // window.qq.maps = false;
      return $q.when(MAP)
    }

    function attach(id, options) {
      return ready().then(MAP => {
        return new CMAP(MAP).attach(id, options);
      });
    }


    function getPosition(options) {
      var url = "https://apis.map.qq.com/tools/geolocation/min?key=NBLBZ-2WKCW-UP2RA-RYWTX-E673J-F5BE4&referer=myapp";
      var defer = $q.defer();
      var jsapi = document.createElement('script');
      jsapi.charset = 'utf-8';
      jsapi.src = url;
      document.head.appendChild(jsapi);
      //alert("高德地图初始化")
      jsapi.onload = function () {
        setTimeout(() => {
          var geolocation = new qq.maps.Geolocation();
          geolocation.getLocation(function (position) {
            defer.resolve(position);
          }, function (e) {
            defer.reject(e);
          }, options);
          //alert("高德地图就绪")
        });
      }
      return defer.promise;
    }
    CMAP.getPosition = getPosition;


    return {
      ready,
      attach,
      getPosition,
    }

  }]);


})(angular, window);
