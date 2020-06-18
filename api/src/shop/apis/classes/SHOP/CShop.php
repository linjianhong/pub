<?php

namespace SHOP;

use \MyClass\CDbBase;

class CShop
{
  static $TABLE_SHOP = "shop_res_index";

  /**
   * 用户权限 基本数据
   */
  public static function goods()
  {
    $db = CDbBase::db();
    /* 简单列表 */
    $goods = $db->select(CDbBase::table(self::$TABLE_SHOP), ['id', 'attr'], ['AND' => [
      'type' => '商城商品',
      'status' => '已上架',
    ]]);
    if (!is_array($goods)) return [];
    foreach ($goods as $k => $v) {
      $goods[$k]['attr'] = json_decode($goods[$k]['attr'], true);
    }
    return $goods;
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
