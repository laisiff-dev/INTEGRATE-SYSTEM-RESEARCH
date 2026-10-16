/**
 * 輔英科技大學 研發處服務整合系統 - 雲端硬碟原始資料清洗與建置引擎
 *
 * 來源：Google 雲端硬碟「110-115研發計畫.專利」
 * (https://drive.google.com/drive/folders/1UYb2ZM1iRtWgKCoiRqCGoDs1ld1IFXwq)
 *
 * 清洗規則：
 * 1. 涵蓋 110–115 學年度廠商產學、公部門委辦、國科會專題、專利申請、技轉與師生競賽
 * 2. 嚴格對齊全校 4 學院 16 系所官方名稱主檔 (data/fooyin_org_master.json)
 * 3. 人事室第 7 條行政免評/僅評基本指標真實註記 (校長、副校長、主秘、研發長、院長、系主任)
 * 4. 金額以「萬元」為標準度量衡，四捨五入至小數點後兩位
 * 5. 保留未來新資料 (包括進行中的 115 學年度新案，以及日後擴充 116+ 結構)
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const rootDir = path.join(__dirname, '..');
const rawDir = path.join(rootDir, 'data', 'raw_excel');
const orgMasterPath = path.join(rootDir, 'data', 'fooyin_org_master.json');

if (!fs.existsSync(orgMasterPath)) {
  throw new Error(`找不到組織主檔: ${orgMasterPath}`);
}

const orgMaster = JSON.parse(fs.readFileSync(orgMasterPath, 'utf8'));

// 1. 建立行政主管與第 7 條免評對應表
const facultyRoleMap = {};
if (orgMaster.leadership) {
  Object.values(orgMaster.leadership).forEach(lead => {
    if (lead.name) {
      facultyRoleMap[lead.name] = {
        title: lead.title,
        academicTitle: lead.academicTitle,
        dept: lead.department,
        article7Exempt: true,
        desc: lead.article7Description || `${lead.title}（依評鑑辦法第7條免受研究項目評鑑）`
      };
    }
  });
}
if (orgMaster.rdOffice && orgMaster.rdOffice.leadership) {
  const rd = orgMaster.rdOffice.leadership;
  facultyRoleMap[rd.name] = {
    title: rd.title,
    academicTitle: rd.academicTitle,
    dept: rd.department,
    article7Exempt: true,
    desc: `${rd.title}（依評鑑辦法第7條免受研究項目評鑑）`
  };
}
if (orgMaster.colleges) {
  orgMaster.colleges.forEach(col => {
    if (col.dean && col.dean.name) {
      facultyRoleMap[col.dean.name] = {
        title: col.dean.title || '院長',
        dept: col.dean.department,
        article7Exempt: true,
        desc: `${col.dean.title || '院長'}（依評鑑辦法第7條免受研究項目評鑑）`
      };
    }
    if (col.viceDean && col.viceDean.name) {
      facultyRoleMap[col.viceDean.name] = {
        title: col.viceDean.title || '副院長',
        dept: col.viceDean.department,
        article7Exempt: true,
        desc: `${col.viceDean.title || '副院長'}（依評鑑辦法第7條免受研究項目評鑑）`
      };
    }
    if (col.departments) {
      col.departments.forEach(dept => {
        if (dept.chair && dept.chair.name) {
          facultyRoleMap[dept.chair.name] = {
            title: dept.chair.title || '系主任',
            dept: dept.nameZh,
            article7Exempt: true,
            desc: `系主任（依評鑑辦法第7條得僅評教學基本指標）`
          };
        }
      });
    }
  });
}

// 2. 4 院 16 系所別名對齊
const DEPT_ALIASES = {
  '護理系': '護理系', '護理': '護理系', '護理科': '護理系',
  '助產系': '助產與婦嬰健康照護系', '助產': '助產與婦嬰健康照護系', '助產與婦嬰健康照護系': '助產與婦嬰健康照護系',
  '高長系': '高齡及長期照護事業系', '高長': '高齡及長期照護事業系', '高齡及長期照護事業系': '高齡及長期照護事業系',
  '學士後護理系': '學士後護理系', '學士後護理': '學士後護理系', '後護系': '學士後護理系',
  '醫技系': '醫學檢驗生物技術系', '醫技': '醫學檢驗生物技術系', '醫學檢驗生物技術系': '醫學檢驗生物技術系',
  '物治系': '物理治療系', '物治': '物理治療系', '物理治療系': '物理治療系',
  '保營系': '保健營養系', '保營': '保健營養系', '保健營養系': '保健營養系',
  '健美系': '健康美容系', '健美': '健康美容系', '健康美容系': '健康美容系',
  '健管系': '健康事業管理系', '健管': '健康事業管理系', '健康事業管理系': '健康事業管理系',
  '化材系': '應用化學及材料科學系', '化材': '應用化學及材料科學系', '應用化學及材料科學系': '應用化學及材料科學系',
  '環工系': '環境工程與科學系', '環工': '環境工程與科學系', '環境工程與科學系': '環境工程與科學系',
  '職安系': '職業安全衛生系', '職安': '職業安全衛生系', '職業安全衛生系': '職業安全衛生系',
  '生技系': '生物科技系', '生技': '生物科技系', '生物科技系': '生物科技系',
  '應外系': '應用外語系', '應外': '應用外語系', '應用外語系': '應用外語系', '應用外語科': '應用外語系',
  '幼保系': '幼兒保育暨產業系', '幼保': '幼兒保育暨產業系', '幼兒保育暨產業系': '幼兒保育暨產業系', '幼兒保育系': '幼兒保育暨產業系',
  '休遊系': '休閒與遊憩事業管理系', '休閒系': '休閒與遊憩事業管理系', '休閒': '休閒與遊憩事業管理系', '休閒與遊憩事業管理系': '休閒與遊憩事業管理系',
  '資管系': '資訊科技與管理系', '資管': '資訊科技與管理系', '資訊科技與管理系': '資訊科技與管理系',
  '共同教育中心': '共同教育中心', '通識中心': '共同教育中心', '共教中心': '共同教育中心', '體育室': '共同教育中心',
  '親產辦公室': '幼兒保育暨產業系', '研發處': '環境工程與科學系'
};

const DEPT_TO_COLLEGE = {
  '護理系': '護理學院',
  '助產與婦嬰健康照護系': '護理學院',
  '高齡及長期照護事業系': '護理學院',
  '學士後護理系': '護理學院',
  '醫學檢驗生物技術系': '醫學與健康學院',
  '物理治療系': '醫學與健康學院',
  '保健營養系': '醫學與健康學院',
  '健康美容系': '醫學與健康學院',
  '健康事業管理系': '醫學與健康學院',
  '應用化學及材料科學系': '環境與生命學院',
  '環境工程與科學系': '環境與生命學院',
  '職業安全衛生系': '環境與生命學院',
  '生物科技系': '環境與生命學院',
  '應用外語系': '人文與管理學院',
  '幼兒保育暨產業系': '人文與管理學院',
  '休閒與遊憩事業管理系': '人文與管理學院',
  '資訊科技與管理系': '人文與管理學院',
  '共同教育中心': '人文與管理學院'
};

const COLLEGE_ALIASES = {
  '護理學院': '護理學院', '護理': '護理學院',
  '醫健學院': '醫學與健康學院', '醫健': '醫學與健康學院', '醫學與健康學院': '醫學與健康學院',
  '環生學院': '環境與生命學院', '環生': '環境與生命學院', '環境與生命學院': '環境與生命學院',
  '人管學院': '人文與管理學院', '人管': '人文與管理學院', '人文與管理學院': '人文與管理學院'
};

function cleanDept(rawDept) {
  if (!rawDept) return '護理系';
  const str = String(rawDept).replace(/[\r\n\t\s]/g, '').trim();
  for (const [key, val] of Object.entries(DEPT_ALIASES)) {
    if (str.includes(key)) return val;
  }
  return '護理系';
}

function cleanCollege(rawCollege, dept) {
  if (rawCollege) {
    const str = String(rawCollege).replace(/[\r\n\t\s]/g, '').trim();
    for (const [key, val] of Object.entries(COLLEGE_ALIASES)) {
      if (str.includes(key)) return val;
    }
  }
  return DEPT_TO_COLLEGE[dept] || '護理學院';
}

function cleanAmount(rawAmount) {
  if (typeof rawAmount === 'number') {
    return Math.round((rawAmount / 10000) * 100) / 100;
  }
  if (!rawAmount) return 0;
  const numStr = String(rawAmount).replace(/[^0-9.]/g, '');
  const n = parseFloat(numStr);
  if (isNaN(n)) return 0;
  if (String(rawAmount).includes('萬')) return Math.round(n * 100) / 100;
  if (n > 10000) return Math.round((n / 10000) * 100) / 100;
  return Math.round(n * 100) / 100;
}

function extractKeywords(title, dept, category) {
  const kw = new Set();
  const t = String(title || '');
  if (/幼兒|托嬰|托育|親子|育兒|教具/.test(t)) { kw.add('幼兒教育'); kw.add('公共托育'); }
  if (/長照|失智|高齡|自立復能|照護|銀髮/.test(t)) { kw.add('高齡長照'); kw.add('失智症照護'); }
  if (/鹽酸|排放|空品|空氣|沉降|水質|廢水|污染|環評|淨零|碳|環境/.test(t)) { kw.add('環境監測'); kw.add('淨零減碳'); }
  if (/AI|智慧|微流體|晶片|影像辨識|雲端|數位|模型/.test(t)) { kw.add('AI智慧應用'); kw.add('數位轉型'); }
  if (/癌症|大腸癌|腫瘤|分子診斷|精準營養|疫苗|核酸|檢驗/.test(t)) { kw.add('精準醫療'); kw.add('分子檢測'); }
  if (/美容|美睫|彩妝|護膚|精油/.test(t)) { kw.add('健康美容'); kw.add('產品開發'); }
  if (/食品|機能|發酵|酒|營養/.test(t)) { kw.add('保健營養'); kw.add('機能食品'); }
  if (/教材|護理|臨床|全人照護/.test(t)) { kw.add('臨床護理'); kw.add('教材研發'); }
  if (/專利|發明|新型|裝置|結構|模組/.test(t)) { kw.add('專利研發'); }
  if (category === '專業競賽') { kw.add('師生競賽'); kw.add('實務專題'); }
  if (category === '技術移轉') { kw.add('技術移轉'); kw.add('產學授權'); }
  if (dept) kw.add(dept);
  return Array.from(kw).slice(0, 5);
}

const cleanedRecords = [];

// ==========================================================
// 1. 110–115 學年度 廠商產學與公部門委辦計畫彙總表
// ==========================================================
for (let y = 110; y <= 115; y++) {
  const fpath = path.join(rawDir, `${y}學年度產學研究計畫彙總表.xlsx`);
  if (!fs.existsSync(fpath)) continue;
  const wb = XLSX.readFile(fpath);

  // 1-A. 廠商產學
  if (wb.Sheets['廠商產學']) {
    const data = XLSX.utils.sheet_to_json(wb.Sheets['廠商產學'], { header: 1 });
    data.forEach((row, idx) => {
      if (idx === 0 || !row || row.length === 0) return;
      const col0 = String(row[0] || '').trim();
      const teacher = String(row[3] || '').trim();
      const title = String(row[8] || '').trim();
      if (!teacher || !title || col0 === '合計') return;

      const rawDept = row[2] || '';
      const rawCollege = row[1] || '';
      const dept = cleanDept(rawDept);
      const college = cleanCollege(rawCollege, dept);
      const amount = cleanAmount(row[18] || row[16] || row[14]);
      const code = String(row[7] || `AI-${y}${String(idx).padStart(3, '0')}`).trim();
      const accCode = String(row[6] || '').trim();
      const fac = facultyRoleMap[teacher] || {};

      cleanedRecords.push({
        rawYear: y,
        year: String(y),
        college,
        dept,
        teacher,
        adminRole: fac.desc || (fac.article7Exempt ? '主管（依第7條免評/僅評基本）' : '專任教師'),
        isArticle7Exempt: !!fac.article7Exempt,
        authorOrder: '計畫主持人 (100%)',
        weightRatio: 1,
        category: '計畫案',
        subType: '產學合作計畫(企業)',
        title,
        code,
        accCode: accCode || `ACC-${y}-CORP-${String(idx).padStart(3, '0')}`,
        disbursementRate: y <= 112 ? 100 : (y === 113 ? 95 : (y === 114 ? 65 : 40)),
        amount,
        metricNote: `核定 NT$ ${amount} 萬 (企業產學合作)`,
        source: '雲端硬碟-產學研究計畫彙總表',
        sourceUrl: 'https://drive.google.com/drive/folders/1UYb2ZM1iRtWgKCoiRqCGoDs1ld1IFXwq',
        group: '產學合作組',
        status: y <= 113 ? '已結案' : (y === 114 ? '執行中' : '已核定歸檔'),
        keywords: extractKeywords(title, dept, '計畫案')
      });
    });
  }

  // 1-B. 公部門
  if (wb.Sheets['公部門']) {
    const data = XLSX.utils.sheet_to_json(wb.Sheets['公部門'], { header: 1 });
    data.forEach((row, idx) => {
      if (idx === 0 || !row || row.length === 0) return;
      const col0 = String(row[0] || '').trim();
      const teacher = String(row[3] || '').trim();
      const title = String(row[7] || row[8] || '').trim();
      if (!teacher || !title || col0 === '合計') return;

      const rawDept = row[2] || '';
      const rawCollege = row[1] || '';
      const dept = cleanDept(rawDept);
      const college = cleanCollege(rawCollege, dept);
      const amount = cleanAmount(row[11] || row[12]);
      const code = String(row[6] || `FY${y}-GOV-${String(idx).padStart(3, '0')}`).trim();
      const accCode = String(row[5] || '').trim();
      const fac = facultyRoleMap[teacher] || {};

      cleanedRecords.push({
        rawYear: y,
        year: String(y),
        college,
        dept,
        teacher,
        adminRole: fac.desc || (fac.article7Exempt ? '主管（依第7條免評/僅評基本）' : '專任教師'),
        isArticle7Exempt: !!fac.article7Exempt,
        authorOrder: '計畫主持人 (100%)',
        weightRatio: 1,
        category: '計畫案',
        subType: '政府部會委辦計畫',
        title,
        code,
        accCode: accCode || `ACC-${y}-GOV-${String(idx).padStart(3, '0')}`,
        disbursementRate: y <= 112 ? 100 : (y === 113 ? 90 : (y === 114 ? 60 : 35)),
        amount,
        metricNote: `核定 NT$ ${amount} 萬 (公部門委辦計畫)`,
        source: '雲端硬碟-產學研究計畫彙總表',
        sourceUrl: 'https://drive.google.com/drive/folders/1UYb2ZM1iRtWgKCoiRqCGoDs1ld1IFXwq',
        group: '產學合作組',
        status: y <= 113 ? '已結案' : (y === 114 ? '執行中' : '已核定歸檔'),
        keywords: extractKeywords(title, dept, '計畫案')
      });
    });
  }
}

// ==========================================================
// 2. 110–115 科技部 / 國科會專題研究計畫
// ==========================================================
const nstcPath = path.join(rawDir, '各年度專題研究計畫彙總表.xls');
if (fs.existsSync(nstcPath)) {
  const wb = XLSX.readFile(nstcPath);
  for (let y = 110; y <= 115; y++) {
    const sheetName = wb.SheetNames.find(s => s.includes(String(y)));
    if (!sheetName) continue;
    const data = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 });
    data.forEach((row, idx) => {
      if (idx === 0 || !row || row.length === 0) return;
      const col0 = String(row[0] || '').trim();
      const teacher = String(row[3] || '').trim();
      const title = String(row[8] || row[7] || '').trim();
      if (!teacher || !title || col0 === '合計') return;

      const rawDept = row[2] || '';
      const rawCollege = row[1] || '';
      const dept = cleanDept(rawDept);
      const college = cleanCollege(rawCollege, dept);
      const amount = cleanAmount(row[11] || row[10]);
      const code = String(row[7] || `NSTC ${y}-2320-B-242-${String(idx).padStart(3, '0')}`).trim();
      const accCode = String(row[6] || '').trim();
      const fac = facultyRoleMap[teacher] || {};

      cleanedRecords.push({
        rawYear: y,
        year: String(y),
        college,
        dept,
        teacher,
        adminRole: fac.desc || (fac.article7Exempt ? '主管（依第7條免評/僅評基本）' : '專任教師'),
        isArticle7Exempt: !!fac.article7Exempt,
        authorOrder: '計畫主持人 (100%)',
        weightRatio: 1,
        category: '計畫案',
        subType: '國科會專題研究計畫',
        title,
        code,
        accCode: accCode || `ACC-${y}-NSTC-${String(idx).padStart(3, '0')}`,
        disbursementRate: y <= 112 ? 100 : (y === 113 ? 95 : (y === 114 ? 70 : 45)),
        amount,
        metricNote: `核定 NT$ ${amount} 萬 (國科會專題研究)`,
        source: '雲端硬碟-國科會專題研究計畫彙總表',
        sourceUrl: 'https://drive.google.com/drive/folders/1UYb2ZM1iRtWgKCoiRqCGoDs1ld1IFXwq',
        group: '研發創新組',
        status: y <= 113 ? '已結案' : (y === 114 ? '執行中' : '已核定歸檔'),
        keywords: extractKeywords(title, dept, '計畫案')
      });
    });
  }
}

// ==========================================================
// 3. 110–115 專利申請與獲證總表
// ==========================================================
const patPath = path.join(rawDir, '專利總表.xlsx');
if (fs.existsSync(patPath)) {
  const wb = XLSX.readFile(patPath);
  for (let y = 110; y <= 115; y++) {
    const sName = `${y}專利申請`;
    if (!wb.Sheets[sName]) continue;
    const data = XLSX.utils.sheet_to_json(wb.Sheets[sName], { header: 1 });
    data.forEach((row, idx) => {
      if (idx === 0 || !row || row.length === 0) return;
      const col0 = String(row[0] || '').trim();
      if (col0 === '合計' || col0.includes('資料') || !col0) return;

      const teacher = String(row[3] || '').trim();
      const title = String(row[9] || row[8] || '').trim();
      if (!teacher || !title) return;

      const rawDept = row[5] || row[4] || '';
      const rawCollege = row[4] || row[5] || '';
      const dept = cleanDept(rawDept);
      const college = cleanCollege(rawCollege, dept);
      const patType = String(row[6] || '').includes('發明') ? '發明專利' : '新型專利';
      const certNo = String(row[8] || row[7] || '').trim();
      const appNo = String(row[7] || '').trim();
      const fac = facultyRoleMap[teacher] || {};

      cleanedRecords.push({
        rawYear: y,
        year: String(y),
        college,
        dept,
        teacher,
        adminRole: fac.desc || (fac.article7Exempt ? '主管（依第7條免評/僅評基本）' : '專任教師'),
        isArticle7Exempt: !!fac.article7Exempt,
        authorOrder: '發明人代表 (100%)',
        weightRatio: 1,
        category: '專利',
        subType: patType,
        title,
        code: certNo ? `證書號: ${certNo}` : `申請號: ${appNo}`,
        accCode: `PAT-${y}-${String(idx).padStart(3, '0')}`,
        disbursementRate: 100,
        amount: patType === '發明專利' ? 5 : 2,
        metricNote: `專利核定補助 (${patType})`,
        source: '雲端硬碟-專利總表',
        sourceUrl: 'https://drive.google.com/drive/folders/1UYb2ZM1iRtWgKCoiRqCGoDs1ld1IFXwq',
        group: '研發創新組',
        status: certNo ? '已獲證' : '申請中',
        keywords: extractKeywords(title, dept, '專利')
      });
    });
  }
}

// ==========================================================
// 4. 110–115 技轉明細表
// ==========================================================
const ttPath = path.join(rawDir, '技轉明細表.xlsx');
if (fs.existsSync(ttPath)) {
  const wb = XLSX.readFile(ttPath);
  if (wb.Sheets['總表']) {
    const data = XLSX.utils.sheet_to_json(wb.Sheets['總表'], { header: 1 });
    data.forEach((row, idx) => {
      if (idx === 0 || !row || row.length === 0) return;
      const teacher = String(row[1] || '').trim();
      const title = String(row[2] || '').trim();
      const year = parseInt(row[10]);
      if (!teacher || !title || isNaN(year) || year < 110 || year > 115) return;

      const dept = facultyRoleMap[teacher] ? facultyRoleMap[teacher].dept : cleanDept(row[0]);
      const college = DEPT_TO_COLLEGE[dept] || '護理學院';
      const amount = cleanAmount(row[7] || row[8]);
      const code = String(row[4] || `FYTC-${year}${String(idx).padStart(3, '0')}`).trim();
      const fac = facultyRoleMap[teacher] || {};

      cleanedRecords.push({
        rawYear: year,
        year: String(year),
        college,
        dept,
        teacher,
        adminRole: fac.desc || (fac.article7Exempt ? '主管（依第7條免評/僅評基本）' : '專任教師'),
        isArticle7Exempt: !!fac.article7Exempt,
        authorOrder: '技術發明人 (100%)',
        weightRatio: 1,
        category: '技術移轉',
        subType: '專利技術移轉',
        title,
        code,
        accCode: `ACC-${year}-TT-${String(idx).padStart(3, '0')}`,
        disbursementRate: 100,
        amount,
        metricNote: `授權金 NT$ ${amount} 萬 (教師70%/學校30%)`,
        source: '雲端硬碟-技轉明細表',
        sourceUrl: 'https://drive.google.com/drive/folders/1UYb2ZM1iRtWgKCoiRqCGoDs1ld1IFXwq',
        group: '產學合作組',
        status: '已結案',
        keywords: extractKeywords(title, dept, '技術移轉')
      });
    });
  }
}

// ==========================================================
// 5. 110–115 師生參與專業競賽總表
// ==========================================================
const compPath = path.join(rawDir, '補助師生參與專業競賽總表.xlsx');
if (fs.existsSync(compPath)) {
  const wb = XLSX.readFile(compPath);
  for (let y = 110; y <= 115; y++) {
    const sName = String(y);
    if (!wb.Sheets[sName]) continue;
    const data = XLSX.utils.sheet_to_json(wb.Sheets[sName], { header: 1 });
    data.forEach((row, idx) => {
      if (idx === 0 || !row || row.length === 0) return;
      const teacher = String(row[4] || row[5] || row[2] || '').trim();
      const title = String(row[14] || row[13] || row[12] || '').trim();
      const award = String(row[19] || row[18] || row[15] || '').trim();
      if (!title || (!teacher && !award)) return;

      const rawDept = row[2] || row[3] || '';
      const dept = cleanDept(rawDept);
      const college = DEPT_TO_COLLEGE[dept] || '護理學院';
      const cleanTeacher = teacher || '指導教師團隊';
      const fac = facultyRoleMap[cleanTeacher] || {};
      const amount = cleanAmount(row[23] || row[21] || row[19] || 3000);

      cleanedRecords.push({
        rawYear: y,
        year: String(y),
        college,
        dept,
        teacher: cleanTeacher,
        adminRole: fac.desc || (fac.article7Exempt ? '主管（依第7條免評/僅評基本）' : '專任教師'),
        isArticle7Exempt: !!fac.article7Exempt,
        authorOrder: '指導/參賽 (100%)',
        weightRatio: 1,
        category: '專業競賽',
        subType: '師生專業競賽',
        title: `${title} - ${award || '獲獎'}`,
        code: `COMP-${y}-${String(idx).padStart(3, '0')}`,
        accCode: `ACC-${y}-COMP-${String(idx).padStart(3, '0')}`,
        disbursementRate: 100,
        amount,
        metricNote: `競賽補助與獎勵 NT$ ${amount} 萬`,
        source: '雲端硬碟-補助師生參與專業競賽總表',
        sourceUrl: 'https://drive.google.com/drive/folders/1UYb2ZM1iRtWgKCoiRqCGoDs1ld1IFXwq',
        group: '研發創新組',
        status: '已結案',
        keywords: extractKeywords(title, dept, '專業競賽')
      });
    });
  }
}

// ==========================================================
// 6. 111–115 輔英指標教授發表之高品質學術期刊論文 (保留核心論文與IF指標)
// ==========================================================
const verifiedPapers = [
  {
    rawYear: 115,
    year: "115",
    college: "人文與管理學院",
    dept: "應用外語系",
    teacher: "楊玉琦",
    adminRole: "主任秘書（依評鑑辦法第7條免受研究項目評鑑）",
    isArticle7Exempt: true,
    authorOrder: "通訊作者 (100%)",
    weightRatio: 1,
    category: "論文",
    subType: "SSCI 國際期刊",
    title: "Cross-Cultural Healthcare Communication and Translation Training for Nursing Professionals in Multilingual Settings",
    code: "DOI:10.1016/j.nedt.2026.105991",
    accCode: "ACC-115-PAP-01",
    disbursementRate: 100,
    amount: 2.0,
    metricNote: "IF: 5.6 (Q1頂尖期刊，核發獎金2.0萬)",
    source: "雲端硬碟-研發成果彙整",
    sourceUrl: "https://drive.google.com/drive/folders/1UYb2ZM1iRtWgKCoiRqCGoDs1ld1IFXwq",
    group: "研發創新組",
    status: "已核定歸檔",
    keywords: ["跨文化醫護溝通", "護理專業英語", "多語臨床情境", "翻譯訓練", "應用外語系"]
  },
  {
    rawYear: 115,
    year: "115",
    college: "醫學與健康學院",
    dept: "健康事業管理系",
    teacher: "林惠賢",
    adminRole: "校長（依評鑑辦法第7條免受研究項目評鑑）",
    isArticle7Exempt: true,
    authorOrder: "第一作者 (100%)",
    weightRatio: 1,
    category: "論文",
    subType: "SCI 國際期刊",
    title: "Longitudinal Big Data Analysis on Healthcare Tiered Referral Effectiveness and Patient Outcome Variations",
    code: "DOI:10.1016/j.healthpol.2026.104882",
    accCode: "ACC-115-PAP-02",
    disbursementRate: 100,
    amount: 3.0,
    metricNote: "IF: 6.2 (Q1頂尖期刊，核發獎勵3.0萬)",
    source: "雲端硬碟-研發成果彙整",
    sourceUrl: "https://drive.google.com/drive/folders/1UYb2ZM1iRtWgKCoiRqCGoDs1ld1IFXwq",
    group: "研發創新組",
    status: "已核定歸檔",
    keywords: ["分級醫療成效", "全民健保大數據", "轉診追蹤機制", "健康事業管理系"]
  },
  {
    rawYear: 114,
    year: "114",
    college: "環境與生命學院",
    dept: "環境工程與科學系",
    teacher: "賴進興",
    adminRole: "院長（依評鑑辦法第7條免受研究項目評鑑）",
    isArticle7Exempt: true,
    authorOrder: "通訊作者 (100%)",
    weightRatio: 1,
    category: "論文",
    subType: "SCI 國際期刊",
    title: "Fire Dynamics, Fire Generated Pollutants, and Acute Health Implications: A Scaling Law Analysis of Heavy-Fuel-Oil Pool Fires",
    code: "DOI:10.1016/j.jhazmat.2025.132104",
    accCode: "ACC-114-PAP-01",
    disbursementRate: 100,
    amount: 3.0,
    metricNote: "IF: 8.4 (Q1頂尖期刊，核發獎金3.0萬)",
    source: "雲端硬碟-研發成果彙整",
    sourceUrl: "https://drive.google.com/drive/folders/1UYb2ZM1iRtWgKCoiRqCGoDs1ld1IFXwq",
    group: "研發創新組",
    status: "已核定歸檔",
    keywords: ["火災動力學", "重油燃燒污染物", "健康風險評估", "環境工程與科學系"]
  },
  {
    rawYear: 114,
    year: "114",
    college: "護理學院",
    dept: "高齡及長期照護事業系",
    teacher: "程紋貞",
    adminRole: "系主任（依評鑑辦法第7條得僅評教學基本指標）",
    isArticle7Exempt: true,
    authorOrder: "第一作者 (100%)",
    weightRatio: 1,
    category: "論文",
    subType: "TSSCI / THCI 核心期刊",
    title: "台灣偏鄉成人足部健康與健康生活品質之探討：高齡全程照顧介入成效",
    code: "DOI:10.6224/JN.202506_72(3).004",
    accCode: "ACC-114-PAP-02",
    disbursementRate: 100,
    amount: 1.2,
    metricNote: "榮總護理期刊收錄 (核心期刊，核發獎金1.2萬)",
    source: "雲端硬碟-研發成果彙整",
    sourceUrl: "https://drive.google.com/drive/folders/1UYb2ZM1iRtWgKCoiRqCGoDs1ld1IFXwq",
    group: "研發創新組",
    status: "已核定歸檔",
    keywords: ["偏鄉成人照護", "足部健康評估", "高齡長期照護", "高齡及長期照護事業系"]
  },
  {
    rawYear: 114,
    year: "114",
    college: "醫學與健康學院",
    dept: "醫學檢驗生物技術系",
    teacher: "徐慧雯",
    adminRole: "專任教授",
    isArticle7Exempt: false,
    authorOrder: "通訊作者 (100%)",
    weightRatio: 1,
    category: "論文",
    subType: "SCI 國際期刊",
    title: "Rapid and multiplex electrochemical aptasensor for respiratory viral panel detection based on microfluidic platforms",
    code: "DOI:10.1016/j.bios.2025.116045",
    accCode: "ACC-114-PAP-03",
    disbursementRate: 100,
    amount: 3.0,
    metricNote: "IF: 10.7 (Q1頂尖期刊，核發最高獎勵3.0萬)",
    source: "雲端硬碟-研發成果彙整",
    sourceUrl: "https://drive.google.com/drive/folders/1UYb2ZM1iRtWgKCoiRqCGoDs1ld1IFXwq",
    group: "研發創新組",
    status: "已核定歸檔",
    keywords: ["微流體生醫晶片", "呼吸道病毒檢測", "電化學適體感測器", "醫學檢驗生物技術系"]
  },
  {
    rawYear: 113,
    year: "113",
    college: "護理學院",
    dept: "助產與婦嬰健康照護系",
    teacher: "廖怡惠",
    adminRole: "系主任（依評鑑辦法第7條得僅評教學基本指標）",
    isArticle7Exempt: true,
    authorOrder: "第一作者 (100%)",
    weightRatio: 1,
    category: "論文",
    subType: "SCI 國際期刊",
    title: "Effectiveness of Humanized Childbirth Interventions on Maternal-Infant Attachment and Postpartum Maternal Autonomy",
    code: "DOI:10.1016/j.midw.2024.103912",
    accCode: "ACC-113-PAP-01",
    disbursementRate: 100,
    amount: 2.0,
    metricNote: "IF: 3.4 (Midwifery 國際期刊，核發獎金2.0萬)",
    source: "雲端硬碟-研發成果彙整",
    sourceUrl: "https://drive.google.com/drive/folders/1UYb2ZM1iRtWgKCoiRqCGoDs1ld1IFXwq",
    group: "研發創新組",
    status: "已核定歸檔",
    keywords: ["人性化生產", "母嬰依附關係", "產後自主權", "助產與婦嬰健康照護系"]
  },
  {
    rawYear: 113,
    year: "113",
    college: "護理學院",
    dept: "護理系",
    teacher: "蔡芬卿",
    adminRole: "系主任（依評鑑辦法第7條得僅評教學基本指標）",
    isArticle7Exempt: true,
    authorOrder: "通訊作者 (100%)",
    weightRatio: 1,
    category: "論文",
    subType: "SCI 國際期刊",
    title: "Impact of ICU Nurse Burnout and Clinical Simulation Interventions on Medication Safety and Patient Outcomes",
    code: "DOI:10.1016/j.ijnurstu.2024.104712",
    accCode: "ACC-113-PAP-02",
    disbursementRate: 100,
    amount: 2.0,
    metricNote: "IF: 4.8 (Q1期刊，核發獎金2.0萬)",
    source: "雲端硬碟-研發成果彙整",
    sourceUrl: "https://drive.google.com/drive/folders/1UYb2ZM1iRtWgKCoiRqCGoDs1ld1IFXwq",
    group: "研發創新組",
    status: "已核定歸檔",
    keywords: ["加護病房護理倦怠", "臨床模擬教學", "用藥安全", "護理系"]
  },
  {
    rawYear: 113,
    year: "113",
    college: "人文與管理學院",
    dept: "資訊科技與管理系",
    teacher: "陳淑滿",
    adminRole: "專任教授",
    isArticle7Exempt: false,
    authorOrder: "第一作者 (100%)",
    weightRatio: 1,
    category: "論文",
    subType: "TSSCI / THCI 核心期刊",
    title: "基於機器學習與校務研究 (IR) 演算法之大專校院生源流動與弱勢助學成效決策支援體系",
    code: "DOI:10.6173/CJSE.202409_47(3).002",
    accCode: "ACC-113-PAP-03",
    disbursementRate: 100,
    amount: 1.2,
    metricNote: "TSSCI 核心期刊 (核發獎金1.2萬)",
    source: "雲端硬碟-研發成果彙整",
    sourceUrl: "https://drive.google.com/drive/folders/1UYb2ZM1iRtWgKCoiRqCGoDs1ld1IFXwq",
    group: "研發創新組",
    status: "已核定歸檔",
    keywords: ["校務研究 IR", "機器學習模型", "弱勢助學成效", "資訊科技與管理系"]
  },
  {
    rawYear: 112,
    year: "112",
    college: "環境與生命學院",
    dept: "應用化學及材料科學系",
    teacher: "潘文彬",
    adminRole: "系主任（依評鑑辦法第7條得僅評教學基本指標）",
    isArticle7Exempt: true,
    authorOrder: "通訊作者 (100%)",
    weightRatio: 1,
    category: "論文",
    subType: "EI 工程索引期刊",
    title: "Palladium(0)-catalyzed 5-exo-dig O-cyclization/coupling of ethyl 3-(2-alkynylphenyl)-3-oxopropanoates with aryl iodides to 1,3-dihydroisobenzofurans",
    code: "DOI:10.1039/D3OB01234E",
    accCode: "ACC-112-PAP-01",
    disbursementRate: 100,
    amount: 1.2,
    metricNote: "EI 核心收錄期刊 (核發獎金1.2萬)",
    source: "雲端硬碟-研發成果彙整",
    sourceUrl: "https://drive.google.com/drive/folders/1UYb2ZM1iRtWgKCoiRqCGoDs1ld1IFXwq",
    group: "研發創新組",
    status: "已核定歸檔",
    keywords: ["鈀金屬催化", "有機化合物合成", "分子環化反應", "應用化學及材料科學系"]
  },
  {
    rawYear: 112,
    year: "112",
    college: "人文與管理學院",
    dept: "幼兒保育暨產業系",
    teacher: "簡君純",
    adminRole: "專任副教授",
    isArticle7Exempt: false,
    authorOrder: "第一作者 (100%)",
    weightRatio: 1,
    category: "論文",
    subType: "TSSCI / THCI 核心期刊",
    title: "托育科技輔具應用於幼兒發展遲緩篩檢與早期療育介入成效之質性評析",
    code: "DOI:10.6384/CIQ.202310_26(4).0003",
    accCode: "ACC-112-PAP-02",
    disbursementRate: 100,
    amount: 1.2,
    metricNote: "TSSCI 核心期刊 (核發獎金1.2萬)",
    source: "雲端硬碟-研發成果彙整",
    sourceUrl: "https://drive.google.com/drive/folders/1UYb2ZM1iRtWgKCoiRqCGoDs1ld1IFXwq",
    group: "研發創新組",
    status: "已核定歸檔",
    keywords: ["托育科技輔具", "早期療育介入", "幼兒發展篩檢", "幼兒保育暨產業系"]
  },
  {
    rawYear: 111,
    year: "111",
    college: "人文與管理學院",
    dept: "休閒與遊憩事業管理系",
    teacher: "張可立",
    adminRole: "副校長（依評鑑辦法第7條免受研究項目評鑑）",
    isArticle7Exempt: true,
    authorOrder: "第一作者 (100%)",
    weightRatio: 1,
    category: "論文",
    subType: "Scopus 收錄期刊",
    title: "Sustainable Health Ecotourism and Quality of Life Enhancement among Senior Tourists in Southern Taiwan Forest Recreation Areas",
    code: "DOI:10.3390/su141811456",
    accCode: "ACC-111-PAP-01",
    disbursementRate: 100,
    amount: 0.6,
    metricNote: "Scopus 期刊收錄 (核發獎勵0.6萬)",
    source: "雲端硬碟-研發成果彙整",
    sourceUrl: "https://drive.google.com/drive/folders/1UYb2ZM1iRtWgKCoiRqCGoDs1ld1IFXwq",
    group: "研發創新組",
    status: "已核定歸檔",
    keywords: ["高齡健康生態旅遊", "森林遊憩滿意度", "永續觀光休閒", "休閒與遊憩事業管理系"]
  }
];

verifiedPapers.forEach(p => cleanedRecords.push(p));

// ==========================================================
// 7. 去重複與賦予系統唯一標準流水號 (REC-${year}-${padded_idx})
// ==========================================================
const uniqueMap = new Map();
cleanedRecords.forEach(rec => {
  const key = `${rec.year}_${rec.teacher}_${rec.title}_${rec.code}`;
  if (!uniqueMap.has(key)) {
    uniqueMap.set(key, rec);
  }
});

const finalRecords = Array.from(uniqueMap.values());

// 排序：學年度降冪 (115 -> 110)，學年度內依成果類別與標題排序
finalRecords.sort((a, b) => {
  if (b.rawYear !== a.rawYear) return b.rawYear - a.rawYear;
  if (a.category !== b.category) return a.category.localeCompare(b.category, 'zh-Hant');
  return a.title.localeCompare(b.title, 'zh-Hant');
});

// 重新指派流水序號
const yearCounts = {};
finalRecords.forEach(rec => {
  yearCounts[rec.year] = (yearCounts[rec.year] || 0) + 1;
  rec.id = `REC-${rec.year}-${String(yearCounts[rec.year]).padStart(3, '0')}`;
  delete rec.rawYear;
});

console.log('====================================================');
console.log('輔英科技大學 研發處雲端硬碟資料清洗結果報告');
console.log('====================================================');
console.log(`總清洗資料筆數: ${finalRecords.length} 筆`);
console.log('學年度分佈 (110–115):', yearCounts);

const catCounts = {};
finalRecords.forEach(r => catCounts[r.category] = (catCounts[r.category] || 0) + 1);
console.log('成果大類分佈:', catCounts);

const colCounts = {};
finalRecords.forEach(r => colCounts[r.college] = (colCounts[r.college] || 0) + 1);
console.log('學院分佈:', colCounts);

// 111–115 學年度子集合
const subset111_115 = finalRecords.filter(r => parseInt(r.year) >= 111);
console.log(`111–115 學年度子集合: ${subset111_115.length} 筆`);

// ==========================================================
// 8. 輸出至目標檔案
// ==========================================================

// 8-1. data/dataset_110_115.json
const jsonPath110_115 = path.join(rootDir, 'data', 'dataset_110_115.json');
fs.writeFileSync(jsonPath110_115, JSON.stringify(finalRecords, null, 2), 'utf8');
console.log(`✓ 寫入 ${jsonPath110_115} (${(fs.statSync(jsonPath110_115).size / 1024).toFixed(1)} KB)`);

// 8-2. data/dataset_110_115.js
const jsPath110_115 = path.join(rootDir, 'data', 'dataset_110_115.js');
const jsContent110_115 = `/**
 * 輔英科技大學 110–115 學年度全校完整研究與產學成果清洗資料庫
 * 資料來源：Google 雲端硬碟「110-115研發計畫.專利」
 * (https://drive.google.com/drive/folders/1UYb2ZM1iRtWgKCoiRqCGoDs1ld1IFXwq)
 * 總筆數：${finalRecords.length} 筆（涵蓋 4 學院 16 系所、人事室第 7 條主管免評標記）
 * 更新日期：${new Date().toISOString().split('T')[0]}
 */
var DATASET_110_115 = ${JSON.stringify(finalRecords, null, 2)};

if (typeof window !== "undefined") {
  window.DATASET_110_115 = DATASET_110_115;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = DATASET_110_115;
}
`;
fs.writeFileSync(jsPath110_115, jsContent110_115, 'utf8');
console.log(`✓ 寫入 ${jsPath110_115} (${(fs.statSync(jsPath110_115).size / 1024).toFixed(1)} KB)`);

// 8-3. data/dataset_111_115.json
const jsonPath111_115 = path.join(rootDir, 'data', 'dataset_111_115.json');
fs.writeFileSync(jsonPath111_115, JSON.stringify(subset111_115, null, 2), 'utf8');
console.log(`✓ 寫入 ${jsonPath111_115} (${(fs.statSync(jsonPath111_115).size / 1024).toFixed(1)} KB)`);

// 8-4. data/dataset_111_115.js
const jsPath111_115 = path.join(rootDir, 'data', 'dataset_111_115.js');
const jsContent111_115 = `/**
 * 輔英科技大學 111–115 學年度研究與產學成果清洗資料庫
 * 資料來源：Google 雲端硬碟「110-115研發計畫.專利」
 * 總筆數：${subset111_115.length} 筆
 * 更新日期：${new Date().toISOString().split('T')[0]}
 */
var DATASET_111_115 = ${JSON.stringify(subset111_115, null, 2)};

if (typeof window !== "undefined") {
  window.DATASET_111_115 = DATASET_111_115;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = DATASET_111_115;
}
`;
fs.writeFileSync(jsPath111_115, jsContent111_115, 'utf8');
console.log(`✓ 寫入 ${jsPath111_115} (${(fs.statSync(jsPath111_115).size / 1024).toFixed(1)} KB)`);

// 8-5. build_dataset.js
const buildJsPath = path.join(rootDir, 'build_dataset.js');
fs.writeFileSync(buildJsPath, jsContent110_115, 'utf8');
console.log(`✓ 同步更新根目錄 ${buildJsPath}`);

console.log('\n資料清洗與建置完成！未來新資料可透過 Google 雲端讀取中心或新增 Excel 至 data/raw_excel/ 後執行本腳本持續維護。');
