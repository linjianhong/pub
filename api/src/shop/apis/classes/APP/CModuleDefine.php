<?php

namespace APP;

/**
 * 生漆
 * 普通漆
 * 烫蜡
 * 维修
 */

use MyClass\CDbBase;

class CModuleDefine
{
  public static $CONFIG = [

    '字典配置' => [
      [ // 木工字典
        'name' => '木工字典',
        'items' => [
          '姓名;input;;不可空',
        ],
        'title' => "=姓名",
        'valueMap' => [
          'value' => '姓名',
        ],
        'server' => [
          'create_item' => [
            [
              'type' => 'DB',
              'data' => [
                'class' => 'CDB_common',
                'table' => 'stock_dick_datas',
                'method' => 'sure_data_rows',
                'mode' => '添加一行',
                'row' => [
                  'k1' => "木工",
                  'v1' => "=姓名",
                  't1' => "=now",
                  't2' => "=''",
                ],
              ],
            ]
          ],
          'update_item' => [
            [
              'type' => 'DB',
              'data' => [
                'class' => 'CDB_common',
                'table' => 'stock_dick_datas',
                'method' => 'sure_data_rows',
                'mode' => '更新一行',
                'AND' => [
                  'k1' => "木工",
                  'id' => "=id",
                ],
                'row' => [
                  'v1' => "=姓名",
                ],
              ],
            ]
          ],
          'delete_item' => [
            [
              'type' => 'DB',
              'data' => [
                'class' => 'CDB_common',
                'table' => 'stock_dick_datas',
                'method' => 'sure_data_rows',
                'mode' => '更新一行',
                'AND' => [
                  'k1' => "木工",
                  'id' => "=id",
                ],
                'row' => [
                  't2' => "=now",
                ],
              ],
            ]
          ],

        ],
      ],
    ],

    '商城后台配置' => [
      'captions' => [
        [
          'type' => "row", 'css' => "padding-1 flex", 'cells' => [
            ['css' => "em-15 b-900 padding-1", 'type' => "text", 'text' => "产品详情："],
            ['css' => "flex-cc padding-v-3", 'type' => "calcu", 'text' => "=code"],
          ]
        ], [
          'type' => "row", 'css' => "row-like-table flex-stretch", 'k' => 'cells', 'php' => [
            ['input' => '名称', 'w' => 8,],
            ['input' => '重量', 'model' => '重量', 'w' => 3,],
            ['input' => '标签2', 'w' => 3,],
            ['input' => '标签3', 'w' => 3,],
            ['input' => '标签4', 'w' => 3,],
          ]
        ], [
          'type' => "row", 'css' => "row-like-table flex-stretch", 'k' => 'cells', 'php' => [
            ['input' => '简称', 'w' => 5,],
            ['input' => '包装方式', 'w' => 3, 'type' => "combo", 'q-list' => "散装,塑料袋,真空,纸箱,泡沫箱,其它",],
            ['input' => '发货范围', 'w' => 8, 'type' => "combo", 'q-list' => "全国,省内,市内,仅自提"],
          ]
        ], [
          'type' => "row", 'css' => "row-like-table flex-stretch", 'k' => 'cells', 'php' => [
            ['input' => '统一价格', 'model' => 'price1', 'w' => 2,],
            ['input' => '主分类', 'model' => '分类11', 'w' => 2, 'type' => "combo", 'q-list' => "促销,肉类,海产,火锅料,佐料,其它",],
            ['input' => '主分类2', 'model' => '分类12', 'w' => 2, 'type' => "combo", 'q-list' => "",],
            ['input' => '主分类3', 'model' => '分类13', 'w' => 2],
          ]
        ], [
          'type' => "row", 'css' => "row-like-table flex-stretch", 'k' => 'cells', 'php' => [
            ['input' => '会员价格', 'model' => 'price2', 'w' => 2,],
            ['input' => '次分类', 'model' => '分类21', 'w' => 2, 'type' => "combo", 'q-list' => "肉类,海产,火锅料,佐料,其它",],
            ['input' => '次分类2', 'model' => '分类22', 'w' => 2, 'type' => "combo", 'q-list' => "",],
            ['input' => '次分类2', 'model' => '分类23', 'w' => 2],
          ]
        ], [
          'type' => "row", 'css' => "row-like-table flex-stretch", 'k' => 'cells', 'php' => [
            ['input' => '促销价格', 'model' => 'price3', 'w' => 2,],
            ['input' => '次分类', 'model' => '分类31', 'w' => 2, 'type' => "combo", 'q-list' => "肉类,海产,火锅料,佐料,其它",],
            ['input' => '次分类2', 'model' => '分类32', 'w' => 2, 'type' => "combo", 'q-list' => "",],
            ['input' => '次分类2', 'model' => '分类33', 'w' => 2],
          ]
        ], [
          'type' => "row", 'css' => "row-like-table flex-stretch", 'k' => 'cells', 'php' => [
            ['input' => '置顶顺序', 'model' => 'price3', 'w' => 2,],
            ['input' => '商品描述', 'w' => 6, 'type' => "textarea",],
          ]
        ], [
          'type' => "row", 'css' => "row-like-table flex-stretch", 'k' => 'cells', 'php' => [
            ['input' => '属性选项', 'w' => 5, 'input_css' => 'flex-v-center', 'type' => "tags", 'q-list' => "7天包退,送货上门,食品级保证,订货,零售"],
          ]
        ], [
          'type' => "row", 'css' => "padding-1", 'cells' => [
            ['css' => "em-15 b-900 padding-1", 'type' => "text", 'text' => "原图(微信分享)"],
          ]
        ], [
          'type' => "row", 'css' => "row-like-table flex-stretch", 'k' => 'cells', 'php' => [
            ['input' => '标题图(第1张有效)', 'model' => '标题图', 'w' => 2, 'type' => "imgs",],
            ['input' => '详情图', 'w' => 6, 'type' => "imgs",],
            ['input' => '分享描述', 'w' => 6, 'type' => "textarea",],
          ]
        ], [
          'type' => "row", 'css' => "padding-1", 'cells' => [
            ['css' => "em-15 b-900 padding-1", 'type' => "text", 'text' => "相关链接"],
          ]
        ], [
          'type' => "table", 'css' => "row-like-table", 'model' => '相关链接', 'cols' => [
            ['w' => 5, 'title' => "序号", 'item_css' => "flex-cc", 'type' => "autoindex"],
            ['w' => 15, 'title' => "商品", 'item_css' => "bk-f", 'model' => "id", 'type' => "dj-dropdown", 'list' => "商城商品"],
            ['w' => 30, 'title' => "数量", 'item_css' => "", 'model' => "n", 'type' => "input"],
          ],
        ],
      ],

      'btns' => [
        [
          '$var' => [],
          'show' => [
            'name' => "保存",
            'css' => "box-primary",
            'can_ac' => "=1",
          ],
          'disabled' => "=!\$form.dirty",
          'mode' => 'ajax-json',
          'data' => [
            'api' => "shop_admin/update_detail",
            'search' => ['code' => "=code", 'value' => "=\$form.value"],
          ],
        ], [
          '$var' => [],
          'show' => [
            'name' => "上架",
            'css' => "box-warning",
            'can_ac' => "=status!='已上架'",
          ],
          'mode' => 'ajax-json',
          'data' => [
            'api' => "shop_admin/set_onsale",
            'search' => ['code' => "=code"],
          ],
        ], [
          '$var' => [],
          'show' => [
            'name' => "下架",
            'css' => "box-stop",
            'can_ac' => "=status=='已上架'",
          ],
          'mode' => 'ajax-json',
          'data' => [
            'api' => "shop_admin/unset_onsale",
            'search' => ['code' => "=code"],
          ],
        ],
      ],
    ],

    '商品分类配置' => [
      'captions' => [
        [
          'type' => "row", 'css' => "padding-1 flex", 'cells' => [
            ['css' => "em-15 b-900 padding-1", 'type' => "text", 'text' => "商品分类配置："],
            ['css' => "flex-cc padding-v-3", 'type' => "calcu", 'text' => "=code"],
          ]
        ], [
          'type' => "row", 'css' => "row-like-table flex-stretch", 'k' => 'cells', 'php' => [
            ['input' => '商品名称', 'model' => 'name', 'w' => 8,],
          ]
        ], [
          'type' => "row", 'css' => "row-like-table flex-stretch", 'k' => 'cells', 'php' => [
            ['input' => '上级分类', 'model' => 'v1', 'w' => 8,],
          ]
        ], [
          'type' => "row", 'css' => "row-like-table flex-stretch", 'k' => 'cells', 'php' => [
            ['input' => '显示序号', 'model' => 'v2', 'w' => 3,],
          ]
        ],
      ],

      'btns' => [
        [
          '$var' => [],
          'show' => [
            'name' => "保存",
            'css' => "box-primary",
            'can_ac' => "=1",
          ],
          'disabled' => "=!\$form.dirty",
          'mode' => 'ajax-json',
          'data' => [
            'api' => "shop_admin/update_detail_group",
            'search' => ['code' => "=code", 'value' => "=\$form.value"],
          ],
        ], [
          '$var' => [],
          'show' => [
            'name' => "上架",
            'css' => "box-warning",
            'can_ac' => "=status!='已上架'",
          ],
          'mode' => 'ajax-json',
          'data' => [
            'api' => "shop_admin/set_onsale",
            'search' => ['code' => "=code"],
          ],
        ], [
          '$var' => [],
          'show' => [
            'name' => "下架",
            'css' => "box-stop",
            'can_ac' => "=status=='已上架'",
          ],
          'mode' => 'ajax-json',
          'data' => [
            'api' => "shop_admin/unset_onsale",
            'search' => ['code' => "=code"],
          ],
        ],
      ],
    ],

  ];


  public static function parse_caption_rows($row)
  {
    if (!isset($row['input'])) return [$row];
    $input = $row['input'];
    $w = $row['w'];
    $model = $row['model'];
    if (!$model) $model = $input;
    $type = $row['type'];
    if (!$type) $type = "input";
    $R = [[
      'css' => "padding-2 bk-f8 text-8 flex-cc", 'type' => "text", 'text' => $input
    ], [
      'css' => "bk-f flex-{$w} {$row['input_css']}",
      'model' => $model,
      'type' => $type,
    ]];
    foreach (['list', 'readonly'] as $field) if (isset($row[$field])) $R[1][$field] = $row[$field];
    if (isset($row['q-list'])) $R[1]['list'] = explode(',', $row['q-list']);
    return $R;
  }

  // 配置，给前端
  public static function webConfig($verifyData)
  {
    $webConfig = self::configAll();
    foreach ($webConfig['字典配置'] as &$config) {
      unset($config['server']);
    }
    foreach ($webConfig['config'] as &$config) {
      unset($config['server']);
      foreach ($config['actions'] as &$action) {
        unset($action['update'], $action['updates'], $action['server']);
      }
    }
    return $webConfig;
  }
  public static function configAll()
  {
    $base_config = self::$CONFIG;
    foreach (['商城后台配置', '商品分类配置'] as $config_name) {
      $config = &$base_config[$config_name];
      if (isset($config['captions'])) $config['captions'] = \DJApi\map($config['captions'], function ($captions) {
        if (isset($captions['php'])) {
          $arr = $captions['php'];
          $k = $captions['k'];
          unset($captions['php'], $captions['k']);
          $captions[$k] = [];
          foreach ($arr as $row) {
            $rows = self::parse_caption_rows($row);
            foreach ($rows as $r) $captions[$k][] = $r;
          };
        }
        return $captions;
      });
    }
    return $base_config;
  }
  public static function configUseTypeAsKey()
  {
    $config = [];
    foreach (self::configAll()['config'] as $row) {
      $config[$row['type']] = $row;
    }
    return $config;
  }
  public static function configTypesByMode()
  {
    $names = [];
    foreach (self::configAll()['config'] as $row) {
      $names[$row['mode']][] = $row['type'];
    }
    return $names;
  }


  /** 资源配置 */
  public static function getConfig($type)
  {
    foreach (self::configAll()['config'] as $config) {
      if ($config['type'] == $type) return $config;
    }
    return false;
  }

  /** 操作定义 */
  public static function getAcDefine(&$config, $oldStatus, $ac)
  {
    foreach ($config['actions'] as $v) {
      if ($v['name'] == $ac && (!$oldStatus || in_array($oldStatus, $v['from']))) return $v;
    }
    return false;
  }
  /** 是否有下一操作 */
  public static function hasAc(&$config, $oldStatus, $ac)
  {
    foreach ($config['actions'] as $v) {
      if ($v['name'] == $ac && (!$oldStatus || in_array($oldStatus, $v['from']))) return true;
    }
    return false;
  }
}
