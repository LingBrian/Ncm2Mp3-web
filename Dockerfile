# 使用 Node.js 官方镜像作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 创建上传和输出目录
RUN mkdir -p uploads output

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "server.js"]
