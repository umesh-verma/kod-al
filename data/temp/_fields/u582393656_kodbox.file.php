<?php 
 return array (
  0 => 'fileID',
  1 => 'name',
  2 => 'size',
  3 => 'ioType',
  4 => 'path',
  5 => 'hashSimple',
  6 => 'hashMd5',
  7 => 'linkCount',
  8 => 'createTime',
  9 => 'modifyTime',
  '_autoinc' => true,
  '_pk' => 'fileID',
  '_type' => 
  array (
    'fileID' => 'bigint(20) unsigned',
    'name' => 'varchar(255)',
    'size' => 'bigint(20) unsigned',
    'ioType' => 'int(10) unsigned',
    'path' => 'varchar(255)',
    'hashSimple' => 'varchar(100)',
    'hashMd5' => 'varchar(100)',
    'linkCount' => 'int(11) unsigned',
    'createTime' => 'int(11) unsigned',
    'modifyTime' => 'int(11) unsigned',
  ),
);