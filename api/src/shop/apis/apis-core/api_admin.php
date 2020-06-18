<?php

namespace RequestByApiShell;

use MyClass\CDbBase;
use SQL\CBackup;

class class_admin
{
  static $POWER_DEFINE = [
    ['name' => '基本权限', 'list' => ['查询',]],
    ['name' => '系统权限', 'list' => ['用户管理', '备份数据']],
    ['name' => '商城权限', 'list' => ['查看商城', '商城后台', '查看价格']],
    ['name' => '商城菜单', 'list' => ['商城首页', '商品分类']],
    //['name' => '新建流程', 'list' => ['生产流程', '销售流程', '购买产品流程', '退货流程', '铺货流程']],
    ['name' => '报表权限', 'list' => ['清单', '统计']],
    //['name' => '字典权限', 'list' => ['产品套件字典', '用户字典', '客户字典', '产品字典', '木工字典'']],
  ];

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
   * 接口： admin/get_user
   * 单个用户
   */
  public static function get_my_power($query, $verifyData)
  {
    $power = \CONFIG\CPower::get_user_power($verifyData['uid']);
    return \DJApi\API::OK(["power" => $power]);
  }

  /**
   * 接口： admin/create
   * 创建用户
   */
  public static function create_user($query, $verifyData)
  {
    $value = $query['value'];
    $stock_uid = \MyClass\CStockUser::create_user($value);
    if (!$stock_uid) return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, "创建失败");
    return \DJApi\API::OK(["stock_uid" => $stock_uid]);
  }

  /**
   * 接口： admin/list_user
   * 所有用户列表
   */
  public static function list_user($query, $verifyData)
  {
    $value = $query['value'];
    $list = \MyClass\CStockUser::list_user($value);
    return \DJApi\API::OK(["list" => $list]);
  }

  /**
   * 接口： admin/list_worker
   * 所有用户列表
   */
  public static function list_worker($query, $verifyData)
  {
    $value = $query['value'];
    $list = \MyClass\CStockUser::list_worker($value);
    return \DJApi\API::OK(["list" => $list]);
  }

  /**
   * 接口： admin/get_user
   * 单个用户
   */
  public static function get_user($query, $verifyData)
  {
    $stock_uid = $query['stock_uid'];
    $user = \MyClass\CStockUser::get_user($stock_uid);
    return \DJApi\API::OK(["user" => $user]);
  }

  /**
   * 接口： admin/update_mobile
   * 更新用户绑定的手机号
   */
  public static function update_mobile($query, $verifyData)
  {
    $value = $query['value'];
    $stock_uid = $query['stock_uid'];
    $n = \MyClass\CStockUser::update_mobile($stock_uid, $value);
    if (!$n) return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, "更新失败");
    return \DJApi\API::OK(["n" => $n]);
  }

  /**
   * 接口： admin/update_user
   * 更新一个用户
   */
  public static function update_power($query, $verifyData)
  {
    $value = $query['value'];
    $stock_uid = $query['stock_uid'];
    $n = \MyClass\CStockUser::update_power($stock_uid, $value);
    if (!$n) return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, "更新失败");
    return \DJApi\API::OK(["n" => $n]);
  }

  /**
   * 接口： admin/update_user
   * 更新一个用户
   */
  public static function update_user($query, $verifyData)
  {
    $value = $query['value'];
    $stock_uid = $query['stock_uid'];
    $n = \MyClass\CStockUser::update_user($stock_uid, $value);
    if (!$n) return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, "更新失败");
    return \DJApi\API::OK(["n" => $n]);
  }


  /**
   * 接口： admin/enable_user
   * 启用一个用户
   */
  public static function enable_user($query, $verifyData)
  {
    $stock_uid = $query['stock_uid'];
    $n = \MyClass\CStockUser::enable_user($stock_uid);
    if (!$n) return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, "启用失败");
    return \DJApi\API::OK(["n" => $n]);
  }


  /**
   * 接口： admin/disable_user
   * 禁用一个用户
   */
  public static function disable_user($query, $verifyData)
  {
    $stock_uid = $query['stock_uid'];
    $n = \MyClass\CStockUser::disable_user($stock_uid);
    if (!$n) return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, "禁用失败");
    return \DJApi\API::OK(["n" => $n]);
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
