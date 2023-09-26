<?php

/**
 * 内网穿透
 * 
 * 客户端管理: 启动/停止/重启; 配置文件处理;
 * 信息管理: 客户端信息(连接数,流量情况; 历史流量使用图); 运行信息;
 * 自适应内外网: APP接口适配;office自适应,外链分享链接,PC端自适应;APP_HOST_LOCAL/APP_HOST_LINK
 * 
 * frp.0.48 https://github.com/fatedier/frp/releases
 * https://gofrp.org/docs/reference/server-configures/
 */
class docNetPlugin extends PluginBase{
	function __construct(){
		parent::__construct();
	}
	public function regist(){
		$this->hookRegist(array(
			'globalRequest'			=> 'docNetPlugin.run',
			'user.commonJs.insert' 	=> 'docNetPlugin.echoJs',
		));
	}
	
	// 更新插件重启处理; 卸载插件前停止服务; 启用停用插件对应处理(不修改状态)
	public function onUpdate(){
		$this->netAction('start');
	}
	public function onUninstall(){
		$this->netAction('stop');
	}
	public function onChangeStatus($status){
		if($status == 1){
			$this->netAction('start');
		}else{
			$this->netAction('stop');
		}
	}
	private function netAction($action){
		if($GLOBALS['isRoot'] != '1'){show_json(LNG('common.noPermission'),false);}
		require_once($this->pluginPath.'app/DocNetClient.class.php');
		$userInfo = $this->userInfo();
		if(!$userInfo['meta'] || !is_array($userInfo['meta']) || $userInfo['meta']['netRun'] != '1'){return;}
		
		if($action == 'stop'){DocNetClient::stop();} // 仅停止;
		if($action == 'start'){$this->clientStart($userInfo);}
	}	
	
	public function echoJs(){
		$config  = $this->getConfig();
		$addPort = ($_SERVER["SERVER_PORT"] && $_SERVER["SERVER_PORT"] != '80') ? ':'.$_SERVER["SERVER_PORT"]:'';
		$this->echoFile('static/main.js',array(
			"{{serverIP}}" 	     => get_server_ip().$addPort,
			"{{autoLocalNet}}" 	 => $config['autoLocalNet'] === '0' ? '0':'1',
			"{{openHttps}}" 	 => $config['openHttps']    === '1' ? '1':'0',
			"{{shareOutLink}}"	 => $config['shareOutLink'] === '1' ? '1':'0',
		));
	}
	public function run(){
		$userInfo = $this->userInfo();// 未开启服务则不处理;
		if(!is_array($userInfo['meta']) || $userInfo['meta']['netRun'] != '1'){return $options;}
				
		Hook::bind('user.view.options.after',array($this,'assignUserOption'));
		Hook::bind('onlyofficeOptions',array($this,'onlyOfficeOptions'));
		$this->autoCheckRun();// 自动检测frp运行状态,如果未启动则自动启动
		$this->allowCROS($userInfo);// 穿透访问,当前在内网时处理;
	}
	
	// 跨域处理; 自适应最新版chrome(外网访问ip资源被拦截问题)
	function allowCROS($userInfo){
		$config   = $this->getConfig();
		if($config['autoLocalNet'] === '0'){return $options;}
		$allowMethods = 'GET, POST, OPTIONS, DELETE, HEAD, MOVE, COPY, PUT, MKCOL, PROPFIND, PROPPATCH, LOCK, UNLOCK';
		$allerHeaders = 'ETag, Content-Type, Content-Length, Accept-Encoding, X-Requested-with, Origin,X-Kod-Cookie, Authorization, Access-Control-Request-Private-Network, Access-Control-Request-Credentials, Access-Control-Allow-Credentials, Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers, Access-Control-Max-Age';
		header('Access-Control-Allow-Origin: '.$this->linkOutServer($userInfo));			// 允许的域名来源;
		header('Access-Control-Allow-Methods: '.$allowMethods); 	// 允许请求的类型
		header('Access-Control-Allow-Headers: '.$allerHeaders);		// 允许请求时带入的header
		header('Access-Control-Allow-Private-Network: true');		// 允许请求时带入的header
		header('Access-Control-Allow-Credentials: true'); 			// 设置是否允许发送 cookie;js需设置:xhr.withCredentials = true;
		header('Access-Control-Max-Age: 3600');
		if(MOD == 'explorer' && $_SERVER['REQUEST_METHOD'] == 'OPTIONS'){exit;} //上传opptions请求不处理,穿透自适应跨域检测;
		// write_log([$this->in,$_SERVER],'test');
	}
	
	// 站点配置相关处理;
	public function assignUserOption($options){
		$config   = $this->getConfig();
		$userInfo = $this->userInfo();
		if($config['shareOutLink'] !== '0' && $userInfo['linkOut']){
			$options['kod']['APP_HOST_LINK'] = $userInfo['linkOut'];// 外链分享采用外部链接;
		}
		if($config['autoLocalNet'] === '0'){return $options;}
		if(strstr(APP_HOST,$userInfo['meta']['netServer'])){
			$options['kod']['APP_HOST_LOCAL'] = $userInfo['meta']['netLocalHost'];
		}
		
		$headerKey   = 'HTTP_X_KOD_COOKIE';//X-Kod-Cookie; 自定义cookie字段; 认证通过;
		$headerToken = isset($_SERVER[$headerKey]) && strstr($_SERVER[$headerKey],'KOD_');
		// 默认放在header中传输; 不支持则放在url;
		if($this->config['settings']['allowHeaderCookie'] == '1'){ // 大于等于1.41版本
			$options['kod']['kodSessionID']  = $headerToken ? Session::sign() : '';
		}
		return $options;
	}
	
	// onlyoffice 内网穿透自适应;
	public function onlyOfficeOptions($options){
		$userInfo = $this->userInfo();
		if(!$userInfo || !strstr(APP_HOST,$userInfo['meta']['netServer'])){return $options;}
        
        $infoHost   = parse_url(APP_HOST);
		$infoOffice = parse_url($options['serverApi']);
		$infoLocal  = parse_url($userInfo['meta']['netLocalHost']);
		
		// 是否允许office地址自适应(1.未配置api; 2.配置了api,但是api地址和本地一致)
		$isKodOffice = $infoOffice['port'] == 8001 && trim($infoOffice['path'],'/') == 'web';
		if($isKodOffice && ($infoOffice['host'] == $infoLocal['host'] || $infoOffice['host'] == $infoHost['host']) ){
			$server = $this->linkOutServer($userInfo,'_office_').'/web/';
			// https代理处理;资源下载保存使用http;
			$options['kodAppHost'] = str_replace('https://','http://',$options['kodAppHost']);
			$options['serverApi'] = $server;
			$options['cdnPath'] = $server;
		}
		return $options;
	}
	
	// 管理接口: 运行信息,更新信息,启动,停止;
	public function api(){
		if($GLOBALS['isRoot'] != '1'){show_json(LNG('common.noPermission'),false);}
		require_once($this->pluginPath.'app/DocNetClient.class.php');
		$userInfo = $this->userInfo();
		switch($this->in['action']){
			case 'info':  $this->clientInfo($userInfo);break;
			case 'update':$this->clientUpdate($userInfo);break;
			case 'start': $this->clientStart($userInfo);break;
			case 'stop':  $this->clientStop($userInfo);break;
			case 'restart':DocNetClient::stop();$this->clientStart($userInfo);break;
			default:break;
		}
		$userInfo = $this->userInfo();
		unset($userInfo['_sign']);
		unset($userInfo['secret']);
		show_json($userInfo,true);
	}
	public function checkLocal(){
		if($GLOBALS['isRoot'] != '1'){show_json(LNG('common.noPermission'),false);}
		if(!request_url_safe($this->in['url'])){show_json("url error",false);}

		$json = url_request($this->in['url'],'GET',array(),0,0,true,5);
		if(!is_array($json['data']) || !is_array($json['data']['data'])){
			show_json(LNG('docNet.net.netLocalHostError'),false);
		}
		show_json($json['data']['data'],true);
	}
	
	// 自动检测frp运行状态,如果未启动则自动启动;[配置已经是已启动状态]
	// 硬件设备自启动 (自启动后加入 curl http://127.0.0.1/kod/kodbox/?user/view/call 即可自动启动内网穿透)
	private function autoCheckRun(){
		if(strtolower(ACTION) != 'user.view.call'){return;}
		$key = 'docNet.autoCheckRun';
		$result = Cache::get($key);
		if($result && time() - $result < 60){return;} // 1分钟之内检测过则不在检测;

		Cache::set($key,time(),200);
		require_once($this->pluginPath.'app/DocNetClient.class.php');
		if(DocNetClient::isRunning()){return;}
		
		write_log("[autoStart-start]",'net');
		$this->clientInfo($this->userInfo());
		$this->clientStart($this->userInfo());
	}
	
	// 客户端运行信息;(流量使用,连接数,运行状态)
	private function clientInfo($userInfo){
		$postAdd = array();
		if(!$userInfo || !$userInfo['id']){ // 首次认证,获取站点secret;
			$post = array('id'=>'','_sign'=>'');
			$postAdd  = array('path'=>BASIC_PATH,'initPass'=>Model('SystemOption')->get('systemPassword'));
		}
		$post = array('user'=>$userInfo['id'],'pass'=>$userInfo['_sign']);
		if($this->in['netLog'] == '1'){$post['netLog'] = '1';}
		$post = array_merge($post,$postAdd);
		$api  = $GLOBALS['config']['settings']['kodApiServer'].'plugin/platformKod/net/user/info';
		$data = url_request($api,'POST',$post,0,0,true,5);
		if(!is_array($data['data'])){
			return show_json(LNG('common.version.networkError').$data['data'],false);
		}
		if(!$data['data']['code'] || !is_array($data['data']['data'])){
		    $this->userInfo(array()); // 站点迁移等情况重置所有数据;
		    show_json($data['data']['data'],false);
		}
		
		$userInfoNew = $data['data']['data'];
		$this->userInfo($userInfoNew);
		if($userInfoNew['secret']){ // 重置secret;
			Model('SystemOption')->set('systemSecret',$userInfoNew['secret']);
		}
		
		if($userInfo['meta']['netRun'] == '1'){ // 运行中状态: 若错误则停止(进程已停止则停止);若未启动则启动;
			$isRunning = DocNetClient::isRunning();
			if($userInfoNew['_error']){$this->clientStop();}
			if(!$userInfoNew['_error'] && !$isRunning){
				$this->clientStart($this->userInfo());
			}
		}
	}
	
	// 更新信息;
	private function clientUpdate($userInfo){
		$meta = Input::getArray(array(
            "netDomain"	    => array("check"=>"require"), // 自定义二级域名;
			"netLocalHost"	=> array("check"=>"require"), // 公司本地服务器
			"netUserName"	=> array("check"=>"require"), // 公司名
			"netDisableDesc"=> array("check"=>"require","default"=>''), // 若为禁用,禁用原因
		));
		$response 	= $this->clientUpdateSave($meta);
		$metaNew 	= is_array($response['meta']) ? $response['meta']: array();
		$metaUser	= is_array($userInfo['meta']) ? $userInfo['meta']: array();
		$isChangeDomain = ($metaNew['netDomain'] != $meta['netDomain']) || ($metaNew['netServer'] != $meta['netServer']);

		// 配置修改自动重启服务(1.首次;2.启动中且域名发生变更)
		if( !$metaUser || ($metaUser['netRun'] == '1' && $isChangeDomain)){
			DocNetClient::stop();
			$this->clientStart($this->userInfo());
		}
	}
	// 启动服务;
	private function clientStart($userInfo){
		if($userInfo['_error']){
			write_log('start-error:'.$userInfo['_error'],'net');
			show_json($userInfo['_error'],false);
		}
		$result = DocNetClient::start($userInfo);
		write_log('start'.($result === true ? '[ok]':'[error]:'.$result),'net');
		if($result !== true){return show_json($result,false);}
		if($userInfo['meta']['netRun'] != '1'){
			$this->clientUpdateSave(array('netRun'=>'1'));
		}
	}

	// 停止服务;
	private function clientStop(){
		DocNetClient::stop();
		if($userInfo['meta']['netRun'] != '0'){
			$this->clientUpdateSave(array('netRun'=>'0'));
		}
	}
		
	// 更新用户信息;
	private function clientUpdateSave($metaSet){
		$userInfo = $this->userInfo();
		$api  = $GLOBALS['config']['settings']['kodApiServer'].'plugin/platformKod/net/user/edit';
		$meta = is_array($userInfo['meta']) ? $userInfo['meta']: array();
		$post = array_merge($meta,$metaSet,array('user'=>$userInfo['id'],'pass'=>$userInfo['_sign']));
		$data = url_request($api,'POST',$post,0,0,true,20);
		if(!is_array($data['data'])){return show_json(LNG('common.version.networkError').$data['data'],false);}
		if(!$data['data']['code']){show_json($data['data']['data'],false);}
		$this->userInfo($data['data']['data']);
		return $data['data']['data'];
	}

	// 用户信息get/set; 
	private function userInfo($set = false){
		if(is_array($set)){
			return Model('SystemOption')->set('docNetUser',json_encode($set),'docNet');
		}
		
		$kodSecret= Model('SystemOption')->get('systemSecret');
		$userInfo = Model('SystemOption')->get('docNetUser','docNet');
		$userInfo = $userInfo ? @json_decode($userInfo,true):array();
		if(!$kodSecret){return false;}
		if(is_array($userInfo) && $userInfo['id'] && $kodSecret){
			$userInfo['_sign'] = md5('kod_net_'.$kodSecret);
		}
		
		// 外网访问地址;
		if(is_array($userInfo['meta']) && $userInfo['meta']['netRun'] == '1'){
			$LocalInfo 	= parse_url($userInfo['meta']['netLocalHost']);
			$userInfo['linkOut'] = $this->linkOutServer($userInfo).'/'.ltrim($LocalInfo['path'],'/');
		}
		return $userInfo && is_array($userInfo) ? $userInfo : array();
	}
	private function linkOutServer($userInfo,$add=''){
		$config   = $this->getConfig();
		$protocol = ($config['openHttps'] === '1') ? 'https' : 'http';
		$protocol = substr(APP_HOST,0,5) == 'https' ? 'https':$protocol;
		return $protocol.'://'.$add.$userInfo['meta']['netDomain'].'.'.$userInfo['meta']['netServer'];
	}
}