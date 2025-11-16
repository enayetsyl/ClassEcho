// src/app/dashboard/admin/upload-video/page.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Script from "next/script";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { useGetAllTeachers } from "@/hooks/use-user";
import { useGetAllClassesQuery } from "@/hooks/use-class";
import { useGetAllSectionsQuery } from "@/hooks/use-section";
import { useGetAllSubjectsQuery } from "@/hooks/use-subject";
import { TokenClient } from "@/types/google-client";

const YT_TOKEN_KEY = "youtube_access_token";

type UploadMode = "url" | "upload";

const UploadVideoPage: React.FC = () => {
  // form state
  const [teacherId, setTeacherId] = useState<string>("");
  const [classId, setClassId] = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>();
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [uploadMode, setUploadMode] = useState<UploadMode>("url");

  // Google OAuth & upload state
  const [isSignedIn, setIsSignedIn] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return !!window.localStorage.getItem(YT_TOKEN_KEY);
    }
    return false;
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isGapiReady, setIsGapiReady] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState({ gsi: false, gapi: false });
  const tokenClientRef = useRef<TokenClient | null>(null);

  // load token from storage into gapi after it's ready
  useEffect(() => {
    if (isGapiReady && typeof window !== "undefined") {
      const token = window.localStorage.getItem(YT_TOKEN_KEY);
      if (token && window.gapi?.client) {
        try {
          window.gapi.client.setToken({ access_token: token });
        } catch (err) {
          console.error("Error setting token:", err);
        }
      }
    }
  }, [isGapiReady]);

  // fetch dropdown options
  const { data: teachers = [] } = useGetAllTeachers();
  const { data: classes = [] } = useGetAllClassesQuery();
  const { data: sections = [] } = useGetAllSectionsQuery();
  const { data: subjects = [] } = useGetAllSubjectsQuery();

  // init gapi.client & GIS token
  const initGapiClient = useCallback(() => {
    if (!window.gapi || !window.google) {
      console.error("Google APIs not loaded");
      return;
    }

    window.gapi.load("client", () => {
      window.gapi.client
        .init({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
          ],
        })
        .then(() => {
          if (!window.google?.accounts?.oauth2) {
            console.error("Google OAuth2 not available");
            return;
          }
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            scope: "https://www.googleapis.com/auth/youtube.upload",
            callback: (resp) => {
              if (resp.error) {
                console.error("Token error", resp);
                toast.error(`Authorization failed: ${resp.error}`);
                return;
              }
              window.gapi.client.setToken({ access_token: resp.access_token });
              window.localStorage.setItem(YT_TOKEN_KEY, resp.access_token);
              setIsSignedIn(true);
              toast.success("YouTube authorization successful!");
            },
          });
          setIsGapiReady(true);
        })
        .catch((err) => {
          console.error("gapi.client.init failed:", err);
          toast.error("Failed to initialize Google API");
        });
    });
  }, []);

  // Initialize when both scripts are loaded
  useEffect(() => {
    if (scriptsLoaded.gsi && scriptsLoaded.gapi && window.gapi && window.google) {
      initGapiClient();
    }
  }, [scriptsLoaded.gsi, scriptsLoaded.gapi, initGapiClient]);

  const handleAuthClick = () => {
    if (!isGapiReady) {
      toast.error("Google API is still loading. Please wait a moment and try again.");
      return;
    }
    
    if (!tokenClientRef.current) {
      toast.error("Authorization client not initialized. Please refresh the page.");
      return;
    }

    try {
      tokenClientRef.current.requestAccessToken({ prompt: "" });
    } catch (err) {
      console.error("Error requesting access token:", err);
      toast.error("Failed to start authorization. Please try again.");
    }
  };

  const handleSignout = () => {
    const token = window.gapi.client.getToken()?.access_token;
    if (token) {
      window.google.accounts.oauth2.revoke(token, () => {
        window.gapi.client.setToken(null);
         window.localStorage.removeItem(YT_TOKEN_KEY);
        setIsSignedIn(false);
        setFile(null);
      });
    }
  };

  const handleSubmit = async () => {
    // Validate common fields
    if (!teacherId || !classId || !sectionId || !subjectId || !date) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsUploading(true);

    try {
      let finalVideoUrl = "";

      if (uploadMode === "url") {
        // Option 1: Use provided YouTube URL directly
        if (!videoUrl.trim()) {
          toast.error("Please provide a YouTube URL");
          setIsUploading(false);
          return;
        }
        finalVideoUrl = videoUrl.trim();
      } else {
        // Option 2: Upload file to YouTube first
        if (!file) {
          toast.error("Please select a video file");
          setIsUploading(false);
          return;
        }

        const tokenRes = window.gapi.client.getToken();
        if (!tokenRes?.access_token) {
          toast.error("You must authorize YouTube before uploading");
          setIsUploading(false);
          return;
        }

        // build dynamic metadata from selected IDs
        const selectedClass = classes.find((c) => c._id === classId)?.name ?? "";
        const selectedSection =
          sections.find((s) => s._id === sectionId)?.name ?? "";
        const selectedSubject =
          subjects.find((s) => s._id === subjectId)?.name ?? "";
        const selectedTeacher =
          teachers.find((t) => t._id === teacherId)?.name ?? "";
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
          status: { privacyStatus: "unlisted", selfDeclaredMadeForKids: false },
        };

        const formData = new FormData();
        formData.append(
          "metadata",
          new Blob([JSON.stringify(metadata)], { type: "application/json" })
        );
        const ext = file.name.split(".").pop();
        formData.append("file", file, `${dynamicTitle}${ext ? `.${ext}` : ""}`);

        const accessToken = tokenRes.access_token;

        const ytRes = await fetch(
          "https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=multipart",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
            body: formData,
          }
        );
        const ytData = await ytRes.json();
        if (!ytRes.ok) {
          console.error("YouTube upload error", ytData);
          toast.error("YouTube upload failed");
          setIsUploading(false);
          return;
        }
        finalVideoUrl = `https://youtu.be/${ytData.id}`;
        toast.success("Video uploaded to YouTube successfully");
      }

      // Save metadata to backend (same for both options)
      await apiClient.post("/admin/videos", {
        teacherId,
        classId,
        sectionId,
        subjectId,
        date: date?.toISOString(),
        videoUrl: finalVideoUrl,
      });

      toast.success("Video saved successfully!");
      
      // reset form
      setFile(null);
      setVideoUrl("");
      setTeacherId("");
      setClassId("");
      setSectionId("");
      setSubjectId("");
      setDate(undefined);
    } catch (err) {
      console.error("Submit error", err);
      toast.error("Failed to save video");
    } finally {
      setIsUploading(false);
    }
  };

  const allSelected =
    teacherId &&
    classId &&
    sectionId &&
    subjectId &&
    date &&
    (uploadMode === "url" ? videoUrl.trim() : (isSignedIn && file));

  return (
    <>
      {/* Load Google scripts */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          setScriptsLoaded((prev) => ({ ...prev, gsi: true }));
        }}
        onError={() => {
          toast.error("Failed to load Google Identity Services. Please refresh the page.");
        }}
      />
      <Script
        src="https://apis.google.com/js/api.js"
        strategy="afterInteractive"
        onLoad={() => {
          setScriptsLoaded((prev) => ({ ...prev, gapi: true }));
        }}
        onError={() => {
          toast.error("Failed to load Google API. Please refresh the page.");
        }}
      />
      <div className="px-4 py-8">
        <Card className="max-w-xl w-full mx-auto">
          <CardHeader>
            <CardTitle>Upload Class Recording</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload mode selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Video Source</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="uploadMode"
                    value="url"
                    checked={uploadMode === "url"}
                    onChange={(e) => {
                      setUploadMode(e.target.value as UploadMode);
                      setFile(null);
                    }}
                    className="w-4 h-4"
                  />
                  <span>YouTube URL</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="uploadMode"
                    value="upload"
                    checked={uploadMode === "upload"}
                    onChange={(e) => {
                      setUploadMode(e.target.value as UploadMode);
                      setVideoUrl("");
                    }}
                    className="w-4 h-4"
                  />
                  <span>Upload Video</span>
                </label>
              </div>
            </div>

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

            {/* Video input based on mode */}
            {uploadMode === "url" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">YouTube URL</label>
                <Input
                  type="url"
                  placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Paste the YouTube URL of an already uploaded video
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Video File</label>
                <Input
                  type="file"
                  accept="video/*"
                  className="w-full"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground">
                  Select a video file to upload to YouTube
                </p>
              </div>
            )}

            {/* action buttons */}
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              {uploadMode === "upload" && (
                <>
                  {!isSignedIn ? (
                    <Button 
                      onClick={handleAuthClick} 
                      className="w-full sm:w-auto"
                      disabled={!isGapiReady}
                    >
                      {isGapiReady ? "Authorize YouTube" : "Loading Google API..."}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSignout}
                      className="w-full sm:w-auto"
                      variant="outline"
                    >
                      Sign out of YouTube
                    </Button>
                  )}
                </>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!allSelected || isUploading}
                className="w-full sm:w-auto"
              >
                {isUploading
                  ? uploadMode === "upload"
                    ? "Uploading to YouTube…"
                    : "Saving…"
                  : "Save Video"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UploadVideoPage;
