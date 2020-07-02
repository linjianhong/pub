<?php

namespace RequestByApiShell;

use MyClass\CDbBase;

class class_buyer
{
  static $TABLE_USER = "shop_user";

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

  /**
   * 接口： buyer/favorite
   * 个人收藏
   * @return {list:[id]}
   */
  public static function favorite($query, $verifyData)
  {
    $uid = $verifyData['uid'];
    $type = $query['type'];
    $mode = $query['mode'];
    $code = $query['code'];
    $db = \MyClass\CDbBase::db();
    /* 查询 */
    $user_row = $db->get(CDbBase::table(self::$TABLE_USER), '*', ['AND' => ['uid' => $uid]]);
    $attr = json_decode($user_row['attr'], true);
    if (!is_array($attr)) $attr = [];
    if (!is_array($attr['收藏'])) $attr['收藏'] = [];

    $allready_favorite = \DJApi\find($attr['收藏'], function ($row) use ($type, $code) {
      return $row['type'] == $type && $row['code'] == $code;
    });
    $attr['收藏'] = \DJApi\filter($attr['收藏'], function ($row) use ($type, $code) {
      return $row['type'] != $type || $row['code'] != $code;
    });

    if ($mode == "add" || ($mode = "toggle" && !$allready_favorite)) {
      array_unshift($attr['收藏'], ['type' => $type, 'code' => $code]);
    }

    $str_attr = \DJApi\API::cn_json($attr);
    if (!$user_row) {
      $db->insert(CDbBase::table(self::$TABLE_USER), ['attr' => $str_attr, 'uid' => $uid, 't1' => date('Y-m-d H:i:s')]);
    } else {
      $db->update(CDbBase::table(self::$TABLE_USER), ['attr' => $str_attr], ['uid' => $uid]);
    }
    \DJApi\API::debug(["收藏" => $attr['收藏'], 'DB' => $db->getShow()]);
    return \DJApi\API::OK();
  }



  /**
   * 接口： buyer/query_cart
   * 我的购物车
   * @return {list:[id]}
   */
  public static function query_cart($query, $verifyData)
  {
    $uid = $verifyData['uid'];
    $db = \MyClass\CDbBase::db();
    /* 查询 */
    $user_row = $db->get(CDbBase::table(self::$TABLE_USER), '*', ['AND' => ['uid' => $uid]]);
    if (!$user_row) {
      return \DJApi\API::OK(['list' => []]);
    } else {
      $attr = json_decode($user_row['attr'], true);
      $list = $attr['购物车'];
      return \DJApi\API::OK(['list' => $list ? $list : []]);
    }
  }


  /**
   * 接口： buyer/add2cart
   * 添加到购物车
   * @return {list:[id]}
   */
  public static function add2cart($query, $verifyData)
  {
    $uid = $verifyData['uid'];
    $type = $query['type'];
    $code = $query['code'];
    $n = $query['n'];
    $db = \MyClass\CDbBase::db();
    /* 查询 */
    $user_row = $db->get(CDbBase::table(self::$TABLE_USER), '*', ['AND' => ['uid' => $uid]]);
    $attr = json_decode($user_row['attr'], true);
    if (!is_array($attr)) $attr = [];
    if (!is_array($attr['购物车'])) $attr['购物车'] = [];

    $in_cart = \DJApi\find($attr['购物车'], function ($row) use ($type, $code) {
      return $row['type'] == $type && $row['code'] == $code;
    });
    $attr['购物车'] = \DJApi\filter($attr['购物车'], function ($row) use ($type, $code) {
      return $row['type'] != $type || $row['code'] != $code;
    });
    if ($in_cart) {
      $in_cart['n'] += $n;
    } else {
      $in_cart = ['type' => $type, 'code' => $code, 'n' => $n];
    }
    array_unshift($attr['购物车'], $in_cart);


    $str_attr = \DJApi\API::cn_json($attr);
    if (!$user_row) {
      $db->insert(CDbBase::table(self::$TABLE_USER), ['attr' => $str_attr, 'uid' => $uid, 't1' => date('Y-m-d H:i:s')]);
    } else {
      $db->update(CDbBase::table(self::$TABLE_USER), ['attr' => $str_attr], ['uid' => $uid]);
    }
    \DJApi\API::debug(["加购" => $in_cart, 'DB' => $db->getShow()]);
    return \DJApi\API::OK();
  }



  /**
   * 接口： buyer/address
   * 我的收货地址
   * @return {list:[id]}
   */
  public static function address($query, $verifyData)
  {
    $uid = $verifyData['uid'];
    $db = \MyClass\CDbBase::db();
    /* 查询 */
    $user_row = $db->get(CDbBase::table(self::$TABLE_USER), '*', ['AND' => ['uid' => $uid]]);
    if (!$user_row) {
      return \DJApi\API::OK(['list' => []]);
    } else {
      $attr = json_decode($user_row['attr'], true);
      $list = $attr['收货地址'];
      return \DJApi\API::OK(['list' => $list ? $list : []]);
    }
  }


  /**
   * 接口： buyer/add_address
   * 添加一个收货地址
   * @return {list:[id]}
   */
  public static function add_address($query, $verifyData)
  {
    $uid = $verifyData['uid'];
    $value = $query['value'];
    $value['type'] = "收货地址";
    if ($value['main'] && $value['main'] != '0') $value['main'] = 1;
    else unset($value['main']);
    $db = \MyClass\CDbBase::db();
    /* 查询 */
    $user_row = $db->get(CDbBase::table(self::$TABLE_USER), '*', ['AND' => ['uid' => $uid]]);
    if (!$user_row) {
      $db->insert(CDbBase::table(self::$TABLE_USER), [
        "uid" => $uid,
        "t1" => date("Y-m-d H:i:s"),
        "attr" => \DJApi\API::cn_json(['收货地址' => [$value]])
      ]);
      return \DJApi\API::OK([0]);
    } else {
      $attr = json_decode($user_row['attr'], true);
      $list = $attr['收货地址'];
      if (!is_array(($list))) $list = [];
      array_unshift($list, $value);
      if ($value['main']) {
        foreach ($list as &$row) {
          unset($row['main']);
        }
      }
      $attr['收货地址'] = $list;
      $db->update(CDbBase::table(self::$TABLE_USER), ["attr" => \DJApi\API::cn_json($attr)], ["uid" => $uid]);
      return \DJApi\API::OK([1]);
    }
  }


  /**
   * 接口： buyer/update_address
   * 更新所有的收货地址
   * @return {list:[id]}
   */
  public static function update_address($query, $verifyData)
  {
    $uid = $verifyData['uid'];
    $value = $query['value'];
    if (!is_array(($value)))
      return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, "无效数据");
    $db = \MyClass\CDbBase::db();
    /* 查询 */
    $user_row = $db->get(CDbBase::table(self::$TABLE_USER), '*', ['AND' => ['uid' => $uid]]);
    if (!$user_row) {
      return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, "非法提交");
    }

    $attr = json_decode($user_row['attr'], true);
    $list = $attr['收货地址'];
    if (!is_array(($list))) $list = [];
    $attr['收货地址'] = $value;
    $db->update(CDbBase::table(self::$TABLE_USER), ["attr" => \DJApi\API::cn_json($attr)], ["uid" => $uid]);
    return \DJApi\API::OK([1]);
  }


  /**
   * 接口： buyer/create_order
   * 我的收货地址
   * @return {list:[id]}
   */
  public static function create_order($query, $verifyData)
  {
    $uid = $verifyData['uid'];
    $reciever = $query['reciever'];
    $items = $query['items'];
    $totle = $query['totle'] + 0;
    if (!is_array($items) || !is_array($reciever))
      return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, "无效数据");
    $db = \MyClass\CDbBase::db();
    /* 查询 */
    $order_id = $db->insert(CDbBase::table('buyer_order_list'), [
      'uid' => $uid,
      'reciever' => \DJApi\API::cn_json($reciever),
      'totle' => $totle,
      't_order' => date('Y-m-d H:i:s'),
    ]);
    foreach ($items as $row) {
      if (!$row['price']) $row['price'] = '';
      if (!$row['color']) $row['color'] = '';
      $db->insert(CDbBase::table('buyer_order_item'), [
        'order_id' => $order_id,
        'code' => $row['code'],
        'n' => $row['n'],
        'price' => $row['price'],
        'color' => $row['color'],
        'attr' => '',
      ]);
    }
    return \DJApi\API::OK(['order' => ['id' => $order_id]]);




    /** 支持微信支付时，启用以下代码 */
    $appid = 'wx3a807a2f301479ae';

    $openid_json = \DJApi\API::post(SERVER_API_ROOT, "user/bind/get_bind", [
      'uid' => $uid,
      'bindtype' => 'wx-openid',
      'param1' => $appid,
    ]);
    \DJApi\API::debug(['openid_json' => $openid_json]);
    $openid = $openid_json['datas']['binds'][0]['value'];

    require_once "api_wxpay.php";
    $configs = [
      'AppId' => $appid,
    ];
    $pay_mode = 'WxPay.JsApiPay';
    $t_create_pay = time();
    $order = [
      'id' => $order_id,
      'fen' => $uid == '209108' ? 1 : $totle * 100,
      'openid' => $openid,
    ];
    $pay_data = [
      'configs' => $configs,
      'order' => $order,
      'payParam' => CWxPay::getJsApiPay($configs, $order, 7800)
    ];
    \DJApi\API::debug(['pay_data' => $pay_data]);
    $db->update(CDbBase::table('buyer_order_list'), [
      'pay_mode' => $pay_mode,
      't_create_pay' => $t_create_pay,
      'pay_data' => \DJApi\API::cn_json($pay_data),
    ], ['id' => $order_id]);

    return \DJApi\API::OK(['order' => ['id' => $order_id], 'pay_mode' => $pay_mode, 'payParam' => $pay_data['payParam']]);
  }


  /**
   * 接口： buyer/order_detail
   * 订单详情
   * @return {list:[id]}
   */
  public static function order_detail($query, $verifyData)
  {
    $uid = $verifyData['uid'];
    $order_id = $query['code'];

    $db = \MyClass\CDbBase::db();
    $order_detail = $db->get(CDbBase::table('buyer_order_list'), '*', ['id' => $order_id]);
    if (!$order_detail) {
      return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, "订单不存在");
    }
    $order_items = $db->select(CDbBase::table('buyer_order_item'), '*', ['order_id' => $order_id]);
    $order_detail['reciever'] = json_decode($order_detail['reciever'], true);
    $order_detail['pay_data'] = json_decode($order_detail['pay_data'], true);

    $appid = 'wx3a807a2f301479ae';

    if (!$order_detail['t_pay']) {
      require_once "api_wxpay.php";
      $configs = [
        'AppId' => $appid,
      ];
      $order = [
        'id' => $order_id,
      ];
      $queryPayData = CWxPay::queryPay($configs, $order);
      \DJApi\API::debug(['queryPayData' => $queryPayData]);
      if ($queryPayData['return_code'] != 'SUCCESS' || $queryPayData['result_code'] != 'SUCCESS') {
        //未发起支付
        $state = "未发起支付";
      } else if ($queryPayData['trade_state'] == 'SUCCESS') {
        $state = "已支付";
      } else if ($order_detail['t_create_pay'] + 7200 < time()) {
        $state = "订单已过期";
      } else {
        $state = "正在支付"; // 可以重新支付
      }
    } else {
      $state = "已支付";
    }

    return \DJApi\API::OK([
      'state' => $state,
      'detail' => $order_detail,
      'items' => $order_items,
      'queryPayData' => $queryPayData
    ]);
  }


  /**
   * 接口： buyer/my_order_list
   * 订单详情
   * @return {list:[id]}
   */
  public static function my_order_list($query, $verifyData)
  {
    $uid = $verifyData['uid'];

    $db = \MyClass\CDbBase::db();
    $db_order_list = $db->select(CDbBase::table('buyer_order_list'), '*', ['uid' => $uid]);
    if (!is_array($db_order_list)) {
      return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, "订单不存在");
    }
    $order_ids = [];
    foreach ($db_order_list as $row) {
      $order_ids[] = $row['id'];
    }
    \DJApi\API::debug(["db_order_list" => $db_order_list, 'order_ids' => $order_ids, 'DB' => $db->getShow()]);
    $db_order_items = $db->select(CDbBase::table('buyer_order_item'), '*',  ['order_id' => $order_ids]);
    \DJApi\API::debug(["items" => $db_order_items, 'order_ids' => $order_ids, 'DB' => $db->getShow()]);

    $orders = [];
    foreach ($db_order_list as $row) {
      $row['list'] = [];
      $orders[$row['id']] = $row;
    }
    foreach ($db_order_items as $row) {
      $order_id = $row['order_id'];
      $orders[$order_id]['list'][] = $row;
    }

    return \DJApi\API::OK([
      'orders' => array_values($orders),
    ]);
  }


  /**
   * 接口： buyer/check_order_pay
   * 查询订单支付情况
   * @return {list:[id]}
   */
  public static function check_order_pay($query, $verifyData)
  {
    $uid = $verifyData['uid'];
    $order_id = $query['order_id'];

    $appid = 'wx3a807a2f301479ae';

    require_once "api_wxpay.php";
    $configs = [
      'AppId' => $appid,
    ];
    $order = [
      'id' => $order_id,
    ];
    $queryPayData = CWxPay::queryPay($configs, $order);
    \DJApi\API::debug(['queryPayData' => $queryPayData]);

    return \DJApi\API::OK(['order_id' => $order_id, 'queryPayData' => $queryPayData]);
  }
}
