"""
TypeMotion AI - Ultra-Fast Typography Video Engine v2.0
=======================================================
Features:
  • Parallel frame rendering (ThreadPoolExecutor)
  • Direct FFmpeg stdin pipe → no per-scene temp MP4 files
  • 10 animation types: karaoke, typewriter, bounce, zoom_in, slide_up,
                         shake, glow, wave, fade_in, scale_pulse
  • 3 background styles: gradient, radial, particles
  • 3 transition types: crossfade, slide, none
  • Robust cross-platform font loading with fallbacks
  • Clean error handling and resource cleanup
"""

import os
import re
import math
import random
import subprocess
import shutil
import sys
import tempfile
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import lru_cache

import numpy as np

try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
    # Compatibility shim for older Pillow
    if not hasattr(Image, 'ANTIALIAS'):
        Image.ANTIALIAS = getattr(Image, 'LANCZOS', Image.BICUBIC)
except ImportError:
    raise RuntimeError("Pillow is required: pip install pillow")

logger = logging.getLogger("video_engine")
logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)s  %(message)s")

# ─────────────────────────────────────────────
#  FONT LOADING  (cached, cross-platform)
# ─────────────────────────────────────────────

_FONT_CANDIDATES = [
    # Windows
    "C:/Windows/Fonts/arialbd.ttf",
    "C:/Windows/Fonts/arial.ttf",
    "C:/Windows/Fonts/calibrib.ttf",
    "C:/Windows/Fonts/verdanab.ttf",
    "C:/Windows/Fonts/impact.ttf",
    # Linux / macOS
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/Library/Fonts/Arial Bold.ttf",
]


@lru_cache(maxsize=32)
def _get_font(size: int) -> ImageFont.FreeTypeFont:
    """Return a cached font object at the requested point size."""
    for path in _FONT_CANDIDATES:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    # Ultimate fallback — PIL default bitmap font (tiny but always available)
    logger.warning("No TrueType font found, using PIL default bitmap font.")
    return ImageFont.load_default()


# ─────────────────────────────────────────────
#  COLOUR UTILITIES
# ─────────────────────────────────────────────

def hex_to_rgb(hex_code: str) -> tuple:
    h = hex_code.lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def hex_to_rgba(hex_code: str, alpha: int = 255) -> tuple:
    r, g, b = hex_to_rgb(hex_code)
    return (r, g, b, alpha)


def blend_colors(c1: tuple, c2: tuple, t: float) -> tuple:
    """Linear interpolation between two RGB tuples."""
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


# ─────────────────────────────────────────────
#  SCRIPT SEGMENTATION
# ─────────────────────────────────────────────

STYLE_PALETTES = {
    'neon': {
        'bg': [('#000000', '#0a0a0a'), ('#110022', '#000011')],
        'text': ['#39ff14', '#ff00ff', '#00ffff', '#ff6600'],
        'highlight': '#ffff00',
    },
    'cinematic': {
        'bg': [('#1a1a2e', '#0f0f1a'), ('#16213e', '#0d1b2a')],
        'text': ['#f1faee', '#e0e0e0'],
        'highlight': '#e94560',
    },
    'minimal': {
        'bg': [('#0f172a', '#070f1a'), ('#1e293b', '#0f172a')],
        'text': ['#ffffff', '#e2e8f0'],
        'highlight': '#38bdf8',
    },
}


def segment_script_local(
    script: str,
    style: str,
    target_duration: int = None,
    background: str = 'gradient',
    effects: str = 'none',
    transitions: str = 'crossfade',
    animation: str = 'karaoke',
) -> list:
    """
    Split script into scenes with per-scene metadata.
    Supports [X-Y sec] timestamp blocks for lyric-style segmentation.
    Falls back to chunking every 4 words.
    """
    palette = STYLE_PALETTES.get(style, STYLE_PALETTES['minimal'])
    scenes = []

    # Try timestamp-based parsing: [0-3 sec] text ...
    ts_pattern = r'\[(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*sec[^\]]*\](.*?)(?=\[\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?\s*sec|$)'
    matches = re.findall(ts_pattern, script, re.DOTALL | re.IGNORECASE)

    if matches:
        for start_s, end_s, text in matches:
            duration = float(end_s) - float(start_s)
            clean = text.strip()
            if not clean:
                continue
            bg_pair = random.choice(palette['bg'])
            scenes.append({
                "text": clean,
                "durationInSeconds": max(1.0, duration),
                "animationType": animation,
                "transition": transitions,
                "background": background,
                "backgroundColor": bg_pair[0],
                "backgroundColor2": bg_pair[1],
                "textColor": random.choice(palette['text']),
                "highlightColor": palette['highlight'],
            })
    else:
        words = script.split()
        chunk_size = 4
        for i in range(0, max(1, len(words)), chunk_size):
            chunk = ' '.join(words[i:i + chunk_size])
            bg_pair = random.choice(palette['bg'])
            scenes.append({
                "text": chunk,
                "durationInSeconds": 2.5,
                "animationType": animation,
                "transition": transitions,
                "background": background,
                "backgroundColor": bg_pair[0],
                "backgroundColor2": bg_pair[1],
                "textColor": random.choice(palette['text']),
                "highlightColor": palette['highlight'],
            })

    if not scenes:
        scenes.append({
            "text": "Hello World",
            "durationInSeconds": 2.0,
            "animationType": "karaoke",
            "transition": "crossfade",
            "background": "gradient",
            "backgroundColor": "#0f172a",
            "backgroundColor2": "#070f1a",
            "textColor": "#ffffff",
            "highlightColor": "#38bdf8",
        })

    # Scale durations to target_duration if provided
    if target_duration:
        total = sum(s['durationInSeconds'] for s in scenes)
        if total > 0:
            scale = target_duration / total
            for s in scenes:
                s['durationInSeconds'] = round(s['durationInSeconds'] * scale, 2)

    return scenes


# ─────────────────────────────────────────────
#  BACKGROUND FRAME GENERATORS
# ─────────────────────────────────────────────

def _make_gradient_bg(width: int, height: int, color1: tuple, color2: tuple) -> np.ndarray:
    """Fast NumPy vertical linear gradient."""
    t = np.linspace(0, 1, height, dtype=np.float32)
    r = np.uint8(color1[0] + (color2[0] - color1[0]) * t)
    g = np.uint8(color1[1] + (color2[1] - color1[1]) * t)
    b = np.uint8(color1[2] + (color2[2] - color1[2]) * t)
    frame = np.stack([
        np.broadcast_to(r[:, None], (height, width)),
        np.broadcast_to(g[:, None], (height, width)),
        np.broadcast_to(b[:, None], (height, width)),
    ], axis=2)
    return frame.copy()  # make writable


def _make_radial_bg(width: int, height: int, color1: tuple, color2: tuple) -> np.ndarray:
    """Radial spotlight gradient."""
    cx, cy = width / 2, height / 2
    y_idx, x_idx = np.mgrid[0:height, 0:width]
    dist = np.sqrt((x_idx - cx) ** 2 + (y_idx - cy) ** 2)
    max_dist = math.sqrt(cx ** 2 + cy ** 2)
    t = np.clip(dist / max_dist, 0, 1).astype(np.float32)
    frame = np.zeros((height, width, 3), dtype=np.uint8)
    for ch in range(3):
        frame[:, :, ch] = np.uint8(color1[ch] + (color2[ch] - color1[ch]) * t)
    return frame


def _make_particles_bg(
    width: int, height: int,
    color1: tuple, color2: tuple,
    frame_idx: int,
    particle_positions: list,
) -> np.ndarray:
    """Animated particle dots on gradient background."""
    bg = _make_gradient_bg(width, height, color1, color2)
    img = Image.fromarray(bg, 'RGB')
    draw = ImageDraw.Draw(img)
    speed = 0.6
    for px, py, pr, pc, phase in particle_positions:
        dy = math.sin(frame_idx * speed * 0.05 + phase) * 12
        dx = math.cos(frame_idx * speed * 0.03 + phase) * 8
        nx = int((px + dx) % width)
        ny = int((py + dy) % height)
        alpha_factor = 0.4 + 0.3 * math.sin(frame_idx * 0.07 + phase)
        rc = tuple(int(c * alpha_factor) for c in pc)
        draw.ellipse([nx - pr, ny - pr, nx + pr, ny + pr], fill=rc)
    return np.array(img)


def _generate_particle_seed(width: int, height: int, style: str) -> list:
    """Create random particle positions/colours for a scene."""
    palette = STYLE_PALETTES.get(style, STYLE_PALETTES['minimal'])
    particles = []
    for _ in range(30):
        px = random.randint(0, width)
        py = random.randint(0, height)
        pr = random.randint(2, 6)
        pc = hex_to_rgb(random.choice(palette['text']))
        phase = random.uniform(0, 2 * math.pi)
        particles.append((px, py, pr, pc, phase))
    return particles


# ─────────────────────────────────────────────
#  TEXT / ANIMATION FRAME RENDERER
# ─────────────────────────────────────────────

def _draw_word_glow(draw: ImageDraw.Draw, x: int, y: int, word: str, font, color: tuple, radius: int = 18):
    """Draw a glowing halo around a word using concentric semi-transparent strokes."""
    glow_img = Image.new('RGBA', draw.im.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow_img)
    for r in range(radius, 0, -3):
        alpha = int(180 * (1 - r / radius))
        glow_color = color + (alpha,)
        gd.text((x - r, y), word, font=font, fill=glow_color)
        gd.text((x + r, y), word, font=font, fill=glow_color)
        gd.text((x, y - r), word, font=font, fill=glow_color)
        gd.text((x, y + r), word, font=font, fill=glow_color)
    blurred = glow_img.filter(ImageFilter.GaussianBlur(radius // 2))
    # Composite onto result
    return blurred


def _render_text_frame(
    bg_frame: np.ndarray,
    words: list,
    active_word_idx: int,
    text_color: tuple,
    highlight_color: tuple,
    style: str,
    animation: str,
    frame_local_t: float,       # normalised time within this word's window [0,1]
    word_t: float,              # absolute time within the scene [0, duration]
    scene_duration: float,
    font_size: int = 80,
    width: int = 1080,
    height: int = 1920,
) -> np.ndarray:
    """
    Composite text onto bg_frame, implementing all animation types.
    Returns a new NumPy RGB frame.
    """
    frame_img = Image.fromarray(bg_frame, 'RGB').convert('RGBA')
    text_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(text_layer)

    font = _get_font(font_size)
    small_font_size = max(24, font_size - 16)
    font_small = _get_font(small_font_size)

    stroke_color = (0, 0, 0, 200)
    stroke_w = 3

    # ── measure all words ──────────────────────────────────────────────────
    dummy_img = Image.new('RGBA', (1, 1))
    d = ImageDraw.Draw(dummy_img)
    space_w = max(18, d.textlength(" ", font=font))

    # Lay words into wrapped lines
    max_text_width = int(width * 0.85)
    lines = []
    current_line = []
    current_w = 0
    for idx, word_str in enumerate(words):
        ww = d.textlength(word_str, font=font)
        if current_w + ww > max_text_width and current_line:
            lines.append(current_line)
            current_line = []
            current_w = 0
        current_line.append((idx, word_str, ww))
        current_w += ww + space_w
    if current_line:
        lines.append(current_line)

    try:
        _, _, _, line_h = d.textbbox((0, 0), "Ay", font=font)
    except Exception:
        line_h = font_size + 10
    line_gap = int(line_h * 1.4)
    total_text_h = len(lines) * line_gap

    # Vertical centre offset
    base_y = (height - total_text_h) // 2

    # ─── Apply whole-block entrance animations ────────────────────────────
    scene_in_t = min(1.0, word_t / 0.4)   # first 0.4 s of scene

    offset_x = 0
    offset_y = 0
    alpha_mult = 1.0

    if animation == 'zoom_in':
        # Scale from 0.3 → 1.0 in first 0.4 s
        scale = 0.3 + 0.7 * scene_in_t
        font_size = max(20, int(font_size * scale))
        font = _get_font(font_size)
    elif animation == 'slide_up':
        slide_offset = int((1 - scene_in_t) * height * 0.25)
        offset_y = slide_offset
    elif animation == 'fade_in':
        alpha_mult = scene_in_t

    # ─── Draw each word ──────────────────────────────────────────────────
    for line_no, line in enumerate(lines):
        line_w = sum(ww for _, _, ww in line) + space_w * (len(line) - 1)
        lx = (width - line_w) // 2
        ly = base_y + line_no * line_gap + offset_y

        for idx, word_str, ww in line:
            is_active = (idx == active_word_idx)

            # Pick colour
            if is_active:
                wcolor = highlight_color + (255,)
            else:
                wcolor = text_color + (int(220 * alpha_mult),)

            wx = lx + offset_x
            wy = ly

            # ── Per-word animation for active word ────────────────────────
            if is_active:
                if animation in ('karaoke', 'scale_pulse'):
                    # Gentle pulse: scale up slightly at mid-highlight
                    pulse = 1.0 + 0.12 * math.sin(frame_local_t * math.pi)
                    cur_font_size = max(20, int(font_size * pulse))
                    wfont = _get_font(cur_font_size)
                    # Re-measure for centring
                    new_ww = d.textlength(word_str, font=wfont)
                    wx_adj = wx + (ww - new_ww) // 2
                    draw.text((wx_adj, wy), word_str, font=wfont, fill=wcolor,
                               stroke_width=stroke_w, stroke_fill=stroke_color)

                elif animation == 'bounce':
                    dy = int(-30 * math.sin(frame_local_t * math.pi))
                    draw.text((wx, wy + dy), word_str, font=font, fill=wcolor,
                               stroke_width=stroke_w, stroke_fill=stroke_color)

                elif animation == 'shake':
                    dx = int(6 * math.sin(frame_local_t * math.pi * 8))
                    draw.text((wx + dx, wy), word_str, font=font, fill=wcolor,
                               stroke_width=stroke_w, stroke_fill=stroke_color)

                elif animation == 'glow':
                    glow_layer = _draw_word_glow(draw, wx, wy, word_str, font, highlight_color, radius=22)
                    text_layer.alpha_composite(glow_layer)
                    draw.text((wx, wy), word_str, font=font, fill=wcolor,
                               stroke_width=stroke_w, stroke_fill=stroke_color)

                elif animation == 'wave':
                    # Each character gets a sine offset
                    char_x = wx
                    for ch_idx, ch in enumerate(word_str):
                        ch_dy = int(12 * math.sin(ch_idx * 0.8 + frame_local_t * math.pi * 3))
                        draw.text((char_x, wy + ch_dy), ch, font=font, fill=wcolor,
                                   stroke_width=stroke_w, stroke_fill=stroke_color)
                        char_x += int(d.textlength(ch, font=font))

                elif animation == 'typewriter':
                    # Reveal characters progressively
                    n_chars = max(1, int(len(word_str) * frame_local_t + 1))
                    partial = word_str[:n_chars]
                    draw.text((wx, wy), partial, font=font, fill=wcolor,
                               stroke_width=stroke_w, stroke_fill=stroke_color)
                else:
                    # Default
                    draw.text((wx, wy), word_str, font=font, fill=wcolor,
                               stroke_width=stroke_w, stroke_fill=stroke_color)
            else:
                # Inactive words — normal render
                draw.text((wx, wy), word_str, font=font, fill=wcolor,
                           stroke_width=stroke_w, stroke_fill=stroke_color)

            lx += ww + space_w

    # Apply global alpha for fade_in
    if animation == 'fade_in' and alpha_mult < 1.0:
        alpha_channel = text_layer.split()[3]
        alpha_channel = alpha_channel.point(lambda p: int(p * alpha_mult))
        text_layer.putalpha(alpha_channel)

    frame_img.alpha_composite(text_layer)
    return np.array(frame_img.convert('RGB'))


# ─────────────────────────────────────────────
#  TRANSITION FRAME BLENDING
# ─────────────────────────────────────────────

def _crossfade(frame_a: np.ndarray, frame_b: np.ndarray, t: float) -> np.ndarray:
    """Alpha crossfade between two RGB frames. t ∈ [0,1]."""
    return np.uint8(frame_a * (1 - t) + frame_b * t)


def _slide_transition(frame_a: np.ndarray, frame_b: np.ndarray, t: float, direction: str = 'left') -> np.ndarray:
    """Horizontal slide wipe."""
    h, w = frame_a.shape[:2]
    offset = int(w * t)
    result = np.zeros_like(frame_a)
    if direction == 'left':
        result[:, :w - offset] = frame_a[:, offset:]
        result[:, w - offset:] = frame_b[:, :offset]
    else:
        result[:, offset:] = frame_a[:, :w - offset]
        result[:, :offset] = frame_b[:, w - offset:]
    return result


# ─────────────────────────────────────────────
#  MAIN RENDER FUNCTION  (FFmpeg pipe)
# ─────────────────────────────────────────────

def render_video_local(
    output_path: str,
    scenes: list,
    style: str,
    video_size: str,
    progress_callback=None,
    fps: int = 24,
    font_size: int = 80,
    max_workers: int = None,
):
    """
    Render all scenes to `output_path` via a direct FFmpeg stdin pipe.
    No temporary files are created per scene — raw RGB frames are streamed
    directly into FFmpeg for maximum speed.

    Args:
        output_path:       Full path for the output .mp4 file.
        scenes:            List of scene dicts from segment_script_local().
        style:             Visual style name ('neon', 'cinematic', 'minimal').
        video_size:        '9:16' for portrait, '16:9' for landscape.
        progress_callback: Optional callable(int) for 0–100 progress updates.
        fps:               Frames per second (default 24).
        font_size:         Base font size (will scale for zoom_in).
        max_workers:       ThreadPoolExecutor worker count (None = auto).
    """
    is_portrait = video_size == '9:16'
    width  = 1080 if is_portrait else 1920
    height = 1920 if is_portrait else 1080

    if max_workers is None:
        max_workers = min(8, (os.cpu_count() or 4))

    # ── Locate FFmpeg ────────────────────────────────────────────────────
    def _find_ffmpeg() -> str:
        # 1. Try imageio_ffmpeg (bundled with MoviePy / imageio)
        try:
            from imageio_ffmpeg import get_ffmpeg_exe
            path = get_ffmpeg_exe()
            if path and os.path.exists(path):
                return path
        except Exception:
            pass
        # 2. Try moviepy config
        try:
            from moviepy.config import get_setting
            path = get_setting('FFMPEG_BINARY')
            if path and os.path.exists(path):
                return path
        except Exception:
            pass
        # 3. shutil.which (respects PATH)
        path = shutil.which('ffmpeg')
        if path:
            return path
        # 4. Common Windows locations
        for loc in [
            r"C:\ffmpeg\bin\ffmpeg.exe",
            r"C:\Program Files\ffmpeg\bin\ffmpeg.exe",
            r"C:\Program Files (x86)\ffmpeg\bin\ffmpeg.exe",
        ]:
            if os.path.exists(loc):
                return loc
        return 'ffmpeg'  # last resort

    ffmpeg_cmd = _find_ffmpeg()
    logger.info(f"Using FFmpeg: {ffmpeg_cmd}")

    # ── Build total frame count ──────────────────────────────────────────
    TRANSITION_FRAMES = 12   # crossfade/slide overlap frames between scenes
    transition_type_map = {
        'crossfade': 'crossfade', 'fade': 'crossfade',
        'slide_right': 'slide_right', 'slide_left': 'slide_left',
        'none': 'none',
    }

    # Pre-compute per-scene frame counts & particle seeds
    scene_meta = []
    for scene in scenes:
        dur = float(scene.get('durationInSeconds', 2.0))
        n_frames = max(1, int(round(dur * fps)))
        anim = scene.get('animationType', 'karaoke')
        bg_style = scene.get('background', 'gradient')
        c1 = hex_to_rgb(scene.get('backgroundColor', '#0f172a'))
        c2 = hex_to_rgb(scene.get('backgroundColor2', '#070f1a'))
        particles = _generate_particle_seed(width, height, style) if bg_style == 'particles' else None
        t_type = transition_type_map.get(scene.get('transition', 'crossfade'), 'crossfade')
        scene_meta.append({
            'dur': dur,
            'n_frames': n_frames,
            'anim': anim,
            'bg_style': bg_style,
            'c1': c1,
            'c2': c2,
            'particles': particles,
            'text_color': hex_to_rgb(scene.get('textColor', '#ffffff')),
            'highlight_color': hex_to_rgb(scene.get('highlightColor', '#ffff00')),
            'words': scene.get('text', '').split() or ['…'],
            'transition': t_type,
        })

    total_frames = sum(m['n_frames'] for m in scene_meta)
    logger.info(f"Rendering {len(scenes)} scenes → {total_frames} frames at {fps}fps  ({width}x{height})")

    # ── Render a single frame for a given scene ──────────────────────────
    def render_scene_frame(sm: dict, frame_idx_in_scene: int, abs_frame_idx: int) -> np.ndarray:
        frame_t = frame_idx_in_scene / max(1, sm['n_frames'])  # 0→1 within scene
        dur = sm['dur']
        word_t = frame_t * dur
        words = sm['words']
        n_words = len(words)
        word_duration = dur / max(1, n_words)
        active_word_idx = min(n_words - 1, int(word_t / max(0.001, word_duration)))
        time_in_word = (word_t - active_word_idx * word_duration) / max(0.001, word_duration)
        frame_local_t = max(0.0, min(1.0, time_in_word))

        # Background
        bg_style = sm['bg_style']
        if bg_style == 'radial':
            bg = _make_radial_bg(width, height, sm['c1'], sm['c2'])
        elif bg_style == 'particles':
            bg = _make_particles_bg(width, height, sm['c1'], sm['c2'], abs_frame_idx, sm['particles'])
        else:
            bg = _make_gradient_bg(width, height, sm['c1'], sm['c2'])

        return _render_text_frame(
            bg_frame=bg,
            words=words,
            active_word_idx=active_word_idx,
            text_color=sm['text_color'],
            highlight_color=sm['highlight_color'],
            style=style,
            animation=sm['anim'],
            frame_local_t=frame_local_t,
            word_t=word_t,
            scene_duration=dur,
            font_size=font_size,
            width=width,
            height=height,
        )

    # ── Open FFmpeg pipe ─────────────────────────────────────────────────
    ffmpeg_args = [
        ffmpeg_cmd,
        '-y',                         # overwrite output
        '-f', 'rawvideo',
        '-vcodec', 'rawvideo',
        '-s', f'{width}x{height}',
        '-pix_fmt', 'rgb24',
        '-r', str(fps),
        '-i', 'pipe:0',               # read raw frames from stdin
        '-vcodec', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '23',
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        output_path,
    ]

    proc = None
    try:
        proc = subprocess.Popen(
            ffmpeg_args,
            stdin=subprocess.PIPE,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
        )

        frames_written = 0
        prev_last_frame = None   # for crossfade between scenes

        for scene_idx, sm in enumerate(scene_meta):
            n_frames = sm['n_frames']
            transition = sm['transition']

            # ── Render all frames for this scene in parallel ──────────────
            frame_results = [None] * n_frames

            def _job(fi, sm=sm, base=frames_written):
                return fi, render_scene_frame(sm, fi, base + fi)

            with ThreadPoolExecutor(max_workers=max_workers) as pool:
                futures = {pool.submit(_job, fi): fi for fi in range(n_frames)}
                for future in as_completed(futures):
                    fi, frame = future.result()
                    frame_results[fi] = frame

            # ── Apply entrance transition (between prev scene and this one)
            if prev_last_frame is not None and transition != 'none' and n_frames >= TRANSITION_FRAMES:
                for tf in range(TRANSITION_FRAMES):
                    t_val = tf / TRANSITION_FRAMES
                    if transition == 'crossfade':
                        blended = _crossfade(prev_last_frame, frame_results[tf], t_val)
                    elif transition == 'slide_right':
                        blended = _slide_transition(prev_last_frame, frame_results[tf], t_val, 'right')
                    elif transition == 'slide_left':
                        blended = _slide_transition(prev_last_frame, frame_results[tf], t_val, 'left')
                    else:
                        blended = frame_results[tf]
                    frame_results[tf] = blended

            # ── Write frames to FFmpeg ────────────────────────────────────
            for frame in frame_results:
                proc.stdin.write(frame.tobytes())
                frames_written += 1

            prev_last_frame = frame_results[-1].copy()

            if progress_callback:
                pct = int((scene_idx + 1) / len(scene_meta) * 95)
                progress_callback(pct)

        proc.stdin.close()
        _, ffmpeg_err = proc.communicate()
        ret = proc.returncode

        if ret != 0:
            err_msg = ffmpeg_err.decode('utf-8', errors='replace') if ffmpeg_err else 'unknown'
            raise RuntimeError(f"FFmpeg exited with code {ret}:\n{err_msg}")

        if progress_callback:
            progress_callback(100)

        logger.info(f"Video written to {output_path}  ({frames_written} frames)")

    except Exception:
        if proc and proc.stdin and not proc.stdin.closed:
            try:
                proc.stdin.close()
            except Exception:
                pass
        if proc:
            proc.wait()
        raise
    finally:
        if proc and proc.poll() is None:
            proc.terminate()
