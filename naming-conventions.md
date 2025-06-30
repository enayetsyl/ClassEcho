
# Naming Conventions Guide

_This guide ensures consistency across your codebase for both frontend (Next.js/React/TypeScript) and backend (Node.js/Express/MongoDB)._

---

## General Principles

- **Be consistent**: Always use the same pattern throughout the project.
- **Be descriptive**: Avoid abbreviations except common ones (`id`, `req`, `res`).
- **Reflect intent**: Names should clearly indicate their purpose.

---

## Backend (Node.js + Express + MongoDB)

| Item                 | Convention                  | Example                        |
|----------------------|----------------------------|--------------------------------|
| **Folders**          | kebab-case, lowercase      | `controllers/`, `models/`      |
| **Files**            | kebab-case, lowercase      | `user.controller.ts`           |
| **Models/Schemas**   | PascalCase (class/schema)  | `User`, `Video`, `ClassList`   |
| **Model Files**      | kebab-case, lowercase      | `user.model.ts`                |
| **Model Fields**     | camelCase                  | `createdAt`, `youtubeUrl`      |
| **Variables/Funcs**  | camelCase                  | `getUserById()`, `assignReviewer()` |
| **Constants**        | UPPER_SNAKE_CASE           | `JWT_SECRET`, `TOKEN_EXPIRY`   |
| **Classes**          | PascalCase                 | `UserService`, `VideoController` |
| **API Endpoints**    | RESTful, kebab-case, plural| `/admin/teachers`, `/videos/upload` |
| **Collections**      | plural, lowercase          | `users`, `videos`, `classes`   |
| **Schema Enums**     | lowercase/camelCase string | `"unassigned"`, `"assigned"`   |

---

## Frontend (Next.js, React, TypeScript, shadcn/UI, Tailwind)

| Item                 | Convention                  | Example                        |
|----------------------|----------------------------|--------------------------------|
| **Component Folders**| PascalCase or kebab-case   | `TeacherDashboard/`, `video-list/` |
| **Component Files**  | PascalCase or kebab-case   | `TeacherList.tsx`, `video-list.tsx` |
| **React Components** | PascalCase                 | `TeacherDashboard`, `VideoList`|
| **Props/Hooks**      | camelCase                  | `useAuth`, `onSubmit`          |
| **State Vars**       | camelCase                  | `isLoading`, `errorMsg`        |
| **CSS Classes**      | As per Tailwind CSS        | `className="w-full p-4"`       |

---

## Database

| Item                 | Convention                  | Example                        |
|----------------------|----------------------------|--------------------------------|
| **Collections**      | plural, lowercase          | `users`, `videos`, `classes`   |
| **Fields**           | camelCase                  | `mustChangePassword`, `roles`  |

---

## Special Cases

- **Roles**: `"Admin"`, `"SeniorAdmin"`, `"Teacher"`, `"Management"`
- **Status enums**: `"unassigned"`, `"assigned"`, `"reviewed"`, `"published"`

---

## Summary Table

| **Thing**            | **Convention**         | **Example**           |
|----------------------|-----------------------|-----------------------|
| Folder               | kebab-case, lowercase | `admin-panel/`        |
| File                 | kebab-case, lowercase | `video.service.ts`    |
| Model/Class          | PascalCase            | `User`, `Video`       |
| Function/Variable    | camelCase             | `getAllTeachers()`    |
| API Route            | kebab-case, plural    | `/admin/teachers`     |
| DB Collection        | plural, lowercase     | `videos`, `users`     |
| Schema field         | camelCase             | `assignedReviewer`    |
| React Component      | PascalCase            | `LoginPage`           |
| Constants            | UPPER_SNAKE_CASE      | `JWT_SECRET`          |

---

## Best Practices

- Avoid non-standard abbreviations.
- Prefer explicit, readable names (`assignedReviewer` > `assRev`).
- Keep file/folder structure modular (types, routes, controllers, services, models, validations per module).

---



---


