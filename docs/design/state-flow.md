# 页面状态流转 · Page state flow

```mermaid
stateDiagram-v2
    [*] --> CAPTCHA: bootstrap / captchaRequired
    CAPTCHA --> EMAIL: server verification passed
    CAPTCHA --> CAPTCHA: expired / retry
    CAPTCHA --> TIMEOUT: total deadline
    [*] --> EMAIL: CAPTCHA disabled or already passed
    EMAIL --> EMAIL_ERROR: 邮箱格式错误
    EMAIL_ERROR --> SENDING: 修正邮箱后提交
    EMAIL --> SENDING: 发送验证码
    SENDING --> SENT: API 发送成功
    SENDING --> SYSTEM_ERROR: 邮件服务不可用
    SENT --> OTP: 输入验证码
    OTP --> VERIFYING: 六位验证码提交
    VERIFYING --> OTP_ERROR: OTP_INVALID
    OTP_ERROR --> VERIFYING: 再次提交
    VERIFYING --> MAX_ATTEMPTS: 错误次数达到上限
    VERIFYING --> RESTORING: OTP 正确 / UNMUTE_PENDING
    RESTORING --> RESTORING: 权限恢复失败，后台重试
    RESTORING --> SUCCESS: Telegram 确认 / UNMUTED
    OTP --> OTP_EXPIRED: 验证码有效期结束
    OTP_EXPIRED --> RESENDING: 冷却结束且发送额度足够
    OTP --> RESENDING: 重新发送
    RESENDING --> SENT: 新验证码发送成功
    RESENDING --> SYSTEM_ERROR: 服务异常
    EMAIL --> TIMEOUT: 总验证时限结束
    OTP --> TIMEOUT: 总验证时限结束
    EMAIL --> NETWORK_ERROR: 网络请求失败
    OTP --> NETWORK_ERROR: 网络请求失败
    NETWORK_ERROR --> EMAIL: 重新查询会话
    SYSTEM_ERROR --> EMAIL: 服务恢复后查询会话
    SUCCESS --> [*]: Telegram.WebApp.close
```

重试实际通过 `stateFromSession` 返回后端当前阶段，不固定返回邮箱页。超时和错误次数上限进入持久化权限处理；不得在 Telegram 未确认前宣称永久禁言或恢复发言成功。

|Widget 状态|Mini App / 业务状态|
|---|---|
|WAITING|EMAIL / WAITING_FOR_EMAIL|
|OTP_SENT|SENT、OTP、OTP_ERROR、OTP_EXPIRED、RESENDING|
|VERIFYING|VERIFYING|
|VERIFIED|RESTORING 或 SUCCESS，以真实权限状态显示不同文案|
|EXPIRING|总时限不足三分钟且未完成|
|EXPIRED|TIMEOUT 或 MAX_ATTEMPTS；联系管理员|
|SYSTEM_ERROR|NETWORK_ERROR 或 SYSTEM_ERROR；刷新重试|

## English notes

The CAPTCHA gate precedes email entry when enabled. Failed or expired challenges stay on the gate and can be retried. Email/OTP UI states share the same session model. Only UNMUTED maps to SUCCESS; pending or retrying permission restoration maps to RESTORING. OTP expiry does not add wrong attempts. Network/system retries retrieve the current server state, rather than resetting the flow. Widget states describe presentation; they do not prove native Widget availability.
