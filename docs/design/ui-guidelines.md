# Email Guard 组件规范 · Component guidelines

视觉基准：用户提供的两张 Telegram 邮箱验证参考图。实现采用 HTML、CSS 和内联 SVG，没有将参考图片用作页面背景。源文件为 `src/tokens.css`、`src/styles.css`、`src/icons.tsx`、`src/components.tsx`。设计图先于交互接入导出；最终截图使用同一套组件。

## 设计令牌

|用途|浅色|深色|
|---|---|---|
|页面背景|#F3F4FC|#111525|
|卡片|#FFFFFF|#1C2237|
|主文字|#20264E|#EEF0FF|
|辅助文字|#7D83A2|#A0AAC9|
|主色|#6658ED|#A99CFF|
|边框|#E2E5F6|#343D5A|
|成功|#12B875|配合深绿底|
|警告|#FF922E|配合深棕底|
|错误|#F14B69|配合深红底|

主按钮为 #8671FF → #6054FF 渐变。字体为系统字体、PingFang SC、Microsoft YaHei，Mini App 标题 24px/600，Widget 标题 19px/700，正文 12–14px，说明 9–11px。系统字体避免 Widget 外部字体请求。

## 组件

|组件|尺寸和行为|
|---|---|
|Brand|33px 蓝色品牌底 + 白色纸飞机；产品名和安全标识|
|Hero|96px 内联 SVG，145px 展示区；信封、盾牌、成功、时钟、警告、齿轮、加载|
|PrimaryButton|Mini App 48px；Widget 43px；圆角 12–13px；提交中禁用|
|SecondaryButton|31px；1px 边框；与主按钮分层|
|EmailField|48px；12px 圆角；聚焦描边；错误红色；提交时禁用|
|OtpInput|单个真实输入覆盖六个视觉格；数字键盘、粘贴、退格、自动填充；无六次独立焦点跳转|
|Steps|三段进度；完成段显示激活色；文本保留步骤含义|
|Timer|后端时间戳计算；不以客户端倒计时决定权限|
|Feedback|绿/橙/红提示；网络和系统错误独立于用户错误次数|
|MiniCard|最大 390px；24px 圆角；24–26px 内边距；移动端铺满视口|
|WidgetCard|最大 352px；20–22px 圆角；在 320px 宽度下保持高度低于 600px|

间距使用 4、8、12、16、24、32px。阴影轻微、避免过多滤镜。页面进入动画 250ms，点击反馈 160ms；支持 prefers-reduced-motion。布局使用 dvh、Telegram 稳定视口和安全区域。实际 Telegram 顶栏由客户端提供，移动端不重复绘制。

## 状态契约

Widget 七态在 `widgetCopy` 中定义；Mini App 十五态由 `MiniCard` 统一渲染。`SUCCESS` 仅对应 `UNMUTED`；`UNMUTE_PENDING/UNMUTE_RETRY` 对应 `RESTORING`。验证码过期不增加尝试次数；服务失败显示系统错误。生产数据以 API 结果为准。

## Widget 沙盒版本

`public/widget.html` 是独立、内联 CSS/JS/SVG 文档；不包含输入框、外部资源或网络 API。它通过 `TelegramWidget.request('refresh'|'open')` 通信，读取 `chatData` 并监听 `chatDataChanged`。Bot 以 `editMessageWidgetData` 更新数据。开始按钮通过 Bot 发送官方 `web_app` 按钮，不使用普通网页导航。

Widget 的压缩大小、输入控件与网络 API 约束由自动测试检查。浏览器中的 Widget 预览不是 Telegram QuickJS 沙盒认证，最终仍需真实客户端测试。

## 截图

`widget-main.png`、`widget-states.png`、`miniapp-email.png`、`miniapp-otp.png`、`miniapp-success.png`、`miniapp-error.png` 为实际渲染设计稿。`screenshots/` 保存状态单图的浅/深色版本。`overview.png` 是完整总览。状态截图是设计快照，真实流程截图另行标记。

## English specification

The UI is rebuilt with HTML, CSS and inline SVG. Reference images are not page backgrounds. Blue-purple primary gradients, green success, orange warning and red error colors apply across light/dark themes. Components share 4/8/12/16/24/32px spacing, rounded cards and system fonts.

| Component | Specification |
|---|---|
| Primary button | Mini App 48px; Widget 43px; disabled while submitting |
| Email field | 48px height; 12px radius; focus and error outlines |
| OTP input | One actual input with six visual cells; numeric keyboard and paste support |
| MiniCard | Up to 390px; 24px radius; mobile viewport layout |
| WidgetCard | Up to 352px; 20–22px radius; compact status display |
| Timer | Derived from server timestamps; never decides permissions locally |
| CaptchaGate | Shared card/hero/timer; Google light/dark checkbox; compact mode on narrow screens |

Entry animation is 250ms; interaction feedback is 160ms with reduced-motion support. SUCCESS requires confirmed UNMUTED. CAPTCHA is a shared gate rather than a separate unrelated form. The native Widget is fully inline and uses Bot bridge requests, with no input fields or network APIs. Native delivery is currently rejected for the deployed Bot; see the gallery for the image/button fallback.
