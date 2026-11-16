# 安全说明 · Security

## 配置保护 · Configuration protection

- 不提交 `.env`、Bot Token、Resend 密钥、reCAPTCHA Secret、SSH 私钥或数据库备份。 / Never commit production configuration, tokens, server secrets, private keys or backups.
- 使用 `.env.example` 提供占位配置；真实值由部署环境注入。不要使用 `VITE_` 变量保存密钥。 / Use placeholder examples and inject real values on the server. Never store secrets in `VITE_` variables.
- 如密钥误入公开提交，立即撤销并更换；删除文件不能撤销已泄露的访问权。 / Revoke and rotate exposed credentials; deleting a file does not revoke access.

## 已有控制 · Existing controls

原始 Telegram initData HMAC 校验、时间限制与会话所有权；OTP 使用随机数字和会话绑定 HMAC；reCAPTCHA 服务端校验、token 摘要去重；后端冷却/额度控制；管理员配置 ID 加真实群权限校验。

Raw Telegram initData validation, freshness and session ownership; random OTPs with session-bound HMACs; server-side CAPTCHA verification and digest deduplication; backend cooldown/quotas; configured admin IDs plus live group-admin checks.

## 数据与限制 · Data and limitations

生产数据库包含 Telegram 用户/群组 ID、邮箱原文和会话状态，应限制访问、保护备份并制定保留政策。公开 API 返回掩码邮箱，OTP 不以明文存储。全面审计与自动数据清理仍待完善，参见[开发状态](docs/DEVELOPMENT_STATUS.md)。

The database contains Telegram user/group IDs, raw email addresses and session state. Restrict access, protect backups and define retention policies. The public API masks email addresses and OTPs are not stored in plaintext. Comprehensive auditing and automated cleanup remain on the roadmap.

## 报告问题 · Reporting

如仓库提供 GitHub 私密漏洞报告入口，请使用该入口；否则通过维护者的私密联系渠道报告。不要在公开 Issue 中粘贴密钥或用户数据。

Use GitHub private vulnerability reporting if enabled, or contact the maintainer privately. Do not post credentials or personal data in public issues.
