[common]
server_addr = {{serverDomain}}
server_port = {{serverPort}}
proxy_protocol_version = v2
authentication_method = token
token = {{serverToken}}
log_file = {{userLogFile}}
disable_log_color = true

# 通信优化;启用加密和压缩
use_encryption  = true
use_compression = true
bandwidth_limit = 5MB

# 认证信息
meta_device_user = {{userID}}
meta_device_pass = {{userPass}}
meta_device_domain = {{userDomain}}

# kod服务(站点,及服务器端);
[{{userID}}_kod]
type = http
local_ip = {{kodIP}}
local_port = {{kodPort}}
custom_domains = {{userDomain}}.{{serverDomain}}

# office(以下划线作为分割,支持https(服务器证书暂不支持3级域名通配),最前面加下划线用于全局唯一)
[{{userID}}_kod_office]
type = http
local_ip = {{kodIP}}
local_port = 8001
custom_domains = _office_{{userDomain}}.{{serverDomain}}

# 客户端同步websocket
[{{userID}}_kod_sync]
type = http
local_ip = {{kodIP}}
local_port = 2345
custom_domains = _sync_{{userDomain}}.{{serverDomain}}