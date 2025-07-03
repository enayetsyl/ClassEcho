// src/types/user.types.ts

/**
 * Roles as defined in your backend schema
 
 */
export type UserRole = 'Admin' | 'SeniorAdmin' | 'Teacher' | 'Management'

/**
 * Core User shape returned by the API
 */
export interface IUser {
  _id: string
  name: string
  email: string
  roles: UserRole[]
  active: boolean

  // Flags
  mustChangePassword?: boolean

  // Optional profile fields
  phone?: string
  dateOfBirth?: string
  profileImageUrl?: string

  // Timestamps (ISO strings)
  createdAt?: string
  updatedAt?: string
}

/**
 * Payload for updating your own profile.
 * Only these fields are allowed server‐side.
 */
export interface UpdateProfileInput {
  name?: string
  phone?: string
  dateOfBirth?: string
  profileImageUrl?: string
}

/**
 * Payload for creating a teacher.
 * phone and dateOfBirth are optional per
 * addTeacherValidation 
 */
export interface AddTeacherInput {
  name: string
  email: string
  phone?: string
  dateOfBirth?: string
}
