# VPS 每日统计图 · Daily group report

每天北京时间 16:00 由 VPS systemd timer 运行，不依赖本地电脑或 Codex。使用 Pillow 和 Noto CJK 字体生成 PNG，通过现有 Bot 的 sendPhoto 发送；不发送个人信息。

A VPS systemd timer runs daily at 16:00 Asia/Shanghai, independently of the desktop. Pillow and Noto CJK render a PNG sent through the existing Bot. Reports contain aggregates only.

## 安装 · Installation

适用于 /opt/email-guard、现有 email-guard-app-1 容器以及单个配置群。其他目录或容器名需修改 run.sh。

Assumes /opt/email-guard, container email-guard-app-1 and one configured group. Adjust run.sh for other deployments.

```sh
sudo apt-get install -y --no-install-recommends python3-pil fonts-noto-cjk
# 更新 app，启动迁移创建 daily_reports 表 / Rebuild app to apply migration
sudo docker compose -p email-guard -f docker-compose.yml -f deploy/compose.server.yml up -d --build app
# 仅生成预览，不发送 / Preview only
sudo sh deploy/reports/run.sh --preview
sudo cp deploy/reports/email-guard-report.service deploy/reports/email-guard-report.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now email-guard-report.timer
sudo systemctl list-timers email-guard-report.timer
```

## 口径与防重 · Statistics and deduplication

固定前一天16:00到当天16:00，左闭右开，按群、按用户去重。任一会话 UNMUTED 视为通过；否则按最新会话归类，未结束单列。延迟执行取最近的16:00边界，状态以查询时数据为准，不是历史状态审计。首次生成的快照冻结在 daily_reports 中，避免同窗口重跑数据变化。

The window ends at the latest 16:00 Beijing boundary and spans 24 hours. Users are deduplicated per group. Any UNMUTED session counts as passed; otherwise the latest session determines the category. Statuses reflect query-time records. The first snapshot is stored immutably for that window.

发送前原子领取窗口，成功记录 Telegram message_id；发送结果不确定则进入 review，不自动重发，以免重复。服务器重启后补跑最近一个到期窗口，不补发全部历史日期。渲染输出在 /var/lib/email-guard-reports/。无待处理用户时通过率为0.00%。

An atomic claim prevents duplicate sends. Success stores the Telegram message ID. Uncertain sends enter review and require manual inspection. Persistent timers catch up the latest due window after downtime, not every missed day. Files live in /var/lib/email-guard-reports/.

```sh
sudo journalctl -u email-guard-report.service --since today
sudo systemctl disable --now email-guard-report.timer
```

人工补发须先检查群是否已收到，再由管理员将对应 daily_reports.state 重设为 ready。不要盲目重置 sending/review。勿对同一个群同时启用桌面自动任务与 VPS timer。

Before retrying sending/review records, inspect the group for delivery, then deliberately reset the appropriate row to ready. Do not enable both desktop and VPS schedulers for the same group.

已验证：时间窗口单元测试、TypeScript 检查、VPS真实数据库取数及中文PNG预览。首次定时群投递以生产运行结果为准。

Validated: window tests, TypeScript, real VPS database queries and a Chinese PNG preview. The first scheduled delivery still requires production confirmation.
