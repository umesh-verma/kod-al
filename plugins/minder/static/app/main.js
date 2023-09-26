kodReady.push(function(){
	var iconFile = '{{pluginHost}}static/images/icon.svg';
	var iconApp  = iconFile,extSupport = '{{config.fileExt}}';
	Events.bind('explorer.kodApp.before',function(appList){
		appList.push({
			name:'{{package.id}}',
			title:'{{package.name}}',
			ext:extSupport,icon:iconFile,
			sort:"{{config.fileSort}}",
			callback:function(){
				core.openFile('{{pluginApi}}',"{{config.openWith}}",_.toArray(arguments));
			}
		});
		kodApp.appSupportSet('aceEditor',extSupport);
	});
	Events.bind('explorer.lightApp.load',function(listData){
		listData['{{package.id}}'] = {
			name:"{{package.name}}",
			desc:"{{package.description}}",
			category:"{{package.category}}",
			appUrl:'{{pluginApi}}',
			openWith:"{{config.openWith}}",
			icon:iconFile
		}
	});

		
	// 新建处理;
	Events.bind('rightMenu.newFileAdd',function(menuList){
		menuList.push({type:'smm',name:'{{package.name}}',createOpen:1,appName:'{{package.id}}'});
	});
	Router.mapIframe({page:'{{package.id}}',title:'{{package.name}}',url:'{{pluginApi}}',ignoreLogin:1});
	Events.bind('main.menu.loadBefore',function(listData){ //添加到左侧菜单栏
		listData['{{package.id}}'] = {
			name:"{{package.menu}}",
			url:'{{pluginApi}}',
			target:'{{config.openWith}}',
			subMenu:'{{config.menuSubMenu}}',
			menuAdd:'{{config.menuAdd}}',
			icon:iconApp
			// icon:'ri-organization-chart bg-yellow-6'
		}
	});
	
	Events.bind('aceEditor.fileOpenModeInit',function(modeList){
		modeList.json = modeList.json ? modeList.json + ','+extSupport:extSupport;
	});
	
	var panelIcon = '.file-panel.panel-image .panel-info-header .header-content .file-icon .path-ico';
	$.addStyle("\
	.x-item-icon.x-xmind,.x-item-icon.x-km,.x-item-icon.x-smm,.x-item-icon.x-mind{background-image:url("+iconFile+");background-size:85%;}\
	"+panelIcon+".path-icon-km img{object-fit:contain;background:#fff;}\
	"+panelIcon+".path-icon-smm img{object-fit:contain;background:#fff;}\
	"+panelIcon+".path-icon-mind img{object-fit:contain;background:#fff;}\
	"+panelIcon+".path-icon-xmind img{object-fit:contain;background:#fff;}\
	");
});
