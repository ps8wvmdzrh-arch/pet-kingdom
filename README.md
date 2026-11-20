# 虹光宠物物语 · Rainbow Pet Saga

一个**可以在 iPhone 上玩**的宠物收集养成 RPG。玩法结构对齐《宠物王国》系列的经典框架（五系宠物、城镇出发、一路打干部、最后挑战幕后黑手、图鉴/牧场/孵化/商店），但**剧情、角色、地图、美术、宠物形象全部为原创**，不含任何原版素材。

游戏用 Canvas 全程序化绘制，零图片资源；既能直接在 iPhone Safari 里玩，也能打包成 iOS App（含云端出 IPA 的完整流程）。

---

## 一、目录结构

```
pet-kingdom-rainbow/
├─ index.html                  游戏入口（网页版，外链 art.js/game.js）
├─ art.js                      程序化美术（宠物/角色/精灵球/蛋）
├─ game.js                     游戏主逻辑（54 种宠物、7 张地图、剧情、战斗、存档）
├─ icon.png                    1024×1024 图标
├─ start-server.ps1            Windows 一键起本地服务（手机同 WiFi 访问）
├─ ios/                        Xcode 工程（SwiftUI + WKWebView）
│  ├─ project.yml              XcodeGen 工程描述，一条命令生成 .xcodeproj
│  └─ PetKingdom/
│     ├─ PetKingdomApp.swift
│     ├─ ContentView.swift     WKWebView 全屏载入本地网页
│     ├─ Info.plist            竖屏、全屏、隐藏状态栏
│     ├─ Assets.xcassets/AppIcon.appiconset/   全套 iPhone 图标
│     └─ Web/index.html        单文件版游戏（art.js / game.js 已内联）
├─ tools/inline.js             把三个网页文件内联成单文件（改完游戏跑一遍）
├─ tools/check-build-ready.ps1 推 GitHub 前自检构建文件是否齐全
├─ .github/workflows/build-ios-ipa.yml   云端出未签名 IPA
└─ README.md
```

---

## 二、最快上手：用 iPhone 直接玩（无需 Mac、无需签名）

1. Windows 电脑装好 Python 3（`python --version` 能出版本即可）。
2. 项目目录执行：

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\start-server.ps1
   ```

   脚本会打印形如 `http://192.168.1.23:8080` 的地址。
3. **手机和电脑连同一个 WiFi**，iPhone 用 Safari 打开这个地址。
4. 想更像 App：Safari 底部「分享」→「添加到主屏幕」，之后从桌面图标全屏启动。

> 打不开时：检查电脑防火墙是否放行 8080；或改用 `python -m http.server 8080`。公司/校园网常隔离设备互访，可让电脑连手机热点再试。

---

## 三、云端出「未签名 IPA」（不用 Mac）——完整步骤

原理：GitHub 提供免费的 macOS 构建机，用 `xcodebuild` 把工程编译成 `.app`，塞进 `Payload/` 打成 `.ipa`，你下载后自己签名安装。

### 第 1 步：把项目传上 GitHub

先跑一次自检（可选，能提前发现漏文件）：

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\check-build-ready.ps1
```

**方式 A：GitHub Desktop（推荐，Windows 上最省事）**

1. 下载安装 [GitHub Desktop](https://desktop.github.com/)，登录 GitHub 账号。
2. 菜单 `File → Add local repository` → 选择**解压后的 `pet-kingdom-rainbow` 目录**（必须是包含 `ios/` 和 `.github/` 的这一层）。
3. 它会提示「这个目录还不是 Git 仓库」→ 点 **create a repository** → 直接 **Create repository**。
4. 右上角 **Publish repository**，名字随意（如 `pet-kingdom`），**不要勾 Private**（Public 免费用 macOS 构建额度），发布。
5. 关键检查：仓库网页上能看到 `.github/workflows/build-ios-ipa.yml` 这个文件。看不到就是上传层级错了。

**方式 B：纯网页上传（不想装软件）**

1. GitHub 新建仓库（Public）。
2. 在仓库页 `Add file → Upload files`，把 `ios` 文件夹、`index.html`、`art.js`、`game.js`、`icon.png`、`README.md`、`start-server.ps1`、`tools` 文件夹**整体拖进去**（拖文件夹会保留子目录）。
3. 浏览器上传常常会漏掉以 `.` 开头的隐藏目录，所以 workflow 手动建：仓库页 `Add file → Create new file`，文件名填

   ```
   .github/workflows/build-ios-ipa.yml
   ```

   （输入 `/` 会自动建目录），内容直接复制本仓库里 `.github/workflows/build-ios-ipa.yml` 的全文，提交。

**方式 C：装了 Git 的命令行**

```powershell
cd <解压目录>
git init
git add .
git commit -m "pet kingdom ios"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

### 第 2 步：跑构建

1. 打开仓库 **Actions** 标签页（第一次会提示启用 workflows → 点 **I understand my workflows, go ahead and enable them**）。
2. 左侧选 **Build unsigned iOS IPA** → 右侧 **Run workflow** → 分支选 `main` → **Run workflow**。
3. 等 5–10 分钟。绿色对勾 = 成功；红色叉 = 失败，点进日志看最后一屏报错（对照下面「常见报错」）。
4. 成功后在这次运行页面底部 **Artifacts** 下载 `PetKingdom-unsigned-ipa.zip`，解压得到 `PetKingdom-unsigned.ipa`。

### 第 3 步：把 IPA 装进 iPhone（自签）

**Windows：Sideloadly（最常用）**

1. 装 [iTunes](https://www.apple.com/itunes/)（提供驱动）和 [Sideloadly](https://sideloadly.io/)。
2. 数据线连 iPhone，信任此电脑。
3. Sideloadly 里拖入 `PetKingdom-unsigned.ipa`，`Apple ID` 填自己的 Apple ID（免费账号即可），点 Start。
4. 首次安装后去 **设置 → 通用 → VPN与设备管理** 信任你的开发者证书。
5. iOS 16 及以上还需 **设置 → 隐私与安全性 → 开发者模式** 打开并重启一次。

**备选**：爱思助手（工具箱 → IPA 签名/安装）、Mac 上的 AltStore / SideStore / Xcode Devices 窗口。

> 免费 Apple ID 签名的 App **7 天过期**（过期打开会闪退），重签一次即可；**存档在同一 App 内，重签覆盖安装通常保留**，别删 App。

### 常见报错对照

| 日志关键词 | 原因 | 处理 |
| --- | --- | --- |
| `xcodegen: command not found` | brew 装失败 | 重跑一次 workflow；或把 workflow 里 `brew install xcodegen` 换成 `brew install xcodegen --quiet` |
| `Could not find specification for target` / `project.yml` 解析错 | 仓库里 `ios/project.yml` 被改动或编码被改 | 用仓库原始内容覆盖，保持 UTF-8 |
| `No such file or directory: .../index.html` | `ios/PetKingdom/Web/index.html` 没上传或被漏掉 | 本地跑 `node tools/inline.js` 重新生成后提交 |
| `Code signing is required` | xcodebuild 参数被改动 | 确认命令带 `CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO` |
| `Asset catalog ... app icon` 警告 | 图标尺寸缺失 | 忽略警告即可；已提供 40/58/60/80/87/120/180/1024 全套 |
| 构建成功但装上白屏 | 装的是空壳（IPA 里没有 index.html） | 解压 IPA 看 `Payload/PetKingdom.app/index.html` 是否存在 |
| 手机「无法验证 App」 | 未信任证书/未开开发者模式 | 按第 3 步第 4、5 条 |

### 费用说明

- **Public 仓库**：GitHub 免费额度足够，一次构建约 4–6 分钟。
- **Private 仓库**：每月 2000 分钟免费额度，macOS 按 **10 倍**计费（一次约 40–60 分钟额度），一个月能跑几十次。

---

## 四、有 Mac 时的本地路线

```bash
brew install xcodegen
cd ios && xcodegen generate
open PetKingdom.xcodeproj
```

Xcode 里选自己的 Apple ID 作为 Team（免费账号即可），选中真机运行。Bundle ID 冲突就把 `ios/project.yml` 里的 `PRODUCT_BUNDLE_IDENTIFIER` 改成 `com.你的名字.petkingdom`，重新 `xcodegen generate`。

---

## 五、玩法说明

- **移动**：左下角虚拟摇杆（按住持续走）/ 电脑方向键或 WASD。
- **菜单**：右下角「菜单」圆钮（电脑 `Enter`）。
- **目标条**：顶部显示主线目标；「菜单 → 任务」看进度与收集。
- **遇敌**：走出道路、踩到草地/洞穴地面会遇敌（城镇内不遇敌）。
- **战斗**：技能（8 级、16 级各解锁一个）、捕捉（血量越低成功率越高，高级球约 1.85 倍）、换宠、逃跑。干部与 BOSS 不能逃。
- **成长**：升级学技能；8 级、16 级各进化一次（图鉴编号变化）。
- **宠物蛋**：商店 150 金 / 宝箱获得，每走 **220 步**孵化。
- **牧场**：队伍满 6 只后，新捕获/孵化的进牧场。
- **存档**：自动存浏览器本地；「菜单 → 保存进度」手动存。清缓存/换机会丢档。

### 内容规模

| 项目 | 数量 |
| --- | --- |
| 宠物 | 54 种（五系各 3 族×3 阶 + 幽蚀 3 族 + 虹角兽 + 蚀王） |
| 地图 | 7 张：虹光镇 → 青草原 → 幽森 → 岩铁洞窟 → 熔岩火山 → 风羽高地 → 天空之塔 |
| 主线 | 镇长委托 → 调查员线索 → 三名干部 → 幕后「蚀王」→ 结局 |
| 系统 | 战斗 / 捕捉 / 进化 / 图鉴 / 牧场 / 商店 / 背包 / 任务 / 宠物蛋 / 宝箱 |

---

## 六、原创与法律说明

- 本项目**不包含**《宠物王国5 彩虹》的任何原始美术、音乐、地图数据、文本或宠物名称，也不分发原版 jar 或他人打包的 IPA。
- 结构上参考「宠物收集 RPG」通用类型范式（城镇出发、五系克制、干部战、图鉴收集），属于玩法类型层面。
- 角色名、对白、剧情冲突、地图布局、宠物形象与命名均为原创（镇长禾、调查员铃、老兵铎、干部锈/烬/影、蚀王；「灰烬之环」抽取宠物虹光的阴谋）。
- 仅限个人学习与自用，请勿以本项目名义冒充原版传播或售卖。
- 想玩**原版**，正规做法只有「自备合法 jar + App Store 上的 J2ME 模拟器（JarBox / Jemu）」，本项目不提供该途径的任何资源。

---

## 七、常见问题

**Q：Safari 打开黑屏/一直加载？**
A：`art.js`、`game.js` 必须和 `index.html` 同级。

**Q：改了游戏后，iOS 包里还是旧的？**
A：执行 `node tools/inline.js` 重新生成 `ios/PetKingdom/Web/index.html`，再提交；云端 workflow 也会自动跑这一步。

**Q：IPA 装了闪退？**
A：未签名必须自签；免费证书 7 天过期会闪退，重签即可；iOS 16+ 记得开开发者模式并信任证书。

**Q：能加音乐/音效吗？**
A：可以。`game.js` 的主循环里有 `ST.time`，接 WebAudio 后在 `frame()` 按状态切 BGM；iOS 要求首次点击后才能播（现在点「开始游戏」正好满足）。
