<?php 
 return array (
  0 => 'groupID',
  1 => 'name',
  2 => 'parentID',
  3 => 'parentLevel',
  4 => 'extraField',
  5 => 'sort',
  6 => 'sizeMax',
  7 => 'sizeUse',
  8 => 'modifyTime',
  9 => 'createTime',
  '_autoinc' => true,
  '_pk' => 'groupID',
  '_type' => 
  array (
    'groupID' => 'bigint(20) unsigned',
    'name' => 'varchar(255)',
    'parentID' => 'bigint(20) unsigned',
    'parentLevel' => 'varchar(1000)',
    'extraField' => 'varchar(100)',
    'sort' => 'int(11) unsigned',
    'sizeMax' => 'double unsigned',
    'sizeUse' => 'bigint(20) unsigned',
    'modifyTime' => 'int(11) unsigned',
    'createTime' => 'int(11) unsigned',
  ),
);