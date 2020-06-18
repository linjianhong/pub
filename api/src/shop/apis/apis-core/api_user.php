<?php

namespace RequestByApiShell;

class class_user
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
    // \DJApi\API::debug(['verify' => $verify, 'query' => $request->query]);
    if (!\DJApi\API::isOk($verify)) {
      return $verify;
    }
    return self::$call($request->query, $verify['datas']);
  }

  /**
   * 接口： user/info
   * 读取自己的微信等信息
   *
   * @return {me}
   */
  public static function info($query, $verifyData)
  {
    $uid = $verifyData['uid'];
    $R = [];

    // 仓储系统用户信息
    $stock_user_row = \MyClass\CStockUser::stock_userinfo($uid);
    $R['stock_userinfo'] = $stock_user_row;

    // 微信信息
    $wxInfoJson = \DJApi\API::post(SERVER_API_ROOT, "user/mix/wx_infos", ['uid' => $uid, 'appname' => 'xls']);
    \DJApi\API::debug(['从独立服务器获取微信信息', 'json' => $wxInfoJson, 'SERVER_API_ROOT' => SERVER_API_ROOT,  'uid' => $uid]);
    if (\DJApi\API::isOk($wxInfoJson)) {
      $wxInfo = $wxInfoJson['datas']['list'];
      $R["wx"] = $wxInfo[0];
    }

    $power = \MyClass\CStockUser::get_my_power($verifyData);
    $R["power"] = $power;
    // 返回
    return \DJApi\API::OK($R);
  }

  /**
   * 接口： user/uid2name
   * 读取自己的微信等信息
   *
   * @return {me}
   */
  public static function uid2name($query, $verifyData)
  {
    $uid = $query['uid'];
    $db = \MyClass\CDbBase::db();
    $attr = $db->get(\MyClass\CDbBase::table('stock_user_bind'), "attr", ['uid' => $uid]);
    $attr = json_decode($attr, true);
    // 返回
    return \DJApi\API::OK($attr['name']);
  }

  /**
   * 接口： user/uid2name
   * 读取自己的微信等信息
   *
   * @return {me}
   */
  public static function stock_user($query, $verifyData)
  {
    $uid = $query['uid'];
    $stock_user_row = \MyClass\CStockUser::stock_userinfo($uid);
    // 返回
    return \DJApi\API::OK($stock_user_row);
  }
}
