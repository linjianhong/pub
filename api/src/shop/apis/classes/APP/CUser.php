<?php

namespace APP;

use \MyClass\CDbBase;

class CUser
{
  static $TABLE_USER = "shop_user";
  static $POWER_DEFINE = [
    ['name' => '基本权限', 'list' => ['商品上架', '分组配置',]],
    ['name' => '系统权限', 'list' => ['用户管理', '备份数据']],
    ['name' => '商城权限', 'list' => ['售前', '售后', '订单处理']],
  ];

  public  $row;

  public function __construct($uid)
  {
    $db = CDbBase::db();
    $this->row = $db->get(CDbBase::table(self::$TABLE_USER), '*', ['uid' => $uid]);
    \DJApi\API::debug(['baseinfo' => $this->row, 'DB' => $db->getShow()]);
    if (!$this->row['uid']) return [];
    $this->row['attr'] = json_decode($this->row['attr'], true);
  }


  /**
   * 用户权限 基本数据
   */
  public  function attr($k)
  {
    if (!$k) return $this->row['attr'];
    return $this->row['attr'][$k];
  }




  /**
   * 获取用户权限
   */
  public function power()
  {
    $superadmin = $this->attr('superadmin');
    if ($superadmin) {
      $def = self::$POWER_DEFINE;
      $power = [];
      foreach ($def as $row) {
        $power[$row['name']] = $row['list'];
      }
      return $power;
    }
    return $this->attr('power');
  }


  /**
   * 用户权限 基本数据
   */
  public static function get_power_attr($uid)
  {
    $db = CDbBase::db();
    $attr = $db->get(CDbBase::table(self::$TABLE_USER), 'attr', ['uid' => $uid]);
    \DJApi\API::debug(['attr' => $attr, 'DB' => $db->getShow()]);
    if (!$attr) return [];
    $attr = json_decode($attr, true);
    return $attr;
  }


  /**
   * 获取用户权限
   */
  public static function baseinfo($uid)
  {
    $db = CDbBase::db();
    $baseinfo = $db->get(CDbBase::table(self::$TABLE_USER), '*', ['uid' => $uid]);
    \DJApi\API::debug(['baseinfo' => $baseinfo, 'DB' => $db->getShow()]);
    if (!$baseinfo['uid']) return [];
    $baseinfo['attr'] = json_decode($baseinfo['attr'], true);
    return $baseinfo;
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
    $attr = self::get_power_attr($uid);
    return $attr['superadmin'] || in_array($powerName, $attr['power'][$powerGroup]);
  }
  public static function uidHasPower($uid, $powerGroup, $powerName)
  {
    $db = CDbBase::db();
    $mobile = $db->get(CDbBase::table('shop_user_bind'), 'mobile', ['uid' => $uid]);
    if (!$mobile) return [];
    $attr = $db->get(CDbBase::table('shop_user'), 'attr', ['mobile' => $mobile]);
    $attr = json_decode($attr, true);
    return $attr['superadmin'] || in_array($powerName, $attr['power'][$powerGroup]);
  }
}
