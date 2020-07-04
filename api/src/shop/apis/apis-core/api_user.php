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
    $user = new \APP\CUser($uid);
    $user_row = $user->row;
    $wx = $user->wx();
    return \DJApi\API::OK(['uid' => $uid, 'wx' => $wx, 'mobile' => $user_row['mobile'], 'attr' => $user_row['attr']]);
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
    $user = new \APP\CUser($uid);
    // 返回
    return \DJApi\API::OK($user->row['attr']['name']);
  }

}
