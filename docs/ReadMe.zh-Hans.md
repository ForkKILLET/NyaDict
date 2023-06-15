# NyaDict

简体中文 | [日本語](./docs/ReadMe.ja.md) | [English](../ReadMe.md)

NyaDict 是一个面向日语单词记忆的开源网络词典。

体验：[icelava.top/NyaDict/](https://icelava.top/NyaDict/)


## 背景

todo

## 部署

NyaDict 的所有主要功能都是前端提供的，后端仅作数据同步之用。

### 前端

前端是静态的，构建完就能使用。

```bash
pnpm i          # 安装依赖
cd frontend     # 进入前端目录
pnpm build      # 构建
```

编辑 `.env.production` 可以配置后端地址。

调试：

```bash
pnpm dev
```

### 后端

```bash
pnpm i      # 安装依赖
cd backend  # 进入后端目录
pnpm build  # 构建
```

编辑 `.env` 和 `.env.prod` 可以调整调试和生产模式的配置。

生产模式运行：

```bash
pnpm start:prod
```

通过 pm2 运行：

```bash
pnpm start:prod:pm2
```

调试模式运行：

```bash
pnpm start:dev
```
