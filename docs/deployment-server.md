# 部署指南 · Deployment guide

[中文首页 / Chinese](../README.md) · [English](../README.en.md)

先阅读[准备清单 / Prerequisites checklist](PREREQUISITES.md)，也可使用 [AI Agent 一键部署指南 / Automated deployment guide](AI_AGENT_DEPLOY.md)。

## 前提 · Prerequisites

准备 HTTPS 域名、Docker Compose、Telegram Bot、已验证的 Resend 发信域名和 PostgreSQL 配置。创建 Google reCAPTCHA v2 复选框密钥，注册实际 Mini App 域名。生产示例使用 Node.js 24。

Prepare an HTTPS domain, Docker Compose, a Telegram Bot, a verified Resend sending domain and PostgreSQL credentials. Register a reCAPTCHA v2 checkbox key for the actual Mini App hostname. The production image uses Node.js 24.

## 配置 · Configuration

```sh
cp .env.example .env
```

PowerShell：`Copy-Item .env.example .env`。

| 配置 / Variable | 说明 / Meaning |
|---|---|
| TELEGRAM_BOT_TOKEN / TELEGRAM_BOT_USERNAME | BotFather 提供，用户名不带 @ / From BotFather; username without @ |
| TELEGRAM_GROUP_IDS | 允许的超级群数字 ID，逗号分隔 / Allowed supergroup IDs, comma-separated |
| ADMIN_TELEGRAM_IDS | 管理员数字 ID，仍会查询真实群身份 / Admin IDs; live group-admin status is also checked |
| TELEGRAM_WEBHOOK_SECRET | 强随机 Webhook 校验密钥 / Strong random webhook secret |
| OTP_HASH_SECRET | 强随机 OTP HMAC 密钥 / Strong random OTP HMAC secret |
| POSTGRES_PASSWORD / DATABASE_URL | 两者密码一致；URL 中特殊字符需编码 / Matching passwords; URL-encode special characters |
| RESEND_API_KEY / RESEND_FROM_EMAIL | 发信权限密钥与已验证域名发件地址 / Sending key and sender on a verified domain |
| SITE_DOMAIN | Caddy 的主机名，不加协议 / Hostname for Caddy, without scheme |
| PUBLIC_BASE_URL / MINI_APP_BASE_URL | 实际 HTTPS 根地址 / Actual HTTPS origin |
| ADMIN_CONTACT_URL / GROUP_URL | 可选 Telegram 联系链接 / Optional Telegram contact links |
| RECAPTCHA_ENABLED | 正式启用时 true / true when configured |
| RECAPTCHA_SITE_KEY / RECAPTCHA_SECRET_KEY | v2 公开网站密钥与仅服务端密钥 / v2 public Site Key and server-only Secret Key |
| RECAPTCHA_HOSTNAME | 与 Mini App 域名严格一致，不加协议 / Exact Mini App hostname, no scheme |

使用独立强随机密钥；保持 `NODE_ENV=production`、`DEMO_MODE=false`。`.env` 不会自动由 `npm run api` 加载；直接在主机运行时需显式注入环境，Compose 会通过 `env_file` 加载。

Use separate strong random secrets, `NODE_ENV=production` and `DEMO_MODE=false`. `npm run api` does not load `.env` automatically; inject variables explicitly for host execution. Compose loads it through `env_file`.

## 方案 A：独占服务器 · Dedicated server

确保 80/443 空闲、DNS 指向服务器，然后：

Ensure ports 80/443 are free and DNS points to the host, then run:

```sh
docker compose up -d --build
curl -fsS https://verify.example.com/api/health
```

Caddy 使用 `SITE_DOMAIN` 自动管理 HTTPS。用您自己的域名替换示例。

Caddy manages HTTPS for `SITE_DOMAIN`. Replace the example hostname with your own.

## 方案 B：已有 Nginx · Existing Nginx

保留既有站点。本方案仅启动 app 与 PostgreSQL，app 只监听 `127.0.0.1:3101`，不启动 Caddy。

Keep existing sites. This option runs only app and PostgreSQL, binds app to `127.0.0.1:3101`, and leaves Caddy stopped.

先在构建机器上执行 `npm ci`、`npm test`、`npm run build`，将源码和 `dist/` 上传到服务器独立目录；不要覆盖已有 `.env`。

Run `npm ci`, `npm test` and `npm run build` on the build machine. Upload source and `dist/` into a dedicated directory; preserve the server's existing `.env`.

```sh
docker compose -p email-guard -f docker-compose.yml -f deploy/compose.server.yml up -d --build app
```

复制并修改 `deploy/verify.nginx.conf` 的 `server_name`，配置新的 Nginx 站点；先执行 `sudo nginx -t`，再 reload。使用 Certbot 为新域名单独配置 HTTPS，例如：

Copy `deploy/verify.nginx.conf`, replace `server_name`, and create a separate site. Run `sudo nginx -t` before reloading. Configure HTTPS for the new hostname with Certbot, for example:

```sh
sudo certbot --nginx -d verify.example.com
```

不要把 app 或数据库端口直接开放到公网。部署脚本不应重写其他站点。

Do not expose app or database ports directly. Preserve unrelated sites during deployment.

## Telegram 接入 · Telegram integration

1. BotFather 配置 Mini App / Web App 菜单为实际 HTTPS 地址。 / Set the Mini App or Web App menu to the HTTPS URL in BotFather.
2. 将 Bot 设为超级群管理员，授予限制成员及删除消息权限。 / Promote the Bot in the supergroup with restrict-members and delete-messages permissions.
3. 注册 Webhook：`https://verify.example.com/api/telegram/webhook`，设置与 `.env` 相同的 `secret_token`。 / Register this webhook with the configured secret token.
4. `allowed_updates` 包含 `message`、`chat_member`、`my_chat_member`、`widget_query`。 / Include these update types.
5. 使用普通账号加入测试群，按流程验证。 / Test the complete flow with a regular account.

当前 Bot 如不允许原生 Widget，系统自动使用引导图片和官方 Mini App 按钮。无需为此去掉服务端身份校验。

When native Widgets are unavailable, the system falls back to a guide image and an official Mini App button. Backend authentication remains required.

## 上线检查 · Acceptance checks

- `/api/health` 返回 ok 和 database=true；生产演示接口返回 404。 / Health reports ok and database=true; production demo endpoints return 404.
- 无有效 initData 的生产请求返回 401。 / Requests without valid initData return 401.
- 先人机验证、再邮箱输入；验证码冷却与错误次数正确。 / CAPTCHA precedes email entry; resend cooldown and attempts behave correctly.
- 邮件实际收到；恢复权限后方显示成功。 / Email is received; success appears only after permissions are restored.
- 群内 @ 正确成员；成功、最终失败和超时清理其提醒。 / The exact member is mentioned; terminal outcomes clean up that reminder.
- 已有站点、证书续期和备份不受影响。 / Existing sites, certificate renewal and backups remain healthy.

## 备份与更新 · Backup and updates

```sh
docker compose -p email-guard exec -T postgres pg_dump -U guard guard > backup.sql
# 仅向空数据库恢复 / Restore into an empty database only
docker compose -p email-guard exec -T postgres psql -U guard guard < backup.sql
```

备份包含个人数据，安全保存且不要提交。迁移 `db/001.sql` 在启动时执行；更新前备份数据库和配置。保留上一版镜像及前端构建，用于回退应用；数据库回退需单独评估。

Backups contain personal data and must stay private. `db/001.sql` runs at startup. Back up configuration and the database before upgrades, and retain the previous image/frontend build for application rollback. Evaluate database rollback separately.
