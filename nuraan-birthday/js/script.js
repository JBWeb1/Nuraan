(function(){
  "use strict";

  /* ============================================================
     Content — edit here
     ============================================================ */
  var CHAPTERS = [
    { n:1,  title:"TWENTY-ONE",       line:"Some birthdays are just birthdays.<br>This one isn't." },
    { n:2,  title:"A NEW CHAPTER",    line:"You don't need to have<br>everything figured out yet." },
    { n:3,  title:"THAT'S JUST YOU",  line:"Some people make memories<br>without even trying." },
    { n:4,  title:"THE LITTLE THINGS",line:"It's usually the small moments<br>we remember." },
    { n:5,  title:"THE CHAOS",        line:"Every good story<br>needs a little of it." },
    { n:6,  title:"FOR THE BAD DAYS", line:"Keep this one<br>for whenever you need it." },
    { n:7,  title:"WHAT'S AHEAD",     line:"You don't know yet<br>how far you're going." },
    { n:8,  title:"JUST YOU",         line:"No comparisons.<br>No conditions. Just you." },
    { n:9,  title:"FUTURE NURAAN",    line:"She's going to look back<br>on this and smile." },
    { n:10, title:"HAPPY 21ST",       line:"Here's to everything<br>that's still unwritten." }
  ];

  // photo interludes placed after these chapter numbers — one per chapter,
  // ordered chronologically (youngest photo first) so the site plays like
  // a growing-up arc alongside the 10 voice notes
  var PHOTO_AFTER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // edit the year/caption for each photo interlude here — order matches PHOTO_AFTER above
  var PHOTOS_META = [
    { year: "", caption: "Replace with your own memory." },
    { year: "", caption: "Replace with your own memory." },
    { year: "", caption: "Replace with your own memory." },
    { year: "", caption: "Replace with your own memory." },
    { year: "", caption: "Replace with your own memory." },
    { year: "", caption: "Replace with your own memory." },
    { year: "", caption: "Replace with your own memory." },
    { year: "", caption: "Replace with your own memory." },
    { year: "", caption: "Replace with your own memory." },
    { year: "", caption: "Replace with your own memory." }
  ];

  /* ============================================================
     Build screen order:  intro, chapter-1, [photo-1], chapter-2, ...
     ============================================================ */
  var order = ["intro"];
  var photoIndex = 0;
  CHAPTERS.forEach(function(ch){
    order.push("chapter-" + ch.n);
    if (PHOTO_AFTER.indexOf(ch.n) !== -1){
      photoIndex++;
      order.push("photo-" + photoIndex);
    }
  });
  order.push("final", "letter", "complete");

  function pad2(n){ return (n < 10 ? "0" : "") + n; }
  function nextOf(id){
    var i = order.indexOf(id);
    return order[i + 1] || null;
  }

  /* ============================================================
     Generate chapter + photo markup
     ============================================================ */
  var chaptersRoot = document.getElementById("chaptersRoot");
  var photosRoot = document.getElementById("photosRoot");

  CHAPTERS.forEach(function(ch){
    var id = "chapter-" + ch.n;
    var next = nextOf(id);
    var isLast = ch.n === CHAPTERS.length;
    var btnLabel = isLast ? "CONTINUE" : "NEXT CHAPTER →";
    var bars = "";
    for (var b = 0; b < 26; b++) bars += "<span></span>";

    var html =
      '<section class="screen screen--chapter" data-screen="' + id + '" data-chapter="' + ch.n + '">' +
        '<p class="chapter-num">' + pad2(ch.n) + '</p>' +
        '<h2 class="chapter-title">' + ch.title + '</h2>' +
        '<p class="chapter-line">' + ch.line + '</p>' +
        '<div class="player" data-chapter="' + ch.n + '">' +
          '<span class="player-label">VOICE NOTE ' + pad2(ch.n) + '</span>' +
          '<div class="player-controls">' +
            '<button class="play-btn" aria-label="Play voice note ' + ch.n + '">' +
              '<svg class="icon-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>' +
              '<svg class="icon-pause" viewBox="0 0 24 24" style="display:none"><path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/></svg>' +
            '</button>' +
            '<div class="waveform-wrap"><div class="waveform">' + bars + '</div></div>' +
          '</div>' +
          '<div class="player-time"><span class="time-current">00:00</span><span class="time-total">00:00</span></div>' +
          '<div class="replay-row"><button class="replay-btn-inline">&#8635; REPLAY</button></div>' +
          '<p class="player-missing-note">Voice note not added yet — drop <strong>voice-' + pad2(ch.n) + '.mp3</strong> into the <strong>audio</strong> folder.</p>' +
          '<audio class="audio-el" preload="none"><source src="audio/voice-' + pad2(ch.n) + '.mp3" type="audio/mpeg"></audio>' +
        '</div>' +
        '<div class="chapter-footer">' +
          '<p class="complete-tag">VOICE NOTE COMPLETE</p>' +
          '<button class="continue-btn" data-goto="' + next + '">' + btnLabel + '</button>' +
        '</div>' +
      '</section>';
    chaptersRoot.insertAdjacentHTML("beforeend", html);
  });

  for (var p = 1; p <= photoIndex; p++){
    var pid = "photo-" + p;
    var pnext = nextOf(pid);
    var meta = PHOTOS_META[p - 1] || { year: "", caption: "Replace with your own memory." };
    var html2 =
      '<section class="screen screen--photo" data-screen="' + pid + '">' +
        '<div class="photo-frame" data-index="' + p + '">' +
          '<img class="photo-img" alt="">' +
          '<div class="photo-placeholder">' +
            '<span class="placeholder-label">PHOTO ' + pad2(p) + '</span>' +
            '<span class="placeholder-hint">Add images/photo-' + pad2(p) + '.jpg</span>' +
          '</div>' +
        '</div>' +
        '<div class="photo-caption-wrap">' +
          '<p class="photo-year">' + (meta.year || "&nbsp;") + '</p>' +
          '<p class="photo-caption">' + meta.caption + '</p>' +
        '</div>' +
        '<div class="photo-continue-wrap">' +
          '<button class="continue-btn is-visible" data-goto="' + pnext + '">CONTINUE</button>' +
        '</div>' +
      '</section>';
    photosRoot.insertAdjacentHTML("beforeend", html2);
  }

  /* ============================================================
     Progress state (persisted so she can close and resume)
     ============================================================ */
  var STORAGE_KEY = "nuraan21_unlocked_index";
  var unlockedIndex = 1; // index into `order` — everything up to and including this is reachable
  try {
    var saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved !== null) unlockedIndex = Math.max(1, parseInt(saved, 10) || 1);
  } catch(e){ /* storage unavailable — fine, just won't persist */ }

  function unlockThrough(idx){
    if (idx > unlockedIndex){
      unlockedIndex = idx;
      try { window.localStorage.setItem(STORAGE_KEY, String(unlockedIndex)); } catch(e){}
    }
  }

  /* ============================================================
     Chrome (progress dots) — only shown during chapter/photo browsing
     ============================================================ */
  var chrome = document.getElementById("chrome");
  var chromeDots = document.getElementById("chromeDots");
  var chromeCount = document.getElementById("chromeCount");

  CHAPTERS.forEach(function(ch){
    var dot = document.createElement("span");
    dot.className = "dot";
    dot.dataset.chapter = ch.n;
    dot.addEventListener("click", function(){
      var idx = order.indexOf("chapter-" + ch.n);
      if (idx !== -1 && idx <= unlockedIndex) goTo("chapter-" + ch.n);
    });
    chromeDots.appendChild(dot);
  });

  function refreshChrome(currentId){
    var showChrome = currentId.indexOf("chapter-") === 0 || currentId.indexOf("photo-") === 0;
    chrome.classList.toggle("is-visible", showChrome);
    if (!showChrome) return;

    var currentChapterNum = 1;
    if (currentId.indexOf("chapter-") === 0){
      currentChapterNum = parseInt(currentId.split("-")[1], 10);
    } else {
      // find nearest preceding chapter number for a photo screen
      var idx = order.indexOf(currentId);
      for (var i = idx; i >= 0; i--){
        if (order[i].indexOf("chapter-") === 0){ currentChapterNum = parseInt(order[i].split("-")[1], 10); break; }
      }
    }
    chromeCount.textContent = pad2(currentChapterNum) + " / " + CHAPTERS.length;

    var dots = chromeDots.querySelectorAll(".dot");
    dots.forEach(function(dot){
      var n = parseInt(dot.dataset.chapter, 10);
      var idx = order.indexOf("chapter-" + n);
      dot.classList.toggle("is-unlocked", idx <= unlockedIndex);
      dot.classList.toggle("is-current", n === currentChapterNum);
    });
  }

  /* ============================================================
     Screen navigation
     ============================================================ */
  var sweepEl = document.createElement("div");
  sweepEl.className = "sweep";
  document.body.appendChild(sweepEl);

  var currentScreenId = "intro";

  function goTo(id, opts){
    opts = opts || {};
    var targetIdx = order.indexOf(id);
    if (targetIdx === -1) return;
    unlockThrough(targetIdx);

    var currentEl = document.querySelector('.screen[data-screen="' + currentScreenId + '"]');
    var nextEl = document.querySelector('.screen[data-screen="' + id + '"]');
    if (!nextEl) return;

    var isChapterEntry = id.indexOf("chapter-") === 0;

    if (currentEl && currentEl !== nextEl){
      currentEl.classList.add("is-leaving");
      currentEl.classList.remove("is-active");
    }

    var delay = currentEl ? 480 : 0;

    if (isChapterEntry){
      sweepEl.classList.remove("is-active");
      void sweepEl.offsetWidth;
      sweepEl.classList.add("is-active");
    }

    setTimeout(function(){
      if (currentEl) currentEl.classList.remove("is-leaving");
      nextEl.classList.add("is-active");
      currentScreenId = id;
      refreshChrome(id);

      if (id === "complete") startParticles();
      if (id === "final"){
        // restart the reveal animation each time we enter
        nextEl.classList.remove("is-active");
        void nextEl.offsetWidth;
        nextEl.classList.add("is-active");
      }
    }, delay);
  }

  // wire every [data-goto] continue button once, at click time (delegation)
  document.addEventListener("click", function(e){
    var btn = e.target.closest("[data-goto]");
    if (btn) goTo(btn.getAttribute("data-goto"));
  });

  document.getElementById("beginBtn").addEventListener("click", function(){
    goTo("chapter-1");
  });

  /* ============================================================
     Audio players
     ============================================================ */
  function formatTime(sec){
    if (!isFinite(sec) || isNaN(sec)) sec = 0;
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  document.querySelectorAll(".player").forEach(function(player){
    var chapterNum = parseInt(player.dataset.chapter, 10);
    var audio = player.querySelector(".audio-el");
    var playBtn = player.querySelector(".play-btn");
    var iconPlay = player.querySelector(".icon-play");
    var iconPause = player.querySelector(".icon-pause");
    var waveform = player.querySelector(".waveform");
    var timeCurrent = player.querySelector(".time-current");
    var timeTotal = player.querySelector(".time-total");
    var replayRow = player.querySelector(".replay-row");
    var replayBtn = player.querySelector(".replay-btn-inline");
    var footer = player.closest(".screen").querySelector(".chapter-footer");
    var completeTag = footer.querySelector(".complete-tag");
    var continueBtn = footer.querySelector(".continue-btn");

    var hasSource = false;

    audio.addEventListener("loadedmetadata", function(){
      hasSource = true;
      player.classList.remove("is-missing");
      timeTotal.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("error", function(){
      hasSource = false;
      player.classList.add("is-missing");
    });

    // probe: try to load metadata without playing
    audio.preload = "metadata";
    audio.load();

    function setPlayingUI(isPlaying){
      playBtn.classList.toggle("is-playing", isPlaying);
      waveform.classList.toggle("is-playing", isPlaying);
      iconPlay.style.display = isPlaying ? "none" : "";
      iconPause.style.display = isPlaying ? "" : "none";
    }

    playBtn.addEventListener("click", function(){
      if (!hasSource){
        player.classList.add("is-missing");
        return;
      }
      // pause every other audio element first — only one plays at once
      document.querySelectorAll(".audio-el").forEach(function(a){
        if (a !== audio && !a.paused){ a.pause(); }
      });
      document.querySelectorAll(".player").forEach(function(p){
        if (p !== player){
          p.querySelector(".play-btn").classList.remove("is-playing");
          p.querySelector(".waveform").classList.remove("is-playing");
        }
      });

      if (audio.paused){
        audio.play().catch(function(){ player.classList.add("is-missing"); });
      } else {
        audio.pause();
      }
    });

    audio.addEventListener("play", function(){ setPlayingUI(true); });
    audio.addEventListener("pause", function(){ setPlayingUI(false); });

    audio.addEventListener("timeupdate", function(){
      timeCurrent.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener("ended", function(){
      setPlayingUI(false);
      replayRow.classList.add("is-visible");
      completeTag.classList.add("is-visible");
      continueBtn.classList.add("is-visible");
      var idx = order.indexOf("chapter-" + chapterNum);
      unlockThrough(idx + 1);
      refreshChrome(currentScreenId);
    });

    replayBtn.addEventListener("click", function(){
      audio.currentTime = 0;
      audio.play().catch(function(){});
    });
  });

  /* ============================================================
     Photo placeholders
     ============================================================ */
  document.querySelectorAll(".photo-frame").forEach(function(frame){
    var idx = frame.dataset.index;
    var img = frame.querySelector(".photo-img");
    var placeholder = frame.querySelector(".photo-placeholder");
    var src = "images/photo-" + pad2(parseInt(idx,10)) + ".jpg";

    var probe = new Image();
    probe.onload = function(){
      img.src = src;
      img.classList.add("is-loaded");
      placeholder.classList.add("is-hidden");
    };
    probe.onerror = function(){
      // stays as placeholder — nothing to do
    };
    probe.src = src;
  });

  /* ============================================================
     Letter
     ============================================================ */
  document.getElementById("openLetterBtn").addEventListener("click", function(){
    document.getElementById("letterClosed").style.display = "none";
    document.getElementById("letterOpen").classList.add("is-visible");
  });

  /* ============================================================
     Complete screen — soft particle drift
     ============================================================ */
  var particlesStarted = false;
  function startParticles(){
    if (particlesStarted) return;
    particlesStarted = true;
    var canvas = document.getElementById("particles");
    var ctx = canvas.getContext("2d");
    var w, h, dpr;
    function resize(){
      dpr = window.devicePixelRatio || 1;
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    resize();
    window.addEventListener("resize", resize);

    var particles = [];
    for (var i = 0; i < 34; i++){
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        speed: Math.random() * 0.25 + 0.05,
        drift: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.5 + 0.15
      });
    }

    function frame(){
      ctx.clearRect(0, 0, w, h);
      particles.forEach(function(p){
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -4){ p.y = h + 4; p.x = Math.random() * w; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(185,164,122," + p.alpha + ")";
        ctx.fill();
      });
      requestAnimationFrame(frame);
    }
    frame();
  }

  /* ============================================================
     Replay whole experience
     ============================================================ */
  document.getElementById("replayBtn").addEventListener("click", function(){
    document.getElementById("letterOpen").classList.remove("is-visible");
    document.getElementById("letterClosed").style.display = "";
    document.querySelectorAll(".complete-tag, .continue-btn, .replay-row").forEach(function(el){
      el.classList.remove("is-visible");
    });
    document.querySelector('.screen[data-screen="complete"]').classList.remove("is-active");
    currentScreenId = "intro";
    document.querySelector('.screen[data-screen="intro"]').classList.add("is-active");
    chrome.classList.remove("is-visible");
  });

  /* ============================================================
     Init
     ============================================================ */
  refreshChrome("intro");
})();
