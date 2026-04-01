// app.js - 主应用逻辑

// ── TAB & PANEL SWITCHING ──
// ── TAB SWITCHING ──
function switchTab(id, el) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (el) el.classList.add('active');
  window.scrollTo({top: 0, behavior: 'smooth'});
  triggerReveal();
}

// ── MEETING PANEL SWITCHING ──
function switchMeeting(idx, el) {
  document.querySelectorAll('.meeting-toc-item').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.meeting-content-panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('meetingPanel' + idx).classList.add('active');
  
  // 如果切换到用户服务情况面板（索引1），重新渲染用户服务图表
  if (idx === 1 && typeof renderUserServiceCharts === 'function') {
    setTimeout(renderUserServiceCharts, 100);
  }
}

// ── SCROLL REVEAL ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

function triggerReveal() {
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
triggerReveal();


// ── FORM SUBMIT & CHART POLLING ──
// 初始化用户服务图表
setTimeout(renderUserServiceCharts, 500);

// 移除之前的setTimeout初始化，改用更可靠的window.load事件
// 专业可视化图表将在页面完全加载后渲染总计数据

// ── GOOGLE SHEETS FORM ──
const SHEET_WEBHOOK_URL = ''; // 填入 Google Apps Script Web App URL

async function submitForm() {
  const name    = document.getElementById('fname').value.trim();
  const title   = document.getElementById('ftitle').value.trim();
  const dept    = document.getElementById('fdept').value.trim();
  const contact = document.getElementById('fcontact').value.trim();
  const topic   = document.getElementById('ftopic').value;
  const message = document.getElementById('fmessage').value.trim();

  if (!name || !message) { alert('请填写姓名和留言内容'); return; }

  const btn = document.querySelector('.form-submit');
  btn.textContent = '提交中...'; btn.disabled = true;

  try {
    if (SHEET_WEBHOOK_URL) {
      await fetch(SHEET_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, title, dept, contact, topic, message })
      });
    } else {
      await new Promise(r => setTimeout(r, 1200)); // Demo mode
    }
    document.getElementById('formContainer').style.display = 'none';
    document.getElementById('formSuccess').style.display   = 'block';
  } catch (err) {
    alert('提交遇到问题，请稍后重试或直接联系项目团队。');
    btn.textContent = '提交留言 →'; btn.disabled = false;
  }
}

// ── GOOGLE SHEETS FORM ──

// 添加定期检查确保图表渲染（每2秒检查一次，最多检查10次）
let chartCheckCount = 0;
const maxChartChecks = 10;
const chartCheckInterval = setInterval(() => {
  if (chartCheckCount < maxChartChecks) {
    ensureDomainChartsRendered();
    chartCheckCount++;
  } else {
    clearInterval(chartCheckInterval);
  }
}, 2000);

// 添加交互性
document.querySelectorAll('.policy-flowchart rect').forEach(rect => {
  rect.addEventListener('click', function() {
    // 在这里添加点击事件处理逻辑，例如显示详细信息等
    console.log('Node clicked:', this.textContent);
  });
});

// 页面加载完成后立即尝试渲染
window.addEventListener('load', function() {
  setTimeout(ensureDomainChartsRendered, 1000);
  // 确保用户服务图表也被渲染
  if (typeof renderUserServiceCharts === 'function') {
    setTimeout(renderUserServiceCharts, 1000);
  }
});

// 添加一个函数来确保用户服务图表被正确渲染
function ensureUserServiceChartsRendered() {
  if (typeof renderUserServiceCharts === 'function') {
    renderUserServiceCharts();
  }
}
