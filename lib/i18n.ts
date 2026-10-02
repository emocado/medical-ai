import type { Language } from "@/types";

type Translations = Record<Language, string>;

/** Native names, used when offering to show content "in 中文" etc. */
export const LANGUAGE_NATIVE_NAMES: Record<Language, string> = {
  en: "English",
  bm: "Bahasa Malaysia",
  zh: "中文",
  ta: "தமிழ்",
};

/**
 * Every piece of interface text, in all four supported languages.
 * Medical wording in bm/zh/ta should be reviewed by a native-speaking clinician
 * before real-world use.
 */
export const STRINGS = {
  // Navigation & page titles
  "guide.aiBadge": { en: "AI Companion", bm: "Pembantu AI", zh: "AI 助手", ta: "AI உதவியாளர்" },
  "nav.reports": { en: "Reports & Chat", bm: "Laporan & Sembang", zh: "报告与问答", ta: "அறிக்கை & உரையாடல்" },
  "nav.reports.aria": {
    en: "Reports and conversational chat",
    bm: "Laporan dan sembang",
    zh: "报告与问答",
    ta: "அறிக்கைகள் மற்றும் உரையாடல்",
  },
  "nav.pills": { en: "Pill Analyzer", bm: "Semak Ubat", zh: "药物分析", ta: "மருந்து ஆய்வு" },
  "nav.pills.aria": {
    en: "Pill identification and safety analysis",
    bm: "Pengenalpastian dan keselamatan ubat",
    zh: "药物识别与安全分析",
    ta: "மருந்து அடையாளம் மற்றும் பாதுகாப்பு ஆய்வு",
  },
  "nav.timeline": { en: "Timeline", bm: "Garis Masa", zh: "时间线", ta: "காலவரிசை" },
  "nav.timeline.aria": {
    en: "Health history timeline and report comparison",
    bm: "Sejarah kesihatan dan perbandingan laporan",
    zh: "健康历史与报告比较",
    ta: "உடல்நல வரலாறு மற்றும் அறிக்கை ஒப்பீடு",
  },
  "nav.main.aria": { en: "Main Navigation", bm: "Navigasi Utama", zh: "主导航", ta: "முதன்மை வழிசெலுத்தல்" },
  "header.languageSelection": { en: "Language selection", bm: "Pilihan bahasa", zh: "语言选择", ta: "மொழித் தேர்வு" },
  "title.reports": { en: "HealthMate Reports", bm: "Laporan HealthMate", zh: "HealthMate 报告", ta: "HealthMate அறிக்கைகள்" },
  "title.pills": { en: "Pill Analyzer", bm: "Penganalisis Ubat", zh: "药物分析", ta: "மருந்து பகுப்பாய்வு" },
  "title.timeline": { en: "Health Timeline", bm: "Garis Masa Kesihatan", zh: "健康时间线", ta: "உடல்நல காலவரிசை" },

  // Shared
  "common.close": { en: "Close", bm: "Tutup", zh: "关闭", ta: "மூடு" },
  "common.delete": { en: "Delete", bm: "Padam", zh: "删除", ta: "நீக்கு" },
  "confirm.deleteReport": {
    en: "Delete this report? This cannot be undone.",
    bm: "Padam laporan ini? Tindakan ini tidak boleh dibatalkan.",
    zh: "删除这份报告？此操作无法撤销。",
    ta: "இந்த அறிக்கையை நீக்கவா? இதைத் திரும்பப் பெற முடியாது.",
  },
  "confirm.deleteScan": {
    en: "Delete this medicine scan? This cannot be undone.",
    bm: "Padam imbasan ubat ini? Tindakan ini tidak boleh dibatalkan.",
    zh: "删除这次药物扫描？此操作无法撤销。",
    ta: "இந்த மருந்து ஸ்கேனை நீக்கவா? இதைத் திரும்பப் பெற முடியாது.",
  },
  "confirm.deleteMeal": {
    en: "Delete this meal log? This cannot be undone.",
    bm: "Padam rekod makanan ini? Tindakan ini tidak boleh dibatalkan.",
    zh: "删除这条饮食记录？此操作无法撤销。",
    ta: "இந்த உணவுப் பதிவை நீக்கவா? இதைத் திரும்பப் பெற முடியாது.",
  },
  "delete.report.aria": { en: "Delete this report", bm: "Padam laporan ini", zh: "删除这份报告", ta: "இந்த அறிக்கையை நீக்கு" },
  "delete.scan.aria": { en: "Delete this medicine scan", bm: "Padam imbasan ubat ini", zh: "删除这次药物扫描", ta: "இந்த மருந்து ஸ்கேனை நீக்கு" },
  "delete.meal.aria": { en: "Delete this meal log", bm: "Padam rekod makanan ini", zh: "删除这条饮食记录", ta: "இந்த உணவுப் பதிவை நீக்கு" },
  "report.testDate": {
    en: "Test date (tap to correct)",
    bm: "Tarikh ujian (tekan untuk betulkan)",
    zh: "检查日期（点击可修改）",
    ta: "பரிசோதனை தேதி (திருத்த தட்டவும்)",
  },
  "disclaimer.aria": { en: "Medical Disclaimer", bm: "Penafian Perubatan", zh: "医疗免责声明", ta: "மருத்துவ மறுப்பு" },
  "errors.tooLarge": {
    en: "This file is too large. Please use a smaller photo or PDF (under 15 MB).",
    bm: "Fail ini terlalu besar. Sila gunakan foto atau PDF yang lebih kecil (bawah 15 MB).",
    zh: "文件太大。请使用较小的照片或 PDF（15 MB 以下）。",
    ta: "இந்தக் கோப்பு மிகப் பெரியது. சிறிய புகைப்படம் அல்லது PDF-ஐப் பயன்படுத்தவும் (15 MB-க்குக் குறைவாக).",
  },
  "errors.rateLimited": {
    en: "Too many requests. Please wait a minute and try again.",
    bm: "Terlalu banyak permintaan. Sila tunggu seminit dan cuba lagi.",
    zh: "请求过多。请等一分钟后再试。",
    ta: "அதிகமான கோரிக்கைகள். ஒரு நிமிடம் காத்திருந்து மீண்டும் முயற்சிக்கவும்.",
  },

  // Sample files for trying the app
  "samples.try": {
    en: "Just trying it out? Use a sample:",
    bm: "Sekadar mencuba? Guna sampel:",
    zh: "只是想试试？使用示例：",
    ta: "சும்மா முயற்சிக்கிறீர்களா? மாதிரியைப் பயன்படுத்துங்கள்:",
  },
  "samples.allFiles": { en: "All sample files", bm: "Semua fail sampel", zh: "所有示例文件", ta: "அனைத்து மாதிரிக் கோப்புகள்" },
  "samples.loadError": {
    en: "Could not load the sample file. Please try again.",
    bm: "Tidak dapat memuatkan fail sampel. Sila cuba lagi.",
    zh: "无法加载示例文件，请重试。",
    ta: "மாதிரிக் கோப்பை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
  },
  "samples.report.march": { en: "March check-up", bm: "Pemeriksaan Mac", zh: "三月体检", ta: "மார்ச் பரிசோதனை" },
  "samples.report.september": {
    en: "September follow-up",
    bm: "Susulan September",
    zh: "九月复诊",
    ta: "செப்டம்பர் தொடர் பரிசோதனை",
  },
  "samples.report.urgent": { en: "Urgent result", bm: "Keputusan segera", zh: "紧急结果", ta: "அவசர முடிவு" },
  "samples.pills.regimen": { en: "3 daily medicines", bm: "3 ubat harian", zh: "3 种日常药物", ta: "3 தினசரி மருந்துகள்" },
  "samples.pills.antibiotic": { en: "New antibiotic", bm: "Antibiotik baharu", zh: "新的抗生素", ta: "புதிய ஆன்டிபயாடிக்" },
  "samples.meal.nasiLemak": { en: "Nasi lemak", bm: "Nasi lemak", zh: "椰浆饭", ta: "நாசி லெமாக்" },
  "samples.meal.chickenRice": { en: "Chicken rice", bm: "Nasi ayam", zh: "海南鸡饭", ta: "சிக்கன் சாதம்" },
  "samples.meal.rotiCanai": { en: "Roti canai", bm: "Roti canai", zh: "印度煎饼", ta: "ரொட்டி சானாய்" },
  "samples.mealText.1": {
    en: "Nasi lemak with fried chicken, sambal and a teh tarik",
    bm: "Nasi lemak dengan ayam goreng, sambal dan teh tarik",
    zh: "椰浆饭配炸鸡、参巴酱和一杯拉茶",
    ta: "பொரித்த கோழி, சம்பல் மற்றும் தே தாரிக்குடன் நாசி லெமாக்",
  },
  "samples.mealText.2": {
    en: "Steamed fish with brown rice, kailan and plain water",
    bm: "Ikan kukus dengan nasi perang, kailan dan air kosong",
    zh: "清蒸鱼配糙米饭、芥兰和白开水",
    ta: "வேகவைத்த மீன், பழுப்பு அரிசி சாதம், கைலான் கீரை மற்றும் தண்ணீர்",
  },
  "samples.mealText.3": {
    en: "Grapefruit juice and kaya toast for breakfast",
    bm: "Jus limau gedang dan roti bakar kaya untuk sarapan",
    zh: "早餐喝西柚汁、吃咖椰吐司",
    ta: "காலை உணவாக கிரேப்ஃப்ரூட் சாறு மற்றும் காயா டோஸ்ட்",
  },
  "samples.title": { en: "Try HealthMate", bm: "Cuba HealthMate", zh: "试用 HealthMate", ta: "HealthMate-ஐ முயற்சிக்கவும்" },
  "samples.intro": {
    en: "These files are fictional and marked SAMPLE. Use the sample buttons on each screen, or download them and upload them yourself.",
    bm: "Fail-fail ini rekaan dan bertanda SAMPLE. Gunakan butang sampel di setiap skrin, atau muat turun dan muat naik sendiri.",
    zh: "这些文件均为虚构，并标有 SAMPLE 字样。您可以使用各页面上的示例按钮，或下载后自行上传。",
    ta: "இந்தக் கோப்புகள் கற்பனையானவை, SAMPLE என்று குறிக்கப்பட்டவை. ஒவ்வொரு திரையிலும் உள்ள மாதிரிப் பொத்தான்களைப் பயன்படுத்தவும், அல்லது பதிவிறக்கி நீங்களே பதிவேற்றவும்.",
  },
  "samples.section.reports": { en: "Lab reports", bm: "Laporan makmal", zh: "化验报告", ta: "ஆய்வக அறிக்கைகள்" },
  "samples.section.pills": { en: "Medicine labels", bm: "Label ubat", zh: "药物标签", ta: "மருந்து லேபிள்கள்" },
  "samples.section.meals": { en: "Meals", bm: "Makanan", zh: "饮食", ta: "உணவுகள்" },
  "samples.section.mealTexts": {
    en: "Meal descriptions to type",
    bm: "Penerangan makanan untuk ditaip",
    zh: "可输入的饮食描述",
    ta: "தட்டச்சு செய்ய உணவு விளக்கங்கள்",
  },
  "samples.download": { en: "Download {type}", bm: "Muat turun {type}", zh: "下载 {type}", ta: "{type} பதிவிறக்கு" },
  "samples.steps.title": { en: "Suggested walkthrough", bm: "Cadangan langkah", zh: "建议的体验步骤", ta: "பரிந்துரைக்கப்பட்ட படிகள்" },
  "samples.step.reports": {
    en: "Reports: upload the March check-up, then the September follow-up. Press Read Aloud, then ask a question in the chat or tap the microphone.",
    bm: "Laporan: muat naik pemeriksaan Mac, kemudian susulan September. Tekan Baca Kuat, kemudian tanya soalan dalam sembang atau tekan mikrofon.",
    zh: "报告：先上传三月体检，再上传九月复诊。点击“朗读”，然后在问答中提问或点击麦克风。",
    ta: "அறிக்கைகள்: மார்ச் பரிசோதனையையும் பின்னர் செப்டம்பர் தொடர் பரிசோதனையையும் பதிவேற்றவும். உரக்கப் படி என்பதை அழுத்தி, உரையாடலில் கேள்வி கேளுங்கள் அல்லது மைக்ரோஃபோனைத் தட்டவும்.",
  },
  "samples.step.compare": {
    en: "Timeline: select both reports and press Compare to see what improved and what got worse.",
    bm: "Garis Masa: pilih kedua-dua laporan dan tekan Bandingkan untuk melihat apa yang bertambah baik dan apa yang merosot.",
    zh: "时间线：选择这两份报告并点击比较，看看哪些好转、哪些变差。",
    ta: "காலவரிசை: இரண்டு அறிக்கைகளையும் தேர்ந்தெடுத்து ஒப்பிடு என்பதை அழுத்தி, எது மேம்பட்டது, எது மோசமானது என்று பாருங்கள்.",
  },
  "samples.step.urgent": {
    en: "Reports: upload the urgent result to see how dangerous values are flagged with a same-day warning.",
    bm: "Laporan: muat naik keputusan segera untuk melihat bagaimana nilai berbahaya ditanda dengan amaran untuk hari yang sama.",
    zh: "报告：上传紧急结果，看看危险数值如何被标出并提示当天就医。",
    ta: "அறிக்கைகள்: ஆபத்தான மதிப்புகள் அன்றே மருத்துவரை அணுகுமாறு எச்சரிக்கையுடன் எவ்வாறு குறிக்கப்படுகின்றன என்பதைக் காண அவசர முடிவைப் பதிவேற்றவும்.",
  },
  "samples.step.pills": {
    en: "Pill Analyzer: scan the 3 daily medicines, then the new antibiotic, to check for interactions.",
    bm: "Semak Ubat: imbas 3 ubat harian, kemudian antibiotik baharu, untuk menyemak interaksi.",
    zh: "药物分析：先扫描 3 种日常药物，再扫描新的抗生素，检查药物相互作用。",
    ta: "மருந்து ஆய்வு: 3 தினசரி மருந்துகளையும் பின்னர் புதிய ஆன்டிபயாடிக்கையும் ஸ்கேன் செய்து இடைவினைகளைச் சரிபார்க்கவும்.",
  },
  "samples.step.meals": {
    en: "Timeline → Log Meal: try a meal photo, or type “grapefruit juice” to see a food–medicine warning.",
    bm: "Garis Masa → Rekod Makanan: cuba foto makanan, atau taip “jus limau gedang” untuk melihat amaran makanan–ubat.",
    zh: "时间线 → 记录饮食：试试饮食照片，或输入“西柚汁”查看食物与药物的警告。",
    ta: "காலவரிசை → உணவைப் பதிவு செய்: உணவுப் புகைப்படத்தை முயற்சிக்கவும், அல்லது உணவு–மருந்து எச்சரிக்கையைக் காண “கிரேப்ஃப்ரூட் சாறு” என்று தட்டச்சு செய்யவும்.",
  },
  "samples.step.language": {
    en: "Change the language at the top: every screen and saved result switches over.",
    bm: "Tukar bahasa di bahagian atas: setiap skrin dan keputusan tersimpan akan bertukar.",
    zh: "在顶部切换语言：所有页面和已保存的结果都会随之切换。",
    ta: "மேலே மொழியை மாற்றுங்கள்: ஒவ்வொரு திரையும் சேமித்த முடிவுகளும் மாறும்.",
  },
  "chat.suggestions": { en: "Try asking:", bm: "Cuba tanya:", zh: "试着问：", ta: "இப்படிக் கேட்டுப் பாருங்கள்:" },
  "chat.suggest.1": {
    en: "Is my blood sugar too high?",
    bm: "Adakah gula darah saya terlalu tinggi?",
    zh: "我的血糖太高了吗？",
    ta: "என் இரத்தச் சர்க்கரை அதிகமாக உள்ளதா?",
  },
  "chat.suggest.2": {
    en: "What should I eat to lower my cholesterol?",
    bm: "Apa yang patut saya makan untuk menurunkan kolesterol?",
    zh: "为了降低胆固醇，我应该吃什么？",
    ta: "என் கொலஸ்ட்ராலைக் குறைக்க நான் என்ன சாப்பிட வேண்டும்?",
  },
  "chat.suggest.3": {
    en: "Is my kidney function getting worse?",
    bm: "Adakah fungsi buah pinggang saya semakin teruk?",
    zh: "我的肾功能是不是变差了？",
    ta: "என் சிறுநீரகச் செயல்பாடு மோசமாகிறதா?",
  },

  // Translating saved AI content
  "translate.working": {
    en: "Translating into your language...",
    bm: "Sedang menterjemah ke dalam bahasa anda...",
    zh: "正在翻译成您的语言...",
    ta: "உங்கள் மொழிக்கு மொழிபெயர்க்கிறோம்...",
  },
  "translate.error": {
    en: "Could not translate this yet. Showing the original.",
    bm: "Belum dapat diterjemah. Memaparkan versi asal.",
    zh: "暂时无法翻译，显示原文。",
    ta: "இன்னும் மொழிபெயர்க்க முடியவில்லை. மூலத்தைக் காட்டுகிறோம்.",
  },
  "translate.retry": { en: "Try again", bm: "Cuba lagi", zh: "重试", ta: "மீண்டும் முயற்சி" },

  // Status chips
  "status.normal": { en: "NORMAL", bm: "NORMAL", zh: "正常", ta: "இயல்பு" },
  "status.high": { en: "HIGH", bm: "TINGGI", zh: "偏高", ta: "அதிகம்" },
  "status.low": { en: "LOW", bm: "RENDAH", zh: "偏低", ta: "குறைவு" },
  "status.abnormal": { en: "CHECK", bm: "SEMAK", zh: "异常", ta: "சரிபார்க்கவும்" },
  "status.critical": { en: "URGENT", bm: "SEGERA", zh: "危急", ta: "அவசரம்" },
  "status.unknown": { en: "ASK DOCTOR", bm: "TANYA DOKTOR", zh: "请问医生", ta: "மருத்துவரிடம் கேளுங்கள்" },
  "urgent.title": {
    en: "Some results need medical attention soon",
    bm: "Sesetengah keputusan perlu perhatian perubatan segera",
    zh: "部分结果需要尽快就医",
    ta: "சில முடிவுகளுக்கு விரைவில் மருத்துவ கவனம் தேவை",
  },
  "urgent.body": {
    en: "Please contact your doctor or clinic today and show them this report.",
    bm: "Sila hubungi doktor atau klinik anda hari ini dan tunjukkan laporan ini.",
    zh: "请今天就联系您的医生或诊所，并出示这份报告。",
    ta: "இன்றே உங்கள் மருத்துவர் அல்லது கிளினிக்கைத் தொடர்புகொண்டு இந்த அறிக்கையைக் காட்டுங்கள்.",
  },
  "urgent.flagged": {
    en: "Results that need attention:",
    bm: "Keputusan yang perlu perhatian:",
    zh: "需要注意的结果：",
    ta: "கவனிக்க வேண்டிய முடிவுகள்:",
  },
  "urgent.emergency": {
    en: "If you feel very unwell (chest pain, trouble breathing, confusion, weakness or fainting), call 999 or go to the nearest emergency department now.",
    bm: "Jika anda berasa sangat tidak sihat (sakit dada, sukar bernafas, keliru, lemah atau pengsan), hubungi 999 atau pergi ke jabatan kecemasan terdekat sekarang.",
    zh: "如果您感到非常不适（胸痛、呼吸困难、意识混乱、乏力或晕倒），请立即拨打 999 或前往最近的急诊部。",
    ta: "கடுமையான உடல்நலக் குறைவை (நெஞ்சு வலி, மூச்சுத் திணறல், குழப்பம், பலவீனம் அல்லது மயக்கம்) உணர்ந்தால், உடனே 999 ஐ அழைக்கவும் அல்லது அருகிலுள்ள அவசர சிகிச்சைப் பிரிவுக்குச் செல்லவும்.",
  },
  "urgent.call": { en: "Call 999 (Emergency)", bm: "Hubungi 999 (Kecemasan)", zh: "拨打 999（急救）", ta: "999 ஐ அழைக்கவும் (அவசரம்)" },
  "report.normalRange": {
    en: "Normal range: {range}",
    bm: "Julat normal: {range}",
    zh: "正常范围：{range}",
    ta: "இயல்பு வரம்பு: {range}",
  },

  // Reports page
  "reports.upload.title": {
    en: "Upload Medical Report",
    bm: "Muat Naik Laporan Perubatan",
    zh: "上传医疗报告",
    ta: "மருத்துவ அறிக்கையைப் பதிவேற்றவும்",
  },
  "reports.upload.formats": { en: "Photo or PDF", bm: "Foto atau PDF", zh: "照片或 PDF", ta: "புகைப்படம் அல்லது PDF" },
  "reports.upload.desc": {
    en: "Take a photo or upload your blood test, scan, or hospital discharge summary. We explain it simply in your language.",
    bm: "Ambil gambar atau muat naik ujian darah, imbasan atau ringkasan discaj hospital anda. Kami terangkan dengan mudah dalam bahasa anda.",
    zh: "拍照或上传您的验血报告、扫描报告或出院小结，我们会用您的语言简单解释。",
    ta: "உங்கள் இரத்தப் பரிசோதனை, ஸ்கேன் அல்லது மருத்துவமனை டிஸ்சார்ஜ் சுருக்கத்தைப் புகைப்படம் எடுக்கவும் அல்லது பதிவேற்றவும். உங்கள் மொழியில் எளிமையாக விளக்குவோம்.",
  },
  "reports.upload.button": {
    en: "Select or Photograph Report",
    bm: "Pilih atau Ambil Gambar Laporan",
    zh: "选择或拍摄报告",
    ta: "அறிக்கையைத் தேர்ந்தெடுக்கவும் அல்லது புகைப்படம் எடுக்கவும்",
  },
  "reports.upload.analyzing": {
    en: "Analyzing your report with care...",
    bm: "Sedang menganalisis laporan anda dengan teliti...",
    zh: "正在仔细分析您的报告...",
    ta: "உங்கள் அறிக்கையைக் கவனமாக ஆய்வு செய்கிறோம்...",
  },
  "reports.upload.error": {
    en: "Failed to analyze report. Please try again.",
    bm: "Gagal menganalisis laporan. Sila cuba lagi.",
    zh: "报告分析失败，请重试。",
    ta: "அறிக்கையை ஆய்வு செய்ய முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
  },
  "reports.history.aria": { en: "Previous Reports", bm: "Laporan Terdahulu", zh: "以往报告", ta: "முந்தைய அறிக்கைகள்" },
  "reports.history.label": {
    en: "Select Report to View:",
    bm: "Pilih Laporan untuk Dilihat:",
    zh: "选择要查看的报告：",
    ta: "பார்க்க வேண்டிய அறிக்கையைத் தேர்ந்தெடுக்கவும்:",
  },
  "reports.empty": {
    en: "No reports uploaded yet. Upload a report above, or ask any health question below.",
    bm: "Belum ada laporan dimuat naik. Muat naik laporan di atas, atau tanya sebarang soalan kesihatan di bawah.",
    zh: "还没有上传报告。请在上方上传报告，或在下方提出任何健康问题。",
    ta: "இன்னும் அறிக்கைகள் எதுவும் பதிவேற்றப்படவில்லை. மேலே ஒரு அறிக்கையைப் பதிவேற்றவும் அல்லது கீழே ஏதேனும் உடல்நலக் கேள்வியைக் கேளுங்கள்.",
  },

  // Report view
  "report.aria": { en: "Report Summary for {name}", bm: "Ringkasan Laporan untuk {name}", zh: "{name} 的报告摘要", ta: "{name} அறிக்கைச் சுருக்கம்" },
  "report.summary": { en: "Summary", bm: "Ringkasan", zh: "摘要", ta: "சுருக்கம்" },
  "report.readAloud": { en: "Read Aloud", bm: "Baca Kuat", zh: "朗读", ta: "உரக்கப் படி" },
  "report.readAloud.aria": {
    en: "Read report summary aloud",
    bm: "Baca ringkasan laporan dengan kuat",
    zh: "朗读报告摘要",
    ta: "அறிக்கைச் சுருக்கத்தை உரக்கப் படி",
  },
  "report.stopReading": { en: "Stop Reading", bm: "Berhenti Membaca", zh: "停止朗读", ta: "படிப்பதை நிறுத்து" },
  "report.stopReading.aria": {
    en: "Stop reading report summary aloud",
    bm: "Berhenti membaca ringkasan laporan",
    zh: "停止朗读报告摘要",
    ta: "அறிக்கைச் சுருக்கத்தைப் படிப்பதை நிறுத்து",
  },
  "report.preparingVoice": { en: "Preparing voice...", bm: "Menyediakan suara...", zh: "正在准备语音...", ta: "குரல் தயாராகிறது..." },
  "report.ttsError": {
    en: "Could not read aloud right now. Please try again.",
    bm: "Tidak dapat membaca dengan kuat sekarang. Sila cuba lagi.",
    zh: "暂时无法朗读，请重试。",
    ta: "இப்போது உரக்கப் படிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
  },
  "report.keyMarkers": {
    en: "Key Health Markers",
    bm: "Penanda Kesihatan Utama",
    zh: "主要健康指标",
    ta: "முக்கிய உடல்நலக் குறிகாட்டிகள்",
  },

  // Chat
  "chat.aria": { en: "Health Assistant Chat", bm: "Sembang Pembantu Kesihatan", zh: "健康助手问答", ta: "உடல்நல உதவியாளர் உரையாடல்" },
  "chat.title": { en: "Health Assistant Chat", bm: "Sembang Pembantu Kesihatan", zh: "健康助手问答", ta: "உடல்நல உதவியாளர் உரையாடல்" },
  "chat.greeting": {
    en: "Hello, I am HealthMate, an AI helper (not a doctor). Do you have any questions about your report or medications that I can help explain?",
    bm: "Hai, saya HealthMate, pembantu AI (bukan doktor). Ada apa-apa soalan tentang laporan kesihatan atau ubat anda yang boleh saya bantu?",
    zh: "您好，我是 HealthMate，一个 AI 助手（不是医生）。关于您的健康报告或药物，您有什么想问的吗？",
    ta: "வணக்கம், நான் ஹெல்த்மேட், ஒரு AI உதவியாளர் (மருத்துவர் அல்ல). உங்கள் உடல்நல அறிக்கை அல்லது மருந்துகள் குறித்து ஏதேனும் கேள்விகள் உள்ளதா?",
  },
  "chat.error": {
    en: "Sorry, I had trouble answering that. Please try asking again.",
    bm: "Maaf, berlaku masalah menyambung ke pembantu. Sila cuba lagi sebentar lagi.",
    zh: "抱歉，连接助手时出现问题。请稍后重试。",
    ta: "மன்னிக்கவும், உதவியாளருடன் இணைப்பதில் சிக்கல் ஏற்பட்டது. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.",
  },
  "chat.reportConnected": { en: "Report Connected", bm: "Laporan Disambung", zh: "已关联报告", ta: "அறிக்கை இணைக்கப்பட்டது" },
  "chat.thinking": {
    en: "HealthMate is thinking kindly...",
    bm: "HealthMate sedang berfikir...",
    zh: "HealthMate 正在思考...",
    ta: "HealthMate யோசிக்கிறது...",
  },
  "chat.inputLabel": { en: "Ask a health question", bm: "Tanya soalan kesihatan", zh: "提出健康问题", ta: "உடல்நலக் கேள்வி கேளுங்கள்" },
  "chat.placeholderReport": {
    en: "Ask anything about this report or test...",
    bm: "Tanya apa sahaja tentang laporan ini...",
    zh: "关于这份报告，您可以问任何问题...",
    ta: "இந்த அறிக்கை பற்றி எதையும் கேளுங்கள்...",
  },
  "chat.placeholderGeneral": {
    en: "Ask any general health question...",
    bm: "Tanya sebarang soalan kesihatan...",
    zh: "请提出任何健康问题...",
    ta: "எந்த உடல்நலக் கேள்வியையும் கேளுங்கள்...",
  },
  "chat.voice.aria": {
    en: "Start a voice conversation with HealthMate",
    bm: "Mulakan perbualan suara dengan HealthMate",
    zh: "开始与 HealthMate 语音对话",
    ta: "HealthMate உடன் குரல் உரையாடலைத் தொடங்கு",
  },
  "chat.send.aria": { en: "Send message", bm: "Hantar mesej", zh: "发送消息", ta: "செய்தியை அனுப்பு" },

  // Voice
  "voice.aria": {
    en: "Voice Conversation Assistant",
    bm: "Pembantu Perbualan Suara",
    zh: "语音对话助手",
    ta: "குரல் உரையாடல் உதவியாளர்",
  },
  "voice.title": { en: "HealthMate Voice", bm: "Suara HealthMate", zh: "HealthMate 语音", ta: "HealthMate குரல்" },
  "voice.reportActive": {
    en: "Report Context Active",
    bm: "Konteks Laporan Aktif",
    zh: "已使用报告信息",
    ta: "அறிக்கைச் சூழல் செயலில்",
  },
  "voice.listening": {
    en: "Listening... Speak naturally",
    bm: "Sedang mendengar... Bercakap seperti biasa",
    zh: "正在聆听...请自然地说话",
    ta: "கேட்கிறேன்... இயல்பாகப் பேசுங்கள்",
  },
  "voice.thinking": {
    en: "Thinking about your question...",
    bm: "Sedang memikirkan soalan anda...",
    zh: "正在思考您的问题...",
    ta: "உங்கள் கேள்வியைப் பற்றி யோசிக்கிறேன்...",
  },
  "voice.speaking": {
    en: "HealthMate is speaking...",
    bm: "HealthMate sedang bercakap...",
    zh: "HealthMate 正在说话...",
    ta: "HealthMate பேசுகிறது...",
  },
  "voice.unavailable": { en: "Voice Unavailable", bm: "Suara Tidak Tersedia", zh: "语音不可用", ta: "குரல் கிடைக்கவில்லை" },
  "voice.tapToTalk": {
    en: "Tap the microphone to talk",
    bm: "Tekan mikrofon untuk bercakap",
    zh: "点击麦克风开始说话",
    ta: "பேச மைக்ரோஃபோனைத் தட்டவும்",
  },
  "voice.hint.listening": {
    en: "Ask about your report, medicines or meals. I will answer when you pause.",
    bm: "Tanya tentang laporan, ubat atau makanan anda. Saya akan menjawab apabila anda berhenti seketika.",
    zh: "可以询问您的报告、药物或饮食。您停顿时我就会回答。",
    ta: "உங்கள் அறிக்கை, மருந்துகள் அல்லது உணவு பற்றிக் கேளுங்கள். நீங்கள் நிறுத்தியதும் பதிலளிப்பேன்.",
  },
  "voice.hint.speaking": {
    en: "Tap the button to interrupt and ask something else.",
    bm: "Tekan butang untuk mencelah dan bertanya soalan lain.",
    zh: "点击按钮可打断并提出其他问题。",
    ta: "இடைமறித்து வேறு கேள்வி கேட்க பொத்தானைத் தட்டவும்.",
  },
  "voice.hint.idle": {
    en: "Tap the microphone whenever you are ready to speak.",
    bm: "Tekan mikrofon apabila anda bersedia untuk bercakap.",
    zh: "准备好后，请点击麦克风说话。",
    ta: "பேசத் தயாரானதும் மைக்ரோஃபோனைத் தட்டவும்.",
  },
  "voice.interrupt.aria": { en: "Interrupt and speak", bm: "Celah dan bercakap", zh: "打断并说话", ta: "இடைமறித்துப் பேசு" },
  "voice.start.aria": { en: "Start speaking", bm: "Mula bercakap", zh: "开始说话", ta: "பேசத் தொடங்கு" },
  "voice.you": { en: "You", bm: "Anda", zh: "您", ta: "நீங்கள்" },
  "voice.errorTitle": { en: "Voice Session Error", bm: "Ralat Sesi Suara", zh: "语音会话错误", ta: "குரல் அமர்வுப் பிழை" },
  "voice.error.unsupported": {
    en: "Voice chat is not supported on this browser. Please use text chat instead.",
    bm: "Sembang suara tidak disokong pada pelayar ini. Sila gunakan sembang teks.",
    zh: "此浏览器不支持语音聊天，请改用文字问答。",
    ta: "இந்த உலாவியில் குரல் உரையாடல் ஆதரிக்கப்படவில்லை. உரை உரையாடலைப் பயன்படுத்தவும்.",
  },
  "voice.error.permission": {
    en: "Microphone permission was denied. Please allow the microphone or use text chat.",
    bm: "Kebenaran mikrofon ditolak. Sila benarkan mikrofon atau gunakan sembang teks.",
    zh: "麦克风权限被拒绝。请允许使用麦克风，或改用文字问答。",
    ta: "மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது. மைக்ரோஃபோனை அனுமதிக்கவும் அல்லது உரை உரையாடலைப் பயன்படுத்தவும்.",
  },
  "voice.error.unavailable": {
    en: "Voice chat is temporarily unavailable. Please use text chat instead.",
    bm: "Sembang suara tidak tersedia buat sementara. Sila gunakan sembang teks.",
    zh: "语音聊天暂时不可用，请改用文字问答。",
    ta: "குரல் உரையாடல் தற்காலிகமாகக் கிடைக்கவில்லை. உரை உரையாடலைப் பயன்படுத்தவும்.",
  },
  "voice.error.turn": {
    en: "Sorry, I could not hear that clearly. Tap the microphone to try again.",
    bm: "Maaf, saya tidak dapat mendengar dengan jelas. Tekan mikrofon untuk cuba lagi.",
    zh: "抱歉，我没有听清楚。请点击麦克风再试一次。",
    ta: "மன்னிக்கவும், தெளிவாகக் கேட்கவில்லை. மீண்டும் முயற்சிக்க மைக்ரோஃபோனைத் தட்டவும்.",
  },
  "voice.end": {
    en: "End Voice Chat (Return to Text)",
    bm: "Tamatkan Sembang Suara (Kembali ke Teks)",
    zh: "结束语音（返回文字问答）",
    ta: "குரல் உரையாடலை முடி (உரைக்குத் திரும்பு)",
  },

  // Pills page
  "pills.check.title": {
    en: "Check Your Medications",
    bm: "Semak Ubat Anda",
    zh: "检查您的药物",
    ta: "உங்கள் மருந்துகளைச் சரிபார்க்கவும்",
  },
  "pills.reportSynced": { en: "Report Synced", bm: "Laporan Diselaraskan", zh: "已同步报告", ta: "அறிக்கை ஒத்திசைக்கப்பட்டது" },
  "pills.desc": {
    en: "Take a photo of your pills, blister packs, or prescription boxes. We will identify each pill, explain how to take it, and check for safety interactions.",
    bm: "Ambil gambar ubat, pek ubat atau kotak preskripsi anda. Kami akan kenal pasti setiap ubat, terangkan cara mengambilnya dan semak interaksi keselamatan.",
    zh: "拍下您的药片、药板或处方药盒。我们会识别每种药，说明服用方法，并检查安全相互作用。",
    ta: "உங்கள் மாத்திரைகள், மாத்திரை அட்டைகள் அல்லது மருந்துப் பெட்டிகளைப் புகைப்படம் எடுங்கள். ஒவ்வொரு மருந்தையும் அடையாளம் கண்டு, எப்படி உட்கொள்வது என்று விளக்கி, பாதுகாப்பு இடைவினைகளைச் சரிபார்ப்போம்.",
  },
  "pills.button": {
    en: "Take Photo or Upload Medication",
    bm: "Ambil Gambar atau Muat Naik Ubat",
    zh: "拍照或上传药物照片",
    ta: "மருந்தைப் புகைப்படம் எடுக்கவும் அல்லது பதிவேற்றவும்",
  },
  "pills.analyzing": {
    en: "Analyzing medication carefully...",
    bm: "Sedang menganalisis ubat dengan teliti...",
    zh: "正在仔细分析药物...",
    ta: "மருந்தைக் கவனமாக ஆய்வு செய்கிறோம்...",
  },
  "pills.error": {
    en: "Failed to analyze pills. Please take a clearer photo and try again.",
    bm: "Gagal menganalisis ubat. Sila ambil gambar yang lebih jelas dan cuba lagi.",
    zh: "药物分析失败。请拍一张更清晰的照片再试。",
    ta: "மருந்தை ஆய்வு செய்ய முடியவில்லை. தெளிவான புகைப்படம் எடுத்து மீண்டும் முயற்சிக்கவும்.",
  },
  "pills.history.aria": {
    en: "Previous Medication Scans",
    bm: "Imbasan Ubat Terdahulu",
    zh: "以往的药物扫描",
    ta: "முந்தைய மருந்து ஸ்கேன்கள்",
  },
  "pills.history.label": { en: "Past Pill Scans:", bm: "Imbasan Ubat Lepas:", zh: "以往的药物扫描：", ta: "முந்தைய மருந்து ஸ்கேன்கள்:" },
  "pills.scanLabel": {
    en: "Scan on {date} ({count} medicines)",
    bm: "Imbasan {date} ({count} ubat)",
    zh: "{date} 扫描（{count} 种药）",
    ta: "{date} ஸ்கேன் ({count} மருந்துகள்)",
  },
  "pills.scanLabelOne": {
    en: "Scan on {date} (1 medicine)",
    bm: "Imbasan {date} (1 ubat)",
    zh: "{date} 扫描（1 种药）",
    ta: "{date} ஸ்கேன் (1 மருந்து)",
  },
  "pills.connection": {
    en: "Personalized Health Connection",
    bm: "Kaitan dengan Kesihatan Anda",
    zh: "与您健康状况的关联",
    ta: "உங்கள் உடல்நலத்துடன் தொடர்பு",
  },
  "pills.purpose": { en: "What It Is For", bm: "Kegunaan Ubat", zh: "用途", ta: "இது எதற்காக" },
  "pills.howToTake": { en: "How to Take It", bm: "Cara Mengambil", zh: "服用方法", ta: "எப்படி உட்கொள்வது" },
  "pills.fromLabel": {
    en: "From your pharmacy label",
    bm: "Daripada label farmasi anda",
    zh: "来自您的药房标签",
    ta: "உங்கள் மருந்தக லேபிளிலிருந்து",
  },
  "pills.dosageNotVisible": {
    en: "The dose is not visible in this photo. Follow the instructions on your pharmacy label, or ask your pharmacist.",
    bm: "Dos tidak kelihatan dalam foto ini. Ikut arahan pada label farmasi anda, atau tanya ahli farmasi.",
    zh: "照片中看不到剂量。请按照药房标签上的说明服用，或询问药剂师。",
    ta: "இந்தப் புகைப்படத்தில் மருந்தளவு தெரியவில்லை. உங்கள் மருந்தக லேபிளில் உள்ள வழிமுறைகளைப் பின்பற்றவும் அல்லது மருந்தாளரிடம் கேளுங்கள்.",
  },
  "pills.lowConfidence": {
    en: "We are not sure this is the right medicine. Please check the name with your pharmacist before relying on this information.",
    bm: "Kami tidak pasti ini ubat yang betul. Sila semak nama ubat dengan ahli farmasi sebelum bergantung pada maklumat ini.",
    zh: "我们不确定这是否是正确的药物。在依据这些信息之前，请先向药剂师核对药名。",
    ta: "இது சரியான மருந்துதானா என்று எங்களுக்கு உறுதியாகத் தெரியவில்லை. இந்தத் தகவலை நம்புவதற்கு முன் மருந்தின் பெயரை மருந்தாளரிடம் சரிபார்க்கவும்.",
  },
  "pills.sideEffects": {
    en: "Side Effects to Watch Out For",
    bm: "Kesan Sampingan yang Perlu Diperhatikan",
    zh: "需要留意的副作用",
    ta: "கவனிக்க வேண்டிய பக்க விளைவுகள்",
  },
  "pills.foodInteractions": {
    en: "Food & Drink Interactions",
    bm: "Interaksi Makanan & Minuman",
    zh: "饮食相互作用",
    ta: "உணவு & பான இடைவினைகள்",
  },
  "pills.avoid": { en: "Avoid: {item}", bm: "Elakkan: {item}", zh: "避免：{item}", ta: "தவிர்க்கவும்: {item}" },
  "pills.drugInteractions": { en: "Medication Interactions", bm: "Interaksi Ubat", zh: "药物相互作用", ta: "மருந்து இடைவினைகள்" },
  "pills.empty": {
    en: "No medications analyzed yet. Take or upload a photo above to identify your pills.",
    bm: "Belum ada ubat dianalisis. Ambil atau muat naik gambar di atas untuk mengenal pasti ubat anda.",
    zh: "还没有分析过药物。请在上方拍照或上传照片来识别您的药物。",
    ta: "இன்னும் மருந்துகள் ஆய்வு செய்யப்படவில்லை. உங்கள் மருந்துகளை அடையாளம் காண மேலே புகைப்படம் எடுக்கவும் அல்லது பதிவேற்றவும்.",
  },

  // Timeline page
  "timeline.journey": {
    en: "Your Health Journey",
    bm: "Perjalanan Kesihatan Anda",
    zh: "您的健康历程",
    ta: "உங்கள் உடல்நலப் பயணம்",
  },
  "timeline.logMeal": { en: "Log Meal", bm: "Rekod Makanan", zh: "记录饮食", ta: "உணவைப் பதிவு செய்" },
  "timeline.desc": {
    en: "Track your past medical reports and meals. Select any two reports to compare lab markers and see how your health is changing over time.",
    bm: "Jejaki laporan perubatan dan makanan lepas anda. Pilih mana-mana dua laporan untuk membandingkan penanda makmal dan melihat perubahan kesihatan anda.",
    zh: "查看您以往的医疗报告和饮食记录。选择任意两份报告，比较化验指标，了解健康变化。",
    ta: "உங்கள் முந்தைய மருத்துவ அறிக்கைகளையும் உணவுகளையும் கண்காணியுங்கள். ஆய்வக அளவீடுகளை ஒப்பிட்டு உடல்நல மாற்றத்தைக் காண ஏதேனும் இரண்டு அறிக்கைகளைத் தேர்ந்தெடுக்கவும்.",
  },
  "timeline.selectedCount": {
    en: "{count} of 2 reports selected for comparison",
    bm: "{count} daripada 2 laporan dipilih untuk perbandingan",
    zh: "已选择 {count}/2 份报告进行比较",
    ta: "ஒப்பிட 2 இல் {count} அறிக்கைகள் தேர்ந்தெடுக்கப்பட்டன",
  },
  "timeline.compare": { en: "Compare Progression", bm: "Bandingkan Perkembangan", zh: "比较变化", ta: "முன்னேற்றத்தை ஒப்பிடு" },
  "timeline.comparing": {
    en: "Comparing reports...",
    bm: "Sedang membandingkan laporan...",
    zh: "正在比较报告...",
    ta: "அறிக்கைகளை ஒப்பிடுகிறோம்...",
  },
  "timeline.compareError": {
    en: "Failed to compare reports. Please try again.",
    bm: "Gagal membandingkan laporan. Sila cuba lagi.",
    zh: "报告比较失败，请重试。",
    ta: "அறிக்கைகளை ஒப்பிட முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
  },
  "timeline.comparison.aria": {
    en: "Report Comparison Result",
    bm: "Keputusan Perbandingan Laporan",
    zh: "报告比较结果",
    ta: "அறிக்கை ஒப்பீட்டு முடிவு",
  },
  "timeline.comparisonTitle": {
    en: "Progression Comparison",
    bm: "Perbandingan Perkembangan",
    zh: "变化比较",
    ta: "முன்னேற்ற ஒப்பீடு",
  },
  "timeline.markerChanges": { en: "Marker Changes", bm: "Perubahan Penanda", zh: "指标变化", ta: "அளவீட்டு மாற்றங்கள்" },
  "timeline.previous": { en: "Previous: {value}", bm: "Sebelum: {value}", zh: "之前：{value}", ta: "முன்பு: {value}" },
  "timeline.latest": { en: "Latest: {value}", bm: "Terkini: {value}", zh: "最新：{value}", ta: "சமீபத்தியது: {value}" },
  "timeline.history.aria": { en: "Timeline History", bm: "Sejarah Garis Masa", zh: "时间线记录", ta: "காலவரிசை வரலாறு" },
  "timeline.empty": {
    en: "Your timeline is empty. Reports and meal logs will appear here automatically.",
    bm: "Garis masa anda kosong. Laporan dan rekod makanan akan dipaparkan di sini secara automatik.",
    zh: "您的时间线还是空的。报告和饮食记录会自动显示在这里。",
    ta: "உங்கள் காலவரிசை காலியாக உள்ளது. அறிக்கைகளும் உணவுப் பதிவுகளும் இங்கே தானாகத் தோன்றும்.",
  },
  "timeline.selected": { en: "Selected", bm: "Dipilih", zh: "已选择", ta: "தேர்ந்தெடுக்கப்பட்டது" },
  "timeline.selectToCompare": { en: "Select to Compare", bm: "Pilih untuk Banding", zh: "选择比较", ta: "ஒப்பிடத் தேர்ந்தெடு" },
  "timeline.meal": { en: "Meal: {dishes}", bm: "Makanan: {dishes}", zh: "饮食：{dishes}", ta: "உணவு: {dishes}" },
  "progression.improving": { en: "IMPROVING", bm: "BERTAMBAH BAIK", zh: "好转", ta: "முன்னேற்றம்" },
  "progression.stable": { en: "STABLE", bm: "STABIL", zh: "稳定", ta: "நிலையானது" },
  "progression.declining": { en: "DECLINING", bm: "MEROSOT", zh: "变差", ta: "பின்னடைவு" },
  "progression.mixed": { en: "MIXED", bm: "BERCAMPUR", zh: "有好有坏", ta: "கலவையானது" },
  "change.better": { en: "Better", bm: "Lebih baik", zh: "好转", ta: "மேம்பட்டது" },
  "change.worse": { en: "Worse", bm: "Lebih teruk", zh: "变差", ta: "மோசமானது" },
  "change.same": { en: "No change", bm: "Tiada perubahan", zh: "无变化", ta: "மாற்றமில்லை" },
  "change.unknown": { en: "Ask your doctor", bm: "Tanya doktor", zh: "请问医生", ta: "மருத்துவரிடம் கேளுங்கள்" },
  "trends.title": {
    en: "Your results over time",
    bm: "Keputusan anda dari semasa ke semasa",
    zh: "您的指标变化趋势",
    ta: "காலப்போக்கில் உங்கள் முடிவுகள்",
  },
  "trends.pick": { en: "Choose a test:", bm: "Pilih ujian:", zh: "选择检查项目：", ta: "ஒரு பரிசோதனையைத் தேர்ந்தெடுக்கவும்:" },
  "trends.normalBand": {
    en: "Shaded area = normal range",
    bm: "Kawasan berlorek = julat normal",
    zh: "阴影区域 = 正常范围",
    ta: "நிழலிட்ட பகுதி = இயல்பு வரம்பு",
  },
  "trends.date": { en: "Date", bm: "Tarikh", zh: "日期", ta: "தேதி" },
  "trends.value": { en: "Result", bm: "Keputusan", zh: "结果", ta: "முடிவு" },
  "trends.chartAria": {
    en: "{name} over time",
    bm: "{name} dari semasa ke semasa",
    zh: "{name} 的变化趋势",
    ta: "காலப்போக்கில் {name}",
  },

  // Meal advisor
  "meal.title": { en: "Dietary Meal Advisor", bm: "Penasihat Pemakanan", zh: "饮食建议", ta: "உணவு ஆலோசகர்" },
  "meal.personalized": {
    en: "Personalized with your recent health report & pills",
    bm: "Diperibadikan berdasarkan laporan kesihatan & ubat terkini anda",
    zh: "已根据您最近的健康报告和药物个性化",
    ta: "உங்கள் சமீபத்திய உடல்நல அறிக்கை & மருந்துகளுக்கு ஏற்ப தனிப்பயனாக்கப்பட்டது",
  },
  "meal.photoTab": { en: "Photograph Meal", bm: "Ambil Gambar Makanan", zh: "拍摄饮食", ta: "உணவைப் புகைப்படம் எடு" },
  "meal.textTab": { en: "Type Meal", bm: "Taip Makanan", zh: "输入饮食", ta: "உணவைத் தட்டச்சு செய்" },
  "meal.photoDesc": {
    en: "Snap a photo of your food, hawker meal, or plate. We will identify the dishes and check if they suit you.",
    bm: "Ambil gambar makanan, hidangan gerai atau pinggan anda. Kami akan kenal pasti hidangan dan semak kesesuaiannya untuk anda.",
    zh: "拍下您的食物、小贩餐或餐盘，我们会识别菜肴并检查是否适合您。",
    ta: "உங்கள் உணவு, கடை உணவு அல்லது தட்டைப் புகைப்படம் எடுங்கள். உணவுகளை அடையாளம் கண்டு உங்களுக்கு ஏற்றதா என்று பார்ப்போம்.",
  },
  "meal.photoButton": {
    en: "Take Photo or Upload Dish",
    bm: "Ambil Gambar atau Muat Naik Hidangan",
    zh: "拍照或上传菜肴",
    ta: "உணவைப் புகைப்படம் எடு அல்லது பதிவேற்று",
  },
  "meal.analyzingPhoto": {
    en: "Analyzing meal ingredients...",
    bm: "Sedang menganalisis bahan makanan...",
    zh: "正在分析食物成分...",
    ta: "உணவுப் பொருட்களை ஆய்வு செய்கிறோம்...",
  },
  "meal.textDesc": {
    en: "Describe what you are eating (e.g. “Chicken rice with chili, soup, and barley water”):",
    bm: "Terangkan apa yang anda makan (cth. “Nasi ayam dengan cili, sup dan air barli”):",
    zh: "描述您正在吃的食物（例如“鸡饭配辣椒、汤和薏米水”）：",
    ta: "நீங்கள் என்ன சாப்பிடுகிறீர்கள் என்று விவரிக்கவும் (எ.கா. “சிக்கன் சாதம், மிளகாய், சூப் மற்றும் பார்லி நீர்”):",
  },
  "meal.textPlaceholder": {
    en: "e.g. Nasi lemak with fried egg and sambal, teh tarik...",
    bm: "cth. Nasi lemak dengan telur goreng dan sambal, teh tarik...",
    zh: "例如：椰浆饭配煎蛋和参巴酱、拉茶...",
    ta: "எ.கா. நாசி லெமாக், பொரித்த முட்டை, சம்பல், தே தாரிக்...",
  },
  "meal.analyzingText": {
    en: "Evaluating nutrition for you...",
    bm: "Sedang menilai pemakanan untuk anda...",
    zh: "正在为您评估营养...",
    ta: "உங்களுக்கான ஊட்டச்சத்தை மதிப்பிடுகிறோம்...",
  },
  "meal.submit": { en: "Analyze Meal Advice", bm: "Dapatkan Nasihat Makanan", zh: "获取饮食建议", ta: "உணவு ஆலோசனை பெறு" },
  "meal.error": {
    en: "Failed to analyze the meal. Please try again.",
    bm: "Gagal menganalisis makanan. Sila cuba lagi.",
    zh: "饮食分析失败，请重试。",
    ta: "உணவை ஆய்வு செய்ய முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
  },
  "meal.dishes": { en: "Dishes: {dishes}", bm: "Hidangan: {dishes}", zh: "菜肴：{dishes}", ta: "உணவுகள்: {dishes}" },
  "meal.score": { en: "Score: {score}/100", bm: "Skor: {score}/100", zh: "评分：{score}/100", ta: "மதிப்பெண்: {score}/100" },
  "meal.notScored": { en: "Not scored", bm: "Tiada skor", zh: "未评分", ta: "மதிப்பெண் இல்லை" },
  "meal.saved": {
    en: "Saved to your Health Timeline!",
    bm: "Disimpan ke Garis Masa Kesihatan anda!",
    zh: "已保存到您的健康时间线！",
    ta: "உங்கள் உடல்நல காலவரிசையில் சேமிக்கப்பட்டது!",
  },
} satisfies Record<string, Translations>;

export type StringKey = keyof typeof STRINGS;

export function translate(
  language: Language,
  key: StringKey,
  vars?: Record<string, string | number>
): string {
  const entry: Translations = STRINGS[key];
  let text = entry[language] || entry.en;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.split(`{${name}}`).join(String(value));
    }
  }
  return text;
}
