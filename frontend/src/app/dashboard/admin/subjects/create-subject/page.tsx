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





// . @ section.controller.ts, section.model.ts, section.routes.ts, section.service.ts, section.type.ts, section.validation.ts, subject.controller.ts, subject.model.ts, subject.routes.ts, subject.service.ts, subject.type.ts, subject.validation.ts