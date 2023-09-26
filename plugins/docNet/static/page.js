ClassBase.define({
	init: function(param){
		this.initParentView(param);
		this.$el = this.$('.body-plugin-add'),
		this.userInfo = false;
		this.initView();
	},
	initView:function(){
		var self = this;
		requireAsync([
			G.docNetPlugin.plugin+'static/style.css',
			G.docNetPlugin.plugin+'static/index.html',
		],function(a,tpl){
			self.viewTpl = tpl;
			self.reloadView();
			self.request('info');
		});
	},
	
	reloadView:function(){
		var self = this;
		var $content = this.$('.net-container');
		this.renderHtml(this.viewTpl,this.userInfo ||{loading:'1'});
		if(!this.userInfo){
			$content.loading();
		}else{
			$content.loading().close();
			$content.hide().fadeIn(400);
		}
		
		this.$('[data-action]').bind('click',function(e){
			// clientStart/clientStop/clientNetLog/clientEdit
			var action = $(this).attr('data-action');
			if(action && _.isFunction(self[action])){self[action]($(this));}
		});
	},
		
	// 请求;action=info/update/start/stop
	request:function(action,data,callback,$loading){
		var self = this;
		var loading = $loading ? $loading.loading() : false;
		data = data || {};data.action = action;
		kodApi.requestSend('plugin/docNet/api',data,function(data){
			if($loading){loading.close();}
			if(data && !data.code){Tips.tips(data.data,'error',5000);}
			if(data.code && _.isObject(data.data)){
				if($loading){Tips.tips(data);}
				self.userInfo = data.data;
				self.reloadView();
			}
			callback && callback(data);
		});
	},
	
	clientStart:function($btn){this.request('start',false,false,$btn);},
	clientRestart:function($btn){this.request('restart',false,false,$btn);},
	clientStop:function($btn){
		var self = this;
		var linkOut = $.parseUrl(this.userInfo.linkOut);
		var linkNow = $.parseUrl(window.location.href);
		if(linkNow.host != linkOut.host){// 不是穿透转发外网地址, 直接停止;
			return this.request('stop',false,false,$btn);
		}
		$.dialog.confirm2(LNG['docNet.ui.stopTips'],function(){
			self.request('stop',false,false,$btn);
		});
	},
	copyLink:function($btn){
		var url = $btn.parent().find('a').attr('href');
		$.copyText(url);
		Tips.tips(LNG['explorer.share.copied']);
	},
	
	
	// 流量使用统计;
	clientNetLog:function(){
		var chart  = false,self = this;
		var dialog = $.dialog({
			id: 'doc-net-log',title:LNG['docNet.ui.netUseTitle'],
			ico: '<i class="font-icon ri-line-chart-line blue-normal"></i>',
			width:800,height:500,cancel:false,
			content:'<div id="doc-net-log-chart"></div>',
			resize: true,fixed: true,padding:'10px 5px 5px 5px',
			resizeCallback:function(){
				if(!dialog || !dialog.$main) return;
				var $main = dialog.$main.find('.aui-main');
				chart.changeSize($main.width(),$main.height());
			},
			onClose:function(){chart && chart.destroy();}
		});
		dialog.$main.find('.aui-close').show();
		dialog.$main.find('.aui-content').addClass('can-not-select');
		this.request('info',{netLog:'1'},function(data){
			requireAsync(VENDER_PATH + 'g2.min.js',function(){
				if(!data || !data.code){Tips.tips(data);}
				chart = self.showChart('doc-net-log-chart',data.data.netUseLog);
			});
		});
		this.bind('onRemove',function(){dialog.close();});
	},
	

	showChart:function(id,listData){
		var sizeUse = function(v){return pathTools.fileSize(v);}
		var colors 	= ['#4ecb73','#74bcff','#3aa1ff'];		
		var chart 	= new G2.Chart({container:id,forceFit:true});
		var listNew = this.chartDataFill(listData,{netUse:0,netUseIn:0,netUseOut:0});
		var listGroup = [], maxSize = 1024*1024;
		var fields = {//https://g2-v3.antv.vision/zh/examples/column/stack#stacked	
			netUse:LNG['docNet.ui.netUseAll'],
			netUseIn:LNG['docNet.ui.netUseIn'],
			netUseOut:LNG['docNet.ui.netUseOut'],			
		};
		_.each(fields,function(text,key){
			_.each(listNew,function(item,k){
			    maxSize = Math.max(maxSize,item.netUse || 0);
				listGroup.push({dayAt:item.dayAt,type:text,netUse:parseInt(item[key])});
			});
		});
		var maxSizeNew = this.chartSizeMaxParse(maxSize);
		chart.source(listGroup);
		chart.scale('netUse',{
			formatter:sizeUse,
			alias:LNG['docNet.ui.netUse'],
			min:0,max:maxSizeNew,
			tickInterval:maxSizeNew * 0.2
		});
		chart.interval().position('dayAt*netUse').color('type',colors);//.interval()
		chart.render();
		chart.changeSize($('#'+id).width(),$('#'+id).height());
		return chart;
	},
	// 数据自动填充; 1.不足7条时补足7条; 2.中间有间断时间的补充完整;
    chartDataFill:function(listData,fillData,dayKey){
        dayKey = dayKey || 'dayAt';
        listData = _.isArray(listData) ? listData : [];
		var dayNum = 7, listNew = [];
		var dayToTime 	= function(v){return strtotime(v.substr(0,4)+'-'+v.substr(4,2)+'-'+v.substr(6,2)+' 00:00:00');}
		var dayIndex 	= function(v){return parseInt(v / (24* 3600));}
		var timeFromMax = time()- dayNum*3600*24;
		var timeFrom 	= listData[0] ? dayToTime(listData[0][dayKey]) : timeFromMax;
		if(timeFrom >= timeFromMax){timeFrom = timeFromMax;}
		var addItem = function(timeDay,num){
			for(var i = 0; i < num; i++){
				var theDay  = dateFormat(timeDay + i*3600*24,"Ymd");
				var theItem = _.extend({},fillData);theItem[dayKey] = theDay;
				listNew.push(theItem);
			}
		};
		var addLast = function(timeTo){// 最后一条数据, 补全到今天;
			var dayBefore = listNew.length ? dayToTime(listNew[listNew.length-1][dayKey]) : timeFrom;
			var dayNum 	= dayIndex(timeTo) - dayIndex(dayBefore) - 1; // 相差超过1天的部分补全;
			if(dayNum > 0){addItem(dayBefore+3600*24,dayNum);}
		};
		if(listData.length == 0){addItem(timeFrom,dayNum);} //0501,0507
		_.each(listData,function(item,i){ // 20230428,20230510,20230513,20230514,20230519
			var dayBefore = listNew.length ? dayToTime(listNew[listNew.length-1][dayKey]) : timeFrom;
			var dayNum = dayIndex(dayToTime(item[dayKey])) - dayIndex(dayBefore) - 1; // 相差超过1天的部分补全;
			if(dayNum > 0){addItem(dayBefore+3600*24,dayNum);}
			if(i == listData.length - 1){addLast(dayToTime(item[dayKey]));}
			listNew.push(item);
			if(i == listData.length - 1){addLast(time());}
		});
		_.each(listNew,function(item,i){
			item[dayKey] = item[dayKey].substr(4,2)+'-'+item[dayKey].substr(6,2);
		});
		return listNew;
    },

	// 图表最大值处理, 处理成最大尺寸大小的整数形式(eg: 135MB=>200MB, 1.23GB=>2GB, 15KB=>20KB);
    chartSizeMaxParse:function(maxSize){
		var _sizeView  = pathTools.fileSize(maxSize);
		var _sizeMatch = _sizeView.match(/([0-9\.]+)\s*(.*)/) || [];
		var unit = {"TB": 1099511627776,"GB": 1073741824,"MB": 1048576,"KB": 1024,"B": 1};
		var _sizeValue = Math.ceil(_sizeMatch[1] || 0) + '';
		var _sizeMax   = parseInt(Math.ceil(_sizeValue / Math.pow(10,(_sizeValue).length - 1)));
		return _sizeMax * Math.pow(10,_sizeValue.length - 1) * unit[_sizeMatch[2] || 'B'];
    },
	
	
	clientEdit:function(){
		var self 	= this;
		var picker 	= ['netLocalHost','netUserName','netDomain'];
		var valuesBefore = _.pick(this.userInfo.meta,picker);
		this.form = new kodApi.formMaker({parent:this,formData:this.formDataEdit()});		
		this.form.renderDialog({
			id: 'doc-net-options',title:LNG['docNet.net.option'],
			ico: '<i class="font-icon ri-global-line blue-normal mr-5"></i>',
			width: 420,height:450,padding: 0,
			resize: true, fixed: true,cancel:true,
		},function(values){
			var valuesNow = _.pick(values,picker);
			if(_.isEqual(valuesBefore,valuesNow)){return true;}
			if(valuesBefore.netLocalHost != values.netLocalHost){
				self.checkLocal(values.netLocalHost,function(){saveValue(values);});
			}else{
				saveValue(values);
			}
			return false;
		});
		
		// 保存处理;
		var saveValue = function(values){
			Tips.loading(LNG['explorer.loading']);
			self.request('update',values,function(data){
				Tips.close(data);
				if(!data.code){return false;}
				self.form.objectRemove();
			});
		}
	},
	pluginOption:function(){
		var self = this;
		var formOption = {
			formStyle:{className:"form-box-title-block dialog-form-style-simple"},
			autoLocalNet:{
				type:"switch",value:G.docNetPlugin.autoLocalNet === '0' ? '0' : '1',
				display:LNG['docNet.plugin.autoLocalNet'],
				desc:'<div class="info-alert mt-10 info-alert-green">'+LNG['docNet.plugin.autoLocalDesc']+'</div>',
				// switchItem:{'0':"openHttps",'1':"openHttpsDesc"},
			},
			openHttps:{
				type:"switch",value:G.docNetPlugin.openHttps === '1' ? '1' : '0',
				display:LNG['docNet.plugin.openHttps'],
				desc:LNG['docNet.plugin.openHttpsDesc'],
			},
			shareOutLink:{
				type:"switch",value:G.docNetPlugin.shareOutLink === '1' ? '1' : '0',
				display:LNG['docNet.plugin.shareOutLink'],desc:LNG['docNet.plugin.shareOutLinkDesc'],
			},
		};
		this.formPlugin = new kodApi.formMaker({parent:this,formData:formOption});
		this.formPlugin.renderDialog({
			id: 'doc-net-plugin-options',title:LNG['docNet.plugin.option'],
			ico: '<i class="font-icon ri-edit-line blue-normal mr-5"></i>',
			width: 420,height:450,padding: 0,
			resize: true, fixed: true,cancel:true,
		},function(values){
			Tips.loading(LNG['explorer.loading']);
			kodApi.requestSend('admin/plugin/setConfig',{app:'docNet',value:values},function(data){
				Tips.close(data);
				if(!data.code){return false;}
				_.extend(G.docNetPlugin,values);
				self.formPlugin.objectRemove();
				self.request('info');
			});
		});
	},
	
	// 内网地址检测
	checkLocal:function(localHost,callbackSuccess){
		var errorText = LNG['docNet.net.netLocalHostError'];
		if(!this.localUrlAllow(localHost)){
			Tips.tips(errorText+'[check]','warning',3000);
			return false;
		}
		var param = {url:localHost+'/index.php?user/view/options'};
		kodApi.requestSend('plugin/docNet/checkLocal',param,function(data){
			if(!data || !data.code || !_.get(data,'data.kod.kodID')){return Tips.tips(data);}
			if(_.get(G,'kod.kodID') != _.get(data,'data.kod.kodID')){
				return Tips.tips(errorText+';kodID not Match','warning',3000);
			}
			callbackSuccess && callbackSuccess();
		});
	},
	
	// 内网地址检测; 不能为本机地址: 127.0.0.1/localhost/xxx.local
	localUrlAllow:function(url){
		var urlInfo  = $.parseUrl(url);
		if( urlInfo.host == 'localhost' || 
			urlInfo.host == '127.0.0.1' ||
			urlInfo.host.match(/\.local$/) || 
			!urlInfo.host){
			if(G.docNetPlugin.serverIP){
			    return 'http://'+G.docNetPlugin.serverIP+'/'+_.trimStart(urlInfo.path,'/')
			}
			return '';
		}
		return url;
	},
	
	formDataEdit:function(){
		var urlInfo    = $.parseUrl(G.kod.APP_HOST);
		var hostServer = 'http://'+G.docNetPlugin.serverIP+'/'+_.trimStart(urlInfo.path,'/');
		
		var host = this.localUrlAllow(G.kod.APP_HOST);
		var userInfo = this.userInfo || {};
		var value = {host:host,domain:'',name:G.system.options.systemName};
		return {
		formStyle:{className:"form-box-title-block dialog-form-style-simple"},
		netLocalHost:{
			type:"input",
			require:'url,length:2-200',
			requireTips:LNG['docNet.net.netLocalHostTips'],
			display:LNG['docNet.net.netLocalHost'],desc:hostServer,
			value:_.get(userInfo,'meta.netLocalHost',value.host),
		},
		netUserName:{
			type:"input",require:'length:2-200',
			display:LNG['docNet.net.netUserName'],
			value:_.get(userInfo,'meta.netUserName',value.name),
		},
		netDomain:{
			type:"input",
			display:LNG['docNet.net.netDomain']+" <i class='desc'>"+LNG['docNet.net.netDomainDesc']+"</i>",
			value:_.get(userInfo,'meta.netDomain',value.domain),
			titleRight:'.kodview.com',
			require:'/^[0-9A-Za-z_-]+$/',
			requireTips:LNG['docNet.net.netDomainTips'],
		},
	}}
});