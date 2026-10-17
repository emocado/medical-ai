// Hero language switch, lazy feature videos, tour chapters.
(function () {
  var COPY = {
    en: {
      title: "Medical reports, explained in <mark>your own language.</mark>",
      lede: "HealthMate reads blood tests, medicine labels and discharge notes, then tells you what they mean in English, Bahasa Malaysia, 中文 or தமிழ். If a result needs a doctor today, it says so plainly.",
    },
    bm: {
      title: "Laporan perubatan, diterangkan dalam <mark>bahasa anda sendiri.</mark>",
      lede: "HealthMate membaca ujian darah, label ubat dan ringkasan discaj, kemudian menerangkan maksudnya dalam Bahasa Malaysia, English, 中文 atau தமிழ். Jika sesuatu keputusan perlu dirujuk kepada doktor hari ini, ia memberitahu anda dengan jelas.",
    },
    zh: {
      title: "医疗报告，用<mark>您自己的语言</mark>讲清楚。",
      lede: "HealthMate 读懂验血报告、药品标签和出院小结，再用中文、English、Bahasa Malaysia 或 தமிழ் 告诉您是什么意思。如果有结果需要今天就看医生，它会直接告诉您。",
    },
    ta: {
      title: "மருத்துவ அறிக்கைகள், <mark>உங்கள் சொந்த மொழியில்</mark> விளக்கமாக.",
      lede: "HealthMate இரத்தப் பரிசோதனைகள், மருந்து லேபிள்கள் மற்றும் டிஸ்சார்ஜ் குறிப்புகளைப் படித்து, அவற்றின் பொருளை தமிழ், English, Bahasa Malaysia அல்லது 中文 மொழியில் சொல்கிறது. இன்றே மருத்துவரைப் பார்க்க வேண்டிய முடிவு இருந்தால், அதைத் தெளிவாகச் சொல்கிறது.",
    },
  };
  var HTML_LANG = { en: "en", bm: "ms", zh: "zh", ta: "ta" };

  var title = document.getElementById("hero-title");
  var lede = document.getElementById("hero-lede");
  var buttons = document.querySelectorAll(".langs button");

  function setLang(code) {
    var copy = COPY[code] || COPY.en;
    title.innerHTML = copy.title;
    lede.textContent = copy.lede;
    title.lang = lede.lang = HTML_LANG[code];
    buttons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === code));
    });
    try {
      localStorage.setItem("hm-lang", code);
    } catch (e) {}
  }

  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      setLang(b.dataset.lang);
    });
  });
  try {
    var saved = localStorage.getItem("hm-lang");
    if (saved && COPY[saved] && saved !== "en") setLang(saved);
  } catch (e) {}

  // Feature recordings load when near the screen and pause when scrolled away.
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lazy = document.querySelectorAll("video[data-src]");
  var hero = document.querySelector(".hero video");

  if (reduced) {
    document.querySelectorAll(".phone video").forEach(function (v) {
      v.removeAttribute("autoplay");
      v.pause();
      v.controls = true;
    });
  }

  function load(v) {
    if (!v.src && v.dataset.src) v.src = v.dataset.src;
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var v = entry.target;
          if (entry.isIntersecting) {
            load(v);
            if (!reduced) {
              var p = v.play();
              if (p && p.catch) p.catch(function () {});
            }
          } else {
            v.pause();
          }
        });
      },
      { rootMargin: "200px 0px", threshold: 0.25 }
    );
    lazy.forEach(function (v) {
      io.observe(v);
    });
    if (hero) io.observe(hero);
  } else {
    lazy.forEach(function (v) {
      load(v);
      v.controls = true;
    });
  }

  // Tour chapters jump to the moment in the video.
  var tour = document.getElementById("tour-video");
  document.querySelectorAll(".chapters button").forEach(function (b) {
    b.addEventListener("click", function () {
      tour.currentTime = Number(b.dataset.t);
      var p = tour.play();
      if (p && p.catch) p.catch(function () {});
      tour.focus();
    });
  });
})();
