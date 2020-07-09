angular.module("my", ["dj.router"])
  .run(["$http", "DjState", function ($http, DjState) {
    DjState.when("bbb", "query")
      .otherwise($http.post("用户登录/状态").then(() => "my").catch(() => "my"));
  }])