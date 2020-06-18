<?php

namespace RequestByApiShell;

const APP_WX = "";
const APP_ = "";



class class_geo
{

  /**
   * 接口： geo/city
   * 根据经纬度，获取地址信息
   */
  public static function city($request)
  {
    $uri = "/ws/geocoder/v1?key=NBLBZ-2WKCW-UP2RA-RYWTX-E673J-F5BE4&location={$request->query['pos']}";
    $sig = md5($uri . "XyvElkIV1kBMrtrZw4oeyjYXWB4KAiR");
    $url = "https://apis.map.qq.com{$uri}&sig={$sig}";

    \DJApi\API::debug(['query' => $request->query,'uri' => $uri,'sig' => $sig,'url' => $url,]);

    $json = \DJApi\API::get($url, []);
    if ($json['request_id']) return \DJApi\API::OK(['result' => $json['result']]);
    return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, ['e' => $json]);
  }
}
