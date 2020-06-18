angular.module("my", ["dj.router"])
  .run(["$http", "DjRouter", function ($http, DjRouter) {
    DjRouter.when("bbb", "query")
      .otherwise($http.post("用户登录/状态").then(() => "my").catch(() => "my"));
  }])