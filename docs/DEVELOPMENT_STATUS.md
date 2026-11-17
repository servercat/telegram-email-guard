# 开发状态与验收 · Development status & validation

更新 / Updated: 2026-11-17 (Asia/Shanghai)

## 已验证 · Verified

| 项目 / Check | 结果 / Result | 证据范围 / Scope |
|---|---|---|
| TypeScript + Vite | 通过 / Pass | 本地构建 / Local build |
| 自动测试 / Automated tests | 28 通过 / Pass | initData、OTP、CAPTCHA、消息清理 / Authentication, OTP, CAPTCHA, cleanup |
| 演示 API / Demo API | 8 场景通过 / Scenarios passed | 历史本地检查，无真实发信 / Prior local checks, no real delivery |
| Mini App 浏览器 / Browser flow | 通过 / Pass | 邮箱错误、发送、OTP 错误、成功及恢复轮询 / Error, send, OTP and restore polling |
| PostgreSQL + HTTPS | 已部署并健康 / Deployed and healthy | 生产运行检查 / Production health |
| Resend | 真实邮件已收到 / Real email received | 所有者确认 / Owner confirmation |
| Telegram 核心流程 / Core flow | 普通账号全流程通过 / Regular-account flow passed | 所有者确认 / Owner confirmation |
| reCAPTCHA v2 | Telegram 内测试通过 / Passed in Telegram | 2026-11-17 所有者确认及手机截图 / Owner confirmation and mobile screenshot |
| Widget 设计 / Design | 7 态 × 2 主题 / States and themes | 浏览器桥接桩，非原生支持认证 / Browser bridge stub only |

真实核心流程包括入群、私聊入口、Mini App、邮件验证码、OTP 确认及群发言权限恢复。截图来源见[设计图册](design/README.md)。

The real core flow covers joining, private-chat entry, Mini App, email delivery, OTP confirmation and restored group permissions. See the [gallery](design/README.md) for screenshot provenance.

## 已实现 · Implemented

- 统一 React/CSS/SVG 界面，7 种 Widget 状态、15 种 Mini App 状态，额外的人机验证前置页面。 / Shared React/CSS/SVG UI, seven Widget states, fifteen Mini App states and a CAPTCHA gate.
- 原始 initData 校验、会话所有权、OTP HMAC、重发失效、服务端额度与时限控制。 / Raw initData validation, session ownership, hashed OTPs, invalidation and backend limits.
- reCAPTCHA 域名、时间与结果校验；token 摘要去重；管理员重置时清除通过标记。 / CAPTCHA hostname/age/result checks, token digest deduplication and reset handling.
- 按用户 ID 提及的中英文欢迎消息；成功、最终失败或总时限结束时清理已跟踪的群提醒。 / Bilingual user mentions and tracked-reminder cleanup on terminal outcomes.
- 官方 web_app 入口、恢复本人会话、管理员操作和后台重试。 / Official Mini App entry, owned-session resume, admin actions and retries.
- 邮件故障不增加用户错误次数，并暂停该会话的惩罚截止时间。 / Mail outages do not add wrong attempts and pause the session's punitive deadline.

## 明确限制 · Known limitations

1. 当前 Bot 的原生 `sendWidget` 返回 `INPUT_MEDIA_WIDGET_NOT_ALLOWED`。图片引导卡片和官方按钮已在生产使用；原生模板仅完成浏览器预览和桥接桩测试。 / Native Widgets are rejected for the current Bot; production uses the image/button fallback. Native templates have browser/stub testing only.
2. 完整统一业务状态机、全面事件审计、持久化 outbox、自动数据保留清理尚未完成。 / A strict unified FSM, comprehensive auditing, durable outbox and retention cleanup remain incomplete.
3. Webhook update 去重不等于外部操作恰好一次；崩溃与网络超时仍可能需要人工核查。 / Update deduplication does not guarantee exactly-once external actions.
4. 管理员将成员权限改为与 Bot 限制完全相同的值时，仅凭快照无法确定操作意图。 / A snapshot cannot infer admin intent when permissions exactly match the Bot's restriction.
5. 未完成 Android/iOS/Desktop/Web 全客户端矩阵及大规模负载、灾难恢复验收。 / Full client-matrix, load and disaster-recovery validation are outstanding.
6. 部分界面和群文案双语，尚无完整 UI 语言切换。 / Selected UI and messages are bilingual; full language switching is outstanding.

## 后续方向 · Roadmap

- 持久化外部操作队列与失败告警。 / Durable external-action queue and failure alerts.
- 数据保留、完整审计与任务清理。 / Retention policy, complete audits and job cleanup.
- 原生 Widget 可用性复测与跨客户端验收。 / Native Widget availability checks and cross-client testing.
- 完整多语言界面和更广泛的集成测试。 / Full UI localization and broader integration tests.

## AI Agent 部署工具 · Deployment helper

新增 scripts/deploy.mjs：配置初始化、预检、测试构建、Compose 部署、HTTPS 健康检查及 Telegram Webhook/菜单设置。初始化及缺失配置保护已通过自动测试；尚未在全新 VPS 上完成一键部署端到端验收。现有生产服务未因本次文档与工具发布而重新部署。

The deployment helper covers initialization, preflight, tests/build, Compose, HTTPS health and Bot webhook/menu configuration. Automated tests verify initialization and incomplete-config protection. A fresh-VPS end-to-end deployment remains untested. This documentation/tool release does not redeploy the existing production service.

## 入群系统消息清理 · Join service-message cleanup

新增记录 Telegram new_chat_members 消息 ID；验证成功、最终失败或超时后与欢迎提醒分别删除，并独立重试。chat_member 先到时，后到的系统消息会补关联已有会话。多人共用一条入群消息时，首个终态会话可删除整条系统消息，不影响其他人的专属验证提醒。旧消息未保存 ID，不能自动回溯；删除仍受 Telegram 权限及时间限制。

Join service-message IDs are persisted and independently deleted/retried with terminal welcome cleanup. Late service updates attach to an existing session. A multi-member service message may be removed when the first linked session finishes; other members retain their individual verification reminders. Historical untracked messages cannot be recovered automatically; Telegram deletion permissions/time limits still apply.

## 入群系统提示立即删除 · Immediate join-notice deletion

入群系统消息现在在 Webhook 收到时立即删除，位于会话验证和成员类型判断之前；不等待验证成功、失败或超时。独立数据库队列在删除失败时重试，覆盖多人、机器人及无验证会话的入群通知。已有会话中记录的未删除系统消息也会立即补清理。专属验证提醒仍在终态清理。

Join service messages are now deleted immediately on receipt, before session/member checks, independent of verification outcomes. A separate persistent queue retries failures, including multi-member/Bot joins and notices with no verification session. Previously tracked notices are retried immediately. Personal verification reminders retain terminal-state cleanup.
