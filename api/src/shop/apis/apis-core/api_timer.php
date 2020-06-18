<?php
namespace RequestByApiShell;

class class_timer {

  /**
   * 接口： timer/minute
   * 每分钟一次定时任务
   */
  public static function minute($request) {
    \MyClass\CTimer::minute();
    return [1];
  }

}
