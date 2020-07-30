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

    '系统参数配置' => [
      'captions' => [
        [
          'type' => "row", 'css' => "row-like-table flex-stretch", 'k' => 'cells', 'php' => [
            ['input' => '主标题', 'w' => 8,],
            ['input' => '主标题2', 'w' => 8,],
          ]
        ], [
          'type' => "row", 'css' => "row-like-table flex-stretch", 'k' => 'cells', 'php' => [
            ['input' => '主要地址', 'w' => 5,],
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
            'api' => "admin/sys_update_data",
            'search' => ['value' => "=\$form.value"],
          ],
        ],
      ],
    ],

  ];


  /** 系统数据, 公共部分 */
  public static function sys_common_data()
  {
    $db = \MyClass\CDbBase::db();
    $db_row = $db->get(CDbBase::table('shop_res_index'), ['id', 'attr'], ['AND' => ['type' => '系统参数', 'name' => '系统参数']]);
    $attr = json_decode($db_row['attr'], true);
    if (!is_array($attr)) $attr = [];
    if (!is_array($attr['value'])) $attr['value'] = [];
    return $attr['value'];
  }

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
    foreach (['系统参数配置'] as $config_name) {
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
}
