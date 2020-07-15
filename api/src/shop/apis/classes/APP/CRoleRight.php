<?php

namespace APP;

use \MyClass\CDbBase;

class CRoleRight
{
  public static $TABLE_ROLE = "shop_role";
  public static $TABLE_USER = "shop_user";


  /**
   * 所有角色列表, 包含空白名字, 包含已删除
   * @return roles 所有角色列表
   */
  public static function role_list()
  {
    $db = CDbBase::db();
    $db_roles = $db->select(CDbBase::table(self::$TABLE_ROLE), '*');
    $roles = [];
    foreach ($db_roles as $db_role) {
      $db_role['attr'] = json_decode($db_role['attr'], true);
      $roles[] = $db_role;
    }
    return  $roles;
  }


  /**
   * 创建角色
   * @return datas {array} 创建时生成的数据
   */
  public static function role_create()
  {
    $db = CDbBase::db();
    $datas = ['t1' => date('Y-m-d H:i:s')];
    $insert_id = $db->insert(CDbBase::table(self::$TABLE_ROLE), $datas);
    $datas['id'] = $insert_id;
    return $datas;
  }


  /**
   * 更新角色
   * @return n 影响的行数
   */
  public static function role_update($query)
  {
    $id = $query['id'];
    $name = $query['name'];
    $powers = $query['powers'];
    $db = CDbBase::db();
    $db_row = $db->get(CDbBase::table(self::$TABLE_ROLE), ['attr'], ['id' => $id]);
    if (!is_array($db_row)) return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, "角色不存在");
    $attr = json_decode($db_row['attr'], true);
    $role_powers = [];
    $全部权限 = self::全部权限();
    // 仅获取有效的权限
    foreach ($全部权限 as $item) {
      $group = $item['name'];
      $arr = $item['list'];
      $new_powers = [];
      foreach ($arr as $power_name) {
        if (in_array($power_name, $powers[$group])) $new_powers[] = $power_name;
      }
      if (count($new_powers) > 0) {
        $role_powers[$group] = $new_powers;
      }
    }
    $attr['powers'] = $role_powers;
    $datas = [
      'name' => $name,
      'attr' => \DJApi\API::cn_json($attr),
    ];
    $n = $db->update(CDbBase::table(self::$TABLE_ROLE), $datas, ['id' => $id]);
    \DJApi\API::debug(['n' => $n, '全部权限' => $全部权限, 'role_powers' => $role_powers, 'DB' => $db->getShow()]);
    return  $n;
  }



  /**
   * 所有角色列表, 包含空白名字, 包含已删除
   * @return roles [id, uid, mobile, admin] 所有角色列表
   */
  public static function user_list()
  {
    $db = CDbBase::db();

    $db_users = $db->select(CDbBase::table(self::$TABLE_USER), '*');
    $users = [];
    foreach ($db_users as $db_user) {
      $attr = json_decode($db_user['attr'], true);
      $users[] = [
        'id' => $db_user['id'],
        'uid' => $db_user['uid'],
        'mobile' => $db_user['mobile'],
        'admin' => $attr['admin'],
      ];
    }

    return  $users;
  }

  /**
   * 创建用户
   * uid 不可已存在
   * @return datas {array} 创建时生成的数据
   */
  public static function user_create($query)
  {
    $uid = $query['uid'];
    if (!$uid) return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, "缺少：用户id");
    $db = CDbBase::db();
    if ($db->has(CDbBase::table(self::$TABLE_USER), ['uid' => $uid])) return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, "用户id已存在");
    $datas = ['uid' => $uid, 'attr' => '{"admin":""}', 't1' => date('Y-m-d H:i:s')];
    $insert_id = $db->insert(CDbBase::table(self::$TABLE_USER), $datas);
    $datas['id'] = $insert_id;
    return $datas;
  }


  /**
   * 更新用户
   * @return n 影响的行数
   */
  public static function user_update($query)
  {
    $id = $query['id'];
    $uid = $query['uid'];
    $values = $query['values'];
    $db = CDbBase::db();
    $db_row = $db->get(CDbBase::table(self::$TABLE_USER), ['uid', 'attr'], ['AND' => ['id' => $id, 'uid' => $uid]]);
    \DJApi\API::debug(['db_row' => $db_row, 'DB' => $db->getShow()]);
    if (!is_array($db_row)) return \DJApi\API::error(\DJApi\API::E_PARAM_ERROR, "用户不存在");
    $attr = json_decode($db_row['attr'], true);
    if (!is_array($attr)) $attr = [];
    if (!is_array($attr['admin'])) $attr['admin'] = [];
    foreach (self::$ADMIN_KEYS['text'] as $k) {
      if (isset($values[$k])) $attr['admin'][$k] = $values[$k];
    }
    $全部有效角色_仅名称 = self::全部有效角色_仅名称();
    foreach (self::$ADMIN_KEYS['role'] as $k) {
      $roles = [];
      if (is_array($values[$k])) foreach ($全部有效角色_仅名称 as $role) {
        if (in_array($role['id'], $values[$k])) $roles[] = $role['id'];
      }
      $attr['admin'][$k] = $roles;
    }

    $datas = [
      'attr' => \DJApi\API::cn_json($attr),
    ];
    $n = $db->update(CDbBase::table(self::$TABLE_USER), $datas, ['id' => $id]);
    \DJApi\API::debug(['ADMIN_KEYS' => self::$ADMIN_KEYS, 'values' => $values, 'attr' => $attr, 'DB' => $db->getShow()]);
    return $n;
  }


  /**
   * 角色权限 - 基础功能函数
   */
  public static $ADMIN_KEYS = [
    'text' => ['name'],
    'role' => ['自己角色', '管理角色'],
  ];
  public static function 全部权限()
  {
    return \APP\CUser::$POWER_DEFINE;
  }
  public static function 全部有效角色_仅名称()
  {
    $db = CDbBase::db();
    $db_roles = $db->select(CDbBase::table(self::$TABLE_ROLE), ['id', 'name'], ['AND' => ['name[!]' => '', 't2[<]' => '1999-12']]);
    return $db_roles;
  }
  public static function 全部有效角色_名称权限()
  {
    $db = CDbBase::db();
    $db_roles = $db->select(CDbBase::table(self::$TABLE_ROLE), ['id', 'name', 'attr'], ['AND' => ['name[!]' => '', 't2[<]' => '1999-12']]);
    \DJApi\API::debug(['全部角色' => $db_roles, 'DB' => $db->getShow()]);
    $roles = [];
    foreach ($db_roles as $db_role) {
      $attr = json_decode($db_role['attr'], true);
      $powers = $attr['powers'];
      if (!is_array($powers)) $powers = "";
      $roles[] = [
        'id' => $db_role['id'],
        'name' => $db_role['name'],
        'powers' => $powers,
      ];
    }
    return $roles;
  }
  public static function get_user_power($uid)
  {
    $全部权限 = self::全部权限();
    $全部角色 = self::全部有效角色_名称权限();
    // $全部角色_ID = \DJApi\map($全部权限, function ($a) {
    //   return $a['id'];
    // });
    $db = CDbBase::db();
    $db_row = $db->get(CDbBase::table(self::$TABLE_USER), ['uid', 'attr'], ['AND' => ['uid' => $uid]]);
    \DJApi\API::debug(['全部权限' => $全部权限, '全部角色' => $全部角色, 'db_row' => $db_row, 'DB' => $db->getShow()]);
    if (!is_array($db_row)) return [];
    $attr = json_decode($db_row['attr'], true);
    // 超级管理员
    if ($attr['superadmin']) return $全部权限;

    //有几个角色
    $role_ids = $attr['admin']['自己角色'];
    if (!is_array($role_ids)) return [];
    $角色的权限 = [];
    foreach ($全部角色 as $角色) {
      $角色的权限[$角色['id']] = $角色['powers'];
    }

    \DJApi\API::debug(['角色的权限' => $角色的权限, 'role_ids' => $role_ids]);

    //按角色数据，有哪些权限
    $role_powers = [];
    foreach ($role_ids as $role_id) {
      foreach ($角色的权限[$role_id] as $group => $arr) {
        \DJApi\API::debug(['foreach 角色的权限' => $角色的权限, 'role_id' => $role_id, 'group' => $group, 'arr' => $arr]);
        if (!is_array($role_powers[$group])) $role_powers[$group] = [];
        $role_powers[$group] = array_merge($role_powers[$group], $arr);
      }
    }

    \DJApi\API::debug(['role_powers' => $role_powers]);

    //确保权限符合配置
    $user_powers = [];
    foreach ($全部权限 as $item) {
      $group = $item['name'];
      $arr = $item['list'];
      \DJApi\API::debug(['foreach 全部权限' => $全部权限, 'group' => $group, 'arr' => $arr]);
      if (!is_array($role_powers[$group])) continue;
      $powers = [];
      foreach ($arr as $power_name) {
        if (in_array($power_name, $role_powers[$group])) $powers[] = $power_name;
      }
      if (is_array($powers)) $user_powers[] = [
        'name' => $group,
        'list' => $powers,
      ];
    }

    \DJApi\API::debug(['user_powers' => $user_powers]);

    return $user_powers;
  }

  public static function user_has_power($uid, $group, $name)
  {
    $user_powers = self::get_user_power($uid);
    if(!is_array($user_powers))return false;
    foreach($user_powers as $item){
      if($item['name']==$group){
        return in_array($name,$item['list']);
      }
    }
    return false;
  }
}
