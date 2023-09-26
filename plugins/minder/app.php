<?php
/**
 * 思绪思维导图
 * https://github.com/wanglin2/mind-map
 */
class minderPlugin extends PluginBase{
	function __construct(){
		parent::__construct();
	}
	public function regist(){
		$this->hookRegist(array(
			'user.commonJs.insert' 		=> 'minderPlugin.echoJs',
			'explorer.list.itemParse'	=> 'minderPlugin.itemParse',
		));
	}
	public function echoJs(){
		$this->echoFile('static/main.js');
	}
	public function index(){
		$path   = $this->in['path'];
		$assign = array(
			"fileUrl"	=>'','savePath'	=>'','canWrite'	=>false,
			'fileName'	=> $this->in['name'],
			'staticPath'=> $this->pluginHost."static/minder/",
		);
		if($path){
			if(substr($path,0,4) == 'http'){
				$assign['fileUrl'] = $path;
			}else{
				$assign['fileUrl']  = $this->filePathLink($path);
				if(ActionCall('explorer.auth.fileCanWrite',$path)){
					$assign['savePath'] = $path;
					$assign['canWrite'] = true;
				}
			}
		}
		$this->assign($assign);
		$this->display($this->pluginPath.'/static/app/index.html');
	}
	
	public function itemParse($pathInfo){
		$allowCover = array('smm','km','mind','xmind');
		if($pathInfo['type'] == 'folder' || $pathInfo['size'] <= 10) return;
		if(!in_array($pathInfo['ext'],$allowCover)) return;
		$coverStatus = Cache::get('fileCover_'.KodIO::hashPath($pathInfo));
		if($coverStatus == 'no') return;

		$param  = '&path='.rawurlencode($pathInfo['path']).'&etag='.$pathInfo['size'].'_'.$pathInfo['modifyTime'];;
		$pathInfo['fileThumb'] = APP_HOST.'?plugin/minder/cover'.$param;
		return $pathInfo;
	}
	public function cover(){
		$path = $this->filePath($this->in['path']);
		$pathInfo = IO::info($path);
		$coverKey = 'fileCover_'.KodIO::hashPath($pathInfo);
		if( in_array($pathInfo['ext'],array('smm','km','mind')) ){
			$this->coverMinder($path,$coverKey,$pathInfo);
		}
		if( in_array($pathInfo['ext'],array('xmind')) ){
			$this->coverXmind($path,$coverKey,$pathInfo);
		}
	}
	private function coverMinder($path,$coverKey,$pathInfo){
		$pre  = '{"_imageLength":"';
		$head = IO::fileSubstr($path,0,100);
		if(!strstr($head,$pre)) return Cache::set($coverKey,'no');
		
		preg_match("/\"_imageLength\":\"(\d+)\",/",$head,$match);
		if(!$match || !$match[1]){return Cache::set($coverKey,'no');}
		$readStart = strlen($pre) + strlen($match[1]) + strlen('","_image":"');
		$image = IO::fileSubstr($path,$readStart,intval($match[1]));
		if(!$image) return Cache::set($coverKey,'no');
		Cache::set($coverKey,'yes');
		$this->showImage(base64_decode($image),'image/svg+xml');
	}
	
	public function coverXmind($path,$coverKey,$pathInfo){
		if($sourceID = IO::fileNameExist($this->cachePath, $coverName)){
			return IO::fileOut(KodIO::make($sourceID));
		}
		$find  = '-PEND-MIND-';$flagLength = 20; // 通过kod保存后的xmind文件; 格式会有损;
		$last  = IO::fileSubstr($path,$pathInfo['size']-$flagLength,$flagLength);
		if(strstr($last,$find)){
			preg_match("/(\d+)/",$last,$match);
			if(!$match || !$match[1]){return Cache::set($coverKey,'no');}
			$readStart = $pathInfo['size'] - intval($match[1]) - $flagLength;
			$image = IO::fileSubstr($path,$readStart,intval($match[1]));
			if(!$image) return Cache::set($coverKey,'no');
			Cache::set($coverKey,'yes');
			return $this->showImage(base64_decode($image),'image/svg+xml');
		}
		
		
		$localFile = $this->pluginLocalFile($path);
		$imageThumb = TEMP_FILES . $coverKey;
		if (!file_exists($imageThumb)){
			$file  = KodArchive::extractZipFile($localFile,'Thumbnails/thumbnail.png',$coverName);
			if(!$file) {return Cache::set($coverKey,'no');};
			$cm = new ImageThumb($file,'file');
			$cm->prorate($imageThumb,400,400);
		}
		if(!file_exists($imageThumb) || filesize($imageThumb)<100){$imageThumb = $file;}
		Cache::set($coverKey,'yes');
		$cachePath  = IO::move($imageThumb,$this->cachePath);
		return IO::fileOut($cachePath);
	}

	public function showImage($content,$type='image/jpeg'){
		header('Content-Type: '.$type);
		header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 3600 * 24 * 30) . ' GMT');
		header('Cache-Pragma: public');
		header('Pragma: public');
		header('Cache-Control: cache, must-revalidate');
		echo $content;
	}

	// 图标搜索,iconfont
	public function iconSearch(){
		$api = 'https://www.iconfont.cn/api/icon/search.json';
		$ctoken = 'OHPVlyAdHGaO_6MMA9P-VH22';
		$page = intval($this->in['page']) <= 0 ? 1 : intval($this->in['page']);
		$data = array(
			"page"=>$page,'q'=>$this->in['query'],"t"=>time()."000",
			'pageSize'=>50,"sortType"=>'updated_at',"fromCollection"=>"1",
		);
		$header = array(
            "cookie: ctoken=".$ctoken,
            "x-csrf-token: ".$ctoken,
			"content-type: application/x-www-form-urlencoded; charset=UTF-8"
		);
		$result = url_request($api,"POST",$data,$header,false,false,10);
		header('Content-Type: application/json; charset=utf-8');
		echo isset($result['data']) ? $result['data'] : '';
	}
}