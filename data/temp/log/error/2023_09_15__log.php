<?php exit;?>
[17:49:32.699 id-382a] Host '127.0.0.1' is not allowed to connect to this MariaDB server
{
    "0": "kodbox/index.php[6] {a3a}#Application->run()",
    "1": "bin/data.bin[2] {a3a}#Application->autorun()",
    "2": "bin/data.bin[2] {a3a}#Application->appRun()",
    "3": "bin/data.bin[2] ActionCall("user.index.init")",
    "4": "app/autoload.php[160] ActionApply("user.index.init",[])",
    "5": "app/autoload.php[138] {1c3}#userIndex->init()",
    "6": "user/index.class.php[32] {1c3}#userIndex->loginCheck()",
    "7": "user/index.class.php[105] {1c3}#userIndex->userDataInit()",
    "8": "user/index.class.php[126] {d0d}#UserModel->__call()",
    "9": "bin/data.bin[2] {d0d}#UserModel->call()",
    "10": "bin/data.bin[2] {d0d}#UserModel->_callBefore()",
    "11": "bin/data.bin[2] {d0d}#UserModel->cacheCallCheck()",
    "12": "bin/data.bin[2] {d0d}#UserModel->cacheFunctionGet()",
    "13": "bin/data.bin[2] {d0d}#UserModel->getInfoFull()",
    "14": "bin/data.bin[2] {d0d}#UserModel->getInfoSimple()",
    "15": "bin/data.bin[2] {d0d}#UserModel->cacheFunctionGet()",
    "16": "bin/data.bin[2] {d0d}#UserModel->getInfoSimple()",
    "17": "bin/data.bin[2] {d0d}#UserModel->find()",
    "18": "bin/data.bin[2] {2fc}#DbMysqli->select()",
    "19": "bin/data.bin[2] {2fc}#DbMysqli->query()",
    "20": "bin/data.bin[2] {2fc}#DbMysqli->initConnect()",
    "memory": "1.644M"
}
{"explorer\/list\/path":"","path":"{block:root}","fromType":"tree","CSRF_TOKEN":"462sAMBBfxRxTIhK","URLrouter":"explorer.list.path","URLremote":["explorer","list","path"]}
