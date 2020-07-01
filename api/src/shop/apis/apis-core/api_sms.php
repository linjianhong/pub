<?php

namespace RequestByApiShell;

use \MyClass\CDbBase;

class class_sms
{
  /**
   * 统一入口，要求登录, 要求有手机号
   */
  public static function API($call, $request)
  {
    if (!method_exists(__CLASS__, $call)) {
      return \DJApi\API::error(\DJApi\API::E_FUNCTION_NOT_EXITS, '参数无效', [$call]);
    }
    /** 忽略身份验证 */
    if (in_array($call, ["getcode"])) {
      return self::$call($request->query, []);
    }
    $verify = \MyClass\CUser::verify($request->query);
    \DJApi\API::debug(['verify' => $verify, 'query' => $request->query]);
    if (!\DJApi\API::isOk($verify)) {
      return $verify;
    }
    return self::$call($request->query, $verify['datas']);
  }

  /**
   * 接口： sms/getcode
   * 向手机发送验证码
   *
   * @request phone
   *
   * @return data
   */
  public static function getcode($query, $verify)
  {
    $phone = $query['phone'];

    /** 没有用户的，不发送短信 */
    $db = CDbBase::db();
    // if (!$db->has(CDbBase::table('user_phone'), ['AND' => ['phone' => $phone, 't2[<]' => '1999-00']])) {
    //   return \DJApi\API::error(\DJApi\API::E_NEED_RIGHT, '用户不存在，请与系统管理员联系');
    // }

    /** 发送短信 */
    $params = [
      'module' => \MyClass\CStockUser::$module,
      'phone' => $phone,
      'tpl' => 'pgy_code',
    ];
    $json = \DJApi\API::post(SERVER_API_ROOT, "user/sms/getcode", $params);
    \DJApi\API::debug(['params' => $params, 'json' => $json, 'query' => $query]);

    return $json;
  }

  /**
   * 接口： sms/login
   * 手机动态验证码登录
   *
   * @request phone
   * @request code
   *
   * @return {token, tokenid, timestamp}
   */
  public static function login($query, $verify)
  {
    $phone = $query['phone'];
    $code = $query['code'];
    $params = [
      'module' => \MyClass\CStockUser::$module,
      'phone' => $phone,
      'code' => $code,
      'exclusive' => 1, // 独占？
    ];
    $json = \DJApi\API::post(SERVER_API_ROOT, "user/sms/login", $params);
    \DJApi\API::debug(['params' => $params, 'json' => $json]);

    return $json;
  }

  /**
   * 接口： sms/bind
   * 绑定用户手机号
   *
   * @request phone
   * @request code
   *
   * @return {token, tokenid, timestamp}
   */
  public static function bind($query, $verify)
  {
    $phone = $query['phone'];
    $code = $query['code'];
    return \APP\CUser::bind_mobile($verify['uid'], ['mobile' => $phone, 'code' => $code]);
    $params = [
      'module' => \APP\CUser::$module,
      'phone' => $phone,
      'code' => $code,
    ];
    $json = \DJApi\API::post(SERVER_API_ROOT, "user/sms/verify_code", $params);
    \DJApi\API::debug(['params' => $params, 'json' => $json]);
    if (!\DJApi\API::isOk(($json))) return $json;

    return $json;
  }
}
