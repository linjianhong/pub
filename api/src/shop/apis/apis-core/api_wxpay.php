<?php

namespace RequestByApiShell;

use MyClass\CDbBase;

class class_wxpay
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


  /* ----------------------------------------------------------------------
   * 用户支付成功后，将调用本函数
   * $payid：在 wx_pay 表中的id
   * ---------------------------------------------------------------------- */
  public static function notify_pay_success(&$db, $payid)
  {
    $payinfo = $db->get("wx_pay", ["id", "api", "module", "used", "fen", "orderno", "successrq", "time_end", "openid"], ["id" => $payid]);
    if ($DEBUG_PAY) config_log("payid=$payid, payinfo = " . cn_json($payinfo) . ", db = " . cn_json($db->getShow()), "debug.txt");
    if (!$payinfo) return;
    if ($payinfo["used"]) return; //已使用

    //判断是否已支付成功：
    if ($payinfo['time_end'] < '2005-01') return false;
    if ($payinfo['successrq'] < '2005-01') return false;

    switch ($payinfo["module"]) {
      case "shop-auction": //商城拍卖
        require_once("api_shop.php");
        $used = class_shop::notify_pay_success_shop_auction($db, $payinfo);
        if ($DEBUG_PAY) config_log("used = $used", "debug.txt");
        break;
      case "shop-raise": //商城众筹
        require_once("api_shop.php");
        $used = class_shop::notify_pay_success_shop_raise($db, $payinfo);
        if ($DEBUG_PAY) config_log("used = $used", "debug.txt");
        break;
      case "pay-order": //商城默认
      default: //商城默认
        require_once("api_user.php");
        $used = class_user::notify_pay_success($db, $payid);
        break;
    }
    //如果这次已使用，则标志一下
    if ($used) $db->update("wx_pay", ["used" => 1], ["id" => $payid]);
  }
}


class CWxPay
{
  public static function getJsApiPay($configs, $order, $delay=600)
  {
    \DJApi\Configs::readConfigOnce('api-lib/wxpay-3.0.10/WxPay.Data.php');
    \DJApi\Configs::readConfigOnce('api-lib/wxpay-3.0.10/WxPay.Api.php');

    $AppId = $configs['AppId'];
    $wxPayConfig = new MyWxPayConfig($AppId);

    //②、统一下单
    $input = new \WxPayUnifiedOrder();
    $input->SetBody("test-body");
    $input->SetAttach("test-Attach");
    $input->SetOut_trade_no($wxPayConfig->out_trade_no($order['id']));
    $input->SetTotal_fee($order['fen']);
    $input->SetTime_start(date("YmdHis"));
    $input->SetTime_expire(date("YmdHis", time() + $delay ));
    $input->SetGoods_tag("test-Goods_tag");
    $input->SetNotify_url($wxPayConfig->GetNotifyUrl());
    $input->SetTrade_type("JSAPI");
    $input->SetOpenid($order['openid']);
    \DJApi\API::debug(["configs" => $configs, "order" => $order, "input" => $input, "wxPayConfig" => $wxPayConfig]);
    try {
      $wxPayOrder = \WxPayApi::unifiedOrder($wxPayConfig, $input);
    } catch (WxPayException $e) {
      return ["e" => $e];
    }

    if (
      !array_key_exists("appid", $wxPayOrder)
      || !array_key_exists("prepay_id", $wxPayOrder)
      || $wxPayOrder['prepay_id'] == ""
    ) {
      // throw new \WxPayException("参数错误");
      return ["参数错误" => $wxPayOrder, "openid" => $order['openid']];
    }

    \DJApi\API::debug(["wxPayOrder" => $wxPayOrder]);
    $jsapi = new \WxPayJsApiPay();
    $jsapi->SetAppid($wxPayOrder["appid"]);
    $timeStamp = time();
    $jsapi->SetTimeStamp("$timeStamp");
    $jsapi->SetNonceStr(\WxPayApi::getNonceStr());
    $jsapi->SetPackage("prepay_id=" . $wxPayOrder['prepay_id']);

    $jsapi->SetPaySign($jsapi->MakeSign($wxPayConfig));
    //$parameters = json_encode($jsapi->GetValues());
    $parameters = $jsapi->GetValues();
    return $parameters;
  }


  public static function queryPay($configs, $order, $timeOut = 60)
  {
    $AppId = $configs['AppId'];
    $config = new MyWxPayConfig($AppId);
    $out_trade_no = $config->out_trade_no($order['id']);
    \DJApi\Configs::readConfigOnce('api-lib/wxpay-3.0.10/WxPay.Data.php');
    \DJApi\Configs::readConfigOnce('api-lib/wxpay-3.0.10/WxPay.Api.php');

    $inputObj = new \WxPayOrderQuery();
    $inputObj->SetOut_trade_no($out_trade_no);
    return \WxPayApi::orderQuery($config, $inputObj);
  }
}


\DJApi\Configs::readConfigOnce('api-lib/wxpay-3.0.10/WxPay.Config.Interface.php');
class MyWxPayConfig extends \WxPayConfigInterface
{
  public function __construct($AppId)
  {
    $this->configs = self::getConfigs($AppId);
  }

  static function getConfigs($AppId)
  {
    $all_configs = \DJApi\Configs::get("PAY_CONFIGS");
    \DJApi\API::debug(["PAY_CONFIGS:" => $all_configs]);
    foreach ($all_configs as $config) {
      if ($config['type'] == '微信支付' && $config['AppId'] == $AppId) return $config;
    }
    return false;
  }
  public function out_trade_no($order_id)
  {
    return "{$this->configs['out_trade_no_pre']}-$order_id";
  }
  //=======【基本信息设置】=====================================
  /**
   * TODO: 修改这里配置为您自己申请的商户信息
   * 微信公众号信息配置
   * 
   * APPID：绑定支付的APPID（必须配置，开户邮件中可查看）
   * 
   * MCHID：商户号（必须配置，开户邮件中可查看）
   * 
   */
  public function GetAppId()
  {
    return $this->configs['AppId'];
  }
  public function GetMerchantId()
  {
    return $this->configs['MerchantId'];
  }

  //=======【支付相关配置：支付成功回调地址/签名方式】===================================
  /**
   * TODO:支付回调url
   * 签名和验证签名方式， 支持md5和sha256方式
   **/
  public function GetNotifyUrl()
  {
    return $this->configs['NotifyUrl'];
  }
  public function GetSignType()
  {
    return $this->configs['SignType'];
  }

  //=======【curl代理设置】===================================
  /**
   * TODO：这里设置代理机器，只有需要代理的时候才设置，不需要代理，请设置为0.0.0.0和0
   * 本例程通过curl使用HTTP POST方法，此处可修改代理服务器，
   * 默认CURL_PROXY_HOST=0.0.0.0和CURL_PROXY_PORT=0，此时不开启代理（如有需要才设置）
   * @var unknown_type
   */
  public function GetProxy(&$proxyHost, &$proxyPort)
  {
    $proxyHost = "0.0.0.0";
    $proxyPort = 0;
  }


  //=======【上报信息配置】===================================
  /**
   * TODO：接口调用上报等级，默认紧错误上报（注意：上报超时间为【1s】，上报无论成败【永不抛出异常】，
   * 不会影响接口调用流程），开启上报之后，方便微信监控请求调用的质量，建议至少
   * 开启错误上报。
   * 上报等级，0.关闭上报; 1.仅错误出错上报; 2.全量上报
   * @var int
   */
  public function GetReportLevenl()
  {
    return 1;
  }


  //=======【商户密钥信息-需要业务方继承】===================================
  /*
	 * KEY：商户支付密钥，参考开户邮件设置（必须配置，登录商户平台自行设置）, 请妥善保管， 避免密钥泄露
	 * 设置地址：https://pay.weixin.qq.com/index.php/account/api_cert
	 * 
	 * APPSECRET：公众帐号secert（仅JSAPI支付的时候需要配置， 登录公众平台，进入开发者中心可设置）， 请妥善保管， 避免密钥泄露
	 * 获取地址：https://mp.weixin.qq.com/advanced/advanced?action=dev&t=advanced/dev&token=2005451881&lang=zh_CN
	 * @var string
	 */
  public function GetKey()
  {
    return $this->configs['Key'];
  }
  public function GetAppSecret()
  {
    return $this->configs['AppSecret'];
  }


  //=======【证书路径设置-需要业务方继承】=====================================
  /**
   * TODO：设置商户证书路径
   * 证书路径,注意应该填写绝对路径（仅退款、撤销订单时需要，可登录商户平台下载，
   * API证书下载地址：https://pay.weixin.qq.com/index.php/account/api_cert，下载之前需要安装商户操作证书）
   * 注意:
   * 1.证书文件不能放在web服务器虚拟目录，应放在有访问权限控制的目录中，防止被他人下载；
   * 2.建议将证书文件名改为复杂且不容易猜测的文件名；
   * 3.商户服务器要做好病毒和木马防护工作，不被非法侵入者窃取证书文件。
   * @var path
   */
  public function GetSSLCertPath(&$sslCertPath, &$sslKeyPath)
  {
    $sslCertPath = $this->configs['SSLCertPath'] . '/cert/' . $this->configs['MerchantId'] . '/apiclient_cert.pem';
    $sslKeyPath = $this->configs['SSLCertPath'] . '/cert/' . $this->configs['MerchantId'] . '/apiclient_key.pem';
  }
}
