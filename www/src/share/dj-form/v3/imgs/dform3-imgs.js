(function () {

  var theModule = angular.module('dj-form-v3')
  theModule.filter('preview', function () { //可以注入依赖
    return function (url, width, height) {
      return url + "?x-oss-process=image/resize,w_100";
    }
  });
  theModule.component('dform3Imgs', {
    template: `
      <div class="box flex flex-left flex-wrap">
        <div class="img preview {{selectIndex==$index&&'active'||''}}" long-press="longPress($index)" ng-click="clickImg($index)" ng-repeat='img in imgList track by $index'>
          <img ng-src="{{img|preview}}" ng-if="fileType(img)=='img'"/>
          <video ng-src="{{img}}" ng-if="fileType(img)=='video'"></video>
        </div>
        <div class="img uploading" ng-repeat='file in File.uploadingFiles track by $index'>
          <img/>
          <div class="per">{{file.error||(file.per+'%')}}</div>
        </div>
        <div class="img img-add-btn" ng-if="mode!='show' && imgList.length < (maxCount||9)"">
          <div ng-click="addClick()"></div>
          <input type="file" multiple accept="image/*,video/mp4" dform-files-upload change="File.onFile($files)" ng-show="!fileMode">
        </div>
      </div>
      <div class="flex flex-between" ng-if="mode!='show' && selectIndex>=0">
        <div class="dform3-imgs-edit-btn" ng-click="edit_cut()"><i class="fa fa-cut"></i></div>
        <div class="dform3-imgs-edit-btn" ng-click="edit_left()"><i class="fa fa-arrow-left"></i></div>
        <div class="dform3-imgs-edit-btn" ng-click="edit_right()"><i class="fa fa-arrow-right"></i></div>
        <div class="dform3-imgs-edit-btn" ng-click="edit_exit()"><i class="fa fa-undo"></i></div>
      </div>`,
    bindings: {
      maxCount: "<",
      imgs: "<",
      onChange: "&",
      mode: '@',
      preview: '@'
    },
    controller: ["$scope", "$http", "$q", "$element", "IMG", "DjPop", function ($scope, $http, $q, $element, IMG, DjPop) {
      $scope.imgList = [];
      $scope.fileType = IMG.fileType;
      this.countError = 0;
      this.$onInit = function () {
      }
      this.$onChanges = (changes) => {
        if (changes.imgs) {
          $scope.imgList = angular.merge([], changes.imgs.currentValue || []);
        }
        if (changes.maxCount) {
          $scope.maxCount = +changes.maxCount.currentValue || 99;
        }
        if (changes.mode) {
          $scope.mode = changes.mode.currentValue || "";
        }
      }


      /** */
      $scope.selectIndex = -1;
      $scope.longPress = (n) => {
        console.log("收到：长按", n)
        $scope.selectIndex = n;
      }
      $scope.edit_cut = () => {
        console.log("edit_cut")
        this.deleteImg($scope.selectIndex, $scope.imgList);
        $scope.selectIndex = -1;
      }
      $scope.edit_left = () => {
        console.log("edit_left");
        if ($scope.selectIndex < 1) return;
        var url = $scope.imgList[$scope.selectIndex];
        $scope.imgList.splice($scope.selectIndex, 1);
        $scope.selectIndex = $scope.selectIndex - 1;
        $scope.imgList.splice($scope.selectIndex, 0, url);
        emitValue();
      }
      $scope.edit_right = () => {
        console.log("edit_right");
        if ($scope.selectIndex >= $scope.imgList.length) return;
        var url = $scope.imgList[$scope.selectIndex];
        $scope.imgList.splice($scope.selectIndex, 1);
        $scope.selectIndex = $scope.selectIndex + 1;
        $scope.imgList.splice($scope.selectIndex, 0, url);
        emitValue();
      }
      $scope.edit_exit = () => {
        console.log("edit_exit")
        $scope.selectIndex = -1;
      }

      this.deleteImg = (n, imgs) => {
        if (n < 0 || n >= $scope.imgList.length) return;
        return DjPop.confirm("您确认要删除当前图片?").then(a => {
          imgs.splice(n, 1);
          $scope.imgList = angular.merge([], imgs);
        }).then(() => {
          //console.log("删除图片", $scope.imgList);
          var imgs = angular.merge([], $scope.imgList);
          emitValue();
        })
      }
      $scope.clickImg = (n) => {
        if (this.preview === 'no') return;
        IMG.preview(n, $scope.imgList);
      }
      this.addImg = (url) => {
        if ($scope.imgList.length >= $scope.maxCount) return;
        $scope.imgList.push(url);
        //console.log("添加图片", $scope.imgList);
        var imgs = angular.merge([], $scope.imgList);
        emitValue();
      };

      var emitValue = () => {
        this.onChange && this.onChange({ imgs: $scope.imgList });
      }


      $scope.fileMode = "";
      $http.post("http-hook", "请求图片已上传地址").then(hook => {
        $scope.fileMode = "请求图片已上传地址";
      }).catch(e => {
        return $http.post("http-hook", "请求图片本地文件名").then(hook => {
          $scope.fileMode = "请求图片本地文件名";
        }).catch(e => {
          $scope.fileMode = "";
        })
      });
      $scope.addClick = function () {
        $http.post("http-hook", "请求图片已上传地址").then(hook => {
          return $http.post("请求图片已上传地址").then(json => {
            if (json.datas && json.datas.url) {
              self.addImg(json.datas.url);
            }
          });
        }).catch(e => {
          return $http.post("http-hook", "请求图片本地文件名").then(hook => {
            return $http.post("请求图片本地文件名").then(json => {
              var url = json.datas && json.datas.localUrl || json.datas.url;
              if (url) {
                File.uploadingFiles.push(url);
                File.upload();
              }
            });
          }).catch(e => {
            var fileBox = $element[0].querySelector("input[type='file']");
            fileBox.click();
          })
        });
      }

      /**
       * 上传模块
       **/
      var self = this;
      var File = $scope.File = {
        subTreeId: 0,
        uploadingFiles: [],

        /**
         * 文件选择事件
         **/
        onFile: function (files) {
          //console.log(files);
          if (!files) return;
          console.info('添加文件', files);
          File.uploadingFiles = File.uploadingFiles || [];
          for (var i = 0; i < files.length; i++) {
            File.uploadingFiles.push(files[i]);
          }
          $scope.$apply();
          this.upload().then(urls => {
            urls.map(url => url && self.addImg(url));
            File.uploadingFiles = [];
          });
        },

        /**
         * 上传
         **/
        uploadFile: function (url, file, data) {
          return IMG.upload(url, file, data).then(
            json => {
              return json.datas.url;
            },
            e => {
              //console.info('上传失败, ', file, e);
              return "";
            },
            process => {
              //console.info('上传进度, ', file, process);
              file.per = (process.loaded / file.size * 80).toFixed(2);
              if (file.per > 100) file.per = 100;
            }
          )
        },

        /**
         * 上传
         **/
        upload: function () {
          return $http.post("签名", "upload/img")
            .then(json => json.datas)
            .catch(e => {
              //console.log("准备上传图片，无签名！")
              return { url: "/api/file/upload/img", data: {} };
            })
            .then(signed => {
              return $q.all(
                File.uploadingFiles.map(file => File.uploadFile(signed.url, file, signed.data))
              );
            })
        }
      }
    }]
  });


})();
