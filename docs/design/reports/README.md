# 每日报告卡片组件 · Report card component

## 实现 / Implementation

复用 VPS 已安装的 Pillow + Noto Sans CJK，不新增浏览器或第三方依赖。组件位于 `deploy/reports/render.py`，`render_report(data, output)` 接收数据，内部统一字体、顶部锚点、固定几何布局，2倍分辨率绘制后抗锯齿输出 **1280×1170 RGB PNG**。图形、渐变、波浪和图标全部程序绘制，没有读取参考位图。参考图仅用于视觉比较。

Reuses the existing Pillow renderer and Noto CJK font. Layout is separate from normalization. Deterministic supersampling produces an opaque 1280×1170 PNG without reference-image compositing or daily AI generation.

## 数据接口 / Data interface

```json
{
  "report_start": "2026-11-17T14:40:00+08:00",
  "report_end": "2026-11-18T14:40:00+08:00",
  "total_users": 108,
  "passed_users": 2,
  "restricted_users": 106,
  "pass_rate": 1.85
}
```

人数必须为非负整数，比例由人数计算；传入 pass_rate 时必须一致。零人数为 0.00%。时间必须带时区，以 Asia/Shanghai 显示。兼容现有数据库输出字段 start/end/total/passed/restricted，不修改查询、数据库或验证流程。

Counts must be nonnegative integers. Rate is computed and optional supplied rate must match. Dates require timezone offsets. Legacy snapshot fields remain supported, so no query/database changes are required.

**口径差异：现有统计允许仍待验证的人，因此 passed+restricted 可以小于 total。** 不能将这些人算为已限制。组件在存在差额时显示待完成人数；无差额时隐藏，示例满足108=2+106。超过总人数则拒绝渲染。这个处理保留现有统计逻辑，不宣称新成员覆盖机器人未记录的入群事件。

Existing queries can include pending users. The component shows the pending difference rather than misclassifying them as restricted. Over-counts are rejected. This preserves current statistics and covers only recorded join sessions.

## 集成 / Integration

`deploy/reports/run.sh` 沿用现有16:00 systemd timer和Bot目标：prepare → render.py → send。每次使用独立临时目录，退出时清理本次 JSON/PNG 及容器临时文件；--preview 另保留 report-preview.png。失败会让任务非零退出，由 systemd journal记录。发送继续无 caption、防重复。

Existing scheduler and sendPhoto pipeline are preserved. Cleanup traps remove transient files, including on failure. Nonzero errors are recorded by systemd. Image-only delivery and deduplication remain unchanged.

## 验收 / Validation

- 示例108/2/106、零人数、999/123/876、9999/2345/7654已在VPS临时目录实际渲染。
- 三项 Python 测试覆盖动态输出尺寸/不透明RGB、非法计数/比例拒绝、带时区输入；现有Node测试独立运行。
- sample.png 为要求的示例，comparison.png为归一化参考图与结果并排，overlay.png为50%叠加。参考原图1312×1199，按要求归一到1280×1170再比较。
- 已检查中文统一字重和基线、长数字自适应字号、边界留白；可见差异仍有图标的3D质感与柔和光影，程序绘制未声称逐像素相同。
- 现有Bot已真实发送日报并获用户确认。本版只在临时目录生成预览，等待用户视觉确认后再切换生产模板/替换消息；未将渲染测试当成新版发送验收。

Real PNG fixtures, side-by-side and overlay comparisons are included. Remaining differences include 3D icon shading and subtle lighting. This version is staged for owner review, not yet switched into production or sent to the group.

## 生产确认 · Production approval

2026-11-18 所有者确认本版设计，并授权替换当日群报告。已启用为 VPS 每日16:00模板，沿用既有发送目标、统计口径与无caption模式。

Owner approved this design on 2026-11-18. Enabled as the daily 16:00 Asia/Shanghai VPS template, preserving statistics, destination and image-only delivery.
