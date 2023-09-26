(function(){
	var initView = function(){
		var $view = $('.searchContainer + .sidebarContainer .sidebarContent .boxContent');
		var html  = `
		<div class="kod-icon-search">
			<input type="text" placeholder="搜索网络图标..."/>
			<span class="btn font-icon ri-close-line" action="clear"></span>
			<span class="btn font-icon ri-search-line" action="search"></span>
		</div>
		<div class="kod-icon-result">
			<div class="kod-icon-list"></div>
			<span class="load-more">载入更多</span>
			<span class="is-loading">载入中...</span>
			<span class="is-empty">没有更多结果了!</span>
		</div>`;
		$view.addClass('panel-image-view');
		var $main = $(html).appendTo($view);
		bindEvent($main);
	};
	
	var bindEvent = function($main){
		var $input 	= $main.find('input');
		var $clear 	= $main.find('[action=clear]');
		var $search = $main.find('[action=search]');
		var searchUpdate = function(){
			var word = _.trim($input.val());
			var method = word ? 'addClass' : 'removeClass';
			$input.parents('.boxContent')[method]('has-search');
		};
		var searchNow = function (){
			var word = _.trim($input.val());
			searchUpdate();
			searchChange(word);
		};
		$input.bind('input keydown change',function(e){
			if(e.keyCode == 13){return searchNow();}
			searchUpdate();//search();
		});		
		$search.bind('click',searchNow);
		$clear.bind('click',function(){$input.val('');searchNow();});
		$main.find('.load-more').bind('click',function(){
			searchChange(_.trim($input.val()),true);
		});
		$main.delegate('.image-item','click',function(){
			var nodeActive = mindMap.renderer.activeNodeList;
			var $item 	= $(this);
			var svgUrl 	= $item.attr('data-svg');
			var width = 100,height = 100,name = $item.attr('name');
			_.each(nodeActive,function(node){
				node.setImage({url:svgUrl,title:name,width:width,height:height});
				// console.log(123123,svgUrl,name,width,height);
			});
		});
	};
	
	var lastRequest = false,page = 1;
	var searchListMake = function(data){
		var $result = $('.kod-icon-result');
		var icons = _.get(data,'data.icons',[]);
		var html  = '';
		_.each(icons,function(icon){
			if(!icon || !icon.show_svg) return;
			var name = htmlEncode(icon.name);
			var svg  = 'data:image/svg+xml;base64,'+base64Encode(icon.show_svg);
			html += '<div name="'+name+'" data-svg="'+svg+'" class="image-item">'+icon.show_svg+'</div>';
		});
		$(html).appendTo('.kod-icon-list');
		
		$result.removeClass('has-empty has-page');
		var pageTotal = Math.ceil(_.get(data,'data.count',0) / 50);
		if(page == 1 && _.isEmpty(icons)){$result.addClass('has-empty');}
		if(page < pageTotal){$result.addClass('has-page');}
	};
	var searchChange = function(word,nextPage){
		var $result = $('.kod-icon-result');
		if(!nextPage || !word){
			$result.removeClass('has-empty has-page');
			page = 1;$('.kod-icon-list').html('');
		}
		if(!word) return false;
		if(nextPage){page += 1;}
		
		var api = kodSdkConfig.pluginApi + 'iconSearch';
		$result.addClass('loading');
		lastRequest && lastRequest.abort();
		lastRequest = $.ajax({
			type:'GET',
			dataType:'json',
			url:api + '&query='+urlEncode(word)+'&page='+page,
			error:function(){
				lastRequest = false;
				$result.removeClass('loading');
			},
			success:function(data){
				$result.removeClass('loading');
				lastRequest = false;
				searchListMake(data);
			},
		});
	};
	
	window.kodIconSearchInit = initView;	
})();