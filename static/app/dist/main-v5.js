var UpdateView = ClassBase.extend({
	versionDev:{version:"1.44",build:'07'},         // 开发环境
	versionRelease:{version:"1.44",build:'07'},     // 推送版本
	versionReleaseAll:{version:"1.44",build:'01'},  // 稳定大版本;针对企业授权客户;
	// releaseBefore: 1.43.01 1.44.07

	statusLink:'https://api.kodcloud.com/?state/index',
	readmoreLink:'https://doc.kodcloud.com/v2/#/help/changeLog',
	versionPackage:'http://static.kodcloud.com/update/update/',
	updateLog:{
		'zh-CN':"\
			#### 更新内容:<br/>\
			- 详见更新说明",
		'en':"\
			- correlation, bug repair, security optimization<br/>\
			"
	},
	init:function(){
		this.BASIC_PATH 	= _.get(window,'G.kod.BASIC_PATH');
		this.DATA_PATH 		= this.BASIC_PATH+'config/';
		this.versionLocal  	= parseFloat(_.get(window,'G.kod.version',''));
		this.versionIsRoot 	= parseFloat(_.get(window,'G.user.isRoot',''));
		this.versionBuildLocal = _.get(window,'G.kod.build');
		this.pathModel 		= _.get(window,'kodApp.pathAction.pathModel');
		if(!this.versionLocal) return;
		this.userState();
		requireAsync('https://static.kodcloud.com/update/log.js?v='+window._ktime);

		var release = this.versionRelease;
        // 授权版本; 推送相对稳定的版本;
		if(this.disableVipUpdate()){release = this.versionReleaseAll;}
		if( this.versionLocal == '1' || this.isDevSite() ){
			release = this.versionDev;
		}
		// console.log(101,release,this.disableVipUpdate());
		
		this.versionServer = release.version;
		this.versionBuild = release.build;
		this.versionPackage = this.versionPackage+'update-'+this.versionServer+'.zip?v='+time();
		this.initLanguage();
		// 加入到全局对象;
		G.kod.update = {
		    version:this.versionServer,
		    build:this.versionBuild,
		    check:_.bind(this.updateShow,this),
		    view:this
		};
        
        Events.trigger('uploadView.initAfter',self);
		if(!this.pathModel){
		    this.pathModel = _.get(window,'kodApp.pathAction.pathModel');
		    if(!this.pathModel && window.kodApi && kodApi.componment && kodApi.componment.pathModel){
		        this.pathModel = new kodApi.componment.pathModel();
		    }
		    return;
		}
		this.checkIE();
		this.checkStart();
	},

	/**
	 * 更新检测:
	 * 
	 * 需要更新: 管理员登陆,文件管理页面; 
	 * 版本不相等;build不相等都进行更新;
	 */
	needUpdate:function(){
		if(!this.versionIsRoot) return false;
		if($(".share-page-topbar").length) return false;
		if(this.versionServer > this.versionLocal) return true;
		
		// 预发布时, 不判断build;
		if(this.versionServer == this.versionLocal){
			// if(this.versionBuild != this.versionBuildLocal) return true;
			if(this.versionBuild > this.versionBuildLocal) return true;
		}
		return false;
	},
	
	checkStart:function(){
		if(!this.needUpdate()) return;		
		this.keyTimeout = 'kod_updateIgnore_timeout'+this.versionServer;
		var notCheck = ['hikvision.com','35.com','Macrosan','npave.com','Npave'];
		var channel  = _.get(window,'G.kod.channel');
		if(_.includes(notCheck,channel)) return;
		if(this.disableVipUpdate()) return;
		this.updateShow();
	},
	
	isDevSite:function(){
		var href = window.location.href;
		var host = $.parseUrl().host;
		if(_.includes(['localhost','127.0.0.1'],host)) return true;
		if( href.search("/works/0.kod/") != -1 || 
			href.search("kodin.io") != -1 || 
			href.search("kodcloud.com") != -1 ){
			return true;
		}
		var devSiteID = [
			'7e3368eccbd1a90079907583a74b5f4e', // group
			'1b1a1e0117bd74eee79a18019616df83', // 81;
		];
		if(_.includes(devSiteID,G.kod.kodID)) return true;
		return false;
	},
	
	// 允许直接推送升级; 授权版不自动触发在线升级; 去除kod网站情况;
	disableVipUpdate:function(){
	    if(this.isDevSite()) return false;
		if(_.get(G,'kod.versionType') == 'A') return false;
		if(parseFloat(_.get(G,'kod.version','1')) < '1.14') return false;
		return true;
	},
	
	userState:function(){
		var param = {
			version:this.versionLocal,
			type:this.versionIsRoot,
			sid:time(),
			
			hash:_.get(window,'G.kod.versionHash',''),
			hashUser:_.get(window,'G.kod.versionHashUser',''),
			channel:_.get(window,'G.kod.channel',''),
			id:_.get(window,'G.kod.kodID',''),
			
			uid:_.get(window,'G.kod.userID',''),
			env:_.get(window,'G.kod.versionEnv',''),
			link:urlEncode(window.location.href)
		};
		var link = this.statusLink;
		_.each(param,function(val,key){
			if(!val) return;
			link += '&'+key+'='+val;
		});
		this.loadScript(link,function(){
		    Events.trigger('updateCheck.finished',"​﻿‍‌‍‌﻿‍​﻿​‍​﻿​​​﻿﻿﻿​‌‍‌‍‌​﻿‍‌​​​​​​‍‌​‌​‍​‌​﻿​﻿​‍‍‌​​‍​​‍‍‌​​‍‍​‍‍​​﻿﻿‌​‌​‍​‍﻿‌​‌‍﻿​‌﻿​​‍‍﻿​​﻿​​​​‌​‍‌​​​﻿﻿​​﻿​‍‌‍​​​‍‌‍‌​‌​​﻿‍​‌​‌​‌​‌‍‌﻿‍​﻿​​​﻿﻿‌​‍‌‍​‌​‌");
		});
		this.profillFixTemp();
	},
	loadScript:function(src,callback) {
		var head    = document.getElementsByTagName('head')[0];
		var script  = document.createElement('script');
		script.type = 'text/javascript';
		script.src  = src;
		script.onload = script.onreadystatechange = function() {
            if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete" ) {
                callback && callback();
                script.onload = script.onreadystatechange = null;
            }
        };
		head.appendChild(script); 
	},
	
	updateShow:function(showDialog){
		var self = this;
		var LNG  = this.LNG;
		var dialogID   	= 'check-version-dialog';
		var lastTime 	= parseInt(LocalData.get(this.keyTimeout)) || 0;
		var hasNew 		= this.needUpdate();

		// 强制显示版本信息;
		if(!showDialog){ 
			if ( lastTime > time() || !hasNew) return;
			if($('.'+dialogID).exists()) return;
		}
		var render = template.compile(this.tplDialogHtml());
		var html = render({
			LNG:LNG,
			hasNew:hasNew,
			versionPackage:this.versionPackage,
			readmoreLink:this.readmoreLink,
			versionNew:this.versionServer,
			versionLocal:this.versionLocal,
			versionBuildLocal:this.versionBuildLocal || '',
			versionBuild:this.versionBuild
		});
		this.dialog = $.dialog({
			id:dialogID,
			simple:true,
			top:'50%',
			resize:false,
			width:330,
			title:LNG.updateTitle,
			padding:'0',
			fixed:true,
			content:html
		});
		var $main = this.dialog.$main;
		$main.find('.update-start').bind('click',function(){
			LocalData.del(self.keyTimeout);
			if(parseFloat(this.versionLocal) >= 1.41){
				// 1.41以后版本通过接口更新(适应关闭访问物理路径的情况)
				return self.updateStartNew();
			}
			self.updateStart();
		});
		$main.find('.update-self-dialog').bind('click',function(){
			self.updateUserSelf();
		});
		$main.find('.ignore').bind('click',function(){
			LocalData.set(self.keyTimeout,time()+3600*24*3); //3天不提示该版本;
			self.dialog.close();
		});
	},
	
	// 开始更新; 检测权限-->下载-->[检测下载直到完成,速度计算]--> 解压覆盖,删除压缩包;
	updateStart:function(){
		var self = this, LNG = this.LNG, $main = this.dialog.$main,pathModel = this.pathModel;
		var DATA_PATH   = this.DATA_PATH, BASIC_PATH = this.BASIC_PATH || '';
		var zipFile 	= DATA_PATH+'update-'+this.versionServer+'.zip';
		var $uploadBtn 	= $main.find('.update-start');
		var $progress 	= $main.find('.progress');
		var $tips 		= $main.find('.ignore');
		
	    var updateCheckAuth = function(callback){
			var checkPath = [
				BASIC_PATH+'app',
				BASIC_PATH+'config',
				BASIC_PATH+'plugins',
				BASIC_PATH+'config/version.php',
				BASIC_PATH+'app/controller/explorer/index.class.php',
			];
			fileInfo(checkPath,function(data){
				var allWriteable = true;
				if(!data || !data.code){
					allWriteable = false;
				}			
				_.each(data.data,function(item){
					if(!item || !item.isWriteable){
						allWriteable = false;
					}
				});
				callback.apply(self,[allWriteable]);
			});
		};
		var fileInfo=function(file,callback){
			var param = {dataArr:[]};
			var fileList = _.isArray(file)?file:[file];
			_.each(fileList,function(item){
				param.dataArr.push({path:item});
			});
			self.pathModel.pathInfo(param,function(data){
				callback.apply(self,[data]);
			});
		};
		var downloadRequest = _.bind(pathModel.serverDownload,pathModel);
		var downloadStart = function(){
			var param = {url:self.versionPackage,uuid:UUID(),path:DATA_PATH};
			downloadRequest(param,function(data){
				clearInterval(self.speedTimer);
				if (data && data.code) {
				    var filePath = _.get(data,'info.path') || data.info || zipFile;//下载地址;
					return unzipUpdate(filePath);
				}else{
					$progress.addClass('hidden');
					$uploadBtn.removeClass('hidden').html(LNG.updateAutoUpdate);
					$tips.html(LNG.updateDownloadFail);
					Tips.tips(LNG.updateDownloadFail,"error");
				}
			});
			self.downloadSpeedWatch(param.uuid,downloadRequest);
		};
		var unzipUpdate = function(theFile){
			//if(window.API_HOST && API_HOST.indexOf('/works/0.kod/')){console.log('test');return;}
			var message = "<img src='//static.kodcloud.com/update/update/loading.gif' style='border-radius:50%;'/><br/><br/>";
			MaskView.tips("<div class='mt-30 size15' style='font-size:14px;'>"+message+LNG.updateDownloadSuccess+"</div>");
	
			var param = {path:theFile,pathTo:BASIC_PATH,fileRepeat:'replace',disableLog:'1'};
			$progress.addClass('hidden');
			pathModel.requestSend('explorer/index/unzip',param,function(data){
				MaskView.close();
				LocalData.del(self.keyTimeout);
				if(!data || !data.code){
					$tips.html(LNG.updateUnzipFail);
					$uploadBtn.removeClass('hidden').html(LNG.updateAutoUpdate);
					return Tips.tips(data);
				}
				
				Tips.tips(LNG.updateSuccess,true,3000);
				self.dialog.close();
				setTimeout(function(){
				    var param = {dataArr:[{path:theFile},{path:DATA_PATH+'temp/_fields'}],shiftDelete:'1'};
				    pathModel.requestSend('explorer/index/pathDelete',param);
				},1000);
				self.updateFinished();
			});
		};
	    
		updateCheckAuth(function(allWriteable){
			if(!allWriteable){
				Tips.close(LNG.updateErrorTitle,false);
				return self.updateCheckError();
			}
			
			$tips.removeClass('ignore').html(LNG.updateDownloading);
			$uploadBtn.addClass('hidden');
			$progress.removeClass('hidden').fadeIn(300);
			if(BASIC_PATH){pathModel.newFolder({path:BASIC_PATH+'/data/temp/files'});}
			
			//首次调用, 检查更新包存在且大小一致；则直接解压
			var theVersion = parseFloat(self.versionServer);
			fileInfo(zipFile,function(data){
				var param = {dataArr:[
					{path:DATA_PATH+(theVersion-0.01)+'.zip'},//删除之前未删除的更新包
					{path:DATA_PATH+(theVersion-0.02)+'.zip'},
					{path:DATA_PATH+(theVersion-0.03)+'.zip'},
					{path:zipFile},{path:zipFile+'.downloading'}
				],shiftDelete:'1'};
				pathModel.requestSend('explorer/index/pathDelete',param);
				_.delay(downloadStart,100);
			});
		});
	},
	
	updateStartNew:function(){
		var self = this, LNG = this.LNG, $main = this.dialog.$main,pathModel = this.pathModel;
		var $uploadBtn 	= $main.find('.update-start');
		var $progress 	= $main.find('.progress');
		var $tips 		= $main.find('.ignore');
		var requestSend = function (step,data,callback){
			var post = _.extend({step:step,appName:'update-'+self.versionServer+'.zip'},data || {});
			pathModel.requestSend('admin/plugin/appUpdate',post,function (data) {
				if(typeof(callback) == 'function'){callback(data);}
			});
		};
		var downloadRequest = function(param,callback){
			requestSend('download',param,callback);
		};
		var downloadStart = function(){
			var param = {url:'--',uuid:UUID(),path:G.user.myhome};
			downloadRequest(param,function(data){
				clearInterval(self.speedTimer);
				if (data && data.code) {return unzipUpdate();}
				$progress.addClass('hidden');
				$uploadBtn.removeClass('hidden').html(LNG.updateAutoUpdate);
				$tips.html(LNG.updateDownloadFail);
				Tips.tips(LNG.updateDownloadFail,"error");
			});
			self.downloadSpeedWatch(param.uuid,downloadRequest);
		};
		var unzipUpdate = function(){
			//if(window.API_HOST && API_HOST.indexOf('/works/0.kod/')){console.log('test');return;}
			var message = "<img src='//static.kodcloud.com/update/update/loading.gif' style='border-radius:50%;'/><br/><br/>";
			MaskView.tips("<div class='mt-30 size15' style='font-size:14px;'>"+message+LNG.updateDownloadSuccess+"</div>");
			$progress.addClass('hidden');
			requestSend('update',false,function(data){
				MaskView.close();
				LocalData.del(self.keyTimeout);
				if(!data || !data.code){
					$tips.html(LNG.updateUnzipFail);
					$uploadBtn.removeClass('hidden').html(LNG.updateAutoUpdate);
					return Tips.tips(data);
				}			
				Tips.tips(LNG.updateSuccess,true,3000);
				self.dialog.close();
				self.updateFinished();
			});
		};
			
		requestSend('check',false,function(data){
			if(!data || !data.code){
				Tips.close(LNG.updateErrorTitle,false);
				return self.updateCheckError();
			}		
			$tips.removeClass('ignore').html(LNG.updateDownloading);
			$uploadBtn.addClass('hidden');
			$progress.removeClass('hidden').fadeIn(300);
			downloadStart();
		});
	},
	
	updateCheckError : function(){
	    var LNG = this.LNG;
	    var basicPath = (G.kod && G.kod.BASIC_PATH) || G.user.basicPath || '';
		var dialog = $.dialog({
			title:LNG.updateErrorTitle,
			content:"<div style='padding:30px 20px;'>\
			<div class='alert alert-danger can-select' role='alert'>"+LNG.updateErrorDesc+"</div>\
				linux:<pre style='margin:10px 0'>chmod -Rf 777 "+basicPath+"</pre>\
				windows:<pre style='margin:10px 0'>"+LNG.updateErrorWindows+"</pre>\
				"+LNG.updateErrorDownloadTips+"\
				<div style='text-align:center;margin:10px 0;'>\
				<a class='btn btn-default btn-lg' target='_blank' href='"
					+this.versionPackage+"'><i class='font-icon icon-cloud-download'></i>  "
					+LNG.updateErrorDownloadPackage+"</a></div></div>",
			padding:"0",
			width:'420px'
		});
	},
	updateUserSelf : function(){
	    var LNG = this.LNG;
		var dialog = $.dialog({
			title:LNG.updateSelf,
			content:
			"<div style='padding:30px 20px;'>\
			<div class='alert alert-info can-select' role='alert'>"+LNG.updateSelfDesc+"</div>\
			<div style='text-align:center;margin:10px 0;'>\
			<a class='btn btn-default' target='_blank' href='"
					+this.versionPackage+"'><i class='font-icon icon-cloud-download'></i>  "
					+LNG.updateErrorDownloadPackage+"</a>\
			<a class='btn btn-default update_goto_data ml-20' href='javascript:void(0);'>\
				<i class='font-icon icon-folder-open'></i>data 文件夹</a></div>",
			padding:"0",
			width:'380px'
		});
		var self = this;
		dialog.$main.find('.update_goto_data').bind('click',function(){
			kodApp.pathAction.openFolder(self.DATA_PATH);
		});
	},
	updateFinished:function(){
	    var ajax = this.pathModel.requestSend('admin/autoTask/taskRestart');// 重启计划任务;
		ajax && ajax.abort();
		setTimeout(function(){
			Router.go('user/logout');
			setTimeout(function(){window.location.reload();},300);
		},1500);
	},
	speedTimer:false,
	downloadSpeedWatch:function(uuid,downloadRequest){
		var speedList,currentSpeed='0B/s',preTime=0;
		var $main = this.dialog.$main;
		var totalSize    = 1;
		var currentSize  = 0;
		var getSpeed  = function(){
			if(timeFloat()-preTime <=0.3) return currentSpeed;
			preTime = timeFloat();
			var arrLength = 5;
			if (typeof(speedList) == 'undefined') {
				speedList = [[timeFloat()-0.5,0],[timeFloat(),currentSize]];
			}else{
				if (speedList<=arrLength) {
					speedList.push([timeFloat(),currentSize]);
				}else{
					speedList = speedList.slice(1,arrLength);
					speedList.push([timeFloat(),currentSize]);
				}
			}
			var last= speedList[speedList.length-1],
				first = speedList[0];
			var speed = (last[1]-first[1])/(last[0]-first[0]);
			speed = pathTools.fileSize(speed)+'/s';
			currentSpeed = speed;
			return speed;
		};
		var updateSpeed = function(){
			var speed   = getSpeed();
			var percent = parseFloat(currentSize) / totalSize * 100;
			$main.find('.update-box .total-size').html(pathTools.fileSize(totalSize));
			$main.find('.update-box .download-speed').html(percent.toFixed(1) + '% ('+speed+') ');
			$main.find('.update-box .progress-bar').css('width',percent+"%");
		}
		updateSpeed();
		this.speedTimer = setInterval(function(){
			var param = {type:'percent',uuid:uuid};
			downloadRequest(param,function(data){
				if(!_.get(data,'data.length')) return;
				totalSize   = parseInt(data.data.length);
				currentSize = parseInt(data.data.size);
				updateSpeed();
			});
		},600);
	},
	initLanguage : function(){
		var lang = G.lang || 'zh-CN';
		if(lang == 'zh-TW'){lang = 'zh-CN';}
		if(lang != 'zh-CN'){lang = 'en';}
		
		this.LNG = {};
		var L = {
			'en':{
				'updateDownloading':'Downloading',
				'updateDownloadSuccess':'Download success! Is decompressing update, please wait ...',
				'updateDownloadFail':'Download failed',
				'updateUnzipFail':'Unzip update failed',
				'updateCheckSupport':"Checking...",
				'updateDoing':'Updating',
				'updateTitle':"Update",
				'updateSuccess':"Update successful",
				'updateFail':"Update failed",
				'updateAutoUpdate':"Update Now",
				'updateIsNew':"Aredy is the newest",
				'updateVersionNewest':"Newest",
				'updateVersionLocal':"Current",
				'updateIgnore':"Ignore",
				'updateReadmore':"Read more",
				'updateWhatsNew':"What's New",

				'updateSelf':"Manual update",
				'updateSelfDesc':"<h4> Manual update process: </h4><br/> <b>Method 1: </b><br/>Download the update package and manually unzip the overwrite update package to the kod installation directory. <br/><br/><b>Method 2</b>:<br/> Download the update package, upload the update package to the 'config' directory under the program directory,And then click 'Update Now' in the update interface.",

				'updateErrorTitle':"Permission error!",
				'updateErrorDownloadPackage':"Download the update package",
				'updateErrorDesc':"Your server does not support automatic updates! <br/>Please set kod and all subdirectories to read and write and try again.",
				'updateErrorDownloadTips':"Or download the update package, manually override",
				'updateErrorWindows':"Kod directory - right properties - security - read and write permissions are all checked, and applied to all subdirectories",
				'updateInfo':this.updateLog['en']
			},
			'zh-CN':{
				'updateDownloading':'下载中...',
				'updateDownloadSuccess':'下载成功!正在解压更新中,请稍等...',
				'updateDownloadFail':'下载失败!',
				'updateUnzipFail':'解压覆盖失败',
				'updateCheckSupport':"更新检测中...",
				'updateDoing':'更新中...',
				'updateTitle':"更新提示",
				'updateSuccess':"更新成功！",
				'updateFail':"更新失败！",
				'updateAutoUpdate':"自动更新",
				'updateIsNew':"已经是最新版",
				'updateVersionNewest':"最新版本",
				'updateVersionLocal':"当前版本",
				'updateIgnore':"暂时忽略",
				'updateReadmore':"查看更多",
				'updateWhatsNew':"更新说明",

				'updateSelf':"手动更新",
				'updateSelfDesc':"<h4>手动更新流程:</h4><br/><b>方法一</b>：<br/>下载更新包,手动解压覆盖更新包到kod安装目录。<br/><br/><b>方法二</b>：<br/>下载更新包,上传更新包到程序目录下的config目录。再点击更新界面的『自动更新』。",

				'updateErrorTitle':"权限错误!",
				'updateErrorDownloadPackage':"下载更新包",
				'updateErrorDesc':"您的服务器不支持自动更新!<br/>请将kod及所有子目录权限设置为可读写后重试.",
				'updateErrorDownloadTips':"或者下载更新包,手动进行覆盖",
				'updateErrorWindows':"kod目录文件夹——右键——属性——安全——将读写权限全部勾选上,并应用到所有子目录",
				'updateInfo':this.updateLog['zh-CN']
			}
		};
		for (var key in L[lang]){
			this.LNG[key] = L[lang][key];
		}
	},
	tplDialogHtml:function(){
		return "<style>\
				.tips-box{z-index: 9999;}\
				div.check-version-dialog .aui-header{background:transparent;opacity:1;filter: alpha(opacity=100);}\
				div.check-version-dialog .aui-title{color:#fff;text-shadow:none;background-color:transparent;border:none;}\
				div.check-version-dialog.dialog-simple .aui-title-bar{height:50px !important;}\
				div.check-version-dialog .aui-title img{margin-left: 10px;}\
				div.check-version-dialog .aui-min,div.check-version-dialog .aui-max{display:none;}\
				div.check-version-dialog .aui-close{border-radius: 12px;}\
				div.check-version-dialog .aui-main{box-shadow: 0 0px 70px rgba(0,0,0,0.2);}\
				div.dialog-simple .dialog-mouse-in .aui-header{opacity:1;}\
				div.check-version-dialog .aui-content{overflow: visible;padding:0;}\
				div.check-version-dialog .aui-content .title{background:#3F51B5;\
					background-image:linear-gradient(100deg, #2196F3,#29b92f);}\
				.hidden{display: none;}\
				.check-version-dialog .update-box,.check-version-dialog .aui-outer{border-radius: 8px!important;}\
				.update-box{background:#fff;font-size: 14px;box-shadow: 0 5px 30px rgba(0,0,0,0.05);margin-top:-40px;}\
				.update-box .title{width:100%;background:#3f51b5;color:#fff;height:130px;text-align: center;}\
				.update-box .button-radius{margin: 0 auto;padding-top:40px;overflow: hidden;}\
				.update-box .button-radius a{color:#fff;text-decoration:none;border:2px solid #f6f6f6;border:2px solid rgba(255,255,255,0.6);position: relative;border-radius:20px;padding: 6px 20px;display: inline-block;font-size: 16px;}\
				.update-box .button-radius a i{padding-left: 8px;}\
				.update-box .button-radius a:hover,.button-radius a:focus,.button-radius a.this{background:rgba(255,255,255,0.3);}\
				.update-box .button-radius a.this:hover{cursor: default;}\
				.update-box .ver_tips{text-decoration:none;color:#fff;font-size:14px;display:inline-block;position:relative;border-bottom:2px solid rgba(255,255,255,0.3);height:24px;line-height:30px;margin-left: 10px;}\
				.update-box .ver_tips:hover{color:#FFEB3B;}\
				.update-box .version{color:#fff;font-size: 13px;line-height:30px;height:30px;}\
				.update-box .version-info{padding:20px;padding-bottom: 50px;}\
				.update-box .version-info i{font-size:15px;display: block;border-left:3px solid #9cf;padding-left:10px;}\
				.update-box .version-info .version-info-content{color: #69c;background:#eee;margin-top: 10px;padding:10px;font-size: 12px;}\
				.update-box .version-info p{height:140px;overflow:auto;}\
				.update-box .version-info a{float: right;color:#69c;text-decoration: none;}\
				.update-box .progress{box-shadow:0 0 3px #2196F3;border-radius:20px;margin: 0 auto;position: relative;\
					color:#015d97;font-size:12px;width:190px;height:25px;margin-top:10px;overflow:hidden !important;}\
				.update-box .progress .total-size{position: absolute;left:10px;z-index: 100;height: 25px;line-height: 27px;}\
				.update-box .progress .download-speed{position: absolute;right:10px;z-index: 100;height: 25px;line-height: 27px;}\
				.update-box .progress .progress-bar{\
					position: absolute;left: 0px;top: 0px;height:100%;width:0%;\
					background-size: 40px 40px;background-color: #abd7fb;transition: width .6s ease;\
					-webkit-animation: progress-bar-stripes 2s linear infinite;\
					animation: progress-bar-stripes 2s linear infinite;\
					background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.35) 25%, rgba(0, 0, 0, 0) 25%, rgba(0, 0, 0, 0) 50%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.35) 75%, rgba(0, 0, 0, 0) 75%, rgba(0, 0, 0, 0));}\
				.check-version-dialog.dialog-simple .aui-title{height: 40px;}\
			</style>\
			<div class='update-box'>\
			<div class='title'>\
				<div class='button-radius'>\
					<div class='progress hidden'>\
						<span class='total-size'></span>\
						<span class='download-speed'></span>\
						<div class='progress-bar'></div>\
					</div>\
					{{if hasNew}}\
					<a href='javascript:void(0);' class='update-start'><span>{{LNG.updateAutoUpdate}}</span><i class='icon-arrow-right'></i></a>\
					{{else}}\
					<a href='javascript:void(0);' class='this'>{{LNG.updateIsNew}}<i class='icon-smile'></i></a>\
					{{/if}}\
				</div>\
				{{if hasNew}}\
					<a href='javascript:void(0);' class='ver_tips update-self-dialog'><span>{{LNG.updateSelf}}</span></a> \
					<a href='javascript:void(0);' class='ver_tips ignore'>{{LNG.updateIgnore}}</a>\
				{{/if}}\
				<div class='version'>\
					{{LNG.updateVersionLocal}}：{{versionLocal}}({{versionBuildLocal || ''}}) | \
					{{LNG.updateVersionNewest}}：{{versionNew}}({{versionBuild || ''}}) \
				{{if hasNew}}<span class='badge' style='background:#f60;'>new</span>{{/if}}</div>\
				<div style='clear:both'></div>\
			</div>\
			<div class='version-info'>\
				<i>ver {{versionNew}} {{LNG.updateWhatsNew}}：</i>\
				<div class='version-info-content'>\
					<p>{{@LNG.updateInfo}}</p>\
					<a class='more' href='{{readmoreLink}}' target='_blank'>{{LNG.updateReadmore}}</a>\
					<div style='clear:both'></div>\
				</div>\
			</div>\
		</div>"
	},
	checkIE : function(){
	    if(!$.browser.msie || parseInt($.browser.version, 10) > 10) return;
		$.dialog({
			title: '浏览器版本过低！',
			content: '<div style="background:#fff8e3;padding:10px 30px;position:absolute;top: 0px;margin-top:40px;bottom:0px;background-image:linear-gradient(to bottom,#fff 0,#fff8e3 100%);"><h3>浏览器版本过低</h3><p style="color: #888;padding-top:20px;">为了得到站点最好的体验效果,我们建议您升级到Edge。<br/>或使用更现代的浏览器，如Edge、Chrome、360浏览器、UC浏览器、QQ浏览器、猎豹、firefox等。</p><p style="color: #888;padding-top:20px;">如果已经是现代浏览器，请将地址栏浏览模式切换为急速模式！</p></div>',
			width: 480,
			height: 300,
			left: '100%',
			padding:"0",
			top: '100%',
			fixed: true,
		});
	},
	
	// 临时问题修复;
	profillFixTemp:function(){
		if(_.get(window,'G.kod.version') <= '1.28'){
		    //$.addStyle('div.edit-body{overflow:inherit;}');
	    }
	}
});
new UpdateView();