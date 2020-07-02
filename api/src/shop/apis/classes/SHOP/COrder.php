<?php

namespace SHOP;

use \MyClass\CDbBase;

class COrder
{
  static $TABLE_SHOP = "shop_res_index";

  /**
   * 已上架的商品列表
   */
  public static function orders($AND)
  {
    $db = CDbBase::db();
    $db_order_list = $db->select(CDbBase::table('buyer_order_list'), ['id', 'totle', 'reciever', 't_file', 't_send', 't_order'], ['AND' => $AND]);
    if (!is_array($db_order_list)) {
      return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, "订单不存在");
    }
    $order_ids = [];
    foreach ($db_order_list as $row) {
      $order_ids[] = $row['id'];
    }
    // \DJApi\API::debug(["db_order_list" => $db_order_list, 'order_ids' => $order_ids, 'DB' => $db->getShow()]);
    $db_order_items = $db->select(CDbBase::table('buyer_order_item'), '*',  ['order_id' => $order_ids]);
    // \DJApi\API::debug(["items" => $db_order_items, 'order_ids' => $order_ids, 'DB' => $db->getShow()]);

    $orders = [];
    foreach ($db_order_list as $row) {
      $row['list'] = [];
      $row['status'] = $row['t_file'] ? '完成' : $row['t_send'] ? '待收货' : '待发货';
      $orders[$row['id']] = $row;
    }
    foreach ($db_order_items as $row) {
      $order_id = $row['order_id'];
      $orders[$order_id]['list'][] = [
        'code' => $row['code'],
        'color' => $row['color'],
        'price' => $row['price'],
        'n' => $row['n'],
      ];
    }

    return array_values($orders);
  }

  /**
   * 商品分类
   */
  public static function goods_groups()
  {
    $db = CDbBase::db();
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
    return $groups;
  }
}
