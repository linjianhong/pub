<?php

namespace RequestByApiShell;

use MyClass\CDbBase;

class class_shop
{
  /**
   * 统一入口，要求登录, 要求登录
   */
  public static function API($call, $request)
  {
    if (!method_exists(__CLASS__, $call)) {
      return \DJApi\API::error(\DJApi\API::E_FUNCTION_NOT_EXITS, '参数无效', [$call]);
    }
    $verify = \MyClass\CUser::verify($request->query);
    if (!\DJApi\API::isOk($verify)) {
      return $verify;
    }
    return self::$call($request->query, $verify['datas']);
  }

  /**
   * 接口： shop/get_my_power
   * 单个用户
   */
  public static function get_my_power($query, $verifyData)
  {
    $user = new \APP\CUser($verifyData['uid']);
    $power = $user->power();
    return \DJApi\API::OK(["power" => $power]);
  }


  /**
   * 接口： shop/shop_goods
   * 列出商城已上架的商品
   * @return {list:[detail]}
   */
  public static function shop_goods($query, $verifyData)
  {
    $uid = $verifyData['uid'];
    $user = new \APP\CUser($uid);
    $user_row = $user->row;

    // 微信信息
    $wxInfoJson = \DJApi\API::post(SERVER_API_ROOT, "user/mix/wx_infos", ['uid' => $uid, 'appname' => 'xls']);
    \DJApi\API::debug(['从独立服务器获取微信信息', 'json' => $wxInfoJson, 'SERVER_API_ROOT' => SERVER_API_ROOT,  'uid' => $uid]);
    if (\DJApi\API::isOk($wxInfoJson)) {
      $wxInfo = $wxInfoJson['datas']['list'];
      $user_row["wx"] = $wxInfo[0];
    }

    /* 简单列表 */
    $goods = \SHOP\CShop::goods();
    return \DJApi\API::OK(['goods' => $goods, 'user' => $user_row]);
  }



  static $show_more = [
    "查看价格" => [
      ["统一价格", "price1"],
      ["显示价格", "price2"],
      ["划线价格", "price3"],
      ["占地长度(米)", "占地长度"],
      ["占地宽度(米)", "占地宽度"],
      ["高度(米)", "高度"],
      ["重量(KG)", "重量"],
      ["包装体积(方)", "包装体积"],
      ["发货范围", "发货范围"],
    ],
    "无" => [
      ["占地长度(米)", "占地长度"],
      ["占地宽度(米)", "占地宽度"],
      ["高度(米)", "高度"],
      ["重量(KG)", "重量"],
      ["包装体积(方)", "包装体积"],
      ["发货范围", "发货范围"],
    ],
  ];

  /**
   * 接口： shop/me
   * 列出商城已上架的商品
   * @return {list:[detail]}
   */
  public static function me($query, $verifyData)
  {
    $uid = $verifyData['uid'];
    $stock_user_row = \MyClass\CStockUser::base_userinfo($uid);
    $power = \MyClass\CStockUser::get_my_power($verifyData);
    $power = $power['商城权限'];
    if (in_array("查看价格", $power)) $show_more = self::$show_more['查看价格'];
    if (!$show_more) $show_more = self::$show_more['无'];

    // 微信信息
    $wxInfoJson = \DJApi\API::post(SERVER_API_ROOT, "user/mix/wx_infos", ['uid' => $uid, 'appname' => 'xls']);
    \DJApi\API::debug(['从独立服务器获取微信信息', 'json' => $wxInfoJson, 'SERVER_API_ROOT' => SERVER_API_ROOT,  'uid' => $uid]);
    if (\DJApi\API::isOk($wxInfoJson)) {
      $wxInfo = $wxInfoJson['datas']['list'];
      $wx = $wxInfo[0];
    }

    return \DJApi\API::OK(['wx' => $wx, 'power' => $power, 'show_more' => $show_more, 'mobile' => $stock_user_row['mobile'], 'attr' => $stock_user_row['attr']]);
  }
}
