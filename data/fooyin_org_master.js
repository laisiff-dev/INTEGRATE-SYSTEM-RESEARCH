/**
 * 輔英科技大學 4 院 16 系所與研發處組織主檔
 */
const FOOYIN_ORG_MASTER = {
  "institution": {
    "nameZh": "輔英科技大學",
    "nameEn": "Fooyin University",
    "code": "0242",
    "officialUrl": "https://www.fy.edu.tw/",
    "academicUnitsUrl": "https://www.fy.edu.tw/p/412-1032-8760.php?Lang=zh-tw",
    "rdOfficeUrl": "https://etc.fy.edu.tw/",
    "tvedbSchoolId": "1040"
  },
  "rdOffice": {
    "title": "研究與產學發展處 (Office of Research and Development)",
    "leadership": {
      "title": "研發長",
      "name": "賴文亮",
      "academicTitle": "特聘教授",
      "department": "環境工程與科學系",
      "article7Exempt": true,
      "article7Description": "依據人事室《專任教師評鑑辦法》第七條，兼任行政主管教師得僅評教學基本指標，免評研究項目或視為達標。"
    },
    "divisions": [
      {
        "id": "HQ",
        "name": "處本部",
        "nameEn": "Division of Central Administration",
        "duties": [
          "統籌全校年度研發策略與法規研擬",
          "私立技專校院整體發展獎補助經費支用計畫研發項目規劃與管考",
          "教育部技專校院校務基本資料庫彙整與報部 (表4-7、4-8、4-10)",
          "推動教師進行6年6個月以上產業研習與深耕"
        ]
      },
      {
        "id": "IAC",
        "name": "產學合作組",
        "nameEn": "Division of Industry-Academia Collaboration",
        "duties": [
          "企業產學合作計畫之合約簽署、請款、進度及結案管考",
          "政府部會 (勞動部、衛福部、環境部、經濟部等) 委辦計畫之推動與行政核銷",
          "專利技術移轉、授權合約簽署與實收權利金分配試算 (教師70% / 學校30%)",
          "校級產學合作績優教師獎勵審查與推薦"
        ]
      },
      {
        "id": "RDI",
        "name": "研發創新組",
        "nameEn": "Division of Research and Innovation",
        "duties": [
          "國科會 (NSTC) 專題研究計畫之徵件、送件、簽約與成果報告管考",
          "SCI/SSCI/EI/TSSCI 期刊論文與國際學術發表獎勵審核與獎金發放",
          "專利申請補助、專利獲證獎勵與維護年費審議",
          "校內先期產學研究補助與跨領域研發社群輔導"
        ]
      }
    ]
  },
  "colleges": [
    {
      "collegeId": "NURS",
      "nameZh": "護理學院",
      "nameEn": "College of Nursing",
      "departments": [
        {
          "deptId": "NURS_01",
          "nameZh": "護理系",
          "nameEn": "Department of Nursing",
          "programs": ["學士班", "日間碩士班", "碩士在職專班", "四技", "二技", "五專"],
          "focusKeywords": ["臨床照護", "智慧護理", "長照精準照護", "急重症臨床實踐", "護理資訊學"]
        },
        {
          "deptId": "NURS_02",
          "nameZh": "助產與婦嬰健康照護系",
          "nameEn": "Department of Midwifery and Women-Child Healthcare",
          "programs": ["學士班", "碩士班", "二技"],
          "focusKeywords": ["友善生產", "母嬰生理監測", "產後照護", "婦嬰健康輔具", "泌乳支持"]
        },
        {
          "deptId": "NURS_03",
          "nameZh": "健康事業管理系",
          "nameEn": "Department of Health Care Administration",
          "programs": ["學士班", "碩士班", "碩士在職專班", "四技", "二技"],
          "focusKeywords": ["醫療資訊系統", "醫院評鑑", "分級醫療成效", "長照大數據", "醫務管理"]
        },
        {
          "deptId": "NURS_04",
          "nameZh": "高齡及長期照護事業系",
          "nameEn": "Department of Senior Citizen and Long-Term Care",
          "programs": ["學士班", "碩士班", "四技", "二技"],
          "focusKeywords": ["失智症照護", "高齡友善環境", "遠距健康監測", "照護機器人", "銀髮輔具開發"]
        }
      ]
    },
    {
      "collegeId": "MED",
      "nameZh": "醫學與健康學院",
      "nameEn": "College of Medical and Health Sciences",
      "departments": [
        {
          "deptId": "MED_01",
          "nameZh": "醫學檢驗生物技術系",
          "nameEn": "Department of Medical Laboratory Science and Biotechnology",
          "programs": ["學士班", "碩士班", "四技", "二技"],
          "focusKeywords": ["微流體生物晶片", "分子診斷", "病原體多重檢測", "臨床檢驗精準醫療", "生醫檢測"]
        },
        {
          "deptId": "MED_02",
          "nameZh": "物理治療系",
          "nameEn": "Department of Physical Therapy",
          "programs": ["學士班", "碩士班", "四技"],
          "focusKeywords": ["關節角度感測", "智慧穿戴復健", "肌力強化訓練", "神經物理治療", "下肢復健輔具"]
        },
        {
          "deptId": "MED_03",
          "nameZh": "保健營養系",
          "nameEn": "Department of Nutrition and Health Sciences",
          "programs": ["學士班", "碩士班", "碩士在職專班", "四技"],
          "focusKeywords": ["機能性植化素", "精準營養補充品", "肌少症營養處方", "食品生技發酵", "臨床營養評估"]
        },
        {
          "deptId": "MED_04",
          "nameZh": "健康美容系",
          "nameEn": "Department of Health and Beauty",
          "programs": ["學士班", "四技", "二技"],
          "focusKeywords": ["植物外泌體", "綠色化妝品配方", "毛囊賦活精華", "皮膚生理感測", "頭皮抗衰老"]
        }
      ]
    },
    {
      "collegeId": "ENV",
      "nameZh": "環境與生命學院",
      "nameEn": "College of Environment and Life Sciences",
      "departments": [
        {
          "deptId": "ENV_01",
          "nameZh": "環境工程與科學系",
          "nameEn": "Department of Environmental Engineering and Science",
          "programs": ["學士班", "碩士班", "四技"],
          "focusKeywords": ["新興污染物降解", "高級氧化程序", "低碳生物膜", "工業廢水循環", "碳盤查與ESG"]
        },
        {
          "deptId": "ENV_02",
          "nameZh": "生物科技與綠色產業系",
          "nameEn": "Department of Applied Biotechnology and Green Industry",
          "programs": ["學士班", "碩士班", "四技"],
          "focusKeywords": ["微藻綠色萃取", "低碳循環生技", "機能性多醣體", "生質能源", "農業副產物加值"]
        },
        {
          "deptId": "ENV_03",
          "nameZh": "應用化學及材料科學系",
          "nameEn": "Department of Applied Chemistry and Materials Science",
          "programs": ["學士班", "碩士班", "四技"],
          "focusKeywords": ["介孔碳奈米複合材料", "重金屬吸附", "綠色化學合成", "電池儲能材料", "導電高分子"]
        },
        {
          "deptId": "ENV_04",
          "nameZh": "職業安全衛生系",
          "nameEn": "Department of Occupational Safety and Health",
          "programs": ["學士班", "碩士班", "碩士在職專班", "四技"],
          "focusKeywords": ["有害氣體智慧監測", "半導體作業環境監測", "工業毒物風險評估", "物聯網工安預警", "人因工程"]
        }
      ]
    },
    {
      "collegeId": "HUM",
      "nameZh": "人文與管理學院",
      "nameEn": "College of Humanities and Management",
      "departments": [
        {
          "deptId": "HUM_01",
          "nameZh": "幼兒保育暨產業系",
          "nameEn": "Department of Early Childhood Care and Education",
          "programs": ["學士班", "四技", "二技"],
          "focusKeywords": ["老幼共融共學", "幼兒情緒發展評估", "托育科技輔具", "蒙特梭利實踐", "社區家庭支持"]
        },
        {
          "deptId": "HUM_02",
          "nameZh": "休閒與遊憩事業管理系",
          "nameEn": "Department of Leisure and Recreation Management",
          "programs": ["學士班", "四技"],
          "focusKeywords": ["高齡森林療癒", "健康療癒旅遊", "銀髮體適能休閒", "永續觀光USR", "高齡活動設計"]
        },
        {
          "deptId": "HUM_03",
          "nameZh": "資訊科技與管理系",
          "nameEn": "Department of Information Technology and Management",
          "programs": ["學士班", "四技"],
          "focusKeywords": ["校務研究 (IR) 演算法", "生成式 AI 決策系統", "智慧醫護排班", "醫療物聯網", "雲端資料倉儲"]
        },
        {
          "deptId": "HUM_04",
          "nameZh": "應用外語系",
          "nameEn": "Department of Applied Foreign Languages",
          "programs": ["學士班", "四技"],
          "focusKeywords": ["醫護專業英語 (ESP)", "EMI 沉浸式雙語教學", "醫療口筆譯", "跨文化健康照護溝通", "全球公衛語料庫"]
        }
      ]
    }
  ],
  "categoriesAndSubtypes": {
    "計畫案": {
      "code": "PROJ",
      "label": "計畫案 (Research & Collaboration Projects)",
      "subTypes": [
        { "id": "proj_nstc", "name": "國科會專題研究計畫", "govCode": "1", "basePoints": 50 },
        { "id": "proj_moe", "name": "教育部補助計畫(深耕/USR/教學實踐)", "govCode": "2", "basePoints": 35 },
        { "id": "proj_gov", "name": "政府部會委辦計畫", "govCode": "3", "basePoints": 35 },
        { "id": "proj_iac", "name": "企業產學合作計畫", "govCode": "4", "basePoints": 35 },
        { "id": "proj_int", "name": "校內先期產學/研發補助", "govCode": "5", "basePoints": 15 }
      ]
    },
    "論文": {
      "code": "PAPER",
      "label": "學術論文 (Scholarly Publications)",
      "subTypes": [
        { "id": "paper_sci_q1", "name": "SCI 國際期刊 (Q1/IF≥5)", "govCode": "A1", "basePoints": 50, "rewardWan": 3.0 },
        { "id": "paper_sci_gen", "name": "SCI 國際期刊 (一般)", "govCode": "A2", "basePoints": 40, "rewardWan": 2.0 },
        { "id": "paper_ssci", "name": "SSCI 國際期刊", "govCode": "B", "basePoints": 40, "rewardWan": 2.0 },
        { "id": "paper_ei", "name": "EI 工程索引期刊", "govCode": "C", "basePoints": 25, "rewardWan": 1.2 },
        { "id": "paper_tssci", "name": "TSSCI / THCI 核心期刊", "govCode": "D", "basePoints": 25, "rewardWan": 1.2 },
        { "id": "paper_scopus", "name": "Scopus 收錄期刊", "govCode": "E", "basePoints": 15, "rewardWan": 0.6 },
        { "id": "paper_conf", "name": "一般學術期刊/國際研討會", "govCode": "F", "basePoints": 10, "rewardWan": 0.3 }
      ]
    },
    "專利": {
      "code": "PATENT",
      "label": "專利與技轉 (Patents & Technology Transfers)",
      "subTypes": [
        { "id": "pat_inv_grant", "name": "發明專利(已獲證)", "govCode": "P1", "basePoints": 35, "rewardWan": 1.5 },
        { "id": "pat_inv_app", "name": "發明專利(申請中)", "govCode": "P2", "basePoints": 10, "rewardWan": 0.5 },
        { "id": "pat_util_grant", "name": "新型專利(已獲證)", "govCode": "P3", "basePoints": 15, "rewardWan": 0.5 },
        { "id": "pat_des_grant", "name": "設計專利(已獲證)", "govCode": "P4", "basePoints": 15, "rewardWan": 0.5 },
        { "id": "pat_tt_active", "name": "專利技術移轉/授權案", "govCode": "T1", "basePoints": 30, "royaltyTeacherRatio": 0.7 }
      ]
    }
  }
}
;

if (typeof window !== "undefined") {
  window.FOOYIN_ORG_MASTER = FOOYIN_ORG_MASTER;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = FOOYIN_ORG_MASTER;
}
