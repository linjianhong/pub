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
    return \DJApi\API::OK(["power" => $power,"user" => $user]);
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
    $groups = \SHOP\CShop::goods_groups();
    return \DJApi\API::OK(['goods' => $goods, 'groups' => $groups, 'user' => $user_row]);
  }



  /**
   * 接口： shop/me
   * 列出商城已上架的商品
   * @return {list:[detail]}
   */
  public static function me($query, $verifyData)
  {
    $uid = $verifyData['uid'];
    $user = new \APP\CUser($uid);
    $user_row = $user->row;
    $power = $user->power();
    $power = $power['商城权限'];

    // 微信信息
    $wxInfoJson = \DJApi\API::post(SERVER_API_ROOT, "user/mix/wx_infos", ['uid' => $uid, 'appname' => 'xls']);
    \DJApi\API::debug(['从独立服务器获取微信信息', 'json' => $wxInfoJson, 'SERVER_API_ROOT' => SERVER_API_ROOT,  'uid' => $uid]);
    if (\DJApi\API::isOk($wxInfoJson)) {
      $wxInfo = $wxInfoJson['datas']['list'];
      $wx = $wxInfo[0];
    }

    return \DJApi\API::OK(['wx' => $wx, 'power' => $power, 'mobile' => $user_row['mobile'], 'attr' => $user_row['attr']]);
  }
}
