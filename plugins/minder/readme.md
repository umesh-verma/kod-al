## 1.07 版本
- 细节优化: 关闭前提示-是否修改内容检测优化,界面样式优化; 窗口大小变更时,画布自适应处理;
- 大纲模式拖拽区域调整
- 点击百分百恢复到100%;已经全屏再点击全屏按钮退出全屏;全屏状态变更后界面重绘;
- 思绪思维导图库更新(图片导出样式优化;节点焦点时支持键盘直接触发编辑,性能优化)
- 多语言优化

## 1.03版本
- 思绪思维导图库更新(新增:格式刷支持,大纲模式增强[ 全屏编辑,点击保持焦点,tab/enter可编辑焦点,拖拽支持];修复:只读模式点击节点无法拖动问题,其他问题修复)
- 初始打开,文件高宽都不大于2倍窗口高宽时,采用自适应画布模式;
- 细节优化: 关闭时未保存提示; 移动端Safari禁止手势缩放和下拉刷新页面;移动端对话框样式优化(格式刷按钮样式优化)
- 移动端手势缩放优化: 按线性关系进行缩放,双指位移可以调整画布位置;
- 拖动画布优化: 只读模式拖拽画布时点击在子元素上时无法拖动问题处理(只读模式拖拽,鼠标中键拖拽,移动端拖拽) 


## 1.01版本
- 插件集成
	- 文件打开处理;(文件选择;url,path;分享页面只读模式);
	- 文件打开保存: 
		- 文件编辑;界面保存,ctrl+s保存; 打开所在文件夹
		- 打开文件: 当前文件为空时,支持打开文件
		- 新建文件: 另存为处理;(默认路径,保存后处理);
		- 打开非smm文件: 另存为处理;(同目录)
	- 文件缩略图: 编辑时生成, 文件列表展示;(smm,xmind,mind,km)
	- 文件菜单-打开文件: 从kod中选择smm文件进行打开; 如果已经有打开文件则新窗口打开;
	- 新建文件集成: 加入新建smm思维导图; (新建文件类型快速整合sdk处理; 新建完成回调处理通知)
	- 静态资源cdn处理配置;
- 文件打开转换: xmind,km/smm/mind
- minder库优化:界面样式优化;保存加入封面图处理;xmind保存追加封面处理;

#### TODO
- 文件历史记录;