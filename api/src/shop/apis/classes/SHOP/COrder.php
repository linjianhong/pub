<?php

namespace SHOP;

use \MyClass\CDbBase;

class COrder
{
  static $TABLE_SHOP = "shop_res_index";

  /**
   * 已上架的商品列表
   */
  public static function orders($AND, $fields = ['id', 'totle', 'reciever', 't_file', 't_send', 't_order'])
  {
    $db = CDbBase::db();
    $db_order_list = $db->select(CDbBase::table('buyer_order_list'), $fields, ['AND' => $AND]);
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
      $row['reciever'] = json_decode($row['reciever'], true);
      $row['status'] = $row['t_file'] ? '完成' : ($row['t_send'] ? '待收货' : '待发货');
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
   * 发货
   */
  public static function order_send($order_id)
  {
    $db = CDbBase::db();
    $n = $db->update(CDbBase::table('buyer_order_list'), ['t_send' => date('Y-m-d H:i:s')], ['AND' => ['id' => $order_id, 't_send[<]' => '1999-12']]);
    \DJApi\API::debug(["n" => $n, 'DB' => $db->getShow()]);
    if (!$n) return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, "订单不存在, 或发货失败");
    return \DJApi\API::OK(['n' => 1]);
  }
  public static function order_unsend($order_id)
  {
    $db = CDbBase::db();
    $n = $db->update(CDbBase::table('buyer_order_list'), ['t_send' => ''], ['AND' => ['id' => $order_id, 't_file[<]' => '1999-12', 't_send[>]' => '1999-12']]);
    \DJApi\API::debug(["n" => $n, 'DB' => $db->getShow()]);
    if (!$n) return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, "订单不存在, 或退回发货失败");
    return \DJApi\API::OK(['n' => 1]);
  }
  public static function order_file($order_id)
  {
    $db = CDbBase::db();
    $n = $db->update(CDbBase::table('buyer_order_list'), ['t_file' => date('Y-m-d H:i:s')], ['AND' => ['id' => $order_id, 't_file[<]' => '1999-12', 't_send[>]' => '1999-12']]);
    \DJApi\API::debug(["n" => $n, 'DB' => $db->getShow()]);
    if (!$n) return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, "订单不存在, 或退回发货失败");
    return \DJApi\API::OK(['n' => 1]);
  }
}
