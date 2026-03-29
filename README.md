# G2

This is a web frontend for [OpenCode](https://opencode.ai).


# 构建镜像
docker build -f docker/Dockerfile -t g2-app:latest .

# 运行镜像（端口 3000: vite, 4000: opencode）
docker run -p 3000:3000 -p 4000:4000 g2-app:latest

# 挂载本地目录到 /workspace
docker run -p 3000:3000 -p 4000:4000 -v /your/local/workspace:/workspace g2-app:latest