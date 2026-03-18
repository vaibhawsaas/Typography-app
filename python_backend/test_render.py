"""
Quick render test - creates a short test video using the new engine.
Run from: d:\\vscode\\Typography app\\python_backend
    py test_render.py
"""
import os, sys, time

sys.path.insert(0, os.path.dirname(__file__))
from services.video_engine import segment_script_local, render_video_local

SCRIPT = "[0-3 sec] Welcome to TypeMotion AI [3-6 sec] Fast Lyrics Style Videos [6-9 sec] Beautiful Effects and Animations"
STYLE = "neon"
ANIMATION = "karaoke"
BACKGROUND = "particles"
TRANSITIONS = "crossfade"
OUTPUT = os.path.join(os.path.dirname(__file__), "test_output.mp4")

print("Segmenting script...")
scenes = segment_script_local(
    SCRIPT, STYLE, target_duration=9,
    background=BACKGROUND, effects="none",
    transitions=TRANSITIONS, animation=ANIMATION,
)
print(f"Got {len(scenes)} scenes: {[s['text'] for s in scenes]}")

def on_progress(pct):
    sys.stdout.write(f"\r  Progress: {pct}%   ")
    sys.stdout.flush()

print("Rendering video...")
t0 = time.time()
try:
    render_video_local(
        OUTPUT, scenes, STYLE, "9:16",
        progress_callback=on_progress,
        fps=24, font_size=80,
    )
    elapsed = time.time() - t0
    size_kb = os.path.getsize(OUTPUT) / 1024
    print(f"\nDONE in {elapsed:.1f}s  ({size_kb:.0f} KB)  ->  {OUTPUT}")
except Exception as e:
    import traceback
    print(f"\nERROR: {e}")
    traceback.print_exc()
    sys.exit(1)
