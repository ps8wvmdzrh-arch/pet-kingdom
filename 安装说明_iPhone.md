# 虹光宠物（Pet Kingdom Rainbow）iPhone 上机说明

产物：`PetKingdom-unsigned.ipa`（1.49 MB，arm64，未签名）
仓库：https://github.com/ps8wvmdzrh-arch/pet-kingdom
构建记录：GitHub Actions「Build unsigned iOS IPA」第 44723423064 号，macos-15-intel，耗时 3m33s，结论 success

---

## 路线 A：免签名，1 分钟就能玩（推荐先试这条）

网页版已挂在 GitHub Pages 上，和 IPA 里是同一份代码、同一套内容：

1. iPhone 用 **Safari** 打开：https://ps8wvmdzrh-arch.github.io/pet-kingdom/
2. 点底部「分享」→「添加到主屏幕」，桌面就会出现「虹光宠物」图标，全屏、无地址栏，和装好的 App 手感一致
3. 存档存在 Safari 本地，删除主屏幕图标不会丢进度

## 路线 B：把 IPA 装成真正的 App（需要自己签名）

IPA 是**未签名**的（云端构建没有你的开发者证书），iOS 不允许直接安装，必须用工具用你的 Apple ID 现场签一次。Windows 上最省事的是 **Sideloadly**（免费）：

1. 电脑装 Sideloadly：https://sideloadly.io （也要 iTunes 或 Apple 驱动，Windows 版 iCloud 装一次即可）
2. iPhone 用数据线连电脑，手机上点「信任此电脑」
3. 打开 Sideloadly，把 `PetKingdom-unsigned.ipa` 拖进窗口
4. `Apple ID` 填你自己的 Apple ID（普通免费账号就行，不需要 99 美元开发者账号）
5. 点 **Start**，按提示输入 Apple ID 密码（有的账号还要在手机上点一次双重认证）
6. 装好后去 iPhone「设置 → 通用 → VPN 与设备管理 → 开发者 App」，点你的 Apple ID →「信任」
7. 桌面出现「虹光宠物」，点开即玩

注意事项（都是免费签名的硬规则，不是这个包的问题）：
- 免费 Apple ID 签出来的 App **有效期 7 天**，到期打不开，重新用 Sideloadly 签一次即可（存档在 App 内，重签覆盖安装不会清掉）
- 同一个免费账号最多同时签 3 个 App、10 个 App ID
- 若 Sideloadly 报 `Unable to install`，先把 IPA 改成一个没有中文、空格的名字再拖进去；仍失败就看它的错误码（常见是 `-22421`，多为账号或驱动问题）
- 没有 Windows 电脑的话，可用 **AltStore / SideStore**（需在同网段电脑跑 AltServer）或 **ESign**（需自备证书）走同样流程

## 路线 C：有 Mac 的话最干净

在 Mac 上打开 `ios/PetKingdom.xcodeproj`（或先 `brew install xcodegen && cd ios && xcodegen generate`），Signing 里选自己的 Team，连上 iPhone 直接 Run，效果和 IPA 一样，也是 7 天有效（免费账号）。

---

## 这个 App 里是什么

- 玩法骨架对齐 2011 年那款 J2ME 宠物收集 RPG：五选一初始宠、草丛遇敌、回合制技能、精灵球捕捉、图鉴、牧场、蛋孵化、BOSS、地图传送、主线任务
- 54 种宠物、7 张地图、原创主线「灰烬之环抽取虹光」
- **美术、角色造型、对白、地图布局全部原创**，没有复用原版素材，宠物形象和名字也都换了
- 竖屏全屏、无状态栏，WKWebView 内嵌单文件网页（`Payload/PetKingdom.app/index.html`，95 KB）

## 想改东西怎么办

1. 改 `game.js` / `art.js` / `index.html`
2. 跑 `node tools/inline.js` 重新生成 `ios/PetKingdom/Web/index.html`
3. `git commit && git push`，Actions 会自动重新出 IPA（3~4 分钟）
4. 网页版同步更新（Pages 自动重新发布）

---

### 这一版（v3 深度养成版）多出来的内容

- 图鉴 61 种、五维属性、星级、天赋（决定进化次数）、个体值、亲密度
- 菜单里的「宠物图鉴 / 进化 / 坐骑 / 秘传商人」四个新页面
- 坐骑：Lv20 以上终体宠可骑，海洋系能走水面、飞羽系可飞行、全体遇敌率 -50%
- 地图改为四向网状互通，不用再一路往上走
- 夜间才会出现的隐藏宠（夜影狐 / 暮翼魔 / 虹鳞圣龙）
