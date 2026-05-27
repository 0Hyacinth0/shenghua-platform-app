<script setup>
import { ref } from 'vue'
import { onLaunch } from '@dcloudio/uni-app'
import { getPrivacyAgreed, getToken } from '@/utils/storage'
import { navigateTo, ROUTES, switchTab } from '@/utils/router'
import PrivacyModal from '@/components/PrivacyModal.vue'

const showPrivacy = ref(false)

onLaunch(() => {
  console.log('[App] Launch')

  const agreed = getPrivacyAgreed()
  if (!agreed) {
    showPrivacy.value = true
  } else {
    checkLogin()
  }
})

function checkLogin() {
  const token = getToken()
  if (!token) {
    // 延迟跳转，等页面栈初始化完成
    setTimeout(() => {
      navigateTo(ROUTES.LOGIN)
    }, 300)
  }
}

function onPrivacyAgree() {
  showPrivacy.value = false
  checkLogin()
}

function onPrivacyDisagree() {
  // #ifdef APP-PLUS
  plus.runtime.quit()
  // #endif
  // #ifndef APP-PLUS
  uni.showToast({ title: '需同意隐私协议才能使用', icon: 'none' })
  // #endif
}
</script>

<template>
  <PrivacyModal
    v-if="showPrivacy"
    @agree="onPrivacyAgree"
    @disagree="onPrivacyDisagree"
  />
</template>

<style>
@import '@/styles/variables.css';
</style>
