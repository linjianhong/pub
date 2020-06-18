<?php

namespace APP;

use \MyClass\CDbBase;

class CPower
{
  static $POWER_DEFINE = [
    ['name' => '基本权限', 'list' => ['商城后台']],
    ['name' => '系统权限', 'list' => ['用户管理', '备份数据']],
    ['name' => '商城权限', 'list' => ['售前', '售后', '订单处理']],
  ];


  static $TABLE_USER = "shop_user";

  /** 是否有下一操作 */
  public static function get_power_define()
  {
    return self::$POWER_DEFINE;
  }


  /**
   * 获取用户权限
   */
  public static function get_user_power($uid)
  {
    $user = new \APP\CUser($uid);
    $superadmin = $user->attr('superadmin');
    if ($superadmin) {
      $def = self::$POWER_DEFINE;
      $power = [];
      foreach ($def as $row) {
        $power[$row['name']] = $row['list'];
      }
      return $power;
    }
    return $user->attr('power');
  }


  /**
   * 判断用户权限
   */
  public static function hasPower($uid, $powerGroup, $powerName)
  {
    $power = self::get_user_power($uid);
    return in_array($powerName, $power[$powerGroup]);
  }
}
