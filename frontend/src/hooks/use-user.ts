// src/hooks/use-user.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as userService from '@/services/user.service'
import {
  IUser,
  AddTeacherInput,
  UpdateProfileInput,
} from '@/types/user.types'

/**
 * 1) Fetch current user’s profile (GET /users/me/profile)
 */
export function useGetProfile() {
  return useQuery<IUser, Error>({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
  })
}

/**
 * 2) Update current user’s profile (PUT /users/me/profile)
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation<IUser, Error, UpdateProfileInput>({
    mutationFn: (data) => userService.updateProfile(data),
    onSuccess: (updated: IUser) => {
      queryClient.setQueryData(['profile'], updated)
    },
  })
}

/**
 * 3) Create a new teacher (POST /users/admin/teachers)
 */
export function useCreateTeacher() {
  const queryClient = useQueryClient()

  return useMutation<IUser, Error, AddTeacherInput>({
    mutationFn: (payload) => userService.createTeacher(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
    },
  })
}

/**
 * 4) List all teachers (GET /users/admin/teachers)
 */
export function useGetAllTeachers() {
  return useQuery<IUser[], Error>({
    queryKey: ['teachers'],
    queryFn: () => userService.getAllTeachers(),
  })
}

/**
 * 5) Toggle a teacher’s active status (PATCH /users/admin/teachers/:id/active)
 */
export function useToggleTeacherActive() {
  const queryClient = useQueryClient()

  return useMutation<IUser, Error, string>({
    mutationFn: (id: string) => userService.toggleTeacherActive(id),
    onSuccess: (updatedTeacher: IUser) => {
      queryClient.setQueryData<IUser[] | undefined>(
        ['teachers'],
        (old) =>
          old?.map((t) =>
            t._id === updatedTeacher._id ? updatedTeacher : t
          )
      )
    },
  })
}
