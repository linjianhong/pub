<?php

const APP_WX = [
  "appid" => "wx1e9fc5f5d37bc375",
  "name" => "xls",
  "redirect_uri" => "https://xlsgdjj.com/bridge/wx-auth",
];
const APP_WX_PGY = [
  "appid" => "wx3a807a2f301479ae",
  "name" => "pgy-wx",
  "redirect_uri" => "https://jdyhy.com/bridge/wx-auth",
];
const APP_WX3 = [
  "appid" => "wxffc089a88065e759",
  "name" => "pgy-web",
  "redirect_uri" => "https://jdyhy.com/bridge/wx-auth",
];
const APP_WX_XCX = [
  "appid" => "",
  "name" => "msa-xcx",
  "redirect_uri" => "",
];

const CODES = [
  "shop-admin" => [
    "localStorage_KEY_UserToken" => "mini_shop_master_usertoken",
    "app_wx" => APP_WX_PGY,
    "app_wx3" => APP_WX3,
    "app_wx_xcx" => APP_WX_XCX,
    "apiRoot" => "https://api.jdyhy.com/api-mini_shop-vers/0.1.0/src/shop/",
    "codes" => [
      "ver" => "0.1.0",
      "VER_time" => "2020-06-21 16:10:00",
      "assetsPath" => "https://xlsgdjj.oss-cn-beijing.aliyuncs.com/www/mini_shop/assert/output/",
      "files" => [
        "lib-2cc3ab6c0c.css",
        "lib-9dc2c90f07.js",
        "app-cee1fb0235.css",
        "app-c40e9be728.js"
      ]
    ]
  ],
  "shop-trade" => [
    "localStorage_KEY_UserToken" => "mini_shop_master_usertoken",
    "app_wx" => APP_WX_PGY,
    "app_wx3" => APP_WX3,
    "app_wx_xcx" => APP_WX_XCX,
    "apiRoot" => "https://api.jdyhy.com/api-mini_shop-vers/0.1.0/src/shop/",
    "codes" => [
      "ver" => "0.1.0",
      "VER_time" => "2020-06-21 16:10:00",
      "assetsPath" => "https://xlsgdjj.oss-cn-beijing.aliyuncs.com/www/mini_shop/assert/output/",
      "files" => [
        "lib-2cc3ab6c0c.css",
        "lib-9dc2c90f07.js",
        "app-485ce78f80.css",
        "app-b0a4c34aa4.js"
      ]
    ]
  ],

];

function site($query)
{
  //$reg = '/^\'(([^\'\\\\]|(\\\\.))*)\'/';
  //$reg = '/^\'(([^\\\'\\\\]|(\\\.))*)\'/';
  //$reg = '/^\'(([\x{4e00}-\x{9fa5}]|[^\\\'\\\\]|(\\\\.))*)\'/u';
  //$express = "'地13'3";
  //$a = preg_match($reg, $express, $match);
  //\DJApi\API::debug(['a' => $a, 'express' => $express, 'match' => $match, 'reg' => $reg]);

  //$reg = '/^\"(([\x{4e00}-\x{9fa5}]|[^\\\"\\\\]|(\\\\.))*)\"/u';
  //$express = '"地12"12';
  //$a = preg_match($reg, $express, $match);
  //\DJApi\API::debug(['a' => $a, 'express' => $express, 'match' => $match, 'reg' => $reg]);

  $R = CODES[$query['app']];
  $R['timestamp'] = time();
  return $R;
}
