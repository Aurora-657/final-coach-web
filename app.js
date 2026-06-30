const STORAGE_KEY = "finalCoach.web.state.v1";
const HANDLE_DB_NAME = "finalCoach.fileHandles.v1";
const HANDLE_STORE_NAME = "handles";
const DATA_DIRECTORY_KEY = "dataDirectory";
const EXPORT_DIRECTORY_KEY = "exportDirectory";

const courses = [
  ["大学物理实验B2", "基本通识课", ["物理实验"]],
  ["大学物理B1", "基本通识课", ["大学物理"]],
  ["习近平新时代中国特色社会主义思想概论", "基本通识课", ["习近平新时代"]],
  ["大学英语A2", "基本通识课", ["英语"]],
  ["马克思主义基本原理", "基本通识课", ["马原"]],
  ["毛泽东思想和中国特色社会主义理论体系概论", "基本通识课", ["毛概"]],
  ["大学物理B2", "基本通识课", ["大学物理"]],
  ["大学物理实验B1", "基本通识课", ["物理实验"]],
  ["高等数学A2", "基本通识课", ["高数", "高等数学"]],
  ["思想道德与法治", "基本通识课", ["思修"]],
  ["大学英语A1", "基本通识课", ["英语"]],
  ["中国近现代史纲要", "基本通识课", ["近现代史"]],
  ["高等数学A1", "基本通识课", ["高数", "高等数学"]],
  ["离散数学", "专业基础课", ["离散"]],
  ["概率论与数理统计A", "专业基础课", ["概率论", "数理统计"]],
  ["人工智能导引", "专业基础课", ["AI导引", "人工智能"]],
  ["程序设计基础-C程序", "专业基础课", ["C语言", "C程序", "程序设计基础"]],
  ["数字逻辑设计", "专业基础课", ["数字逻辑"]],
  ["线性代数A", "专业基础课", ["线代", "线性代数"]],
  ["计算机组成原理与系统结构", "专业核心课", ["组成原理", "系统结构"]],
  ["脑与认知科学导论", "专业核心课", ["脑与认知", "认知科学"]],
  ["深度学习方法与应用", "专业核心课", ["深度学习"]],
  ["人工智能数学基础", "专业核心课", ["AI数学", "人工智能数学"]],
  ["机器学习导论", "专业核心课", ["机器学习"]],
  ["自然语言处理", "专业核心课", ["NLP", "自然语言"]],
  ["计算机网络", "专业核心课", ["计网"]],
  ["数据结构", "专业核心课", ["数据结构"]],
  ["面向对象程序设计", "专业核心课", ["C++", "c++", "面向对象", "OOP"]],
  ["操作系统", "专业核心课", ["OS"]],
  ["Python程序设计", "专业核心课", ["Python", "python"]]
].map(([name, category, keywords]) => ({ name, category, keywords: [name, ...keywords] }));

let state = loadState();
let undoState = null;
let selectedItem = -1;
let selectedTask = -1;
let selectedAiTask = -1;
let dataDirectoryHandle = null;
let exportDirectoryHandle = null;
let timer = {
  workMinutes: 25,
  restMinutes: 5,
  remainingSeconds: 25 * 60,
  running: false,
  resting: false,
  completedPomodoros: 0,
  taskName: "",
  boundSubject: "",
  boundContent: "",
  intervalId: null
};

const aiCompanionPhrases = {
  "完成": [
    "太棒了！这一步你已经稳稳拿下，状态越来越好！",
    "完成就是最好的证明，你已经走在正确的路上了！",
    "每一项任务的完成，都在把你推向更好的自己！",
    "厉害！这种节奏保持住，今天会非常充实！",
    "你已经证明了你能做到，接下来只会更顺畅！",
    "每一次完成都值得被肯定，你真的很棒！",
    "这一步走得漂亮，继续往前走，你已经上道了！",
    "完成任务的那一刻，你就已经战胜了拖延！",
    "你的执行力在提升，继续保持这种势头！",
    "恭喜你！每一份付出都算数，今天离目标又近了一步！"
  ],
  "太难": [
    "觉得难恰恰说明你在进步，舒适区外才是成长的地方！",
    "你能坚持面对难题，这份勇气比解出答案更可贵！",
    "难一点没关系，你本来就具备搞定它的能力！",
    "每一个难题都是你弯道超车的机会，加油！",
    "你已经在挑战自己了，这份努力绝对不会白费！",
    "别怕难，你已经比昨天更强了，再试一次！",
    "难题面前你没有退缩，这本身就是最大的胜利！",
    "慢慢来，你的坚持会让这道题变得越来越简单！",
    "能走到这一步，你已经比大多数人更勇敢了！",
    "相信自己，你比你想象中的更有能力解决它！"
  ],
  "太简单": [
    "这也太轻松了吧！说明你已经完全掌握了，真厉害！",
    "对你来说这已经不够挑战了，准备升级吧！",
    "行云流水！你的基础已经非常扎实了！",
    "太简单了，说明你的进步速度超出了预期！",
    "轻松拿下，继续保持这种自信的状态！",
    "你已经超越了这一层，去挑战更高难度的吧！",
    "这道题对你来说已经不够塞牙缝了，优秀！",
    "你的能力已经肉眼可见地在增长了，真棒！",
    "简单是因为你变强了，享受这种游刃有余的感觉吧！",
    "太强了！你已经可以去做更难的题目了！"
  ],
  "太累": [
    "你今天的努力已经被看见了，先休息一下，奖励自己！",
    "学习需要张弛有度，累了就歇歇，回来状态更好！",
    "你已经坚持了很久，这份毅力很了不起，先放松一下吧！",
    "身体在提醒你需要充电，好好休息是为了走得更远！",
    "你今天已经做了很多了，真的辛苦了，休息也是进步的一部分！",
    "累了说明你足够认真，给自己一点时间恢复元气吧！",
    "你很棒了！现在休息不是放弃，而是为了更好地冲刺！",
    "大脑需要一点 refresh，起来走走，你已经够拼了！",
    "别硬撑，照顾好自己，你已经做得很出色了！",
    "休息时间到！你值得一个短暂的放松，回来后继续发光！"
  ],
  "未完成": [
    "没关系，未完成不代表失败，你已经开始了就是胜利！",
    "每一次尝试都在累积经验，剩下的部分很快就搞定！",
    "别气馁，你离完成只差最后一步，再加把劲！",
    "未完成的进度也是进度，你今天并没有白费！",
    "你已经迈出最艰难的第一步了，剩下的只需继续走下去！",
    "别让未完成打击到你，换个角度，你已经走在路上了！",
    "你完全有能力把它完成，给自己一点信心！",
    "今天没完成不要紧，明天继续，你已经很棒了！",
    "没有完美只有进步，你的每一次努力都算数！",
    "未完成只是暂时的，你的坚持一定会让它画上句号！"
  ]
};

class AcademicItem {
  constructor(data) {
    this.name = data.name;
    this.daysLeft = data.daysLeft;
    this.difficulty = data.difficulty;
    this.weight = data.weight;
    this.mastery = data.mastery;
  }

  timePressure() {
    return 6 / (this.daysLeft + 1);
  }

  weakLevel() {
    return 6 - this.mastery;
  }

  calculateUrgency() {
    throw new Error("calculateUrgency must be implemented by subclasses");
  }

  toDisplayString() {
    return `${this.name} | 剩余:${this.daysLeft}天 | 难度:${this.difficulty} | 掌握:${this.mastery} | 紧迫度:${this.calculateUrgency().toFixed(2)}`;
  }
}

class ExamItem extends AcademicItem {
  calculateUrgency() {
    return this.difficulty * 1.4 + this.weight * 1.1 + this.timePressure() * 1.8 + this.weakLevel() * 1.2;
  }

  toDisplayString() {
    return `[考试] ${this.name} | 剩余:${this.daysLeft}天 | 难度:${this.difficulty} | 学分:${this.weight} | 掌握:${this.mastery} | 紧迫度:${this.calculateUrgency().toFixed(2)}`;
  }
}

class DeadlineItem extends AcademicItem {
  calculateUrgency() {
    return this.difficulty * 1.2 + this.weight * 0.55 + this.timePressure() * 2.0 + this.weakLevel() * 0.9;
  }

  toDisplayString() {
    return `[DDL] ${this.name} | 剩余:${this.daysLeft}天 | 难度:${this.difficulty} | 耗时:${this.weight}小时 | 掌握:${this.mastery} | 紧迫度:${this.calculateUrgency().toFixed(2)}`;
  }
}

class ReviewTaskModel {
  constructor(data) {
    this.subject = data.subject;
    this.content = data.content;
    this.priority = clamp(data.priority, 1, 10);
    this.minutes = Math.max(10, Number.parseInt(data.minutes, 10) || 25);
    this.completed = Boolean(data.completed);
    this.requiredPomodoros = data.requiredPomodoros || requiredPomodoros(this.minutes);
    this.finishedPomodoros = Math.min(data.finishedPomodoros || 0, this.requiredPomodoros);
  }

  toData() {
    return {
      subject: this.subject,
      content: this.content,
      priority: this.priority,
      minutes: this.minutes,
      completed: this.completed,
      requiredPomodoros: this.requiredPomodoros,
      finishedPomodoros: this.finishedPomodoros
    };
  }

  toDisplayString() {
    return `[优先级:${this.priority}] ${this.subject} | 任务:${this.content} | 时间:${this.minutes}分钟 | 番茄:${this.finishedPomodoros}/${this.requiredPomodoros} | 状态:${this.completed ? "已完成" : "待完成"}`;
  }
}

function defaultState() {
  return {
    items: [],
    tasks: [],
    aiTasks: [],
    sprintMode: false,
    aiCompanionMessage: "选中一条 AI 助学任务并点击反馈后，这里会生成一句鼓励你的陪学提醒。"
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      ...defaultState(),
      ...parsed,
      items: Array.isArray(parsed.items) ? parsed.items : [],
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      aiTasks: Array.isArray(parsed.aiTasks) ? parsed.aiTasks : []
    };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function openHandleDb() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(HANDLE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(HANDLE_STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadStoredDirectoryHandle(key) {
  const db = await openHandleDb();
  if (!db) return null;
  return new Promise(resolve => {
    const transaction = db.transaction(HANDLE_STORE_NAME, "readonly");
    const store = transaction.objectStore(HANDLE_STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => resolve(null);
  });
}

async function storeDirectoryHandle(key, handle) {
  const db = await openHandleDb();
  if (!db) return;
  await new Promise(resolve => {
    const transaction = db.transaction(HANDLE_STORE_NAME, "readwrite");
    const store = transaction.objectStore(HANDLE_STORE_NAME);
    store.put(handle, key);
    transaction.oncomplete = resolve;
    transaction.onerror = resolve;
  });
}

async function verifyDirectoryPermission(handle) {
  const options = { mode: "readwrite" };
  if ((await handle.queryPermission(options)) === "granted") return true;
  return (await handle.requestPermission(options)) === "granted";
}

function rememberUndo() {
  undoState = JSON.parse(JSON.stringify(state));
}

function setStatus(text) {
  document.getElementById("statusBar").textContent = text;
}

function clamp(value, min, max) {
  const number = Number.parseInt(value, 10);
  if (Number.isNaN(number)) return min;
  return Math.min(max, Math.max(min, number));
}

function urgency(item) {
  return createAcademicItem(item).calculateUrgency();
}

function createAcademicItem(item) {
  return item.type === "DDL" ? new DeadlineItem(item) : new ExamItem(item);
}

function sortItems() {
  state.items.sort((a, b) => urgency(b) - urgency(a));
}

function requiredPomodoros(minutes) {
  return Math.max(1, Math.ceil(minutes / 25));
}

function makeTask(subject, content, priority, minutes) {
  return new ReviewTaskModel({
    subject,
    content,
    priority,
    minutes,
    completed: false,
    requiredPomodoros: requiredPomodoros(minutes),
    finishedPomodoros: 0
  }).toData();
}

function sortTasks(tasks) {
  tasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return b.priority - a.priority;
  });
}

function calendarEntryLabel(item) {
  if (item.type === "DDL") {
    return item.name.includes("DDL") ? item.name : `${item.name} DDL`;
  }
  return item.name.includes("期末考试") ? item.name : `${item.name} 期末考试`;
}

function formatAcademicItemLine(item) {
  const weightText = item.type === "DDL" ? `耗时:${item.weight}小时` : `学分:${item.weight}`;
  return `[${item.type}] ${item.name} | 剩余:${item.daysLeft}天 | 难度:${item.difficulty} | ${weightText} | 掌握:${item.mastery} | 紧迫度:${urgency(item).toFixed(2)}`;
}

function formatTaskLine(task) {
  return `[优先级:${task.priority}] ${task.subject} | 任务:${task.content} | 时间:${task.minutes}分钟 | 番茄:${task.finishedPomodoros}/${task.requiredPomodoros} | 状态:${task.completed ? "已完成" : "待完成"}`;
}

function buildStatisticsSummaryLines() {
  const completedTasks = state.tasks.filter(task => task.completed).length;
  const completedAiTasks = state.aiTasks.filter(task => task.completed).length;
  const totalMinutes = [...state.tasks, ...state.aiTasks].reduce((sum, task) => sum + task.minutes, 0);
  return [
    `学业事项数量：${state.items.length}`,
    `今日计划任务数量：${state.tasks.length}`,
    `AI 生成任务数量：${state.aiTasks.length}`,
    `已完成任务数量：${completedTasks + completedAiTasks}`,
    `预计总分钟数：${totalMinutes}`,
    `当前模式：${state.sprintMode ? "冲刺模式" : "普通模式"}`
  ];
}

function itemDisplay(item) {
  return formatAcademicItemLine(item);
}

function taskDisplay(task) {
  return formatTaskLine(task);
}

function renderList(containerId, items, selectedIndex, onSelect, emptyText, renderer) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  if (!items.length) {
    container.innerHTML = `<div class="empty">${emptyText}</div>`;
    return;
  }
  items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = `row ${index === selectedIndex ? "selected" : ""} ${item.completed ? "completed" : ""}`;
    row.textContent = renderer(item);
    row.addEventListener("click", () => {
      onSelect(index);
      renderAll();
    });
    container.appendChild(row);
  });
}

function renderItems() {
  renderList("itemList", state.items, selectedItem, index => {
    selectedItem = index;
  }, "暂无事项。请先添加考试或 DDL。", itemDisplay);
}

function targetDate(daysLeft) {
  const date = new Date();
  date.setDate(date.getDate() + Math.max(0, daysLeft));
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function renderCalendar() {
  const container = document.getElementById("calendarList");
  container.innerHTML = "";
  if (!state.items.length) {
    container.innerHTML = `<div class="empty">暂无日历事项。添加考试或 DDL 后自动显示。</div>`;
    return;
  }
  const grouped = new Map();
  state.items.forEach(item => {
    const date = targetDate(item.daysLeft);
    if (!grouped.has(date)) grouped.set(date, []);
    grouped.get(date).push(item);
  });
  [...grouped.keys()].sort().forEach(date => {
    const dateRow = document.createElement("div");
    dateRow.className = "row calendar-date";
    dateRow.textContent = date;
    container.appendChild(dateRow);
    grouped.get(date)
      .sort((a, b) => urgency(b) - urgency(a))
      .forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "row";
      row.textContent = `${index + 1}. ${calendarEntryLabel(item)}`;
      container.appendChild(row);
      });
  });
}

function renderTasks() {
  renderList("taskList", state.tasks, selectedTask, index => {
    selectedTask = index;
    selectedAiTask = -1;
  }, "暂无今日计划。点击“生成今日计划”或添加自写任务。", taskDisplay);
}

function renderAiTasks() {
  renderList("aiTaskList", state.aiTasks, selectedAiTask, index => {
    selectedAiTask = index;
    selectedTask = -1;
  }, "暂无 AI 助学任务。输入目标后点击“AI 生成任务”。", taskDisplay);
}

function renderAdvice() {
  document.getElementById("adviceText").textContent = generateAdvice();
}

function renderAiCompanion() {
  document.getElementById("aiCompanionText").textContent = state.aiCompanionMessage;
}

function renderStats() {
  const lines = [
    "数据统计",
    "",
    ...buildStatisticsSummaryLines()
  ];
  document.getElementById("statsText").textContent = lines.join("\n");
}

function renderTimerTasks() {
  const select = document.getElementById("timerTaskSelect");
  select.innerHTML = `<option value="">自习</option>`;
  state.tasks.forEach((task, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `今日任务 ${index + 1}：${task.subject} - ${task.content}`;
    select.appendChild(option);
  });
}

function renderTimer() {
  const minutes = Math.floor(timer.remainingSeconds / 60);
  const seconds = timer.remainingSeconds % 60;
  const prefix = timer.taskName && !timer.resting ? `任务:${timer.taskName} | ` : "";
  document.getElementById("timerDisplay").textContent =
    `${prefix}${timer.resting ? "休息" : "专注"} ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} | 已完成番茄 ${timer.completedPomodoros}`;
}

function renderAll() {
  sortItems();
  sortTasks(state.tasks);
  sortTasks(state.aiTasks);
  document.getElementById("sprintBtn").textContent = state.sprintMode ? "关闭冲刺模式" : "开启冲刺模式";
  renderItems();
  renderCalendar();
  renderTasks();
  renderAiTasks();
  renderAdvice();
  renderAiCompanion();
  renderStats();
  renderTimerTasks();
  renderTimer();
}

function addItem() {
  const name = document.getElementById("itemName").value.trim();
  if (!name) {
    alert("请先输入事项名称。");
    return;
  }
  rememberUndo();
  state.items.push({
    name,
    type: document.getElementById("itemType").value,
    daysLeft: clamp(document.getElementById("daysLeft").value, 0, 365),
    difficulty: clamp(document.getElementById("difficulty").value, 1, 5),
    weight: clamp(document.getElementById("weight").value, 1, 30),
    mastery: clamp(document.getElementById("mastery").value, 1, 5)
  });
  selectedItem = -1;
  saveState();
  renderAll();
  setStatus("已添加学业事项。");
}

function loadDemoData() {
  rememberUndo();
  state.items.push(
    { name: "面向对象程序设计", type: "考试", daysLeft: 5, difficulty: 4, weight: 5, mastery: 2 },
    { name: "操作系统实验报告", type: "DDL", daysLeft: 3, difficulty: 3, weight: 4, mastery: 2 },
    { name: "数据结构", type: "考试", daysLeft: 7, difficulty: 5, weight: 6, mastery: 3 },
    { name: "大学英语A2", type: "考试", daysLeft: 4, difficulty: 3, weight: 4, mastery: 3 }
  );
  saveState();
  renderAll();
  setStatus("已加载演示数据。");
}

function deleteItem() {
  if (selectedItem < 0 || selectedItem >= state.items.length) {
    alert("请先选中要删除的事项。");
    return;
  }
  rememberUndo();
  const [removed] = state.items.splice(selectedItem, 1);
  state.tasks = state.tasks.filter(task => task.subject !== removed.name);
  state.aiTasks = state.aiTasks.filter(task => task.subject !== removed.name);
  selectedItem = -1;
  saveState();
  renderAll();
  setStatus("已删除选中的学业事项。");
}

function buildTodayPlan() {
  sortItems();
  const count = state.sprintMode ? 5 : 3;
  const minutes = state.sprintMode ? 60 : 40;
  state.tasks = state.items.slice(0, count).map(item => {
    const priority = clamp(Math.floor(urgency(item) / 2), 1, 10);
    const content = item.type === "考试"
      ? (state.sprintMode ? "整理重点知识点框架 + 刷题 + 错题复盘 + 重点概念回顾" : "整理重点知识点并完成对应的练习")
      : (state.sprintMode ? "按照提交要求，优先完成核心部分" : "推进主要内容并记录未解决问题");
    return makeTask(item.name, content, priority, minutes);
  });
  selectedTask = -1;
}

function generateTodayPlan() {
  if (!state.items.length) {
    alert("请先添加至少一个考试或 DDL。");
    return;
  }
  rememberUndo();
  buildTodayPlan();
  saveState();
  renderAll();
  setStatus("今日计划已生成。");
}

function addManualTask() {
  const content = document.getElementById("manualTask").value.trim();
  if (!content) {
    alert("请先输入自写任务内容。");
    return;
  }
  rememberUndo();
  const minutes = clamp(document.getElementById("manualMinutes").value, 10, 600);
  state.tasks.push(makeTask("自定义任务", content, 8, minutes));
  saveState();
  renderAll();
  setStatus("已添加自写任务。");
}

function deleteTask(listName) {
  const isAi = listName === "aiTasks";
  const selected = isAi ? selectedAiTask : selectedTask;
  const list = state[listName];
  if (selected < 0 || selected >= list.length) {
    alert(isAi ? "请先选中 AI 任务。" : "请先选中今日任务。");
    return;
  }
  rememberUndo();
  list.splice(selected, 1);
  if (isAi) selectedAiTask = -1;
  else selectedTask = -1;
  saveState();
  renderAll();
  setStatus(isAi ? "已删除 AI 任务。" : "已删除今日任务。");
}

function findCourse(text) {
  if (!text) return null;
  for (const course of courses) {
    if (text.includes(course.name)) return course;
  }
  for (const course of courses) {
    if (course.keywords.some(keyword => keyword !== course.name && text.includes(keyword))) {
      return course;
    }
  }
  return null;
}

function pickSubject(goal) {
  const item = state.items.find(current => goal.includes(current.name) || current.name.includes(goal));
  if (item) return item.name;
  let subject = goal;
  ["期末考试", "考试", "复习", "实验报告", "报告", "作业", "PPT", "汇报"].some(suffix => {
    const pos = subject.indexOf(suffix);
    if (pos >= 0) {
      subject = subject.slice(0, pos);
      return true;
    }
    return false;
  });
  ["准备", "完成", "复习", "整理", "冲刺"].forEach(prefix => {
    if (subject.startsWith(prefix)) subject = subject.slice(prefix.length);
  });
  return subject.trim() || goal || "期末复习";
}

function containsAny(text, keywords) {
  return keywords.some(keyword => text.includes(keyword));
}

function generateAiTasks() {
  const goal = document.getElementById("goalInput").value.trim();
  if (!goal) {
    alert("请先输入复习目标。");
    return;
  }
  const subject = pickSubject(goal);
  const course = findCourse(`${goal} ${subject}`);
  const professional = course && (course.category === "专业基础课" || course.category === "专业核心课");
  const matchText = `${goal} ${subject} ${course ? course.name : ""}`;
  const baseMinutes = state.sprintMode ? 50 : 35;
  let templates;

  if (containsAny(goal, ["实验报告", "报告", "作业", "PPT", "汇报", "DDL"]) || state.items.some(item => item.type === "DDL" && goal.includes(item.name))) {
    templates = [["列出提交要求和评分点", 8, 25], ["完成主体内容并标记待补充部分", 9, baseMinutes], ["检查格式、截图、引用和最终提交文件", 10, 30]];
  } else if (professional && containsAny(matchText, ["C++", "c++", "面向对象", "OOP"])) {
    templates = [["复习类与对象、封装、构造函数和析构函数", 8, baseMinutes], ["整理继承、多态、虚函数相关例题", 9, baseMinutes], ["完成一组综合编程题并记录错误原因", 10, state.sprintMode ? 60 : 40]];
  } else if (professional && containsAny(matchText, ["程序设计基础", "C语言", "C程序", "Python", "python"])) {
    templates = [["复习语法、函数、数组或容器等基础结构", 8, baseMinutes], ["完成一组基础编程题并记录调试问题", 9, baseMinutes], ["整理常见输入输出、文件处理和边界情况", 10, state.sprintMode ? 60 : 40]];
  } else if (professional && containsAny(matchText, ["数据结构"])) {
    templates = [["梳理线性表、栈队列、树和图的核心操作", 8, baseMinutes], ["手写典型算法并标注时间复杂度", 9, baseMinutes], ["完成一组综合题并复盘易错数据结构", 10, state.sprintMode ? 60 : 40]];
  } else if (professional && containsAny(matchText, ["离散数学", "离散", "概率论", "数理统计", "线性代数", "线代", "人工智能数学"])) {
    templates = [["回顾定义、定理、公式和典型推导", 8, baseMinutes], ["完成一组计算或证明题并整理错题", 9, baseMinutes], ["限时训练高频题型，检查关键步骤", 10, state.sprintMode ? 60 : 40]];
  } else if (professional && containsAny(matchText, ["数字逻辑", "组成原理", "系统结构", "操作系统", "计算机网络", "计网"])) {
    templates = [["梳理核心概念、结构图和工作流程", 8, baseMinutes], ["整理典型计算题、简答题和易混概念", 9, baseMinutes], ["完成一组系统类综合题并复盘错误原因", 10, state.sprintMode ? 60 : 40]];
  } else if (professional && containsAny(matchText, ["人工智能导引", "机器学习", "深度学习", "自然语言处理", "NLP", "脑与认知", "认知科学"])) {
    templates = [["梳理模型原理、训练流程和核心术语", 8, baseMinutes], ["整理算法输入输出、适用场景和优缺点", 9, baseMinutes], ["结合例题或案例复盘重点方法", 10, state.sprintMode ? 60 : 40]];
  } else if (professional) {
    templates = [["梳理课程框架、核心概念和老师强调内容", 8, 30], ["整理薄弱章节并完成对应练习", 9, baseMinutes], ["完成一组综合题或案例分析并复盘", 10, state.sprintMode ? 60 : 40]];
  } else if (containsAny(goal, ["考试", "期末", "复习", "测验", "考核"]) || state.items.some(item => item.type === "考试" && goal.includes(item.name))) {
    templates = [["梳理考试范围、重点章节和老师强调内容", 8, 30], ["整理薄弱知识点并完成对应练习", 9, baseMinutes], ["完成一组模拟题或历年题并复盘错题", 10, state.sprintMode ? 60 : 40]];
  } else {
    templates = [["梳理考试范围或任务要求", 7, 25], ["复习重点章节并整理薄弱点", 8, baseMinutes], ["完成练习或推进核心产出", 9, baseMinutes]];
  }

  if (state.sprintMode) {
    templates.push(["冲刺复盘：只看高频考点和错题", 10, 35]);
  }

  rememberUndo();
  const tasks = templates.map(([content, priority, minutes]) => makeTask(subject, content, priority, minutes));
  let added = 0;
  tasks.forEach(task => {
    const duplicate = state.aiTasks.some(existing => existing.subject === task.subject && existing.content === task.content);
    if (!duplicate) {
      state.aiTasks.push(task);
      added += 1;
    }
  });
  saveState();
  renderAll();
  if (added === 0) alert("该任务已存在");
  else if (added < tasks.length) alert("部分任务已存在，已跳过重复任务。");
  setStatus("AI 任务生成完成。");
}

function applyFeedback(task, feedback) {
  if (!task) return;
  if (feedback === "完成") {
    task.completed = true;
    task.finishedPomodoros = task.requiredPomodoros;
    task.priority = clamp(task.priority - 2, 1, 10);
    task.minutes = clamp(task.minutes - 5, 10, 600);
    adjustMastery(task.subject, 1);
  } else if (feedback === "太难") {
    task.priority = clamp(task.priority + 2, 1, 10);
    task.minutes = clamp(task.minutes + 10, 10, 600);
    adjustMastery(task.subject, -1);
  } else if (feedback === "太简单") {
    task.priority = clamp(task.priority - 1, 1, 10);
    task.minutes = clamp(task.minutes - 5, 10, 600);
  } else if (feedback === "太累") {
    task.priority = clamp(task.priority + 1, 1, 10);
    task.minutes = clamp(task.minutes - 10, 10, 600);
  } else if (feedback === "未完成") {
    task.priority = clamp(task.priority + 1, 1, 10);
    task.minutes = clamp(task.minutes + 8, 10, 600);
    adjustMastery(task.subject, -1);
  }
  task.requiredPomodoros = requiredPomodoros(task.minutes);
  task.finishedPomodoros = Math.min(task.finishedPomodoros, task.requiredPomodoros);
}

function adjustMastery(subject, delta) {
  state.items.forEach(item => {
    if (item.name.includes(subject) || subject.includes(item.name)) {
      item.mastery = clamp(item.mastery + delta, 1, 5);
    }
  });
}

function pickRandomAiCompanionMessage(feedback) {
  const messages = aiCompanionPhrases[feedback];
  if (!messages || !messages.length) {
    return "继续保持节奏，你离目标又近了一点。";
  }
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

function handleFeedback(feedback, isAi = false) {
  const list = isAi ? state.aiTasks : state.tasks;
  const selected = isAi ? selectedAiTask : selectedTask;
  if (selected < 0 || selected >= list.length) {
    alert(isAi ? "请先选中 AI 任务。" : "请先选中今日任务。");
    return;
  }
  rememberUndo();
  applyFeedback(list[selected], feedback);
  if (isAi) {
    state.aiCompanionMessage = pickRandomAiCompanionMessage(feedback);
  }
  saveState();
  renderAll();
  setStatus(`已应用反馈：${feedback}`);
}

function generateAdvice() {
  if (!state.items.length) return "请先添加考试或 DDL 信息，系统才能生成复习建议。";
  sortItems();
  const top = state.items[0];
  let text = `当前最紧迫事项是：${top.name}。`;
  if (top.daysLeft <= 2) text += "剩余时间很少，建议优先完成错题复盘、模拟训练和可交付内容。";
  else if (top.mastery <= 2) text += "掌握程度偏低，建议先补基础，再安排刷题或输出型任务。";
  else text += "可以按今日计划推进，并在完成后做一次简短复盘。";
  if (state.sprintMode) text += " 当前已开启冲刺模式，休息可以缩短，但不要连续超过4个番茄钟。";
  const unfinished = [...state.tasks, ...state.aiTasks].filter(task => !task.completed).length;
  if (unfinished >= 4) text += " 今日未完成任务较多，建议先保留最高优先级的 2-3 项。";
  return text;
}

function undo() {
  if (!undoState) {
    alert("当前没有可撤回的操作。");
    return;
  }
  state = undoState;
  undoState = null;
  saveState();
  renderAll();
  setStatus("已撤回最近一次数据修改。");
}

function startTimer(taskName, minutes, subject = "", content = "") {
  timer.workMinutes = clamp(minutes, 1, 240);
  timer.remainingSeconds = timer.workMinutes * 60;
  timer.running = true;
  timer.resting = false;
  timer.taskName = taskName;
  timer.boundSubject = subject;
  timer.boundContent = content;
  if (!timer.intervalId) timer.intervalId = window.setInterval(tickTimer, 1000);
  renderTimer();
}

function tickTimer() {
  if (!timer.running) return;
  timer.remainingSeconds -= 1;
  if (timer.remainingSeconds <= 0) {
    if (!timer.resting) {
      timer.completedPomodoros += 1;
      if (timer.boundSubject && timer.boundContent) {
        rememberUndo();
        const task = state.tasks.find(current => current.subject === timer.boundSubject && current.content === timer.boundContent);
        if (task) {
          task.finishedPomodoros = Math.min(task.requiredPomodoros, task.finishedPomodoros + 1);
          if (task.finishedPomodoros >= task.requiredPomodoros) task.completed = true;
          saveState();
          renderAll();
        }
      }
      timer.resting = true;
      timer.remainingSeconds = timer.restMinutes * 60;
      alert("一个番茄钟完成，进入 5 分钟休息。");
    } else {
      timer.running = false;
      timer.resting = false;
      timer.remainingSeconds = timer.workMinutes * 60;
      alert("休息结束，可以开始下一轮专注。");
    }
  }
  renderTimer();
}

function startSelectedTimer() {
  const value = document.getElementById("timerTaskSelect").value;
  const minutes = document.getElementById("timerMinutes").value;
  if (value === "") {
    startTimer("自习", minutes);
    setStatus("已开始自习计时。");
    return;
  }
  const task = state.tasks[Number(value)];
  if (!task) return;
  startTimer(`${task.subject} - ${task.content}`, minutes, task.subject, task.content);
  setStatus("已开始计时：今日计划任务。");
}

function completeCurrentTimerTask() {
  if (!timer.boundSubject || !timer.boundContent) {
    alert("自习或临时任务已完成，不会自动加入今日计划。");
    return;
  }
  rememberUndo();
  const task = state.tasks.find(current => current.subject === timer.boundSubject && current.content === timer.boundContent);
  if (task) {
    task.completed = true;
    task.finishedPomodoros = task.requiredPomodoros;
    saveState();
    renderAll();
    alert("已将当前计时绑定的今日任务标记为完成。");
  }
  timer.boundSubject = "";
  timer.boundContent = "";
}

function buildTodayPlanExportText() {
  const sortedTasks = [...state.tasks];
  sortedTasks.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return 0;
  });
  return [
    "Final Coach —— 面向大学生的智能期末规划系统",
    "",
    "一、今日计划",
    ...(sortedTasks.length ? sortedTasks.map((task, index) => `${index + 1}. ${taskDisplay(task)}`) : ["暂无今日计划"])
  ].join("\n");
}

function buildPlanText() {
  const sortedItems = [...state.items].sort((a, b) => urgency(b) - urgency(a));
  const sortedTasks = [...state.tasks];
  const sortedAiTasks = [...state.aiTasks];
  sortTasks(sortedTasks);
  sortTasks(sortedAiTasks);
  return [
    "Final Coach —— 面向大学生的智能期末规划系统",
    "",
    "一、学业事项",
    ...(sortedItems.length ? sortedItems.map(item => `- ${itemDisplay(item)}`) : ["- 暂无学业事项"]),
    "",
    "二、今日计划",
    ...(sortedTasks.length ? sortedTasks.map(task => `- ${taskDisplay(task)}`) : ["- 暂无今日计划"]),
    "",
    "三、AI 生成任务",
    ...(sortedAiTasks.length ? sortedAiTasks.map(task => `- ${taskDisplay(task)}`) : ["- 暂无 AI 生成任务"]),
    "",
    "四、AI 建议",
    generateAdvice()
  ].join("\n");
}

function buildStatisticsReportText() {
  return [
    buildPlanText(),
    "",
    "数据统计：",
    ...buildStatisticsSummaryLines()
  ].join("\n");
}

async function exportPlan() {
  const result = await saveTextToDirectory(
    "data",
    `今日计划-${timestamp()}.txt`,
    buildTodayPlanExportText(),
    "text/plain;charset=utf-8"
  );
  setDirectorySaveStatus(result, "导出计划");
}

async function exportStatsReport() {
  const result = await saveTextToDirectory(
    "exports",
    `数据统计-${timestamp()}.txt`,
    buildStatisticsReportText(),
    "text/plain;charset=utf-8"
  );
  setDirectorySaveStatus(result, "导出数据统计");
}

function downloadText(filename, content, type) {
  const blob = new Blob(["\ufeff", content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function timestamp() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0")
  ].join("-");
}

async function saveTextToDirectory(target, filename, content, type) {
  if (!("showDirectoryPicker" in window)) {
    downloadText(filename, content, type);
    return "download";
  }

  try {
    const isData = target === "data";
    let directoryHandle = isData ? dataDirectoryHandle : exportDirectoryHandle;
    if (!directoryHandle || !(await verifyDirectoryPermission(directoryHandle))) {
      directoryHandle = await window.showDirectoryPicker({
        id: isData ? "final-coach-data" : "final-coach-exports",
        mode: "readwrite",
        startIn: "documents"
      });
      if (isData) {
        dataDirectoryHandle = directoryHandle;
        await storeDirectoryHandle(DATA_DIRECTORY_KEY, directoryHandle);
      } else {
        exportDirectoryHandle = directoryHandle;
        await storeDirectoryHandle(EXPORT_DIRECTORY_KEY, directoryHandle);
      }
    }
    const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write("\ufeff" + content);
    await writable.close();
    return "folder";
  } catch (error) {
    if (error && error.name === "AbortError") {
      return "cancelled";
    }
    downloadText(filename, content, type);
    return "download";
  }
}

function setDirectorySaveStatus(result, actionName) {
  if (result === "folder") {
    setStatus(`${actionName}已保存到你选择的固定文件夹。`);
  } else if (result === "download") {
    setStatus(`${actionName}已完成，浏览器已下载文件。`);
  } else {
    setStatus(`已取消${actionName}。`);
  }
}

function clearData() {
  if (!confirm("确定要清空所有事项、今日计划和 AI 任务吗？")) return;
  rememberUndo();
  state = defaultState();
  selectedItem = selectedTask = selectedAiTask = -1;
  saveState();
  renderAll();
  setStatus("已清空所有数据。");
}

function init() {
  loadStoredDirectoryHandle(DATA_DIRECTORY_KEY).then(handle => {
    dataDirectoryHandle = handle;
  }).catch(() => {
    dataDirectoryHandle = null;
  });
  loadStoredDirectoryHandle(EXPORT_DIRECTORY_KEY).then(handle => {
    exportDirectoryHandle = handle;
  }).catch(() => {
    exportDirectoryHandle = null;
  });

  const datalist = document.getElementById("courseList");
  courses.forEach(course => {
    const option = document.createElement("option");
    option.value = course.name;
    datalist.appendChild(option);
  });

  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(current => current.classList.remove("active"));
      document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.page).classList.add("active");
      const pageName = tab.textContent;
      setStatus(`当前页面：${pageName}`);
    });
  });

  document.getElementById("addItemBtn").addEventListener("click", addItem);
  document.getElementById("demoBtn").addEventListener("click", loadDemoData);
  document.getElementById("deleteItemBtn").addEventListener("click", deleteItem);
  document.getElementById("refreshCalendarBtn").addEventListener("click", renderCalendar);
  document.getElementById("generatePlanBtn").addEventListener("click", generateTodayPlan);
  document.getElementById("sprintBtn").addEventListener("click", () => {
    if (!state.items.length) {
      alert("请先添加至少一个考试或 DDL。");
      return;
    }
    rememberUndo();
    state.sprintMode = !state.sprintMode;
    buildTodayPlan();
    saveState();
    renderAll();
    setStatus(state.sprintMode ? "已开启冲刺模式。" : "已关闭冲刺模式。");
  });
  document.getElementById("exportPlanBtn").addEventListener("click", exportPlan);
  document.getElementById("deleteTaskBtn").addEventListener("click", () => deleteTask("tasks"));
  document.getElementById("addManualTaskBtn").addEventListener("click", addManualTask);
  document.getElementById("generateAiBtn").addEventListener("click", generateAiTasks);
  document.getElementById("deleteAiTaskBtn").addEventListener("click", () => deleteTask("aiTasks"));
  document.getElementById("undoBtn").addEventListener("click", undo);

  document.querySelectorAll("[data-feedback]").forEach(button => {
    button.addEventListener("click", () => handleFeedback(button.dataset.feedback, false));
  });
  document.querySelectorAll("[data-ai-feedback]").forEach(button => {
    button.addEventListener("click", () => handleFeedback(button.dataset.aiFeedback, true));
  });

  document.getElementById("timerStartBtn").addEventListener("click", startSelectedTimer);
  document.getElementById("timerPauseBtn").addEventListener("click", () => {
    timer.running = false;
    renderTimer();
    setStatus("番茄计时已暂停。");
  });
  document.getElementById("timerResetBtn").addEventListener("click", () => {
    timer.running = false;
    timer.resting = false;
    timer.workMinutes = clamp(document.getElementById("timerMinutes").value, 1, 240);
    timer.remainingSeconds = timer.workMinutes * 60;
    renderTimer();
    setStatus("番茄计时已重置。");
  });
  document.getElementById("timerCompleteBtn").addEventListener("click", completeCurrentTimerTask);
  document.getElementById("customTimerStartBtn").addEventListener("click", () => {
    const task = document.getElementById("customTimerTask").value.trim();
    if (!task) {
      alert("请先输入临时任务。");
      return;
    }
    startTimer(task, document.getElementById("timerMinutes").value);
    setStatus("临时任务计时已开始。");
  });

  document.getElementById("refreshStatsBtn").addEventListener("click", renderStats);
  document.getElementById("exportStatsBtn").addEventListener("click", exportStatsReport);
  document.getElementById("clearDataBtn").addEventListener("click", clearData);

  renderAll();
}

init();
