# GitHub Pages 部署说明

这个项目是纯静态页面，不需要构建步骤。推送到 GitHub 后，`.github/workflows/pages.yml` 会自动发布到 GitHub Pages。

## 首次部署

1. 在 GitHub 新建一个空仓库。
2. 在当前项目目录执行：

```bash
git init
git add .
git commit -m "Deploy static BaiduWiki brand page"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

3. 打开 GitHub 仓库的 `Settings -> Pages`，把 `Build and deployment` 的 `Source` 设为 `GitHub Actions`。
4. 进入 `Actions` 页面等待 `Deploy GitHub Pages` 完成。

部署成功后，页面地址通常是：

```text
https://<你的用户名>.github.io/<仓库名>/
```

## 后续更新

修改代码或素材后执行：

```bash
git add .
git commit -m "Update page"
git push
```

GitHub Actions 会自动重新发布线上页面。
