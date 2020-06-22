<?php

namespace RequestByApiShell;

use MyClass\CDbBase;

class class_shop_admin
{
  /**
   * 统一入口，要求登录, 要求登录
   */
  public static function API($call, $request)
  {
    if (!method_exists(__CLASS__, $call)) {
      return \DJApi\API::error(\DJApi\API::E_FUNCTION_NOT_EXITS, '参数无效', [$call]);
    }
    /** 忽略身份验证 */
    if (in_array($call, ["id", "config"])) {
      return self::$call($request->query, []);
    }
    $verify = \MyClass\CUser::verify($request->query);
    if (!\DJApi\API::isOk($verify)) {
      return $verify;
    }
    return self::$call($request->query, $verify['datas']);
  }

  /** 商城配置  */
  public static function 商城后台配置()
  {
    $config = \APP\CModuleDefine::configAll();
    return $config['商城后台配置'];
  }


  /** 商品分类配置  */
  public static function 商品分类配置()
  {
    $config = \APP\CModuleDefine::configAll();
    return $config['商品分类配置'];
  }

  /**
   * 接口： shop_admin/get_config
   * 商城配置
   * @return {config:{attrs},groups:{attrs}}
   */
  public static function get_config($query, $verifyData)
  {
    $config = \APP\CModuleDefine::configAll();
    return \DJApi\API::OK(['config' => self::商城后台配置(), 'groups' => self::商品分类配置()]);
  }

  /**
   * 接口： shop_admin/li
   * 列出所有商城商品, 分类配置
   * @return {list:[id], groups:{id,name,parent,nth,status}}
   */
  public static function li($query, $verifyData)
  {
    $db = \MyClass\CDbBase::db();
    /* 商品 */
    $db_rows = $db->select(CDbBase::table('shop_res_index'), ['id', 'attr', 'status'], ['AND' => [
      'type' => '商城商品',
    ]]);
    /** 整理 */
    foreach ($db_rows as &$db_row) {
      $db_row['attr'] = json_decode($db_row['attr'], true);
    }
    /* 分类 */
    $db_group_rows = $db->select(CDbBase::table('shop_res_index'), ['id', 'name', 'v1', 'v2', 'status'], ['AND' => [
      'type' => '商品分类',
    ]]);
    $groups = [];
    foreach ($db_group_rows as $row) {
      $groups[] = [
        'id' => $row['id'],
        'status' => $row['status'],
        'attr' => [
          'value' => [
            'name' => $row['name'],
            'v1' => $row['v1'],
            'v2' => $row['v2'],
            'v3' => $row['v3'],
          ]
        ],
      ];
    }
    return \DJApi\API::OK(['list' => $db_rows, 'groups' => $groups]);
  }


  /**
   * 接口： shop_admin/create
   * 创建商城商品
   * @return {list:[id]}
   */
  public static function create($query, $verifyData)
  {
    $db = \MyClass\CDbBase::db();
    $insert_id = $db->insert(CDbBase::table('shop_res_index'), [
      'type' => '商城商品',
    ]);
    return \DJApi\API::OK(['code' => $insert_id]);
  }

  /**
   * 接口： shop_admin/set_onsale
   * 上架
   * @return {list:[id]}
   */
  public static function set_onsale($query, $verifyData)
  {
    $data = json_decode($query['data'], true);
    $code = $data['code'];

    /** 保存数据 */
    $db = \MyClass\CDbBase::db();
    $rows = $db->select(CDbBase::table('shop_res_index'), 'id', ['id' => $code,]);
    \DJApi\API::debug(["rows" => $rows, 'DB' => $db->getShow()]);
    if (is_array($rows) && count($rows) == 1) {
      $n = $db->update(CDbBase::table('shop_res_index'), ['status' => '已上架'], ['id' => $code,]);
      \DJApi\API::debug(["n" => $n, 'DB' => $db->getShow()]);
    }

    return \DJApi\API::OK(['n' => $n, 'need_update' => ['status' => '已上架']]);
  }

  /**
   * 接口： shop_admin/unset_onsale
   * 下架
   * @return {list:[id]}
   */
  public static function unset_onsale($query, $verifyData)
  {
    $data = json_decode($query['data'], true);
    $code = $data['code'];

    /** 保存数据 */
    $db = \MyClass\CDbBase::db();
    $rows = $db->select(CDbBase::table('shop_res_index'), 'id', ['id' => $code,]);
    \DJApi\API::debug(["rows" => $rows, 'DB' => $db->getShow()]);
    if (is_array($rows) && count($rows) == 1) {
      $n = $db->update(CDbBase::table('shop_res_index'), ['status' => '已下架'], ['id' => $code,]);
      \DJApi\API::debug(["n" => $n, 'DB' => $db->getShow()]);
    }

    return \DJApi\API::OK(['n' => $n, 'need_update' => ['status' => '已下架']]);
  }

  /**
   * 接口： shop_admin/update_detail
   * 更新商城商品
   * @return {list:[id]}
   */
  public static function update_detail($query, $verifyData)
  {
    $data = json_decode($query['data'], true);
    $code = $data['code'];
    $value = $data['value'];
    $goods_config = self::商城后台配置();

    $save_value = [];
    \DJApi\API::debug(["value" => $value, 'captions' => $goods_config['captions']]);
    foreach ($goods_config['captions'] as $captions) {
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
    \DJApi\API::debug(["data" => $data, 'goods_config' => $goods_config, "save_value" => $save_value]);

    /** 保存数据 */
    if (is_string($code) && count($save_value) > 0) {
      $db = \MyClass\CDbBase::db();
      $rows = $db->select(CDbBase::table('shop_res_index'), 'attr', ['id' => $code,]);
      \DJApi\API::debug(["rows" => $rows, 'DB' => $db->getShow()]);
      if (is_array($rows) && count($rows) == 1) {
        $attr = json_decode($rows[0], true);
        if (!is_array($attr)) $attr = [];
        foreach ($save_value as $k => $v) {
          $attr['value'][$k] = $v;
        }
        $n = $db->update(CDbBase::table('shop_res_index'), ['attr' => \DJApi\API::cn_json($attr)], ['id' => $code,]);
        \DJApi\API::debug(["n" => $n, 'DB' => $db->getShow()]);
      }
    }
    return \DJApi\API::OK(['n' => $n, 'need_update' => ['attr.value' => $save_value]]);
  }




  /**
   * 接口： shop_admin/create_group
   * 创建商城商品
   * @return {list:[id]}
   */
  public static function create_group($query, $verifyData)
  {
    $db = \MyClass\CDbBase::db();
    $insert_id = $db->insert(CDbBase::table('shop_res_index'), [
      'type' => '商品分类',
      'status' => '已上架',
    ]);
    return \DJApi\API::OK(['code' => $insert_id]);
  }


  /**
   * 接口： shop_admin/update_detail_group
   * 更新商城商品
   * @return {list:[id]}
   */
  public static function update_detail_group($query, $verifyData)
  {
    $data = json_decode($query['data'], true);
    $code = $data['code'];
    $value = $data['value'];
    $group_config = self::商品分类配置();

    $save_value = [];
    \DJApi\API::debug(["value" => $value, 'captions' => $group_config['captions']]);
    foreach ($group_config['captions'] as $captions) {
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
    \DJApi\API::debug(["data" => $data, 'group_config' => $group_config, "save_value" => $save_value]);

    /** 保存数据 */
    if (is_string($code) && count($save_value) > 0) {
      $db = \MyClass\CDbBase::db();
      $n = $db->update(CDbBase::table('shop_res_index'), $save_value, ['id' => $code,]);
      \DJApi\API::debug(["n" => $n, 'DB' => $db->getShow()]);
    }
    return \DJApi\API::OK(['n' => $n, 'need_update' => ['attr.value' => $save_value]]);
  }
}
