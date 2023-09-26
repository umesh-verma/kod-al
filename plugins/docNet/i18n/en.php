<?php
return array(
	'docNet.meta.name' 					=> "Intranet access",
	'docNet.meta.title' 				=> "Intranet penetration service",
	'docNet.meta.desc' 					=> "Through the intranet penetration service, you can access intranet resources on the extranet",

	'docNet.ui.startOption' 			=> 'configure and enable',
	'docNet.ui.siteError' 				=> 'site information is not registered',
	'docNet.ui.status' 					=> 'running status',
	'docNet.ui.statusRunning' 			=> 'running',
	'docNet.ui.statusStop' 				=> 'not running',
	'docNet.ui.stop' 					=> 'stop service',
	'docNet.ui.start' 					=> 'start service',
	'docNet.ui.reStart'					=> 'restart service',
	'docNet.ui.stopTips'				=> 'Currently, it is an external network access. Are you sure you want to stop the external network access service? After stopping, you will no longer be able to access it through an external network address?',
	'docNet.ui.linkLocal' 				=> 'Intranet address',
	'docNet.ui.linkOut' 				=> 'external network address',
	'docNet.ui.linkEmpty' 				=> 'Not configured',
	'docNet.ui.tipsTitle' 				=> 'Instructions for use',

	'docNet.ui.netUse' 					=> "Traffic usage",
	'docNet.ui.netUseTitle' 			=> "Traffic usage statistics",
	'docNet.ui.netUseIn' 				=> "Uplink traffic",
	'docNet.ui.netUseOut' 				=> "Downstream traffic",
	'docNet.ui.netUseAll' 				=> "Total traffic",
	'docNet.ui.useHas' 					=> "Remaining traffic",
	'docNet.ui.useToday' 				=> "Today's use",
	'docNet.ui.useAll' 					=> "Total use",	

	'docNet.net.option' 				=> "Penetration Settings",
	'docNet.net.netLocalHost' 			=> "Internal access address",
	'docNet.net.netLocalHostError'		=> "The intranet address is wrong",
	'docNet.net.netLocalHostTips' 		=> "Do not support 127.0.0.1, localhost and other local addresses",
	'docNet.net.netLocalHostTipsError' 	=> "The intranet address is wrong, it cannot be a local address such as 127.0.0.1!",
	'docNet.net.netUserName' 			=> "Enterprise Name",
	'docNet.net.netDomain' 				=> "Internal Access Address",
	'docNet.net.netDomainDesc' 			=> "Custom second-level domain name",
	'docNet.net.netDomainTips' 			=> "Only enter letters, numbers, underscores, and dashes",
	
	
	'docNet.plugin.option' 				=> "Plugin Settings",
	'docNet.plugin.autoLocalNet' 		=> "Adaptive Intranet",
	'docNet.plugin.shareOutLink' 		=> "External link is used by default for external link sharing",
	'docNet.plugin.shareOutLinkDesc' 	=> "After opening and enabling the pass-through plug-in, when the internal network ip is accessed, the external link sharing will use the external network link",
	'docNet.plugin.openHttps'			=> "Use https",
	'docNet.plugin.openHttpsDesc'		=> "After enabling, the penetration address is accessed via HTTPS by default",
	
	
	
	'docNet.plugin.autoLocalDesc' 		=> "When the intranet is accessed by a domain name, it will automatically switch to the intranet access (faster, uploading and downloading will not consume traffic);
	<br/>Note: Browsers above Chrome 98 do not support intranet adaptation due to strict intranet cross-domain restrictions (recommended pc client, 360 browser, firefox, etc.)",
	
	'docNet.ui.tipsContent' 			=> "<li><b>Instructions for opening:</b> After enabling the service, you can access the company's internal or intranet network disk from the outside. If you are already an external network server, you don't need to do relevant configuration.</li>
	<li><b>Network bandwidth:</b> 100Mbps broadband with unlimited speed; free version users get 2G traffic every month, authorized version gets 10GB every month, the service will be stopped automatically after the traffic is used up, and it will be automatically restored next month.< /li>
	<li><b>Security reminder:</b> After enabling the service, everyone can access your server, pay attention to data security protection (use weak passwords, etc.).</li>
	<li><b>Follow the law:</b> After enabling the service, please do not spread illegal content in external link sharing, so as not to be invited to drink tea (Ke Daoyun will disable the penetration service of the current user after receiving relevant complaints). </li>
	<hr/><li><b>Insufficient traffic:</b> Currently, the server is using the Hong Kong Alibaba Cloud service, and our cost price for traffic is 1 yuan/GB (for details, please refer to the quotation on the official website of Alibaba Cloud); if the traffic is insufficient, it is required Contact the customer service on the official website to purchase, and it is also 1 yuan/GB, starting from 50GB (the purchased traffic has no time limit);</li>",
);