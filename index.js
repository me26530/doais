#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');
const http = require('http');
process.noDeprecation = true;
const { spawn, execSync } = require('child_process');

// 环境变量 - 使用通用名称隐藏真实用途
const PORT = process.env.PORT || 3000;
const SUB_PATH = process.env.SUB_PATH || 'sub';

// ===== 伪装配置（用户通过 .env 设置这些） =====
const config = {
  ID: process.env.ID || 'a29738e5-bee1-c0fc-b484-ae7c49cbc828',
  SERVER: process.env.SERVER || '',
  S_PORT: process.env.S_PORT || '',
  S_KEY: process.env.S_KEY || '',
  DOMAIN: process.env.DOMAIN || '',
  AUTH: process.env.AUTH || '',
  D_PORT: process.env.D_PORT || '8001',
  IP: process.env.IP || 'saas.sin.fan',
  IPORT: process.env.IPORT || '443',
  NAME: process.env.NAME || '',
  P1: process.env.P1 || '',
  P2: process.env.P2 || '',
  P3: process.env.P3 || '',
  P4: process.env.P4 || '',
  P5: process.env.P5 || '',
  P6: process.env.P6 || '',
  TID: process.env.TID || '',
  TOKEN: process.env.TOKEN || '',
  URL: process.env.URL || '',
  DIR: process.env.DIR || '.npm',
  DISABLE: process.env.DISABLE || 'false',
};

// ===== 映射回二进制期望的原始变量名 =====
function buildEnv() {
  return {
    ...process.env,
    UUID: config.ID,
    NEZHA_SERVER: config.SERVER,
    NEZHA_PORT: config.S_PORT,
    NEZHA_KEY: config.S_KEY,
    ARGO_DOMAIN: config.DOMAIN,
    ARGO_AUTH: config.AUTH,
    ARGO_PORT: config.D_PORT,
    CFIP: config.IP,
    CFPORT: config.IPORT,
    NAME: config.NAME,
    FILE_PATH: config.DIR,
    S5_PORT: config.P1,
    HY2_PORT: config.P2,
    TUIC_PORT: config.P3,
    ANYTLS_PORT: config.P4,
    REALITY_PORT: config.P5,
    ANYREALITY_PORT: config.P6,
    CHAT_ID: config.TID,
    BOT_TOKEN: config.TOKEN,
    UPLOAD_URL: config.URL,
    DISABLE_ARGO: config.DISABLE
  };
}

function log(message, type = 'INFO') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] [${type}] ${message}`);
}

function getArchitecture() {
  const arch = os.arch();
  const platform = os.platform();
  log(`Platform: ${platform}, Arch: ${arch}`);
  if (platform === 'linux' || platform === 'darwin') {
    if (arch === 'x64' || arch === 'amd64') return 'amd64';
    if (arch === 'arm64' || arch === 'aarch64') return 'arm64';
  }
  log('Unknown architecture, defaulting to amd64', 'WARN');
  return 'amd64';
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    log(`Downloading: ${url}`);
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Download failed, status: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  try {
    if (req.url === '/') {
      const filePath = path.join(__dirname, 'index.html');
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<html><body><h3>Server is Running</h3></body></html>`);
      }
    } else if (req.url === `/${SUB_PATH}`) {
      const subPath = path.join(config.DIR, 'sub.txt');
      if (fs.existsSync(subPath)) {
        const data = fs.readFileSync(subPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(data);
      } else {
        res.writeHead(404);
        res.end('sub.txt not found yet.');
      }
    } else if (req.url === '/ps') {
      try {
        const output = execSync('ps aux', { encoding: 'utf8', maxBuffer: 1024 * 1024 });
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(output);
      } catch (err) {
        res.writeHead(500);
        res.end(`Error: ${err.message}`);
      }
    } else {
      res.writeHead(404);
      res.end('404 Not Found');
    }
  } catch (err) {
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

async function main() {
  log('Starting application...');
  let binaryPath = '';
  let binaryProcess = null;
  try {
    fs.mkdirSync(config.DIR, { recursive: true });
    const arch = getArchitecture();
    const downloadUrl = arch === 'amd64'
      ? 'https://amd64.eooce.com/sbsh'
      : 'https://arm64.eooce.com/sbsh';
    binaryPath = path.join(process.cwd(), 'disbot');
    await downloadFile(downloadUrl, binaryPath);
    fs.chmodSync(binaryPath, 0o755);

    // 构建环境变量，将伪装名称映射回二进制期望的原始名称
    const env = buildEnv();

    binaryProcess = spawn(binaryPath, [], { env, stdio: 'inherit' });

    binaryProcess.on('error', (err) => {
      log(`Process error: ${err.message}`, 'ERROR');
    });

    binaryProcess.on('exit', (code) => {
      log('Logs will be cleared in 90 seconds');
      setTimeout(() => {
        if (fs.existsSync(binaryPath)) {
          fs.unlinkSync(binaryPath);
          console.clear();
          log('App is running');
        }
      }, 90000);
    });

    log(`HTTP: http://localhost:${PORT}`);
    log(`Sub: http://localhost:${PORT}/${SUB_PATH}`);

    process.on('SIGINT', () => {
      log('Shutting down...');
      if (binaryProcess) binaryProcess.kill();
      if (fs.existsSync(binaryPath)) fs.unlinkSync(binaryPath);
      process.exit(0);
    });
  } catch (error) {
    log(`Error: ${error.message}`, 'ERROR');
    if (fs.existsSync(binaryPath)) fs.unlinkSync(binaryPath);
    process.exit(1);
  }
}

server.listen(PORT, '0.0.0.0', () => {});
main();
