
angular.module("dj-view", [
  "angularMoment",
  "dj.core",
  "dj.router-ver3",
  "dj.usertoken",
]).run(["moment", function (moment) {
  moment.locale("zh-cn");
}]);
