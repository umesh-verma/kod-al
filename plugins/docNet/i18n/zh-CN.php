<?php
return array(
	'docNet.meta.name'					=> "内网访问",
	'docNet.meta.title'					=> "内网穿透服务",
	'docNet.meta.desc'					=> "通过内网穿透服务，可以在外网访问内网资源",
	
	'docNet.ui.startOption'				=> '配置并启用',
	'docNet.ui.siteError'				=> '站点信息未注册',
	'docNet.ui.status'					=> '运行状态',
	'docNet.ui.statusRunning'			=> '运行中',
	'docNet.ui.statusStop'				=> '未运行',
	'docNet.ui.stop'					=> '停止服务',
	'docNet.ui.start'					=> '启动服务',
	'docNet.ui.reStart'					=> '重启服务',
	'docNet.ui.stopTips'				=> '当前为外网访, 确定要停止外网访问服务吗, 停止后将无法再通过外网地址访问?',
	'docNet.ui.linkLocal'				=> '内网地址',
	'docNet.ui.linkOut'					=> '外网地址',
	'docNet.ui.linkEmpty'				=> '未配置',
	'docNet.ui.tipsTitle'				=> '使用说明',
	
	'docNet.ui.netUse'					=> "流量使用",
	'docNet.ui.netUseTitle'				=> "流量使用统计",
	'docNet.ui.netUseIn'				=> "上行流量",
	'docNet.ui.netUseOut'				=> "下行流量",
	'docNet.ui.netUseAll'				=> "总流量",
	'docNet.ui.useHas'					=> "剩余流量",
	'docNet.ui.useToday'				=> "今日使用",
	'docNet.ui.useAll'					=> "总使用",

	
	'docNet.net.option'					=> "穿透设置",
	'docNet.net.netLocalHost'			=> "内部访问地址",
	'docNet.net.netLocalHostError'		=> "内网地址错误,请填写正确的内网地址!",
	'docNet.net.netLocalHostTips'		=> "不支持127.0.0.1,localhost等本机地址",
	'docNet.net.netLocalHostTipsError'	=> "内网地址错误,不能为127.0.0.1等本机地址!",
	'docNet.net.netUserName'			=> "企业名称",
	'docNet.net.netDomain'				=> "内部访问地址",
	'docNet.net.netDomainDesc'			=> "自定义二级域名",
	'docNet.net.netDomainTips'			=> "只能输入字母、数字、下划线、中划线",
	
	
	'docNet.plugin.option'				=> "插件设置",
	'docNet.plugin.autoLocalNet'		=> "自适应内网",
	'docNet.plugin.shareOutLink'		=> "外链分享默认采用外网链接",
	'docNet.plugin.shareOutLinkDesc'	=> "开启并启用穿透插件后,内网ip访问时外链分享采用外网链接",
	'docNet.plugin.openHttps'			=> "启用https",
	'docNet.plugin.openHttpsDesc'		=> "启用后穿透地址默认以https访问,启用后浏览器https访问时无法内网自适应(https页面无法发起http请求)",
	
	
	
	'docNet.plugin.autoLocalDesc'		=> "内网用域名访问时,自动切换到内网访问(速度更快,上传下载等不消耗流量);
	<br/>注意:Chrome 98以上浏览器由于严格内网跨域限制不支持内网自适应(推荐pc客户端,360浏览器,firefox等);",
	'docNet.ui.tipsContent'				=> "<li><b>开启说明:</b>启用服务后,可在外面访问公司内部或内网的网盘,如果您已经是外网服务器则无需做相关配置.</li>
	<li><b>网络带宽:</b>100Mbps宽带不限速;免费版用户每月赠送2G流量,授权版每月赠送10GB,流量用完后将自动停止服务,下月自动恢复.</li>
	<li><b>安全提醒:</b>启用服务后所有人都可以访问您的服务器,注意数据安全防护(使用弱密码等).</li>
	<li><b>遵循法律:</b>启用服务后外链分享请勿传播非法内容,以免被请喝茶(可道云收到相关投诉后,会禁用当前用户的穿透服务).</li>
	<hr/><li><b>流量不足:</b>目前服务器使用的是香港阿里云服务,流量费用我们的成本价1元/GB(具体可参考阿里云官网报价); 流量不足需要购买的联系官网客服进行购买,也是1元/GB, 50GB起售(购买的流量没有时间限制);</li>",
);