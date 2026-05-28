import request from '@/utils/request'

export function getCategories() {
  return request.get('/course-categories')
}

export function getCourseList(params = {}) {
  return request.get('/courses', params)
}

export function getCourseDetail(courseId) {
  return request.get(`/courses/${courseId}`)
}

export function getLessonPlayInfo(lessonId) {
  return request.get(`/lessons/${lessonId}/play`)
}
