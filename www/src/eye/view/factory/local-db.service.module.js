/**
 * 本地数据服务
 * 依赖：浏览器
 **/
!(function(angular, window, undefined){'use strict';

  angular.module('Storage', [])
  .factory('Storage', ['$q', function($q) {
    if(window.indexedDB){
      var open = function (options){
        var request = open.request
        options = angular.extend({}, open.defaults, options);
        if(request){
          var db = request.result;
          var transaction = db.transaction([options.tableName], 'readwrite');
          var store = transaction.objectStore(options.tableName);
          options.onStore && options.onStore({store: store, db: db});
        }
        else{
          request = indexedDB.open(options.dbName, options.ver);
          request.onerror=function(e){
            console.log(e.currentTarget);
          };
          request.onupgradeneeded = options.onupgradeneeded || function(e){
            var db = e.target.result;
            if(!db.objectStoreNames.contains(options.tableName)){
              db.createObjectStore(options.tableName, {keyPath: options.keyName});
            }
          }
          request.onsuccess = function(e){
            var db = e.target.result;
            var transaction = db.transaction([options.tableName], 'readwrite');
            transaction.oncomplete = function(){
              //console.log('transaction.oncomplete');
            }
            transaction.onerror = function(e){
              console.log('onerror', e);
            };
            var store = transaction.objectStore(options.tableName);
            options.onStore && options.onStore({store: store, db: db});
          };
        }
      }

      open.defaults = {
        dbName    : 'db1',
        tableName : 'table1',
        ver       : 1,
        keyName   : 'id',
        keyValue  : 'id1'
      };

      function read(options1, options2){
        var deferred = $q.defer();
        var options = angular.extend({}, open.defaults, options1, options2);
        options.onStore = function(e){
          var request = e.store.get(options.keyValue);
          request.onerror = function(e) {
            deferred.reject(e);
          };
          request.onsuccess = function(e) {
            deferred.resolve(request.result);
          };
        }
        open(options);
        return deferred.promise;
      }

      function save(datas, options1, options2){
        var deferred = $q.defer();
        var options = angular.extend({}, open.defaults, options1, options2);
        options.onStore = function(e){
          var arr = JSON.parse(JSON.stringify(datas));
          arr[options.keyName] = options.keyValue;
          e.store.put(arr);
          deferred.resolve(datas);
        }
        open(options);
        return deferred.promise;
      }

      return {
        open: open,
        read: read,
        save: save
      }
    }
    else{
      function noop(){
        return $q.reject('no indexedDB');
      }
      return {
        open: noop,
        read: noop,
        save: noop
      }
    }
  }])
})(angular, window);
