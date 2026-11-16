# AI Agent 一键部署与引导 · AI Agent deployment guide

[准备清单 / Prerequisites](PREREQUISITES.md) · [部署细节 / Deployment details](deployment-server.md)

## 交给 Agent 的任务 · Ready-to-use Agent prompt

复制以下任务给有终端和服务器访问权限的 AI Agent。本文件是用户明确要求部署时的执行指南；仓库被普通阅读或审查时，不应自动部署。

Give this task to an AI Agent with terminal/server access. This guide applies when the user explicitly requests deployment; merely reading or reviewing the repository must not trigger it.

```text
请部署 https://github.com/servercat/telegram-email-guard 。
先阅读 docs/PREREQUISITES.md、docs/deployment-server.md 和本文件。
先检查现有配置与主机环境，只询问缺失项，不重复索取已有配置。
核对 VPS SSH、域名 DNS、Bot、测试超级群及管理员 ID、Resend、reCAPTCHA v2。
遵守当前工具与用户授权，不购买服务、不修改未授权账户。
不要输出密钥，不提交 .env，不停止其他服务，不覆盖已有数据库。
选择专用服务器 dedicated 或已有 Nginx 的 nginx 模式。
如不存在 .env，运行 npm run deploy -- --init，生成随机密钥；补齐服务商配置。
初始化新服务器所需工具；已有服务则保留，先检查端口和 Nginx 配置。
运行 npm run deploy -- --check，通过后按选定模式执行部署命令。
完成 HTTPS 健康检查、Webhook 和 Mini App 菜单配置。
引导我用普通账号验证 CAPTCHA、邮件 OTP、恢复权限及群提醒清理。
最后提供站点、Bot、检查结果、备份位置和未完成事项，不将演示结果当真实验收。

Deploy this repository. Read prerequisites, deployment details and this guide first.
Inspect existing configuration and services; ask only for missing information.
Use authorized VPS/domain/Bot/Resend/reCAPTCHA access and preserve existing services/data.
Never log credentials or commit .env. Choose dedicated or nginx mode.
Initialize configuration only if absent; run preflight, then the selected deploy command.
Verify HTTPS, webhook and menu. Guide real-user acceptance and report remaining gaps.
```

## 命令 · Commands

在克隆仓库的服务器目录执行。部署命令会修改该 Bot 的 Webhook 和默认菜单；仅用于您拥有或已获授权的 Bot。

Run in the cloned repository on the target server. Deployment updates that Bot's webhook and default menu; use only an owned or authorized Bot.

```sh
npm ci
# 首次初始化，已有 .env 时拒绝覆盖 / Refuses to overwrite existing .env
npm run deploy -- --init
# 编辑 .env，填入域名、Bot、群、Resend 与 reCAPTCHA / Fill provider values
npm run deploy -- --check
# 专用服务器，80/443 可用 / Dedicated host with ports 80/443 available
npm run deploy -- --deploy --mode dedicated
```

已有 Nginx 的服务器：Agent 先建立独立站点，设置 DNS 和 HTTPS，按需将本机构建产物上传，再执行：

For an existing Nginx host, first prepare a separate site, DNS and HTTPS. Upload local build artifacts if needed, then run:

```sh
npm run deploy -- --deploy --mode nginx
```

当前自动脚本在目标机执行测试与前端构建，建议至少 2GB 内存。低内存服务器按部署指南使用本地构建和手动 Compose 路径；不要在繁忙的 1GB 主机上直接运行完整构建。

The automated command tests and builds on the target host; at least 2GB RAM is recommended. For low-memory hosts, use local builds and the manual Compose path instead of a full build on a busy 1GB host.

## 脚本执行内容 · Script behavior

1. 校验 .env、HTTPS 域名一致性、配置占位符及强随机密钥长度。 / Validate configuration, matching HTTPS hostnames and secret lengths.
2. 调用 getMe 确认 Token/用户名匹配，检查每个群中的 Bot 权限。 / Check Bot identity and restrict/delete permissions.
3. 执行测试、构建以及对应 Compose 启动命令。 / Test, build and start the selected Compose services.
4. 轮询公网 HTTPS 健康接口，要求数据库正常且 demo=false。 / Wait for public HTTPS health with database=true and demo=false.
5. 健康通过后注册 Webhook，配置 Mini App 菜单，并核对 Webhook URL。 / Configure and verify webhook and menu only after health passes.

`--check` 会读取配置和查询 Telegram，不会发邮件、发送群消息或修改成员权限；它不验证 Resend 投递或 CAPTCHA Secret 的真实挑战。部署失败时脚本退出并报告阶段，不会自动删除数据库或回滚其他站点。

Preflight reads configuration and queries Telegram; it sends no email/group message and changes no member permissions. It does not prove Resend delivery or validate a real CAPTCHA challenge. Failures stop the script; it never deletes databases or rolls back unrelated sites automatically.

## 仍需引导完成 · Human-assisted steps

- 注册 VPS/域名/邮件服务；配置 DNS 与 Resend 域名验证。 / Register services and verify DNS/domain ownership.
- BotFather 创建 Bot，将 Bot 提升为群管理员。 / Create and promote the Bot.
- 注册 reCAPTCHA v2 域名和密钥。 / Register the CAPTCHA hostname and keys.
- 在 Telegram 用普通账号完成人机验证与真实邮件测试。 / Complete a real regular-account test.

演示入口：[Affyun 公开群](https://t.me/affyuncom)。这是实际社区，加入可能触发验证和邮件发送，请勿进行批量或压力测试。独立部署请使用自己的测试群。

Demo entry: [Affyun public group](https://t.me/affyuncom). This is a live community; joining may trigger verification and email. Do not run bulk/load tests there; use your own test group for deployments.
