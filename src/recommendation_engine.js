/**
 * 輔英科技大學 研發處服務整合系統 - 7 大類「最佳／次佳／佳」人選媒合推薦與主動導入演算法
 *
 * 涵蓋 7 大核心類別：
 * 1. proj_nstc : 國科會專題研究計畫 (NSTC Research Projects)
 * 2. proj_gov  : 政府部會委辦計畫 (Government Commissioned Projects)
 * 3. proj_moe  : 教育部深耕/USR/教學實踐計畫 (MOE Higher Ed Sprout / USR / Pedagogical Projects)
 * 4. proj_iac  : 企業產學合作計畫 (Industry-Academia Collaboration Projects)
 * 5. pat_inv   : 發明專利撰寫與申請 (Invention Patent Application)
 * 6. pat_util  : 新型/設計專利撰寫與輔具改良 (Utility & Design Patents / Assistive Devices)
 * 7. pat_tt    : 專利技術移轉與產學授權 (Patent Tech Transfer & Licensing)
 */

const TARGET_WRITING_CONFIG = {
  proj_nstc: {
    name: "國科會專題研究計畫 (NSTC)",
    focus: "基礎科學與應用原創研究、高影響力國際期刊發表能量",
    baseScore: 62,
    thresholds: { best: 85, second: 73, good: 60 },
    evalFn: (p) => {
      let score = 62;
      let reasons = [];
      let gapNote = "";

      // 曾主持國科會計畫
      if (p.nstcCount > 0) {
        const bonus = Math.min(20, p.nstcCount * 10);
        score += bonus;
        reasons.push(`曾主持國科會計畫 ${p.nstcCount} 件 (+${bonus}分)`);
      } else {
        gapNote = "尚未主持國科會計畫，需由資深學者帶領媒合共同主持";
      }

      // SCI / SSCI / EI 期刊能量
      const topPapers = p.papers.filter(paper => paper.subType.includes("SCI") || paper.subType.includes("SSCI") || paper.subType.includes("EI"));
      if (topPapers.length > 0) {
        const q1Count = topPapers.filter(paper => (paper.ifScore && paper.ifScore >= 5.0) || paper.subType.includes("Q1")).length;
        const pBonus = Math.min(18, topPapers.length * 6 + q1Count * 3);
        score += pBonus;
        reasons.push(`發表頂尖/SCI/SSCI期刊 ${topPapers.length} 篇 (含高IF Q1 ${q1Count} 篇) (+${pBonus}分)`);
      }

      // 產學或校內先期研究基礎
      if (p.totalProjectCount > p.nstcCount) {
        score += 8;
        reasons.push("具備產學或校內先期研發計畫執行經驗 (+8分)");
      }

      // 專利實務
      if (p.patentsCount > 0) {
        score += 5;
        reasons.push("具專利發明實績，論述具產業前瞻性 (+5分)");
      }

      return { score, reasons, gapNote, targetType: "proj_nstc" };
    }
  },

  proj_gov: {
    name: "政府部會委辦計畫 (衛福部/環境部/勞動部等)",
    focus: "國家公衛長照政策、環境治理水質監測、職業安全與勞檢標準落實",
    baseScore: 63,
    thresholds: { best: 85, second: 73, good: 60 },
    evalFn: (p) => {
      let score = 63;
      let reasons = [];
      let gapNote = "";

      // 曾主持部會委辦案
      if (p.govProjCount > 0) {
        const bonus = Math.min(22, p.govProjCount * 12);
        score += bonus;
        reasons.push(`曾主持政府部會委辦計畫 ${p.govProjCount} 件 (+${bonus}分)`);
      }

      // 總計畫經費量能
      if (p.totalFundingWan >= 100) {
        score += 12;
        reasons.push(`計畫總經費達 NT$ ${p.totalFundingWan} 萬，具大型政府專案承接量能 (+12分)`);
      }

      // 政策契合系所 (環工、職安、健管、護理、保營)
      const policyDepts = ["環境工程與科學系", "職業安全衛生系", "健康事業管理系", "護理系", "高齡及長期照護事業系", "保健營養系"];
      if (policyDepts.includes(p.dept)) {
        score += 9;
        reasons.push(`所屬系所 (${p.dept}) 深度契合中央重大公衛/環安/長照政策推廣 (+9分)`);
      } else {
        gapNote = "需跨院跨系結合環安或長照團隊聯合投標部會計畫";
      }

      return { score, reasons, gapNote, targetType: "proj_gov" };
    }
  },

  proj_moe: {
    name: "教育部補助計畫 (深耕/USR/教學實踐/EMI)",
    focus: "在地社會責任 (USR)、青銀共融、偏鄉健康促進、全英語沉浸式雙語教學",
    baseScore: 64,
    thresholds: { best: 85, second: 73, good: 60 },
    evalFn: (p) => {
      let score = 64;
      let reasons = [];
      let gapNote = "";

      // 曾主持教育部深耕/USR/EMI
      if (p.moeProjCount > 0) {
        const bonus = Math.min(24, p.moeProjCount * 14);
        score += bonus;
        reasons.push(`曾主持教育部深耕/USR/EMI計畫 ${p.moeProjCount} 件 (+${bonus}分)`);
      }

      // 發表 SSCI / TSSCI / Scopus 教育與社會實證論文
      const socialPapers = p.papers.filter(paper => paper.subType.includes("SSCI") || paper.subType.includes("TSSCI") || paper.subType.includes("Scopus") || paper.keywords.some(k => k.includes("USR") || k.includes("共融") || k.includes("EMI")));
      if (socialPapers.length > 0) {
        score += 15;
        reasons.push(`發表社區實證/人文社會核心論文 ${socialPapers.length} 篇 (+15分)`);
      }

      // 護理、幼保、休閒、外語或 SROI/長照專長系所
      const moeFitDepts = ["護理系", "高齡及長期照護事業系", "幼兒保育暨產業系", "休閒與遊憩事業管理系", "應用外語系"];
      if (moeFitDepts.includes(p.dept)) {
        score += 9;
        reasons.push(`系所焦點 (${p.dept}) 與教育部在地永續及高教深耕指標直接鏈結 (+9分)`);
      }

      return { score, reasons, gapNote, targetType: "proj_moe" };
    }
  },

  proj_iac: {
    name: "企業產學合作計畫 (Industry-Academia Collaboration)",
    focus: "民生產業需求、配方改良、製程驗證、臨床人體實測、石化半導體工安技術",
    baseScore: 62,
    thresholds: { best: 85, second: 73, good: 60 },
    evalFn: (p) => {
      let score = 62;
      let reasons = [];
      let gapNote = "";

      // 具企業產學實績
      if (p.iacProjCount > 0) {
        const bonus = Math.min(22, p.iacProjCount * 11);
        score += bonus;
        reasons.push(`具企業產學合作實績 ${p.iacProjCount} 件 (總額達 NT$ ${p.iacFundingWan} 萬) (+${bonus}分)`);
      } else {
        gapNote = "具技術能力但缺乏企業通路，需由產學合作組媒合校友與企業客戶";
      }

      // 擁有專利或技轉紀錄
      if (p.patentsCount > 0 || p.ttCount > 0) {
        score += 14;
        reasons.push(`擁有獲證專利或技轉案 ${p.patentsCount + p.ttCount} 項，具產業專利信任度 (+14分)`);
      }

      // 具檢測、製程、配方研發能量
      const techDepts = ["生物科技與綠色產業系", "職業安全衛生系", "保健營養系", "健康美容系", "應用化學及材料科學系", "物理治療系"];
      if (techDepts.includes(p.dept)) {
        score += 9;
        reasons.push(`具備高商業化價值實驗室與配方製程技術檢測量能 (+9分)`);
      }

      return { score, reasons, gapNote, targetType: "proj_iac" };
    }
  },

  pat_inv: {
    name: "發明專利撰寫與申請 (Invention Patent)",
    focus: "突破性技術發明、微流體生醫晶片、綠色循環萃取配方、奈米高分子複合材料",
    baseScore: 60,
    thresholds: { best: 85, second: 73, good: 60 },
    evalFn: (p) => {
      let score = 60;
      let reasons = [];
      let gapNote = "";

      const sciPapers = p.papers.filter(paper => paper.subType.includes("SCI") || paper.subType.includes("EI"));
      const invGranted = p.patents.filter(patent => patent.subType.includes("發明專利(已獲證)"));
      const invPending = p.patents.filter(patent => patent.subType.includes("發明專利(申請中)"));

      // 【核心缺口演算法】：發表高水準 SCI/EI 實驗論文，卻尚未申請發明專利
      if (sciPapers.length > 0 && invGranted.length === 0 && invPending.length === 0) {
        score += 26;
        reasons.push(`【論文轉專利高價值缺口】已發表 SCI/EI 實驗期刊 ${sciPapers.length} 篇，但尚未布局發明專利！極具先期專利申請潛力 (+26分)`);
        gapNote = "已有豐碩實驗數據論文，研發創新組應主動委託事務所協助佈局發明專利";
      } else if (invGranted.length > 0 || invPending.length > 0) {
        const bonus = Math.min(24, invGranted.length * 12 + invPending.length * 8);
        score += bonus;
        reasons.push(`已具備發明專利獲證/申請經驗 ${invGranted.length + invPending.length} 件 (+${bonus}分)`);
      }

      // 國科會或大型研發案支持
      if (p.nstcCount > 0 || p.totalFundingWan >= 100) {
        score += 10;
        reasons.push("承接國科會/研發專案，產出技術具原創發明性 (+10分)");
      }

      // 高專利適性系所
      const patentSuitDepts = ["醫學檢驗生物技術系", "生物科技與綠色產業系", "應用化學及材料科學系", "環境工程與科學系", "健康美容系"];
      if (patentSuitDepts.includes(p.dept)) {
        score += 6;
        reasons.push(`系所性質 (${p.dept}) 具深厚發明專利授權潛力 (+6分)`);
      }

      return { score, reasons, gapNote, targetType: "pat_inv" };
    }
  },

  pat_util: {
    name: "新型／設計專利撰寫與輔具改良 (Utility & Design)",
    focus: "臨床實體結構改良、穿戴式護具、感測器排布、婦嬰健康照護機構、教具外觀",
    baseScore: 62,
    thresholds: { best: 85, second: 73, good: 60 },
    evalFn: (p) => {
      let score = 62;
      let reasons = [];
      let gapNote = "";

      const utilGranted = p.patents.filter(patent => patent.subType.includes("新型專利") || patent.subType.includes("設計專利"));
      if (utilGranted.length > 0) {
        const bonus = Math.min(22, utilGranted.length * 11);
        score += bonus;
        reasons.push(`已獲證新型/設計專利 ${utilGranted.length} 件 (+${bonus}分)`);
      }

      // 實體照護輔具與感測器改良系所
      const utilDepts = ["助產與婦嬰健康照護系", "物理治療系", "高齡及長期照護事業系", "職業安全衛生系", "幼兒保育暨產業系"];
      if (utilDepts.includes(p.dept)) {
        score += 15;
        reasons.push(`系所特色 (${p.dept}) 深度貼合臨床實體機構與輔具快速改良快速獲證 (+15分)`);
      } else {
        gapNote = "可將現行研究實驗室裝置拆解為單一結構申請新型專利";
      }

      // 現有計畫裝置拆解潛能
      if (p.totalProjectCount > 0) {
        score += 6;
        reasons.push("執行中計畫具實體裝置或教材模組化拆解潛力 (+6分)");
      }

      return { score, reasons, gapNote, targetType: "pat_util" };
    }
  },

  pat_tt: {
    name: "專利技術移轉與產學授權 (Tech Transfer)",
    focus: "專利技術商用化、實收權利金收益分配 (70% 教師 / 30% 學校)、產學聯合商品化",
    baseScore: 60,
    thresholds: { best: 85, second: 73, good: 60 },
    evalFn: (p) => {
      let score = 60;
      let reasons = [];
      let gapNote = "";

      const grantedPatents = p.patents.filter(patent => patent.subType.includes("已獲證") || patent.subType.includes("技術移轉"));

      // 曾有成功技轉紀錄
      if (p.ttCount > 0) {
        const bonus = Math.min(28, p.ttCount * 20 + Math.floor(p.ttRevenueWan / 10) * 2);
        score += bonus;
        reasons.push(`已有成功技轉實績 ${p.ttCount} 件 (實收技轉授權金累計 NT$ ${p.ttRevenueWan} 萬) (+${bonus}分)`);
      } else if (grantedPatents.length > 0) {
        // 【核心缺口演算法】：名下已有獲證專利，但尚未成功技轉！
        score += 22;
        reasons.push(`【專利沉睡轉化缺口】名下擁有 ${grantedPatents.length} 件獲證專利，尚未簽訂技轉合約！產學合作組應主動辦理媒合發表會 (+22分)`);
        gapNote = "名下已有完整專利證書，產學合作組應直接推介至科學園區或南部生技廠商洽談授權";
      }

      // 具專案研發與產學/國科會量能
      if (p.totalProjectCount > 0 || p.iacProjCount > 0) {
        score += 10;
        reasons.push(`承接研究/產學專案 (${p.totalProjectCount} 件)，具備技術落地與產學合作基礎 (+10分)`);
      }

      // 具高商業化系所加分
      const commDepts = ["生物科技與綠色產業系", "物理治療系", "健康美容系", "醫學檢驗生物技術系", "應用化學及材料科學系"];
      if (commDepts.includes(p.dept)) {
        score += 6;
        reasons.push(`系所領域 (${p.dept}) 技術商業化應用廣泛 (+6分)`);
      }

      return { score, reasons, gapNote, targetType: "pat_tt" };
    }
  }
};

/**
 * 聚合教師個人研發資歷與歷年產出
 * @param {Array} records 研發資料庫總表
 * @returns {Object} 教師聚合資歷 Map
 */
function aggregateTeacherProfiles(records) {
  const teacherMap = {};

  records.forEach(r => {
    if (!r.teacher) return;
    if (!teacherMap[r.teacher]) {
      teacherMap[r.teacher] = {
        name: r.teacher,
        empId: r.empId || "UNKNOWN",
        college: r.college,
        dept: r.dept,
        adminRole: r.adminRole || "專任教師",
        isArticle7Exempt: !!r.isArticle7Exempt,
        projects: [],
        papers: [],
        patents: [],
        keywords: new Set(),
        totalFundingWan: 0,
        nstcCount: 0,
        govProjCount: 0,
        moeProjCount: 0,
        iacProjCount: 0,
        iacFundingWan: 0,
        totalProjectCount: 0,
        patentsCount: 0,
        ttCount: 0,
        ttRevenueWan: 0
      };
    }

    const t = teacherMap[r.teacher];

    if (r.keywords && Array.isArray(r.keywords)) {
      r.keywords.forEach(kw => t.keywords.add(kw));
    }

    if (r.category === "計畫案") {
      t.projects.push(r);
      t.totalProjectCount++;
      const amt = Number(r.amount) || 0;
      t.totalFundingWan += amt;

      if (r.subType.includes("國科會")) t.nstcCount++;
      if (r.subType.includes("政府部會")) t.govProjCount++;
      if (r.subType.includes("教育部")) t.moeProjCount++;
      if (r.subType.includes("企業產學")) {
        t.iacProjCount++;
        t.iacFundingWan += amt;
      }
    } else if (r.category === "論文") {
      t.papers.push(r);
    } else if (r.category === "專利") {
      t.patents.push(r);
      t.patentsCount++;
      if (r.subType.includes("技術移轉")) {
        t.ttCount++;
        t.ttRevenueWan += (Number(r.amount) || 0);
      }
    }
  });

  return teacherMap;
}

/**
 * 針對特定目標類別，執行 32 位教師適配度計分與分級
 * @param {string} targetKey 類別代碼 (例如 proj_nstc)
 * @param {Array} records 研發資料庫總表
 * @returns {Object} 包含 cfg 與 candidates 排序陣列
 */
function evaluateCandidatesForTarget(targetKey, records) {
  const cfg = TARGET_WRITING_CONFIG[targetKey];
  if (!cfg) throw new Error(`未知的目標類別: ${targetKey}`);

  const teacherMap = aggregateTeacherProfiles(records);

  const candidates = Object.values(teacherMap).map(teacher => {
    const evalRes = cfg.evalFn(teacher);
    let finalScore = Math.min(99, Math.max(50, evalRes.score));

    let tier = "佳人選";
    let tierCode = "tier3";
    let strategy = "【第三波：基盤擴散導入】自動預填教師個人歷年成果，邀請參與跨院系研發社群與撰寫培訓營。";

    if (finalScore >= cfg.thresholds.best) {
      tier = "最佳人選";
      tierCode = "tier1";
      strategy = "【第一波：種子優先導入】系統自 GRB/國科會/GPSS/DOI 預填完整研究案，研發長專屬一對一邀約主持，指派專利事務所一對一專人撰寫！";
    } else if (finalScore >= cfg.thresholds.second) {
      tier = "次佳人選";
      tierCode = "tier2";
      strategy = "【第二波：跨域輔導導入】針對技術缺口精準診斷，由產學處媒合與最佳人選共同主持，推動高 IF 論文轉化專利申辦。";
    }

    return {
      name: teacher.name,
      empId: teacher.empId,
      college: teacher.college,
      dept: teacher.dept,
      adminRole: teacher.adminRole,
      isArticle7Exempt: teacher.isArticle7Exempt,
      score: finalScore,
      tier,
      tierCode,
      reasons: evalRes.reasons,
      gapNote: evalRes.gapNote,
      strategy,
      keywords: Array.from(teacher.keywords),
      stats: {
        totalFundingWan: teacher.totalFundingWan,
        projects: teacher.totalProjectCount,
        papers: teacher.papers.length,
        patents: teacher.patentsCount,
        ttRevenueWan: teacher.ttRevenueWan
      }
    };
  });

  candidates.sort((a, b) => b.score - a.score);

  return {
    targetKey,
    cfg,
    candidates,
    bestCount: candidates.filter(c => c.tier === "最佳人選").length,
    secondCount: candidates.filter(c => c.tier === "次佳人選").length,
    goodCount: candidates.filter(c => c.tier === "佳人選").length
  };
}

// 支援 Node.js CommonJS 與瀏覽器端 window 物件共用
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    TARGET_WRITING_CONFIG,
    aggregateTeacherProfiles,
    evaluateCandidatesForTarget
  };
}
if (typeof window !== "undefined") {
  window.RecommendationEngine = {
    TARGET_WRITING_CONFIG,
    aggregateTeacherProfiles,
    evaluateCandidatesForTarget
  };
}
