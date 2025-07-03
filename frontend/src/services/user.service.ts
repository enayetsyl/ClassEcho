// src/services/user.service.ts

import apiClient from '@/lib/api-client'
import {
  IUser,
  AddTeacherInput,
  UpdateProfileInput,
} from '@/types/user.types'

/**
 * Fetch the current user's profile.
 * GET /users/me/profile
 */
export function getProfile(): Promise<IUser> {
  return apiClient
    .get<{ data: IUser }>('/users/me/profile')
    .then((res) => res.data.data)
}

/**
 * Update the current user's profile.
 * PUT /users/me/profile
 */
export function updateProfile(
  data: UpdateProfileInput
): Promise<IUser> {
  return apiClient
    .put<{ data: IUser }>('/users/me/profile', data)
    .then((res) => res.data.data)
}

/**
 * Create a new teacher (Admin/SeniorAdmin only).
 * POST /users/admin/teachers
 */
export function createTeacher(
  data: AddTeacherInput
): Promise<IUser> {
  return apiClient
    .post<{ data: IUser }>('/users/admin/teachers', data)
    .then((res) => res.data.data)
}

/**
 * List all teachers (active/inactive).
 * GET /users/admin/teachers
 */
export function getAllTeachers(): Promise<IUser[]> {
  return apiClient
    .get<{ data: IUser[] }>('/users/admin/teachers')
    .then((res) => res.data.data)
}

/**
 * Toggle a teacher's active status.
 * PATCH /users/admin/teachers/:id/active
 */
export function toggleTeacherActive(
  id: string
): Promise<IUser> {
  return apiClient
    .patch<{ data: IUser }>(`/users/admin/teachers/${id}/active`)
    .then((res) => res.data.data)
}
