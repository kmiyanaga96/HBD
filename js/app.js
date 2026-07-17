/* =========================================================
 * 招待状アプリ本体
 * 回答は GitHub リポジトリの answers/ フォルダに保存されます。
 * 保存には URL の #k=トークン が必要です(README参照)。
 * ========================================================= */
(function () {
  "use strict";

  /* ---------- URLからトークンを取り出す(履歴に残らないよう即消去) ---------- */
  let token = null;
  const hashMatch = location.hash.match(/[#&]k=([^&]+)/);
  if (hashMatch) {
    token = decodeURIComponent(hashMatch[1]);
    try {
      sessionStorage.setItem("hbd_k", token);
    } catch (_) {}
    history.replaceState(null, "", location.pathname + location.search);
  } else {
    try {
      token = sessionStorage.getItem("hbd_k");
    } catch (_) {}
  }

  /* ---------- 状態 ---------- */
  let current = 0;
  // answers[i] = 選択インデックスの配列(単一選択でも配列で持つ)
  const answers = QUESTIONS.map(() => []);

  /* ---------- 要素 ---------- */
  const $ = (id) => document.getElementById(id);
  const scenes = {
    envelope: $("scene-envelope"),
    letter: $("scene-letter"),
    quiz: $("scene-quiz"),
    confirm: $("scene-confirm"),
    done: $("scene-done"),
  };

  function showScene(name) {
    Object.values(scenes).forEach((s) => s.classList.remove("active"));
    scenes[name].classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- 文言の流し込み ---------- */
  $("envelope-subtitle").textContent = CONFIG.envelopeSubtitle;
  $("letter-title").textContent = `${CONFIG.herName}、${CONFIG.letterTitle}`;
  $("letter-message").textContent = CONFIG.letterMessage;
  $("done-title").textContent = CONFIG.doneTitle;
  $("done-message").textContent = CONFIG.doneMessage;

  /* ---------- シーン1: 封筒 ---------- */
  const envelopeWrap = $("envelope");
  let opened = false;
  function openEnvelope() {
    if (opened) return;
    opened = true;
    envelopeWrap.querySelector(".envelope").classList.add("open");
    window.confettiBurst(140);
    setTimeout(() => showScene("letter"), 1100);
  }
  envelopeWrap.addEventListener("click", openEnvelope);
  envelopeWrap.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") openEnvelope();
  });

  /* ---------- シーン2 → クイズへ ---------- */
  $("btn-start").addEventListener("click", () => {
    current = 0;
    renderQuestion();
    showScene("quiz");
  });

  /* ---------- シーン3: クイズ ---------- */
  const dotsEl = $("progress-dots");
  const choicesEl = $("choices");
  const btnNext = $("btn-next");
  const btnBack = $("btn-back");

  function renderQuestion() {
    const q = QUESTIONS[current];

    dotsEl.innerHTML = "";
    QUESTIONS.forEach((_, i) => {
      const d = document.createElement("div");
      d.className =
        "dot" + (i < current ? " done" : i === current ? " current" : "");
      dotsEl.appendChild(d);
    });
    $("progress-label").textContent = `Question ${current + 1} / ${QUESTIONS.length}`;

    $("quiz-emoji").textContent = q.emoji || "🎈";
    $("quiz-question").textContent = q.question;
    $("quiz-note").textContent = q.multiple ? "複数選択できます" : "";

    choicesEl.innerHTML = "";
    q.choices.forEach((choice, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "choice" + (answers[current].includes(i) ? " selected" : "");
      b.textContent = choice;
      b.addEventListener("click", () => {
        if (q.multiple) {
          const pos = answers[current].indexOf(i);
          if (pos >= 0) answers[current].splice(pos, 1);
          else answers[current].push(i);
          b.classList.toggle("selected");
        } else {
          answers[current] = [i];
          choicesEl
            .querySelectorAll(".choice")
            .forEach((el) => el.classList.remove("selected"));
          b.classList.add("selected");
        }
        updateNav();
      });
      choicesEl.appendChild(b);
    });

    btnBack.textContent = current === 0 ? "手紙にもどる" : "もどる";
    btnNext.textContent =
      current === QUESTIONS.length - 1 ? "かくにんへ" : "つぎへ";
    updateNav();
  }

  function updateNav() {
    btnNext.disabled = answers[current].length === 0;
  }

  btnBack.addEventListener("click", () => {
    if (current === 0) {
      showScene("letter");
    } else {
      current--;
      renderQuestion();
    }
  });

  btnNext.addEventListener("click", () => {
    if (answers[current].length === 0) return;
    if (current < QUESTIONS.length - 1) {
      current++;
      renderQuestion();
    } else {
      renderConfirm();
      showScene("confirm");
    }
  });

  /* ---------- シーン4: 確認 ---------- */
  function answerTexts(qi) {
    return answers[qi]
      .slice()
      .sort((a, b) => a - b)
      .map((ci) => QUESTIONS[qi].choices[ci]);
  }

  function renderConfirm() {
    const list = $("confirm-list");
    list.innerHTML = "";
    QUESTIONS.forEach((q, qi) => {
      const li = document.createElement("li");
      const qEl = document.createElement("span");
      qEl.className = "q";
      qEl.textContent = `${q.emoji || ""} ${q.question}`;
      const aEl = document.createElement("span");
      aEl.className = "a";
      aEl.textContent = answerTexts(qi).join("、");
      li.appendChild(qEl);
      li.appendChild(aEl);
      list.appendChild(li);
    });
    $("submit-status").textContent = "";
    $("submit-status").classList.remove("error");
    $("btn-submit").disabled = false;
  }

  $("btn-edit").addEventListener("click", () => {
    current = 0;
    renderQuestion();
    showScene("quiz");
  });

  /* ---------- 送信(GitHubに保存) ---------- */
  function buildPayload() {
    return {
      submittedAt: new Date().toISOString(),
      answers: QUESTIONS.map((q, qi) => ({
        question: q.question,
        selected: answerTexts(qi),
      })),
    };
  }

  // UTF-8 文字列 → base64
  function toBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin);
  }

  function timestampSlug(d) {
    const p = (n) => String(n).padStart(2, "0");
    return (
      d.getFullYear() +
      p(d.getMonth() + 1) +
      p(d.getDate()) +
      "-" +
      p(d.getHours()) +
      p(d.getMinutes()) +
      p(d.getSeconds())
    );
  }

  async function saveToGitHub(payload) {
    const api = "https://api.github.com";
    const repo = `${CONFIG.repoOwner}/${CONFIG.repoName}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    // 保存先ブランチ = リポジトリのデフォルトブランチ
    const repoRes = await fetch(`${api}/repos/${repo}`, { headers });
    if (!repoRes.ok) throw new Error(`repo: ${repoRes.status}`);
    const branch = (await repoRes.json()).default_branch;

    const path = `answers/answer-${timestampSlug(new Date())}.json`;
    const putRes = await fetch(
      `${api}/repos/${repo}/contents/${encodeURIComponent(path)}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message: `🎂 誕生日の回答が届きました (${payload.submittedAt})`,
          content: toBase64(JSON.stringify(payload, null, 2)),
          branch,
        }),
      }
    );
    if (!putRes.ok) throw new Error(`save: ${putRes.status}`);
  }

  function downloadFallback(payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `birthday-answer-${timestampSlug(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  $("btn-submit").addEventListener("click", async () => {
    const status = $("submit-status");
    const btn = $("btn-submit");
    const payload = buildPayload();

    // 念のためローカルにも控えを保存
    try {
      localStorage.setItem("hbd_last_answer", JSON.stringify(payload));
    } catch (_) {}

    btn.disabled = true;
    status.classList.remove("error");

    if (token) {
      status.textContent = "送信中…";
      try {
        await saveToGitHub(payload);
        finishSuccess();
        return;
      } catch (err) {
        console.error(err);
        status.classList.add("error");
        status.textContent =
          "うまく送信できなかったみたい。\nもう一度おしてみてね。";
        btn.disabled = false;
        return;
      }
    }

    // トークンなしで開いた場合: 回答ファイルをダウンロードして渡してもらう
    status.textContent =
      "回答ファイルを保存しました。\nこのファイルを送ってあげてね。";
    downloadFallback(payload);
    setTimeout(finishSuccess, 1200);
  });

  function finishSuccess() {
    showScene("done");
    window.confettiBurst(160);
    window.confettiRain(80, 3000);
  }
})();
