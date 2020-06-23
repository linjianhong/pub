<?php

namespace SHOP;

use \MyClass\CDbBase;

class CShop
{
  static $TABLE_SHOP = "shop_res_index";

  /**
   * 已上架的商品列表
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
