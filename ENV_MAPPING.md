# 环境变量映射对照表

> 本项目的环境变量采用**伪装名称**，目的是隐藏底层代理服务的真实用途。
> 程序启动时会自动加载同目录下的 `.env` 文件，并将伪装变量名映射回二进制期望的原始变量名。

---

## 快速开始

在 `.env` 文件中写入以下配置即可：

```ini
# 服务器配置
ID=aaab7087-e751-45ad-9f7d-b4c13fdddfef
SERVER=
S_PORT=
S_KEY=

# 域名和端口
DOMAIN=
AUTH=
D_PORT=8001
IP=saas.sin.fan
IPORT=443

# 节点名称
NAME=

# 端口配置（P1~P6 对应 6 种协议节点）
P1=7474
P2=7474
P3=7473
P4=7473
P5=7472
P6=7471

# 消息通知（Telegram）
TID=
TOKEN=

# 上传配置
URL=
DIR=.npm

# 开关
DISABLE=false

# HTTP 服务
PORT=3000
SUB_PATH=sub
```

---

## 完整映射表

### 服务器/核心配置

| 伪装名 | 原始名 | 说明 | 默认值 |
|--------|--------|------|--------|
| ID | UUID | 节点 UUID 标识 | a29738e5-... |
| SERVER | NEZHA_SERVER | 哪吒探针服务器地址 | 空 |
| S_PORT | NEZHA_PORT | 哪吒探针服务器端口 | 空 |
| S_KEY | NEZHA_KEY | 哪吒探针密钥 | 空 |

### 域名和端口

| 伪装名 | 原始名 | 说明 | 默认值 |
|--------|--------|------|--------|
| DOMAIN | ARGO_DOMAIN | Argo 隧道域名 | 空 |
| AUTH | ARGO_AUTH | Argo 隧道认证 | 空 |
| D_PORT | ARGO_PORT | Argo 隧道端口 | 8001 |
| IP | CFIP | Cloudflare 优选 IP | saas.sin.fan |
| IPORT | CFPORT | Cloudflare 优选端口 | 443 |

### 节点端口配置（P1~P6）

| 伪装名 | 原始名 | 协议类型 | 说明 |
|--------|--------|---------|------|
| P1 | S5_PORT | Socks5 | Socks5 代理端口 |
| P2 | HY2_PORT | Hysteria2 | Hysteria2 协议端口 |
| P3 | TUIC_PORT | TUIC | TUIC v5 协议端口 |
| P4 | ANYTLS_PORT | AnyTLS | AnyTLS (TLS) 协议端口 |
| P5 | REALITY_PORT | VLESS Reality | VLESS + Reality 协议端口 |
| P6 | ANYREALITY_PORT | AnyTLS Reality | AnyTLS + Reality 协议端口 |

### 消息通知

| 伪装名 | 原始名 | 说明 | 默认值 |
|--------|--------|------|--------|
| TID | CHAT_ID | Telegram 聊天 ID | 空 |
| TOKEN | BOT_TOKEN | Telegram Bot Token | 空 |

### 其他

| 伪装名 | 原始名 | 说明 | 默认值 |
|--------|--------|------|--------|
| URL | UPLOAD_URL | 上传订阅地址 | 空 |
| DIR | FILE_PATH | 文件存放目录 | .npm |
| DISABLE | DISABLE_ARGO | 禁用 Argo 隧道 | false |
| PORT | PORT | HTTP 服务端口 | 3000 |
| SUB_PATH | SUB_PATH | 订阅路径 | sub |
| NAME | NAME | 节点名称 | 空 |

---

## 部署方式

### 方式一：源码部署（Node.js）
```
# 1. 放置文件：index.js + package.json + .env + package-lock.json
# 2. 启动（自动加载 .env）
node index.js
```

### 方式二：二进制部署（pkg 编译）
```
# 1. 放置文件：web-server（二进制） + .env
# 2. 启动（自动读取同目录下的 .env）
./web-server
```

### 方式三：手动传环境变量
```
export ID=aaab7087-e751-45ad-9f7d-b4c13fdddfef
export P1=7474 P2=7474 P3=7473 P4=7473 P5=7472 P6=7471
export IP=saas.sin.fan IPORT=443
./web-server
```

---

## 节点产出说明

成功启动后，程序会在 DIR 指定的目录（默认 .npm）下生成 sub.txt，包含以下节点：

| 序号 | 协议 | 对应端口变量 |
|------|------|-------------|
| 1 | VMess + WebSocket + TLS（Argo 隧道） | 走 Cloudflare 转发 |
| 2 | TUIC v5 | P3 |
| 3 | Hysteria2 | P2 |
| 4 | VLESS + Reality | P5 |
| 5 | AnyTLS + TLS | P4（与 P3 同端口） |
| 6 | AnyTLS + Reality | P6 |
| 7 | Socks5 | P1 |

访问 http://IP:PORT/SUB_PATH 即可获取订阅链接。

---

## 注意事项

1. .env 必须和二进制放在同一目录，二进制通过 process.execPath 定位自身目录来查找 .env
2. 如果同时设置了环境变量和 .env 文件，环境变量优先级更高（.env 不会覆盖已存在的变量）
3. P1~P6 端口可灵活配置，相同端口的协议会自动合并
4. Argo 隧道留空 DOMAIN 和 AUTH 时会自动使用快速隧道模式
