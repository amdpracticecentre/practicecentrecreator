class LiveScenarioBuilder {
  constructor() {
    this.blocks = [];
    this.exportFormat = "json";
    this.uid = 0;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.render();
  }

  setupEventListeners() {
    document.getElementById("add-user-msg-btn").addEventListener("click", () => {
      this.addBlock("user");
    });

    document.getElementById("add-system-msg-btn").addEventListener("click", () => {
      this.addBlock("system");
    });

    document.getElementById("add-question-btn").addEventListener("click", () => {
      this.addBlock("question");
    });

    document.getElementById("export-json-btn").addEventListener("click", () => {
      this.exportFormat = "json";
      this.showExportModal();
    });

    document.getElementById("export-html-btn").addEventListener("click", () => {
      this.exportFormat = "html";
      this.showExportModal();
    });

    document.querySelectorAll(".format-tab").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".format-tab").forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        this.exportFormat = e.target.dataset.format;
        this.updateExportPreview();
      });
    });

    document.getElementById("copy-export-btn").addEventListener("click", () => {
      this.copyExport();
    });

    document.getElementById("download-export-btn").addEventListener("click", () => {
      this.downloadExport();
    });

    document.getElementById("close-export-btn").addEventListener("click", () => {
      this.closeExportModal();
    });

    document.querySelector("#export-modal .modal-backdrop").addEventListener("click", () => {
      this.closeExportModal();
    });
  }

  nextId(prefix) {
    this.uid += 1;
    return `${prefix}-${this.uid}`;
  }

  addBlock(type, insertAt = this.blocks.length) {
    const block = type === "question"
      ? {
          id: this.nextId("q"),
          type: "question",
          options: [this.createOption(), this.createOption()]
        }
      : {
          id: this.nextId("m"),
          type,
          text: ""
        };

    this.blocks.splice(insertAt, 0, block);
    this.render();
  }

  deleteBlock(index) {
    this.blocks.splice(index, 1);
    this.render();
  }

  createOption() {
    return {
      id: this.nextId("opt"),
      label: "",
      feedback: "",
      correct: false
    };
  }

  addOption(blockIndex) {
    this.blocks[blockIndex].options.push(this.createOption());
    this.render();
  }

  deleteOption(blockIndex, optionIndex) {
    this.blocks[blockIndex].options.splice(optionIndex, 1);
    this.render();
  }

  setCorrectOption(blockIndex, optionIndex) {
    this.blocks[blockIndex].options.forEach((option, index) => {
      option.correct = index === optionIndex;
    });
    this.render();
  }

  render() {
    const container = document.getElementById("blocks-container");
    container.innerHTML = "";

    if (this.blocks.length === 0) {
      const empty = document.createElement("div");
      empty.className = "inline-hint";
      empty.textContent = "Start building the conversation. Add a message or a question below.";
      container.appendChild(empty);
    }

    this.blocks.forEach((block, index) => {
      container.appendChild(this.createInsertControls(index));

      if (block.type === "question") {
        container.appendChild(this.renderQuestionBlock(block, index));
      } else {
        container.appendChild(this.renderMessageBlock(block, index));
      }
    });

    container.appendChild(this.createInsertControls(this.blocks.length));
  }

  createInsertControls(index) {
    const controls = document.createElement("div");
    controls.className = "insert-controls";

    const userBtn = this.makeInsertBtn("+ user", () => this.addBlock("user", index));
    const systemBtn = this.makeInsertBtn("+ system", () => this.addBlock("system", index));
    const questionBtn = this.makeInsertBtn("+ question", () => this.addBlock("question", index));

    controls.appendChild(userBtn);
    controls.appendChild(systemBtn);
    controls.appendChild(questionBtn);

    return controls;
  }

  makeInsertBtn(label, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "insert-btn";
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    return btn;
  }

  renderMessageBlock(block, index) {
    const element = document.createElement("article");
    element.className = `message-block ${block.type}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";

    const wrap = document.createElement("div");
    wrap.className = "bubble-wrap";

    const meta = document.createElement("div");
    meta.className = "meta";

    const author = document.createElement("span");
    author.className = "author";
    author.textContent = block.type === "system" ? "System" : "User";

    const tag = document.createElement("span");
    tag.className = "block-tag";
    tag.textContent = block.type;

    const text = document.createElement("textarea");
    text.className = "msg-textarea";
    text.placeholder = block.type === "system"
      ? "System guidance text..."
      : "User message...";
    text.value = block.text;
    text.addEventListener("input", (e) => {
      this.blocks[index].text = e.target.value;
    });

    const actions = document.createElement("div");
    actions.className = "block-actions";

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete-btn";
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      this.deleteBlock(index);
    });

    meta.appendChild(author);
    meta.appendChild(tag);
    actions.appendChild(del);
    wrap.appendChild(meta);
    wrap.appendChild(text);
    wrap.appendChild(actions);

    element.appendChild(avatar);
    element.appendChild(wrap);

    return element;
  }

  renderQuestionBlock(block, blockIndex) {
    const wrapper = document.createElement("section");
    wrapper.className = "question-block";

    const title = document.createElement("p");
    title.className = "question-title";
    title.textContent = "Question: add choices and mark exactly one as correct";
    wrapper.appendChild(title);

    block.options.forEach((option, optionIndex) => {
      const row = document.createElement("div");
      row.className = "option-row";

      const labelInput = document.createElement("input");
      labelInput.type = "text";
      labelInput.placeholder = "Button label";
      labelInput.value = option.label;
      labelInput.addEventListener("input", (e) => {
        this.blocks[blockIndex].options[optionIndex].label = e.target.value;
      });

      const feedbackInput = document.createElement("input");
      feedbackInput.type = "text";
      feedbackInput.placeholder = "Wrong-answer feedback";
      feedbackInput.value = option.feedback;
      feedbackInput.addEventListener("input", (e) => {
        this.blocks[blockIndex].options[optionIndex].feedback = e.target.value;
      });

      const correctBtn = document.createElement("button");
      correctBtn.type = "button";
      correctBtn.className = `correct-pill ${option.correct ? "" : "inactive"}`;
      correctBtn.textContent = option.correct ? "Correct" : "Set Correct";
      correctBtn.addEventListener("click", () => {
        this.setCorrectOption(blockIndex, optionIndex);
      });

      const optionDelete = document.createElement("button");
      optionDelete.type = "button";
      optionDelete.className = "option-delete";
      optionDelete.textContent = "Delete";
      optionDelete.addEventListener("click", () => {
        this.deleteOption(blockIndex, optionIndex);
      });

      row.appendChild(labelInput);
      row.appendChild(feedbackInput);
      row.appendChild(correctBtn);
      row.appendChild(optionDelete);

      wrapper.appendChild(row);
    });

    const footer = document.createElement("div");
    footer.className = "question-footer";

    const addOptionBtn = document.createElement("button");
    addOptionBtn.type = "button";
    addOptionBtn.className = "inline-add";
    addOptionBtn.textContent = "+ Add Choice";
    addOptionBtn.addEventListener("click", () => {
      this.addOption(blockIndex);
    });

    const deleteQuestionBtn = document.createElement("button");
    deleteQuestionBtn.type = "button";
    deleteQuestionBtn.className = "delete-btn";
    deleteQuestionBtn.textContent = "Delete Question";
    deleteQuestionBtn.addEventListener("click", () => {
      this.deleteBlock(blockIndex);
    });

    footer.appendChild(addOptionBtn);
    footer.appendChild(deleteQuestionBtn);
    wrapper.appendChild(footer);

    return wrapper;
  }

  getScenarioJSON() {
    const nodes = {};
    const startNodeId = "node-0";

    let nodeIndex = 0;
    let pendingMessages = [];

    const flushMessagesNode = (options, nextId) => {
      const nodeId = `node-${nodeIndex}`;
      nodes[nodeId] = {
        userMessages: pendingMessages,
        options: options.map((opt, index) => ({
          id: `option-${nodeIndex}-${index}`,
          label: opt.label.trim(),
          feedback: opt.feedback.trim(),
          correct: Boolean(opt.correct),
          next: nextId
        }))
      };
      pendingMessages = [];
      nodeIndex += 1;
    };

    this.blocks.forEach((block) => {
      if (block.type === "question") {
        const nextId = `node-${nodeIndex + 1}`;
        flushMessagesNode(block.options, nextId);
      } else {
        const text = block.text.trim();
        if (text) pendingMessages.push(text);
      }
    });

    const finalNodeId = `node-${nodeIndex}`;
    nodes[finalNodeId] = {
      userMessages: pendingMessages,
      options: []
    };

    // Ensure every question has exactly one correct option.
    Object.values(nodes).forEach((node) => {
      if (!node.options.length) return;
      const hasCorrect = node.options.some((opt) => opt.correct);
      if (!hasCorrect) {
        node.options[0].correct = true;
      }
    });

    return {
      startNodeId,
      nodes
    };
  }

  showExportModal() {
    document.getElementById("export-modal").classList.remove("hidden");
    this.updateExportPreview();
  }

  closeExportModal() {
    document.getElementById("export-modal").classList.add("hidden");
  }

  updateExportPreview() {
    let content = "";
    if (this.exportFormat === "json") {
      content = JSON.stringify(this.getScenarioJSON(), null, 2);
    } else {
      const scenarioName = document.getElementById("scenario-name").value.trim() || "Scenario";
      content = this.generateHTML(scenarioName);
    }
    document.getElementById("export-text").value = content;
  }

  generateHTML(scenarioName) {
    const scenarioJSON = JSON.stringify(this.getScenarioJSON(), null, 2);

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${scenarioName}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
    <style>
      :root {
        --bg-top: #0f1b2f;
        --bg-mid: #152748;
        --bg-bottom: #08101f;
        --line: rgba(255, 255, 255, 0.1);
        --text: #edf4ff;
        --muted: #a8b6d0;
        --accent: #ff4f7a;
        --danger: #ff754f;
        --positive: #1ac082;
        --shadow: 0 20px 55px rgba(2, 5, 12, 0.45);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: "Barlow", sans-serif;
        color: var(--text);
        background: radial-gradient(circle at 12% 15%, rgba(255, 79, 122, 0.25), transparent 28%), radial-gradient(circle at 87% 18%, rgba(78, 151, 255, 0.35), transparent 34%), linear-gradient(160deg, var(--bg-top), var(--bg-mid) 45%, var(--bg-bottom));
      }
      .app-shell {
        width: min(920px, calc(100vw - 2rem));
        height: min(92vh, 860px);
        border: 1px solid var(--line);
        border-radius: 22px;
        box-shadow: var(--shadow);
        background: linear-gradient(180deg, rgba(12, 19, 38, 0.95), rgba(7, 12, 24, 0.92));
        overflow: hidden;
      }
      .panel { width: 100%; height: 100%; }
      .hidden { display: none !important; }
      .splash-screen { display: grid; place-items: center; padding: clamp(1.5rem, 2vw, 2.5rem); }
      .splash-card {
        max-width: 620px;
        text-align: center;
        padding: clamp(1.6rem, 3vw, 2.8rem);
        border-radius: 24px;
        border: 1px solid var(--line);
        background: linear-gradient(160deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
      }
      .kicker { margin: 0; text-transform: uppercase; letter-spacing: 0.14em; color: #ff9eb8; font-size: 0.75rem; }
      h1 { font-family: "Space Grotesk", sans-serif; font-size: clamp(2rem, 5vw, 3.2rem); line-height: 1.05; margin: 0.65rem 0; }
      .lead { margin: 0 auto 1.8rem; max-width: 45ch; color: var(--muted); font-size: clamp(1rem, 2vw, 1.2rem); }
      button { border: none; color: inherit; font: inherit; cursor: pointer; }
      .primary-btn {
        background: linear-gradient(90deg, var(--accent), #ff8562);
        color: #fff;
        font-weight: 700;
        border-radius: 999px;
        padding: 0.75rem 1.6rem;
      }
      .chat-screen { display: grid; grid-template-rows: auto 1fr auto; background: linear-gradient(180deg, rgba(9, 14, 29, 0.9), rgba(6, 10, 23, 0.95)); }
      .chat-header { display: flex; justify-content: space-between; align-items: center; padding: 0.95rem 1.1rem; border-bottom: 1px solid var(--line); background: rgba(9, 15, 32, 0.9); }
      .channel-name { margin: 0; font-weight: 700; }
      .channel-subtitle { margin: 0.15rem 0 0; color: var(--muted); font-size: 0.9rem; }
      .ghost-btn { border-radius: 999px; background: rgba(255, 255, 255, 0.1); color: #fff; padding: 0.4rem 0.95rem; }
      .chat-log { overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.6rem; }
      .message { display: flex; gap: 0.68rem; align-items: flex-start; }
      .avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(140deg, #32d2ff, #1a7cf2); flex-shrink: 0; }
      .bubble-wrap { max-width: min(78%, 660px); }
      .meta { display: flex; gap: 0.55rem; align-items: center; margin-bottom: 0.2rem; }
      .author { font-weight: 700; font-size: 0.95rem; }
      .time { color: var(--muted); font-size: 0.8rem; }
      .bubble { border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(255, 255, 255, 0.06); padding: 0.7rem 0.8rem; line-height: 1.4; white-space: pre-wrap; }
      .choices { border-top: 1px solid var(--line); padding: 0.8rem; display: grid; gap: 0.6rem; background: rgba(8, 13, 27, 0.8); }
      .choice-btn { width: 100%; text-align: left; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.12); background: rgba(255, 255, 255, 0.04); padding: 0.72rem 0.82rem; color: #fff; }
      .choice-btn.correct { border-color: rgba(26, 192, 130, 0.5); background: rgba(26, 192, 130, 0.18); }
      .choice-btn.wrong { border-color: rgba(255, 117, 79, 0.62); background: rgba(255, 117, 79, 0.17); }
      .choice-btn:disabled { opacity: 0.72; }
      .modal { position: fixed; inset: 0; display: grid; place-items: center; z-index: 1000; padding: 1rem; }
      .modal.hidden { display: none !important; }
      .modal-backdrop { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.6); }
      .modal-content { position: relative; background: rgba(12, 19, 38, 0.98); border: 1px solid rgba(255, 255, 255, 0.16); border-radius: 16px; padding: 2rem; max-width: 420px; text-align: center; box-shadow: var(--shadow); }
      .feedback-text { margin: 0 0 1.5rem; font-size: 1.05rem; line-height: 1.5; color: #fff; }
      .modal-close-btn { background: linear-gradient(90deg, var(--accent), #ff8562); color: #fff; font-weight: 700; border-radius: 8px; padding: 0.8rem 1.8rem; }
      .message.system { justify-content: center; }
      .message.system .avatar,
      .message.system .author,
      .message.system .time { display: none; }
      .message.system .bubble-wrap { max-width: 100%; text-align: center; }
      .message.system .bubble { opacity: 0.65; background: rgba(255, 255, 255, 0.03); border-color: rgba(255, 255, 255, 0.05); font-size: 0.95rem; color: rgba(237, 244, 255, 0.75); max-width: 600px; }
      @media (max-width: 680px) {
        .app-shell { width: 100vw; height: 100vh; border-radius: 0; border-left: none; border-right: none; }
        .bubble-wrap { max-width: 86%; }
      }
    </style>
  </head>
  <body>
    <main class="app-shell" aria-live="polite">
      <section id="splash-screen" class="panel splash-screen">
        <div class="splash-card">
          <p class="kicker">Training Scenario</p>
          <h1>${scenarioName}</h1>
          <p class="lead">Work through the chat and keep selecting until you find the correct answer each time.</p>
          <button id="begin-btn" class="primary-btn">Begin</button>
        </div>
      </section>
      <section id="chat-screen" class="panel chat-screen hidden" aria-label="Scenario chat">
        <header class="chat-header">
          <div>
            <p class="channel-name">#scenario</p>
            <p class="channel-subtitle">Training</p>
          </div>
          <button id="restart-btn" class="ghost-btn" type="button">Restart</button>
        </header>
        <div id="chat-log" class="chat-log" role="log" aria-live="polite"></div>
        <div id="choices" class="choices" role="group" aria-label="Available choices"></div>
      </section>
    </main>
    <div id="wrong-answer-modal" class="modal hidden" role="alertdialog" aria-live="assertive">
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <p id="feedback-text" class="feedback-text"></p>
        <button id="modal-close-btn" class="modal-close-btn">Try again</button>
      </div>
    </div>
    <template id="message-template">
      <article class="message">
        <div class="avatar"></div>
        <div class="bubble-wrap">
          <div class="meta">
            <span class="author"></span>
            <span class="time"></span>
          </div>
          <div class="bubble"></div>
        </div>
      </article>
    </template>
    <script>
      const scenario = ${scenarioJSON};
      const splashScreen = document.getElementById("splash-screen");
      const chatScreen = document.getElementById("chat-screen");
      const beginBtn = document.getElementById("begin-btn");
      const restartBtn = document.getElementById("restart-btn");
      const chatLog = document.getElementById("chat-log");
      const choicesEl = document.getElementById("choices");
      const messageTemplate = document.getElementById("message-template");
      const wrongAnswerModal = document.getElementById("wrong-answer-modal");
      const modalCloseBtn = document.getElementById("modal-close-btn");
      const modalBackdrop = wrongAnswerModal.querySelector(".modal-backdrop");
      let pendingNodeToken = 0;
      function wait(ms) { return new Promise((resolve) => window.setTimeout(resolve, ms)); }
      function getTimeStamp() { return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }
      function pushMessage({ text, isSystem = false }) {
        const fragment = messageTemplate.content.cloneNode(true);
        const message = fragment.querySelector(".message");
        const authorEl = fragment.querySelector(".author");
        const timeEl = fragment.querySelector(".time");
        const bubbleEl = fragment.querySelector(".bubble");
        if (isSystem) message.classList.add("system");
        authorEl.textContent = "User";
        bubbleEl.textContent = text;
        timeEl.textContent = getTimeStamp();
        chatLog.appendChild(fragment);
        chatLog.scrollTop = chatLog.scrollHeight;
      }
      function showWrongAnswerModal(feedback) {
        document.getElementById("feedback-text").textContent = feedback || "Try a different option.";
        wrongAnswerModal.classList.remove("hidden");
      }
      function hideWrongAnswerModal() { wrongAnswerModal.classList.add("hidden"); }
      function renderOptions(node) {
        choicesEl.innerHTML = "";
        if (!node.options || node.options.length === 0) {
          const done = document.createElement("p");
          done.className = "channel-subtitle";
          done.textContent = "Scenario complete.";
          choicesEl.appendChild(done);
          return;
        }
        node.options.forEach((option) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "choice-btn";
          btn.textContent = option.label;
          btn.addEventListener("click", () => handleChoice(option, btn));
          choicesEl.appendChild(btn);
        });
      }
      async function goToNode(nodeId) {
        const node = scenario.nodes[nodeId];
        if (!node) return;
        const myToken = ++pendingNodeToken;
        choicesEl.innerHTML = "";
        for (const line of node.userMessages || []) {
          if (myToken !== pendingNodeToken) return;
          const isSystemText = line.startsWith("You") || line.startsWith("The") || line.startsWith("While") || line.startsWith("Keep");
          pushMessage({ text: line, isSystem: isSystemText });
          await wait(130);
        }
        renderOptions(node);
      }
      async function handleChoice(option, clickedBtn) {
        const buttons = Array.from(choicesEl.querySelectorAll(".choice-btn"));
        buttons.forEach((btn) => (btn.disabled = true));
        clickedBtn.classList.add(option.correct ? "correct" : "wrong");
        if (!option.correct) {
          showWrongAnswerModal(option.feedback);
          return;
        }
        await wait(250);
        void goToNode(option.next);
      }
      function startScenario() {
        splashScreen.classList.add("hidden");
        chatScreen.classList.remove("hidden");
        pendingNodeToken += 1;
        chatLog.innerHTML = "";
        void goToNode(scenario.startNodeId);
      }
      function handleModalClose() {
        hideWrongAnswerModal();
        const buttons = Array.from(choicesEl.querySelectorAll(".choice-btn"));
        buttons.forEach((btn) => (btn.disabled = false));
      }
      beginBtn.addEventListener("click", startScenario);
      restartBtn.addEventListener("click", startScenario);
      modalCloseBtn.addEventListener("click", handleModalClose);
      modalBackdrop.addEventListener("click", handleModalClose);
    </script>
  </body>
</html>`;
  }

  copyExport() {
    const textArea = document.getElementById("export-text");
    textArea.select();
    document.execCommand("copy");

    const copyBtn = document.getElementById("copy-export-btn");
    const oldText = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    window.setTimeout(() => {
      copyBtn.textContent = oldText;
    }, 1200);
  }

  downloadExport() {
    const text = document.getElementById("export-text").value;
    const scenarioName = (document.getElementById("scenario-name").value || "scenario").trim() || "scenario";
    const ext = this.exportFormat === "json" ? "json" : "html";
    const filename = `${scenarioName}.${ext}`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  }
}

const builder = new LiveScenarioBuilder();
