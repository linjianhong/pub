<?php

namespace APP;

use \MyClass\CDbBase;

class CUser
{
  static $module = '简易商城';
  static $TABLE_USER = "shop_user";
  static $POWER_DEFINE = [
    ['name' => '基本权限', 'list' => ['商品上架', '分组配置',]],
    ['name' => '系统权限', 'list' => ['角色管理','用户管理', '备份数据']],
    ['name' => '商城权限', 'list' => ['售前', '售后', '订单处理']],
    ['name' => '商城菜单', 'list' => ['商城首页', '我的订单', '地址设置']],
    ['name' => '商城管理', 'list' => ['订单管理', '订单统计']],
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
   * 获取用户权限
   */
  public function power()
  {
    return \APP\CRoleRight::get_user_power($this->row['uid']);
  }

  /**
   * 获取用户微信呢称头像等信息
   */
  public function wx()
  {
    $uid = $this->row['uid'];
    $wx = [];
    // 微信信息
    $wxInfoJson = \DJApi\API::post(SERVER_API_ROOT, "user/mix/wx_infos", ['uid' => $uid, 'appname' => 'xls']);
    \DJApi\API::debug(['从独立服务器获取微信信息', 'json' => $wxInfoJson, 'SERVER_API_ROOT' => SERVER_API_ROOT,  'uid' => $uid]);
    if (\DJApi\API::isOk($wxInfoJson)) {
      $wxInfo = $wxInfoJson['datas']['list'];
      $wx = $wxInfo[0];
    }
    return $wx;
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
