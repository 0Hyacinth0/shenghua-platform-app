<template>
  <div class="stats-page">
    <h2>营收概览</h2>
    <a-spin :spinning="loading">
      <a-row :gutter="16" class="stats-cards">
        <a-col :span="6">
          <a-card>
            <a-statistic title="总订单数" :value="data.totalOrders || 0" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic title="已完成营收" :value="data.doneAmount || 0" prefix="¥" :precision="2" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic title="今日订单" :value="data.todayOrders || 0" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic title="今日营收" :value="data.todayAmount || 0" prefix="¥" :precision="2" />
          </a-card>
        </a-col>
      </a-row>
      <a-row :gutter="16" style="margin-top:16px">
        <a-col :span="6">
          <a-card>
            <a-statistic title="平台抽成总计" :value="data.totalCommission || 0" prefix="¥" :precision="2" />
          </a-card>
        </a-col>
      </a-row>

      <a-row :gutter="16" style="margin-top:16px">
        <a-col :span="12">
          <a-card title="订单状态分布">
            <div ref="statusChartRef" style="height:300px" />
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="近7天营收趋势">
            <div ref="trendChartRef" style="height:300px" />
          </a-card>
        </a-col>
      </a-row>

      <a-row :gutter="16" style="margin-top:16px">
        <a-col :span="12">
          <a-card title="商品销量排行 Top10">
            <div ref="productChartRef" style="height:300px" />
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="用户增长趋势(近7天)">
            <div ref="userTrendChartRef" style="height:300px" />
          </a-card>
        </a-col>
      </a-row>

      <a-row style="margin-top:16px">
        <a-col :span="24">
          <a-card title="各商家营收排行">
            <div ref="merchantChartRef" style="height:350px" />
          </a-card>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { defHttp } from '/@/utils/http/axios'

const loading = ref(false)
const data = ref<any>({})
const statusChartRef = ref()
const trendChartRef = ref()
const merchantChartRef = ref()
const productChartRef = ref()
const userTrendChartRef = ref()

const statusLabels: Record<number, string> = { 0: '待付款', 1: '待发货', 2: '已发货', 3: '已完成', 4: '已取消', 5: '退款中', 6: '已退款' }

async function loadData() {
  loading.value = true
  try {
    const res: any = await defHttp.get({ url: '/mall/stats/revenue' })
    data.value = res
    await nextTick()
    renderCharts()
  } catch { /* ignore */ }
  finally { loading.value = false }
}

function renderCharts() {
  // 状态分布饼图
  if (statusChartRef.value) {
    const chart = echarts.init(statusChartRef.value)
    const counts = data.value.statusCounts || []
    chart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [{
        type: 'pie', radius: ['40%', '70%'],
        data: counts.map((r: any) => ({ name: statusLabels[r.order_status] || '未知', value: r.cnt })),
      }],
    })
  }

  // 营收趋势折线图
  if (trendChartRef.value) {
    const chart = echarts.init(trendChartRef.value)
    const trend = data.value.dailyTrend || []
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: trend.map((r: any) => r.day) },
      yAxis: { type: 'value' },
      series: [{
        name: '营收', type: 'line', data: trend.map((r: any) => r.amount),
        smooth: true, areaStyle: { opacity: 0.2 },
      }],
    })
  }

  // 商品销量排行柱状图
  if (productChartRef.value) {
    const chart = echarts.init(productChartRef.value)
    const products = data.value.topProducts || []
    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '10%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', name: '销量' },
      yAxis: {
        type: 'category',
        data: products.map((r: any) => r.name || '-'),
        axisLabel: { width: 100, overflow: 'truncate' },
      },
      series: [{
        name: '销量', type: 'bar', data: products.map((r: any) => r.sales),
        itemStyle: { color: '#52c41a' },
        label: { show: true, position: 'right' },
      }],
    })
  }

  // 用户增长趋势折线图
  if (userTrendChartRef.value) {
    const chart = echarts.init(userTrendChartRef.value)
    const trend = data.value.userTrend || []
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: trend.map((r: any) => r.day) },
      yAxis: { type: 'value', name: '注册数' },
      series: [{
        name: '新注册用户', type: 'line', data: trend.map((r: any) => r.cnt),
        smooth: true,
        areaStyle: { opacity: 0.15 },
        itemStyle: { color: '#722ed1' },
      }],
    })
  }

  // 商家营收柱状图
  if (merchantChartRef.value) {
    const chart = echarts.init(merchantChartRef.value)
    const merchants = data.value.merchantRevenue || []
    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: { type: 'category', data: merchants.map((r: any) => r.name || '未命名'), axisLabel: { rotate: 30 } },
      yAxis: { type: 'value' },
      series: [{
        name: '营收(元)', type: 'bar', data: merchants.map((r: any) => r.amount),
        itemStyle: { color: '#1890ff' },
      }],
    })
  }
}

onMounted(loadData)
</script>

<style scoped>
.stats-page { padding: 16px; background: #f0f2f5; min-height: 100vh }
h2 { margin: 0 0 16px; font-size: 20px }
.stats-cards { margin-bottom: 0 }
</style>
