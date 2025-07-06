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

   // build dynamic metadata from selected IDs
    const selectedClass = classes.find(c => c._id === classId)?.name ?? "";
    const selectedSection = sections.find(s => s._id === sectionId)?.name ?? "";
    const selectedSubject = subjects.find(s => s._id === subjectId)?.name ?? "";
    const selectedTeacher = teachers.find(t => t._id === teacherId)?.name ?? "";
    const formattedDate = date?.toISOString().split("T")[0] ?? "";

    const dynamicTitle = `${selectedClass}-${selectedSection}-${selectedSubject}-${selectedTeacher}-${formattedDate}`;
    const dynamicDescription = [
      `Class - ${selectedClass}`,
      `Section - ${selectedSection}`,
      `Subject - ${selectedSubject}`,
      `Teacher - ${selectedTeacher}`,
      `Class Date - ${formattedDate}`,
    ].join("\n");

    // build YouTube metadata
    const metadata = {
      snippet: { title: dynamicTitle, description: dynamicDescription },
      status: { privacyStatus: "unlisted", selfDeclaredMadeForKids: false }
    };

    const formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    const ext = file.name.split(".").pop();
    formData.append("file", file, `${dynamicTitle}${ext ? `.${ext}` : ""}`);

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
                {isUploading ? "Uploading…" : "Upload Complete"}
              </Button>
            </div>
          </CardContent>
      </Card>
      </div>
    </>
  );
};

export default UploadVideoPage;
