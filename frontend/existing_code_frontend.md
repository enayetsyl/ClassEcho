--- package.json ---

{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.1.1",
    "@radix-ui/react-checkbox": "^1.3.2",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.5",
    "@radix-ui/react-tooltip": "^1.2.7",
    "@tanstack/react-query": "^5.81.5",
    "axios": "^1.10.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "jwt-decode": "^4.0.0",
    "lucide-react": "^0.525.0",
    "next": "15.3.4",
    "next-themes": "^0.4.6",
    "postcss": "^8.5.6",
    "react": "^19.0.0",
    "react-day-picker": "^9.7.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.59.0",
    "recharts": "^3.0.2",
    "sonner": "^2.0.5",
    "tailwind-merge": "^3.3.1",
    "zod": "^3.25.67"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4.1.11",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.3.4",
    "tailwindcss": "^4.1.11",
    "tw-animate-css": "^1.3.4",
    "typescript": "^5"
  }
}


--- postcss.config.mjs ---

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;

--- tsconfig.json ---

{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}


--- src/app/dashboard/admin/classes/class-list/page.tsx ---

// frontend/src/app/dashboard/admin/classes/class-list/page.tsx
"use client";

import React, { useState } from "react";
import { useGetAllClassesQuery, useDeleteClassMutation, useUpdateClassMutation } from "@/hooks/use-class";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { IClass } from "@/types/class.types";
import Link from "next/link";

const formSchema = z.object({
  name: z.string().min(1, "Class name cannot be empty"),
});
type FormValues = z.infer<typeof formSchema>;

export default function ClassListPage() {
  // 1️⃣ Load classes
  const { data: classes = [], isLoading } = useGetAllClassesQuery();

  // 2️⃣ Mutations
  const deleteClass = useDeleteClassMutation();
  const updateClass = useUpdateClassMutation();

  // 3️⃣ State for edit dialog
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState<IClass | null>(null);

  // 4️⃣ Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  // Open dialog and populate form
  function onEditClick(cls: IClass) {
    setCurrentClass(cls);
    form.reset({ name: cls.name });
    setIsEditOpen(true);
  }

  // Close dialog
  function closeDialog() {
    setIsEditOpen(false);
    setCurrentClass(null);
  }

  // Handle form submit
  function onSubmit(values: FormValues) {
    if (currentClass) {
      updateClass.mutate(
        { id: currentClass._id, data: values },
        { onSuccess: closeDialog }
      );
    }
  }

  if (isLoading) return <div>Loading...</div>;

  return (
     <div className="p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Manage Classes</h1>
        <Link href="/dashboard/admin/classes/create-class">
          <Button className="w-full md:w-auto">Add Class</Button>
        </Link>
      </div>

 <div className="overflow-x-auto">
      <Table className="min-w-[480px]">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((cls) => (
            <TableRow key={cls._id}>
              <TableCell>{cls.name}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditClick(cls)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  
                  onClick={() => {
                    if (
                      window.confirm(`Delete class “${cls.name}”?`)
                    ) {
                      deleteClass.mutate(cls._id);
                    }
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
</div>
      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateClass.isPending}>
                  {updateClass.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


--- src/app/dashboard/admin/classes/create-class/page.tsx ---

"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateClassMutation } from "@/hooks/use-class";

const formSchema = z.object({
  name: z.string().min(1, "Class name cannot be empty"),
});

type FormValues = z.infer<typeof formSchema>;

const CreateClassPage = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });
  const { mutate, isPending } = useCreateClassMutation();

  const onSubmit = (values: FormValues) => {
    mutate(values);
    form.reset();
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter class name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Class"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateClassPage;


--- src/app/dashboard/admin/sections/create-section/page.tsx ---

"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateSectionMutation } from "@/hooks/use-section";

const formSchema = z.object({
  name: z.string().min(1, "Section name cannot be empty"),
});

type FormValues = z.infer<typeof formSchema>;

const CreateSectionPage = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });
  const { mutate, isPending } = useCreateSectionMutation();

  const onSubmit = (values: FormValues) => {
    mutate(values);
    form.reset();
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-md">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 px-5"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter section name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Section"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateSectionPage;


--- src/app/dashboard/admin/sections/section-list/page.tsx ---

"use client";

import React, { useState } from "react";
import {
  useGetAllSectionsQuery,
  useDeleteSectionMutation,
  useUpdateSectionMutation,
} from "@/hooks/use-section";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ISection } from "@/types/section.types";
import Link from "next/link";

const formSchema = z.object({
  name: z.string().min(1, "Section name cannot be empty"),
});
type FormValues = z.infer<typeof formSchema>;

export default function SectionListPage() {
  const { data: sections = [], isLoading } = useGetAllSectionsQuery();
  const deleteSection = useDeleteSectionMutation();
  const updateSection = useUpdateSectionMutation();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<ISection | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  function onEditClick(sec: ISection) {
    setCurrentSection(sec);
    form.reset({ name: sec.name });
    setIsEditOpen(true);
  }

  function closeDialog() {
    setIsEditOpen(false);
    setCurrentSection(null);
  }

  function onSubmit(values: FormValues) {
    if (currentSection) {
      updateSection.mutate(
        { id: currentSection._id, data: values },
        { onSuccess: closeDialog }
      );
    }
  }

  if (isLoading) return <div>Loading...</div>;

  return (
     <div className="p-4 space-y-6">
       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Manage Classes</h1>
        <Link href="/dashboard/admin/sections/create-section">
          <Button className="w-full md:w-auto">Add Section</Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
           <Table className="min-w-[480px]">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.map((sec) => (
            <TableRow key={sec._id}>
              <TableCell>{sec.name}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditClick(sec)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(`Delete section “${sec.name}”?`)) {
                      deleteSection.mutate(sec._id);
                    }
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
</div>
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => open || closeDialog()}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateSection.isPending}>
                  {updateSection.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


--- src/app/dashboard/admin/subjects/create-subject/page.tsx ---

"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateSubjectMutation } from "@/hooks/use-subject";

const formSchema = z.object({
  name: z.string().min(1, "Subject name cannot be empty"),
});

type FormValues = z.infer<typeof formSchema>;

const CreateSubjectPage = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });
  const { mutate, isPending } = useCreateSubjectMutation();

  const onSubmit = (values: FormValues) => {
    mutate(values);
    form.reset();
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-md">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 px-5"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter subject name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Subject"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateSubjectPage;



--- src/app/dashboard/admin/subjects/subject-list/page.tsx ---

"use client";

import React, { useState } from "react";
import {
  useGetAllSubjectsQuery,
  useDeleteSubjectMutation,
  useUpdateSubjectMutation,
} from "@/hooks/use-subject";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ISubject } from "@/types/subject.types";
import Link from "next/link";

const formSchema = z.object({
  name: z.string().min(1, "Subject name cannot be empty"),
});
type FormValues = z.infer<typeof formSchema>;

export default function SubjectListPage() {
  const { data: subjects = [], isLoading } = useGetAllSubjectsQuery();
  const deleteSubject = useDeleteSubjectMutation();
  const updateSubject = useUpdateSubjectMutation();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<ISubject | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  function onEditClick(subj: ISubject) {
    setCurrentSubject(subj);
    form.reset({ name: subj.name });
    setIsEditOpen(true);
  }

  function closeDialog() {
    setIsEditOpen(false);
    setCurrentSubject(null);
  }

  function onSubmit(values: FormValues) {
    if (currentSubject) {
      updateSubject.mutate(
        { id: currentSubject._id, data: values },
        { onSuccess: closeDialog }
      );
    }
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Manage Subjects</h1>
        <Link href="/dashboard/admin/subjects/create-subject">
          <Button className="w-full md:w-auto">Add Subject</Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
            <Table className="min-w-[480px]">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.map((subj) => (
            <TableRow key={subj._id}>
              <TableCell>{subj.name}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditClick(subj)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(`Delete subject “${subj.name}”?`)) {
                      deleteSubject.mutate(subj._id);
                    }
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
</div>
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => open || closeDialog()}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateSubject.isPending}>
                  {updateSubject.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


--- src/app/dashboard/admin/teachers/create-teacher/page.tsx ---

"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/use-user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const CreateTeacher = () => {
  const { useCreateTeacher } = useUser();
  const { mutate, isPending } = useCreateTeacher();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate(values);
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Teacher</CardTitle>
        <CardDescription>
          Fill out the form below to create a new teacher.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter teacher name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter teacher email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter teacher password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isPending} type="submit">
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateTeacher;

--- src/app/dashboard/admin/teachers/teacher-list/page.tsx ---

"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Truck } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { useUser } from "@/hooks/use-user";
import { TUser } from "@/types/user.types";

const TeacherList = () => {
  const { useGetAllTeachers } = useUser();
  const { data } = useGetAllTeachers();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            Recent transactions from your store.
          </CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button size="sm" variant="outline" className="h-7 gap-1 text-sm">
            <Truck className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Sync</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.data?.map((item: TUser) => (
              <TableRow key={item._id}>
                <TableCell>
                  <div className="font-medium">{item.name}</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    {item.email}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">Sale</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant="secondary">
                    Fulfilled
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  2023-06-23
                </TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-10</strong> of <strong>32</strong> products
        </div>
        <Pagination className="mx-0 w-fit">
          <PaginationContent>
            <PaginationItem>
              <Button size="icon" variant="outline" className="h-6 w-6">
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="sr-only">Previous Order</span>
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button size="icon" variant="outline" className="h-6 w-6">
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="sr-only">Next Order</span>
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  );
};

export default TeacherList;

--- src/app/dashboard/change-password/page.tsx ---

// src/app/dashboard/change-password/page.tsx

'use client'

import { FormEvent, useState } from 'react'
import { useChangePassword } from '@/hooks/use-auth'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/route/ProtectedRoute'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const { mutate, isPending } = useChangePassword()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    mutate(
      { oldPassword, newPassword },
      {
        onSuccess: () => {
          toast.success('Password changed');
          router.push('/dashboard/profile');
        },
        onError: (err: Error) => toast.error(err.message),
      }
    )
  }

  return (
    <ProtectedRoute>
      <Card className="max-w-md mx-auto mt-20">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your current password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="old-password">Current Password</Label>
              <Input
                id="old-password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <CardFooter className="p-0">
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? 'Updating…' : 'Change Password'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </ProtectedRoute>
  )
}


--- src/app/forgot-password/page.tsx ---

"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
});

const ForgotPassword = () => {
  const { useForgotPassword } = useAuth();
  const { mutate, isPending } = useForgotPassword();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate(values);
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isPending} type="submit">
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ForgotPassword;

--- src/app/dashboard/layout.tsx ---

"use client";
import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import NavBar from "@/components/ui/shared/NavBar";
import ProtectedRoute from "@/route/ProtectedRoute";

const queryClient = new QueryClient();

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProtectedRoute>
          <main>
            <NavBar />
            <div className="p-4">{children}</div>
          </main>
          <Toaster />
        </ProtectedRoute>
      </AuthProvider>
    </QueryClientProvider>
  );
}

--- src/app/dashboard/profile/page.tsx ---

'use client'

import { useState, FormEvent } from 'react'
import { useGetProfile, useUpdateProfile } from '@/hooks/use-user'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ProtectedRoute } from '@/route/ProtectedRoute'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: profile, isPending } = useGetProfile()
  const { mutate: update, isPending: isUpdating } = useUpdateProfile()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')

 

  // when profile loads, seed form
  if (profile && name === '') {
    setName(profile.name)
    setPhone(profile.phone ?? '')
    setDateOfBirth(profile.dateOfBirth?.slice(0,10) ?? '')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    update(
      { name, phone, dateOfBirth },
      {
        onSuccess: (updated) => {
          toast.success('Profile updated')
          setName(updated.name)
          setPhone(updated.phone ?? '')
          setDateOfBirth(updated.dateOfBirth?.slice(0,10) ?? '')
        },
        onError: (err: Error) => toast.error(err.message),
      }
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex justify-center p-4">
      <Card className="w-full max-w-lg mt-10">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Edit your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <p>Loading…</p>
          ) : (
            <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <CardFooter className="p-0">
                <Button type="submit" disabled={isUpdating} className="w-full">
                  {isUpdating ? 'Saving…' : 'Save Profile'}
                </Button>
              </CardFooter>
            </form>
            <div className="mt-6 space-y-3 text-center">
                <Link href="/dashboard/change-password" className="text-sm text-primary hover:underline">
                  Change Password
                </Link>
              
              </div>
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </ProtectedRoute>
  )
}


--- src/app/reset-password/page.tsx ---

"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const ResetPassword = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { useResetPassword } = useAuth();
  const { mutate, isPending } = useResetPassword();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate({ ...values, token });
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Enter your new password.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your new password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isPending} type="submit">
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ResetPassword;

--- src/app/favicon.ico ---

(binary)

--- src/app/globals.css ---

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

--- src/app/layout.tsx ---

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen font-sans", inter.className)}>
        {children}
      </body>
    </html>
  );
}

--- src/app/login/page.tsx ---

// src/app/login/page.tsx
'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLogin } from '@/hooks/use-auth'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { mutate: login, isPending, isError, error } = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    login(
      { email, password },
      {
        onSuccess: () => {
          router.push('/dashboard/profile')
        },
      }
    )
  }

  return (
    <div className='px-5'>
      <Card className="max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your email and password to continue
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isError && (
          <p className="mb-4 text-sm text-red-600">
            {/* error is typed as Error by our hook */}
            {(error as Error).message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="text-sm text-right">
            <Link href="/forgot-password" className="text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>

          <CardFooter className="p-0">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Signing in…' : 'Sign In'}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
    </div>
  )
}


--- src/app/page.tsx ---

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Link href="/login">Login</Link>
    </main>
  );
}

--- src/components/ui/badge.tsx ---

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

--- src/components/ui/button.tsx ---

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

--- src/components/ui/calendar.tsx ---

"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

--- src/components/ui/card.tsx ---

import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};

--- src/components/ui/checkbox.tsx ---

"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };

--- src/components/ui/dialog.tsx ---

"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

--- src/components/ui/form.tsx ---

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};

--- src/components/ui/input.tsx ---

import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

--- src/components/ui/label.tsx ---

"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };

--- src/components/ui/pagination.tsx ---

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};

--- src/components/ui/select.tsx ---

"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};

--- src/components/ui/shared/NavBar.tsx ---

'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useLogout } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

interface NavItem {
  href: string
  label: string
  roles: string[]
}

export function NavBar() {
  const { user } = useAuth()
  const { mutate: logout, isPending } = useLogout()
  const pathname = usePathname()

  // Simplest roles extraction
  const roles = user?.roles ?? []

  const dashboardItems: NavItem[] = [
    { href: '/dashboard/admin/classes/class-list', label: 'Class List', roles: ['SeniorAdmin','Management'] },
    { href: '/dashboard/admin/sections/section-list', label: 'Sections',    roles: ['SeniorAdmin','Management'] },
    { href: '/dashboard/admin/subjects/subject-list', label: 'Subjects',   roles: ['SeniorAdmin','Management'] },
    { href: '/dashboard/admin/teachers/teacher-list', label: 'Teachers',   roles: ['SeniorAdmin','Management'] },
    { href: '/dashboard/admin/videos',          label: 'All Videos',    roles: ['SeniorAdmin','Management','Admin'] },
    { href: '/dashboard/admin/videos/upload-video', label: 'Upload Video', roles: ['SeniorAdmin','Management','Admin'] },
    { href: '/dashboard/admin/videos/feedback',     label: 'My Feedback',  roles: ['Teacher','SeniorAdmin','Management'] },
    { href: '/dashboard/admin/videos/reviewer',     label: 'To Review',    roles: ['Teacher','SeniorAdmin','Management'] },
  ]

  const allowedItems = dashboardItems.filter(item =>
    item.roles.some(role => roles.includes(role))
  )

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-100">
      <div className="flex items-center space-x-4">
  

        {user && (
          <>
            {/* Desktop-only */}
            <div className="hidden md:flex space-x-2">
              <Link href="/dashboard/profile">
                <Button variant={pathname === '/dashboard' ? 'default' : 'outline'}>
                  Profile
                </Button>
              </Link>
              {allowedItems.map(item => (
                <Link href={item.href} key={item.href}>
                  <Button variant={pathname.startsWith(item.href) ? 'default' : 'outline'}>
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Mobile-only */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-4 bg-green-500">
                <div className="flex flex-col space-y-4">
                  <Link href="/dashboard/profile">
                    <Button
                      variant={pathname === '/dashboard' ? 'default' : 'outline'}
                      className="w-full text-left"
                    >
                      Profile
                    </Button>
                  </Link>
                  {allowedItems.map(item => (
                    <Link href={item.href} key={item.href}>
                      <Button
                        variant={pathname.startsWith(item.href) ? 'default' : 'outline'}
                        className="w-full text-left"
                      >
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span className="hidden sm:inline">Hello, {user.name}</span>
            <Button
              variant="link"
              onClick={() => logout()}
              disabled={isPending}
            >
              {isPending ? 'Logging out…' : 'Logout'}
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
        )}
      </div>
    </nav>
  )
}


--- src/components/ui/skeleton.tsx ---

import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };

--- src/components/ui/sonner.tsx ---

"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

--- src/components/ui/switch.tsx ---

"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
        className
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };

--- src/components/ui/table.tsx ---

import * as React from "react";

import { cn } from "@/lib/utils";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};

--- src/components/ui/textarea.tsx ---

import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };

--- src/components/ui/tooltip.tsx ---

"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

--- src/context/AuthContext.tsx ---

'use client'

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react'
import {jwtDecode} from 'jwt-decode'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface DecodedToken {
  name: string
  userId: string
  role?: string
  roles?: string[]
  exp?: number
  iat?: number
}

interface User {
  name: string
  userId: string
  roles: string[]
}

interface AuthContextType {
  token: string | null
  user: User | null
  loading: boolean
  login: (token: string, userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
})

const queryClient = new QueryClient()

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  const [loading, setLoading] = useState<boolean>(true)

 useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken) {
      setToken(storedToken)
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (err) {
          console.error('Failed to parse stored user', err)
          localStorage.removeItem('user')
          setUser(null)
        }
      } else {
        try {
          const decoded = jwtDecode<DecodedToken>(storedToken)
          const roles = decoded.roles ?? (decoded.role ? [decoded.role] : [])
          setUser({ userId: decoded.userId, roles, name: decoded.name })
        } catch (err) {
          console.error('Invalid token', err)
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        }
      }
    }
    setLoading(false)
  }, [])

  const login = (newToken: string, userData: User) => {
  localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <QueryClientProvider client={queryClient}>
      
    <AuthContext.Provider
      value={{ token, user, loading, login, logout }}
      >
      {children}
    </AuthContext.Provider>
      </QueryClientProvider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}


--- src/hooks/use-auth.ts ---

import { authService } from "@/services/auth.service";
import {
  TChangePassword,
  TForgotPassword,
  TLogin,
  TResetPassword,
} from "@/types/auth.types";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthContext } from "@/context/AuthContext";

export const useAuth = () => {
  const { login: loginContext, logout: logoutContext } = useAuthContext();
  const router = useRouter();
  const useLogin = () => {
    return useMutation({
      mutationFn: (data: TLogin) => authService.login(data),
      onSuccess: (res) => {
        toast.success("Login successful");
        loginContext(res.data.data.token);
        router.push("/dashboard/admin/teachers");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  const useLogout = () => {
    return useMutation({
      mutationFn: () => authService.logout(),
      onSuccess: () => {
        toast.success("Logout successful");
        logoutContext();
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  const useForgotPassword = () => {
    return useMutation({
      mutationFn: (data: TForgotPassword) => authService.forgotPassword(data),
      onSuccess: () => {
        toast.success("Forgot password email sent");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  const useResetPassword = () => {
    return useMutation({
      mutationFn: (data: TResetPassword) => authService.resetPassword(data),
      onSuccess: () => {
        toast.success("Password reset successful");
        router.push("/login");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  const useChangePassword = () => {
    return useMutation({
      mutationFn: (data: TChangePassword) => authService.changePassword(data),
      onSuccess: () => {
        toast.success("Password changed successful");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  return {
    useLogin,
    useLogout,
    useForgotPassword,
    useResetPassword,
    useChangePassword,
  };
};

--- src/hooks/use-class.ts ---

import { classService } from "@/services/class.service";
import { TCreateClass } from "@/types/class.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useClass = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["class"],
    queryFn: () => classService.getAllClass(),
  });

  const useCreateClass = () => {
    return useMutation({
      mutationFn: (data: TCreateClass) => classService.createClass(data),
      onSuccess: () => {
        toast.success("Class created successfully");
        queryClient.invalidateQueries({ queryKey: ["class"] });
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  return { data, isLoading, useCreateClass };
};

--- src/hooks/use-section.ts ---

import { sectionService } from "@/services/section.service";
import { TCreateSection } from "@/types/section.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSection = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["section"],
    queryFn: () => sectionService.getAllSection(),
  });

  const useCreateSection = () => {
    return useMutation({
      mutationFn: (data: TCreateSection) => sectionService.createSection(data),
      onSuccess: () => {
        toast.success("Section created successfully");
        queryClient.invalidateQueries({ queryKey: ["section"] });
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  return { data, isLoading, useCreateSection };
};

--- src/hooks/use-subject.ts ---

import { subjectService } from "@/services/subject.service";
import { TCreateSubject } from "@/types/subject.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSubject = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["subject"],
    queryFn: () => subjectService.getAllSubject(),
  });

  const useCreateSubject = () => {
    return useMutation({
      mutationFn: (data: TCreateSubject) => subjectService.createSubject(data),
      onSuccess: () => {
        toast.success("Subject created successfully");
        queryClient.invalidateQueries({ queryKey: ["subject"] });
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  return { data, isLoading, useCreateSubject };
};

--- src/hooks/use-user.ts ---

import { userService } from "@/services/user.service";
import { TCreateTeacher, TUpdateProfile } from "@/types/user.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUser = () => {
  const queryClient = useQueryClient();
  const useGetAllTeachers = () => {
    return useQuery({
      queryKey: ["teachers"],
      queryFn: () => userService.getAllTeachers(),
    });
  };

  const useCreateTeacher = () => {
    return useMutation({
      mutationFn: (data: TCreateTeacher) => userService.createTeacher(data),
      onSuccess: () => {
        toast.success("Teacher created successfully");
        queryClient.invalidateQueries({ queryKey: ["teachers"] });
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  const useGetProfile = () => {
    return useQuery({
      queryKey: ["profile"],
      queryFn: () => userService.getProfile(),
    });
  };

  const useUpdateProfile = () => {
    return useMutation({
      mutationFn: (data: TUpdateProfile) => userService.updateProfile(data),
      onSuccess: () => {
        toast.success("Profile updated successfully");
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  return {
    useGetAllTeachers,
    useCreateTeacher,
    useGetProfile,
    useUpdateProfile,
  };
};

--- src/lib/api-client.ts ---

import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;

--- src/lib/utils.ts ---

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

--- src/route/ProtectedRoute.tsx ---

"use client";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

--- src/services/auth.service.ts ---

import apiClient from "@/lib/api-client";
import {
  TChangePassword,
  TForgotPassword,
  TLogin,
  TResetPassword,
} from "@/types/auth.types";

export const authService = {
  login: (data: TLogin) => {
    return apiClient.post("/auth/login", data);
  },
  logout: () => {
    return apiClient.post("/auth/logout");
  },
  forgotPassword: (data: TForgotPassword) => {
    return apiClient.post("/auth/forgot-password", data);
  },
  resetPassword: (data: TResetPassword) => {
    return apiClient.post(`/auth/reset-password`, data);
  },
  changePassword: (data: TChangePassword) => {
    return apiClient.post("/auth/change-password", data);
  },
};

--- src/services/class.service.ts ---

import apiClient from "@/lib/api-client";
import { TCreateClass } from "@/types/class.types";

export const classService = {
  getAllClass: () => {
    return apiClient.get("/class");
  },
  createClass: (data: TCreateClass) => {
    return apiClient.post("/class", data);
  },
};

--- src/services/section.service.ts ---

import apiClient from "@/lib/api-client";
import { TCreateSection } from "@/types/section.types";

export const sectionService = {
  getAllSection: () => {
    return apiClient.get("/section");
  },
  createSection: (data: TCreateSection) => {
    return apiClient.post("/section", data);
  },
};

--- src/services/subject.service.ts ---

import apiClient from "@/lib/api-client";
import { TCreateSubject } from "@/types/subject.types";

export const subjectService = {
  getAllSubject: () => {
    return apiClient.get("/subject");
  },
  createSubject: (data: TCreateSubject) => {
    return apiClient.post("/subject", data);
  },
};

--- src/services/user.service.ts ---

import apiClient from "@/lib/api-client";
import { TCreateTeacher, TUpdateProfile } from "@/types/user.types";

export const userService = {
  getAllTeachers: () => {
    return apiClient.get("/user/teachers");
  },
  createTeacher: (data: TCreateTeacher) => {
    return apiClient.post("/user/create-teacher", data);
  },
  getProfile: () => {
    return apiClient.get("/user/profile");
  },
  updateProfile: (data: TUpdateProfile) => {
    return apiClient.patch("/user/update-profile", data);
  },
};

--- src/types/auth.types.ts ---

export type TLogin = {
  email?: string;
  password?: string;
};

export type TForgotPassword = {
  email?: string;
};

export type TResetPassword = {
  password?: string;
  token?: string | null;
};

export type TChangePassword = {
  oldPassword?: string;
  newPassword?: string;
};

--- src/types/class.types.ts ---

export type TClass = {
  _id: string;
  name: string;
  numeric: number;
};

export type TCreateClass = {
  name: string;
  numeric: number;
};

--- src/types/error.types.ts ---

export type TError = {
  message: string;
  status: number;
  stack: string;
};

--- src/types/section.types.ts ---

export type TSection = {
  _id: string;
  name: string;
  class: string;
};

export type TCreateSection = {
  name: string;
  class: string;
};

--- src/types/subject.types.ts ---

export type TSubject = {
  _id: string;
  name: string;
  code: number;
};

export type TCreateSubject = {
  name: string;
  code: number;
};

--- src/types/user.types.ts ---

export type TUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

export type TCreateTeacher = {
  name?: string;
  email?: string;
  password?: string;
};

export type TUpdateProfile = {
  name?: string;
  email?: string;
}

---src/app/dashboard/admin/videos/page.tsx  ---

// src/app/dashboard/admin/videos/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetAllVideosQuery,
  useAssignReviewerMutation,
  usePublishVideoMutation,
} from "@/hooks/use-video";
import { useGetAllTeachers } from "@/hooks/use-user";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function VideoListPage() {
  const router = useRouter();

  type FilterStatus =
    | "all"
    | "unassigned"
    | "assigned"
    | "reviewed"
    | "published";
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [dialogVideoId, setDialogVideoId] = useState<string | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<string>("");

  // 1️⃣ Fetch videos (automatically typed)
  const params =
    statusFilter === "all"
      ? {}
      : ({ status: statusFilter } as { status: Exclude<FilterStatus, "all"> });

  const { data: videos = [], isFetching } = useGetAllVideosQuery(params);

  // 2️⃣ Fetch teachers (for the Assign dialog)
  const { data: teachers = [] } = useGetAllTeachers();
 
  // 3️⃣ Mutations
  const assignReviewer = useAssignReviewerMutation();

  const publishVideo = usePublishVideoMutation();

  return (
   <div className="p-4">
     <Card className="my-8">
      <CardHeader>
        <CardTitle>All Class Recordings</CardTitle>
        <CardDescription>
          Filter, assign reviewers, and publish feedback.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filter bar */}
        <div className="flex items-center space-x-4 mb-4">
          <Select
            value={statusFilter}
            onValueChange={(val: string) =>
              setStatusFilter(val as FilterStatus)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              /* React-Query refetch happens automatically on statusFilter change */
            }}
          >
            Refresh
          </Button>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reviewer</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((v) => (
              <TableRow key={v._id}>
                <TableCell>{v.class.name}</TableCell>
                <TableCell>{v.teacher.name}</TableCell>
                <TableCell>{new Date(v.date).toLocaleDateString()}</TableCell>
                <TableCell>{v.status}</TableCell>
                <TableCell>{v?.assignedReviewer?.name ?? "—"}</TableCell>
                <TableCell className="text-right space-x-2">
                  {/* Assign Reviewer */}
                  {v.status === "unassigned" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">Assign</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Assign Reviewer</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <Select
                          value={dialogVideoId === v._id ? selectedReviewer : ""}
                            onValueChange={setSelectedReviewer}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Reviewer" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {teachers.map((t) => (
                                <SelectItem key={t._id} value={t._id}>
                                  {t.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={() =>
                              assignReviewer.mutate(
                                { id: v._id!, reviewerId: selectedReviewer },
                                { onSuccess: () => setDialogVideoId(null) }
                              )
                            }
                            disabled={!selectedReviewer || assignReviewer.isPending}
                          >
                            {assignReviewer.isPending ? "Assigning…" : "Assign"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  {/* Publish Video */}
                  {v.status === "reviewed" && (
                    <Button
                      size="sm"
                      onClick={() => publishVideo.mutate(v._id!)}
                      disabled={publishVideo.isPending}
                    >
                      {publishVideo.isPending ? "Publishing…" : "Publish"}
                    </Button>
                  )}

                  {/* View Details */}
                  <Button
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/admin/videos/${v._id}`)
                    }
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {isFetching && <div className="text-center py-4">Loading…</div>}
      </CardContent>
    </Card>
   </div>
  );
}


---src/app/dashboard/admin/videos/[videoId]/page.tsx  ---

"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetVideoQuery } from "@/hooks/use-video";

export default function VideoDetailPage() {
const router = useRouter();
  const params = useParams();

  // normalize ParamValue (string | string[] | undefined) → string | undefined
  const rawId = params.videoId;
  const videoId = Array.isArray(rawId) ? rawId[0] : rawId;

  // now videoId is `string | undefined`, matching your hook signature
  const { data: video, isLoading } = useGetVideoQuery(videoId);

 
  if (isLoading) return <div>Loading…</div>;
  if (!videoId)  return <div className="text-center py-8">Invalid ID.</div>;
  if (!video)    return <div className="text-center py-8">Video not found.</div>;

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle>Video Detail</CardTitle>
        <CardDescription>View metadata, embedded video, and status.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <iframe
          className="w-full aspect-video"
          src={video.youtubeUrl.replace("youtu.be","www.youtube.com/embed")}
          allowFullScreen
        />
        <div><strong>Class:</strong> {video.class.name}</div>
        <div><strong>Teacher:</strong> {video.teacher.name}</div>
        <div><strong>Date:</strong> {new Date(video.date).toLocaleDateString()}</div>
        <div><strong>Status:</strong> {video.status}</div>
        {video.review && (
          <>
            <h3 className="font-semibold">Reviewer Feedback:</h3>
            <p><strong>Class Mgmt:</strong> {video.review.classManagement}</p>
            <p><strong>Subject Knowledge:</strong> {video.review.subjectKnowledge}</p>
            <p><strong>Other:</strong> {video.review.otherComments}</p>
          </>
        )}
        {video.teacherComment && (
          <>
            <h3 className="font-semibold">Teacher Comment:</h3>
            <p>{video.teacherComment.comment}</p>
          </>
        )}
        <Button onClick={() => router.back()}>Back</Button>
      </CardContent>
    </Card>
  );
}


---src/app/dashboard/admin/videos/feedback/page.tsx  ---

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useGetTeacherFeedbackQuery } from "@/hooks/use-video";

export default function TeacherFeedbackList() {
  const router = useRouter();
    const {
    data: videos = [],
    isLoading,
    isError,
  } = useGetTeacherFeedbackQuery();

  if (isLoading) {
    return (
      <Card className="my-8">
        <CardContent>Loading feedback…</CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="my-8">
        <CardContent>Failed to load feedback.</CardContent>
      </Card>
    );
  }

  return (
    <div className="px-5">
      <Card className="my-8">
      <CardHeader>
        <CardTitle>My Feedback</CardTitle>
        <CardDescription>All published reviews of your classes</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Reviewer</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map(v => (
              <TableRow key={v._id}>
                <TableCell>{v.class.name}</TableCell>
                <TableCell>{new Date(v.date).toLocaleDateString()}</TableCell>
                <TableCell>{v.assignedReviewer?.name}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => router.push(`/dashboard/admin/videos/feedback/${v._id}`)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </div>
  );
}



---src/app/dashboard/admin/videos/feedback/[videoId]/page.tsx  ---

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAddTeacherCommentMutation, useGetVideoQuery } from "@/hooks/use-video";

export default function TeacherFeedbackDetail() {
    const { videoId: rawVideoId } = useParams();
  // 1️⃣ Normalize videoId into a string | undefined
  const videoId = Array.isArray(rawVideoId) ? rawVideoId[0] : rawVideoId

   const router = useRouter();
  const qc = useQueryClient();

  
  const { data: video, isPending, isError } = useGetVideoQuery(videoId);

 
  const [comment, setComment] = useState(video?.teacherComment?.comment||"");
  useEffect(() => {
    if (video?.teacherComment?.comment) {
      setComment(video.teacherComment.comment);
    }
  }, [video]);
   const addComment = useAddTeacherCommentMutation();

  if (isPending) {
    return (
      <Card className="my-8">
        <CardContent>Loading feedback…</CardContent>
      </Card>
    );
  }

  if (isError || !video) {
    return (
      <Card className="my-8">
        <CardContent>Failed to load feedback.</CardContent>
      </Card>
    );
  }
  return (
   <div className="px-5">
     <Card className="my-8">
      <CardHeader>
        <CardTitle>Review Feedback</CardTitle>
        <CardDescription>Your peer’s feedback & add your response</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <iframe
          className="w-full aspect-video"
          src={video.youtubeUrl.replace("youtu.be","www.youtube.com/embed")}
          allowFullScreen
        />
        <h3 className="font-semibold">Peer Feedback</h3>
        <p className="whitespace-pre-wrap" ><strong>Class Mgmt:</strong> {video.review?.classManagement}</p>
        <p className="whitespace-pre-wrap"><strong>Subject Knowledge:</strong> {video.review?.subjectKnowledge}</p>
        <p className="whitespace-pre-wrap"><strong>Other:</strong> {video.review?.otherComments}</p>

        <h3 className="font-semibold">Your Comment</h3>
        <Textarea value={comment} onChange={(e) => setComment(e.target.value)} />
          <Button
          onClick={() =>
            addComment.mutate(
              { id: videoId!, data: { comment } },
              {
                onSuccess: () => {
                 
                  qc.invalidateQueries({ queryKey: ["video", videoId] });
                  router.back();
                },
              }
            )
          }
        >
          {addComment.isPending ? "Saving…" : "Save Comment"}
        </Button>
          <Button variant="ghost" onClick={() => router.back()}>
          Back
        </Button>
      </CardContent>
    </Card>
   </div>
  );
}


---src/app/dashboard/admin/videos/reviewer/page.tsx  ---

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {  useGetAssignedVideosQuery } from "@/hooks/use-video";

export default function ReviewerDashboard() {
  const router = useRouter();
  // 1️⃣ Use the hook with params for pending reviews
 const { data: videos = [], isLoading, isError } = useGetAssignedVideosQuery();


  if (isLoading) {
    return (
      <Card className="my-8">
        <CardContent>Loading pending reviews…</CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="my-8">
        <CardContent>Failed to load pending reviews.</CardContent>
      </Card>
    );
  }


  return (
    <div className="px-5">
      <Card className="my-8">
      <CardHeader>
        <CardTitle>Pending Reviews</CardTitle>
        <CardDescription>Videos assigned to you for review</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map(v => (
              <TableRow key={v._id}>
                <TableCell>{v.class.name}</TableCell>
                <TableCell>{v.teacher.name}</TableCell>
                <TableCell>{new Date(v.date).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => router.push(`/dashboard/admin/videos/reviewer/${v._id}`)}>
                    Review Now
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </div>
  );
}


---src/app/dashboard/admin/videos/reviewer/[videoId]/page.tsx  ---

"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {  useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // assume you have this or use Input
import { useGetVideoQuery, useSubmitReviewMutation } from "@/hooks/use-video";

export default function ReviewPage() {
   const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();

   const rawId = params.videoId;
     const videoId = Array.isArray(rawId) ? rawId[0] : rawId;

  const { data: video } = useGetVideoQuery(videoId!);

  const { mutate: submitReview, isPending } = useSubmitReviewMutation();

  const [classMg, setClassMg] = useState("");
  const [subKnow, setSubKnow] = useState("");
  const [other, setOther] = useState("");

const handleSubmit = () => {
    submitReview(
      {
        id: videoId!,
        data: {
          classManagement: classMg,
          subjectKnowledge: subKnow,
          otherComments: other,
        },
      },
      {
        onSuccess: () => {
          // ─── 2. Invalidate using the object form ───────────────────────────────
          qc.invalidateQueries({ queryKey: ["pendingReviews"] });
          router.push("/dashboard/admin/videos/reviewer");
        },
      }
    );
  };


  return (
   <div className="px-5">
     <Card className="my-8">
      <CardHeader>
        <CardTitle>Review Class Recording</CardTitle>
        <CardDescription>Provide feedback in three areas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <iframe
          className="w-full aspect-video"
          src={video?.youtubeUrl.replace("youtu.be","www.youtube.com/embed")}
          allowFullScreen
        />
        <div>
          <label className="block font-semibold">Class Management</label>
          <Textarea value={classMg} onChange={e=>setClassMg(e.target.value)} />
        </div>
        <div>
          <label className="block font-semibold">Subject Knowledge</label>
          <Textarea value={subKnow} onChange={e=>setSubKnow(e.target.value)} />
        </div>
        <div>
          <label className="block font-semibold">Other Comments</label>
          <Textarea value={other} onChange={e=>setOther(e.target.value)} />
        </div>
       <Button 
       variant="default"
       onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Submitting…" : "Submit Feedback"}
        </Button>
      </CardContent>
    </Card>
   </div>
  );
}



---src/app/dashboard/admin/videos/upload-video/page.tsx  ---

// src/app/dashboard/admin/upload-video/page.tsx
"use client";

import React, { useState, useRef } from "react";
import Script from "next/script";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { useGetAllTeachers } from "@/hooks/use-user";
import { useGetAllClassesQuery } from "@/hooks/use-class";
import { useGetAllSectionsQuery } from "@/hooks/use-section";
import { useGetAllSubjectsQuery } from "@/hooks/use-subject";
import { TokenClient } from "@/types/google-client";


const UploadVideoPage: React.FC = () => {
  // form state
  const [teacherId, setTeacherId] = useState<string>("");
  const [classId, setClassId]     = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>("");
  const [date, setDate]           = useState<Date | undefined>();
  const [file, setFile]           = useState<File | null>(null);

  // Google OAuth & upload state
  const [isSignedIn, setIsSignedIn]   = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const tokenClientRef = useRef<TokenClient | null>(null);

  // fetch dropdown options
   const { data: teachers = [] } = useGetAllTeachers();
  const { data: classes  = [] } = useGetAllClassesQuery();
  const { data: sections = [] } = useGetAllSectionsQuery();
  const { data: subjects = [] } = useGetAllSubjectsQuery();


  // init gapi.client & GIS token
  const initGapiClient = () => {
    window.gapi.client
      .init({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"
        ]
      })
      .then(() => {
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          scope: "https://www.googleapis.com/auth/youtube.upload",
          callback: (resp) => {
            if (resp.error) {
              console.error("Token error", resp);
              return;
            }
            window.gapi.client.setToken({ access_token: resp.access_token });
            setIsSignedIn(true);
          }
        });
      })
      .catch((err) => console.error("gapi.client.init failed:", err));
  };

  const handleAuthClick = () => {
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken({ prompt: "" });
    }
  };

  const handleSignout = () => {
    const token = window.gapi.client.getToken()?.access_token;
    if (token) {
      window.google.accounts.oauth2.revoke(token, () => {
        window.gapi.client.setToken(null);
        setIsSignedIn(false);
        setFile(null);
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);

    // build YouTube metadata
    const metadata = {
      snippet: { title: file.name, description: "Uploaded via Class Review App" },
      status: { privacyStatus: "unlisted", selfDeclaredMadeForKids: false }
    };

    const formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    formData.append("file", file);

    const tokenRes = window.gapi.client.getToken();
  if (!tokenRes?.access_token) {
    toast.error("You must authorize YouTube before uploading");
    setIsUploading(false);
    return;
  }
  const accessToken = tokenRes.access_token;

    try {
      const ytRes = await fetch(
        "https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=multipart",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData
        }
      );
      const ytData = await ytRes.json();
      if (!ytRes.ok) {
        console.error("YouTube upload error", ytData);
        toast.error("YouTube upload failed");
      } else {
        const videoUrl = `https://youtu.be/${ytData.id}`;

        
        toast.success(`Video uploaded to youtube successfully.`)
        // save metadata to your backend
        await apiClient.post("/admin/videos", {
          teacherId,
          classId,
          sectionId,
          subjectId,
          date: date?.toISOString(),
          videoUrl
        });

        toast.success("Video uploaded and saved!");
        // reset form
        setFile(null);
        setTeacherId("");
        setClassId("");
        setSectionId("");
        setSubjectId("");
        setDate(undefined);
      }
    } catch (err) {
      console.error("Upload error", err);
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const allSelected =
    isSignedIn &&
    file &&
    teacherId &&
    classId &&
    sectionId &&
    subjectId &&
    date;

  return (
    <>
      {/* Load Google scripts */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />
      <Script
        src="https://apis.google.com/js/api.js"
        strategy="afterInteractive"
        onLoad={() => window.gapi.load("client", initGapiClient)}
      />
  <div className="px-4 py-8">
     <Card className="max-w-xl w-full mx-auto">
        <CardHeader>
          <CardTitle>Upload Class Recording</CardTitle>
          <CardDescription>
            Choose metadata, upload to YouTube, then save the link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {/* dropdowns in 2-col grid on md+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select onValueChange={setTeacherId} value={teacherId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={setClassId} value={classId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={setSectionId} value={sectionId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={setSubjectId} value={subjectId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* calendar centered on small screens */}
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => setDate(d || undefined)}
              />
            </div>

            {/* file input */}
            <Input
              type="file"
              accept="video/*"
              className="w-full"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            {/* action buttons */}
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              {!isSignedIn ? (
                <Button onClick={handleAuthClick} className="w-full sm:w-auto">
                  Authorize YouTube
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={handleSignout}
                  className="w-full sm:w-auto"
                >
                  Sign out of YouTube
                </Button>
              )}

              <Button
                onClick={handleUpload}
                disabled={!allSelected || isUploading}
                className="w-full sm:w-auto"
              >
                {isUploading ? "Uploading…" : "Upload & Save"}
              </Button>
            </div>
          </CardContent>
      </Card>
      </div>
    </>
  );
};

export default UploadVideoPage;


---src/hooks/use-video.ts  ---

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { IGenericErrorResponse } from "@/types/error.types";
import {
  TVideo,
  TCreateVideoPayload,
  TListVideosParams,
  TAssignReviewerPayload,
  TSubmitReviewPayload,
  TTeacherCommentPayload,
} from "@/types/video.types";
import * as videoService from "@/services/video.service";

/** 1️⃣ Fetch all videos (with optional filters) */
export const useGetAllVideosQuery = (params?: TListVideosParams) =>
  useQuery<TVideo[], Error>({
    queryKey: ["videos", params],
    queryFn: () => videoService.getAllVideos(params),
  });

export const useGetAssignedVideosQuery = () =>
  useQuery<TVideo[], Error>({
    queryKey: ['videos', 'assigned'],
    queryFn: videoService.getAssignedVideos,
  });

/** 2️⃣ Fetch single video detail */
export const useGetVideoQuery = (id?: string) =>
  useQuery<TVideo, Error>({
    queryKey: ["video", id],
    queryFn: () => videoService.getVideo(id!),
    enabled: Boolean(id),
  });

/** 3️⃣ Create (save) a new video record */
export const useCreateVideoMutation = () => {
  const qc = useQueryClient();
  return useMutation<TVideo, AxiosError<IGenericErrorResponse>, TCreateVideoPayload>({
    mutationFn: (payload) => videoService.createVideo(payload),
    onSuccess: () => {
      toast.success("Video created successfully");
      qc.invalidateQueries({ queryKey: ["videos"] });
    },
    onError: (err) => {
      const msg = err.response?.data.message ?? "Failed to create video";
      toast.error(msg);
    },
  });
};

/** 4️⃣ Assign or reassign a reviewer */
export const useAssignReviewerMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    TVideo,
    AxiosError<IGenericErrorResponse>,
    TAssignReviewerPayload
  >({
    mutationFn: (payload) => videoService.assignReviewer(payload),
    onSuccess: () => {
      toast.success("Reviewer assigned successfully");
      qc.invalidateQueries({ queryKey: ["videos"] });
    },
    onError: (err) => {
      const msg = err.response?.data.message ?? "Failed to assign reviewer";
      toast.error(msg);
    },
  });
};

/** 5️⃣ Submit peer-review feedback */
export const useSubmitReviewMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    TVideo,
    AxiosError<IGenericErrorResponse>,
    { id: string; data: TSubmitReviewPayload }
  >({
    mutationFn: ({ id, data }) => videoService.submitReview(id, data),
    onSuccess: () => {
      toast.success("Review submitted successfully");
      qc.invalidateQueries({ queryKey: ["videos"] });
    },
    onError: (err) => {
      const msg = err.response?.data.message ?? "Failed to submit review";
      toast.error(msg);
    },
  });
};

/** 6️⃣ Publish a reviewed video */
export const usePublishVideoMutation = () => {
  const qc = useQueryClient();
  return useMutation<TVideo, AxiosError<IGenericErrorResponse>, string>({
    mutationFn: (id) => videoService.publishVideo(id),
    onSuccess: () => {
      toast.success("Video published successfully");
      qc.invalidateQueries({ queryKey: ["videos"] });
    },
    onError: (err) => {
      const msg = err.response?.data.message ?? "Failed to publish video";
      toast.error(msg);
    },
  });
};

/** 7️⃣ Teacher: list all published feedback */
export const useGetTeacherFeedbackQuery = () =>
  useQuery<TVideo[], Error>({
    queryKey: ["teacherFeedback"],
    queryFn: () => videoService.getTeacherFeedback(),
  });

/** 8️⃣ Teacher: add a comment to a published review */
export const useAddTeacherCommentMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    TVideo,
    AxiosError<IGenericErrorResponse>,
    { id: string; data: TTeacherCommentPayload }
  >({
    mutationFn: ({ id, data }) => videoService.addTeacherComment(id, data),
    onSuccess: () => {
      toast.success("Comment added successfully");
      qc.invalidateQueries({ queryKey: ["teacherFeedback"] });
    },
    onError: (err) => {
      const msg = err.response?.data.message ?? "Failed to add comment";
      toast.error(msg);
    },
  });
};


---src/services/video.service.ts    ---

import apiClient from "@/lib/api-client";
import {
  TVideo,
  TCreateVideoPayload,
  TListVideosParams,
  TAssignReviewerPayload,
  TSubmitReviewPayload,
  TTeacherCommentPayload,
} from "@/types/video.types";

/** GET /videos → TVideo[] */
export const getAllVideos = async (
  params?: TListVideosParams
): Promise<TVideo[]> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: TVideo[];
  }>("/admin/videos", { params });
  return res.data.data;
};


export const getAssignedVideos = async (): Promise<TVideo[]> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: TVideo[];
  }>("/admin/videos/my-assigned");
  return res.data.data;
};

/** GET /videos/:id → TVideo */
export const getVideo = async (id: string): Promise<TVideo> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: TVideo;
  }>(`/admin/videos/${id}`);
  return res.data.data;
};

/** POST /videos → TVideo */
export const createVideo = async (
  payload: TCreateVideoPayload
): Promise<TVideo> => {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: TVideo;
  }>("/admin/videos", payload);
  return res.data.data;
};

/** POST /videos/:id/assign → TVideo */
export const assignReviewer = async ({
  id,
  reviewerId,
}: TAssignReviewerPayload): Promise<TVideo> => {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: TVideo;
  }>(`/admin/videos/${id}/assign`, { reviewerId });
  return res.data.data;
};

/** POST /videos/:id/review → TVideo */
export const submitReview = async (
  id: string,
  payload: TSubmitReviewPayload
): Promise<TVideo> => {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: TVideo;
  }>(`/admin/videos/${id}/review`, payload);
  return res.data.data;
};

/** POST /videos/:id/publish → TVideo */
export const publishVideo = async (id: string): Promise<TVideo> => {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: TVideo;
  }>(`/admin/videos/${id}/publish`);
  return res.data.data;
};

/** GET /me/feedback → TVideo[] */
export const getTeacherFeedback = async (): Promise<TVideo[]> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: TVideo[];
  }>("/admin/videos/me/feedback");
  return res.data.data;
};

/** POST /videos/:id/teacher-comment → TVideo */
export const addTeacherComment = async (
  id: string,
  payload: TTeacherCommentPayload
): Promise<TVideo> => {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: TVideo;
  }>(`/admin/videos/${id}/teacher-comment`, payload);
  return res.data.data;
};


---src/types/google-client.d.ts  ---

// src/types/google-client.d.ts

// minimal subset of gapi.client that we invoke
declare namespace gapi {
  namespace client {
    function init(opts: {
      apiKey: string;
      discoveryDocs: string[];
    }): Promise<void>;
    function setToken(token: { access_token: string }): void;
    function getToken(): { access_token: string } | null;
  }
}

// shape of the token-popup client
export interface TokenClient {
  requestAccessToken(params?: { prompt?: '' | 'none' }): void;
}

// google.identity services that we actually call
declare namespace google.accounts.oauth2 {
  function initTokenClient(init: {
    client_id: string;
    scope: string;
    callback: (resp: { access_token: string; error?: string }) => void;
  }): TokenClient;

  function revoke(token: string, callback: () => void): void;
}

// make them available on window
declare global {
  interface Window {
    gapi: typeof gapi;
    google: typeof google;
  }
}


---src/types/video.types.ts  ---

// src/types/video.types.ts

import { IClass } from "./class.types";
import { ISection } from "./section.types";
import { ISubject } from "./subject.types";

/** Review left by a reviewer */
export interface TReview {
  reviewer: string;
  classManagement: string;
  subjectKnowledge: string;
  otherComments: string;
  reviewedAt: string;          // ISO date
}

/** Comment added by the class teacher */
export interface TTeacherComment {
  commenter: string;
  comment: string;
  commentedAt: string;         // ISO date
}

export interface TTeacherID {
  _id: string;
  name: string;
  email: string;
}

/** Main Video record */
export interface TVideo {
  _id: string;
  teacher: TTeacherID;
  class: IClass;
  section: ISection;
  subject: ISubject;
  date: string;                // ISO date
  youtubeUrl: string;
  uploadedBy: string;
  status: 'unassigned' | 'assigned' | 'reviewed' | 'published';
  assignedReviewer?: TTeacherID;
  review?: TReview;
  teacherComment?: TTeacherComment;
  createdAt: string;           // ISO date
  updatedAt: string;           // ISO date
}

/** Payload to create a new video record */
export interface TCreateVideoPayload {
  teacherId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  date: string;        // ISO date
  videoUrl: string;
}

/** Optional filters for listing videos */
export interface TListVideosParams {
  status?: TVideo['status'];
  assignedReviewer?: string;
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  teacherId?: string;
  dateFrom?: string;   // ISO date
  dateTo?: string;     // ISO date
}

/** Payload to assign/reassign a reviewer */
export interface TAssignReviewerPayload {
  id: string;          // video _id
  reviewerId: string;
}

/** Payload to submit a review */
export interface TSubmitReviewPayload {
  classManagement: string;
  subjectKnowledge: string;
  otherComments: string;
}

/** Payload to add a comment as teacher */
export interface TTeacherCommentPayload {
  comment: string;
}

