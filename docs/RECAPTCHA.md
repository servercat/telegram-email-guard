# reCAPTCHA 配置 · reCAPTCHA setup

使用 Google reCAPTCHA **v2 “我不是机器人”复选框**。Mini App 在显示邮箱表单前执行验证；后端拒绝未通过校验会话的发送和重发请求。

Use Google reCAPTCHA **v2 “I'm not a robot” checkbox**. The Mini App verifies the user before showing the email form. The backend rejects send/resend requests from unverified sessions.

## 注册与启用 · Registration and activation

1. 打开 [Google reCAPTCHA 管理台](https://www.google.com/recaptcha/admin/create)，输入标签，选择 v2 复选框。 / Open the admin console, set a label and select the v2 checkbox.
2. 域名填写实际 Mini App 主机名，例如 `verify.example.com`，不加 `https://` 或路径。 / Register the exact hostname without a scheme or path.
3. 设置下列环境变量，并重建/重启 app。 / Set the variables below, then rebuild/restart app.

```dotenv
RECAPTCHA_ENABLED=true
RECAPTCHA_SITE_KEY=YOUR_PUBLIC_SITE_KEY
RECAPTCHA_SECRET_KEY=YOUR_SERVER_ONLY_SECRET
RECAPTCHA_HOSTNAME=verify.example.com
```

Site Key 可以传给前端；Secret Key 只保存在服务端。已启用但缺少密钥时，服务器拒绝启动。

The Site Key is public; the Secret Key stays on the server. Startup fails when enabled without keys.

## 校验 · Verification

- 后端 POST Google `siteverify`，校验 success、精确域名与两分钟时间窗口。 / Backend POSTs to Google siteverify and checks success, exact hostname and the two-minute age window.
- 数据库保存 token 摘要以阻止跨会话重复消费。 / Database token digests prevent reuse across sessions.
- 通过标记保存在当前会话；管理员 reset 会清除。 / The pass marker belongs to the session and is cleared on admin reset.
- 加载失败、过期或连接故障显示重试反馈，不能绕过后端发信门槛。 / Loading, expiry and network failures offer retry feedback without bypassing the mail gate.
- Caddy 示例 CSP 已包含 Google/gstatic 的脚本及 frame 来源；自定义 CSP 需同步放行。 / The Caddy example permits Google/gstatic scripts and frames; custom CSPs must do the same.

## 验收 · Validation

2026-11-17 已部署，所有者在 Telegram 手机客户端完成人机验证并确认流程正常。真实入口截图见[设计图册](design/README.md)。自动测试另覆盖响应异常、错误域名、过期/未来时间和上游网络故障。

Deployed and tested successfully by the owner in the Telegram mobile client on 2026-11-17. See the [gallery](design/README.md). Automated tests cover invalid responses, wrong hostnames, expired/future timestamps and upstream network failures.

参考 / References: [Display](https://developers.google.com/recaptcha/docs/display), [Server verification](https://developers.google.com/recaptcha/docs/verify).
