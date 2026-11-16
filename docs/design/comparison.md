# 设计对照 · Design comparison

|检查项|实际实现|结论|
|---|---|---|
|蓝紫品牌主色|渐变按钮、品牌标识、轻色背景|符合|
|盾牌、信封和状态图标|SVG 重绘；统一立体渐变|符合，未使用参考图素材|
|Widget 七态|独立标题、说明、图标、动作、三阶段进度|已覆盖|
|Mini App 邮箱和 OTP|移动端卡片、六格验证码、错误与倒计时|已覆盖|
|成功、过期、系统异常差异|绿、橙、红、灰独立配色|已覆盖|
|权限恢复中|单独等待状态；不提前宣称可发言|按任务书修正参考图文案|
|Widget 中无输入框|生产内联 Widget 无任何输入控件|自动检查通过|
|Widget 开始操作|请求 Bot 发送官方 web_app 按钮|为沙盒限制采用兼容方案|
|深色主题|全部状态有深色截图；读取 Telegram 主题|浏览器覆盖，真实 Telegram 待测|
|装饰与留白|保留柔和卡片和少量碎片，简化参考图的大型 3D 装饰|同一视觉风格，非逐像素复制|

PNG 来自实际 DOM 渲染。Moli 的部分符号字形和透明输入可见性判断与完整 Chromium 存在差异，不能以浏览器截图替代 Telegram 客户端验收。

## English comparison

| Requirement | Implementation |
|---|---|
| Blue-purple visual language | Shared gradients, rounded cards and SVG brand icons |
| Seven Widget states | Distinct status copy, icons and actions in shared components |
| Email and OTP UI | Mobile cards, six-cell OTP input, cooldown/error/expiry feedback |
| Permission restoration | Separate waiting state; success only after Telegram confirmation |
| Light/dark themes | Telegram theme integration and browser screenshots |
| CAPTCHA before email | Shared gate plus backend enforcement; owner tested in Telegram |
| Native Widget sandbox | Inline template with bridge requests; no inputs/network calls |
| Current production entry | Branded guide image plus official Mini App button fallback |

Design exports and state screenshots are browser DOM renders. They show the intended component design, not native Widget availability. The owner confirmed the real Telegram email/permission flow and the later CAPTCHA flow. Full multi-client certification remains outstanding.
