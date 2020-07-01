<?php

namespace APP;

use \MyClass\CDbBase;

class CUser
{
  static $module = '仙龙山一物一码';
  static $TABLE_USER = "shop_user";
  static $POWER_DEFINE = [
    ['name' => '基本权限', 'list' => ['商品上架', '分组配置',]],
    ['name' => '系统权限', 'list' => ['用户管理', '备份数据']],
    ['name' => '商城权限', 'list' => ['售前', '售后', '订单处理']],
    ['name' => '商城菜单', 'list' => ['商城首页', '我的订单', '地址设置']],
    ['name' => '商城后台', 'list' => ['订单列表', '订单统计']],
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



  /**
   * 用户自行绑定手机号
   *
   * @param uid
   * @param query[mobile] 手机号
   * @param query[code] 验证码
   *
   * @return JSON
   */
  public static function bind_mobile($uid, $query)
  {
    $mobile = $query['mobile'];
    $code = $query['code'];
    // 验证码是否有效
    $params = [
      'module' => self::$module,
      'phone' => $mobile,
      'code' => $code,
    ];
    $verify = \DJApi\API::post(SERVER_API_ROOT, "user/sms/verify_code", $params);
    \DJApi\API::debug(['params' => $params, 'verify' => $verify]);
    if (!\DJApi\API::isOk($verify)) {
      return $verify;
    }

    // 绑定手机号
    $db = CDbBase::db();
    $and = ['uid' => $uid];
    $user_row = $db->get(CDbBase::table(self::$TABLE_USER), ['id', 'mobile'], ['AND' => $and]);
    \DJApi\API::debug([__FILE__ . ': line ' . __LINE__ . ', DB' => $db->getShow(), 'user_row' => $user_row]);
    if ($user_row['mobile'] == $mobile) {
      return \DJApi\API::OK("原已绑定");
    }
    // 清除其它用户绑定
    $db->update(CDbBase::table(self::$TABLE_USER), ['mobile' => ''], ['mobile' => $mobile]);
    if (!$user_row) {
      $db->insert(CDbBase::table(self::$TABLE_USER), ['mobile' => $mobile, 'uid' => $uid, 't1' => date('Y-m-d H:i:s')]);
    } else {
      $db->update(CDbBase::table(self::$TABLE_USER), ['mobile' => $mobile], ['AND' => $and]);
    }

    // 返回正确
    return \DJApi\API::OK();
  }
}
