# G2

G2 是 [OpenCode](https://opencode.ai) 的 Web 前端界面。

*Powered by OpenCode and AI LLMs.*

## 功能特性

- 现代化 Vue 3 + TypeScript 前端架构
- 支持多模型选择和切换
- 文件浏览器集成
- 会话管理
- 多语言支持 (i18n)
- 响应式设计，支持 Tailwind CSS

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **UI 组件**: Element Plus
- **样式**: Tailwind CSS + SCSS
- **代码高亮**: Shiki
- **Markdown 渲染**: markdown-it
- **图标**: Lucide Vue Next

## 本地开发

### 环境要求

- Node.js >= 22
- npm >= 9

### 安装依赖

```bash
npm ci
```

### 配置环境变量

复制 `.env` 文件并根据需要修改：

```env
VITE_OPENCODE_BASE_URL=http://localhost:4000
VITE_WORKSPACE=/workspace
VITE_MODEL_IGNORE=true
```

环境变量说明：

| 变量 | 说明 |
|------|------|
| `VITE_OPENCODE_BASE_URL` | OpenCode 后端服务地址 |
| `VITE_WORKSPACE` | 工作区路径 |
| `VITE_MODEL_IGNORE` | 是否忽略 OpenCode 内置模型 (true/false) |

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## Docker 部署

### 构建镜像

基础构建：

```bash
docker build -f docker/Dockerfile -t g2-app:latest .
```

使用自定义配置构建：

```bash
docker build -f docker/Dockerfile \
  --build-arg OPENCODE_CONFIG_PATH=/path/to/config.json \
  -t g2-app:latest .
```

强制刷新 git clone 缓存：

```bash
docker build -f docker/Dockerfile \
  --build-arg CACHEBUST=$(date +%s) \
  -t g2-app:latest .
```

### 运行容器

基础运行：

```bash
docker run -p 3000:3000 -p 4000:4000 g2-app:latest
```

挂载本地工作区：

```bash
docker run -p 3000:3000 -p 4000:4000 \
  -v /your/local/workspace:/workspace \
  g2-app:latest
```

端口说明：

- `3000`: Vite 开发服务器 (前端)
- `4000`: OpenCode 后端服务

### Docker 构建参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `NPM_REGISTRY` | `https://registry.npmjs.org/` | npm 镜像源 |
| `CACHEBUST` | `1` | 缓存刷新标记 |
| `OPENCODE_CONFIG_PATH` | `./docker/opencode.json` | OpenCode 配置文件路径 |
| `OPENCODE_SKILLS_PATH` | `./docker/skills` | OpenCode Skills 目录路径 |

## 配置说明

### OpenCode 配置

配置文件位于 `docker/opencode.json`，可根据需要修改：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "autoupdate": false,
  "default_agent": "build",
  "permission": {
    "*": "allow"
  },
  "provider": {
    "ollama": {
      "name": "ollama-local",
      "models": {
        "qwen3:8b": {
          "name": "qwen3:8b",
          "tool_call": true,
          "type": "openai"
        }
      }
    }
  }
}
```

## 目录结构

```
g2/
├── docker/                  # Docker 相关文件
│   ├── Dockerfile          # 生产环境镜像
│   ├── Dockerfile_with_python  # 带 Python 环境的镜像
│   ├── opencode.json       # OpenCode 配置
│   └── skills/             # OpenCode Skills
├── src/                    # 源代码
│   ├── api/               # API 接口
│   ├── components/        # Vue 组件
│   ├── store/             # Pinia 状态管理
│   ├── types/             # TypeScript 类型定义
│   └── utils/             # 工具函数
├── public/                 # 静态资源
├── .env                    # 环境变量
├── package.json           # 项目配置
├── vite.config.ts         # Vite 配置
└── tsconfig.json          # TypeScript 配置
```

## 许可证

UNLICENSED - 保留所有权利
