import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const outputPath = join(root, "api", "baike-home-data.json");

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
    { year: "1911", title: "波兰化学家C.丰克发现维生素并命名" },
    { year: "1979", title: "中国有机化学家黄鸣龙逝世" },
    { year: "2006", title: "首条连接西藏自治区的铁路青藏铁路权限通车" }
  ],
  hot: {
    today: [
      { title: "旅游强国建设“十五五”规划", summary: "文化和旅游部印发的规划" },
      { title: "2025年度国家科学技术奖", summary: "国家科学技术奖励工作办公室组织评选的奖项" },
      { title: "消费者物价指数", summary: "度量居民消费商品和服务价格水平总体变动情况" }
    ],
    yesterday: []
  }
};

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

function normalizeHotItems(items = []) {
  return items.slice(0, 8).map((item) => ({
    title: item.title || item.lemmaInfo?.title || "",
    summary: item.wapAbstract || item.abstract || item.lemmaInfo?.lemmaDesc || ""
  }));
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Request failed: ${response.status} ${url}`);
  return response.json();
}

async function getBaikeHomeData() {
  const now = Date.now();
  const { month, day, monthDay } = formatDateParts();
  const [statsResponse, historyResponse, hotResponse] = await Promise.allSettled([
    fetchJson(`https://baike.baidu.com/api/wikihome/totalnum?r=${Math.random()}`, { headers: baikeHeaders }),
    fetchJson(`https://baikebcs.cdn.bcebos.com/cms/home/eventsOnHistory/${month}.json?t=${now}`),
    fetchJson(`https://baikebcs.cdn.bcebos.com/cms/home/hotLemmas.json?t=${now}`)
  ]);

  const statsData = statsResponse.status === "fulfilled" && statsResponse.value?.errno === 0
    ? statsResponse.value.data
    : fallbackBaikeData.stats;
  const historyMonth = historyResponse.status === "fulfilled" ? historyResponse.value?.[month] : null;
  const historyRaw = historyMonth?.[monthDay] || [];
  const hotData = hotResponse.status === "fulfilled" ? hotResponse.value : fallbackBaikeData.hot;

  return {
    updatedAt: new Date(now).toISOString(),
    stats: {
      totalLemma: Number(statsData.totalLemma || fallbackBaikeData.stats.totalLemma),
      totalEditNum: Number(statsData.totalEditNum || fallbackBaikeData.stats.totalEditNum),
      totalEditUser: Number(statsData.totalEditUser || fallbackBaikeData.stats.totalEditUser)
    },
    historyDate: `${month}月${day}日`,
    history: (historyRaw.length ? historyRaw : fallbackBaikeData.history).slice(0, 3).map((item) => ({
      year: String(item.year || ""),
      title: stripHtml(item.title || item.desc || "")
    })),
    hot: {
      today: normalizeHotItems(hotData.today || fallbackBaikeData.hot.today),
      yesterday: normalizeHotItems(hotData.yesterday || [])
    }
  };
}

const data = await getBaikeHomeData();
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Updated ${outputPath}`);
