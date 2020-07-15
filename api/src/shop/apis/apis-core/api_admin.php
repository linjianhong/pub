<?php

namespace RequestByApiShell;

use MyClass\CDbBase;
use SQL\CBackup;

class class_admin
{
  public static $TABLE_ROLE = "shop_role";
  public static $TABLE_USER = "shop_user";
  /**
   * 统一入口，要求登录, 要求登录
   */
  public static function API($call, $request)
  {
    if (!method_exists(__CLASS__, $call)) {
      return \DJApi\API::error(\DJApi\API::E_FUNCTION_NOT_EXITS, '参数无效', [$call]);
    }
    /** 忽略身份验证 */
    // if (in_array($call, ["id", "config"])) {
    //   return self::$call($request->query, []);
    // }
    $verify = \MyClass\CUser::verify($request->query);
    if (!\DJApi\API::isOk($verify)) {
      return $verify;
    }
    return self::$call($request->query, $verify['datas']);
  }


  /**
   * 接口： admin/sys_config
   * 列表角色, 用于角色管理
   */
  public static function 系统参数配置()
  {
    $configAll = \APP\CModuleDefine::configAll();
    return $configAll['系统参数配置'];
  }
  /**
   * 接口： admin/sys_config
   * 列表角色, 用于角色管理
   */
  public static function sys_config($query, $verifyData)
  {
    $db = \MyClass\CDbBase::db();
    $db_row = $db->get(CDbBase::table('shop_res_index'), ['id', 'attr'], ['AND' => ['type' => '系统参数', 'name' => '系统参数']]);
    $attr = json_decode($db_row['attr'], true);
    if (!is_array($attr)) $attr = [];
    $db_row['attr'] = $attr;
    return \DJApi\API::OK([
      "config" => self::系统参数配置(),
      "value" => $db_row,
    ]);
  }


  /**
   * 接口： admin/sys_config
   * 列表角色, 用于角色管理
   */
  public static function sys_update_data($query, $verifyData)
  {
    $data = json_decode($query['data'], true);
    $value = $data['value'];
    $save_config = self::系统参数配置();

    $save_value = [];
    \DJApi\API::debug(["value" => $value, 'captions' => $save_config['captions']]);
    foreach ($save_config['captions'] as $captions) {
      if ($captions['model']) {
        $k = $captions['model'];
        if (isset($value[$k])) $save_value[$k] = $value[$k];
      } else if (is_array($captions['cells'])) foreach ($captions['cells'] as $cell) {
        if ($cell['model']) {
          $k = $cell['model'];
          if (isset($value[$k])) $save_value[$k] = $value[$k];
        }
      }
    }
    \DJApi\API::debug(["data" => $data, 'goods_config' => $save_config, "save_value" => $save_value]);

    /** 保存数据 */
    if (count($save_value) > 0) {
      $db = \MyClass\CDbBase::db();
      $db_row = $db->get(CDbBase::table('shop_res_index'), ['id', 'attr'], ['AND' => ['type' => '系统参数', 'name' => '系统参数']]);
      if (!$db_row) {
        $db_row = ['type' => '系统参数', 'name' => '系统参数'];
        $db_row['id'] = $db->insert(CDbBase::table('shop_res_index'), $db_row);
      }
      \DJApi\API::debug(["db_row" => $db_row, 'DB' => $db->getShow()]);
      if (is_array($db_row) && $db_row['id']) {
        $attr = json_decode($db_row['attr'], true);
        if (!is_array($attr)) $attr = [];
        foreach ($save_value as $k => $v) {
          $attr['value'][$k] = $v;
        }
        $n = $db->update(CDbBase::table('shop_res_index'), ['attr' => \DJApi\API::cn_json($attr)], ['id' => $db_row['id']]);
        \DJApi\API::debug(["n" => $n, 'DB' => $db->getShow()]);
      }
    }
    return \DJApi\API::OK(['n' => $n, 'need_update' => ['attr.value' => $save_value]]);
  }



  /**
   * 接口： admin/role_list
   * 列表角色, 用于角色管理
   */
  public static function role_list($query, $verifyData)
  {
    return \DJApi\API::OK([
      "roles" => \APP\CRoleRight::role_list(),
      "powers" => \APP\CRoleRight::全部权限(),
    ]);
  }


  /**
   * 接口： admin/role_create
   * 创建角色
   */
  public static function role_create($query, $verifyData)
  {
    return \DJApi\API::OK(["role" => \APP\CRoleRight::role_create()]);
  }


  /**
   * 接口： admin/role_update
   * 更新角色
   */
  public static function role_update($query, $verifyData)
  {
    return \DJApi\API::OK(["n" => \APP\CRoleRight::role_update($query)]);
  }



  /**
   * 接口： admin/user_list
   * 列表用户, 用于用户管理
   */
  public static function user_list($query, $verifyData)
  {
    return \DJApi\API::OK([
      'ADMIN_KEYS' => \APP\CRoleRight::$ADMIN_KEYS,
      "roles" => \APP\CRoleRight::全部有效角色_仅名称(),
      "users" => \APP\CRoleRight::user_list(),
    ]);
  }

  /**
   * 接口： admin/user_create
   * 创建用户
   * uid 不可已存在
   */
  public static function user_create($query, $verifyData)
  {
    return \DJApi\API::OK(["user" => \APP\CRoleRight::user_create($query)]);
  }


  /**
   * 接口： admin/role_update
   * 更新用户
   */
  public static function user_update($query, $verifyData)
  {
    return \DJApi\API::OK(["n" => \APP\CRoleRight::user_update($query)]);
  }








  /**
   * 接口： admin/get_user
   * 单个用户
   */
  public static function get_my_power($query, $verifyData)
  {
    $power = \APP\CRoleRight::获取用户权限($verifyData['uid']);
    return \DJApi\API::OK(["power" => $power]);
  }



  /**
   * 接口： admin/backup_db
   * 备份数据库
   */
  public static function backup_db($query, $verifyData)
  {
    $stock_uid = $query['stock_uid'];
    $tables = [
      \MyClass\CDbBase::table("signin_list"),
      \MyClass\CDbBase::table("signin_dinner"),

      \MyClass\CDbBase::table("job_task_config"),
      \MyClass\CDbBase::table("job_task_item"),
      \MyClass\CDbBase::table("job_task_job_value"),

      \MyClass\CDbBase::table("stock_bills"),
      \MyClass\CDbBase::table("stock_cash"),
      \MyClass\CDbBase::table("stock_dick_client"),
      \MyClass\CDbBase::table("stock_dick_datas"),
      \MyClass\CDbBase::table("stock_dick_product"),
      \MyClass\CDbBase::table("stock_res_data"),
      \MyClass\CDbBase::table("stock_res_index"),
      \MyClass\CDbBase::table("stock_res_io"),
      \MyClass\CDbBase::table("stock_res_place"),
      \MyClass\CDbBase::table("stock_res_work"),
      \MyClass\CDbBase::table("stock_user"),
      \MyClass\CDbBase::table("stock_user_bind"),
    ];
    return \SQL\CBackup::BKUP_tablles_downlaod($tables);
  }
}
