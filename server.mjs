import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4173);
const createEntryHref = "https://baike.baidu.com/page/createintro?entry=create_index";

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

const baikeHeaders = {
  "Accept": "application/json,text/plain,*/*",
  "Referer": "https://baike.baidu.com/",
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36"
};

const fallbackBaikeData = {
  stats: {
    totalLemma: 30955540,
    totalEditNum: 321721467,
    totalEditUser: 8103108
  },
  history: [
    { year: "1911", title: "波兰化学家C.丰克发现维生素并命名", link: "https://baike.baidu.com/item/维生素" },
    { year: "1979", title: "中国有机化学家黄鸣龙逝世", link: "https://baike.baidu.com/item/黄鸣龙" },
    { year: "2006", title: "首条连接西藏自治区的铁路青藏铁路权限通车", link: "https://baike.baidu.com/item/青藏铁路" }
  ],
  hot: {
    today: [
      { title: "旅游强国建设“十五五”规划", summary: "文化和旅游部印发的规划", url: "https://baike.baidu.com/item/旅游强国建设“十五五”规划" },
      { title: "2025年度国家科学技术奖", summary: "国家科学技术奖励工作办公室组织评选的奖项", url: "https://baike.baidu.com/item/2025年度国家科学技术奖" },
      { title: "消费者物价指数", summary: "度量居民消费商品和服务价格水平总体变动情况", url: "https://baike.baidu.com/item/消费者物价指数" }
    ],
    yesterday: []
  }
};

let baikeCache = {
  data: null,
  expiresAt: 0
};

function writeJson(response, status, data) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(data));
}

function openExternalUrl(url) {
  const platform = process.platform;
  const command = platform === "darwin" ? "open" : platform === "win32" ? "cmd" : "xdg-open";
  const args = platform === "darwin" ? [url] : platform === "win32" ? ["/c", "start", "", url] : [url];
  const child = spawn(command, args, { detached: true, stdio: "ignore" });
  child.unref();
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: baikeHeaders });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

function formatDateParts(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return { month, day, monthDay: `${month}${day}` };
}

function stripHtml(value = "") {
  return String(value)
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function makeBaikeItemUrl(title = "") {
  const cleanTitle = stripHtml(title);
  return cleanTitle ? `https://baike.baidu.com/item/${encodeURIComponent(cleanTitle)}` : "";
}

function normalizeBaikeUrl(url = "", title = "") {
  if (!url) return makeBaikeItemUrl(title);
  try {
    return new URL(url, "https://baike.baidu.com").href;
  } catch {
    return makeBaikeItemUrl(title);
  }
}

function normalizeHotItems(items = []) {
  return items.slice(0, 8).map((item) => ({
    title: item.title || item.lemmaInfo?.title || "",
    summary: item.wapAbstract || item.abstract || item.lemmaInfo?.lemmaDesc || "",
    url: normalizeBaikeUrl(item.url || item.link || item.lemmaInfo?.link, item.title || item.lemmaInfo?.title || ""),
    trend: item.trend || ""
  }));
}

function normalizeHistoryItems(items = []) {
  return items.slice(0, 3).map((item) => {
    const title = stripHtml(item.title || item.desc || "");
    return {
      year: String(item.year || ""),
      title,
      link: normalizeBaikeUrl(item.link, title),
      desc: stripHtml(item.desc || "")
    };
  });
}

async function getBaikeHomeData() {
  const now = Date.now();
  if (baikeCache.data && baikeCache.expiresAt > now) return baikeCache.data;

  const { month, day, monthDay } = formatDateParts();
  const [statsResponse, historyResponse, hotResponse] = await Promise.allSettled([
    fetchJson(`https://baike.baidu.com/api/wikihome/totalnum?r=${Math.random()}`),
    fetchJson(`https://baikebcs.cdn.bcebos.com/cms/home/eventsOnHistory/${month}.json?t=${now}`),
    fetchJson(`https://baikebcs.cdn.bcebos.com/cms/home/hotLemmas.json?t=${now}`)
  ]);

  const statsData = statsResponse.status === "fulfilled" && statsResponse.value?.errno === 0
    ? statsResponse.value.data
    : fallbackBaikeData.stats;
  const historyMonth = historyResponse.status === "fulfilled" ? historyResponse.value?.[month] : null;
  const historyRaw = historyMonth?.[monthDay] || [];
  const hotData = hotResponse.status === "fulfilled" ? hotResponse.value : fallbackBaikeData.hot;

  const data = {
    updatedAt: new Date(now).toISOString(),
    stats: {
      totalLemma: Number(statsData.totalLemma || fallbackBaikeData.stats.totalLemma),
      totalEditNum: Number(statsData.totalEditNum || fallbackBaikeData.stats.totalEditNum),
      totalEditUser: Number(statsData.totalEditUser || fallbackBaikeData.stats.totalEditUser)
    },
    historyDate: `${month}月${day}日`,
    history: normalizeHistoryItems(historyRaw.length ? historyRaw : fallbackBaikeData.history),
    hot: {
      today: normalizeHotItems(hotData.today || fallbackBaikeData.hot.today),
      yesterday: normalizeHotItems(hotData.yesterday || [])
    }
  };

  baikeCache = {
    data,
    expiresAt: now + 5 * 60 * 1000
  };
  return data;
}

createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);
    if (url.pathname === "/api/baike-home-data") {
      writeJson(response, 200, await getBaikeHomeData());
      return;
    }

    if (url.pathname === "/api/open-create-entry") {
      openExternalUrl(createEntryHref);
      writeJson(response, 200, { ok: true, url: createEntryHref });
      return;
    }

    const pathname = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
    let filePath = join(root, pathname === "/" ? "index.html" : pathname);
    const info = await stat(filePath).catch(() => null);
    if (!info || info.isDirectory()) filePath = join(root, "index.html");
    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": types[extname(filePath)] || "application/octet-stream"
    });
    response.end(body);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(error instanceof Error ? error.message : "Server error");
  }
}).listen(port, () => {
  console.log(`Digital Earth Hero running at http://localhost:${port}`);
});
