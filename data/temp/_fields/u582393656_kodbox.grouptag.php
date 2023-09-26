<?php 
 return array (
  0 => 'id',
  1 => 'userID',
  2 => 'tagID',
  3 => 'name',
  4 => 'path',
  5 => 'type',
  6 => 'sort',
  7 => 'modifyTime',
  8 => 'createTime',
  '_autoinc' => true,
  '_pk' => 'id',
  '_type' => 
  array (
    'id' => 'bigint(20) unsigned',
    'userID' => 'bigint(20) unsigned',
    'tagID' => 'int(11) unsigned',
    'name' => 'varchar(255)',
    'path' => 'varchar(2048)',
    'type' => 'varchar(20)',
    'sort' => 'int(11) unsigned',
    'modifyTime' => 'int(11) unsigned',
    'createTime' => 'int(11) unsigned',
  ),
);