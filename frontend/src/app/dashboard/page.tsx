"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import {
  LogOut, Type, Loader2, PlayCircle, Download, FileImage,
  Trash2, CheckSquare, Square, Shield, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

// Plan video quotas
const PLAN_QUOTA: Record<string, number> = {
  Starter: 1,
  Creator: 30,
  Agency: Infinity,
};

export default function DashboardPage() {
  const router = useRouter();
  const [script, setScript] = useState("");
  const [style, setStyle] = useState("minimal");
  const [videoSize, setVideoSize] = useState("9:16");
  const [duration, setDuration] = useState("");
  const [transitions, setTransitions] = useState("fade");
  const [animation, setAnimation] = useState("scale");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "generating" | "rendering" | "completed" | "error">("idle");
  const [progress, setProgress] = useState<number>(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  // Video History
  const [history, setHistory] = useState<any[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);

  // User & plan state
  const [user, setUser] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [videosGenerated, setVideosGenerated] = useState(0);
  const [quotaBlocked, setQuotaBlocked] = useState(false);
  const [quotaMsg, setQuotaMsg] = useState("");

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (!userCookie) {
      router.push("/login");
      return;
    }
    try {
      const parsed = JSON.parse(userCookie);
      setUser(parsed);
      if (parsed.role !== "admin") {
        const plan = parsed.plan || null;
        setUserPlan(plan);
        if (plan) {
          fetchUserPlan(parsed.id || parsed._id, plan);
        } else {
          // No plan yet → send to payment
          router.push("/payment");
          return;
        }
      }
    } catch {
      router.push("/login");
    }
    fetchHistory();
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  const fetchUserPlan = async (userId: string, plan: string) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/user/${userId}/plan`);
      const { videos_generated, quota } = res.data;
      setVideosGenerated(videos_generated);
      const planQuota = PLAN_QUOTA[plan] ?? quota;
      if (videos_generated >= planQuota) {
        setQuotaBlocked(true);
      }
    } catch {
      // fallback: use local count
    }
  };

  const fetchHistory = async () => {
    try {
      const userCookie = Cookies.get("user");
      const parsed = userCookie ? JSON.parse(userCookie) : null;
      const userId = parsed?.id || parsed?._id;
      const url = userId
        ? `http://localhost:5000/api/video?userId=${userId}`
        : "http://localhost:5000/api/video";
      const res = await axios.get(url);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedVideos(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedVideos.length === history.length) setSelectedVideos([]);
    else setSelectedVideos(history.map(v => v._id));
  };

  const deleteSelected = async () => {
    if (selectedVideos.length === 0) return;
    try {
      await axios.post("http://localhost:5000/api/video/delete", { videoIds: selectedVideos });
      setSelectedVideos([]);
      fetchHistory();
    } catch (err) { console.error(err); }
  };

  const deleteAll = async () => {
    if (history.length === 0) return;
    try {
      await axios.post("http://localhost:5000/api/video/delete", { videoIds: history.map(v => v._id) });
      setSelectedVideos([]);
      fetchHistory();
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    router.push("/login");
  };

  const handleGenerate = async () => {
    // Non-admin: check quota
    if (user?.role !== "admin") {
      if (quotaBlocked) {
        router.push("/payment");
        return;
      }
    }

    if (!script.trim()) return;
    setLoading(true);
    setStatus("generating");

    try {
      setProgress(0);
      const userId = user?.id || user?._id;
      const genRes = await axios.post(
        "http://localhost:5000/api/video/generate-video",
        {
          script,
          style,
          videoSize,
          duration: duration && duration !== "none" ? parseInt(duration) : undefined,
          transitions,
          animation,
          userId,
        }
      );

      const newVideoId = genRes.data.videoId;
      setStatus("rendering");
      await axios.post("http://localhost:5000/api/video/render-video", { videoId: newVideoId });
      pollVideoStatus(newVideoId);

    } catch (error: any) {
      console.error(error);
      // Handle quota exceeded (403 from backend)
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        const detail: string = error.response?.data?.detail || "";
        setQuotaBlocked(true);
        setLoading(false);
        setStatus("idle");
        if (detail.startsWith("quota_exceeded")) {
          const parts = detail.split("|");
          const planName = parts[1] || userPlan || "your current";
          const quota = parts[2] || "";
          setQuotaMsg(`Your ${planName} plan${quota ? ` (${quota} video${Number(quota)>1?"s":""})` : ""} has been fully used. Please upgrade to generate more videos.`);
        } else {
          setQuotaMsg(detail || "Plan limit reached. Please upgrade.");
        }
        // Redirect to payment after short delay so user sees the message
        setTimeout(() => router.push("/payment"), 2500);
        return;
      }
      setStatus("error");
      setLoading(false);
    }
  };

  const pollVideoStatus = (id: string) => {
    pollInterval.current = setInterval(async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/video/${id}`);

        if (res.data.status === "completed") {
          clearInterval(pollInterval.current!);
          setStatus("completed");
          setProgress(100);
          setVideoUrl(`http://localhost:5000${res.data.videoUrl}`);
          setLoading(false);
          fetchHistory();

          // Update local quota tracking
          const newCount = videosGenerated + 1;
          setVideosGenerated(newCount);
          if (userPlan && newCount >= (PLAN_QUOTA[userPlan] ?? Infinity)) {
            setQuotaBlocked(true);
          }
        } else if (res.data.status === "failed") {
          clearInterval(pollInterval.current!);
          setStatus("error");
          setLoading(false);
        } else if (res.data.status === "processing") {
          setProgress(res.data.progress || 0);
        }
      } catch {
        clearInterval(pollInterval.current!);
        setStatus("error");
        setLoading(false);
      }
    }, 2000);
  };

  const isAdmin = user?.role === "admin";

  // What to show in the generate button
  const getGenerateButtonLabel = () => {
    if (loading) {
      return status === "generating" ? "AI segmenting script..." : "Rendering video...";
    }
    if (!isAdmin && quotaBlocked) return "Upgrade Plan";
    return "Generate Magic";
  };

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col">
      <div className="absolute inset-0 bg-blue-900/10 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="border-b border-white/10 bg-black/50 z-10 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center">
              <Type className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">TypeMotion</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {/* Plan badge for regular users */}
            {!isAdmin && userPlan && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-medium">
                <CreditCard className="w-3 h-3" />
                {userPlan} Plan · {quotaBlocked ? "Limit reached" : `${videosGenerated} used`}
              </div>
            )}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin")}
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-400 hover:text-white">
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10 w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
          Create New Video
        </h1>
        {!isAdmin && userPlan && quotaBlocked && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-sm">
            <CreditCard className="w-5 h-5 flex-shrink-0" />
            <span>
              You have used all <strong>{PLAN_QUOTA[userPlan] === Infinity ? "unlimited" : PLAN_QUOTA[userPlan]}</strong> video generation(s) on your <strong>{userPlan}</strong> plan.{" "}
              <button onClick={() => router.push("/payment")} className="underline hover:text-amber-300">
                Upgrade to generate more →
              </button>
            </span>
          </div>
        )}
        {!isAdmin && userPlan && !quotaBlocked && (
          <p className="text-gray-500 text-sm mb-8">
            Plan: <span className="text-purple-400 font-medium">{userPlan}</span> · {PLAN_QUOTA[userPlan] === Infinity ? "Unlimited" : `${PLAN_QUOTA[userPlan] - videosGenerated} generation(s) remaining`}
          </p>
        )}
        {isAdmin && <div className="mb-8" />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Controls */}
          <div className="space-y-6">
            <Card className="bg-gray-900/50 border-white/10 backdrop-blur-md">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="script" className="text-gray-300">Video Script</Label>
                  <textarea
                    id="script"
                    placeholder="Enter the text you want to animate..."
                    className="w-full min-h-[200px] bg-black/50 border border-white/10 text-white placeholder:text-gray-600 resize-none rounded-md p-3 text-sm outline-none focus:ring-1 focus:ring-purple-500"
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 text-right">{script.length} characters</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Visual Theme</Label>
                    <Select value={style} onValueChange={setStyle} disabled={loading}>
                      <SelectTrigger className="bg-black/50 border-white/10 text-white">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/10 text-white">
                        <SelectItem value="minimal">Minimal Dark</SelectItem>
                        <SelectItem value="neon">Neon Glow</SelectItem>
                        <SelectItem value="cinematic">Cinematic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Format</Label>
                    <Select value={videoSize} onValueChange={setVideoSize} disabled={loading}>
                      <SelectTrigger className="bg-black/50 border-white/10 text-white">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/10 text-white">
                        <SelectItem value="9:16">Vertical (9:16)</SelectItem>
                        <SelectItem value="16:9">Horizontal (16:9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Target Duration</Label>
                    <Select value={duration} onValueChange={setDuration} disabled={loading}>
                      <SelectTrigger className="bg-black/50 border-white/10 text-white">
                        <SelectValue placeholder="Auto" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/10 text-white">
                        <SelectItem value="none">Auto (from script)</SelectItem>
                        <SelectItem value="10">10 Seconds (Fast)</SelectItem>
                        <SelectItem value="30">30 Seconds (Standard)</SelectItem>
                        <SelectItem value="60">60 Seconds (Full)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Text Animation</Label>
                    <Select value={animation} onValueChange={setAnimation} disabled={loading}>
                      <SelectTrigger className="bg-black/50 border-white/10 text-white">
                        <SelectValue placeholder="Select animation" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/10 text-white">
                        <SelectItem value="scale">Scale Up</SelectItem>
                        <SelectItem value="zoom">Dynamic Zoom</SelectItem>
                        <SelectItem value="slide">Slide In</SelectItem>
                        <SelectItem value="bounce">Text Bounce</SelectItem>
                        <SelectItem value="wave">Sine Wave</SelectItem>
                        <SelectItem value="fade">Pure Fade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label className="text-gray-300">Scene Transition</Label>
                    <Select value={transitions} onValueChange={setTransitions} disabled={loading}>
                      <SelectTrigger className="bg-black/50 border-white/10 text-white">
                        <SelectValue placeholder="Select transition" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/10 text-white">
                        <SelectItem value="fade">Hard Cut / Fade</SelectItem>
                        <SelectItem value="crossfade">Smooth Crossfade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading || (!script.trim() && !(!isAdmin && quotaBlocked))}
                  className={`w-full h-12 mt-4 font-bold text-white ${
                    !isAdmin && quotaBlocked
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
                      : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {status === "generating" ? "AI segmenting script..." : "Rendering video..."}
                    </>
                  ) : (
                    <>
                      {!isAdmin && quotaBlocked
                        ? <CreditCard className="mr-2 h-5 w-5" />
                        : <PlayCircle className="mr-2 h-5 w-5" />
                      }
                      {getGenerateButtonLabel()}
                    </>
                  )}
                </Button>

                {status === "error" && (
                  <div className="text-red-400 text-sm text-center mt-2 bg-red-900/20 p-2 rounded border border-red-900/50">
                    An error occurred. Please try again.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Preview */}
          <div className="flex flex-col items-center justify-center bg-gray-900/30 border border-white/10 rounded-xl overflow-hidden min-h-[400px] relative backdrop-blur-sm p-4">
            {status === "idle" && (
              <div className="flex flex-col items-center text-gray-500">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center mb-4">
                  <PlayCircle className="w-8 h-8 opacity-50" />
                </div>
                <p>Your generated video will appear here</p>
              </div>
            )}

            {(status === "generating" || status === "rendering") && (
              <div className="flex flex-col items-center w-full max-w-sm">
                <div className="w-16 h-16 rounded-full border-2 border-t-purple-500 border-r-purple-500 border-b-blue-500 border-l-transparent animate-spin mb-4" />
                <p className="font-medium animate-pulse text-purple-400 mb-2">
                  {status === "generating" ? "AI is analyzing your script..." : `Rendering: ${progress}%`}
                </p>
                {status === "rendering" && (
                  <>
                    <div className="w-full bg-gray-800 rounded-full h-2.5 mb-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      This usually takes 1-3 minutes depending on script length.
                    </p>
                  </>
                )}
              </div>
            )}

            {status === "completed" && videoUrl && (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                <video
                  src={videoUrl}
                  controls
                  className={`w-full max-h-[500px] rounded-lg shadow-2xl ${videoSize === "9:16" ? "aspect-[9/16] max-w-[300px]" : "aspect-video"}`}
                />
                <Button asChild className="bg-white text-black hover:bg-gray-200 mt-4">
                  <a href={videoUrl} target="_blank" download>
                    <Download className="w-4 h-4 mr-2" /> Download MP4
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Video History */}
        <div className="mt-16 border-t border-white/10 pt-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <PlayCircle className="w-6 h-6 text-purple-400" />
              Video Generation History
            </h2>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              {history.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={selectAll} className="border-white/20 hover:bg-white/10 text-white bg-transparent">
                    {selectedVideos.length === history.length ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                    {selectedVideos.length === history.length ? "Deselect All" : "Select All"}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={deleteSelected} disabled={selectedVideos.length === 0} className="bg-red-900/50 hover:bg-red-600 text-white border-none">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected ({selectedVideos.length})
                  </Button>
                  <Button variant="destructive" size="sm" onClick={deleteAll} className="bg-red-900/50 hover:bg-red-600 text-white border-none">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All
                  </Button>
                </>
              )}
            </div>
          </div>
          {history.length === 0 ? (
            <div className="text-center text-gray-500 py-12 flex flex-col items-center">
              <FileImage className="w-12 h-12 mb-4 opacity-30" />
              <p>No videos generated yet. Create your first one above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {history.map((video) => (
                <div key={video._id} className={`group bg-gray-900/50 border rounded-xl overflow-hidden transition-colors flex flex-col relative ${selectedVideos.includes(video._id) ? "border-purple-500" : "border-white/10 hover:border-purple-500/50"}`}>
                  <div className="absolute top-2 left-2 z-20">
                    <button onClick={() => toggleSelect(video._id)} className="p-1 rounded bg-black/50 hover:bg-black/80 text-white">
                      {selectedVideos.includes(video._id) ? <CheckSquare className="w-5 h-5 text-purple-400" /> : <Square className="w-5 h-5 opacity-50 hover:opacity-100" />}
                    </button>
                  </div>
                  {video.status === "completed" && video.videoUrl ? (
                    <video
                      src={`http://localhost:5000${video.videoUrl}`}
                      className={`w-full bg-black ${video.videoSize === "9:16" ? "aspect-[9/16] object-contain" : "aspect-video object-cover"}`}
                      muted
                      controls
                    />
                  ) : (
                    <div className={`w-full bg-black/50 flex flex-col items-center justify-center ${video.videoSize === "9:16" ? "aspect-[9/16]" : "aspect-video"}`}>
                      {video.status === "failed" ? (
                        <div className="text-red-400 text-sm">Render Failed</div>
                      ) : (
                        <div className="flex flex-col items-center text-purple-400">
                          <div className="w-8 h-8 rounded-full border-2 border-t-purple-500 border-r-purple-500 border-b-blue-500 border-l-transparent animate-spin mb-2" />
                          <span className="text-sm">Processing {video.progress}%</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-sm text-gray-300 line-clamp-2 mb-2 italic">&quot;{video.script}&quot;</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-400">{video.style}</span>
                      <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-400">{video.videoSize}</span>
                    </div>
                    {video.status === "completed" && video.videoUrl && (
                      <Button asChild variant="outline" size="sm" className="w-full mt-auto bg-transparent border-white/20 hover:bg-white/10 text-white">
                        <a href={`http://localhost:5000${video.videoUrl}`} target="_blank" download>
                          <Download className="w-3 h-3 mr-2" /> Download
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
