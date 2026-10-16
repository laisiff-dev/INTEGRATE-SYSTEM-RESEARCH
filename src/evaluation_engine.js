/**
 * 輔英科技大學 研發處服務整合系統 - 獎勵金與專任教師評鑑點數核算公式引擎
 *
 * 法規依據：
 * 1. 輔英科技大學《研究成果與產學績效獎勵辦法》(研發處)
 *    https://etc.fy.edu.tw/p/412-1054-510.php?Lang=zh-tw
 * 2. 輔英科技大學《專任教師評鑑辦法》(人事室，特別落實第七條兼行政主管豁免條款)
 *    https://epn.fy.edu.tw/p/412-1055-6611.php?Lang=zh-tw
 * 3. 輔英科技大學《執行計畫彈性支用額度作業要點》(會計室)
 *    https://eac.fy.edu.tw/p/412-1056-10422.php
 */

// 預設可調參數 (系統支援使用者於介面即時動態調整)
const DEFAULT_FORMULA_CONFIG = {
  // 期刊論文獎勵金 (元)
  rewardPaperSciQ1: 30000,
  rewardPaperSciGen: 20000,
  rewardPaperSsci: 20000,
  rewardPaperEi: 12000,
  rewardPaperTssci: 12000,
  rewardPaperScopus: 6000,
  rewardPaperConf: 3000,

  // 專利與技轉獎勵金 (元)
  rewardPatentInvGrant: 15000,
  rewardPatentInvApp: 5000,
  rewardPatentUtilGrant: 5000,
  rewardPatentDesGrant: 5000,
  royaltyTeacherSplitRatio: 0.70, // 技轉金教師分配比率 70%

  // 會計室計畫彈性支用額度
  overheadRate: 0.08,             // 行政管理費提撥率 8%
  flexibleBudgetRatio: 0.20,       // 彈性支用額度為管理費之 20%
  flexibleBudgetCap: 50000,        // 單案上限 5 萬元

  // 教師評鑑點數基準 (人事室)
  ptsProjNstcBase: 50,
  ptsProjGovIacBase: 35,
  ptsProjInternalBase: 15,
  ptsProjPer50WanBonus: 10,       // 計畫每滿 50 萬元加計點數

  ptsPaperSciQ1: 50,
  ptsPaperSciGen: 40,
  ptsPaperSsci: 40,
  ptsPaperEi: 25,
  ptsPaperTssci: 25,
  ptsPaperScopus: 15,
  ptsPaperConf: 10,

  ptsPatentInvGrant: 35,
  ptsPatentInvApp: 10,
  ptsPatentUtilGrant: 15,
  ptsPatentDesGrant: 15,
  ptsPatentTtBase: 30,
  ptsPatentTtPer10WanBonus: 8      // 技轉每滿 10 萬元加計點數
};

/**
 * 依作者排序判斷折算係數
 * @param {string} authorOrder 作者序描述
 * @param {number} fallbackRatio 預設係數
 * @returns {number} 折算係數 (0.0 ~ 1.0)
 */
function resolveAuthorWeightRatio(authorOrder, fallbackRatio) {
  if (typeof fallbackRatio === "number" && fallbackRatio > 0) return fallbackRatio;
  if (!authorOrder) return 1.0;
  if (authorOrder.includes("通訊作者") || authorOrder.includes("第一作者") || authorOrder.includes("計畫主持人") || authorOrder.includes("第一發明人") || authorOrder.includes("代表發明人")) {
    return 1.0;
  }
  if (authorOrder.includes("第二作者") || authorOrder.includes("第二發明人") || authorOrder.includes("共同主持人")) {
    return 0.5;
  }
  if (authorOrder.includes("第三作者") || authorOrder.includes("協同")) {
    return 0.25;
  }
  return 1.0;
}

/**
 * 依人事室《專任教師評鑑辦法》第七條判別是否符合行政免評或特約指標
 * 條文要點：兼任行政主管之專任教師，得僅受教學基本指標評鑑，免受研究項目評鑑或視同通過。
 * @param {Object} teacherRecord 教師紀錄或其職稱
 * @returns {Object} 判定結果與法規說明
 */
function checkArticle7Exemption(teacherRecord) {
  const role = teacherRecord.adminRole || "";
  const isExempt = !!teacherRecord.isArticle7Exempt ||
                   role.includes("校長") ||
                   role.includes("副校長") ||
                   role.includes("主任秘書") ||
                   role.includes("主秘") ||
                   role.includes("研發長") ||
                   role.includes("教務長") ||
                   role.includes("學務長") ||
                   role.includes("總務長") ||
                   role.includes("處長") ||
                   role.includes("國際長") ||
                   role.includes("圖資長") ||
                   role.includes("院長") ||
                   role.includes("副院長") ||
                   role.includes("系主任") ||
                   role.includes("副主任") ||
                   role.includes("主任") ||
                   role.includes("兼任行政主管") ||
                   role.includes("組長");

  return {
    isExempt,
    ruleClause: "人事室《專任教師評鑑辦法》第七條",
    description: isExempt
      ? "符合第7條規定：兼任行政主管教師得僅評教學基本指標（免受研究項目評鑑，系統標註自動達標）。"
      : "一般專任教師：需依規定核算研究與產學評鑑點數。"
  };
}

/**
 * 單筆研發紀錄獎勵金與教師評鑑點數計算
 * @param {Object} record 單筆研發成果紀錄
 * @param {Object} customConfig 可調參數覆蓋
 * @returns {Object} 核算結果 (獎勵金、評鑑點數、彈性支用額度、說明明細)
 */
function calculateRecordBenefits(record, customConfig = {}) {
  const cfg = { ...DEFAULT_FORMULA_CONFIG, ...customConfig };
  const weightRatio = resolveAuthorWeightRatio(record.authorOrder, record.weightRatio);
  const article7 = checkArticle7Exemption(record);

  let rewardAmount = 0;       // 研發獎勵金 (元)
  let evalPoints = 0;         // 人事評鑑點數 (點)
  let flexibleBudget = 0;     // 會計彈性支用額度 (元)
  let calculationDetails = [];

  const amountWan = Number(record.amount) || 0;

  if (record.category === "計畫案") {
    // 評鑑點數計算
    if (record.subType.includes("國科會")) {
      const bonus = Math.floor(amountWan / 50) * cfg.ptsProjPer50WanBonus;
      evalPoints = (cfg.ptsProjNstcBase + bonus) * weightRatio;
      calculationDetails.push(`國科會專題基準 ${cfg.ptsProjNstcBase} 點 + 經費級距 (${amountWan}萬) 加計 ${bonus} 點`);
    } else if (record.subType.includes("校內")) {
      evalPoints = cfg.ptsProjInternalBase * weightRatio;
      calculationDetails.push(`校內先期計畫基準 ${cfg.ptsProjInternalBase} 點`);
    } else {
      // 政府部會委辦或企業產學或教育部補助
      const bonus = Math.floor(amountWan / 50) * cfg.ptsProjPer50WanBonus;
      evalPoints = (cfg.ptsProjGovIacBase + bonus) * weightRatio;
      calculationDetails.push(`產學/部會/深耕基準 ${cfg.ptsProjGovIacBase} 點 + 經費級距 (${amountWan}萬) 加計 ${bonus} 點`);
    }

    // 會計室彈性支用額度試算 (管理費 8% 中提撥 20%，單案上限 5 萬)
    const overhead = amountWan * 10000 * cfg.overheadRate;
    flexibleBudget = Math.min(cfg.flexibleBudgetCap, overhead * cfg.flexibleBudgetRatio);
    calculationDetails.push(`會計彈性支用額度: 管理費 NT$ ${Math.round(overhead)} × ${cfg.flexibleBudgetRatio * 100}% = NT$ ${Math.round(flexibleBudget)} (上限 5 萬)`);

  } else if (record.category === "論文") {
    let baseReward = 0;
    let basePoints = 0;

    const ifScore = Number(record.ifScore) || 0;
    const isQ1 = ifScore >= 5.0 || (record.metricNote && record.metricNote.includes("Q1"));

    if (record.subType.includes("SCI")) {
      if (isQ1) {
        baseReward = cfg.rewardPaperSciQ1;
        basePoints = cfg.ptsPaperSciQ1;
        calculationDetails.push(`SCI 頂尖期刊(Q1/IF≥5) 基準獎金 NT$ ${baseReward}，評鑑點數 ${basePoints} 點`);
      } else {
        baseReward = cfg.rewardPaperSciGen;
        basePoints = cfg.ptsPaperSciGen;
        calculationDetails.push(`SCI 一般期刊 基準獎金 NT$ ${baseReward}，評鑑點數 ${basePoints} 點`);
      }
    } else if (record.subType.includes("SSCI")) {
      baseReward = cfg.rewardPaperSsci;
      basePoints = cfg.ptsPaperSsci;
      calculationDetails.push(`SSCI 國際期刊 基準獎金 NT$ ${baseReward}，評鑑點數 ${basePoints} 點`);
    } else if (record.subType.includes("EI")) {
      baseReward = cfg.rewardPaperEi;
      basePoints = cfg.ptsPaperEi;
      calculationDetails.push(`EI 工程索引期刊 基準獎金 NT$ ${baseReward}，評鑑點數 ${basePoints} 點`);
    } else if (record.subType.includes("TSSCI") || record.subType.includes("THCI")) {
      baseReward = cfg.rewardPaperTssci;
      basePoints = cfg.ptsPaperTssci;
      calculationDetails.push(`TSSCI/THCI 核心期刊 基準獎金 NT$ ${baseReward}，評鑑點數 ${basePoints} 點`);
    } else if (record.subType.includes("Scopus")) {
      baseReward = cfg.rewardPaperScopus;
      basePoints = cfg.ptsPaperScopus;
      calculationDetails.push(`Scopus 收錄期刊 基準獎金 NT$ ${baseReward}，評鑑點數 ${basePoints} 點`);
    } else {
      baseReward = cfg.rewardPaperConf;
      basePoints = cfg.ptsPaperConf;
      calculationDetails.push(`一般學術期刊/研討會 基準獎金 NT$ ${baseReward}，評鑑點數 ${basePoints} 點`);
    }

    rewardAmount = baseReward * weightRatio;
    evalPoints = basePoints * weightRatio;
    calculationDetails.push(`作者序折算比率: ${Math.round(weightRatio * 100)}% (實領獎金 NT$ ${Math.round(rewardAmount)}, 實得點數 ${evalPoints})`);

  } else if (record.category === "專利") {
    if (record.subType.includes("技術移轉")) {
      // 技轉實收權利金分配
      const teacherSplit = amountWan * 10000 * cfg.royaltyTeacherSplitRatio;
      rewardAmount = teacherSplit;
      const bonus = Math.floor(amountWan / 10) * cfg.ptsPatentTtPer10WanBonus;
      evalPoints = (cfg.ptsPatentTtBase + bonus) * weightRatio;
      calculationDetails.push(`實收技轉授權金 NT$ ${amountWan} 萬，教師依 ${cfg.royaltyTeacherSplitRatio * 100}% 分配得 NT$ ${Math.round(teacherSplit)}`);
      calculationDetails.push(`技轉評鑑基準 ${cfg.ptsPatentTtBase} 點 + 級距加計 ${bonus} 點 = ${evalPoints} 點`);
    } else if (record.subType.includes("發明專利(已獲證)")) {
      rewardAmount = cfg.rewardPatentInvGrant * weightRatio;
      evalPoints = cfg.ptsPatentInvGrant * weightRatio;
      calculationDetails.push(`獲證發明專利: 獎金 NT$ ${cfg.rewardPatentInvGrant} × ${weightRatio} = NT$ ${rewardAmount}，評鑑 ${evalPoints} 點`);
    } else if (record.subType.includes("發明專利(申請中)")) {
      rewardAmount = cfg.rewardPatentInvApp * weightRatio;
      evalPoints = cfg.ptsPatentInvApp * weightRatio;
      calculationDetails.push(`申請中發明專利: 申請補助 NT$ ${cfg.rewardPatentInvApp} × ${weightRatio} = NT$ ${rewardAmount}，評鑑 ${evalPoints} 點`);
    } else if (record.subType.includes("新型專利")) {
      rewardAmount = cfg.rewardPatentUtilGrant * weightRatio;
      evalPoints = cfg.ptsPatentUtilGrant * weightRatio;
      calculationDetails.push(`獲證新型專利: 獎金 NT$ ${cfg.rewardPatentUtilGrant} × ${weightRatio} = NT$ ${rewardAmount}，評鑑 ${evalPoints} 點`);
    } else if (record.subType.includes("設計專利")) {
      rewardAmount = cfg.rewardPatentDesGrant * weightRatio;
      evalPoints = cfg.ptsPatentDesGrant * weightRatio;
      calculationDetails.push(`獲證設計專利: 獎金 NT$ ${cfg.rewardPatentDesGrant} × ${weightRatio} = NT$ ${rewardAmount}，評鑑 ${evalPoints} 點`);
    }
  }

  return {
    recordId: record.id,
    teacher: record.teacher,
    category: record.category,
    subType: record.subType,
    weightRatio,
    rewardAmount: Math.round(rewardAmount),
    evalPoints: Math.round(evalPoints * 10) / 10,
    flexibleBudget: Math.round(flexibleBudget),
    article7,
    details: calculationDetails
  };
}

/**
 * 批次彙整教師總所得獎金與全校人事評鑑點數清冊
 * @param {Array} records 研發紀錄陣列
 * @param {Object} customConfig 自訂公式參數
 * @returns {Object} 彙總報告
 */
function calculateBatchFacultySummary(records, customConfig = {}) {
  const teacherSummary = {};
  let totalRewardSum = 0;
  let totalFlexibleBudgetSum = 0;
  let totalEvalPointsSum = 0;

  records.forEach(r => {
    const res = calculateRecordBenefits(r, customConfig);
    const name = r.teacher || "未知教師";

    if (!teacherSummary[name]) {
      teacherSummary[name] = {
        name,
        empId: r.empId || "UNKNOWN",
        college: r.college,
        dept: r.dept,
        adminRole: r.adminRole || "專任教師",
        isArticle7Exempt: res.article7.isExempt,
        article7Text: res.article7.description,
        totalRewardNTD: 0,
        totalFlexibleBudgetNTD: 0,
        totalEvalPoints: 0,
        itemCount: 0,
        records: []
      };
    }

    teacherSummary[name].totalRewardNTD += res.rewardAmount;
    teacherSummary[name].totalFlexibleBudgetNTD += res.flexibleBudget;
    teacherSummary[name].totalEvalPoints += res.evalPoints;
    teacherSummary[name].itemCount++;
    teacherSummary[name].records.push(res);

    totalRewardSum += res.rewardAmount;
    totalFlexibleBudgetSum += res.flexibleBudget;
    totalEvalPointsSum += res.evalPoints;
  });

  const facultyList = Object.values(teacherSummary).map(f => {
    f.totalEvalPoints = Math.round(f.totalEvalPoints * 10) / 10;
    return f;
  });

  facultyList.sort((a, b) => b.totalRewardNTD - a.totalRewardNTD);

  return {
    totalRecordsProcessed: records.length,
    totalRewardSum,
    totalFlexibleBudgetSum,
    totalEvalPointsSum: Math.round(totalEvalPointsSum * 10) / 10,
    facultyList
  };
}

// 支援 Node.js 與前端 Window 環境
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    DEFAULT_FORMULA_CONFIG,
    resolveAuthorWeightRatio,
    checkArticle7Exemption,
    calculateRecordBenefits,
    calculateBatchFacultySummary
  };
}
if (typeof window !== "undefined") {
  window.EvaluationEngine = {
    DEFAULT_FORMULA_CONFIG,
    resolveAuthorWeightRatio,
    checkArticle7Exemption,
    calculateRecordBenefits,
    calculateBatchFacultySummary
  };
}
