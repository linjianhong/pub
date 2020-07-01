--
-- 迷你商城系统数据库
--
-- 识别依据：手机号
-- 基于微信获取uid
-- 允许游客登录
-- 绑定手机号，得到身份，否则当作游客
-- 浏览器登录：微信扫码
-- 微信：先获取uid，绑定手机号可改变用户
-- 用户管理：
--   1. 添加手机号，作为新用户
--   2. 作废手机号
--   3. 修改手机号
--   4. 修改用户权限
create table if not exists `shop_user`
(
  `id`          int(11)  not null auto_increment COMMENT 'id',
  `uid`         varchar(16) COMMENT '绑定的uid',
  `mobile`      varchar(16) COMMENT '手机号，系统识别依据',
  `group`       varchar(16) COMMENT '分组',
  `attr`        text  COMMENT  '其它数据',
  `t1`          varchar(32) DEFAULT '' COMMENT  '时间1, 生效时间',
  `t2`          varchar(32) DEFAULT '' COMMENT  '时间2, 失效时间',
  primary key (`id`),
  unique key `id` (`id`)
)default charset=utf8;



create table if not exists `shop_res_index`
(
  `id`          int(11)  not null auto_increment COMMENT  'id',
  `type`        varchar(64) DEFAULT '' COMMENT '物资类型', -- 现金/应收款/木材/家具单件/家具套件/固定资产 ……
  `name`        varchar(64) DEFAULT '' COMMENT  '物资名称',
  `v1`          varchar(128) DEFAULT '' COMMENT '数据1',
  `v2`          varchar(128) DEFAULT '' COMMENT '数据2',
  `v3`          varchar(128) DEFAULT '' COMMENT '数据3',
  `v4`          varchar(128) DEFAULT '' COMMENT '数据4',
  `v5`          varchar(128) DEFAULT '' COMMENT '数据5',
  `v6`          varchar(128) DEFAULT '' COMMENT '数据6',
  `v7`          varchar(128) DEFAULT '' COMMENT '数据6',
  `v8`          varchar(128) DEFAULT '' COMMENT '数据6',
  `date1`       varchar(32) DEFAULT '' COMMENT  '日期1',
  `date2`       varchar(32) DEFAULT '' COMMENT  '日期2',
  `date3`       varchar(32) DEFAULT '' COMMENT  '日期3',
  `date4`       varchar(32) DEFAULT '' COMMENT  '日期4',
  `date5`       varchar(32) DEFAULT '' COMMENT  '日期5',
  `date6`       varchar(32) DEFAULT '' COMMENT  '日期6',
  `attr`        text  COMMENT  '其它数据',
  `status`      varchar(512) DEFAULT '' COMMENT  '状态',
  `t1`          varchar(32) DEFAULT '' COMMENT  '时间1, 生效时间',
  `t2`          varchar(32) DEFAULT '' COMMENT  '时间2, 失效时间',
  primary key (`id`),
  unique key `id` (`id`)
)default charset=utf8  auto_increment=601201;


-- 订单表
-- drop table if exists `buyer_order_list`;
create table if not exists `buyer_order_list` (
  `id`             int(11) NOT NULL AUTO_INCREMENT COMMENT '订单id',
  `uid`            varchar( 32) DEFAULT '' COMMENT '下单用户',
  `uid_share`      varchar( 32) DEFAULT '' COMMENT '分享此订单的用户',
  `reciever`       varchar(256) DEFAULT '' COMMENT '',
  `totle`          varchar( 64) DEFAULT '' COMMENT '',
  `usepoints`      varchar( 64) DEFAULT '' COMMENT '',
  `t_order`        varchar( 32) DEFAULT '' COMMENT '下单时间',
  `t_pay`          varchar( 32) DEFAULT '' COMMENT '付款时间',
  `t_cash`         varchar( 32) DEFAULT '' COMMENT '收款时间',
  `t_send`         varchar( 32) DEFAULT '' COMMENT '发货时间',
  `t_recieve`      varchar( 32) DEFAULT '' COMMENT '收货时间',
  `t_sure`         varchar( 32) DEFAULT '' COMMENT '确认收货时间',
  `t_return`       varchar( 32) DEFAULT '' COMMENT '退货时间',
  `t_file`         varchar( 32) DEFAULT '' COMMENT '归档时间',
  `t_surereturn`   varchar( 32) DEFAULT '' COMMENT '确认退货时间',
  `fr_company`     varchar( 64) DEFAULT '' COMMENT '快递公司',
  `fr_number`      varchar( 64) DEFAULT '' COMMENT '发货单号',
  `uid_cash`       varchar( 16) DEFAULT '' COMMENT '收款人',
  `uid_send`       varchar( 16) DEFAULT '' COMMENT '发货人',
  `pay_mode`       varchar(256) DEFAULT '' COMMENT '支付方式',
  `t_create_pay`   varchar( 32) DEFAULT '' COMMENT '生成支付订单时间',
  `pay_data`       text  COMMENT '支付数据',
  `why_return`     varchar(256) DEFAULT '' COMMENT '退货原因',
  `attr`           text  COMMENT '有关数据',
  primary key (`id`)
) AUTO_INCREMENT=16126618 DEFAULT CHARSET=utf8;

-- 订单的商品列表
-- drop table if exists `buyer_order_item`;
create table if not exists `buyer_order_item` (
  `id`             int(11) NOT NULL AUTO_INCREMENT COMMENT '自动编号',
  `order_id`       varchar( 16) DEFAULT '' COMMENT '订单id',
  `code`           varchar( 16) DEFAULT '' COMMENT '商城商品id',
  `n`              varchar( 16) DEFAULT '' COMMENT '数量',
  `price`          varchar( 16) DEFAULT '' COMMENT '价格',
  `color`          varchar(128) DEFAULT '' COMMENT '颜色',
  `attr`           text  COMMENT '有关数据',
  primary key (`id`)
)default charset=utf8;





-- 消息队列
-- drop table if exists `shop_message_queue`;
create table if not exists `shop_message_queue`
(
  `id`          int(11)  not null auto_increment COMMENT 'id',
  `userid`      varchar(64) DEFAULT '' COMMENT '发布人',
  `type`        varchar(64) DEFAULT '' COMMENT '消息分类',
  `v1`          varchar(128) DEFAULT '' COMMENT '数据1',
  `v2`          varchar(128) DEFAULT '' COMMENT '数据2',
  `v3`          varchar(128) DEFAULT '' COMMENT '数据3',
  `attr`        text  COMMENT '有关数据',
  `status`      varchar(64) DEFAULT '' COMMENT '状态',
  `t_checking`  varchar(32) DEFAULT '' COMMENT '正在检测的时间戳，防止并发检测而重复发送',
  `t1`          varchar(32) DEFAULT '' COMMENT '时间1, 生效时间',
  `t2`          varchar(32) DEFAULT '' COMMENT '时间2, 失效时间',
  primary key (`id`),
  unique key `id` (`id`)
)default charset=utf8;











-- 保存 API 请求及返回记录
-- drop table if exists `tb_log_api`;
create table if not exists `tb_log_api`
(
  `id`          int(11)  not null auto_increment COMMENT 'id',
  `t`           varchar(32) COMMENT '请求时间',
  `ip`          varchar(32) COMMENT 'IP',
  `api`         varchar(32) COMMENT '',
  `call`        varchar(32) COMMENT '',
  `query`       text  COMMENT '请求数据',
  `result`      text  COMMENT '返回结果',
  primary key (`id`),
  unique key `id` (`id`)
)default charset=utf8;


-- 保存浏览器信息
-- drop table if exists `tb_log_browser`;
create table if not exists `tb_log_browser`
(
  `id`          int(11)  not null auto_increment COMMENT 'id',
  `t`           varchar(32) COMMENT '请求时间',
  `ip`          varchar(32) COMMENT 'IP',
  `tokenid`     varchar(32) COMMENT '',
  `browser`     varchar(256) COMMENT '',
  primary key (`id`),
  unique key `id` (`id`)
)default charset=utf8;



