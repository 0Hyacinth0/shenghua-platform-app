import request from '@/utils/request'

export function sendSmsCode(phone) {
  return request.post('/auth/sms-code', { phone })
}

export function loginBySms(phone, smsCode, privacyAgreementVersion = '2026-05-01') {
  return request.post('/auth/login-by-sms', {
    phone,
    smsCode,
    privacyAgreementVersion,
  })
}
