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
    $power = \APP\CRoleRight::get_user_power($verifyData['uid']);
    return \DJApi\API::OK(["power" => $power]);
  }


  /**
   * 接口： shop/shop_goods
   * 列出商城已上架的商品
   * @return {list:[detail]}
   */
  public static function shop_goods($query, $verifyData)
  {
    /* 简单列表 */
    $goods = \SHOP\CShop::goods();
    $groups = \SHOP\CShop::goods_groups();
    return \DJApi\API::OK(['goods' => $goods, 'groups' => $groups]);
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
    $wx = $user->wx();

    return \DJApi\API::OK(['uid' => $uid, 'wx' => $wx, 'mobile' => $user_row['mobile'], 'attr' => $user_row['attr']]);
  }
}
