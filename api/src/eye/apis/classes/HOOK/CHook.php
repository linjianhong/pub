<?php

namespace HOOK;

use \MyClass\CDbBase;

class CHook
{
  /**
   * 消息钩子
   * 提供消息发送接口
   * 提供消息接收注册接口
   */


  public static $hookers = [];

  /**
   * 注册消息钩子函数
   * @param name 消息名称
   * @param args 钩子参数
   */
  public static function register($name, $args)
  {
    if (!is_array(self::$hookers[$name])) self::$hookers[$name] = [];
    self::$hookers[$name][] = $args;
  }

  /**
   * 消息发布接口
   * 向所有已注册接口的钩子，发送通知
   */
  public static function send($name, $datas)
  {
    if (!is_array(self::$hookers[$name])) return;
    foreach (self::$hookers[$name] as $args) {
      // 执行消息钩子函数
    }
  }
}
