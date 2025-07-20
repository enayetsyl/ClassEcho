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
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(1, "Section name cannot be empty"),
});

type FormValues = z.infer<typeof formSchema>;

const CreateSectionPage = () => {
   const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });
  const { mutate, isPending } = useCreateSectionMutation();

  const onSubmit = (values: FormValues) => {
    mutate(values);
    form.reset();
     router.push('/dashboard/admin/sections/section-list')
  };

  return (
    <div className="flex justify-center items-center pt-10">
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
