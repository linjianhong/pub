<?php

namespace JS;

/** 全局函数
 *
 * @define
 * ```js
 * $var:{
 *   add:{
 *     $arguments:['a', 'b'],
 *     $var:{
 *       c: 3,
 *     },
 *     $return: '=a+b+c',
 *     $return: '=arguments[0] + arguments[1] + c',
 *   }
 * }
 * ```
 *
 * @code
 * CParser::calcu("=add(1,2)",[])
 *
 * @return  6
 */
define("GLOBAL_CALL", "_GLOBAL_CALL_");

class CParser
{
  public static function calcu($express, $scope)
  {
    $express_return = $express;
    \DJApi\API::debug(['计算' => $express, 'scope' => $scope]);
    if (is_array($express['$arguments'])) {
      \DJApi\API::debug(['是函数=' => $express]);
      $scope_arguments = [];
      foreach ($express['$arguments'] as $n => $k) $scope_arguments[$k] = $scope[0]['arguments'][$n];
      $scope = [$scope_arguments, $scope];
      $express_return = $express['$return'];
    }
    if (isset($express['$var'])) {
      \DJApi\API::debug(['是 $var=' => $express, '$var' => $express['$var']]);
      $scope_var = self::calcu_var($express['$var'], $scope);
      $scope = [$scope_var, $scope];
      $express_return = $express['$return'];
    }
    $express = CParser::parse($express_return);
    return $express->parse($scope);
  }
  public static function calcu_var($vars, $param)
  {
    $R = [];
    foreach ($vars as $var_k => $var_v) {

      $more_param = [$R, $param];

      /** 全局函数 - 定义 */
      if (isset($var_v['$arguments'])) {
        $k_express = CParser::parse($var_k);
        $k = $k_express->parse($more_param);
        $R[$k] = $var_v;
        continue;
      }
      //\DJApi\API::debug($R);
      $k_express = CParser::parse($var_k);
      $v_express = CParser::parse($var_v);
      $k = $k_express->parse($more_param);
      $v = $v_express->parse($more_param);
      // \DJApi\API::debug(['R' => $R, 'k' => $k, 'v' => $v, 'var_v' => $var_v]);
      $R[$k] = $v;
    }
    return $R;
  }

  /** 全局函数 */
  public static function GLOBAL_CALL($fn, $scope)
  {
    $express = $fn;
    if (count($fn['$arguments']) > 0) {
      $scope_arguments = [];
      foreach ($fn['$arguments'] as $n => $k) $scope_arguments[$k] = $scope[0]['arguments'][$n];
      $scope = [$scope_arguments, $scope];
      $express = $fn['$return'];
    }
    if (isset($fn['$var'])) {
      $scope_var = self::calcu_var($fn['$var'], $scope);
      $scope = [$scope_var, $scope];
      $express = $fn['$return'];
    }
    $express = CParser::parse($express); // 这个可以提前编译，以提高效率
    return $express->parse($scope);
  }

  public static function parse($express)
  {
    // \DJApi\API::debug(['开始编译' => $express]);
    try {
      if (\DJApi\is_pure_array($express)) {
        $metas = [];
        foreach ($express as $subExpress) {
          $metas[] = CParser::parse($subExpress);
        }
        return new CExpress('array', $metas);
      } else if (is_array($express)) {
        $metas = [];
        foreach ($express as $kExpress => $subExpress) {
          $metas[] = [CParser::parse($kExpress), CParser::parse($subExpress)];
        }
        return new CExpress('object', $metas);
      }
      if (is_numeric($express)) return new CExpress('number', $express + 0);
      if (!is_string($express)) return new CExpress('string', ''); //throw new \Exception("不是字符串");
      $express = trim($express);
      if ($express[0] != '=') return  new CExpress('string', $express);
      $result = self::parse_express(substr($express, 1));
      if ($result['more']) throw new \Exception("有多余的内容");
      // \DJApi\API::debug(['编译完成, result' => $result]);
      return $result['meta'];
    } catch (\Exception $e) {
      // throw new \Exception("AAAAAAA");
      \DJApi\API::debug(['解析错误' => $e->getMessage(), 'express' => $express]);
      return new CExpress('error', $e->getMessage());
    }
  }

  /**
   * 获取一个表达式，尽量长
   * @return object  编译结果
   * @return int length 使用的长度
   * @return CExpress meta 已编译的数据
   */
  public static function parse_express($express)
  {
    $express = trim($express);
    // \DJApi\API::debug(['获取一个表达式，尽量长' => $express]);
    if (strlen($express) <= 0) {
      \DJApi\API::debug(['编译错误, 缺表达式, express' => $express]);
      throw new \Exception("缺少表达式");
    }
    $result = self::parse_value($express);
    // \DJApi\API::debug(['获取一个表达式, result' => $result]);
    return self::parse_express_more($result['more'], $result['meta'], []);
  }
  public static function parse_express_more($express, $meta, $moreExpress)
  {
    $express = trim($express);
    // \DJApi\API::debug(['进一步表达式, express' => $express]);

    /** 三元操作, 如果有一元操作在前，让其先编译 */
    if ($express[0] == '?') {
      $meta = self::merge_express($meta, $moreExpress);
      $result1 = self::parse_express(substr($express, 1));
      if ($result1['more'][0] != ':') throw new \Exception("缺少:");
      $result2 = self::parse_express(substr($result1['more'], 1));
      $meta = new CExpress('a_b_c', [$meta, $result1['meta'], $result2['meta']]);
      // \DJApi\API::debug(['三元操作, express' => $express, 'meta' => $meta, 'more' => $result2['more']]);
      // 三元操作, 不会有 进一步表达式 的情况
      return ['more' => $result2['more'], 'meta' => $meta];
    }

    $moreExpressLength = count($moreExpress);
    $op = self::findCalcuOperator($express);
    if (!$op) {
      $meta = self::merge_express($meta, $moreExpress);
      // \DJApi\API::debug(['进一步表达式, 完成 meta' => $meta]);
      return ['more' => $express, 'meta' => $meta];
    }

    // \DJApi\API::debug(['进一步表达式,  op' => $op]);
    $result = self::parse_value(substr($express, $op['w']));
    $new_item = ['op' => $op, 'meta' => $result['meta']];
    // \DJApi\API::debug(['进一步表达式, new_item' => $new_item]);

    if (!$moreExpressLength) {
      // \DJApi\API::debug(['进一步表达式, 第一个 new_item' => $new_item]);
      return self::parse_express_more($result['more'], $meta, [$new_item]);
    }

    /** 将优先级大于新操作的，都弹出来, 然后合并到前一个 */
    $last_item = $moreExpress[$moreExpressLength - 1];
    for ($i = $moreExpressLength - 2; $i >= 0; $i--) {
      // 向前合并
      if ($last_item['op']['level'] >= $op['level']) {
        $prev_item = &$moreExpress[$i];
        $prev_item['meta'] = new CExpress($last_item['op']['fn'], [$prev_item['meta'], $last_item['meta']]);
        $last_item = &$prev_item;
        // 弹出最一个
        array_pop($moreExpress);
      } else {
        break;
      }
    }

    /** 如果合并后，只有一个了，且这个操作的优先级，仍然大于新操作 */
    $moreExpressLength = count($moreExpress);
    if ($moreExpressLength == 1 && $last_item['op']['level'] >= $op['level']) {
      // 先将这个操作计算
      $meta = new CExpress($last_item['op']['fn'], [$meta, $last_item['meta']]);
      // 清空已有操作
      $moreExpress = [];
    }

    /** 现在，如果还有操作，就是优先级较小的了 */
    $moreExpress[] = $new_item;
    return self::parse_express_more($result['more'], $meta, $moreExpress);
  }
  /** 合并多次计算，参数不可为空 */
  public static function merge_express($meta, $moreExpress)
  {
    $moreExpressLength = count($moreExpress);
    if (!$moreExpressLength) return $meta;
    $last_item = $moreExpress[$moreExpressLength - 1];
    for ($i = $moreExpressLength - 2; $i >= 0; $i--) {
      $prev_item = $moreExpress[$i];
      $last_item = [
        'op' => $prev_item['op'],
        'meta' => new CExpress($last_item['op']['fn'], [$prev_item['meta'], $last_item['meta']])
      ];
    }
    $meta = new CExpress($last_item['op']['fn'], [$meta, $last_item['meta']]);
    return $meta;
  }


  /**
   * 获取一个无操作符表达式
   * @return object  编译结果
   * @return int length 使用的长度
   * @return CExpress meta 已编译的数据
   */
  public static function parse_value($express)
  {
    $express = trim($express);
    // \DJApi\API::debug(['值, express' => $express]);
    if (strlen($express) <= 0) {
      // \DJApi\API::debug(['编译错误, 缺值, express' => $express]);
      throw new \Exception("缺少表达式");
    }

    /** 一元操作符 */
    $op_once = self::findOnceOperator($express);
    if ($op_once) {
      // \DJApi\API::debug(['一元操作符' => $op_once]);
      $result = self::parse_value(substr($express, $op_once['w']), true);
      $meta = new CExpress($op_once['fn'], $result['meta']);
      // 一元操作, 进一步值 情况已处理, 不会再有了
      return ['more' => trim($result['more']), 'meta' => $meta];
    }

    if ($express[0] == '(') {
      $result = self::parse_express(substr($express, 1));
      if ($result['more'][0] != ')') throw new \Exception("缺少)");
      $express = substr($result['more'], 1);
      return self::parse_value_more($express, $result['meta']);
    }

    /** 数组 */
    if ($express[0] == '[') {
      $express = substr($express, 1);
      for ($metas = [];;) {
        if ($express[0] == ']') {
          $meta = new CExpress('array', $metas);
          return self::parse_value_more(substr($express, 1), $meta);
        }
        if (count($metas) > 0) {
          if ($express[0] != ',') {
            \DJApi\API::debug(['数组, 缺少,或]' => $express, 'metas' => $metas, 'result' => $result]);
            throw new \Exception("缺少,或]");
          }
          $express = substr($express, 1);
        }
        $result = self::parse_express($express);
        $metas[] = $result['meta'];
        $express = $result['more'];
      }
    }

    /** 对象 */
    if ($express[0] == '{') {
      $express = substr($express, 1);
      for ($metas = [];;) {
        if ($express[0] == '}') {
          $meta = new CExpress('object', $metas);
          return self::parse_value_more(substr($express, 1), $meta);
        }
        if (count($metas) > 0) {
          if ($express[0] != ',') {
            \DJApi\API::debug(['对象, 缺少,或]' => $express, 'metas' => $metas, 'result' => $result]);
            throw new \Exception("缺少,或}");
          }
          $express = substr($express, 1);
        }
        $result1 = self::parse_express($express);
        if ($result1['more'][0] != ':') throw new \Exception("缺少:");
        $result2 = self::parse_express(substr($result1['more'], 1));
        //if ($result1['meta']->type == 'var') $result1['meta']->type = 'string';
        $metas[] = [$result1['meta'], $result2['meta']];
        $express = $result2['more'];
      }
    }

    /** 数字, 直接返回 */
    $d = '(\.\d+)';
    $d2 = '(\d+(\.\d+)?)';
    $reg = "/^-?($d|$d2)(e\d+)?/i";
    if (preg_match($reg, $express, $match)) {
      // \DJApi\API::debug(['值, 数字' => $match[0]]);
      $meta = new CExpress('number', +$match[0]);
      return ['more' => trim(substr($express, strlen($match[0]))), 'meta' => $meta];
    }

    /** 字符串, 可能有进一步的值 */ // ^\'(([^\\\']|(\\.))*)\'
    //$reg = '/^\'(([^\\\'\\\\]|[\\x7f-\\xff\]|(\\\\.))*)\'/';
    $reg = '/^\'(([\x{4e00}-\x{9fa5}]|[^\\\'\\\\]|(\\\\.))*)\'/u';
    if (preg_match($reg, $express, $match)) {
      // \DJApi\API::debug(['值, 字符串' => $match[1]]);
      $meta = new CExpress('string', $match[1]);
      $express = substr($express, strlen($match[0]));
      return self::parse_value_more($express, $meta);
    }
    //$reg = '/^\"(([^\\\"\\\\]|(\\\\.))*)\"/';
    $reg = '/^\"(([\x{4e00}-\x{9fa5}]|[^\\\"\\\\]|(\\\\.))*)\"/u';
    if (preg_match($reg, $express, $match)) {
      // \DJApi\API::debug(['值, 字符串' => $match[1]]);
      $meta = new CExpress('string', $match[1]);
      $express = substr($express, strlen($match[0]));
      return self::parse_value_more($express, $meta);
    }

    /** 变量 */
    $reg = "/^[a-zA-Z_\x{4e00}-\x{9fa5}\$][a-zA-Z_\x{4e00}-\x{9fa5}\$0-9]*/u";
    if (preg_match($reg, $express, $match)) {
      // \DJApi\API::debug(['值, 变量' => $match[0]]);
      $meta = new CExpress('var', $match[0]);
      $express = substr($express, strlen($match[0]));
      return self::parse_value_more($express, $meta);
    }

    \DJApi\API::debug(['不是表达式' =>  $express]);
    /** 其它的, 返回错误 */
    throw new \Exception("不是表达式");
  }
  public static function parse_value_more($express, $meta)
  {
    $express = trim($express);

    /** 成员操作, 直接 */
    if ($express[0] == '.') {
      $express = substr($express, 1);
      /** 变量 */
      $reg = "/^[a-zA-Z_\x{4e00}-\x{9fa5}\$][a-zA-Z_\x{4e00}-\x{9fa5}\$0-9]*/u";
      if (!preg_match($reg, $express, $match)) throw new \Exception("不是成员名");
      $metaMenber = new CExpress('string', $match[0]);
      $meta = new CExpress('member', [$meta, $metaMenber]);
      $express = substr($express, strlen($match[0]));
      // \DJApi\API::debug(['成员操作, 直接, express' => $express, 'meta' => $meta]);
      return self::parse_value_more($express, $meta);
    }

    /** 成员操作, 方括号 */
    if ($express[0] == '[') {
      $result = self::parse_express(substr($express, 1));
      if ($result['more'][0] != ']') throw new \Exception("缺少]");
      $meta = new CExpress('member', [$meta, $result['meta']]);
      $express = substr($result['more'], 1);
      // \DJApi\API::debug(['成员操作, 方括号, express' => $express, 'meta' => $meta]);
      return self::parse_value_more($express, $meta);
    }

    /** 函数操作 */
    if ($express[0] == '(') {

      /** 全局函数 */
      if ($meta->type != "member") {
        $GLOBAL_FN = new CExpress('string', GLOBAL_CALL);
        $meta = new CExpress('member', [$meta, $GLOBAL_FN]);
      }

      if ($meta->type != "member") throw new \Exception("函数，但缺少对象");
      $meta->type = "method";
      $meta->args = new CExpress("array", []);
      $args = &$meta->args->value;
      for ($expressMore = substr($express, 1);;) {
        if ($expressMore[0] == ")") {
          return self::parse_value_more(substr($expressMore, 1), $meta);
        }
        if (count($args) > 0) {
          if ($expressMore[0] != ",") {
            \DJApi\API::debug(['函数参数格式错误' => $express, 'args' => $args, "meta" => $meta]);
            throw new \Exception("函数参数格式错误");
          }
          $expressMore = substr($expressMore, 1);
        }
        $result = self::parse_express($expressMore);
        $args[] = ($result['meta']);
        $expressMore = $result['more'];
      }
    }

    return ['more' => $express, 'meta' => $meta];
  }

  public static function findCalcuOperator($str)
  {
    foreach (self::$operators as $item) {
      if ('calcu' == $item['type'] && $item['value'] == substr($str, 0, $item['w'])) return $item;
    }
    return false;
  }
  public static function findOnceOperator($str)
  {
    foreach (self::$operators as $item) {
      if ('once' == $item['type'] && $item['value'] == substr($str, 0, $item['w'])) return $item;
    }
    return false;
  }
  static $operators = [

    ['value' => ">=", 'w' => 2, 'type' => 'calcu', 'level' => 50, 'fn' => 'notlessthan'],
    ['value' => "<=", 'w' => 2, 'type' => 'calcu', 'level' => 50, 'fn' => 'notbigthan'],
    ['value' => "==", 'w' => 2, 'type' => 'calcu', 'level' => 50, 'fn' => 'equals'],
    ['value' => "!=", 'w' => 2, 'type' => 'calcu', 'level' => 50, 'fn' => 'notequals'],
    ['value' => "&&", 'w' => 2, 'type' => 'calcu', 'level' => 29, 'fn' => 'andand'],
    ['value' => "||", 'w' => 2, 'type' => 'calcu', 'level' => 28, 'fn' => 'oror'],
    ['value' => "^^", 'w' => 2, 'type' => 'calcu', 'level' => 27, 'fn' => 'xorxor'],
    ['value' => "*",  'w' => 1, 'type' => 'calcu', 'level' => 90, 'fn' => 'time'],
    ['value' => "/",  'w' => 1, 'type' => 'calcu', 'level' => 90, 'fn' => 'div'],
    ['value' => "%",  'w' => 1, 'type' => 'calcu', 'level' => 90, 'fn' => 'mod'],
    ['value' => "+",  'w' => 1, 'type' => 'calcu', 'level' => 80, 'fn' => 'add'], //is_numeric($a) && is_array($b) ? a + (b && JSON['stringify'](b) || "") : (!isNumber(b) && isObject(a) ? (a && JSON['stringify'](a) || "") + b : a + b) } ],
    ['value' => "-",  'w' => 1, 'type' => 'calcu', 'level' => 80, 'fn' => 'dec'],
    ['value' => ">",  'w' => 1, 'type' => 'calcu', 'level' => 50, 'fn' => 'bigthan'],
    ['value' => "<",  'w' => 1, 'type' => 'calcu', 'level' => 50, 'fn' => 'lessthan'],

    ['value' => "!",  'w' => 1, 'type' => 'once', 'fn' => 'not'],
    ['value' => "-",  'w' => 1, 'type' => 'once', 'fn' => 'fu'],

    ['value' => ".",  'w' => 1, 'type' => '000',],
    ['value' => "[",  'w' => 1, 'type' => '000',],
    ['value' => "]",  'w' => 1, 'type' => '000',],
    ['value' => "(",  'w' => 1, 'type' => '000',],
    ['value' => ")",  'w' => 1, 'type' => '000',],
    ['value' => ",",  'w' => 1, 'type' => '000',],
    ['value' => ";",  'w' => 1, 'type' => '000',],
  ];
}

class CExpress
{
  public $type = "";
  public $value = "";

  public function __construct($type, $value)
  {
    $this->type = $type;
    $this->value = $value;
  }
  public function isError()
  {
    return $this->type == 'error';
  }
  public function parse(&$params)
  {
    $fn = "parse_{$this->type}";
    try {
      return $this->$fn($params);
    } catch (\Exception $e) {
      return "";
    }
  }
  /** 错误 */
  public function parse_error(&$params)
  {
    return "";
  }
  /** 文本 */
  public function parse_string(&$params)
  {
    // \DJApi\API::debug(['文本, 求得' => $this->value]);
    return $this->value;
  }
  /** 数字 */
  public function parse_number(&$params)
  {
    // \DJApi\API::debug(['等等, 求得' => $this->value]);
    return $this->value;
  }
  /** 变量 */
  public static function get_var_object($var_name, &$params)
  {
    if (isset($params[$var_name])) return $params;
    if (isset($params['value'][$var_name])) return $params['value'];
    if (isset($params['$var'][$var_name])) return $params['$var'];
    if (\DJApi\is_pure_array($params)) {
      foreach ($params as $param) {
        $ob = self::get_var_object($var_name, $param);
        if ($ob) return $ob;
      }
    }
    if (is_array($params['$$'])) foreach ($params['$$'] as $param) {
      $ob = self::get_var_object($var_name, $param);
      if ($ob) return $ob;
    }
    return false;
  }
  /** 变量 */
  public function parse_var(&$params)
  {
    /** 全局函数 */
    $golbalCall = CGolbalCall::create($this->value, $params);
    if ($golbalCall) return $golbalCall;

    if ($this->value == 'DJ') return CDJ::getDJ();
    $ob = self::get_var_object($this->value, $params);
    // if ($this->value == 'k2') {
    //   // \DJApi\API::debug(['k2 from' => $ob, 'k2=' => $ob[$this->value], 'params' => $params]);
    // }
    if ($ob) return $ob[$this->value];
    return "";
    // if ($params[$this->value]) {
    //   return $params[$this->value];
    // }
    // if (isset($params['value'][$this->value])) return $params['value'][$this->value];
    // if (is_array($params['$$'])) foreach ($params['$$'] as $sub_params) {
    //   $v = $this->parse_var($sub_params);
    //   if ($v !== null) return $v;
    // }
    // return null;
  }
  /** 成员 */
  public function parse_member(&$params)
  {
    $a = $this->value[0]->parse($params);
    $b = $this->value[1]->parse($params);
    if (is_array($a) && isset($a[$b])) return $a[$b];
    //if (is_object($a) && method_exists($a,$b)) return $a[$b];
    if (is_object($a) && property_exists($a, $b)) return $a->$b;

    /** 默认属性支持 */
    if (is_string($a)) {
      if ($b == 'length') return strlen($a);
    }
    if (is_array($a)) {
      if ($b == 'length') return count($a);
    }
    return null;
  }


  /** 函数 */
  public function parse_method(&$params)
  {
    $a = $this->value[0]->parse($params);
    $b = $this->value[1]->parse($params);
    $args = $this->args->parse($params);

    /** 全局函数 */
    if (is_a($a, '\FLOW\CGolbalCall')) {
      // \DJApi\API::debug(["全局函数", 'args' => $args, 'this->args' => $this->args]);
      // return "";
      return $a->run($args, $this->args);
    }
    if ($b == GLOBAL_CALL) {
      // $a 是函数体，不会被计算
      $scope_function = [['arguments' => $args], $params];
      return CParser::GLOBAL_CALL($a, $scope_function);
    }

    if (method_exists($a, $b)) {
      $n = count($args);
      if ($n == 0) return $a->$b();
      if ($n == 1) return $a->$b($args[0]);
      if ($n == 2) return $a->$b($args[0], $args[1]);
      if ($n == 3) return $a->$b($args[0], $args[1], $args[2]);
      if ($n == 4) return $a->$b($args[0], $args[1], $args[2], $args[3]);
      if ($n == 5) return $a->$b($args[0], $args[1], $args[2], $args[3], $args[4]);
      if ($n == 6) return $a->$b($args[0], $args[1], $args[2], $args[3], $args[4], $args[5]);
    }

    /** 支持的字符串函数 */
    if (is_string($a)) {
      if ($b == 'length') return strlen($a);
      if ($b == 'indexOf') return strpos($a, $args[0]);
      if ($b == 'substr' && count($args) == 1) return substr($a, $args[0]);
      if ($b == 'substr' && count($args) > 1) return substr($a, $args[0], $args[1]);
    }

    /** 支持的数组函数 */
    if (\DJApi\is_pure_array($a)) {
      if ($b == 'length') return count($a);
      if ($b == 'indexOf') {
        foreach ($a as $n => $v) if ($v == $args[0]) return $n;
        return -1;
      }
      /** 求和 */
      if ($b == 'sum') {
        // \DJApi\API::debug(['数组求和' => $a]);
        $sum = 0;
        foreach ($a as $v) $sum += $v;
        return $sum;
      }
      /** join */
      if ($b == 'join') return implode($a, is_string($args[0]) ? $args[0] : "");
      /** 去重 */
      if ($b == 'unique') return array_values(array_unique($a));
      /** 连接 */
      if ($b == 'concat') return array_merge($a, is_array($args[0]) ? $args[0] : []);
      /** 合集, 去重 */
      if ($b == 'union') {
        $R = [];
        foreach ($a as $v) {
          foreach ($R as $r) if (!is_array($v) && $v == $r) continue 2;
          $R[] = $v;
        }
        foreach ($args[0] as $v) {
          foreach ($R as $r) if (!is_array($v) && $v == $r) continue 2;
          $R[] = $v;
        }
        // \DJApi\API::debug(['数组, union' => $R, 'a,args' => [$a, $args[0]],]);
        return $R;
        // \DJApi\API::debug(['数组, union arg' => is_array($args[0]) ? array_values($args[0]) : []]);
        // \DJApi\API::debug(['数组, union merge' => array_merge($a, is_array($args[0]) ? array_values($args[0]) : [])]);
        // \DJApi\API::debug(['数组, union unique' => array_unique(array_merge($a, is_array($args[0]) ? array_values($args[0]) : []))]);
        // \DJApi\API::debug(['数组, union' => [$a, $args[0]], 'R' => array_values(array_unique(array_merge($a, is_array($args[0]) ? array_values($args[0]) : [])))]);
        return array_values(array_unique(array_merge($a, is_array($args[0]) ? array_values($args[0]) : [])));
      }
      /** 差集 */
      if ($b == 'diff') return array_values(array_diff($a, is_array($args[0]) ? $args[0] : []));
      /** 合集(数组), 去重 */
      if ($b == 'union_array') {
        if (!is_array($args)) return $a;
        foreach ($args[0] as $v) $a = array_merge($a, is_array($v) ? $v : []);
        return $a;
      }
      /** map(数组) */
      if ($b == 'map') {
        //return [];
        $mapName = $this->args->value[0]->parse($params);
        $R = [];
        foreach ($a as $item) {
          $newParam = [[$mapName => $item], $params];
          $R[] = $this->args->value[1]->parse($newParam);
        }
        return $R;
      }
      /** find(数组) */
      if ($b == 'find') {
        $mapName = $this->args->value[0]->parse($params);
        $R = [];
        foreach ($a as $item) {
          $newParam = [[$mapName => $item], $params];
          if ($this->args->value[1]->parse($newParam)) return $item;
        }
        return false;
      }
      /** filter(数组) */
      if ($b == 'filter') {
        // \DJApi\API::debug(["方法 filter" => $this->args, 'a' => $a]);
        $mapName = $this->args->value[0]->parse($params);
        $R = [];
        foreach ($a as $item) {
          $newParam = [[$mapName => $item], $params];
          // \DJApi\API::debug(["B=" => $this->args->value[1]->parse($newParam),'V1'=>$this->args->value[1],'newParam'=>$newParam]);
          if ($this->args->value[1]->parse($newParam)) $R[] = $item;
        }
        // \DJApi\API::debug(["方法 filter" => $this->args, 'a' => $a, 'R' => $R]);
        return $R;
      }
      /** 二维码详情 */
      if ($b == 'code_detail') {
        // \DJApi\API::debug(["方法 二维码详情" => $this->args, 'a' => $a]);
        $codes = $a;
        $db = \MyClass\CDbBase::db();
        $db_rows = $db->select(\MyClass\CDbBase::table('stock_res_index'), "*", ['id' => $codes]);
        foreach ($db_rows as &$db_row) {
          $db_row['attr'] = json_decode($db_row['attr'] . true);
        }
        return $db_rows;
      }
    }
    return null;
  }
  /** 数组 */
  public function parse_array(&$params)
  {
    $arr = [];
    foreach ($this->value as $express) {
      $arr[] = $express->parse($params);
    }
    // \DJApi\API::debug(['数组, 求得' => $arr, 'this' => $this]);
    return $arr;
  }
  /** 对象 */
  public function parse_object(&$params)
  {
    $obj = [];
    foreach ($this->value as $express) {
      $k = $express[0]->parse($params);
      $v = $express[1]->parse($params);
      $obj[$k] = $v;
    }
    // \DJApi\API::debug(['对象, 求得' => $obj, 'this' => $this]);
    return $obj;
  }

  /** 非 */
  public function parse_not(&$params)
  {
    // \DJApi\API::debug(['非, 求得' => !$this->value->parse($params), 'this' => $this]);
    return !$this->value->parse($params);
  }
  /** 负 */
  public function parse_fu(&$params)
  {
    // \DJApi\API::debug(['负, 求得' => -$this->value->parse($params), 'this' => $this]);
    return -$this->value->parse($params);
  }

  /** 三元运算 */
  public function parse_a_b_c(&$params)
  {
    $a = $this->value[0]->parse($params);
    if ($a) {
      // \DJApi\API::debug(['三元运算, 求得' => $this->value[1]->parse($params), 'this' => $this]);
      return $this->value[1]->parse($params);
    }
    // \DJApi\API::debug(['三元运算, 求得' => $this->value[2]->parse($params), 'this' => $this]);
    return $this->value[2]->parse($params);
  }


  /** 加 */
  public function parse_add(&$params)
  {
    $a = $this->value[0]->parse($params);
    $b = $this->value[1]->parse($params);
    if (is_numeric($a) && is_numeric($b)) {
      // \DJApi\API::debug(['加, 求得' => $a + $b, [$a, $b], 'this' => $this]);
      return $a + $b;
    }
    // \DJApi\API::debug(['加, 求得' => $a . $b, [$a, $b], 'this' => $this]);
    return $a . $b;
  }
  /** 减 */
  public function parse_dec(&$params)
  {
    $a = $this->value[0]->parse($params);
    $b = $this->value[1]->parse($params);
    // \DJApi\API::debug(['减, 求得' => $a - $b, 'this' => $this]);
    return $a - $b;
  }
  /** 乘 */
  public function parse_time(&$params)
  {
    $a = $this->value[0]->parse($params);
    $b = $this->value[1]->parse($params);
    // \DJApi\API::debug(['乘, 求得' => $a * $b, 'this' => $this]);
    return $a * $b;
  }
  /** 乘 */
  public function parse_div(&$params)
  {
    $a = $this->value[0]->parse($params);
    $b = $this->value[1]->parse($params);
    // \DJApi\API::debug(['乘, 求得' => $a / $b, 'this' => $this]);
    return $a / $b;
  }
  /** 模 */
  public function parse_mod(&$params)
  {
    $a = $this->value[0]->parse($params);
    $b = $this->value[1]->parse($params);
    // \DJApi\API::debug(['模, 求得' => $a % $b, 'this' => $this]);
    return $a % $b;
  }

  /** 与 */
  public function parse_andand(&$params)
  {
    $a = $this->value[0]->parse($params);
    // if (!$a) \DJApi\API::debug(['与, 求得' => $a, 'this' => $this]);
    if (!$a) return $a;
    // \DJApi\API::debug(['与, 求得' => $b, 'this' => $this]);
    return $this->value[1]->parse($params);
  }
  /** 或 */
  public function parse_oror(&$params)
  {
    $a = $this->value[0]->parse($params);
    if ($a) return $a;
    //\DJApi\API::debug(['或, 求得' => $this->value[1]->parse($params), 'this' => $this]);
    return $this->value[1]->parse($params);
  }
  /** 异或 */
  public function parse_xorxor(&$params)
  {
    $a = $this->value[0]->parse($params);
    $b = $this->value[1]->parse($params);
    // \DJApi\API::debug(['异或, 求得' => $a ? !$b : !!$b, 'this' => $this]);
    return $a ? !$b : !!$b;
  }

  /** 大于 */
  public function parse_bigthan(&$params)
  {
    $a = $this->value[0]->parse($params);
    $b = $this->value[1]->parse($params);
    // \DJApi\API::debug(['大于, 求得' => $a > $b, 'this' => $this]);
    return $a > $b;
  }
  /** 小于 */
  public function parse_lessthan(&$params)
  {
    $a = $this->value[0]->parse($params);
    $b = $this->value[1]->parse($params);
    // \DJApi\API::debug(['小于, 求得' => $a < $b, 'this' => $this]);
    return $a < $b;
  }
  /** 不小于 */
  public function parse_notlessthan(&$params)
  {
    $a = $this->value[0]->parse($params);
    $b = $this->value[1]->parse($params);
    // \DJApi\API::debug(['不小于, 求得' => $a >= $b, 'a,b'=>[$a,$b],'this' => $this]);
    return $a >= $b;
  }
  /** 不大于 */
  public function parse_notbigthan(&$params)
  {
    $a = $this->value[0]->parse($params);
    $b = $this->value[1]->parse($params);
    // \DJApi\API::debug(['不大于, 求得' => $a <= $b, 'this' => $this]);
    return $a <= $b;
  }
  /** 等等 */
  public function parse_equals(&$params)
  {
    $a = $this->value[0]->parse($params);
    $b = $this->value[1]->parse($params);
    // \DJApi\API::debug(['小等等于, 求得' => $a == $b, 'this' => $this]);
    return $a == $b;
  }
  /** 不等 */
  public function parse_notequals(&$params)
  {
    $a = $this->value[0]->parse($params);
    $b = $this->value[1]->parse($params);
    // \DJApi\API::debug(['不等, 求得' => $a != $b, 'this' => $this]);
    return $a != $b;
  }
}

class CDJ
{

  public function __construct()
  { }

  /**
   *  数据合并
   *
   * CDJ::_merge({a: 1}, 2)      // {a: 1}
   * CDJ::_merge(2, 3)           // 3
   * CDJ::_merge(2, "aaa")       // "aaa"
   * CDJ::_merge("bbb", 2)       // 2
   * CDJ::_merge("bbb", {a: 2})  // {a: 2}
   * CDJ::_merge({a: 1}, {a: 2}) // {a: 2}
   * CDJ::_merge({a: 1}, {b: 2}) // {a: 2, b: 2}
   * CDJ::_merge([1, 2], {b: 2}) // [1, 2, 2]
   * CDJ::_merge([1, 2], [1, 2]) // [1, 2, 1, 2]
   * CDJ::_merge([1, 2], 3)      // [1, 2]
   */
  public static function _merge($a, $b, $more = false)
  {
    if (!is_array($more) || count($more) == 0) {
      if (!is_array($a)) return $b;
      if (!is_array($b)) return $a;
      if (\DJApi\is_pure_array($a)) {
        foreach ($b as $v) $a[] = $v;
      } else {
        foreach ($b as $k => $v) $a[$k] = self::_merge($a[$k], [$v]);
      }
      return $a;
    }
    $a = self::_merge($a, $b);
    $b = array_shift($more);
    return self::_merge($a, $b, $more);
  }

  public function merge($a, ...$more)
  {
    if (!is_array($more) || count($more) == 0) return $a;
    $b = array_shift($more);
    return CDJ::_merge($a, $b, $more);
  }

  public function extend($a, ...$more)
  {
    if (!is_array($more) || count($more) == 0) return $a;
    $b = array_shift($more);
    return CDJ::_merge($a, $b, $more);
  }

  public function array_sum($obj, $keys)
  {
    $R = 0;
    foreach ($obj as $v) {
      foreach ($keys as $k) {
        $v = $v[$k];
      }
      $R += $v;
    }
    return $R;
  }

  public function find($obj, $keys, $value)
  {
    foreach ($obj as $obj_k => $v) {
      foreach ($keys as $k) {
        $v = $v[$k];
      }
      if ($v == $value) return $obj[$obj_k];
    }
    return false;
  }

  public function php($php_args)
  {
    $C = $php_args['class'];
    $method = $php_args['method'];
    $args = $php_args['args'];
    if (!class_exists($C)) {
      \DJApi\API::debug(['类名无效' => $C]);
      return "";
    }
    if (!method_exists($C, $method)) {
      \DJApi\API::debug(['方法无效' => $method]);
      return "";
    }

    return $C::$method($args);
  }

  public function dick($dickName, $value, $textField, $valueField = "id")
  {
    if (!$value && $value !== 0) return "";
    $dick = CDick::get($dickName);
    // \DJApi\API::debug(['dick'=>$dick,'value'=>$value,'textField'=>$textField, 'valueField'=>$valueField]);
    foreach ($dick as $row) {
      if ($row[$valueField] == $value) return $row[$textField];
    }
    return "";
  }

  public function stock_user($uid)
  {
    $stock_userinfo = \MyClass\CStockUser::stock_userinfo($uid);
    // \DJApi\API::debug(['stock_user' => $stock_userinfo, 'uid' => $uid]);
    return $stock_userinfo;
  }

  public function &DATE($str = '')
  {
    return new CDATE($str);
  }

  public function &产品清单()
  {
    return new CProductList();
  }

  static $DJ;
  static function &getDJ()
  {
    if (!self::$DJ) {
      self::$DJ = new CDJ();
    }
    return self::$DJ;
  }
}

/**
 * 天数功能
 */
define("ONE_DAY", 3600 * 24);
class CDATE
{
  function __construct($str = '')
  {
    /** 从1970-01-01到现在的天数 */
    $this->days = self::_days_of_($str);
  }

  static function _days_of_($str = '')
  {
    $days = intval(strtotime(substr($str, 0, 10)) / ONE_DAY);
    if ($days < 2) $days = intval(time() / ONE_DAY);
    return $days;
  }
  public function &parse($str = '')
  {
    $this->days = self::_days_of_($str);
    return $this;
  }

  public function &offset($days)
  {
    $this->days += intval($days);
    return $this;
  }

  /** 这个月的第一天 */
  public function firstDay()
  {
    return new CDATE($this->text() . substr(0, 8) + "01");
  }
  /** 这个月的最后一天 */
  public function lastDay()
  {
    return $this->nextFirstDay()->offset(-1);
  }
  /** 上个月的第一天 */
  public function prevFirstDay()
  {
    return  $this->firstDay()->offset(-1)->firstDay();
  }
  /** 下个月的第一天 */
  public function nextFirstDay()
  {
    return $this->firstDay()->offset(31)->firstDay();
  }

  public function &add($str)
  {
    $this->days += self::_days_of_($str);
    return $this;
  }

  public function &dec($str)
  {
    $this->days -= self::_days_of_($str);
    return $this;
  }

  public function count()
  {
    return $this->days;
  }

  public function text($str = '')
  {
    if (!$str) $str = 'Y-m-d';
    return date($str, $this->days * ONE_DAY);
  }
}


class CDick
{
  public static $_DICKS = [];
  public static function get($dickName)
  {
    if (!self::$_DICKS[$dickName]) self::read($dickName);
    return self::$_DICKS[$dickName];
  }
  public static function read($dickName)
  {
    $db = \MyClass\CDbBase::db();

    if ($dickName == '产品字典') {
      $cp_row = $db->select(\MyClass\CDbBase::table('stock_dick_product'), "*");
      foreach ($cp_row as $k => $row) {
        if ($row['attr']) {
          $cp_row[$k]['attr'] = json_decode($row['attr']);
        } else {
          $cp_row[$k]['attr'] = [];
        }
      }
      return self::$_DICKS[$dickName] = $cp_row;
    }

    if ($dickName == '客户字典') {
      $db_rows = $db->select(\MyClass\CDbBase::table('stock_dick_client'), "*");
      foreach ($db_rows as $k => $row) {
        if ($row['attr']) {
          $db_rows[$k]['attr'] = json_decode($row['attr']);
        } else {
          $db_rows[$k]['attr'] = [];
        }
      }
      return self::$_DICKS[$dickName] = $db_rows;
    }

    if ($dickName == '工人字典') {
      $R = \MyClass\CStockUser::list_worker();
      \DJApi\API::debug(['工人字典' => $R]);
      return self::$_DICKS[$dickName] = $R;
    }


    return self::$_DICKS[$dickName] = [];
  }
}


/** 全局函数
 * 
 * @var String method 全局函数名
 */
class CGolbalCall
{
  /** 全局函数名 */
  public $method = "";
  function __construct($method, &$scope)
  {
    $this->method = $method;
    $this->scope = &$scope;
  }

  /** 赋值 */
  public static function create($method, &$scope)
  {
    if (!method_exists(__CLASS__, $method))  return false;

    return new CGolbalCall($method, $scope);
  }

  public function run($args, $express_args)
  {
    if (!method_exists($this, $this->method)) {
      \DJApi\API::debug(['ERROE' => '未找到内置全局函数 ' . $this->method]);
      return "";
    }
    $fn = $this->method;
    return $this->$fn($args, $express_args);
  }

  /** 引用
   * @param CExpress $express 
   */
  public static function &quote_parent($express, &$scope, &$local_scope)
  {
    $E = [];
    if ($express->type == 'member') {
      $quote_parent = &self::quote_parent($express->value[0], $scope, $local_scope);
      // \DJApi\API::debug(['quote_parent' => $quote_parent, 'args' => [$express, $scope, $local_scope]]);
      $arr = &$quote_parent[0];
      $k1 = $quote_parent[1];
      if (!is_array($arr)) $arr = [];
      if (!is_array($arr[$k1])) $arr[$k1] = [];
      $v = $express->value[1]->parse($scope);
      $R = [&$arr[$k1], $v];
      return $R;
    }
    if ($express->type == 'var') {
      $var_name = $express->value;
      if (isset($scope[$var_name])) {
        $R = [&$scope, $express->value];
        return $R;
      }
      if (isset($scope['value'][$var_name])) {
        $R = [&$scope['value'], $express->value];
        return $R;
      }
      if (isset($scope['$var'][$var_name])) {
        $R = [&$scope['var'], $express->value];
        return $R;
      }
      $local_scope_null = "";
      if (\DJApi\is_pure_array($scope)) {
        foreach ($scope as &$sub_scope) {
          $ob = &self::quote_parent($express, $sub_scope, $local_scope_null);
          if ($ob[1]) return $ob;
        }
      }
      if (is_array($scope['$$'])) foreach ($scope['$$'] as &$sub_scope) {
        $ob = &self::quote_parent($express, $sub_scope, $local_scope_null);
        if ($ob[1]) return $ob;
      }
    }
    $R = [];
    if ($local_scope) $R = [&$local_scope, $express->value];
    return $R;
  }

  /** 赋值 */
  public function set($args, $express_args)
  {
    \DJApi\API::debug(['赋值' => $this, 'args' => $args, 'express_args' => $express_args]);
    //return "";
    $local_scope = [];
    if (count($args) == 2) {
      $quote_parent = &self::quote_parent($express_args->value[0], $this->scope, $local_scope);
      if (!isset($quote_parent[1])) {
        // \DJApi\API::debug(['ERROE' => '赋值, 无变量名。', $quote_parent]);
        return "";
      }
      // \DJApi\API::debug(['要赋值' => $quote_parent, 'args[1]' => $args[1]]);
      $quote_parent[0][$quote_parent[1]] = $args[1];
      return $args[1];
    }
    // \DJApi\API::debug(['ERROE' => '赋值, 参数不符。']);
    return "";
  }


  /** 数据库一行
   * $var:"=get_db_row('table_name',{'id':1},['id','name'])"
   * $var:"=get_db_row({'table':'table_name', 'AND':{'id':1}, 'fields':['id','name']})"
   */
  public function get_db_row($args, $express_args)
  {
    $db = \MyClass\CDbBase::db();
    $table = $args[0];
    if ($table['table']) {
      $AND = $table['AND'];
      $fields = $table['fields'];
      $table = $table['table'];
    } else {
      $AND = $args[1];
      $fields = $args[2];
    }
    if (!$fields) $fields = '*';
    \DJApi\API::debug(['数据库一行' => [$table, $AND, $fields]]);
    $row = $db->get(CDbBase::table($table), $fields, $AND);
    return $row;
  }
}
