// bi-data.js - BI数据源
// 这个文件包含用于图表渲染的数据

const biData = [
  {
    id: 1,
    cat: '大客户业务',
    title: '大客户业务问题1',
    description: '大客户业务相关的问题描述'
  },
  {
    id: 2,
    cat: '居民巡检',
    title: '居民巡检问题1',
    description: '居民巡检相关的问题描述'
  },
  {
    id: 3,
    cat: '非居巡检',
    title: '非居巡检问题1',
    description: '非居巡检相关的问题描述'
  },
  {
    id: 4,
    cat: '计量',
    title: '计量问题1',
    description: '计量相关的问题描述'
  },
  {
    id: 5,
    cat: '收费',
    title: '收费问题1',
    description: '收费相关的问题描述'
  },
  {
    id: 6,
    cat: '技改',
    title: '技改问题1',
    description: '技改相关的问题描述'
  },
  {
    id: 7,
    cat: '户内维修',
    title: '户内维修问题1',
    description: '户内维修相关的问题描述'
  },
  {
    id: 8,
    cat: '拆改',
    title: '拆改问题1',
    description: '拆改相关的问题描述'
  },
  {
    id: 9,
    cat: '话务',
    title: '话务问题1',
    description: '话务相关的问题描述'
  },
  {
    id: 10,
    cat: '系统',
    title: '系统问题1',
    description: '系统相关的问题描述'
  }
];

// 用户服务数据（用于用户服务图表）
const userServiceData = {
  satisfaction: 85,
  responseTime: 2.5,
  resolutionRate: 92,
  categories: [
    { name: '咨询类', value: 45 },
    { name: '报修类', value: 30 },
    { name: '投诉类', value: 15 },
    { name: '建议类', value: 10 }
  ]
};