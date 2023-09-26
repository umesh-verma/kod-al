<?php exit;?>
[14:40:18.185 id-d75d] lock error;key=SystemOption_System.pluginList;time=20;;{
    "0": "kodbox/index.php[6] {2ac}#Application->run()",
    "1": "bin/data.bin[2] {2ac}#Application->autorun()",
    "2": "bin/data.bin[2] {2ac}#Application->appRun("user.index.init")",
    "3": "bin/data.bin[2] ActionCall("user.index.init")",
    "4": "app/autoload.php[160] ActionApply("user.index.init",[])",
    "5": "app/autoload.php[138] {4d2}#userIndex->init()",
    "6": "user/index.class.php[33] {f48}#PluginModel->init()",
    "7": "bin/data.bin[2] {f48}#PluginModel->loadPluginList()",
    "8": "bin/data.bin[2] {f48}#PluginModel->loadList()",
    "9": "bin/data.bin[2] {f48}#PluginModel->listData()",
    "10": "bin/data.bin[2] {19c}#SystemOptionModel->get(false,"System.pluginList",true)",
    "11": "bin/data.bin[2] {19c}#SystemOptionModel->cacheSet("System.pluginList",{"ID-12":{"name":"DPlayer","status":1,"regiest":{"user.commonJs.insert":"DPlayerPlugin.echoJs"},"config":{"pluginAuth":{"all":1},"subtitle":"0","fileSort":200,"fileExt":"mp4,m4v,fl...)",
    "12": "bin/data.bin[2] Cache::set("SystemOption_System.pluginList",{"ID-12":{"name":"DPlayer","status":1,"regiest":{"user.commonJs.insert":"DPlayerPlugin.echoJs"},"config":{"pluginAuth":{"all":1},"subtitle":"0","fileSort":200,"fileExt...)",
    "13": "bin/data.bin[2] CacheLock::lock("SystemOption_System.pluginList")",
    "memory": "2.000M"
}
