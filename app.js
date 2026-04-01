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

// 移除之前的 setTimeout 初始化，改用更可靠的 window.load 事件
// 专业可视化图表将在页面完全加载后渲染总计数据

// ── CONTACT FORM SUBMIT (EmailJS Service) ──
// 注意：contact.html 是动态加载的，所以需要在加载完成后再初始化
// 使用延迟轮询检查的方式确保表单能被正确绑定

// EmailJS 配置
const EMAILJS_CONFIG = {
  publicKey: '1y0Zaw8sk07zGDYg6',  // Public Key
  serviceId: 'service_tn8x1yf',  // Gmail Service ID
  templateId: 'template_3fjcstc' // 邮件模板 ID
};

// 加载 EmailJS SDK
function loadEmailJS() {
  return new Promise((resolve, reject) => {
    if (window.emailjs) {
      console.log("✅ EmailJS 已经加载");
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = () => {
      console.log("✅ EmailJS SDK 加载完成");
      // 初始化 EmailJS
      if (window.emailjs) {
        window.emailjs.init(EMAILJS_CONFIG.publicKey);
        console.log("✅ EmailJS 初始化完成");
      }
      resolve();
    };
    script.onerror = () => {
      console.error("❌ EmailJS SDK 加载失败");
      reject(new Error("EmailJS SDK 加载失败"));
    };
    document.head.appendChild(script);
  });
}

function initContactForm() {
  console.log("🔄 尝试初始化 contact form...");
  
  const form = document.getElementById('feedbackForm');
  if (!form) {
    console.log("⚠️ feedbackForm 还未加载，100ms 后重试...");
    setTimeout(initContactForm, 100);
    return;
  }
  
  // 检查是否已经初始化过
  if (form.dataset.initialized === 'true') {
    console.log("✅ contact form 已经初始化过");
    return;
  }
  
  console.log("✅ contact form 初始化");
  form.dataset.initialized = 'true';
  
  console.log("✅ feedbackForm 找到:", form);
  
  const submitBtn = document.getElementById('submitBtn');
  const formMessage = document.getElementById('formMessage');
  const formSuccess = document.getElementById('formSuccess');
  const formError = document.getElementById('formError');
  const formErrorText = document.getElementById('formErrorText');

  // 保存表单数据的临时变量
  window.formData = null;

  // 加载 EmailJS SDK
  loadEmailJS().then(() => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      console.log("✅ 表单提交事件触发");

      // 重置状态
      if (formMessage) formMessage.style.display = "none";
      if (formSuccess) formSuccess.style.display = "none";
      if (formError) formError.style.display = "none";

      // 禁用按钮
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span style="display:inline-block;animation:spin 1s linear infinite">⟳</span> 提交中...';
      }

      try {
        // 获取用户输入
        const nameEl = document.getElementById('name');
        const positionEl = document.getElementById('position');
        const departmentEl = document.getElementById('department');
        const contactEl = document.getElementById('contactInput');
        const topicEl = document.getElementById('topic');
        const messageEl = document.getElementById('message');

        // 安全获取值 - 确保元素存在且有 value 属性
        const name = nameEl && nameEl.value !== undefined ? nameEl.value.trim() : '';
        const position = positionEl && positionEl.value !== undefined ? positionEl.value.trim() : '';
        const department = departmentEl && departmentEl.value !== undefined ? departmentEl.value.trim() : '';
        const contact = contactEl && contactEl.value !== undefined ? contactEl.value.trim() : '';
        const topic = topicEl && topicEl.value !== undefined ? topicEl.value : '';
        const message = messageEl && messageEl.value !== undefined ? messageEl.value.trim() : '';

        console.log("✅ 表单数据:", { name, position, department, contact, topic, message });

        // 验证必填字段
        if (!name || !contact || !topic || !message) {
          throw new Error("请填写所有必填项");
        }

        // 验证联系方式（邮箱或手机号）
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!emailRegex.test(contact) && !phoneRegex.test(contact)) {
          throw new Error("请输入有效的邮箱地址或手机号");
        }

        // 保存表单数据
        window.formData = { name, position, department, contact, topic, message };

        // 准备发送邮件参数
        const templateParams = {
          from_name: name,
          from_position: position || '未填写',
          from_department: department || '未填写',
          from_contact: contact,
          topic: topic,
          message: message,
          to_email: 'gdpandy@163.com',
          reply_to: contact
        };

        console.log("📤 正在发送邮件...", templateParams);

        // 使用 EmailJS 发送邮件
        window.emailjs.send(
          EMAILJS_CONFIG.serviceId,
          EMAILJS_CONFIG.templateId,
          templateParams
        ).then((response) => {
          console.log('✅ 邮件发送成功!', response.status, response.text);
          
          // 显示成功状态
          form.reset();
          form.style.display = "none";
          if (formSuccess) formSuccess.style.display = "block";
          
          // 滚动到成功消息
          if (formSuccess) formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }).catch((error) => {
          console.error('❌ 邮件发送失败:', error);
          
          // 显示失败状态
          form.style.display = "none";
          if (formError) {
            const errorMsg = error.error 
              ? `发送失败：${error.error}` 
              : "提交过程中出现错误，请稍后重试";
            if (formErrorText) formErrorText.textContent = errorMsg;
            formError.style.display = "block";
            formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }).finally(() => {
          // 恢复按钮状态
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "提交留言 →";
          }
        });

      } catch (err) {
        // 同步错误处理
        console.error('❌ 验证失败:', err);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = "提交留言 →";
        }
        
        if (formMessage) {
          formMessage.style.display = "block";
          formMessage.style.color = "#fff";
          formMessage.style.background = "#d32f2f";
          formMessage.style.textAlign = "center";
          formMessage.innerText = "❌ " + err.message;
        }
      }
    });
    
    console.log("✅ contact form 初始化完成");
  }).catch(error => {
    console.error('❌ EmailJS 加载失败:', error);
  });
}

// 全局函数：重置表单
window.resetForm = function() {
  const form = document.getElementById('feedbackForm');
  const formSuccess = document.getElementById('formSuccess');
  
  if (!form || !formSuccess) return;
  
  form.reset();
  form.style.display = "block";
  formSuccess.style.display = "none";
  
  // 滚动到表单顶部
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// 全局函数：重试提交
window.retryForm = function() {
  const form = document.getElementById('feedbackForm');
  const formError = document.getElementById('formError');
  
  if (!form || !formError) return;
  
  formError.style.display = "none";
  form.style.display = "block";
  
  // 如果有保存的数据，填充回去
  if (window.formData) {
    const nameInput = document.getElementById('name');
    const positionInput = document.getElementById('position');
    const departmentInput = document.getElementById('department');
    const contactInput = document.getElementById('contactInput');
    const topicInput = document.getElementById('topic');
    const messageInput = document.getElementById('message');
    
    if (nameInput) nameInput.value = window.formData.name || '';
    if (positionInput) positionInput.value = window.formData.position || '';
    if (departmentInput) departmentInput.value = window.formData.department || '';
    if (contactInput) contactInput.value = window.formData.contact || '';
    if (topicInput) topicInput.value = window.formData.topic || '';
    if (messageInput) messageInput.value = window.formData.message || '';
  }
  
  // 滚动到表单顶部
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// 添加 CSS 动画
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// 页面加载完成后开始初始化表单
document.addEventListener('DOMContentLoaded', function() {
  console.log("📄 DOMContentLoaded 触发，开始初始化流程");
  // 预加载 EmailJS SDK
  loadEmailJS();
  setTimeout(initContactForm, 300);
});

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
