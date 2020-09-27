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
  "dgf-master" => [
    "localStorage_KEY_UserToken" => "mini_shop_master_usertoken",
    "app_wx" => APP_WX_PGY,
    "app_wx3" => APP_WX3,
    "app_wx_xcx" => APP_WX_XCX,
    "apiRoot" => "https://api.jdyhy.com/api-dgf-vers/0.1.0/src/master/",
    "codes" => [
      "ver" => "0.1.0",
      "VER_time" => "2020-06-21 16:10:00",
      "assetsPath" => "https://jdyhy.oss-cn-beijing.aliyuncs.com/www/dgf/assert/output/",
      "files" => [
        "lib-2cc3ab6c0c.css",
        "app-4a64ed5175.css",
        "lib-9dc2c90f07.js",
        "app-c0768d0f9d.js"
      ]
    ]
  ],

];

function site($query)
{
  $R = CODES[$query['app']];
  $R['timestamp'] = time();
  return $R;
}
