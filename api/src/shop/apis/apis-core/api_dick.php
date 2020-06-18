<?php

namespace RequestByApiShell;

use MyClass\CDbBase;

class class_dick
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
    if (!\DJApi\API::isOk($verify)) {
      return $verify;
    }
    return self::$call($request->query, $verify['datas']);
  }

  /**
   * 接口： dick/cp
   * 产品字典
   * @return [list]
   */
  public static function cp($query, $verify)
  {
    $db = \MyClass\CDbBase::db();
    $cp_row = $db->select(CDbBase::table('stock_dick_product'), "*");
    foreach ($cp_row as $k => $row) {
      if ($row['attr']) {
        $cp_row[$k]['attr'] = json_decode($row['attr']);
      } else {
        $cp_row[$k]['attr'] = [];
      }
    }
    return \DJApi\API::OK(['list' => $cp_row]);
  }

  /**
   * 接口： dick/kh
   * 客户字典
   * @return [list]
   */
  public static function kh($query, $verify)
  {
    $db = \MyClass\CDbBase::db();
    $rows = $db->select(CDbBase::table('stock_dick_client'), "*");
    return \DJApi\API::OK(['list' => $rows]);
  }

  /**
   * 接口： dick/common
   * 通用字典
   * @return [list]
   */
  public static function common($query, $verify)
  {
    $db = \MyClass\CDbBase::db();
    $rows = $db->select(CDbBase::table('stock_dick_datas'), ['id', 'k1', 'k2', 'k3', 'v1', 'v2', 'v3'], ['k1' => [
      '木材种类',
      '产品套件字典',
      '开料单字典',
    ]]);
    foreach (\BILL\CBill::$BILL_DEFINE as $name => $row) {
      $rows[] = ['k1' => '全部单据', 'v1' => $name];
      if ($row['资产']) $rows[] = ['k1' => '资产单据', 'v1' => $name];
      if ($row['现金']) $rows[] = ['k1' => '现金单据', 'v1' => $name];
    }
    foreach (\FLOW\CQrcodeDefine::configAll()['config'] as $row) {
      if ($row['mode'] == '流程') $rows[] = ['k1' => '流程名称', 'v1' => $row['type']];
    }
    return \DJApi\API::OK(['list' => $rows]);
  }

  /**
   * 接口： dick/create_item
   * 添加一个字典项
   * @return [n]
   */
  public static function create_item($query, $verifyData)
  {
    return \DICK\CDick::create_item($query, $verifyData);
  }

  /**
   * 接口： dick/update_item
   * 添加一个字典项
   * @return [n]
   */
  public static function update_item($query, $verifyData)
  {
    return \DICK\CDick::update_item($query, $verifyData);
  }

  /**
   * 接口： dick/stock_user
   * 公司员工字典
   * @return [list]
   */
  public static function stock_user($query, $verify)
  {
    $db = \MyClass\CDbBase::db();
    $db_row = $db->select(CDbBase::table('stock_user'), "*");
    $R = [];
    foreach ($db_row as $k => $row) {
      $attr = json_decode($row['attr'], true);
      if (!is_array($attr)) $attr = [];
      $R[] = [
        "stock_uid" => $row['stock_uid'],
        "name" => $attr['value']['pos'],
        "role" => $attr['value']['remark'],
        "t1" => $row['t1'],
        "t2" => $row['t2'],
      ];
    }
    return \DJApi\API::OK(['list' => $R]);
  }

  /**
   * 接口： dick/worker
   * 工人字典
   * @return [list]
   */
  public static function worker($query, $verify)
  {
    $db = \MyClass\CDbBase::db();
    $db_row = $db->select(CDbBase::table('stock_user_bind'), ['uid', 'attr', 't1', 't2']);
    $R = [];
    foreach ($db_row as $k => $row) {
      $attr = json_decode($row['attr'], true);
      if (!is_array($attr)) $attr = [];
      $R[] = [
        "uid" => $row['uid'],
        "name" => $attr['name'],
        "group" => $attr['group'],
        "t1" => $row['t1'],
        "t2" => $row['t2'],
      ];
    }
    return \DJApi\API::OK(['list' => $R]);
  }

  /**
   * 接口： dick/my_stock
   * 我的仓库字典
   * @return [list]
   */
  public static function my_stock($query, $verify)
  {
    $uid = $verify['uid'];
    $now = date('Y-m-d H:i:s');
    $stock_userinfo = \MyClass\CStockUser::stock_userinfo($uid);
    $db = \MyClass\CDbBase::db();
    $codes = $db->select(CDbBase::table('stock_res_data'), 'res_id', ['AND' => [
      'v1' => $stock_userinfo['stock_uid'],
      'v2' => '仓库管理员',
      'OR' => [
        't2[>]' => $now,
        't2[<]' => '1999-01-01',
      ]
    ]]);
    \DJApi\API::debug(['POS' => __FILE__ . " line:" . __LINE__, 'DB' => $db->getShow(), 'codes' => $codes]);
    $db_row = $db->select(CDbBase::table('stock_res_index'), ['id(value)', 'v1(title)', 'v2(type)'], ['AND' => [
      'id' => $codes,
      't1[<]' => $now,
      't1[>]' => '1999-01-01',
      'OR#' => [
        't2[>]' => $now,
        't2[<]' => '1999-01-01',
      ],
    ]]);
    \DJApi\API::debug(['POS' => __FILE__ . " line:" . __LINE__, 'DB' => $db->getShow(), 'db_row' => $db_row]);
    return \DJApi\API::OK(['list' => $db_row]);
  }
}
