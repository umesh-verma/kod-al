<?php 
session_start();
if(isset($_POST)){
	$data = file_get_contents("php://input");
	$theme = json_decode($data,true);
  if(!empty($theme)){
	if($theme !="default"){
	  $_SESSION['settheme'] = $theme;
	}else{
		session_destroy();
	}
  }
}
$themefolder = isset($_SESSION['settheme']) ? $_SESSION['settheme'] : "default" ;
$desktopApps = array(
	'myComputer' => array(
		"name"		=> LNG('explorer.toolbar.myComputer'),
		"type"		=> "path",
		"value"		=> "",
		"icon"		=> STATIC_PATH."images/file_icon/icon_others/".$themefolder."/computer.png",
		"menuType"	=> "menu-default-open",
	),
	'recycle' => array(
		"name"		=> LNG('explorer.toolbar.recycle'),
		"type"		=> "path",
		"value"		=> "{userRecycle}",
		"icon"		=> 'recycle',
		"className" => 'file-folder',
		"menuType"	=> "menu-recycle-tree",
	),

	'PluginCenter' => array(
		"name"		=> LNG('admin.menu.plugin'),
		"type"		=> "url",
		"value"		=> './#admin/plugin',
		"rootNeed"	=> 1,//管理员应用
		"icon"		=> STATIC_PATH."images/file_icon/icon_others/".$themefolder."/plugins.png",
		"menuType"	=> "menu-default-open",
	),
	'setting' => array(
		"name"		=> LNG('admin.setting.system'),
		"type"		=> "url",
		"rootNeed"	=> 1,
		"value"		=> './#admin',
		"icon"		=> STATIC_PATH."images/file_icon/icon_others/".$themefolder."/setting.png",
		"menuType"	=> "menu-default-open",
	),
	'adminLog' => array(
		"name"		=> LNG('admin.menu.log'),
		"type"		=> "url",
		"rootNeed"	=> 1,
		"value"		=> './#admin/log',
		"icon"		=> STATIC_PATH."images/file_icon/icon_others/".$themefolder."/text.png",
		"menuType"	=> "menu-default-open",
	),
	
	'appStore' => array(
		"name"		=> LNG('explorer.app.app'),
		"type"		=> "doAction",
		"value"		=> "appInstall",
		"icon"		=> STATIC_PATH."images/file_icon/icon_others/".$themefolder."/appStore.png",
		"menuType"	=> "menu-default-open",
	),
	// 'userSetting' => array(
	// 	"name"		=> LNG('admin.userManage'),
	// 	"type"		=> "url",
	// 	"value"		=> './#setting/user/index',
	// 	"icon"		=> STATIC_PATH."images/file_icon/icon_others/user.png",
	// 	"menuType"	=> "menu-default-open",
	// ),
	// 'userWall' => array(
	// 	"name"		=> LNG('admin.setting.wall'),
	// 	"type"		=> "url",
	// 	"value"		=> './#setting/user/wall',
	// 	"icon"		=> STATIC_PATH."images/file_icon/icon_file/jpg.png",
	// 	"menuType"	=> "menu-default-open",
	// ),
	'userPhoto' => array(
		"name"		=> LNG('explorer.toolbar.photo'),
		"type"		=> "path",
		"value"		=> "{userFileType:photo}/",
		"icon"		=> STATIC_PATH."images/file_icon/icon_others/".$themefolder."/gif.png",
		"menuType"	=> "menu-default-open",
	),
	'userHelp' => array(
		"name"		=> LNG('admin.setting.help'),
		"type"		=> "url",
		"value"		=> 'https://docs.kodcloud.com/',
		"icon"		=> STATIC_PATH."images/file_icon/icon_others/".$themefolder."/hlp.png",
		"menuType"	=> "menu-default-open",
	)
);
return $desktopApps;
