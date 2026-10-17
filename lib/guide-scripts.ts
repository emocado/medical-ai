import type { Language, OnboardingStep, GuideChoice, GuideHint, DrAishaExpression } from "@/types";

export const DR_AISHA_PERSONA = {
  name: "Dr. Aisha",
  role: "Friendly Personal Health Companion",
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    expression: "smiling",
    title: {
      en: "Meet Dr. Aisha",
      bm: "Kenali Dr. Aisha",
      zh: "认识爱莎医生",
      ta: "டாக்டர் ஆயிஷாவைச் சந்தியுங்கள்",
    },
    speech: {
      en: "Hello! I am Dr. Aisha. I am your personal health companion, here to help you understand your reports, medicines, and daily wellness.",
      bm: "Salam sejahtera! Saya Dr. Aisha, rakan kesihatan anda. Saya di sini untuk membantu anda memahami laporan perubatan, ubat-ubatan, dan kesihatan harian anda.",
      zh: "您好！我是爱莎医生。我是您的贴心健康伙伴，协助您轻松了解检验报告、用药指南与日常健康。",
      ta: "வணக்கம்! நான் டாக்டர் ஆயிஷா. உங்கள் மருத்துவ அறிக்கைகள் மற்றும் மருந்துகளை எளிதில் புரிந்துகொள்ள உதவும் உங்கள் நலத் தோழி.",
    },
  },
  {
    id: "reports",
    expression: "speaking",
    title: {
      en: "Simple Report Explanations",
      bm: "Penerangan Laporan Mudah",
      zh: "简单看懂医疗报告",
      ta: "எளிய மருத்துவ அறிக்கை விளக்கம்",
    },
    speech: {
      en: "Take a photo of your clinic or hospital report. I will translate complex lab numbers into clear, simple advice you can easily understand.",
      bm: "Ambil gambar laporan klinik atau hospital anda. Saya akan terangkan bacaan makmal yang rumit dalam bahasa mudah yang senang difahami.",
      zh: "拍下您的诊所或医院报告，我会将复杂的化验指标转化为通俗易懂的说明，让您一目了然。",
      ta: "உங்கள் மருத்துவமனை அறிக்கையை புகைப்படம் எடுங்கள். சிக்கலான மருத்துவக் குறியீடுகளை எளிய தமிழில் விளக்குகிறேன்.",
    },
  },
  {
    id: "pills",
    expression: "speaking",
    title: {
      en: "Understand Your Medicines",
      bm: "Ketahui Ubat-Ubatan Anda",
      zh: "辨识您的药丸与用药",
      ta: "உங்கள் மாத்திரைகளைப் பற்றி அறியுங்கள்",
    },
    speech: {
      en: "Snap a photo of your medicine box or pills. I will tell you what each medicine is for, how to take it safely, and what foods to avoid.",
      bm: "Ambil gambar kotak atau pek ubat anda. Saya akan maklumkan tujuan ubat, cara pengambilan selamat, dan pantang larang makanan.",
      zh: "给药盒或药片拍张照片，我会告诉您每种药的用途、正确服用方法以及需要避免的饮食禁忌。",
      ta: "உங்கள் மாத்திரை பெட்டியை புகைப்படம் எடுங்கள். மருந்தின் பயன்பாடு, உட்கொள்ளும் முறை மற்றும் உணவு வழிமுறைகளை கூறுகிறேன்.",
    },
  },
  {
    id: "voice",
    expression: "smiling",
    title: {
      en: "Talk to Me With Your Voice",
      bm: "Bercakap Menggunakan Suara",
      zh: "随时用语音和我交谈",
      ta: "குரல் வழியே உரையாடுங்கள்",
    },
    speech: {
      en: "You do not need to type. Just tap the blue microphone button at any time to talk directly with me using your voice. I am always here to listen.",
      bm: "Anda tidak perlu menaip. Hanya tekan butang mikrofon biru pada bila-bila masa untuk bercakap dengan saya menggunakan suara anda.",
      zh: "您无需打字输入。随时点击蓝色麦克风图标，就能直接和我语音说话，让我随时为您解答。",
      ta: "நீங்கள் தட்டச்சு செய்யத் தேவையில்லை. எப்போது வேண்டுமானாலும் நீல மைக்ரோஃபோன் பொத்தானைத் தட்டி என்னுடன் குரலில் பேசலாம்.",
    },
  },
];

export const CONTEXTUAL_GUIDE_CHOICES: Record<
  string,
  {
    choices: Record<
      Language,
      Array<{ id: string; label: string; reply: string; expression: DrAishaExpression }>
    >;
  }
> = {
  "/reports": {
    choices: {
      en: [
        {
          id: "how_upload",
          label: "How do I upload a report?",
          reply: "Tap the big camera button above to take a clear photo of your lab test or clinic paper. I will read it automatically.",
          expression: "speaking",
        },
        {
          id: "how_ask",
          label: "How do I ask questions?",
          reply: "You can tap the microphone button below to ask by voice, or type a short question into the chat box.",
          expression: "smiling",
        },
      ],
      bm: [
        {
          id: "how_upload",
          label: "Bagaimana memuat naik laporan?",
          reply: "Tekan butang kamera besar di atas untuk mengambil gambar laporan ujian makmal anda. Saya akan membacanya secara automatik.",
          expression: "speaking",
        },
        {
          id: "how_ask",
          label: "Bagaimana cara bertanya soalan?",
          reply: "Anda boleh tekan butang mikrofon di bawah untuk bertanya dengan suara, atau taip soalan ringkas dalam ruang sembang.",
          expression: "smiling",
        },
      ],
      zh: [
        {
          id: "how_upload",
          label: "如何上传或拍照报告？",
          reply: "点击上方的相机大按钮，拍下清晰的体检单或化验单照片，我会马上为您分析解读。",
          expression: "speaking",
        },
        {
          id: "how_ask",
          label: "如何向您提问？",
          reply: "您可以点击下方的麦克风按钮直接语音提问，也可以在打字框里输入您的疑问。",
          expression: "smiling",
        },
      ],
      ta: [
        {
          id: "how_upload",
          label: "அறிக்கையை எவ்வாறு பதிவேற்றுவது?",
          reply: "மேலே உள்ள கேமரா பொத்தானைத் தட்டி உங்கள் மருத்துவ அறிக்கையை படம் எடுங்கள். நான் அதை படித்து விளக்குகிறேன்.",
          expression: "speaking",
        },
        {
          id: "how_ask",
          label: "கேள்விகள் கேட்பது எப்படி?",
          reply: "கீழே உள்ள மைக்ரோஃபோன் பொத்தானைத் தட்டி குரல் மூலம் கேளுங்கள் அல்லது தட்டச்சு செய்யுங்கள்.",
          expression: "smiling",
        },
      ],
    },
  },
  "/pills": {
    choices: {
      en: [
        {
          id: "how_pills",
          label: "How do I check my pills?",
          reply: "Place your medicine packaging on a flat surface and tap 'Take Photo of Pills'. I will identify each pill and dosage.",
          expression: "speaking",
        },
        {
          id: "pill_safety",
          label: "Can you check medicine clashes?",
          reply: "Yes, I compare your scanned pills with your uploaded lab reports to check if any medicine clashes with your health condition.",
          expression: "smiling",
        },
      ],
      bm: [
        {
          id: "how_pills",
          label: "Bagaimana memeriksa ubat saya?",
          reply: "Letakkan kotak atau bungkusan ubat di atas meja dan tekan 'Ambil Gambar Ubat'. Saya akan mengenal pasti ubat dan dosnya.",
          expression: "speaking",
        },
        {
          id: "pill_safety",
          label: "Bolehkah semak keselamatan ubat?",
          reply: "Ya, saya membandingkan ubat anda dengan laporan kesihatan untuk memastikan tiada interaksi bahaya.",
          expression: "smiling",
        },
      ],
      zh: [
        {
          id: "how_pills",
          label: "如何辨识与检查我的药？",
          reply: "将药盒或药袋平放在桌上，点击‘拍摄药丸照片’，我会辨识药品名称与剂量。",
          expression: "speaking",
        },
        {
          id: "pill_safety",
          label: "会检查药物相互作用吗？",
          reply: "是的，我会把您的药物与体检报告比对，确保没有用药冲突或食物禁忌。",
          expression: "smiling",
        },
      ],
      ta: [
        {
          id: "how_pills",
          label: "மருந்துகளை எப்படி சரிபார்ப்பது?",
          reply: "உங்கள் மருந்து அட்டையை தட்டையான இடத்தில் வைத்து படம் எடுங்கள். நான் பெயர் மற்றும் அளவைக் கூறுகிறேன்.",
          expression: "speaking",
        },
        {
          id: "pill_safety",
          label: "மருந்து முரண்பாடுகளை அறிவீர்களா?",
          reply: "ஆம், உங்கள் மருத்துவ அறிக்கையுடன் ஒப்பிட்டு ஆபத்தான உணவு அல்லது மருந்து சேர்க்கைகளை எச்சரிப்பேன்.",
          expression: "smiling",
        },
      ],
    },
  },
  "/timeline": {
    choices: {
      en: [
        {
          id: "timeline_help",
          label: "What is this timeline for?",
          reply: "This timeline tracks how your blood sugar, cholesterol, and blood pressure change over months and years.",
          expression: "speaking",
        },
        {
          id: "compare_visits",
          label: "How do I compare visits?",
          reply: "Upload reports from different visits. I will highlight whether your key health markers are improving or worsening.",
          expression: "smiling",
        },
      ],
      bm: [
        {
          id: "timeline_help",
          label: "Apakah fungsi garis masa ini?",
          reply: "Garis masa ini menjejaki perubahan gula dalam darah, kolesterol, dan tekanan darah anda sepanjang masa.",
          expression: "speaking",
        },
        {
          id: "compare_visits",
          label: "Bagaimana membandingkan lawatan?",
          reply: "Muat naik laporan daripada lawatan berbeza untuk melihat sama ada tahap kesihatan anda semakin baik.",
          expression: "smiling",
        },
      ],
      zh: [
        {
          id: "timeline_help",
          label: "健康时间线有什么作用？",
          reply: "时间线会追踪您历次就医的血糖、胆固醇与血压变化，清晰展现长期走势。",
          expression: "speaking",
        },
        {
          id: "compare_visits",
          label: "如何比对不同就医报告？",
          reply: "上传不同日期的体检报告，我会标出您的重要身体指标是在好转还是需要注意。",
          expression: "smiling",
        },
      ],
      ta: [
        {
          id: "timeline_help",
          label: "இந்த காலக்கோடு எதற்கு?",
          reply: "இது உங்கள் இரத்த சர்க்கரை மற்றும் இரத்த அழுத்த மாற்றங்களை காலப்போக்கில் கண்காணிக்கிறது.",
          expression: "speaking",
        },
        {
          id: "compare_visits",
          label: "அறிக்கைகளை ஒப்பிடுவது எப்படி?",
          reply: "பல்வேறு மருத்துவமனை அறிக்கைகளைப் பதிவேற்றி உங்கள் உடல்நிலை முன்னேற்றத்தை அறியலாம்.",
          expression: "smiling",
        },
      ],
    },
  },
};

export const GLOBAL_OVERVIEW_CHOICE: Record<Language, { label: string; reply: string }> = {
  en: {
    label: "What can you do?",
    reply: "I am Dr. Aisha. I can explain your medical reports in simple words, check your pill safety, analyze your meals, and talk with you anytime by voice.",
  },
  bm: {
    label: "Apa yang anda boleh buat?",
    reply: "Saya Dr. Aisha. Saya boleh menerangkan laporan perubatan, memeriksa keselamatan ubat, menganalisis makanan, dan berbual dengan anda melalui suara.",
  },
  zh: {
    label: "您能为我做些什么？",
    reply: "我是爱莎医生。我能为您解读检验报告、检查用药安全、分析日常饮食营养，并随时用语音与您温和交流。",
  },
  ta: {
    label: "உங்களால் என்ன செய்ய முடியும்?",
    reply: "நான் டாக்டர் ஆயிஷா. மருத்துவ அறிக்கைகளை எளிதாக விளக்குதல், மருந்துகளை சரிபார்த்தல், உணவை ஆராய்தல் மற்றும் குரல் உரையாடல் செய்ய முடியும்.",
  },
};

export const IDLE_HINTS = {
  reports: {
    empty: {
      en: [
        "Tap the camera button to take a photo of your medical report or blood test.",
        "You can show me any clinic letter or lab result, and I will explain it for you.",
      ],
      bm: [
        "Tekan butang kamera untuk mengambil gambar laporan perubatan atau ujian darah anda.",
        "Anda boleh tunjukkan surat klinik atau keputusan makmal, dan saya akan terangkannya.",
      ],
      zh: [
        "点击相机按钮拍下您的体检报告或血液化验单吧。",
        "您可以向我展示任何诊所单据或化验结果，我会用大白话为您讲解。",
      ],
      ta: [
        "உங்கள் இரத்தப் பரிசோதனை அல்லது மருத்துவ அறிக்கையை புகைப்படம் எடுக்க கேமராவைத் தொடவும்.",
        "மருத்துவமனை அறிக்கையைக் காட்டினால் நான் எளிய தமிழில் விளக்குவேன்.",
      ],
    },
    populated: {
      en: [
        "You can ask me questions about your report summary — try the microphone button below.",
        "Tap any biomarker card above to hear more details about your health markers.",
      ],
      bm: [
        "Anda boleh bertanya soalan tentang rumusan laporan anda menggunakan butang mikrofon di bawah.",
        "Tekan mana-mana kad petunjuk kesihatan di atas untuk mendengar penerangan lanjut.",
      ],
      zh: [
        "您可以直接点击下方的麦克风，就您的报告摘要向我提问。",
        "点击上方的任何指标卡片，可以了解详细的健康解释。",
      ],
      ta: [
        "கீழே உள்ள மைக்ரோஃபோன் பொத்தானைப் பயன்படுத்தி உங்கள் அறிக்கையைப் பற்றி கேள்விகள் கேளுங்கள்.",
        "மேலும் விவரங்களைக் கேட்க மேலே உள்ள குறிப்பான்களைத் தொடவும்.",
      ],
    },
  },
  pills: {
    all: {
      en: [
        "Take a photo of your medicine bottle or pill packet — I will tell you what it is for.",
        "I can check whether your medicines have any harmful food clashes.",
      ],
      bm: [
        "Ambil gambar botol ubat atau pek pil anda — saya akan maklumkan kegunaannya.",
        "Saya boleh memeriksa sama ada ubat anda mempunyai pantang larang makanan.",
      ],
      zh: [
        "给您的药盒或药片拍张照片，我会告诉您它们的作用与用法。",
        "我可以帮您检查所服用的药物是否存在食物禁忌或相互冲突。",
      ],
      ta: [
        "உங்கள் மருந்து பாட்டிலை புகைப்படம் எடுங்கள், அதன் பயன்பாட்டை நான் கூறுகிறேன்.",
        "உங்கள் மருந்துகளுக்கு ஏதேனும் உணவு முரண்பாடுகள் உள்ளதா என்று நான் சரிபார்க்க முடியும்.",
      ],
    },
  },
  timeline: {
    all: {
      en: [
        "This timeline displays how your health markers change across different doctor visits.",
        "Keep uploading your new reports to see long-term health improvements.",
      ],
      bm: [
        "Garis masa ini menunjukkan perubahan tahap kesihatan anda antara lawatan doktor.",
        "Teruskan memuat naik laporan terkini untuk melihat peningkatan kesihatan jangka panjang.",
      ],
      zh: [
        "健康时间线展示了您不同就医时期的身体指标变化。",
        "持续记录最新报告，可以清晰看到您的长期健康改善趋势。",
      ],
      ta: [
        "மருத்துவர் வருகைகளுக்கு இடையே உங்கள் உடல்நிலை எவ்வாறு மாறுகிறது என்பதை இந்த காலக்கோடு காட்டுகிறது.",
        "நீண்டகால முன்னேற்றத்தைக் காண புதிய அறிக்கைகளைப் பதிவேற்றுங்கள்.",
      ],
    },
  },
};
