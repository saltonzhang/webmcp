# WebMCP 回归测试

这是 Helix WebMCP 测试页的团队回归用例库及轻量执行器。

[`AGENTS.md`](AGENTS.md) 是 Codex 的项目级操作规则。所有自然语言探索和自动化回归都必须遵守它；默认用例不会提交最终下注或扣减测试余额。

## 环境配置

测试环境地址和允许的 origin 统一维护在 [`config/environments.json`](config/environments.json)。这是版本化的非敏感配置：修改环境时只改此文件，不要把地址分散写在用例和脚本中。

当前环境：

| 环境名 | 站点地址 | WebMCP 覆盖范围 |
| --- | --- | --- |
| `test1` | `https://www-test1-br.helix.city/` | 全站 |
| `dev` | `https://matchday.helix.city/` | 全站 |

每个环境包含：

- `origin`：relay 允许注册工具的站点来源；
- `baseUrl`：环境站点根地址；
- `webmcpScope`：站点接入范围；当前两个环境均为 `site-wide`；
- `kind`：执行器只允许 `development`、`test` 或 `staging`，拒绝 `production`。

本机 Codex relay 仍需配置一次；`--widget-origin` 的值必须与所选环境的 `origin` 一致：

```toml
[mcp_servers.webmcp-local-relay]
command = "npx"
args = ["-y", "@mcp-b/webmcp-local-relay@5.1.0", "--widget-origin", "https://www-test1-br.helix.city"]
```

运行前，在浏览器打开该用例的 `pagePath` 对应页面，并确认 `webmcp_list_sources` 与 `webmcp_list_tools` 能看到该页面。环境不再指定单一 WebMCP 路由：每个用例声明自己需要验证的页面。

> 账号、密码、Token 等敏感内容只放在本机 `.env`，不要写入 `environments.json` 或提交到 Git。

## 执行用例

```bash
# 执行默认用例，默认环境为 test1
npm test

# 指定用例
npm run test:case -- cases/WEBMCP-BET-001.json

# 指定环境
npm run test:case -- cases/WEBMCP-BET-001.json --env test1
```

执行器会读取环境配置，确认连接的 WebMCP 页面 origin 符合预期，自动发现当前动态工具名，按顺序调用工具并执行断言。每一步会输出通过或失败；任何断言失败时进程以非零状态退出。

## 用例格式

每个 JSON 用例包含唯一 ID、标签、`pagePath`、前置条件、按顺序排列的 WebMCP 调用，以及预期结果：

- `expect`：对点路径做精确校验，例如 `slip.stake: 100`；
- `contains`：校验数组中包含指定的部分对象，例如市场 `m1` 的赔率和状态。

参见 [WEBMCP-BET-001.json](cases/WEBMCP-BET-001.json)：它目前仍是 Demo 页的兼容性用例，验证 Flamengo 胜、赔率 2.10、下注额 100 的下注单准备过程，但不提交最终订单。后续真实全站用例应按业务页面分别声明 `pagePath`，例如赛事详情、下注单、钱包或订单页。

自然语言探索规范见 [WebMCP 探索规则](docs/webmcp-exploration-policy.md)。

## 自然语言执行

除回归用例外，同事可以直接向 AI 发出业务指令。例如：

```text
在 test1 找 Flamengo vs Palmeiras 的 Flamengo 胜，赔率必须为 2.10，下注单设置为 100，但不要提交。
```

AI 会按 [`AGENTS.md`](AGENTS.md) 读取当前页面的 WebMCP 工具，先查询市场与状态，再使用业务 ID 组单和核验结果。涉及最终下注、撤单、Cashout、结算或余额变更时，AI 必须在执行前展示影响并等待确认。

完整规则与示例见 [自然语言执行规范](docs/natural-language-execution.md)。
