import http from '@/utils/http'

// ==================== 工具 ====================

/** 图片URL处理：相对路径自动拼接后端静态资源地址 */
export function imgUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path
  return '/jeecg-boot/sys/common/static/' + path.replace(/^\/+/, '')
}

// ==================== 认证 ====================
export const login = (data: { username: string; password: string; captcha?: string }) => http.post('/sys/login', data)
export const register = (data: { username: string; password: string; phone?: string }) => http.post('/mall/user/register', data)
export const getUserInfo = () => http.get('/sys/user/getUserInfo')

// ==================== 用户 ====================
export const getUserProfile = (userId: string) => http.get('/mall/user/queryByUserId', { params: { userId } })

// ==================== 分类 ====================
export const getCategoryTree = () => http.get('/mall/category/tree')

// ==================== 商品 SPU ====================
export const getProductList = (params: any) => http.get('/mall/spu/list', { params })
export const getProductDetail = (id: string) => http.get('/mall/spu/queryById', { params: { id } })
export const getFrontProductList = (params: any) => http.get('/mall/spu/frontList', { params })
export const getMerchantProductList = (merchantId: string, auditStatus?: number, params?: any) =>
  http.get('/mall/spu/merchantList', { params: { merchantId, auditStatus, ...params } })
export const approveProduct = (id: string, auditor: string) =>
  http.put('/mall/spu/approve', null, { params: { id, auditor } })
export const rejectProduct = (id: string, reason: string, auditor: string) =>
  http.put('/mall/spu/reject', null, { params: { id, reason, auditor } })
export const resubmitProduct = (id: string) =>
  http.put('/mall/spu/resubmit', null, { params: { id } })

// ==================== 购物车 ====================
export const getCartList = (userId: string) => http.get('/mall/cart/myCart', { params: { userId } })
export const addToCart = (params: any) => http.post('/mall/cart/addToCart', null, { params })
export const updateCartQty = (id: string, quantity: number) => http.put('/mall/cart/updateQuantity', null, { params: { id, quantity } })
export const toggleCartSelect = (id: string) => http.put('/mall/cart/toggleSelect', null, { params: { id } })
export const removeCartItem = (id: string) => http.delete('/mall/cart/remove', { params: { id } })

// ==================== 订单 ====================
export const createOrder = (data: any) => http.post('/mall/order/create', data)
export const getOrderList = (params: any) => http.get('/mall/order/myOrders', { params })
export const getOrderDetail = (id: string) => http.get('/mall/order/queryById', { params: { id } })
export const cancelOrder = (orderId: string) => http.put('/mall/order/cancel', null, { params: { orderId } })
export const payOrder = (data: any) => http.post('/mall/order/pay', data)
export const dummyPay = (orderId: string, payType = 1) => http.put('/mall/order/dummyPay', null, { params: { orderId, payType } })
export const confirmReceipt = (orderId: string) => http.put('/mall/order/receive', null, { params: { orderId } })

// ==================== 收货地址 ====================
export const getAddressList = (userId: string) => http.get('/mall/userAddress/list', { params: { userId } })
export const addAddress = (data: any) => http.post('/mall/userAddress/add', data)
export const updateAddress = (data: any) => http.put('/mall/userAddress/edit', data)
export const deleteAddress = (id: string) => http.delete('/mall/userAddress/delete', { params: { id } })
export const setDefaultAddress = (id: string) => http.put('/mall/userAddress/setDefault', null, { params: { id } })

// ==================== 优惠券 ====================
export const getUserCoupons = (userId: string) => http.get('/mall/userCoupon/list', { params: { userId } })
export const getCouponTemplateList = (params?: any) => http.get('/mall/coupon/list', { params })

// ==================== 商家 ====================
export const merchantApply = (data: any) => http.post('/mall/merchant/apply', data)
export const getMyMerchant = (userId: string) => http.get('/mall/merchant/my', { params: { userId } })
export const getMerchantList = (params?: any) => http.get('/mall/merchant/list', { params })

// ==================== 秒杀 ====================
export const getSeckillList = (params?: any) => http.get('/mall/seckill/list', { params })
export const getSeckillProductList = (params?: any) => http.get('/mall/seckillProduct/list', { params })

// ==================== 拼团 ====================
export const getGroupBuyList = (params?: any) => http.get('/mall/groupBuy/list', { params })

// ==================== 签到 ====================
export const doSignIn = (userId: string) => http.post('/mall/signIn/doSign', null, { params: { userId } })
export const claimBonus = (userId: string) => http.post('/mall/signIn/claimBonus', null, { params: { userId } })
export const claimCumulative = (userId: string) => http.post('/mall/signIn/claimCumulative', null, { params: { userId } })
export const getSignStatus = (userId: string) => http.get('/mall/signIn/status', { params: { userId } })
export const getSignRecords = (params: any) => http.get('/mall/signIn/myRecords', { params })
