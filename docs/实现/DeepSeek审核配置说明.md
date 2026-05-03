# DeepSeek 审核配置说明

本文说明 DeepSeek 审核的运维配置方式。代码与 schema 已接入审核链路；真实密钥仍需由站主在 Cloudflare Secret / 本地 `.env.local` 中配置，**不得写入仓库**。

## 1. 用途

留言板回答和评论已接入 DeepSeek API 做发布前审核：

- 审核模式：**同步审核**。
- 审核尺度：**保守通过**。
- 默认模型：`deepseek-v4-flash`。
- 失败兜底：调用失败、超时、返回非 JSON、额度异常、模型不确定时，进入待人工审核，不自动公开。

## 2. 环境变量

| 变量名 | 必填 | 示例 | 说明 |
| --- | --- | --- | --- |
| `DEEPSEEK_API_KEY` | 是 | `替换为轮换后的新密钥` | DeepSeek API 密钥，只能作为 Secret 保存 |
| `DEEPSEEK_MODEL` | 否 | `deepseek-v4-flash` | 审核模型；不配置时后续代码应默认使用 `deepseek-v4-flash` |

不要把真实 `DEEPSEEK_API_KEY` 写入本文档、Git、`wrangler.toml`、前端代码、日志或截图。

## 3. Cloudflare 配置

在 Cloudflare 控制台配置线上 Secret：

1. 打开 Cloudflare Dashboard。
2. 进入 **Workers 和 Pages**。
3. 选择当前线上 Worker，例如 `mingfenti`。
4. 进入 **设置** → **变量和机密**。
5. 添加 Secret：
   - 名称：`DEEPSEEK_API_KEY`
   - 值：粘贴 DeepSeek 控制台生成的新 API key
6. 可选添加普通变量或 Secret：
   - 名称：`DEEPSEEK_MODEL`
   - 值：`deepseek-v4-flash`
7. 保存后重新部署 Worker，确保新环境变量对运行时生效。

## 4. 本地开发配置

本地只在 `.env.local` 中放占位示例对应的真实值，该文件不得提交：

```env
DEEPSEEK_API_KEY=替换为轮换后的新密钥
DEEPSEEK_MODEL=deepseek-v4-flash
```

修改 `.env.local` 后需要重启本地开发服务。

## 5. 密钥轮换

如果怀疑密钥泄露，或密钥曾出现在对话、截图、日志中：

1. 到 DeepSeek 控制台禁用或删除旧 key。
2. 生成新的 API key。
3. 更新 Cloudflare Secret `DEEPSEEK_API_KEY`。
4. 更新本地 `.env.local`。
5. 重新部署线上 Worker，并重启本地服务。
6. 确认文档、Git 历史、`wrangler.toml`、日志中没有真实 key。

注意：此前对话中曾出现过 DeepSeek API key，真实上线前应轮换后使用新 key。

## 6. 审核结果约定

后续实现建议只保存精简审核结果，不长期保存 DeepSeek 原始完整响应：

| 结果 | 含义 | 公开策略 |
| --- | --- | --- |
| `approve` | 明确合规、非辱骂、非广告、非恶意外链、非刷屏 | 自动公开 |
| `review` | 模型不确定、争议强、疑似违规、调用失败、超时、非 JSON、额度异常 | 待人工审核 |
| `reject` | 明显违法、威胁骚扰、垃圾广告、恶意刷屏、恶意外链 | 不公开，可由管理员复核 |

建议保存字段：`verdict`、`labels`、简短 `reason`、审核时间、审核模型或 provider 标识。
