# 🎵 NCM 转 MP3 在线转换器

> 🎧 网易云音乐格式在线转换工具 - 支持批量转换和打包下载

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/node.svg)](https://nodejs.org/)

## ✨ 功能特性

- 📁 **批量上传** - 支持一次选择多个 NCM 文件（最多 20 个）
- 🎯 **拖拽上传** - 支持拖拽文件到上传区域
- 🔄 **批量转换** - 并行处理多个文件，提高转换效率
- 📥 **单个下载** - 每个文件独立下载
- 📦 **打包下载** - 一键打包下载所有转换成功的文件（ZIP 格式）
- 🌐 **中文支持** - 完美支持中文文件名
- 🎨 **美观界面** - 现代化的渐变紫色设计
- 🗑️ **自动清理** - 转换后的文件自动删除，节省服务器空间
- 🔄 **一键重置** - 转换完成后可快速重置界面

## 📸 截图

### 上传界面
上传 NCM 文件，支持多选和拖拽

### 转换结果
显示转换成功和失败的文件列表

### 下载选项
支持单个下载和批量打包下载

## 🚀 快速开始

### 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/LingBrian/Ncm2Mp3-web.git
   cd Ncm2Mp3-web
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动服务器**
   ```bash
   npm start
   ```

4. **访问应用**
   
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 🐳 Docker 部署

### 使用 Docker 运行

1. **拉取或构建镜像**
   
   在本地构建：
   ```bash
   docker build -t ncm2mp3-web .
   ```

2. **运行容器**
   ```bash
   docker run -d -p 3000:3000 --name ncm2mp3 ncm2mp3-web
   ```

3. **访问应用**
   
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### Docker Compose 部署

创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'

services:
  ncm2mp3:
    image: ncm2mp3-web
    build: .
    ports:
      - "3000:3000"
    container_name: ncm2mp3
    restart: unless-stopped
```

然后运行：
```bash
docker-compose up -d
```

### 常用 Docker 命令

- **停止容器**：`docker stop ncm2mp3`
- **启动容器**：`docker start ncm2mp3`
- **查看日志**：`docker logs ncm2mp3`
- **删除容器**：`docker rm -f ncm2mp3`

## 📖 使用说明

### 基本使用

1. 📤 点击上传区域或拖拽 NCM 文件
2. 👀 查看已选择的文件列表
3. ▶️ 点击"开始转换"按钮
4. ✅ 等待转换完成
5. 📥 下载转换后的 MP3 文件

### 高级功能

- **删除文件** - 点击文件列表中的"删除"按钮移除不需要的文件
- **清空列表** - 点击"清空列表"按钮清空所有已选文件
- **打包下载** - 转换完成后点击"打包下载全部"按钮下载 ZIP 文件
- **重新开始** - 点击"重新开始"按钮重置界面，准备下一次转换

## 🛠️ 技术栈

- **后端**
  - [Node.js](https://nodejs.org/) - 运行时环境
  - [Express](https://expressjs.com/) - Web 框架
  - [Multer](https://github.com/expressjs/multer) - 文件上传处理
  - [JSZip](https://stuk.github.io/jszip/) - ZIP 文件生成
  - [ncm2mp3](https://www.npmjs.com/package/ncm2mp3) - NCM 格式转换

- **前端**
  - 原生 HTML/CSS/JavaScript
  - Fetch API - 网络请求
  - Drag & Drop API - 拖拽上传

## 📁 项目结构

```
Ncm2Mp3-web/
├── public/
│   └── index.html          # 前端页面
├── uploads/                # 上传文件临时目录
├── output/                 # 转换后文件输出目录
├── server.js               # 后端服务器
├── package.json            # 项目配置
├── Dockerfile              # Docker 构建文件
└── .dockerignore           # Docker 忽略文件
├── .gitignore           # Git 忽略文件
├── LICENSE              # MIT 许可证
└── README.md            # 项目文档
```

## 🔧 开发

### 可用脚本

```bash
# 启动开发服务器
npm start

# 启动服务器（直接运行）
node server.js
```

### 环境变量

当前版本无需配置环境变量，开箱即用。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## ⚠️ 免责声明

本工具仅供学习和个人使用，请勿用于商业用途或侵犯版权。使用本工具转换的文件请遵守相关法律法规。

## 🙏 致谢

- [ncm2mp3](https://www.npmjs.com/package/ncm2mp3) - 提供核心转换功能
- [Express](https://expressjs.com/) - 强大的 Web 框架
- [Multer](https://github.com/expressjs/multer) - 简单的文件上传处理

## 📮 联系方式

- GitHub: [@LingBrian](https://github.com/LingBrian)

---

⭐ 如果这个项目对你有帮助，请给个 Star！
