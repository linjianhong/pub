<?php

namespace RequestByApiShell;

use MyClass\CDbBase;

class class_order_admin
{
  /**
   * 统一入口，要求登录, 要求登录
   */
  public static function API($call, $request)
  {
    if (!method_exists(__CLASS__, $call)) {
      return \DJApi\API::error(\DJApi\API::E_FUNCTION_NOT_EXITS, '参数无效', [$call]);
    }
    /** 忽略身份验证 */
    if (in_array($call, ["id", "config"])) {
      return self::$call($request->query, []);
    }
    $verify = \MyClass\CUser::verify($request->query);
    if (!\DJApi\API::isOk($verify)) {
      return $verify;
    }
    return self::$call($request->query, $verify['datas']);
  }




  /**
   * 接口： order_admin/order_list
   * 订单详情
   * @return {list:[id]}
   */
  public static function order_list($query, $verifyData)
  {
    $uid = $verifyData['uid'];

    return \DJApi\API::OK([
      'orders' => \SHOP\COrder::orders(['uid' => $uid]),
    ]);
  }
}
