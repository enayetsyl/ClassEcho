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

      <Card className="max-w-xl mx-auto my-8">
        <CardHeader>
          <CardTitle>Upload Class Recording</CardTitle>
          <CardDescription>
            Choose metadata, upload to YouTube, then save the link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dropdowns */}
          <Select onValueChange={setTeacherId} value={teacherId}>
            <SelectTrigger><SelectValue placeholder="Select Teacher" /></SelectTrigger>
            <SelectContent className="bg-amber-400">
              {teachers.map(t => (
                <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setClassId} value={classId}>
            <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
            <SelectContent className="bg-amber-400">
              {classes.map(c => (
                <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setSectionId} value={sectionId}>
            <SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger>
            <SelectContent className="bg-amber-400">
              {sections.map(s => (
                <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setSubjectId} value={subjectId}>
            <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
            <SelectContent className="bg-amber-400">
              {subjects.map(s => (
                <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Calendar */}
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => setDate(d || undefined)}
          />

          {/* File input */}
          <Input
            type="file"
            accept="video/*"
            onChange={e => setFile(e.target.files?.[0] || null)}
          />

          {/* Auth / Upload controls */}
          {!isSignedIn ? (
            <Button onClick={handleAuthClick}>Authorize YouTube</Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleSignout}
            >
              Sign out of YouTube
            </Button>
          )}

          <Button
            onClick={handleUpload}
            disabled={!allSelected || isUploading}
          >
            {isUploading ? "Uploading…" : "Upload & Save"}
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default UploadVideoPage;
