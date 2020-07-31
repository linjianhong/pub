<?php

namespace RequestByApiShell;

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

class class_app
{

  /**
   * 接口： app/site
   * 对时
   * @return timestamp
   */
  public static function site($request)
  {
    $R = [
      'timestamp' => time(),
      "app_wx3" => APP_WX3,
      'wxShare' => [
        'title' => '', // 分享标题
        'desc' => '', // 分享描述
        'link' => '',
        'imgUrl' => '', // 分享图标
      ],
      'main_menu' => [
        [ 'text'=>'打字', 'i'=> 'edit', 'path'=>'ime'],
        [ 'text'=>'查询', 'i'=> 'search', 'path'=>'page2'],
        [ 'text'=>'我的', 'i'=> 'user', 'path'=>'my'],
      ],
    ];
    return  \DJApi\API::OK($R);
  }

  /**
   * 接口： app/xcx_code_to_token
   * 用微信小程序 code 绑定用户
   *
   * @request name: 公众号名称
   * @request code
   *
   * @return [无]
   */
  public static function xcx_code_to_token($request, $phoneLogin)
  {
    $code = $request->query['code'];
    $name = $request->query['name'];

    $json = \DJApi\API::post(SERVER_API_ROOT, "user/mix/wx_xcx_code_to_token_uid", ['name' => $name, 'code' => $code]);
    \DJApi\API::debug(['wx_xcx_code_to_token_uid', 'SERVER_API_ROOT' => SERVER_API_ROOT, 'json' => $json]);
    return $json;
  }

  /**
   * 接口： app/wx_code_to_token_uid
   * 用code换取用户登录票据和uid
   *
   * @request name: 公众号名称
   * @request code
   *
   * @return uid
   * @return token
   * @return tokenid
   * @return timestamp
   */
  public static function wx_code_login($request)
  {
    $code = $request->query['code'];
    $name = $request->query['name'];

    $json = \DJApi\API::post(SERVER_API_ROOT, "user/mix/wx_code_to_token_uid", ['name' => $name, 'code' => $code]);
    \DJApi\API::debug(['wx_code_to_token_uid', SERVER_API_ROOT, $json]);

    return $json;
  }

  /**
   * 接口： app/jsapi_sign
   * 前端请求jsapi签名
   *
   * @request name: 公众号名称
   * @request url
   *
   * @return config: 签名参数
   */
  public static function jsapi_sign($request)
  {
    $name = $request->query['name'];
    $url = $request->query['url'];

    $json = \DJApi\API::post(SERVER_API_ROOT, "user/wx/jsapi_sign", ['name' => $name, 'url' => $url]);
    \DJApi\API::debug(['jsapi_ticket', $json]);

    return $json;
  }

  /**
   * 接口： app/verify_token
   * 根据票据和签名，进行用户登录，获取uid
   * @request uid: 可选
   * @request tokenid
   * @request timestamp: 5分钟之内
   * @request sign: 签名 = md5($api.$call.$uid.$token.$timestamp) 或 md5($token.$timestamp)
   *
   * @return uid, 由于用户签名时，必须用到token, 所以，不再返回
   */
  public static function verify_token($request)
  {
    return \DJApi\API::post(SERVER_API_ROOT, "user/user/verify_token", $request->query);
  }



  /**
   * 接口： app/getWxInfo
   * 获取微信信息
   * @param uid: 用户id，可为数组或单个用户id
   * 返回：
   * @return 微信信息数组
   */
  public static function getWxInfo($request)
  {
    $uid = $request->query['uid'];
    \DJApi\API::debug(['参数 uid = ', $uid]);

    $wxInfoJson = \DJApi\API::post(SERVER_API_ROOT, "user/mix/wx_infos", ['uid' => $uid]);
    \DJApi\API::debug(['从独立服务器获取微信信息', $wxInfoJson]);
    if (!\DJApi\API::isOk($wxInfoJson)) {
      return $wxInfoJson;
    }
    $wxInfo = $wxInfoJson['datas']['list'];

    // 整理
    $list = [];
    foreach ($wxInfo as $k => $row) {
      $list[] = [
        'headimgurl' => $row['headimgurl'],
        'nickname' => $row['nickname'],
        'uid' => $row['uid'],
      ];
    }
    return \DJApi\API::OK(['list' => $list]);
  }
}
