import React from "https://esm.sh/react@18.3.1";
import { Globe } from "./components/Globe.js?v=__BUILD_VERSION__";

const h = React.createElement;
const brandPdfHref = "./baike-brand-vi.pdf";
const brandPdfFileName = "baike-brand-vi.pdf";
const baikeLogoPdfHref = "./downloads/baidu-baike-logo.pdf";
const baikeLogoPdfFileName = "baidu-baike-logo.pdf";
const baiduWikiLogoPdfHref = "./downloads/baiduwiki-logo.pdf";
const baiduWikiLogoPdfFileName = "baiduwiki-logo.pdf";
const productMineLogoPdfHref = "./downloads/my-baike-logo.pdf";
const productMineLogoPdfFileName = "我的百科logo.pdf";
const productDynamicLogoPdfHref = "./downloads/dynamic-baike-logo.pdf";
const productDynamicLogoPdfFileName = "动态百科logo.pdf";
const productWikiLogoPdfHref = "./downloads/baiduwiki-product-logo.pdf";
const productWikiLogoPdfFileName = "Baiduwiki logo.pdf";
const productFanxingLogoPdfHref = "./downloads/fanxing-plan-logo.pdf";
const productFanxingLogoPdfFileName = "繁星计划logo.pdf";
const createEntryHref = "https://baike.baidu.com/page/createintro?entry=create_index";
const specSlides = [
  {
    title: "BaiduWiki规范",
    image: "./images/spec-baiduwiki.png",
    buttonImage: "./images/spec-btn-baiduwiki.png",
    buttonWidth: 414,
    href: "./downloads/baiduwiki-brand-packaging.pdf",
    downloadName: "Baiduwiki品牌包装.pdf",
    visButtonLabel: "BaiduWiki",
    visLabelSize: 23
  },
  {
    title: "百科规范",
    image: "./images/spec-baike.png",
    buttonImage: "./images/spec-btn-baike.png",
    buttonWidth: 384,
    href: "./downloads/baidu-baike-brand-vi.pdf",
    downloadName: "百度百科品牌vi.pdf",
    visButtonLabel: "百科手册",
    visLabelSize: 24
  },
  {
    title: "繁星计划",
    image: "./images/spec-fanxing.png",
    buttonImage: "./images/spec-btn-fanxing.png",
    buttonWidth: 384,
    href: "./downloads/fanxing-plan-vi.pdf",
    downloadName: "繁星计划vi.pdf",
    visButtonLabel: "繁星计划",
    visLabelSize: 24
  }
];

function openCreateEntry(event) {
  const isLocalPreview = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  if (!isLocalPreview) return;

  event.preventDefault();
  fetch("./api/open-create-entry", { cache: "no-store" }).catch(() => {
    window.open(createEntryHref, "_blank", "noopener,noreferrer");
  });
}

function scrollToContentY(y) {
  const scale = window.innerWidth / 2436;
  window.scrollTo({
    top: (1160 + y) * scale,
    behavior: "smooth"
  });
}

function getRotatingSlideClass(index, activeIndex) {
  const offset = (index - activeIndex + specSlides.length) % specSlides.length;
  if (offset === 0) return "is-active";
  if (offset === 1) return "is-right";
  return "is-left";
}

function wrapSlideIndex(index) {
  return ((index % specSlides.length) + specSlides.length) % specSlides.length;
}

const fallbackBaikeData = {
  stats: {
    totalLemma: 30955540,
    totalEditNum: 321721467,
    totalEditUser: 8103108
  },
  historyDate: "07月01日",
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

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function pickVisibleHotItems(items, referenceItems = []) {
  const referenceTitles = new Set(referenceItems.map((item) => item.title));
  const uniqueItems = items.filter((item) => !referenceTitles.has(item.title));
  return (uniqueItems.length >= 3 ? uniqueItems : items).slice(0, 3);
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

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load ${url}`);
  return response.json();
}

async function loadBaikeData() {
  const now = Date.now();
  const proxyResponse = await Promise.allSettled([
    fetchJson(`./api/baike-home-data?t=${now}`)
  ]);

  if (proxyResponse[0].status === "fulfilled") {
    return proxyResponse[0].value;
  }

  const { month, day, monthDay } = formatDateParts();
  const [snapshotResponse, statsResponse, historyResponse, hotResponse] = await Promise.allSettled([
    fetchJson(`./api/baike-home-snapshot.json?t=${now}`),
    fetchJson(`https://baike.baidu.com/api/wikihome/totalnum?r=${Math.random()}`),
    fetchJson(`https://baikebcs.cdn.bcebos.com/cms/home/eventsOnHistory/${month}.json?t=${now}`),
    fetchJson(`https://baikebcs.cdn.bcebos.com/cms/home/hotLemmas.json?t=${now}`)
  ]);

  if (
    snapshotResponse.status === "rejected" &&
    statsResponse.status === "rejected" &&
    historyResponse.status === "rejected" &&
    hotResponse.status === "rejected"
  ) {
    return fetchJson("./api/baike-home-data");
  }

  const snapshotData = snapshotResponse.status === "fulfilled" ? snapshotResponse.value : fallbackBaikeData;
  const snapshotStats = snapshotData.stats || fallbackBaikeData.stats;
  const liveStats = statsResponse.status === "fulfilled" && statsResponse.value?.errno === 0
    ? statsResponse.value.data
    : null;
  const statsData = {
    totalLemma: Number(liveStats?.totalLemma) || Number(snapshotStats.totalLemma) || fallbackBaikeData.stats.totalLemma,
    totalEditNum: Number(liveStats?.totalEditNum) || Number(snapshotStats.totalEditNum) || fallbackBaikeData.stats.totalEditNum,
    totalEditUser: Number(liveStats?.totalEditUser) || Number(snapshotStats.totalEditUser) || fallbackBaikeData.stats.totalEditUser
  };
  const historyMonth = historyResponse.status === "fulfilled" ? historyResponse.value?.[month] : null;
  const historyRaw = historyMonth?.[monthDay] || [];
  const hotData = hotResponse.status === "fulfilled" ? hotResponse.value : snapshotData.hot || fallbackBaikeData.hot;
  const snapshotHistory = Array.isArray(snapshotData.history) ? snapshotData.history : fallbackBaikeData.history;

  return {
    updatedAt: new Date(now).toISOString(),
    stats: {
      totalLemma: statsData.totalLemma,
      totalEditNum: statsData.totalEditNum,
      totalEditUser: statsData.totalEditUser
    },
    historyDate: `${month}月${day}日`,
    history: normalizeHistoryItems(historyRaw.length ? historyRaw : snapshotHistory),
    hot: {
      today: normalizeHotItems(hotData.today || fallbackBaikeData.hot.today),
      yesterday: normalizeHotItems(hotData.yesterday || [])
    }
  };
}

function FirstModuleData() {
  const [data, setData] = React.useState(fallbackBaikeData);
  const [hotDay, setHotDay] = React.useState("today");

  React.useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const nextData = await loadBaikeData();
        if (active) setData(nextData);
      } catch (error) {
        if (active) setData(fallbackBaikeData);
      }
    }

    loadData();
    const timer = window.setInterval(loadData, 5 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const stats = data.stats || fallbackBaikeData.stats;
  const history = (data.history || fallbackBaikeData.history).slice(0, 3);
  const rawHotToday = data.hot?.today || fallbackBaikeData.hot.today;
  const rawHotYesterday = data.hot?.yesterday?.length ? data.hot.yesterday : rawHotToday;
  const hotToday = rawHotToday.slice(0, 3);
  const hotYesterday = pickVisibleHotItems(rawHotYesterday, hotToday);
  const hotItems = hotDay === "yesterday" ? hotYesterday : hotToday;
  const updateHotDayByPointer = React.useCallback((event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const nextHotDay = event.clientX < bounds.left + bounds.width / 2 ? "today" : "yesterday";
    setHotDay(nextHotDay);
  }, []);

  return h(
    "section",
    { className: "live-module", "aria-label": "百度百科实时数据" },
    h("h1", { className: "live-title" }, "让人类平等地认识世界。"),
    h("p", { className: "live-subtitle" }, "百度百科VIS实景应用区，产品场景统一遵循品牌规范，既是设计落地参考，也是产品体验入口。"),
    h(
      "div",
      { className: "live-stats" },
      h(StatLine, { value: stats.totalLemma, label: "个词条" }),
      h(StatLine, { value: stats.totalEditNum, label: "次编辑" }),
      h(StatLine, { value: stats.totalEditUser, label: "人编写" })
    ),
    h("a", {
      className: "create-entry-link",
      href: createEntryHref,
      target: "_blank",
      rel: "noopener noreferrer",
      onClick: openCreateEntry,
      "aria-label": "体验创建词条"
    }, "体验创建词条"),
    h("img", {
      className: "live-history-bg",
      src: "./images/history-card-bg.png",
      alt: ""
    }),
    h(
      "article",
      { className: "live-history" },
      h("div", { className: "live-card-title" }, "历史上的今天"),
      h("div", { className: "live-card-date" }, data.historyDate || fallbackBaikeData.historyDate),
      h(
        "div",
        { className: "live-history-list" },
        ...history.map((item, index) => h(
          "div",
          { className: "live-history-item", key: `${item.year}-${index}` },
          h("span", { className: "live-history-year" }, item.year),
          h("span", { className: "live-history-dot" }),
          h("span", { className: "live-history-text" }, item.title)
        ))
      )
    ),
    h("img", {
      className: "live-hot-bg",
      src: "./images/hot-card-bg.png",
      alt: ""
    }),
    h(
      "article",
      { className: "live-hot" },
      h("div", { className: "live-hot-title" }, "热搜词条"),
      h(
        "div",
        {
          className: "live-hot-tabs",
          role: "tablist",
          "aria-label": "热搜日期",
          onMouseMove: updateHotDayByPointer,
          onPointerMove: updateHotDayByPointer
        },
        h("button", {
          className: `live-hot-tab ${hotDay === "today" ? "is-active" : ""}`,
          type: "button",
          role: "tab",
          "aria-selected": hotDay === "today",
          onMouseEnter: () => setHotDay("today"),
          onFocus: () => setHotDay("today"),
          onClick: () => setHotDay("today")
        }, "今天"),
        h("span", { className: "live-hot-separator" }, "|"),
        h("button", {
          className: `live-hot-tab ${hotDay === "yesterday" ? "is-active" : ""}`,
          type: "button",
          role: "tab",
          "aria-selected": hotDay === "yesterday",
          onMouseEnter: () => setHotDay("yesterday"),
          onFocus: () => setHotDay("yesterday"),
          onClick: () => setHotDay("yesterday")
        }, "昨天")
      ),
      h(
        "div",
        { className: "live-hot-list" },
        ...hotItems.map((item, index) => h(
          "a",
          {
            className: "live-hot-item",
            href: item.url || makeBaikeItemUrl(item.title),
            target: "_blank",
            rel: "noopener noreferrer",
            "aria-label": `打开${item.title}`,
            key: `${item.title}-${item.url || index}`
          },
          h("div", { className: "live-hot-item-title" }, item.title),
          h("div", { className: "live-hot-item-summary" }, item.summary)
        ))
      )
    )
  );
}

function StatLine({ value, label }) {
  const initialValue = Number(value || 0);
  const [displayValue, setDisplayValue] = React.useState(initialValue);
  const lastValue = React.useRef(initialValue);

  React.useEffect(() => {
    const nextValue = Number(value || 0);
    const startValue = lastValue.current;
    if (startValue === nextValue) {
      setDisplayValue(nextValue);
      return undefined;
    }

    const duration = 2500;
    const startedAt = window.performance.now();
    let frameId = 0;

    function animate(now) {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = easeOutCubic(progress);
      setDisplayValue(Math.round(startValue + (nextValue - startValue) * eased));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      } else {
        lastValue.current = nextValue;
      }
    }

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [value]);

  return h(
    "div",
    { className: "live-stat-line" },
    h("div", { className: "live-stat-value" }, formatNumber(displayValue)),
    h("div", { className: "live-stat-label" }, label)
  );
}

function FeatureCards() {
  const [hoveredCard, setHoveredCard] = React.useState("");
  const cards = [
    { id: "global", className: "feature-card-global", src: "./images/global-card-clean.png", label: "国际化" },
    { id: "open", className: "feature-card-open", src: "./images/open-card-clean.png", label: "开放" },
    { id: "diverse", className: "feature-card-diverse", src: "./images/diverse-card-clean.png", label: "多元" }
  ];

  return h(
    "div",
    { className: "feature-cards", "aria-label": "品牌内核图示" },
    ...cards.map((card) => h(
      "div",
      {
        className: `feature-card ${card.className} ${hoveredCard === card.id ? "is-hovered" : ""}`,
        key: card.src,
        onMouseEnter: () => setHoveredCard(card.id),
        onMouseLeave: () => setHoveredCard(""),
        onPointerEnter: () => setHoveredCard(card.id),
        onPointerLeave: () => setHoveredCard("")
      },
      h("img", { src: card.src, alt: "" }),
      h("span", { className: "feature-card-label" }, card.label)
    ))
  );
}

function FeatureCopy() {
  return h(
    "section",
    { className: "feature-copy", "aria-label": "品牌内核全球互通知识体系" },
    h("h2", { className: "feature-title" },
      h("span", null, "品牌内核全球互通"),
      h("span", null, "知识体系。")
    ),
    h("p", { className: "feature-subtitle" }, "知识自有脉络，以统一视觉连通全球多元认知。")
  );
}

function LogoCards() {
  const [hoveredLogo, setHoveredLogo] = React.useState("");
  const updateHoveredLogoByPointer = React.useCallback((event) => {
    const target = event.currentTarget;
    const nextLogo = ["white", "blue"].find((id) => {
      const element = target.querySelector(`.logo-card-${id}`);
      if (!element) return false;
      const bounds = element.getBoundingClientRect();
      return (
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom
      );
    });

    setHoveredLogo(nextLogo || "");
  }, []);
  const logos = [
    { id: "blue", className: "logo-card-blue", src: "./images/logo-card-blue.png", hdSrc: "./images/logo-card-blue@2x.png", alt: "Baidu百科国内版品牌标志" },
    { id: "white", className: "logo-card-white", src: "./images/logo-card-white.png", hdSrc: "./images/logo-card-white@2x.png", alt: "BaiduWiki国际版品牌标志" }
  ];

  return h(
    "div",
    {
      className: "logo-cards",
      "aria-label": "国内与国际品牌 Logo",
      onMouseMove: updateHoveredLogoByPointer,
      onPointerMove: updateHoveredLogoByPointer,
      onMouseLeave: () => setHoveredLogo(""),
      onPointerLeave: () => setHoveredLogo("")
    },
    h("div", { className: "logo-card-cleanup logo-card-cleanup-blue", "aria-hidden": "true" }),
    h("div", { className: "logo-card-cleanup logo-card-cleanup-white", "aria-hidden": "true" }),
    ...logos.map((logo) => h(
      "div",
      {
        className: `logo-card ${logo.className} ${hoveredLogo === logo.id ? "is-hovered" : ""}`,
        key: logo.src,
        onMouseEnter: () => setHoveredLogo(logo.id),
        onMouseLeave: () => setHoveredLogo(""),
        onMouseOver: () => setHoveredLogo(logo.id),
        onMouseOut: (event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setHoveredLogo("");
        },
        onPointerEnter: () => setHoveredLogo(logo.id),
        onPointerLeave: () => setHoveredLogo(""),
        onPointerOver: () => setHoveredLogo(logo.id),
        onPointerOut: (event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setHoveredLogo("");
        }
      },
      h("img", {
        src: logo.src,
        srcSet: `${logo.src} 1x, ${logo.hdSrc} 2x`,
        alt: logo.alt,
        decoding: "async"
      })
    ))
  );
}

function LogoSectionCopy() {
  return h(
    "section",
    { className: "logo-section-copy", "aria-label": "国内与国际品牌 Logo 下载" },
    h("div", { className: "logo-section-mask logo-section-title-mask", "aria-hidden": "true" }),
    h("div", { className: "logo-section-mask logo-section-button-mask", "aria-hidden": "true" }),
    h(
      "h2",
      { className: "logo-section-heading" },
      h("span", null, "国内与国际"),
      h("span", null, "品牌LOGO")
    ),
    h("a", {
      className: "logo-section-btn logo-section-btn-cn",
      href: baikeLogoPdfHref,
      download: baikeLogoPdfFileName
    }, h("span", { className: "logo-section-btn-label" }, "下载国内版")),
    h("a", {
      className: "logo-section-btn logo-section-btn-global",
      href: baiduWikiLogoPdfHref,
      download: baiduWikiLogoPdfFileName
    }, h("span", { className: "logo-section-btn-label" }, "下载国际版"))
  );
}

function ProductLogoSection() {
  const productCards = [
    { id: "mine", className: "product-logo-card-mine", src: "./images/product-logo-card-mine.png", hdSrc: "./images/product-logo-card-mine@2x.png", href: productMineLogoPdfHref, downloadName: productMineLogoPdfFileName, label: "下载我的百科 Logo PDF" },
    { id: "dynamic", className: "product-logo-card-dynamic", src: "./images/product-logo-card-dynamic.png", hdSrc: "./images/product-logo-card-dynamic@2x.png", href: productDynamicLogoPdfHref, downloadName: productDynamicLogoPdfFileName, label: "下载动态百科 Logo PDF" },
    { id: "wiki", className: "product-logo-card-wiki", src: "./images/product-logo-card-wiki.png", hdSrc: "./images/product-logo-card-wiki@2x.png", href: productWikiLogoPdfHref, downloadName: productWikiLogoPdfFileName, label: "下载 Baiduwiki Logo PDF" },
    { id: "fanxing", className: "product-logo-card-fanxing", src: "./images/product-logo-card-fanxing.png", hdSrc: "./images/product-logo-card-fanxing@2x.png", href: productFanxingLogoPdfHref, downloadName: productFanxingLogoPdfFileName, label: "下载繁星计划 Logo PDF" }
  ];

  return h(
    "section",
    { className: "product-logo-section", "aria-label": "百科旗下产品 Logo 规范下载" },
    h("div", { className: "product-logo-title-mask", "aria-hidden": "true" }),
    h(
      "h2",
      { className: "product-logo-heading" },
      h("span", null, "百科旗下产品LOGO"),
      h("span", null, "规范下载。")
    ),
    ...productCards.map((card) => h("img", {
      className: `product-logo-card ${card.className}`,
      src: card.src,
      srcSet: `${card.src} 1x, ${card.hdSrc} 2x`,
      alt: "",
      decoding: "async",
      key: card.id
    })),
    ...productCards.map((card) => h("a", {
      className: `product-logo-download product-logo-download-${card.id}`,
      href: card.href,
      download: card.downloadName,
      "aria-label": card.label,
      key: `download-${card.id}`
    }, h("span", { className: "product-logo-download-label" }, "下载")))
  );
}

function VisDownloadSection({
  activeIndex,
  dragOffset,
  isDragging,
  onSelect,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onWheel,
  onMouseEnter,
  onMouseLeave
}) {
  const activeSpec = specSlides[wrapSlideIndex(activeIndex)];
  const visibleSlideIds = [activeIndex - 2, activeIndex - 1, activeIndex, activeIndex + 1, activeIndex + 2];

  return h(
    "section",
    { className: "vis-download-section", "aria-label": "百科旗下品牌 VIS 下载" },
    h("div", { className: "vis-download-title-mask", "aria-hidden": "true" }),
    h("h2", { className: "vis-download-title" }, "百科旗下品牌VIS下载"),
    h("div", { className: "vis-download-mask", "aria-hidden": "true" }),
    h(
      "div",
      {
        className: `vis-carousel-window ${isDragging ? "is-dragging" : ""}`,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel,
        onWheel,
        onMouseEnter,
        onMouseLeave
      },
      h(
        "div",
        { className: "vis-carousel-stage" },
        ...visibleSlideIds.map((slideId) => {
          const slide = specSlides[wrapSlideIndex(slideId)];
          const position = slideId - activeIndex + dragOffset;
          const distance = Math.min(Math.abs(position), 1.35);
          const slideScale = 1 - distance * 0.02;
          const slideOpacity = 1 - distance * 0.08;
          const slideBrightness = 1 - distance * 0.1;
          const slideClass = Math.abs(position) < 0.45
            ? "is-active"
            : Math.abs(position) < 1.45
              ? "is-adjacent"
              : "is-outer";

          return h("button", {
          className: `vis-slide-frame ${slideClass}`,
          type: "button",
          "aria-label": `查看${slide.title}`,
          "aria-current": slideId === activeIndex ? "true" : undefined,
          onClick: () => onSelect(slideId),
          style: {
            "--vis-slide-x": `${position * 47.25}`,
            "--vis-slide-scale": slideScale,
            "--vis-slide-opacity": slideOpacity,
            "--vis-slide-brightness": slideBrightness,
            zIndex: Math.max(1, 5 - Math.round(distance * 2))
          },
          key: `vis-${slideId}`
        }, h("img", {
          className: "vis-slide-image",
          src: slide.image,
          alt: slide.title,
          draggable: "false"
        }));
        })
      )
    ),
    h(
      "div",
      { className: "vis-download-footer" },
      h("a", {
        className: "vis-download-link",
        href: activeSpec.href,
        download: activeSpec.downloadName,
        "aria-label": `${activeSpec.title} 下载PDF`,
        style: {
          "--vis-button-width": `${activeSpec.buttonWidth}px`,
          "--vis-label-size": `${activeSpec.visLabelSize || 24}px`
        }
      },
      h("span", { className: "vis-download-label" },
        h("span", { className: "vis-download-label-text" }, activeSpec.visButtonLabel)
      ),
      h("span", { className: "vis-download-pill" },
        h("span", { className: "vis-download-pill-text" }, "下载PDF")
      ))
    )
  );
}

function DownloadHotspots() {
  const hotspots = [
    { id: "logo-cn", className: "download-hotspot-logo-cn", label: "下载百度百科 Logo PDF", href: baikeLogoPdfHref, download: baikeLogoPdfFileName },
    { id: "logo-global", className: "download-hotspot-logo-global", label: "下载 BaiduWiki Logo PDF", href: baiduWikiLogoPdfHref, download: baiduWikiLogoPdfFileName },
    { id: "product-mine", className: "download-hotspot-product-mine", label: "下载百科品牌 VI PDF" },
    { id: "product-dynamic", className: "download-hotspot-product-dynamic", label: "下载百科品牌 VI PDF" },
    { id: "product-wiki", className: "download-hotspot-product-wiki", label: "下载百科品牌 VI PDF" },
    { id: "product-juliang", className: "download-hotspot-product-juliang", label: "下载百科品牌 VI PDF" },
    { id: "vis-manual", className: "download-hotspot-vis-manual", label: "下载百科品牌 VI PDF" },
    { id: "vis-pdf", className: "download-hotspot-vis-pdf", label: "下载百科品牌 VI PDF" }
  ];

  return h(
    "div",
    { className: "download-hotspots", "aria-label": "百科品牌 PDF 下载入口" },
    ...hotspots.map((hotspot) => h(
      "a",
      {
        className: `download-hotspot ${hotspot.className}`,
        href: hotspot.href || brandPdfHref,
        download: hotspot.download === false ? undefined : brandPdfFileName,
        target: hotspot.target,
        rel: hotspot.rel,
        onClick: hotspot.id === "first-create" ? openCreateEntry : undefined,
        "aria-label": hotspot.label,
        key: hotspot.id
      }
    ))
  );
}

export function App() {
  const [scale, setScale] = React.useState(() => window.innerWidth / 2436);
  const [isNavSticky, setIsNavSticky] = React.useState(false);
  const [isSpecModalOpen, setIsSpecModalOpen] = React.useState(false);
  const [specIndex, setSpecIndex] = React.useState(0);
  const [isSpecDragging, setIsSpecDragging] = React.useState(false);
  const [isSpecHovering, setIsSpecHovering] = React.useState(false);
  const [visIndex, setVisIndex] = React.useState(1);
  const [visDragOffset, setVisDragOffset] = React.useState(0);
  const [isVisDragging, setIsVisDragging] = React.useState(false);
  const [isVisHovering, setIsVisHovering] = React.useState(false);
  const specDragStartRef = React.useRef(null);
  const specHoverMoveRef = React.useRef({
    lastX: null,
    accumulatedX: 0,
    lockedUntil: 0
  });
  const specWheelLockRef = React.useRef(0);
  const specSuppressClickRef = React.useRef(false);
  const visDragStartRef = React.useRef(null);
  const visHoverMoveRef = React.useRef({
    lastX: null,
    accumulatedX: 0,
    lockedUntil: 0
  });
  const visWheelLockRef = React.useRef(0);
  const visSuppressClickRef = React.useRef(false);

  React.useEffect(() => {
    function resize() {
      setScale(window.innerWidth / 2436);
    }

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  React.useEffect(() => {
    function updateStickyNav() {
      setIsNavSticky(window.scrollY >= 224 * scale);
    }

    updateStickyNav();
    window.addEventListener("scroll", updateStickyNav, { passive: true });
    return () => window.removeEventListener("scroll", updateStickyNav);
  }, [scale]);

  React.useEffect(() => {
    if (!isSpecModalOpen) return undefined;

    function handleKeydown(event) {
      if (event.key === "Escape") closeSpecModal();
      if (event.key === "ArrowLeft") setSpecIndex((index) => (index + specSlides.length - 1) % specSlides.length);
      if (event.key === "ArrowRight") setSpecIndex((index) => (index + 1) % specSlides.length);
    }

    document.body.classList.add("is-modal-open");
    window.addEventListener("keydown", handleKeydown);
    return () => {
      document.body.classList.remove("is-modal-open");
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [isSpecModalOpen]);

  React.useEffect(() => {
    if (!isSpecModalOpen || isSpecDragging || isSpecHovering) return undefined;

    const timer = window.setInterval(() => {
      setSpecIndex((index) => (index + 1) % specSlides.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [isSpecModalOpen, isSpecDragging, isSpecHovering]);

  React.useEffect(() => {
    if (isVisDragging || isVisHovering) return undefined;

    const timer = window.setInterval(() => {
      setVisIndex((index) => index + 1);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [isVisDragging, isVisHovering]);

  function openSpecModal() {
    setSpecIndex(0);
    setIsSpecDragging(false);
    setIsSpecHovering(false);
    setIsSpecModalOpen(true);
  }

  function closeSpecModal() {
    specDragStartRef.current = null;
    specHoverMoveRef.current = {
      lastX: null,
      accumulatedX: 0,
      lockedUntil: 0
    };
    setIsSpecDragging(false);
    setIsSpecHovering(false);
    setIsSpecModalOpen(false);
  }

  function showPreviousSpec() {
    setSpecIndex((index) => (index + specSlides.length - 1) % specSlides.length);
  }

  function showNextSpec() {
    setSpecIndex((index) => (index + 1) % specSlides.length);
  }

  function startSpecDrag(event) {
    if (event.button != null && event.button !== 0) return;
    const now = performance.now();
    specDragStartRef.current = {
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: now,
      velocity: 0
    };
    specSuppressClickRef.current = false;
    setIsSpecDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function moveSpecByHover(event) {
    if (event.pointerType && event.pointerType !== "mouse") return;

    const hover = specHoverMoveRef.current;
    const now = performance.now();

    if (hover.lastX == null) {
      hover.lastX = event.clientX;
      hover.accumulatedX = 0;
      return;
    }

    const deltaX = event.clientX - hover.lastX;
    hover.lastX = event.clientX;
    if (Math.abs(deltaX) < 1 || now < hover.lockedUntil) return;

    hover.accumulatedX = Math.max(-120, Math.min(120, hover.accumulatedX + deltaX));
    const switchDistance = Math.max(56, window.innerWidth * 0.04);

    if (hover.accumulatedX <= -switchDistance) {
      showNextSpec();
      hover.accumulatedX = 0;
      hover.lockedUntil = now + 520;
    } else if (hover.accumulatedX >= switchDistance) {
      showPreviousSpec();
      hover.accumulatedX = 0;
      hover.lockedUntil = now + 520;
    }
  }

  function moveSpecDrag(event) {
    const drag = specDragStartRef.current;
    if (!drag) {
      moveSpecByHover(event);
      return;
    }

    const now = performance.now();
    const elapsed = Math.max(now - drag.lastTime, 1);
    drag.velocity = (event.clientX - drag.lastX) / elapsed;
    drag.lastX = event.clientX;
    drag.lastTime = now;
  }

  function endSpecDrag(event) {
    const drag = specDragStartRef.current;
    if (!drag) return;

    const deltaX = event.clientX - drag.startX;
    const velocity = drag.velocity;
    let direction = 0;

    if (deltaX <= -56 || velocity <= -0.45) direction = 1;
    if (deltaX >= 56 || velocity >= 0.45) direction = -1;

    specDragStartRef.current = null;
    if (Math.abs(deltaX) > 8) {
      specSuppressClickRef.current = true;
      window.setTimeout(() => {
        specSuppressClickRef.current = false;
      }, 180);
    }
    setIsSpecDragging(false);
    if (direction > 0) showNextSpec();
    if (direction < 0) showPreviousSpec();
  }

  function cancelSpecDrag() {
    specDragStartRef.current = null;
    setIsSpecDragging(false);
  }

  function enterSpecHover(event) {
    specHoverMoveRef.current = {
      lastX: event.clientX,
      accumulatedX: 0,
      lockedUntil: 0
    };
    setIsSpecHovering(true);
  }

  function leaveSpecHover() {
    specHoverMoveRef.current = {
      lastX: null,
      accumulatedX: 0,
      lockedUntil: 0
    };
    setIsSpecHovering(false);
    cancelSpecDrag();
  }

  function wheelSpec(event) {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(delta) < 18) return;

    event.preventDefault();
    const now = Date.now();
    if (now < specWheelLockRef.current) return;

    specWheelLockRef.current = now + 560;
    if (delta > 0) showNextSpec();
    else showPreviousSpec();
  }

  function selectSpecSlide(index) {
    if (specSuppressClickRef.current) return;
    setSpecIndex(index);
  }

  function showPreviousVisSpec() {
    setVisIndex((index) => index - 1);
  }

  function showNextVisSpec() {
    setVisIndex((index) => index + 1);
  }

  function startVisDrag(event) {
    if (event.button != null && event.button !== 0) return;
    const now = performance.now();
    visDragStartRef.current = {
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: now,
      velocity: 0
    };
    visSuppressClickRef.current = false;
    setIsVisDragging(true);
    setVisDragOffset(0);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function moveVisByHover(event) {
    if (event.pointerType && event.pointerType !== "mouse") return;

    const hover = visHoverMoveRef.current;
    const now = performance.now();

    if (hover.lastX == null) {
      hover.lastX = event.clientX;
      hover.accumulatedX = 0;
      return;
    }

    const deltaX = event.clientX - hover.lastX;
    hover.lastX = event.clientX;
    if (Math.abs(deltaX) < 1 || now < hover.lockedUntil) return;

    hover.accumulatedX = Math.max(-120, Math.min(120, hover.accumulatedX + deltaX));
    const switchDistance = Math.max(56, window.innerWidth * 0.04);

    if (hover.accumulatedX <= -switchDistance) {
      showNextVisSpec();
      hover.accumulatedX = 0;
      hover.lockedUntil = now + 520;
    } else if (hover.accumulatedX >= switchDistance) {
      showPreviousVisSpec();
      hover.accumulatedX = 0;
      hover.lockedUntil = now + 520;
    }
  }

  function moveVisDrag(event) {
    const drag = visDragStartRef.current;
    if (!drag) {
      moveVisByHover(event);
      return;
    }

    const now = performance.now();
    const elapsed = Math.max(now - drag.lastTime, 1);
    const deltaX = event.clientX - drag.startX;
    const stepWidth = Math.max(window.innerWidth * 0.4725, 1);
    const nextOffset = Math.max(-1.18, Math.min(1.18, deltaX / stepWidth));

    drag.velocity = (event.clientX - drag.lastX) / elapsed;
    drag.lastX = event.clientX;
    drag.lastTime = now;
    setVisDragOffset(nextOffset);
  }

  function endVisDrag(event) {
    const drag = visDragStartRef.current;
    if (!drag) return;

    const stepWidth = Math.max(window.innerWidth * 0.4725, 1);
    const deltaX = event.clientX - drag.startX;
    const offset = Math.max(-1.18, Math.min(1.18, deltaX / stepWidth));
    const velocity = drag.velocity;
    let direction = 0;

    if (offset <= -0.22 || velocity <= -0.45) direction = 1;
    if (offset >= 0.22 || velocity >= 0.45) direction = -1;

    visDragStartRef.current = null;
    if (Math.abs(deltaX) > 8) {
      visSuppressClickRef.current = true;
      window.setTimeout(() => {
        visSuppressClickRef.current = false;
      }, 180);
    }
    setIsVisDragging(false);
    setVisDragOffset(0);
    if (direction !== 0) setVisIndex((index) => index + direction);
  }

  function cancelVisDrag() {
    visDragStartRef.current = null;
    setIsVisDragging(false);
    setVisDragOffset(0);
  }

  function enterVisHover(event) {
    visHoverMoveRef.current = {
      lastX: event.clientX,
      accumulatedX: 0,
      lockedUntil: 0
    };
    setIsVisHovering(true);
  }

  function leaveVisHover() {
    visHoverMoveRef.current = {
      lastX: null,
      accumulatedX: 0,
      lockedUntil: 0
    };
    setIsVisHovering(false);
    cancelVisDrag();
  }

  function wheelVis(event) {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(delta) < 18) return;

    event.preventDefault();
    const now = Date.now();
    if (now < visWheelLockRef.current) return;

    visWheelLockRef.current = now + 560;
    if (delta > 0) showNextVisSpec();
    else showPreviousVisSpec();
  }

  function selectVisSlide(slideId) {
    if (visSuppressClickRef.current) return;
    setVisIndex(slideId);
  }

  const activeSpec = specSlides[specIndex];
  const getSpecSlideClass = (index) => getRotatingSlideClass(index, specIndex);
  const navItems = [
    { id: "knowledge", label: "知识共建", onClick: () => scrollToContentY(0) },
    { id: "wiki", label: ["体验", h("span", { className: "nav-baiduwiki", key: "baiduwiki" }, "BaiduWiki")], onClick: () => scrollToContentY(1300) },
    { id: "brand", label: "其他Logo", onClick: () => scrollToContentY(5200) },
    { id: "rules", label: "规范", onClick: openSpecModal }
  ];

  return h(
    React.Fragment,
    null,
    h(
      "main",
      { className: `site-shell ${isSpecModalOpen ? "is-blurred" : ""}`, style: { "--stage-scale": scale } },
      h(
        "section",
        { className: "hero", "aria-label": "百科品牌视觉体验中心" },
        h(Globe, null),
        h("div", { className: "nav-guard", "aria-hidden": "true" }),
        h("div", { className: "bottom-mask", "aria-hidden": "true" }),
        h("img", {
          className: "hero-overlay",
          src: "./images/baike-overlay-no-hero-text.png",
          alt: "百度百科品牌视觉体验中心"
        }),
        h(
          "div",
          { className: "hero-copy", "aria-label": "KNOWLEDGE CO-CREATION 百科品牌视觉体验中心" },
          h("div", { className: "hero-kicker" }, "KNOWLEDGE CO-CREATION"),
          h("h1", { className: "hero-title" },
            h("span", null, "百科品牌"),
            h("span", null, "视觉体验中心")
          )
        ),
        h(
          "div",
          { className: "hero-actions", "aria-label": "首屏操作" },
          h("button", {
            className: "hero-action hero-action-primary",
            type: "button",
            onClick: () => scrollToContentY(0)
          }, "内容体验"),
          h("button", {
            className: "hero-action hero-action-secondary",
            type: "button",
            onClick: openSpecModal
          }, "查看VIS")
        ),
        h(
          "nav",
          { className: "top-tabs", "aria-label": "页面导航" },
          h(
            "div",
            { className: "top-nav-inner", "aria-hidden": "true" },
            h("span", { className: "top-nav-logo" })
          ),
          h("a", {
            className: "top-nav-download",
            href: brandPdfHref,
            download: brandPdfFileName,
            "aria-label": "下载百科品牌 VI PDF"
          }, "下载"),
          ...navItems.map((item) => h("button", {
            className: `top-tab top-tab-${item.id}`,
            type: "button",
            onClick: item.onClick,
            key: item.id
          }, h("span", { className: "nav-tab-label" }, item.label)))
        )
      ),
      h("img", {
        className: "content-panel",
        src: "./images/baike-content.png",
        alt: "百度百科品牌内容"
      }),
      h(FirstModuleData, null),
      h(LogoCards, null),
      h(LogoSectionCopy, null),
      h(ProductLogoSection, null),
      h(FeatureCopy, null),
      h(FeatureCards, null),
      h(VisDownloadSection, {
        activeIndex: visIndex,
        dragOffset: visDragOffset,
        isDragging: isVisDragging,
        onSelect: selectVisSlide,
        onPointerDown: startVisDrag,
        onPointerMove: moveVisDrag,
        onPointerUp: endVisDrag,
        onPointerCancel: cancelVisDrag,
        onWheel: wheelVis,
        onMouseEnter: enterVisHover,
        onMouseLeave: leaveVisHover
      }),
      h(DownloadHotspots, null)
    ),
    h(
      "nav",
      {
        className: `sticky-nav ${isNavSticky ? "is-visible" : ""}`,
        "aria-label": "吸顶页面导航",
        "aria-hidden": isNavSticky ? undefined : "true",
        style: { "--stage-scale": scale }
      },
      h(
        "div",
        { className: "sticky-nav-inner" },
        h("span", { className: "sticky-nav-logo", "aria-hidden": "true" }),
        h("div", { className: "sticky-nav-tabs-bg", "aria-hidden": "true" }),
        ...navItems.map((item) => h("button", {
          className: `sticky-nav-tab sticky-nav-tab-${item.id}`,
          type: "button",
          onClick: item.onClick,
          tabIndex: isNavSticky ? 0 : -1,
          key: item.id
        }, h("span", { className: "nav-tab-label" }, item.label))),
        h("a", {
          className: "sticky-nav-download",
          href: brandPdfHref,
          download: brandPdfFileName,
          tabIndex: isNavSticky ? 0 : -1,
          "aria-label": "下载百科品牌 VI PDF"
        }, "下载")
      )
    ),
    isSpecModalOpen && h(
      "div",
      {
        className: "spec-modal",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": "规范下载"
      },
      h("button", {
        className: "spec-modal-backdrop",
        type: "button",
        "aria-label": "关闭规范弹窗",
        onClick: closeSpecModal
      }),
      h(
        "section",
        { className: "spec-modal-panel" },
        h("button", {
          className: "spec-modal-close",
          type: "button",
          "aria-label": "关闭",
          onClick: closeSpecModal
        }, "×"),
        h(
          "div",
          {
            className: `spec-carousel-window ${isSpecDragging ? "is-dragging" : ""}`,
            onPointerDown: startSpecDrag,
            onPointerMove: moveSpecDrag,
            onPointerUp: endSpecDrag,
            onPointerCancel: cancelSpecDrag,
            onWheel: wheelSpec,
            onPointerEnter: enterSpecHover,
            onPointerLeave: leaveSpecHover
          },
          h(
            "div",
            {
              className: "spec-carousel-stage"
            },
            ...specSlides.map((slide, index) => h("button", {
              className: `spec-slide-frame ${getSpecSlideClass(index)}`,
              type: "button",
              "aria-label": `查看${slide.title}`,
              "aria-current": index === specIndex ? "true" : undefined,
              onClick: () => selectSpecSlide(index),
              key: slide.title
            }, h("img", {
              className: "spec-slide-image",
              src: slide.image,
              alt: slide.title,
              draggable: "false"
            }))
          )
        ),
        ),
        h(
          "div",
          { className: "spec-modal-footer" },
          h("a", {
            className: "spec-download-link",
            href: activeSpec.href,
            download: activeSpec.downloadName,
            "aria-label": `${activeSpec.title} 下载PDF`,
            style: { "--spec-button-width": `${activeSpec.buttonWidth}px` }
          }, h("img", {
            className: "spec-download-image",
            src: activeSpec.buttonImage,
            alt: `${activeSpec.title} 下载PDF`
          })),
          h(
            "div",
            { className: "spec-dots", "aria-label": "规范页面指示" },
            ...specSlides.map((slide, index) => h("button", {
              className: `spec-dot ${index === specIndex ? "is-active" : ""}`,
              type: "button",
              "aria-label": `查看${slide.title}`,
              onClick: () => selectSpecSlide(index),
              key: slide.title
            }))
          )
        )
      )
    )
  );
}
