// charts.js - 所有 Chart.js 图表渲染函数

// 重构：专业可视化图表渲染函数 - 确保始终显示总计数据且只渲染一次
function ensureDomainChartsRendered() {
  // 只有在 biData 存在且 Canvas 元素存在时才渲染
  if (typeof biData === 'undefined' || biData.length === 0) {
    return;
  }
  
  // 检查条形图是否需要渲染
  const barCanvas = document.getElementById('domainDistributionChart');
  if (barCanvas && !barCanvas.chartRendered) {
    renderDomainBarChart(biData);
    barCanvas.chartRendered = true;
  }
  
  // 检查饼图是否需要渲染  
  const pieCanvas = document.getElementById('domainPieChart');
  if (pieCanvas && !pieCanvas.chartRendered) {
    renderDomainPieChart(biData);
    pieCanvas.chartRendered = true;
  }
}

// 分离的条形图渲染函数
function renderDomainBarChart(data) {
  // 计算各业务领域的问题数量
  const domainCount = {};
  data.forEach(d => {
    domainCount[d.cat] = (domainCount[d.cat] || 0) + 1;
  });
  
  // 使用埃森哲紫色主题的配色方案
  const domainColors = {
    '大客户业务': '#0057B8',
    '居民巡检': '#00a86b',
    '非居巡检': '#f59e0b',
    '计量': '#e53012',
    '收费': '#a100ff',
    '技改': '#00b8b8',
    '户内维修': '#b80065',
    '拆改': '#59b800',
    '话务': '#00b8a9',
    '系统': '#9ca3af'
  };
  
  // 按问题数量降序排列（只包含有数据的领域）
  const validDomains = Object.keys(domainCount)
    .filter(domain => domainCount[domain] > 0)
    .sort((a, b) => domainCount[b] - domainCount[a]);
  
  if (validDomains.length === 0) return;
  
  const labels = validDomains;
  const counts = validDomains.map(domain => domainCount[domain]);
  const backgroundColors = validDomains.map(domain => domainColors[domain] || '#666666');
  const borderColors = validDomains.map(domain => domainColors[domain] || '#666666');
  
  const barCanvas = document.getElementById('domainDistributionChart');
  const barCtx = barCanvas.getContext('2d');
  new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '问题数量',
        data: counts,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(161, 0, 255, 0.)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#a100ff',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.x}`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            font: { size: 12, family: 'Noto Sans SC', weight: '500' },
            precision: 0,
            color: 'var(--acn-gray)'
          },
          grid: {
            color: 'rgba(0,0,0,0.1)',
            borderColor: 'var(--acn-gray-light)'
          }
        },
        y: {
          ticks: {
            font: { size: 12, family: 'Noto Sans SC', weight: '600' },
            color: 'var(--acn-dark)'
          },
          grid: { display: false }
        }
      }
    }
  });
}

// 新增：当前业务领域问题类型分布图表渲染函数
function updateCurrentDomainTypeCharts(data, currentDomain) {
  // 如果是"全部"，则显示所有数据的问题类型分布
  const displayData = currentDomain === 'all' ? data : data.filter(d => d.cat === currentDomain);
  
  if (displayData.length === 0) {
    // 清空图表
    clearCurrentDomainTypeCharts();
    return;
  }
  
  // 计算各问题类型的数量
  const typeCount = {};
  displayData.forEach(d => {
    // 处理可能包含多个类型的情况（用逗号分隔）
    const types = d.type.split('，');
    types.forEach(type => {
      type = type.trim();
      if (type && type !== '待定') {
        typeCount[type] = (typeCount[type] || 0) + 1;
      }
    });
  });
  
  // 按数量降序排列
  const validTypes = Object.keys(typeCount)
    .filter(type => typeCount[type] > 0)
    .sort((a, b) => typeCount[b] - typeCount[a]);
  
  if (validTypes.length === 0) {
    clearCurrentDomainTypeCharts();
    return;
  }
  
  const labels = validTypes;
  const counts = validTypes.map(type => typeCount[type]);
  
  // 使用埃森哲紫色渐变色卡
  const purpleColors = [
    '#28004D', '#4B0091', '#6F00D2', '#921AFF', '#B15BFF', 
    '#CA8EFF', '#DCB5FF', '#F1E1FF', '#B15BFF', '#BE77FF',
    '#CA8EFF', '#E6CAFF', '#DCB5FF', '#E6CAFF', '#F1E1FF'
  ];
  
  const backgroundColors = labels.map((_, i) => purpleColors[i % purpleColors.length]);
  const borderColors = labels.map((_, i) => purpleColors[i % purpleColors.length]);
  
  // 渲染条形图
  const barCanvas = document.getElementById('currentDomainTypeChart');
  if (barCanvas) {
    const barCtx = barCanvas.getContext('2d');
    // 销毁已存在的图表实例
    if (window.currentDomainTypeBarChartInstance) {
      window.currentDomainTypeBarChartInstance.destroy();
    }
    
    window.currentDomainTypeBarChartInstance = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '问题数量',
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#000000',
            bodyColor: '#000000',
            borderColor: '#a100ff',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.x}`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              font: { size: 12, family: 'Noto Sans SC', weight: '500' },
              precision: 0,
              color: 'var(--acn-gray)'
            },
            grid: {
              color: 'rgba(0,0,0,0.1)',
              borderColor: 'var(--acn-gray-light)'
            }
          },
          y: {
            ticks: {
              font: { size: 12, family: 'Noto Sans SC', weight: '600' },
              color: 'var(--acn-dark)'
            },
            grid: { display: false }
          }
        }
      }
    });
  }
  
  // 渲染饼图
  const pieCanvas = document.getElementById('currentDomainTypePieChart');
  if (pieCanvas) {
    const pieCtx = pieCanvas.getContext('2d');
    // 销毁已存在的图表实例
    if (window.currentDomainTypePieChartInstance) {
      window.currentDomainTypePieChartInstance.destroy();
    }
    
    window.currentDomainTypePieChartInstance = new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverBorderColor: '#a100ff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: { size: 11, family: 'Noto Sans SC', weight: '500' },
              padding: 12,
              usePointStyle: true,
              boxWidth: 10,
              color: 'var(--acn-dark)'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#000000',
            bodyColor: '#000000',
            borderColor: '#a100ff',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              }
            }
          }
        },
        cutout: '50%'
      }
    });
  }
}

// 清空当前业务领域图表的辅助函数
function clearCurrentDomainTypeCharts() {
  const barCanvas = document.getElementById('currentDomainTypeChart');
  const pieCanvas = document.getElementById('currentDomainTypePieChart');
  
  if (barCanvas && window.currentDomainTypeBarChartInstance) {
    window.currentDomainTypeBarChartInstance.destroy();
    window.currentDomainTypeBarChartInstance = null;
  }
  
  if (pieCanvas && window.currentDomainTypePieChartInstance) {
    window.currentDomainTypePieChartInstance.destroy();
    window.currentDomainTypePieChartInstance = null;
  }
}


// ── USER SERVICE CHARTS ──
function renderUserServiceCharts() {
  // 用户数据
  const userData = [
    { company: '一分公司', residential: 62.7, nonResidential: 11686, district: '东城区、西城区' },
    { company: '二分公司', residential: 172.8, nonResidential: 29105, district: '朝阳区、顺义区' },
    { company: '三分公司', residential: 63.1, nonResidential: 11267, district: '通州区' },
    { company: '四分公司', residential: 163.3, nonResidential: 23665, district: '丰台区、大兴区、经开区' },
    { company: '五分公司', residential: 140.0, nonResidential: 20474, district: '海淀区、石景山区、门头沟区' },
    { company: '怀柔公司', residential: 8.7, nonResidential: 3114, district: '怀柔区' },
    { company: '密云公司', residential: 12.5, nonResidential: 1392, district: '密云区' },
    { company: '平谷公司', residential: 8.7, nonResidential: 698, district: '平谷区' },
    { company: '延庆公司', residential: 10.0, nonResidential: 1112, district: '延庆区' },
    { company: '昌平公司', residential: 56.6, nonResidential: 8442, district: '昌平区' },
    { company: '房山公司', residential: 40.5, nonResidential: 5854, district: '房山区' }
  ];

  // 用户分布饼图
  const distributionCtx = document.getElementById('userDistributionChart');
  if (distributionCtx) {
    // 销毁已存在的图表实例，防止重复创建
    if (window.userDistributionChartInstance) {
      window.userDistributionChartInstance.destroy();
    }

    const residentialData = userData.map(item => item.residential);
    const companyLabels = userData.map(item => item.company);

    // 使用埃森哲紫色主题色系
    const colors = [
      '#4B0091',
      '#6A00D2',
      '#8800FF',
      '#A100FF',  // 你的主题色（核心）
      '#B540FF',
      '#C870FF',
      '#DBA6FF',
      '#E9B976',
      '#F29B45',
      '#F77F1A',
      '#FF6A00'
    ];

    window.userDistributionChartInstance = new Chart(distributionCtx, {
      type: 'pie',
      data: {
        labels: companyLabels,
        datasets: [{
          data: residentialData,
          backgroundColor: colors.slice(0, companyLabels.length),
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverBorderColor: '#a100ff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: { size: 11, family: 'Noto Sans SC', weight: '500' },
              padding: 12,
              usePointStyle: true,
              boxWidth: 10,
              color: 'var(--acn-dark)'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#000000',
            bodyColor: '#000000',
            borderColor: '#a100ff',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${context.parsed}万 (${percentage}%)`;
              }
            }
          },
          datalabels: {
            display: true,
            color: '#ffffff',
            font: {
              family: 'Noto Sans SC',
              size: 11,
              weight: '600'
            },
            formatter: function(value, context) {
              const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${percentage}%`;
            }
          }
        },
        cutout: '40%'
      }
    });
  }

  // 用户数据对比条形图
  const comparisonCtx = document.getElementById('userDataComparisonChart');
  if (comparisonCtx) {
    // 销毁已存在的图表实例，防止重复创建
    if (window.userDataComparisonChartInstance) {
      window.userDataComparisonChartInstance.destroy();
    }

    const companyLabels = userData.map(item => item.company);
    const residentialData = userData.map(item => item.residential);
    const nonResidentialData = userData.map(item => item.nonResidential / 1000); // 转换为千单位以便显示

    window.userDataComparisonChartInstance = new Chart(comparisonCtx, {
      type: 'bar',
      data: {
        labels: companyLabels,
        datasets: [
          {
            label: '居民户量 (万户)',
            data: residentialData,
            backgroundColor: 'rgba(161, 0, 255, 0.8)',
            borderColor: 'rgba(161, 0, 255, 1)',
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false
          },
          {
            label: '非居民表数量 (千个)',
            data: nonResidentialData,
            backgroundColor: '#F57C00',
            borderColor: '#F57C00',
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: { size: 12, family: 'Noto Sans SC', weight: '500' },
              padding: 12,
              color: 'var(--acn-dark)'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#000000',
            bodyColor: '#000000',
            borderColor: '#a100ff',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function(context) {
                if (context.datasetIndex === 0) {
                  return `${context.dataset.label}: ${context.parsed.y}万`;
                } else {
                  return `${context.dataset.label}: ${(context.parsed.y * 1000).toLocaleString()}个`;
                }
              }
            }
          },
          datalabels: {
            display: function(context) {
              // 只在数据值大于0时显示标签
              return context.dataset.data[context.dataIndex] > 0;
            },
            color: function(context) {
              // 根据数据集索引设置不同颜色
              return context.datasetIndex === 0 ? 'rgba(161, 0, 255, 1)' : 'rgba(0, 87, 184, 1)';
            },
            font: {
              family: 'Noto Sans SC',
              size: 10,
              weight: '600'
            },
            anchor: 'end',
            align: 'top',
            offset: -10,
            formatter: function(value, context) {
              if (context.datasetIndex === 0) {
                return value + '万';
              } else {
                return (value * 1000).toLocaleString() + '';
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              font: { size: 11, family: 'Noto Sans SC', weight: '600' },
              color: 'var(--acn-dark)'
            },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: {
              font: { size: 12, family: 'Noto Sans SC', weight: 500 },
              color: 'var(--acn-gray)'
            },
            grid: {
              color: 'rgba(0,0,0,0.1)',
              borderColor: 'var(--acn-gray-light)'
            }
          }
        }
      }
    });
  }
}

// ── NON-RESIDENTIAL METER STRUCTURE CHART ──
function renderMeterStructureChart() {
  // 非居民燃气表结构数据
  const meterData = {
    labels: ['金额卡表', '物联网表', 'CPU卡表', '普表', 'IC卡表'],
    realValues: [73.66, 14.93, 8.68, 1.97, 0.76],
    // 视觉比例调整：对小数值进行夸张处理，但显示时仍显示真实数据
    displayValues: [50, 20, 15, 10, 5] // 调整普表和IC卡表的视觉比例
  };

  const meterCtx = document.getElementById('meterStructureChart');
  if (meterCtx) {
    // 销毁已存在的图表实例，防止重复创建
    if (window.meterStructureChartInstance) {
      window.meterStructureChartInstance.destroy();
    }

    // 使用埃森哲紫色主题色系，从深到浅
    const colors = [
      '#6A00D2',
      '#A100FF',  // 你的主题色（核心）
      '#B540FF',
      '#C870FF',
      '#DBA6FF',
    ];

    window.meterStructureChartInstance = new Chart(meterCtx, {
      type: 'polarArea',
      data: {
        labels: meterData.labels,
        datasets: [{
          data: meterData.displayValues, // 使用调整后的视觉比例
          backgroundColor: colors,
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverBorderColor: '#a100ff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 11, family: 'Noto Sans SC', weight: '500' },
              padding: 12,
              usePointStyle: true,
              boxWidth: 10,
              color: 'var(--acn-dark)'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#000000',
            bodyColor: '#000000',
            borderColor: '#a100ff',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function(context) {
                // 显示真实数据而不是视觉比例数据
                const realValue = meterData.realValues[context.dataIndex];
                return `${context.label}: ${realValue.toFixed(2)}%`;
              }
            }
          },
          datalabels: {
            display: true,
            color: '#ffffff',
            font: {
              family: 'Noto Sans SC',
              size: 11,
              weight: '600'
            },
            formatter: function(value, context) {
              // 显示真实数据而不是视觉比例数据
              const realValue = meterData.realValues[context.dataIndex];
              return `${realValue.toFixed(1)}%`;
            }
          }
        },
        scales: {
          r: {
            pointLabels: {
              font: { size: 11, family: 'Noto Sans SC', weight: '500' },
              color: 'var(--acn-dark)'
            },
            ticks: {
              display: false,
              backdropColor: 'transparent'
            },
            grid: {
              color: 'rgba(0,0,0,0.1)'
            }
          }
        }
      }
    });
  }
}

// 初始化用户服务图表
setTimeout(renderUserServiceCharts, 500);
// 初始化非居民燃气表结构图表
setTimeout(renderMeterStructureChart, 600);

// ══════════════════════════════════════════════════════════
// 北京市天然气消费分析图表
// ══════════════════════════════════════════════════════════

// 渲染用户增长和单户用气量图表
function renderBeijingGasCharts() {
  // 用户增长数据
  const userData = {
    labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025(E)'],
    data: [582, 608, 645, 668, 682, 695, 712, 721, 732, 741, 752]
  };

  // 单户用气量数据
  const perUserData = {
    labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025(E)'],
    data: [320, 335, 365, 358, 345, 338, 332, 325, 318, 312, 305]
  };

  // 售气量数据 (根据表格数据估算)
  const salesData = {
    labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025(E)'],
    data: [165, 172, 178, 182, 185, 180, 178, 175, 177, 180, 182]
  };

  // 用气结构数据 (当前)
  const structureData = {
    labels: ['居民用气', '工业用气', '公建用气', '采暖用气', '其他'],
    values: [35, 28, 20, 12, 5]
  };

  // 渲染用户增长图表
  const userCtx = document.getElementById('bjUserGrowthChart');
  if (userCtx) {
    if (window.bjUserGrowthChartInstance) {
      window.bjUserGrowthChartInstance.destroy();
    }

    window.bjUserGrowthChartInstance = new Chart(userCtx, {
      type: 'line',
      data: {
        labels: userData.labels,
        datasets: [{
          label: '居民用户总数（万户）',
          data: userData.data,
          borderColor: '#a100ff',
          backgroundColor: 'rgba(161, 0, 255, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#a100ff',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#000000',
            bodyColor: '#000000',
            borderColor: '#a100ff',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y + ' 万户';
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: { family: 'Noto Sans SC', size: 11 },
              color: '#666666'
            }
          },
          y: {
            beginAtZero: false,
            min: 550,
            grid: {
              color: 'rgba(0, 0, 0, 0.08)'
            },
            ticks: {
              font: { family: 'Noto Sans SC', size: 11 },
              color: '#666666',
              callback: function(value) {
                return value + '万';
              }
            }
          }
        }
      }
    });
  }

  // 渲染单户用气量图表
  const perUserCtx = document.getElementById('bjPerUserGasChart');
  if (perUserCtx) {
    if (window.bjPerUserGasChartInstance) {
      window.bjPerUserGasChartInstance.destroy();
    }

    window.bjPerUserGasChartInstance = new Chart(perUserCtx, {
      type: 'line',
      data: {
        labels: perUserData.labels,
        datasets: [{
          label: '单户平均用气量（m³/年）',
          data: perUserData.data,
          borderColor: '#a100ff',
          backgroundColor: 'rgba(161, 0, 255, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#a100ff',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#000000',
            bodyColor: '#000000',
            borderColor: '#a100ff',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y + ' m³/年';
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: { family: 'Noto Sans SC', size: 11 },
              color: '#666666'
            }
          },
          y: {
            beginAtZero: false,
            min: 280,
            max: 380,
            grid: {
              color: 'rgba(0, 0, 0, 0.08)'
            },
            ticks: {
              font: { family: 'Noto Sans SC', size: 11 },
              color: '#666666',
              callback: function(value) {
                return value + 'm³';
              }
            }
          }
        }
      }
    });
  }

  // 渲染售气量趋势图表
  const salesCtx = document.getElementById('bjSalesVolumeChart');
  if (salesCtx) {
    if (window.bjSalesVolumeChartInstance) {
      window.bjSalesVolumeChartInstance.destroy();
    }

    window.bjSalesVolumeChartInstance = new Chart(salesCtx, {
      type: 'line',
      data: {
        labels: salesData.labels,
        datasets: [{
          label: '市域内售气量（亿 m³）',
          data: salesData.data,
          borderColor: '#a100ff',
          backgroundColor: 'rgba(161, 0, 255, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#a100ff',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#000000',
            bodyColor: '#000000',
            borderColor: '#a100ff',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y + ' 亿 m³';
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: { family: 'Noto Sans SC', size: 11 },
              color: '#666666'
            }
          },
          y: {
            beginAtZero: false,
            min: 150,
            max: 200,
            grid: {
              color: 'rgba(0, 0, 0, 0.08)'
            },
            ticks: {
              font: { family: 'Noto Sans SC', size: 11 },
              color: '#666666',
              callback: function(value) {
                return value + '亿';
              }
            }
          }
        }
      }
    });
  }

  // 渲染用气结构分布图表
  const structureCtx = document.getElementById('bjGasStructureChart');
  if (structureCtx) {
    if (window.bjGasStructureChartInstance) {
      window.bjGasStructureChartInstance.destroy();
    }

    const structureColors = [
      '#a100ff',
      '#b840ff',
      '#c870ff',
      '#db9aff',
      '#edccff'
    ];

    window.bjGasStructureChartInstance = new Chart(structureCtx, {
      type: 'doughnut',
      data: {
        labels: structureData.labels,
        datasets: [{
          data: structureData.values,
          backgroundColor: structureColors,
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: 'Noto Sans SC', size: 11, weight: '500' },
              padding: 12,
              usePointStyle: true,
              boxWidth: 12,
              color: '#333333'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#000000',
            bodyColor: '#000000',
            borderColor: '#a100ff',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return context.label + ': ' + context.parsed + '% (' + percentage + '%)';
              }
            }
          }
        }
      }
    });
  }
}

// 页面加载完成后渲染北京燃气分析图表
window.addEventListener('load', function() {
  setTimeout(renderBeijingGasCharts, 800);
});

// ── GOOGLE SHEETS FORM ──
