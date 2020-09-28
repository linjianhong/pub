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

    panTo(lat, lng, options) {
      if (lat.hasOwnProperty("lat")) {
        return this.panTo(lat.lat, lat.lng, lng);;
      }
      var center = this.LatLng(lat, lng);
      if (angular.isNumber(options)) options = { duration: options };
      this.map.panTo(center, angular.extend({ duration: 100 }, options));
      return this;
    }

    getCenter() {
      return this.map.getCenter();
    }

    setCenter(lat, lng) {
      if (lat.hasOwnProperty("lat")) {
        return this.setCenter(lat.lat, lat.lng);;
      }
      var center = this.LatLng(lat, lng);
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
      this.MAP.event.addListener(
        this.map,
        'bounds_changed',
        callback
      );
    }

    attach(id, options) {
      var ele = document.getElementById(id)
      var mapOptions = angular.extend({
        zoom: 15,
        //disableDefaultUI: true,
        panControl: false,       //平移控件的初始:停用状态。
        zoomControl: true,       //缩放控件的初始:启用状态。
        zoomControlOptions: { position: qq.maps.ControlPosition.RIGHT_BOTTOM, style: 2 }, //缩放控件的位置和风格
        scaleControl: false,    //比例尺控件的初始:停用状态。
        mapTypeControl: false,  //地图类型控件的初始:停用状态。
      }, options);
      // 构造腾讯地图
      var theMap = new this.MAP.Map(ele, mapOptions);
      this.map = theMap;

      if (mapOptions.center) {
        theMap.setCenter(mapOptions.center)
      } else if (mapOptions.autoCenter !== false) {
        CMAP.getPosition().then(data => {
          console.log("定位", data)
          var center = this.LatLng(data.lat, data.lng)
          this.setCenter(center)
        }).catch(e => {
          console.error("定位失败", e)
        })
      }
      return this;
    }
  }

  /** 地理位置 */
  angular.module('tmap').factory("TMAP", ["$q", "$http", function ($q, $http) {

    var url = "https://map.qq.com/api/js?v=2.exp&key=NBLBZ-2WKCW-UP2RA-RYWTX-E673J-F5BE4&callback=init_tmap";
    //var url = "https://mapapi.qq.com/jsapi_v2/2/4/135/main.js";
    var theAmapDefer = $q.defer();
    var theAmapPromise = theAmapDefer.promise;
    var jsapi = document.createElement('script');
    jsapi.charset = 'utf-8';
    jsapi.src = url;
    document.head.appendChild(jsapi);
    window.init_tmap = function () {
      CMAP.MAP = window.qq.maps;
      theAmapDefer.resolve(theAmapPromise = window.qq.maps);
    }

    function ready() {
      return $q.when(theAmapPromise);
    }

    function attach(id, options) {
      return ready().then(MAP => {
        var theMap = new CMAP(MAP).attach(id, options);

        var ele = document.getElementById(id)
        var deferred = $q.defer();

        function checkLoaded() {
          // console.log("检查", checkLoaded.n);
          if (ele.children[0] && ele.children[0].childElementCount > 1) {
            console.log("检查, 有", ele.children[0].childElementCount);
            deferred.resolve(1);
            return $q.when(1);
          }
          setTimeout(() => {
            checkLoaded.n = (checkLoaded.n || 0) + 1;
            if (checkLoaded.n > 1e3) {
              deferred.reject("太久了")
              return;
            }
            checkLoaded();
          }, 16);
          return deferred.promise;
        }

        return checkLoaded().then(() => {
          //setTimeout(() => {
          // 隐藏LOGO和copyright
          if (angular.isPC) ele.children[0].children[2].remove();
          ele.children[0].children[1].remove();
          // var n = ele.children[0].childElementCount;
          // for (var i = n - 1; i > 0; i--) ele.children[0].children[i].remove();
          // for (var i = n - 1; i > 0; i--) ele.children[0].children[i].remove();
          theMap.on_map_load && theMap.on_map_load();
          //});
          return theMap;
        });

      });
    }

    function qqGeoReady() {
      if (qqGeoReady.promise) {
        return $q.when(qqGeoReady.promise);
      }
      var defer = $q.defer();
      qqGeoReady.promise = defer.promise;

      //var url = "https://apis.map.qq.com/tools/geolocation/min?key=NBLBZ-2WKCW-UP2RA-RYWTX-E673J-F5BE4&referer=myapp";
      var url = "https://3gimg.qq.com/lightmap/components/geolocation/geolocation.min.js";
      var jsapi = document.createElement('script');
      jsapi.charset = 'utf-8';
      jsapi.src = url;
      document.head.appendChild(jsapi);
      jsapi.onload = function () {
        defer.resolve(qqGeoReady.promise = qq.maps);
      }
      return qqGeoReady.promise;
    }

    function promiseOfCaller(caller, self) {
      var defer = $q.defer();
      caller.call(self, function (position) {
        defer.resolve(position);
      }, function (e) {
        defer.reject(e);
      });
      return defer.promise;
    }

    function getQQGeoPosition(options) {
      return qqGeoReady().then(MAP => {
        var geolocation = new MAP.Geolocation("NBLBZ-2WKCW-UP2RA-RYWTX-E673J-F5BE4", "myapp");
        return promiseOfCaller(geolocation.getLocation, geolocation);
      });
    }

    function getQQIpPosition(options) {
      return qqGeoReady().then(MAP => {
        var geolocation = new MAP.Geolocation("NBLBZ-2WKCW-UP2RA-RYWTX-E673J-F5BE4", "myapp");
        return promiseOfCaller(geolocation.getIpLocation, geolocation);
      });
    }

    function getWxPosition(options) {
      return $http.post("微信位置");
    }

    /** 自动定位: 微信位置 - IP定位 - 精确定位 */
    function getPosition(options) {
      return getWxPosition().then(position => {
        console.log("有 微信位置", position);
        return position;
      }).catch(e => {
        console.error("无 微信位置", e);
        return getQQIpPosition();
      }).catch(e => {
        console.error("IP定位失败", e);
        return getQQGeoPosition();
      }).catch(e => {
        console.error("定位失败", e);
        return $q.reject(e);
      });
    }
    CMAP.getPosition = getPosition;


    return {
      ready,
      attach,
      getQQGeoPosition,
      getQQIpPosition,
      getWxPosition,
      getPosition,
    }

  }]);


})(angular, window);
