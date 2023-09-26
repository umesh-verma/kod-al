kodReady.push(function(){
	var version = '?v={{package.version}}'; // dist;
	LNG.set(jsonDecode(urlDecode("{{LNG}}")));
	G.docNetPlugin  = {
	    serverIP:"{{serverIP}}",
		plugin:"{{pluginHost}}",
		openHttps:"{{openHttps}}",
		autoLocalNet:"{{autoLocalNet}}",
		shareOutLink:"{{shareOutLink}}"
	};
	Events.bind("admin.leftMenu.before",function(menuList){
		menuList.push({
			title:"{{package.name}}",
			icon:"ri-global-line",
			link:"admin/setting/net",
			after:'admin/setting/notice',
			fileSrc:'{{pluginHost}}static/page.js'+version,
		});
	});
	
	if($.hasKey('docNetCheck')){return;}
	// 自适应内网/外网;
	var isLocalNetWork = false;
	var checkSite = function(){
		if(!G.kod.APP_HOST_LOCAL) return;
		$.ajax({
			url:G.kod.APP_HOST_LOCAL+"index.php?user/view/options",
			data:{accessToken:G.kod.accessToken},
			dataType:'json',timeout:500,
			crossDomain:true,xhrFields: {withCredentials:true},
			beforeSend: function (request) {
				//request.setRequestHeader("Access-Control-Request-Private-Network",true);
				request.setRequestHeader("Access-Control-Request-Credentials",true);
				request.setRequestHeader("X-Kod-Cookie",'KOD_CHECK=1; '+document.cookie);// cookie传递检测;
			},
			success:function(data){
				console.log('checkCos',data);
				if(!data || !data.data || !data.data.kod){return;}
				if(data.data.kod.kodID != G.kod.kodID){return;}
				
				window.API_HOST = G.kod.APP_HOST_LOCAL + 'index.php?';
				isLocalNetWork = true;
				resetRequest(data.data.kod.kodSessionID || '');
			},
		});
	};

	// 视频,pdf等文件封面展示; /explorer/content/extend/itemApply.js
	ClassBase.extendHook({
		hookMatch:'fileThumbLoad,applyFileEncode',
		imageThumb:function(src,item,result){
			if(isLocalNetWork){src = urlAddToken(src);}
			return this.__imageThumb.apply(this,[src,item,result]);
		}
	});
	
	// 相对路径引用替换; src/explorer/model/pathApi.js
	ClassBase.extendHook({
		hookMatch:'fileDownload,fileDownloadStart,randomImage',
		fileOutBy:function(){
			var url = this.__fileOutBy.apply(this,arguments);
			if(isLocalNetWork){url = urlAddToken(url);}
			return url;
		}
	});
	var urlAddToken = function(url){
		if(!url || url.indexOf('accessToken=') != -1){return url;}
		// cros preflight 检测需要带入文件名,否则nginx 报405错误
		url = url.replace('/?','/index.php?');
		var and = url.indexOf('?') == -1 ? '?' : '&';
		//console.error(222,url,G.kod.accessToken);
		return url +and+'accessToken='+G.kod.accessToken;
	}
	var resetRequest = function(sessionID){
		functionHook(XMLHttpRequest.prototype,'open',function(method,url){
			if(!isLocalNetWork || sessionID) return;
			var args = arguments;
			args[1] = urlAddToken(args[1]);
			if(args[1].indexOf('user/view/lang') != 0){
				args[1] += '&language='+ urlEncode(Cookie.get('kodUserLanguage'));
			};
			this.withCredentials = true;
			return args;
		},function(){
			//this.setRequestHeader("Access-Control-Request-Private-Network",true);
			this.setRequestHeader("Access-Control-Request-Credentials",true);
			if(sessionID){ // 支持header传输; 优先使用header;
				var cookie = document.cookie+'; KOD_SESSION_ID='+sessionID;
				this.setRequestHeader("X-Kod-Cookie",cookie);
			}
		});	

		//图片缩略图等资源;
		if(window.core){ 
			functionHook(window.core,'path2url',false,function(url,args){
				return isLocalNetWork ? urlAddToken(url) : url;
			});
		}
		functionHook(window,'API_URL',false,function(url,args){
			return isLocalNetWork ? urlAddToken(url) : url;
		});
		// drawio等文件打开自适应处理;
		// core.openFile('{{pluginApi}}',"{{config.openWith}}",_.toArray(arguments)); 
		
		// pc端自适应内网;
		if(window.kodWeb && kodWeb.Global && kodWeb.Global.setDomain){
			kodWeb.Global.setDomain(G.kod.APP_HOST_LOCAL);
		}
	};
	try{checkSite();}catch (error){};
	
});
