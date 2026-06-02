<template>
  <div class="component-renderer">
    <!-- 轮播图 -->
    <div v-if="comp.type === 'carousel'" :style="{ height: p.height + 'px', borderRadius: p.borderRadius + 'px', overflow: 'hidden', background: '#e8e8e8' }">
      <div class="carousel-placeholder" :style="{ height: p.height + 'px' }">
        <a-carousel v-if="p.images && p.images.length > 0" :autoplay="p.autoplay">
          <div v-for="(img, i) in p.images" :key="i">
            <img :src="imgSrc(img)" :style="{ height: p.height + 'px', width: '100%', objectFit: 'cover', borderRadius: p.borderRadius + 'px' }" />
          </div>
        </a-carousel>
        <div v-else class="empty-carousel">
          <PictureOutlined />
          <span>轮播图</span>
          <span class="hint">请上传图片</span>
        </div>
      </div>
    </div>

    <!-- 公告栏 -->
    <div v-else-if="comp.type === 'notice'" class="comp-notice" :style="{ backgroundColor: p.backgroundColor, color: p.textColor }">
      <div class="notice-content">
        <SoundOutlined class="notice-icon" />
        <span class="notice-text">{{ p.text || '公告内容' }}</span>
      </div>
    </div>

    <!-- 搜索框 -->
    <div v-else-if="comp.type === 'searchBar'" class="comp-search" :style="{ backgroundColor: p.backgroundColor }">
      <div :class="['search-box', p.shape === 'round' ? 'round' : 'square']">
        <SearchOutlined class="search-icon" />
        <span class="search-placeholder">{{ p.placeholder || '搜索商品' }}</span>
      </div>
    </div>

    <!-- 导航栏 -->
    <div v-else-if="comp.type === 'navBar'" class="comp-navbar" :style="{ backgroundColor: p.backgroundColor }">
      <div class="nav-grid" :style="{ gridTemplateColumns: `repeat(${p.columns || 4}, 1fr)` }">
        <div v-for="(item, i) in (p.items || [])" :key="i" class="nav-item">
          <div class="nav-icon-wrapper">
            <component :is="getNavIcon(item.icon)" class="nav-icon" />
          </div>
          <span class="nav-text">{{ item.text }}</span>
        </div>
      </div>
    </div>

    <!-- 图片广告 -->
    <div v-else-if="comp.type === 'imageAd'" class="comp-image-ad" :style="{ padding: '8px 12px', backgroundColor: pageBg }">
      <div :style="{ height: p.height + 'px', borderRadius: p.borderRadius + 'px', overflow: 'hidden', background: '#f0f0f0' }">
        <img v-if="p.imageUrl" :src="imgSrc(p.imageUrl)" :style="{ height: p.height + 'px', width: '100%', objectFit: 'cover', borderRadius: p.borderRadius + 'px' }" />
        <div v-else class="empty-image" :style="{ height: p.height + 'px' }">
          <PictureOutlined />
          <span>图片广告</span>
        </div>
      </div>
    </div>

    <!-- 标题栏 -->
    <div v-else-if="comp.type === 'titleBar'" class="comp-title-bar" :style="{ textAlign: p.align }">
      <div class="title-main">{{ p.title || '标题' }}</div>
      <div v-if="p.subtitle" class="title-sub">{{ p.subtitle }}</div>
    </div>

    <!-- 空白占位 -->
    <div v-else-if="comp.type === 'spacer'" :style="{ height: p.height + 'px', backgroundColor: p.backgroundColor }">
    </div>

    <!-- 富文本 -->
    <div v-else-if="comp.type === 'richText'" class="comp-rich-text" :style="{ padding: p.padding + 'px' }">
      <div v-html="p.content || '<p>内容</p>'"></div>
    </div>

    <!-- 商品列表 -->
    <div v-else-if="comp.type === 'productList'" class="comp-product-list">
      <div class="section-header">
        <span class="section-title">{{ p.title || '商品推荐' }}</span>
        <span class="section-more">更多 &gt;</span>
      </div>
      <div :class="['product-grid', p.layout || 'grid2']">
        <div v-for="i in (p.displayCount || 6)" :key="i" class="product-placeholder">
          <div class="product-img-placeholder"></div>
          <div class="product-info">
            <div class="product-name-line"></div>
            <div v-if="p.showPrice" class="product-price-line"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类导航 -->
    <div v-else-if="comp.type === 'categoryNav'" class="comp-category-nav">
      <div class="section-header">
        <span class="section-title">{{ p.title || '商品分类' }}</span>
      </div>
      <div class="cat-grid" :style="{ gridTemplateColumns: `repeat(${p.columns || 4}, 1fr)` }">
        <div v-for="i in (p.displayCount || 8)" :key="i" class="cat-item">
          <div class="cat-icon-placeholder"></div>
          <span class="cat-name">分类{{ i }}</span>
        </div>
      </div>
    </div>

    <!-- 优惠券区 -->
    <div v-else-if="comp.type === 'couponSection'" class="comp-coupon-section">
      <div class="section-header">
        <span class="section-title">{{ p.title || '领券中心' }}</span>
        <span class="section-more">更多 &gt;</span>
      </div>
      <div class="coupon-scroll">
        <div v-for="i in (p.displayCount || 4)" :key="i" class="coupon-placeholder">
          <div class="coupon-left">
            <span class="coupon-amount">¥10</span>
            <span class="coupon-condition">满100可用</span>
          </div>
          <div class="coupon-right">
            <span>立即领取</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 秒杀区 -->
    <div v-else-if="comp.type === 'seckillSection'" class="comp-seckill-section">
      <div class="section-header">
        <span class="section-title">{{ p.title || '限时秒杀' }}</span>
        <div class="seckill-timer">
          <span class="timer-block">00</span>:<span class="timer-block">00</span>:<span class="timer-block">00</span>
        </div>
        <span class="section-more">更多 &gt;</span>
      </div>
      <div class="seckill-scroll">
        <div v-for="i in (p.displayCount || 4)" :key="i" class="seckill-placeholder">
          <div class="seckill-img-placeholder"></div>
          <div class="seckill-info">
            <div class="seckill-price">¥99</div>
            <div class="seckill-original">¥199</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 未知组件 -->
    <div v-else class="comp-unknown">
      未知组件: {{ comp.type }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  PictureOutlined,
  SoundOutlined,
  SearchOutlined,
  AppstoreOutlined,
  StarOutlined,
  GiftOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import type { DesignerComponent } from './designerTypes'

const props = defineProps<{
  component: DesignerComponent
  pageBg?: string
}>()

const comp = computed(() => props.component)
const p = computed(() => comp.value.props || {})

// 导航图标映射
const navIcons: Record<string, any> = {
  appstore: AppstoreOutlined,
  star: StarOutlined,
  gift: GiftOutlined,
  user: UserOutlined,
  search: SearchOutlined,
  picture: PictureOutlined,
}

function getNavIcon(iconName: string) {
  return navIcons[iconName] || AppstoreOutlined
}

/** 转换上传文件路径为可访问URL */
function imgSrc(src: string) {
  if (!src) return ''
  if (src.startsWith('http')) return src
  if (src.startsWith('/jeecgboot')) return src
  return '/jeecgboot/sys/common/static/' + (src.startsWith('/') ? src.slice(1) : src)
}
</script>

<style lang="less" scoped>
.component-renderer {
  // 轮播图占位
  .carousel-placeholder {
    width: 100%;
    .empty-carousel {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 13px;
      gap: 4px;
      .anticon {
        font-size: 32px;
      }
      .hint {
        font-size: 11px;
        color: #bbb;
      }
    }
  }

  // 图片广告占位
  .empty-image {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #999;
    gap: 4px;
    font-size: 13px;
  }

  // 公告
  .comp-notice {
    padding: 10px 12px;
    .notice-content {
      display: flex;
      align-items: center;
      gap: 8px;
      .notice-icon {
        font-size: 14px;
        flex-shrink: 0;
      }
      .notice-text {
        font-size: 13px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  // 搜索框
  .comp-search {
    padding: 10px 12px;
    .search-box {
      display: flex;
      align-items: center;
      height: 32px;
      background: #f5f5f5;
      padding: 0 12px;
      gap: 6px;
      &.round { border-radius: 16px; }
      &.square { border-radius: 4px; }
      .search-icon {
        color: #999;
        font-size: 14px;
      }
      .search-placeholder {
        color: #bbb;
        font-size: 13px;
      }
    }
  }

  // 导航栏
  .comp-navbar {
    padding: 12px;
    .nav-grid {
      display: grid;
      gap: 12px 0;
    }
    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .nav-icon-wrapper {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .nav-icon {
      font-size: 20px;
      color: #666;
    }
    .nav-text {
      font-size: 11px;
      color: #666;
    }
  }

  // 标题栏
  .comp-title-bar {
    padding: 12px;
    background: #fff;
    .title-main {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    .title-sub {
      font-size: 12px;
      color: #999;
      margin-top: 2px;
    }
  }

  // 富文本
  .comp-rich-text {
    background: #fff;
    :deep(img) { max-width: 100%; }
  }

  // 通用分区标题
  .section-header {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #fff;
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      flex: 1;
    }
    .section-more {
      font-size: 12px;
      color: #999;
    }
  }

  // 商品列表
  .comp-product-list {
    background: #fff;
    .product-grid {
      padding: 0 12px 12px;
      &.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      &.grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
      &.list { display: flex; flex-direction: column; gap: 8px; }
    }
    .product-placeholder {
      background: #f9f9f9;
      border-radius: 6px;
      overflow: hidden;
      .product-img-placeholder {
        width: 100%;
        aspect-ratio: 1;
        background: linear-gradient(135deg, #e8e8e8, #f0f0f0);
      }
      .product-info {
        padding: 6px;
        .product-name-line {
          height: 10px;
          background: #e8e8e8;
          border-radius: 2px;
          width: 80%;
        }
        .product-price-line {
          height: 12px;
          background: #e8e8e8;
          border-radius: 2px;
          width: 40%;
          margin-top: 4px;
        }
      }
    }
  }

  // 分类导航
  .comp-category-nav {
    background: #fff;
    .cat-grid {
      display: grid;
      gap: 8px;
      padding: 0 12px 12px;
    }
    .cat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .cat-icon-placeholder {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e6f4ff, #bae0ff);
    }
    .cat-name {
      font-size: 11px;
      color: #666;
    }
  }

  // 优惠券
  .comp-coupon-section {
    background: #fff;
    .coupon-scroll {
      display: flex;
      gap: 8px;
      padding: 0 12px 12px;
      overflow-x: auto;
    }
    .coupon-placeholder {
      flex-shrink: 0;
      width: 140px;
      display: flex;
      border-radius: 8px;
      overflow: hidden;
    }
    .coupon-left {
      flex: 1;
      background: linear-gradient(135deg, #ff6b6b, #ff4757);
      padding: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .coupon-amount {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
    }
    .coupon-condition {
      font-size: 10px;
      color: rgba(255,255,255,0.8);
      margin-top: 2px;
    }
    .coupon-right {
      width: 32px;
      background: #fff0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #ff4757;
      writing-mode: vertical-rl;
      padding: 6px 0;
    }
  }

  // 秒杀区
  .comp-seckill-section {
    background: #fff;
    .seckill-timer {
      display: flex;
      align-items: center;
      gap: 2px;
      margin: 0 8px;
      font-size: 12px;
      color: #333;
      .timer-block {
        background: #333;
        color: #fff;
        padding: 1px 4px;
        border-radius: 2px;
        font-size: 11px;
      }
    }
    .seckill-scroll {
      display: flex;
      gap: 8px;
      padding: 0 12px 12px;
      overflow-x: auto;
    }
    .seckill-placeholder {
      flex-shrink: 0;
      width: 100px;
      border-radius: 6px;
      overflow: hidden;
      background: #f9f9f9;
      .seckill-img-placeholder {
        width: 100%;
        height: 100px;
        background: linear-gradient(135deg, #fff0f0, #ffe0e0);
      }
      .seckill-info {
        padding: 4px 6px;
        .seckill-price {
          font-size: 14px;
          font-weight: 600;
          color: #e4393c;
        }
        .seckill-original {
          font-size: 10px;
          color: #999;
          text-decoration: line-through;
        }
      }
    }
  }

  .comp-unknown {
    padding: 20px;
    text-align: center;
    color: #999;
    font-size: 13px;
  }
}
</style>
