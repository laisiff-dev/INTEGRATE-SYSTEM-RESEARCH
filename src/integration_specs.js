/**
 * 輔英科技大學 研發處服務整合系統 - 跨處室系統介接適配器與資料匯出模組
 *
 * 整合三大處室與外部標準：
 * 1. 圖書暨資訊處 SSO (Library & Info Center Single Sign-On)
 * 2. 會計室經費管理與傳票核銷 (Accounting ERP & Voucher Issuance)
 * 3. 教育部技專校院校務基本資料庫 (MOE TVEDB Export Engine)
 */

const IntegrationSpecs = {
  // 1. 圖書暨資訊處 SSO 規格與身分模擬適配器
  sso: {
    endpoints: {
      issuer: "https://inf.fy.edu.tw/sso/v2",
      authorize: "https://inf.fy.edu.tw/sso/v2/authorize",
      token: "https://inf.fy.edu.tw/sso/v2/token",
      userinfo: "https://inf.fy.edu.tw/sso/v2/userinfo",
      logout: "https://inf.fy.edu.tw/sso/v2/logout"
    },
    mockProfiles: {
      dean: {
        empId: "ZH177",
        name: "賴文亮",
        title: "特聘教授兼研發長",
        college: "環境與生命學院",
        dept: "環境工程與科學系",
        role: "DEAN",
        roleLabel: "賴文亮 研發長（全校總覽與最佳人選決策）",
        isArticle7Exempt: true,
        article7Note: "依人事室《專任教師評鑑辦法》第七條，兼任行政主管教師得僅評教學基本指標（研究項目自動達標）"
      },
      hq: {
        empId: "HQ001",
        name: "處本部承辦人",
        title: "編纂兼處本部組長",
        college: "研發與永續發展處",
        dept: "處本部",
        role: "HQ_STAFF",
        roleLabel: "研發處 處本部（私校獎補助/深耕/校務會議彙報）",
        isArticle7Exempt: true,
        article7Note: "處本部行政主管主管加給"
      },
      iac: {
        empId: "IAC001",
        name: "產學組專員",
        title: "專任專案副理",
        college: "研發與永續發展處",
        dept: "產學合作組",
        role: "IAC_STAFF",
        roleLabel: "研發處 產學合作組（產學計畫/政府委辦/專利技轉管考）",
        isArticle7Exempt: false,
        article7Note: "一般職員"
      },
      rdi: {
        empId: "RDI001",
        name: "研創組組員",
        title: "專案助理",
        college: "研發與永續發展處",
        dept: "研發創新組",
        role: "RDI_STAFF",
        roleLabel: "研發處 研發創新組（國科會計畫/論文/專利獎勵金審核）",
        isArticle7Exempt: false,
        article7Note: "一般職員"
      },
      teacher: {
        empId: "T0000010996",
        name: "李美誼",
        title: "專任副教授",
        college: "醫學與健康學院",
        dept: "物理治療系",
        role: "TEACHER",
        roleLabel: "李美誼 副教授（學院系所教師：個人成果預填確認與評鑑點數試算）",
        isArticle7Exempt: false,
        article7Note: "專任教師，適用完整教師評鑑標準（國科會/產學/論文/專利獲證）"
      }
    }
  },

  // 2. 會計室 ERP 經費動支與傳票核銷適配器
  accounting: {
    verifyVoucher: function(accCode, projectAmountWan = 0) {
      const rate = Math.floor(Math.random() * 40) + 60; // 模擬 60% ~ 99%
      const overheadRate = 0.08;
      const overheadNTD = projectAmountWan * 10000 * overheadRate;
      const flexibleBudgetNTD = Math.min(50000, Math.round(overheadNTD * 0.20));

      return {
        accCode: accCode || "ACC-MOCK-999",
        status: "VERIFIED",
        disbursementRate: rate,
        overheadNTD,
        flexibleBudgetNTD,
        notes: `會計室主檔核可，已支用率 ${rate}%，核算彈性支用額度 NT$ ${flexibleBudgetNTD}`
      };
    },
    issueRewardVoucher: function(record, amountNTD) {
      const year = new Date().getFullYear() - 1911;
      const seq = Math.floor(1000 + Math.random() * 9000);
      const voucherNo = `V-${year}-${seq}`;
      return {
        status: "ISSUED",
        voucherNo,
        recordId: record.id,
        teacher: record.teacher,
        amountNTD,
        issuedDate: new Date().toISOString().slice(0, 10),
        disbursementStatus: "已產出會計傳票待過帳"
      };
    }
  },

  // 3. 教育部技專校院校務基本資料庫 (MOE TVEDB) 報表產製引擎
  tvedb: {
    generateTable4_7CSV: function(records) {
      const patentRows = records.filter(r => r.category === "專利");
      let csv = "\uFEFF學校代碼,學年度,學院代碼,學院名稱,系所名稱,代表發明人,教職員號,成果類別,專利類型,專利或技轉名稱,專利證書號或案號,實收技轉金額(元),審核狀態\n";

      patentRows.forEach(r => {
        const amtNTD = (r.subType.includes("技術移轉") && r.amount) ? Math.round(r.amount * 10000) : 0;
        csv += `1040,${r.year},,"${r.college}","${r.dept}","${r.teacher}","${r.empId || ''}","專利","${r.subType}","${r.title.replace(/"/g, '""')}","${r.code}",${amtNTD},"${r.status}"\n`;
      });
      return csv;
    },

    generateTable4_8CSV: function(records) {
      const paperRows = records.filter(r => r.category === "論文");
      let csv = "\uFEFF學校代碼,發表學年度,學院名稱,系所名稱,作者姓名,作者順序,收錄索引資料庫,論文篇名,DOI或識別碼,影響指數(IF)/備註,審核狀態\n";

      paperRows.forEach(r => {
        csv += `1040,${r.year},"${r.college}","${r.dept}","${r.teacher}","${r.authorOrder || '第一作者'}","${r.subType}","${r.title.replace(/"/g, '""')}","${r.code}","${r.metricNote || ''}","${r.status}"\n`;
      });
      return csv;
    },

    generateTable4_10CSV: function(records) {
      const projRows = records.filter(r => r.category === "計畫案");
      let csv = "\uFEFF學校代碼,填報學年度,學院名稱,系所名稱,計畫主持人,計畫類型,計畫完整名稱,官方計畫案號,會計管控代碼,核定總金額(元),審核狀態\n";

      projRows.forEach(r => {
        const amtNTD = (r.amount || 0) * 10000;
        csv += `1040,${r.year},"${r.college}","${r.dept}","${r.teacher}","${r.subType}","${r.title.replace(/"/g, '""')}","${r.code}","${r.accCode || ''}",${amtNTD},"${r.status}"\n`;
      });
      return csv;
    }
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = IntegrationSpecs;
}
if (typeof window !== "undefined") {
  window.IntegrationSpecs = IntegrationSpecs;
}
