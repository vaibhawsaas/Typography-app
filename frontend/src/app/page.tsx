"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PlayCircle, Wand2, Type, CheckCircle2, Zap, LayoutTemplate, Music, FileImage, Sparkles, IndianRupee } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-900 selection:text-white">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center">
              <Type className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">TypeMotion <span className="text-purple-400">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="#demo" className="hover:text-white transition-colors">Demo</Link>
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button className="bg-white text-black hover:bg-gray-200 font-semibold rounded-full px-6">
                Start Generating
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
            Introducing AI Typography Engine 2.0
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
          >
            Create Typography Videos <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-blue-500">
              With Pure AI Magic
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Turn your script into professional motion graphics in seconds. Perfect for TikTok, Reels, and YouTube Shorts. Paste text, set timings, and render.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-full w-full sm:w-auto text-lg border border-white/10 shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)]">
                Start Generating <Wand2 className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="h-14 px-8 bg-white/5 hover:bg-white/10 text-white border-white/10 rounded-full w-full sm:w-auto text-lg backdrop-blur-md">
                <PlayCircle className="mr-2 w-5 h-5" /> Watch Demo
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Demo Section */}
      <section id="demo" className="py-24 relative bg-black/40 border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">See The <span className="text-purple-400">Magic</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Watch how our engine transforms plain text into engaging visual stories with gorgeous animations and transitions.</p>
          </div>

          <div className="max-w-4xl mx-auto relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_-12px_rgba(168,85,247,0.3)] bg-gray-900 group aspect-video flex items-center justify-center">
            {/* Real video demo placeholder - pointing to a generic highly visual video for effect */}
            <video
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              autoPlay
              loop
              muted
              playsInline
              poster="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
            >
              <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">Typography Engine Demo</div>
                  <div className="text-white/60 text-sm">Target Duration: 10s • Style: Neon Glow</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Professional <span className="text-blue-400">Features</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Everything you need to create viral shorts without opening After Effects or Premiere Pro.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-6">
                <LayoutTemplate className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Parsing</h3>
              <p className="text-gray-400">Add timestamps directly in your script like <code className="text-purple-400">[5-8 sec]</code> and the engine automatically times the text perfectly.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Dynamic Scaling</h3>
              <p className="text-gray-400">Need exactly a 60-second video? Our engine mathematically mathematically stretches or compresses your scene timings instantly.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-fuchsia-500/20 text-fuchsia-400 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Pro Animations</h3>
              <p className="text-gray-400">Built-in cinematic text animations: Dynamic Zooms, Smooth Slides, Scale-ups, and Crossfade scene transitions.</p>
            </div>

            {/* Coming soon banners */}
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/10 border border-green-500/30 rounded-2xl p-6 relative overflow-hidden flex items-center gap-6">
                <div className="absolute top-0 right-0 bg-green-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider">COMING SOON</div>
                <div className="w-14 h-14 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center shrink-0">
                  <Music className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">AI Voiceover & Audio</h3>
                  <p className="text-green-500/70 text-sm">Automatically generate breathtaking AI voiceovers synchronized to your text.</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-900/30 to-amber-900/10 border border-orange-500/30 rounded-2xl p-6 relative overflow-hidden flex items-center gap-6">
                <div className="absolute top-0 right-0 bg-orange-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider">COMING SOON</div>
                <div className="w-14 h-14 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center shrink-0">
                  <FileImage className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Animated Stickers & Emojis</h3>
                  <p className="text-orange-500/70 text-sm">Liven up your typography with pop-up graphics, emojis, and visual sound effects.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 relative bg-black/40 border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How It <span className="text-fuchsia-400">Works</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Generate a professional video in 3 ridiculously simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto text-center relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-blue-500/0" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-900 border-4 border-black shadow-[0_0_0_2px_rgba(168,85,247,0.5)] flex items-center justify-center text-3xl font-bold text-purple-400 mb-6">1</div>
              <h3 className="text-xl font-bold mb-3">Copy & Paste</h3>
              <p className="text-gray-400">Paste your script, tweet, or idea into our dashboard. Optionally add <code className="text-purple-400">[timestamps]</code>.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-900 border-4 border-black shadow-[0_0_0_2px_rgba(217,70,239,0.5)] flex items-center justify-center text-3xl font-bold text-fuchsia-400 mb-6">2</div>
              <h3 className="text-xl font-bold mb-3">Select Vibe</h3>
              <p className="text-gray-400">Choose your color theme, animations, duration target, and video dimensions.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-900 border-4 border-black shadow-[0_0_0_2px_rgba(59,130,246,0.5)] flex items-center justify-center text-3xl font-bold text-blue-400 mb-6">3</div>
              <h3 className="text-xl font-bold mb-3">Generate</h3>
              <p className="text-gray-400">Our Python render engine creates your video in the cloud. Download instantly as an MP4.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple <span className="text-green-400">Pricing</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Pay only for what you need. Zero monthly subscriptions required to start.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Single Video Tier */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center hover:bg-white/[0.07] transition-colors relative">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <div className="flex items-baseline gap-1 my-6">
                <IndianRupee className="w-6 h-6 text-gray-400" />
                <span className="text-5xl font-extrabold text-white">10</span>
              </div>
              <p className="text-gray-400 mb-8">Pay as you go. Perfect for occasional social media posts.</p>

              <ul className="space-y-4 mb-8 w-full text-left">
                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> 1 Premium Video Generation</li>
                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Full HD 1080p Render</li>
                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> No Watermarks</li>
              </ul>

              <Link href="/dashboard" className="w-full mt-auto">
                <Button className="w-full h-12 bg-white/10 hover:bg-white/20 text-white rounded-full">Get Started</Button>
              </Link>
            </div>

            {/* Bulk Tier */}
            <div className="bg-gray-900 border border-purple-500/50 rounded-3xl p-8 flex flex-col items-center text-center relative shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)] transform md:-translate-y-4">
              <div className="absolute -top-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Creator Pack</h3>
              <div className="flex items-baseline gap-1 my-6">
                <IndianRupee className="w-6 h-6 text-purple-400" />
                <span className="text-5xl font-extrabold text-white">299</span>
              </div>
              <p className="text-gray-400 mb-8">Ideal for content creators making daily uploads.</p>

              <ul className="space-y-4 mb-8 w-full text-left">
                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" /> 30 Premium Video Generations</li>
                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" /> Massive Discount (₹10/video)</li>
                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" /> Priority Cloud Rendering</li>
                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" /> Premium Templates</li>
              </ul>

              <Link href="/dashboard" className="w-full mt-auto">
                <Button className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full">Grab Deal</Button>
              </Link>
            </div>

            {/* Removed third tier since we only have 2 now, but let's keep the layout balanced by wrapping them differently or adding an enterprise tier */}
            {/* Enterprise Tier */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center hover:bg-white/[0.07] transition-colors">
              <h3 className="text-2xl font-bold mb-2">Agency</h3>
              <div className="flex items-baseline gap-1 my-6">
                <IndianRupee className="w-6 h-6 text-blue-400" />
                <span className="text-5xl font-extrabold text-white">1999</span>
              </div>
              <p className="text-gray-400 mb-8">Perfect for agencies managing multiple client campaigns.</p>

              <ul className="space-y-4 mb-8 w-full text-left">
                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" /> Unlimited Video Generations</li>
                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" /> API Access</li>
                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" /> Dedicated Account Manager</li>
                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" /> Custom Font Uploads</li>
              </ul>

              <Link href="/dashboard" className="w-full mt-auto">
                <Button className="w-full h-12 bg-white/10 hover:bg-white/20 text-white rounded-full">Contact Sales</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-black">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Type className="w-5 h-5 text-purple-500" />
            <span className="font-bold text-lg text-white">TypeMotion AI</span>
          </div>
          <p>© 2026 TypeMotion. Built for modern creators.</p>
        </div>
      </footer>
    </div>
  );
}
