<?php

namespace DICK;

use MyClass\CDbBase;

/**
 * 通用票据
 */
class CDick
{
  public static function table()
  {
    return CDbBase::table('stock_bills');
  }

  /**
   * 添加一个字典项
   * @return [n]
   */
  public static function getTypeDefine($type, $verifyData)
  {
    $webConfig = \FLOW\CQrcodeDefine::configAll();
    foreach ($webConfig['字典配置'] as $dickItem) {
      if ($dickItem['name'] == $type) return $dickItem;
    }
    return false;
  }

  /**
   * 添加一个字典项
   * @return [n]
   */
  public static function create_item($query, $verifyData)
  {
    $uid = $verifyData['uid'];
    $type = $query['type'];
    if (!\MyClass\CStockUser::hasPower($uid, '字典权限', $type)) return \DJApi\API::error(\DJApi\API::E_NEED_RIGHT, "没有权限");

    $fn = "create_item_$type";
    if (method_exists(__CLASS__, $fn)) return self::$fn($query, $verifyData);

    $typeDefine = self::getTypeDefine($type, $verifyData);
    if (!$typeDefine) return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, '字典无效');

    /** 在配置中定义 */
    if ($typeDefine['server']['create_item']) {
      $query['now'] = date('Y-m-d H:i:s');
      foreach ($typeDefine['server']['create_item'] as $update) {
        $R = \FLOW\FN::exec_update($update, $query);
        if (\DJApi\API::isError($R)) {
          \DJApi\API::debug(["操作失败" => $R]);
          return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, "操作失败1", $R);
        }
      }
      return \DJApi\API::OK($R);
    }
    return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, '未保存', $typeDefine);
  }

  /**
   * 添加一个字典项
   * @return [n]
   */
  public static function update_item($query, $verifyData)
  {
    $uid = $verifyData['uid'];
    $type = $query['type'];
    if (!\MyClass\CStockUser::hasPower($uid, '字典权限', $type)) return \DJApi\API::error(\DJApi\API::E_NEED_RIGHT, "没有权限");

    $fn = "update_item_$type";
    if (method_exists(__CLASS__, $fn)) return self::$fn($query, $verifyData);

    $typeDefine = self::getTypeDefine($type, $verifyData);
    if (!$typeDefine) return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, '字典无效');

    /** 在配置中定义 */
    if ($typeDefine['server']['update_item']) {
      $query['now'] = date('Y-m-d H:i:s');
      foreach ($typeDefine['server']['update_item'] as $update) {
        $db = CDbBase::db();
        $table = \FLOW\FN::value_of($update['data']['table'], $query);
        $and = \FLOW\FN::value_of($update['data']['AND'], $query);
        $db_row = $db->get(CDbBase::table($table), '*', ['AND' => $and]);
        // 原数据行, 传递给更新时的计算参数
        $param = ['$$' => [$query, $db_row]];

        $R = \FLOW\FN::exec_update($update, $param);
        if (\DJApi\API::isError($R)) {
          \DJApi\API::debug(["操作失败" => $R]);
          return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, "操作失败1", $R);
        }
      }
      return \DJApi\API::OK($R);
    }
    return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, '未保存', $typeDefine);
  }


  ///**
  // * 添加一个字典项
  // * @return [n]
  // */
  //public static function create_item_产品套件字典($query, $verifyData)
  //{
  //  $type = $query['type'];
  //
  //  $data = [
  //    'k1' => $type,
  //    'v1' => $query['value']['套件名称'],
  //    'v2' => $query['value']['套件组成'],
  //  ];
  //  /** 默认操作 */
  //  $now = date('Y-m-d H:i:s');
  //  $db = \MyClass\CDbBase::db();
  //  //$rows = $db->select(CDbBase::table('stock_dick_datas'), ['id','k1','k2','k3','v1','v2','v3'], ['k1' => ['木材种类', '木工']]);
  //  return \DJApi\API::OK(['query' => $query]);
  //}


  /**
   * 
   */
  public static function getDetail($type, $AND)
  {
    $db = CDbBase::db();
    if ($type == '客户') {
      return $db->get(CDbBase::table('stock_dick_client'), "*", ['AND' => $AND]);
    }
    if ($type == '产品') {
      return $db->get(CDbBase::table('stock_dick_product'), "*", ['AND' => $AND]);
    }

    if (in_array($type, ['木材种类', '木工'])) {
      if (!$AND) $AND = [];
      $AND['k1'] = $type;
      return $db->get(CDbBase::table('stock_dick_datas'), "*", ['AND' => $AND]);
    }

    return [];
  }



  /**
   * 
   */
  public static function getList($type, $AND, $keyName = "")
  {
    $db = CDbBase::db();
    if ($type == '客户') {
      $rows = $AND
        ? $db->select(CDbBase::table('stock_dick_client'), "*", ['AND' => $AND])
        : $db->select(CDbBase::table('stock_dick_client'), "*");
      if (!$keyName) return $rows;
      $R = [];
      foreach ($rows as $row) {
        $R[$row[$keyName]] = $row;
      }
      return $R;
    }

    if ($type == '仓库') {
      if(!$AND)$AND=[];
      $AND['type']="仓库";
      $rows = $db->select(CDbBase::table('stock_res_index'), "*", ['AND' => $AND]);
      if (!$keyName) return $rows;
      $R = [];
      foreach ($rows as $row) {
        $R[$row[$keyName]] = $row;
      }
      return $R;
    }

    if ($type == '产品') {
      $rows = $AND
        ? $db->select(CDbBase::table('stock_dick_product'), "*", ['AND' => $AND])
        : $db->select(CDbBase::table('stock_dick_product'), "*");
      if (!$keyName) return $rows;
      $R = [];
      foreach ($rows as $row) {
        $R[$row[$keyName]] = $row;
      }
      return $R;
    }

    if (in_array($type, ['木材种类', '木工'])) {
      if (!$AND) $AND = [];
      $AND['k1'] = $type;
      $rows = $db->select(CDbBase::table('stock_dick_datas'), "*", ['AND' => $AND]);
      if (!$keyName) return $rows;
      $R = [];
      foreach ($rows as $row) {
        $R[$row[$keyName]] = $row;
      }
      \DJApi\API::debug(['rows' => $rows, 'R' => $R, "DB" => $db->getShow()]);
      return $R;
    }

    if (in_array($type, ['产品套件字典', '开料单字典'])) {
      if (!$AND) $AND = [];
      $AND['k1'] = $type;
      $rows = $db->select(CDbBase::table('stock_dick_datas'), "*", ['AND' => $AND]);

      \DJApi\API::debug(['查询产品套件字典' => $rows, 'DB' => $db->getShow()]);

      foreach ($rows as $k => $row) {
        $rows[$k]['v2'] = json_decode($row['v2'], true);
      }
      if (!$keyName) return $rows;
      $R = [];
      foreach ($rows as $row) {
        $R[$row[$keyName]] = $row;
      }
      \DJApi\API::debug(['rows' => $rows, 'R' => $R, "DB" => $db->getShow()]);
      return $R;
    }

    return [];
  }

  /**
   * 产品价格
   */
  public static function cp_price($cpDickRow, $mc)
  {
    $attr = $cpDickRow['attr'];
    if (!is_array($attr)) $attr = json_decode($attr, true);
    if (!is_array($attr)) return 0;
    $价格表 = $attr['价格表'];
    if (!is_array($价格表)) return 0;
    $jg = 0;
    $t_jg = "";
    foreach ($价格表 as $row) {
      if ($row['生效日期'] > $t_jg && $row['木材'] == $mc) {
        $jg = $row['价格'];
        $t_jg = $row['生效日期'];
      }
    }
    return $jg;
  }

  /**
   * 合并套件
   */
  public static function merge_tj($baseList)
  {
    $cpids = [];
    $tjids = [];
    if ($baseList) foreach ($baseList as $row) {
      if ($row['type'] == '产品') $cpids[] = $row['v1'];
      if ($row['type'] == '产品套件') $tjids[] = $row['tjid'];
    }
    $cpDick = \DICK\CDick::getList('产品', ['id' => $cpids], "id");
    $tjDick = \DICK\CDick::getList('产品套件字典', ['v1' => $tjids], "v1");

    \DJApi\API::debug(['产品字典' => $cpDick, '产品套件字典' => $tjDick]);

    $goodlist = [];

    foreach ($baseList as $row) {
      if (isset($row['套件'])) {
        \DJApi\API::debug(['套件', 'row' => $row, 'goodlist' => $goodlist]);
        $fullName = $row['name'] . $row['套件'];
        if ($goodlist[$fullName]) continue;
        $goodlist[$fullName] = [
          'mc' => $row['name'],
          'cp_name' => $row['套件'],
          'unit' => '套',
          'count' => $row['套件sl'] + 0,
          'price' => $row['套件jg'] + 0,
        ];
        continue;
      }
      if ($row['type'] == '产品') {
        $cp = $cpDick[$row['v1']];
        if ($cp) {
          $fullName = $row['name'] . $cp['name'];
          if ($goodlist[$fullName]) continue;
          $goodlist[$fullName] = [
            'mc' => $row['name'],
            'cp_name' => $cp['name'],
            'unit' => $cp['unit'] ? $cp['unit'] : '只',
            'count' => $row['sl'] + 0,
            'price' => $row['jg'] + 0,
          ];
        }
      }
      if ($row['type'] == '分组') {
        $fullName = $row['name'] . $row['tjid'];
        $goodlist[$fullName] = [
          'mc' => $row['name'],
          'cp_name' => $row['tjid'],
          'unit' => '套',
          'count' => $row['sl'] + 0,
          'price' => $row['jg'] + 0,
        ];
      }
      if ($row['type'] == '产品套件') {
        $tj = $tjDick[$row['tjid']];
        if ($tj) {
          $fullName = $row['name'] . $tj['v1'];
          if ($goodlist[$fullName]) continue;
          $goodlist[$fullName] = [
            'mc' => $row['name'],
            'cp_name' => $tj['v1'],
            'unit' => '套',
            'count' => $row['sl'] + 0,
            'price' => $row['jg'] + 0,
          ];
        }
      }
    }

    $mcDick = \DICK\CDick::getList('木材种类', '', 'v1');
    foreach ($goodlist as &$row) {
      $mc = $mcDick[$row['mc']];
      if ($mc) $row['mcFullName'] =  $mc['v2'];
    }
    return array_values($goodlist);
  }
}
