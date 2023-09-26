<?php
class DocNetClient{
	const BIN_NAME = 'kod-frp';
	public static function start($userInfo){
		$BIN_PATH = dirname(__FILE__).'/bin/';$error = '';
		$bin = self::getBin($BIN_PATH,$error);
		if(!$bin){return $error;}

		$tmpPath = self::getTempPath($BIN_PATH);
		$command = $bin.' -c '.$tmpPath.self::BIN_NAME.'.ini';
		$logFile = LOG_PATH.'/net/'.self::BIN_NAME.'.php';
		self::makeOptions($BIN_PATH,$userInfo,$tmpPath,$logFile);
		self::stop();
		self::processRun($command,$logFile);
		// @unlink($BIN_PATH.self::BIN_NAME.'.ini');
		
		usleep(800000);$pid = self::processPid(); // 运行成功与否检测; frpc登录frps认证等处理;
		$runLog = file_get_contents($logFile);
		$runLog = is_string($runLog) ? $runLog : '';
		if($pid || strstr($runLog,'start proxy success')){return true;}
		if(!$runLog && !is_writable($tmpPath.self::BIN_NAME.'.ini')){
			$runLog = 'ini file not writeable';
		}
		return str_replace('<?php exit;?>','',$runLog);
	}
	public static function stop(){
		$pid = self::processPid();
		if(!$pid){return true;}

        // 停止所有;
		$bin = self::getBin(dirname(__FILE__).'/bin/',$error);
		if($bin){shell_exec('killall -HUP '.get_path_this($bin));}

		self::processKill($pid);
		write_log('processStop:'.$pid,'net');
	}
	public static function isRunning(){
		return self::processPid() ? true : false;
	}
	public static function processPid(){
		return self::processFind(self::BIN_NAME.'-');
	}
	private static function getTempPath($BIN_PATH){
		$path = rtrim(sys_get_temp_dir(),'/').'/';
		return file_exists($path) ? $path : $BIN_PATH; // 异常则使用bin目录
	}
	
	// 配置文件处理;
	private static function makeOptions($BIN_PATH,$userInfo,$tmpPath,$logFile){
		$urlInfo = parse_url($userInfo['localHost']);
		$urlPort = isset($urlInfo['port']) ? $urlInfo['port'] : '80';
		$urlHost = '127.0.0.1'; // 适应docker中的情况; 如果为ip则默认代理该ip(docker填写宿主机ip:port适应)
		if(preg_match("/^\d+\.\d+\.\d+\.\d+$/",$urlInfo['host'])){
			$urlHost = $urlInfo['host'];
		}
		$content = file_get_contents($BIN_PATH.self::BIN_NAME.'.inc');
		$replace = array(
			'{{serverDomain}}'	=> $userInfo['meta']['netServer'],
			'{{serverPort}}'	=> "8000",
			'{{serverToken}}'	=> "kodcloud_701",
			'{{kodPort}}'		=> $urlPort,
			'{{kodIP}}'			=> $urlHost,
			
			'{{userLogFile}}'	=> $logFile,
			'{{userID}}'		=> $userInfo['id'],
			'{{userPass}}'		=> $userInfo['_sign'],
			'{{userBoardPass}}'	=> md5($userInfo['_sign']),
			'{{userDomain}}'	=> $userInfo['meta']['netDomain'],
		);
		$content = str_replace(array_keys($replace),array_values($replace),$content);
		file_put_contents($tmpPath.self::BIN_NAME.'.ini',$content);
		file_put_contents($replace['{{userLogFile}}'],'');
	}
	
	// 后台运行
	private static function processRun($script,$logFile){
		$command = $script.' &';
		if($GLOBALS['config']['systemOS'] == 'windows'){
			$command = 'start /B "" '.$script;
		}
		//@shell_exec($command);@shell_exec("powershell.exe Start-Process -WindowStyle hidden '".$script."' ");
		file_put_contents($logFile,'<?php exit;?>');
		$descriptorspec = array(
			0 => array("pipe","r"),
			1 => array("file",$logFile,"a"),
			2 => array("file",$logFile,"a"),
		);
		$processID = proc_open($command,$descriptorspec,$pipes);
		if(!is_resource($processID)){
			file_put_contents($logFile,'run error[proc_open]:'.$command);
		}else{
			proc_close($processID);
		}
		write_log('processRun:'.$command,'net');
	}
	
	private static function processFind($search){
		$cmd = "ps -eo user,pid,ppid,args | grep '".$search."' | grep -v grep | awk '{print $2}'";
		if($GLOBALS['config']['systemOS'] != 'windows'){return trim(@shell_exec($cmd));}
		
		// windows 获取pid;
		$cmd = 'WMIC process where "Commandline like \'%%%'.$search.'%%%\'" get Caption,Processid,Commandline';
		$res = trim(@shell_exec($cmd));
		$resArr = explode("\n",trim($res));
		if(!$resArr || count($resArr) <= 3) return '';

		$lineFind = $resArr[count($resArr) - 3];// 最后两个一个为wmic,和cmd;
		$res = preg_match("/.*\s+(\d+)\s*$/",$lineFind,$match);
		if($res && is_array($match) && $match[1]){return $match[1];}
		return '';
	}

	// 通过pid结束进程;
	private static function processKill($pid){
		if(!$pid) return;
		if($GLOBALS['config']['systemOS'] != 'windows'){return @shell_exec('kill -9 '.$pid);}
		@shell_exec('taskkill /F /PID '.$pid);
	}
	private static function getBin($BIN_PATH,&$error=''){
		if( !function_exists('proc_open') || 
			!function_exists('shell_exec') || 
			!function_exists('sys_get_temp_dir')
			){
			return 'proc_open,shell_exec need open';
		}
		
		$os  = strtolower(@php_uname());
		$bin = $BIN_PATH.self::BIN_NAME;
		if(strstr($os,'darwin')){
			$bin .= '-mac';		// mac
		}else if(strstr($os,'win') ){
			$bin .= '-win.exe';	// win
		}else if(strstr($os,'linux') ){
			$bin .= '-linux';	// linux
			if(strstr($os,'arm') || strstr($os,'aarch')){
				$bin .= '-arm';
			}
		}
		$output = shell_exec($bin.' --help 2>&1');
		if(!strstr($output,'--version')){$error = $output;return false;}
		return $bin;
	}
}