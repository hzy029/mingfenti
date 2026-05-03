# 留言板管理密钥（ADMIN_BOARD_SECRET）配置说明

本文说明：**如何生成**管理密钥、**如何部署到 Cloudflare**、**如何在本地开发使用**，以及如何在管理页 `/admin/board` 中登录。

密钥**不是**仓库自带的默认值，必须由站主自行生成并保管。

---

## 1. 密钥是什么

- **环境变量名**：`ADMIN_BOARD_SECRET`（固定，勿改名字）。
- **含义**：一串只有你知道的**长随机文本**；管理页和 `src/app/api/admin/board/**` 接口会校验请求头 `x-admin-board-secret` 是否与之**完全一致**。
- **未配置时**：管理 API 返回 `503`（`admin-not-configured`），管理页无法拉取主题列表。

---

## 2. 生成一串随机密钥（PowerShell）

在 **Windows PowerShell** 中执行（任选其一即可）。

### 方式 A：Base64（推荐，一行复制）

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

执行后会输出一行类似 `k7x...==` 的字符串，**整行复制**保存到密码管理器或临时记事本，后面配置环境变量时用**同一份**，不要多空格、不要换行。

### 方式 B：十六进制

```powershell
-join ((1..48 | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) }))
```

### 方式 C：手写（不推荐）

自行编一段**至少 24 字符**、含大小写与数字的口令；安全性低于随机生成。

---

## 3. 部署到线上（Cloudflare Workers）

密钥必须写入 **Worker 的运行环境**，与本地 `.env.local` 无关（线上不会读你电脑上的文件）。

### 3.0 若终端问「找不到 Worker，要不要新建？」

出现类似提示：

> There doesn't seem to be a Worker called `xxx`. Do you want to create a new Worker…

说明 **Wrangler 正在使用的 Worker 名称**（来自你当前目录下的 `wrangler.toml` 里 `name = "..."`）和 **Cloudflare 控制台里真实存在的 Worker 名称**不一致。

**建议操作：**

1. 先输入 **`n`**（不要），**不要**随便新建一个空壳 Worker，否则 Secret 会加在错误项目上。
2. 任选下面一种方式把密钥加到**真正对外提供网站**的那个 Worker 上（你截图里是 **`mingfenti`**）：
   - **用控制台（最省事）**：Cloudflare → **Workers 和 Pages** → 点进 **`mingfenti`** → **设置** → **变量和机密** → **添加** → 名称填 `ADMIN_BOARD_SECRET`，值粘贴你的密钥 → 保存。
   - **对齐仓库后再用命令行**：把本地 [`wrangler.toml`](../../wrangler.toml) 顶部的 `name = "..."` 改成与线上一致（例如 `mingfenti`，需与 GitHub 部署用的配置一致），保存后再执行 `npx wrangler secret put ADMIN_BOARD_SECRET`。

加完 Secret 后，若管理接口仍读不到，再按你平时的流程 **重新部署一次** 该 Worker（例如 GitHub 推送触发构建，或本地 `opennextjs-cloudflare build` + `wrangler versions upload`）。

### 3.1 用 Wrangler 命令行（推荐）

1. 安装依赖并已能使用 `npx wrangler`（本仓库 `package.json` 已含 `wrangler`）。
2. 登录 Cloudflare（若未登录）：

   ```powershell
   npx wrangler login
   ```

3. 在项目根目录执行（`E:\java_project\2026\shuan` 与 `wrangler.toml` 同级）：

   ```powershell
   cd E:\java_project\2026\shuan
   npx wrangler secret put ADMIN_BOARD_SECRET
   ```

4. 终端提示输入 secret 时，**粘贴你在第 2 步生成的那整串**，回车（输入过程可能不显示字符，属正常）。

5. **重新部署 Worker**（若你改 Secret 后线上未自动刷新版本）：

   ```powershell
   npx opennextjs-cloudflare build
   npx wrangler versions upload
   ```

   具体以你日常发布流程为准；确保当前 Worker 版本能读到新 Secret。

### 3.2 用 Cloudflare 控制台

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers 和 Pages** → 选中你的 Worker（与 `wrangler.toml` 里 `name` 一致的项目）。
2. 进入 **Settings（设置）** → **Variables（变量）**。
3. 在 **Secrets**（或「加密环境变量」）中 **Add**：
   - **Variable name**：`ADMIN_BOARD_SECRET`
   - **Value**：粘贴第 2 步生成的整串。
4. 保存后按控制台提示**重新部署**或等待生效。

> **注意**：`wrangler.toml` 里**不要**明文写 `ADMIN_BOARD_SECRET = "xxx"` 再提交 Git；应使用 Secret / 控制台加密变量。

---

## 4. 本地开发（可选）

在项目根目录创建或编辑 **`.env.local`**（该文件应已在 `.gitignore` 中，勿提交）：

```env
ADMIN_BOARD_SECRET=这里粘贴与线上一致或仅本地测试用的同一串
```

保存后**重启** `npm run dev`。

本地未配置时：管理 API 同样认为未配置；配置后即可在 `http://localhost:3000/admin/board` 调试。

---

## 5. 在管理页里使用

1. 浏览器打开：**`/admin/board`**  
   - 本地：`http://localhost:3000/admin/board`  
   - 线上：`https://你的域名/admin/board`
2. 在「管理密钥」输入框粘贴 **与 Worker 环境变量 `ADMIN_BOARD_SECRET` 完全相同** 的那一串。
3. 点击 **「保存密钥并加载」**（会将密钥写入浏览器 `sessionStorage`，下次可点「从 sessionStorage 导入」）。
4. 若提示未配置或 401：检查线上 Secret 是否已保存、是否已重新部署、粘贴是否多了空格。

### 5.1 接口返回 `reason` 与界面提示（排错）

| `reason`（JSON） | HTTP | 含义与处理 |
| --- | --- | --- |
| `admin-not-configured` | 503 | Worker **未配置** `ADMIN_BOARD_SECRET`。到 Cloudflare → 变量和机密 → 添加 Secret → **重新部署**。 |
| `unauthorized` | 401 | 密钥**与服务器不一致**（不是「未配置」）。核对 Cloudflare 里保存的值与输入框是否逐字符相同。 |
| `database-not-configured` | 503 | 当前运行环境**没有 D1**（本地 `npm run dev` 常见）。请在**已部署**站点使用管理页，或配置带 D1 的预览。 |
| `database-write-failed` | 500 | 写库失败。先对远程 D1 执行最新 [`schema.sql`](../../schema.sql)（含 `board_topics`、`board_topic_meta`、`board_comments` 等）。 |

发布新主题若仅缺少 `board_topic_meta` 表，服务端会尽量**仍插入主题**（补充说明可能写失败）；补跑迁移后带「主题说明」再发即可。

---

## 6. 安全与轮换

- 不要把真实密钥发到公开群、贴到 GitHub Issue、写进可公开下载的文档。
- 怀疑泄露时：在 Cloudflare 用 `wrangler secret put ADMIN_BOARD_SECRET` **覆盖为新串**，再部署；旧密钥即失效。
- 管理页顶栏**不挂链接**，降低被扫到的概率；需要时自行收藏 URL。

---

## 7. 相关代码与交接

- 校验逻辑：[`src/lib/board-admin-auth.ts`](../../src/lib/board-admin-auth.ts)
- 管理页：[`src/app/admin/board/page.tsx`](../../src/app/admin/board/page.tsx)
- 工程总览：[`handoff-工程当前.md`](./handoff-工程当前.md)
