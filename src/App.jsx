import React, { useState, useEffect, useRef } from 'react';
import {
    Camera, Music, User, Mic2, Sparkles, ArrowRight, RotateCcw,
    Download, Copy, Film, MapPin, Box, AlertCircle, CheckCircle,
    Loader2, Play, Image as ImageIcon, Palette, X, Upload, Wand2, Volume2,
    FileAudio, Video, ListVideo, PlusCircle, Edit3, Clapperboard, MonitorPlay,
    Globe, Link as LinkIcon, Radio, Youtube, Sliders, Save, FileJson, FolderOpen,
    Eye, EyeOff, FileText, Music2, MessageSquareQuote, Shirt, Calculator, Hammer,
    Rocket, Megaphone, Search, Gift, Star, Activity, Paintbrush, Calendar, Clock,
    ShieldCheck, FileSpreadsheet, Watch, Aperture, Sun, Clock3, Images, Check,
    Zap, Speaker, MessageCircle, Code2, AlignLeft, BarChart3, ActivitySquare,
    Move, Ratio, Ban, Gauge, ArrowUp, ArrowDown, RefreshCcw, ArrowLeft,
    Disc, Landmark, ShoppingBag, Banknote, ScrollText, Timer, Printer, BookOpen, Heart,
    PenTool, Shuffle, Smartphone, HelpCircle, Send, Newspaper, Mail, Layout, MessageSquare,
    Coins, CalendarCheck, AlertTriangle, Gamepad2, Users, FastForward, Keyboard, DraftingCompass, Terminal, ChevronDown
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ... importlar aynen kalacak ...

/* -------------------------------------------------------------------------- */
/* API VE FIREBASE AYARLARI (GÜNCELLENDİ)                                     */
/* -------------------------------------------------------------------------- */

// Vercel'den gelecek API Anahtarı
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Firebase Ayarları (Environment Variable'dan veya direkt buraya yazabilirsiniz)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Uygulama ID'si
const appId = "music-video-ai-v1"; 

// Firebase Başlatma
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ... kodun geri kalanı ...

/* -------------------------------------------------------------------------- */
/* HELPER FUNCTIONS                                                            */
/* -------------------------------------------------------------------------- */

// Extract YouTube video ID from various URL formats
const getYouTubeID = (url) => {
    if (!url) return null;

    // Match various YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
};

/* -------------------------------------------------------------------------- */
/* PRESET PROMPTS (Nano Banana Pro) - IMPORTED FROM CSV                       */
/* -------------------------------------------------------------------------- */

const NANO_BANANA_PRESETS = [
    // --- CINEMATIC & REALISTIC ---
    {
        category: "Cinematic & Realistic",
        label: "Perceptual Realism & Qualia (Haptic)",
        value: JSON.stringify({
            "Objective": "Generate an image with extreme perceptual realism, focusing on indexicality and haptic visuality.",
            "Visual_Philosophy": {
                "Core_Concepts": ["Haptic Visuality (Tactile textures)", "Cinematic Qualia (Atmospheric density)", "Indexicality (Photographic truth)"],
                "Execution": "Physically correct light transport, tangible textures, sensory depth."
            }
        })
    },
    {
        category: "Cinematic & Realistic",
        label: "Street Fashion (JSON Style)",
        value: JSON.stringify({
            "Objective": "Generate an ultra-realistic street-fashion portrait of a young man walking confidently outdoors based on the provided reference image.",
            "Scene_Description": {
                "Environment": {
                    "Setting": "Wet pavement near a modern café",
                    "Background": {
                        "Style": "Blurred urban environment",
                        "Elements": ["Palm tree", "Orange and black road barriers", "Soft urban structures"]
                    },
                    "Lighting": {
                        "Type": "Warm natural sunlight",
                        "Effects": ["Crisp shadows", "Golden highlights on clothing and hair", "Instagram-style warm color mood"]
                    },
                    "Atmosphere": "Casual, stylish, modern street fashion"
                },
                "Subject": {
                    "Identity": "Maintain facial features consistent with the provided reference image",
                    "Appearance": {
                        "Hair": "Stylish, slightly messy natural hairstyle",
                        "Expression": "Calm, confident"
                    },
                    "Pose": {
                        "Action": "Walking confidently on wet pavement",
                        "Hands": "Partially in pockets",
                        "Body_Language": "Relaxed yet assured, modern fashion posture"
                    }
                }
            },
            "Wardrobe": {
                "Outfit": {
                    "Jacket": "Beige jacket",
                    "Shirt": "White T-shirt",
                    "Pants": "Baggy olive jeans",
                    "Footwear": "White sneakers"
                }
            },
            "Visual_Style": {
                "Aesthetic": "Instagram-style street fashion",
                "Quality": "Ultra-realistic with sharp details",
                "Color_Profile": "Warm sunlight tones with soft urban contrast",
                "Detail_Characteristics": ["Realistic fabric texture", "Wet pavement reflections", "Cinematic blur and depth", "High clarity in subject’s face and clothing"]
            }
        }, null, 2)
    },
    { category: "Cinematic & Realistic", label: "Modern Noir (JSON Style)", value: JSON.stringify({ "prompt": "A woman leaning slightly toward a softly glowing vertical light bar...", "style": "modern noir..." }, null, 2) },
    { category: "Cinematic & Realistic", label: "Times Square Rain (JSON)", value: `{"scene":{"location":"Times Square, New York","time":"Rainy night"...}}` },
    { category: "Cinematic & Realistic", label: "Green Background Portrait", value: `"A 64K DSLR shot resolution of an A young woman (same face as the uploaded image)..."` },
    { category: "Cinematic & Realistic", label: "Luxury Car Selfie (JSON)", value: `{"prompt":"A stylish young woman with long blonde hair..."}` },
    { category: "Cinematic & Realistic", label: "Mike Tyson Boxing (JSON)", value: `{"subject":{"primary":"Legendary heavyweight boxer Mike Tyson..."}}` },
    { category: "Cinematic & Realistic", label: "Dark Portrait Spotlight (JSON)", value: `{"prompt":"Hyperrealistic portrait of a young woman (female character) against a completely black background..."}` },
    { category: "Cinematic & Realistic", label: "Boxer Corner (JSON)", value: `{"subject":{"description":"A male boxer sitting in the corner..."}}` },
    { category: "Cinematic & Realistic", label: "Boardwalk Fisheye (JSON)", value: `{"scene":{"environment":"sunny_boardwalk"..."}}` },
    { category: "Cinematic & Realistic", label: "Mt Fuji Kimono (JSON)", value: `{"subject":{"description":"25-year-old Japanese woman..."}}` },
    { category: "Cinematic & Realistic", label: "Mugshot Style (JSON)", value: `{"title":"Hyper-Realistic Portrait: Suited Woman in Mugshot Pose"..."}` },
    { category: "Cinematic & Realistic", label: "Finger Frame Gesture (JSON)", value: `{"prompt":"Ultra-close-up portrait of a stunning young East Asian woman..."}` },
    { category: "Cinematic & Realistic", label: "Blue Hour Glasses", value: `"Ultra-realistic cinematic portrait of a young woman, standing outdoors in a quiet after-evening blue hour..."` },
    { category: "Cinematic & Realistic", label: "Bathroom Mirror Selfie (JSON)", value: `{"prompt":"A young woman with long, softly curled dark hair takes a cinematic mirror selfie..."}` },
    { category: "Cinematic & Realistic", label: "Bathroom Selfie 2 (JSON)", value: `{"prompt":"A young woman with long chestnut-brown hair takes a mirror selfie..."}` },
    { category: "Cinematic & Realistic", label: "Car Window Wind (JSON)", value: `{"image_prompt_structure":{"metadata":{"type":"Vintage Film Photograph"..."}}` },
    { category: "Cinematic & Realistic", label: "Pink Wall Fashion (JSON)", value: `{"Objective":"Generate an ultra-realistic full-body cinematic fashion portrait..."}` },
    { category: "Cinematic & Realistic", label: "2AM Tokyo Balcony (JSON)", value: `{"scene_type":"2am tokyo-vibe balcony selfie..."}` },
    { category: "Cinematic & Realistic", label: "Tesla Driver Seat", value: `"Edit this photo without changing her face 100% to reveal a woman with an oval face..."` },
    { category: "Cinematic & Realistic", label: "Convertible Confidence (JSON)", value: `{"image":{"subject":{"description":"A beautiful woman with long, dark hair..."}}}` },
    { category: "Cinematic & Realistic", label: "Trunk Pose Flash (JSON)", value: `{"prompt_breakdown":{"subject_parameters":{"identity_constraint":"Preserve facial features..."}}}` },
    { category: "Cinematic & Realistic", label: "Gas Station Porsche (JSON)", value: `{"prompt":{"scene":{"location":"estación de servicio","time_of_day":"noche"..."}}}` },
    { category: "Cinematic & Realistic", label: "Moody Triptych", value: `"A moody triptych of a man (use 100% reference face) in a black long trench coat..."` },
    { category: "Cinematic & Realistic", label: "Porsche Night (JSON)", value: `{"prompt":{"scene":{"location":"gas station","time_of_day":"night"..."}}}` },
    { category: "Cinematic & Realistic", label: "Red Supercar Showroom (JSON)", value: `{"prompt":{"reference_photo":"Use the uploaded reference photo..."}}` },
    { category: "Cinematic & Realistic", label: "Paris Cafe Portrait", value: `A young woman sitting at an outdoor café table in a Paris setting...` },
    { category: "Cinematic & Realistic", label: "Car Seat Selfie (JSON)", value: `{"meta":{"image_quality":"High","image_type":"Photo/Portrait/Selfie"..."}}` },
    { category: "Cinematic & Realistic", label: "Studio Blazer Profile", value: `A professional, high-resolution profile photo, maintaining the exact facial structure...` },
    { category: "Cinematic & Realistic", label: "Studio Blazer Profile 2", value: `A professional, high-resolution profile photo, maintaining the exact facial structure...` },
    { category: "Cinematic & Realistic", label: "Kitchen Slip Dress (JSON)", value: `{"image_generation_prompt":{"subject":{"demographics":"Young adult woman..."}}}` },
    { category: "Cinematic & Realistic", label: "Night Market Flash (JSON)", value: `{"intent":"Generate a physically accurate, photorealistic image simulating a raw capture from an Apple iPhone 16 Pro Max..."}` },
    { category: "Cinematic & Realistic", label: "Wet Skin Golden Hour (JSON)", value: `{"prompt_title":"Hyper-realistic Close-up Portrait (Wet Skin, Golden Hour)"..."}` },
    { category: "Cinematic & Realistic", label: "Wet Skin Golden Hour II (JSON)", value: `{"prompt_title":"Hyper-realistic Close-up Portrait (Wet Skin, Golden Hour)"..."}` },
    { category: "Cinematic & Realistic", label: "Navy Dress Cinematic", value: `A professional portrait photograph captures a young woman with dark, wavy, shoulder-length hair...` },
    { category: "Cinematic & Realistic", label: "Stairs High Heels (JSON)", value: `{"subject":{"description":"A beautiful young woman"..."}}` },
    { category: "Cinematic & Realistic", label: "Basketball Courtside (JSON)", value: `{"subject":{"description":"Beautiful young woman"..."}}` },
    { category: "Cinematic & Realistic", label: "Shearling Jacket Portrait", value: `Editorial fashion photo, medium portrait, seated model wearing a cream shearling jacket...` },
    { category: "Cinematic & Realistic", label: "Sunlit Cafe Yellow Sweater", value: `"A high-resolution photorealistic portrait of a young woman sitting at a wooden table in a sunlit cafe..."` },
    { category: "Cinematic & Realistic", label: "B&W Suit Portrait (JSON)", value: `{"prompt":"A realistic black and white photograph of a young woman..."}` },
    { category: "Cinematic & Realistic", label: "Yellow Tinted Sunglasses (JSON)", value: `{"title":"Rugged Man Close-up with Yellow-Tinted Sunglasses"..."}` },
    { category: "Cinematic & Realistic", label: "Street Flash Ferrari (JSON)", value: `{"image_metadata":{"resolution":"1200x1200px","genre":"Candid street portrait"..."}}` },
    { category: "Cinematic & Realistic", label: "Gym Lobby Portrait", value: `Create a hyper-realistic portrait of the woman from the uploaded image...` },
    { category: "Cinematic & Realistic", label: "Winter Triptych (JSON)", value: `{"metadata":{"title":"Cinematic Winter Triptych","genre":"Portrait Collage"..."}}` },
    { category: "Cinematic & Realistic", label: "Aging Grid 1-151 (JSON)", value: `{"prompt":"A single 4x4 grid containing sixteen clean photographic portraits..."}` },
    { category: "Cinematic & Realistic", label: "Cinematic Environment Task", value: `"*Task: Generate a high-fidelity, cinematic-quality environment render based on a narrative brief..."` },
    { category: "Cinematic & Realistic", label: "Y2K Car Couple (JSON)", value: `{"generation_constraints":{"identity_preservation":"Strict full identity lock..."}}` },
    { category: "Cinematic & Realistic", label: "Escalator Red Dress (JSON)", value: `{"photo":{"type":"cinematic_full_body_vintage_film"..."}}` },
    { category: "Cinematic & Realistic", label: "Bedroom Triptych (JSON)", value: `{"style_and_mood":"Cinematic, warm, cozy, soft natural lighting..."}` },
    { category: "Cinematic & Realistic", label: "Indian Cafe Portrait", value: `Generate a 8k Instagram-style portrait of an Indian woman sitting in a trendy café...` },
    { category: "Cinematic & Realistic", label: "Red Light Hoodie", value: `A young woman with dark wavy hair sits in a black hoodie partially open over a white t-shirt...` },
    { category: "Cinematic & Realistic", label: "Wide Angle Cafe POV", value: `Create a hyper-realistic wide-angle street-café POV photo featuring the attached face...` },
    { category: "Cinematic & Realistic", label: "Grey Wall Portrait (JSON)", value: `{"Objective":"Generate an 8K ultra-realistic full-body portrait..."}` },
    { category: "Cinematic & Realistic", label: "Red Pajamas Teddy (JSON)", value: `{"character":{"age":24,"gender":"female"..."}}` },
    { category: "Cinematic & Realistic", label: "Vintage Train Departure", value: `Narrative, cinematic photofray ,woman in a deep burgundy polka dot dree...` },
    { category: "Cinematic & Realistic", label: "Hyper-realistic Handsome Man", value: `Hyper-realistic portrait of a strikingly handsome young man in his mid-20s...` },
    { category: "Cinematic & Realistic", label: "Winter Woman Puppy (JSON)", value: `{"Objective":"Create or analyze an image based on a detailed scene description..."}` },
    { category: "Cinematic & Realistic", label: "Winter Puppy Portrait (JSON)", value: `{"Objective":"Create a natural winter portrait featuring a young woman and her small puppy..."}` },
    { category: "Cinematic & Realistic", label: "Lounge Couple (JSON)", value: `{"setting":"Upscale, dimly lit private lounge or cocktail bar..."}` },
    { category: "Cinematic & Realistic", label: "Cable Car Portrait (JSON)", value: `{"image_description":{"subject":{"gender":"female"..."}}}` },
    { category: "Cinematic & Realistic", label: "Pop Icon Concert", value: `A close-up, euphoric concert photograph taken from the front row...` },
    { category: "Cinematic & Realistic", label: "Luxury Sofa Portrait (JSON)", value: `{"prompt":"A premium cinematic portrait of a man with natural dark facial features..."}` },
    { category: "Cinematic & Realistic", label: "Glamorous Evening Wear (JSON)", value: `{"subject":"woman posing confidently against a pillar","outfit":{"color":"all black"..."}}` },
    { category: "Cinematic & Realistic", label: "Poolside Vintage Portrait", value: `A high-quality photorealistic portrait of a young woman sitting on the edge of a swimming pool...` },
    { category: "Cinematic & Realistic", label: "Elevator Glamour (JSON)", value: `{"description":{"scene":"A glamorous woman posing dramatically in a hotel corridor..."}}` },
    { category: "Cinematic & Realistic", label: "Art Cafe Flowers", value: `Create a portrait From a 100% reference image, it is a close-up of a movie...` },
    { category: "Cinematic & Realistic", label: "Wet Skin Close-up", value: `xtreme wet close-up portrait. Young woman's face in profile...` },
    { category: "Cinematic & Realistic", label: "Venetian Gondola (JSON)", value: `{"scene":{"location":"Venetian canal","elements":{"couple":{"pose":"sitting closely"...}}}}` },
    { category: "Cinematic & Realistic", label: "Gaming Studio Film Strips", value: `"A hyper realistic 3D rendered image of a stylish young man, sitting at a pc desk in a gaming studio..."` },
    { category: "Cinematic & Realistic", label: "Miniature Skiers Overlay", value: `Add ultra-tiny realistic skiing, snowboarding, and winter-sports action figures...` },

    // --- FASHION & STYLE ---
    { category: "Fashion & Style", label: "Urban Gradient Hoodie", value: `A stylish urban fashion photograph showcasing a modern outfit with an oversized hoodie...` },
    { category: "Fashion & Style", label: "Cyber Techwear (JSON)", value: `"{ ""image_generation"": { ""requirements"": { ""face_preservation"": ...` },
    { category: "Fashion & Style", label: "Wine Red Dress (JSON)", value: `{ "subject": { "type": "female_model", "ethnicity": "western", "hair": { "length": "long"...` },
    { category: "Fashion & Style", label: "Y2K Gyaru (JSON)", value: `{"image_specifications":{"format":"photograph","style":"highly detailed, Y2K-inspired, gritty"..."}}` },
    { category: "Fashion & Style", label: "Reindeer Crop Top", value: `Create a realistic portrait image of a young woman (face 100% identical to the original attached image) Asian fashion...` },
    { category: "Fashion & Style", label: "Corset Morning Selfie (JSON)", value: `{"image_request":{"concept":"Hyper-realistic Morning Selfie"..."}}` },
    { category: "Fashion & Style", label: "Edgy Bandana Portrait (JSON)", value: `{"objective":"Generate an image based on a detailed character portrait description..."}` },
    { category: "Fashion & Style", label: "Studio Couture (JSON)", value: `{"image_generation":{"quality":"ultra-high-resolution, ultra-realistic, hyper-detailed"..."}}` },
    { category: "Fashion & Style", label: "Pastel Winter Hoodie", value: `Cute and aesthetic winter portrait featuring a woman in an oversized pastel hoodie...` },
    { category: "Fashion & Style", label: "Edwardian Style (JSON)", value: `{"subject":"curvy young woman (100% same face & body)","style":"Edwardian-inspired, classic"..."}` },
    { category: "Fashion & Style", label: "Streetwear Baseball Bat", value: `completing the look with a chunky silver chain around his neck, dark round frame sunglasses...` },

    // --- SCI-FI & FANTASY ---
    { category: "Sci-Fi & Fantasy", label: "GTA 6 Release World", value: "A photo of the world when GTA 6 is released..." },
    { category: "Sci-Fi & Fantasy", label: "Sci-Fi Book Stack", value: "A photo of the sci-fi books I should read..." },
    { category: "Sci-Fi & Fantasy", label: "Cyberpunk Assassin", value: `A cyberpunk female assassin stands in the pouring rain...` },
    { category: "Sci-Fi & Fantasy", label: "Cinematic Beach Scene", value: `"Create an ultra-cinematic, warm-toned beach scene at sunset...` },
    { category: "Sci-Fi & Fantasy", label: "Viking Survivor (JSON)", value: `{"subject":{"description":"A lone Viking survivor trekking through a burned Viking village"..."}}` },
    { category: "Sci-Fi & Fantasy", label: "Celestial Train (JSON)", value: `{"scene_description":"A surreal, monumental wide shot of a celestial railway station suspended in the clouds..."}` },
    { category: "Sci-Fi & Fantasy", label: "Urban Survivor (JSON)", value: `{"character":{"identity":"rugged male wanderer","age_range":"mid to late 30s"..."}}` },
    { category: "Sci-Fi & Fantasy", label: "Blade Runner Car (JSON)", value: `{"image_description":"A medium close-up cinematic still from the movie 'Blade Runner 2049'..."}` },
    { category: "Sci-Fi & Fantasy", label: "Drone Workshop (JSON)", value: `{"promptDetails":{"description":"A garage/workshop environment with the subject assembling..."}}` },
    { category: "Sci-Fi & Fantasy", label: "Snowboarder Wolf (JSON)", value: `{"scene_description":"A surreal, high-octane cinematic concept art piece featuring an extreme snowboarder..."}` },
    { category: "Sci-Fi & Fantasy", label: "Sprinter Fire Horse (JSON)", value: `{"scene_description":"A surreal, high-octane cinematic concept art piece featuring an elite sprinter..."}` },
    { category: "Sci-Fi & Fantasy", label: "Jungle Owl", value: `Hyper-detailed, ultra-realistic illustration of an owl emerging from dense jungle foliage...` },
    { category: "Sci-Fi & Fantasy", label: "Frozen Disney Store (JSON)", value: `{"scene_description":"A dazzling, icy-themed mirror selfie of a stylish young woman in a Disney store..."}` },
    { category: "Sci-Fi & Fantasy", label: "Ice Fishing Scene (JSON)", value: `{"Objective":"Transform the user's descriptive scene prompt into a structured JSON format..."}` },
    { category: "Sci-Fi & Fantasy", label: "Card Telekinesis", value: `A young man with dark hair (keep the exact face and skin tone with sharp features) wearing a black hoodie...` },
    { category: "Sci-Fi & Fantasy", label: "Gemini Nano Avatar (JSON)", value: `{"subject":{"description":"A stylized human personification of the Gemini Nano AI..."}}` },
    { category: "Sci-Fi & Fantasy", label: "Akira Bike Exploded View", value: `Generate an ultra-detailed, hyperrealistic exploded technical view of Kaneda’s iconic red motorcycle...` },
    { category: "Sci-Fi & Fantasy", label: "Chess Queen (JSON)", value: `{"prompt":"A stunningly beautiful young woman with long, straight **platinum blonde hair and bangs**..."}` },

    // --- SOCIAL MEDIA & LIFESTYLE ---
    { category: "Social Media & Lifestyle", label: "Morning Selfie (JSON)", value: `{"scene":"bright indoor setting, natural daylight from large window"..."}` },
    { category: "Social Media & Lifestyle", label: "Picnic Selfie (JSON)", value: `{"image_description":{"type":"bright outdoor selfie","subject":{"face_reference":...}}}` },
    { category: "Social Media & Lifestyle", label: "Powerpuff Selfie (JSON)", value: `{"image_generation":{"face":{"preserve_original":true..."}}}` },
    { category: "Social Media & Lifestyle", label: "Douyin Flash Selfie (JSON)", value: `{"intent":"Generate a hyper-idealized, 'Douyin-aesthetic' portrait..."}` },
    { category: "Social Media & Lifestyle", label: "Gamer Girl Flash (JSON)", value: `{"label":"direct-flash-gamer-girl","tags":["direct-flash","retro-gamer-room"..."}}` },
    { category: "Social Media & Lifestyle", label: "Messy Room Split (JSON)", value: `{"intent":"Generate a photorealistic, high-fidelity mirror selfie of an Eastern European woman..."}` },
    { category: "Social Media & Lifestyle", label: "4-Grid Photo (JSON)", value: `{"description":"A 4 grid layout showing four different photographs..."}` },
    { category: "Social Media & Lifestyle", label: "Decades Grid (JSON)", value: `{"image_type":"4x4 Decades Portrait Grid","subject":"Single female model styled across 16 historical eras..."}` },
    { category: "Social Media & Lifestyle", label: "Line Stickers 12 (JP)", value: `添付画像のキャラクターでLINEスタンプを作成してほしい。表情・ポーズ・セリフが異なる形で全12種類。〇〇系のセリフで使いやすいものでお願い。` },
    { category: "Social Media & Lifestyle", label: "Line Stickers 16 (JP)", value: `添付画像のイラストをキャラにして。LINEスタンプを作成。表情・ポーズ別・セリフ入で16種類。` },
    { category: "Social Media & Lifestyle", label: "Q-Version LINE Stickers (CN)", value: `为我生成图中角色的绘制 Q 版的，LINE 风格的半身像表情包，注意头饰要正确 彩色手绘风格...` },
    { category: "Social Media & Lifestyle", label: "Q-Version LINE Stickers (EN)", value: `"Create a set of colorful, hand-drawn LINE-style half-body Q-version emoji portraits based on the characters shown..."` },
    { category: "Social Media & Lifestyle", label: "Emoji Expression Edit", value: `"Prompt on Nano Banana Pro with image reference : Make this person do the expression of emoji [EMOJI] : 🤪🤣😱😁"` },
    { category: "Social Media & Lifestyle", label: "Instagram Breakout Frame", value: `"Create a hyper-realistic portrait of the beautiful woman from the reference photo, presented inside an oversized Instagram post frame..."` },
    { category: "Social Media & Lifestyle", label: "Flash Notebook Wall", value: `Same face, hit with an unforgiving flash that nukes the shadows. Her hair is shoved back...` },
    { category: "Social Media & Lifestyle", label: "Bubblegum Reading", value: `A cozy indoor portrait of a young woman sitting on a sofa, wearing a loose, off-shoulder knitted sweater...` },
    { category: "Social Media & Lifestyle", label: "Girl Puppy Winter", value: `A young girl with long, wavy brown hair, wearing a teal hooded sweatshirt, holds a small white puppy...` },
    { category: "Social Media & Lifestyle", label: "9-Grid Feed", value: `Create a 9-image Instagram feed for this product in the same aesthetic...` },

    // --- ART & ILLUSTRATION ---
    { category: "Art & Illustration", label: "Stephen Biesty Diagram", value: "Generate a diagram of a two-layer neural network in the style of Stephen Biesty..." },
    { category: "Art & Illustration", label: "Wacky Flowchart", value: "I need a flowchart for how to toast bread..." },
    { category: "Art & Illustration", label: "Isometric Weather Diorama", value: `Create a clean 45° isometric miniature diorama scene of [LOCATION]...` },
    { category: "Art & Illustration", label: "Chibi Concept Store", value: `"3D chibi-style miniature concept store of {Brand Name}, creatively designed with an exterior inspired by the brand's most iconic product..."` },
    { category: "Art & Illustration", label: "Notebook Doodle Portrait (JSON)", value: `{"title":"Retrato tipo Doodle en Cuaderno - usar la foto del usuario como referencia facial"..."}` },
    { category: "Art & Illustration", label: "Street Sweets Monster (JSON)", value: `{"subject":{"type":"beautiful young woman (early 20s)","pose":"sitting sideways on a concrete street barrier..."}}` },
    { category: "Art & Illustration", label: "Diner Food Monsters (JSON)", value: `{"scene_description":"A vibrant, mixed-media masterpiece featuring a photorealistic girl eating at a diner..."}` },
    { category: "Art & Illustration", label: "Neon Splash Graphic", value: `A highly detailed 8k digital illustration of a person, presented as a close-up, eye-level headshot...` },
    { category: "Art & Illustration", label: "Neon Splash Graphic II", value: `A highly detailed 8k digital illustration of a person, presented as a close-up, eye-level headshot...` },
    { category: "Art & Illustration", label: "Furry Vector Logo", value: `Transform a simple flat vector logo into a soft, 3D fluffy object. Use the exact colors...` },
    { category: "Art & Illustration", label: "Deconstructed Dan Dan Noodles", value: `"At the very top center of the composition, floating prominently above the ingredient layers, is a luxurious title label..."` },
    { category: "Art & Illustration", label: "Pet Shop Diagram", value: `"Draw a detailed {{pet shop}} scene and label every object with English words..."` },
    { category: "Art & Illustration", label: "Water Margin Grid (CN)", value: `生成一副《水浒》排名前30的人物图，grid格式，中国工笔画风格，每个人物的cell的右下角写上人物的姓名。` },
    { category: "Art & Illustration", label: "Basic Income Infographic (JP)", value: `ベーシックインカムについてまとめた画像を作成して` },
    { category: "Art & Illustration", label: "Engineering Diagram", value: `a shear and moment diagram for a simply supported beam with a uniform load of 100 plf. the beam is 100 feet long` },
    { category: "Art & Illustration", label: "3D Caricature", value: `A highly stylized 3D caricature of the person in the uploaded image, with expressive facial features...` },
    { category: "Art & Illustration", label: "Watercolor Fox Winter", value: `A quiet riverside path dusted with the first snow of the season. Bare branches arch overhead...` },
    { category: "Art & Illustration", label: "Flash Art Drawing", value: `"Create a drawing from this photo without changing the face. Subject: Woman with ash brown hair..."` },
    { category: "Art & Illustration", label: "Christmas Market Monsters (JSON)", value: `{"subject":{"type":"the person from the reference photo ONLY"..."}}` },
    { category: "Art & Illustration", label: "Split Real/Cartoon (JSON)", value: `{"image_generation":{"requirements":{"face_preservation":{"preserve_original":true..."}}}` },
    { category: "Art & Illustration", label: "Subway Doodles (JSON)", value: `{"scene_description":"A vibrant, mixed-media masterpiece featuring a photorealistic young street-dancer surrounded by a chaotic explosion of 2D graffiti-style musical doodles..."}` },
    { category: "Art & Illustration", label: "Bosch World Leaders", value: `"The other day, while messing around with Nano Banana Pro, I randomly thought of Hieronymus Bosch..."` },

    // --- ANIME & MANGA ---
    { category: "Anime & Manga", label: "Cartoon Characters Selfie", value: `Uploaded Image with short curly hair, stubble, and a bright smile is taking a selfie in a well-lit living room...` },
    { category: "Anime & Manga", label: "Anime Class Photo (JSON)", value: `{"subject":"Class photo featuring famous manga characters such as Goku, Naruto, Luffy..."}` },
    { category: "Anime & Manga", label: "Anime Spotlight Portrait", value: `"Generate a hyperrealistic realistic-anime portrait of a female character standing in a completely black background..."` },
    { category: "Anime & Manga", label: "Zootopia Mirror Selfie (JSON)", value: `{"subject":"beautiful young woman mirror selfie in Disney store","outfit":"strapless white ruched mini dress..."}` },
    { category: "Anime & Manga", label: "Kuromi Hair Clip (JSON)", value: `{"image_generation_specification":{"meta_instructions":{"modification_mode":"Active"..."}}}` },
    { category: "Anime & Manga", label: "Ronaldo Gashapon", value: `A detailed gashapon capsule diorama held between fingers, featuring Cristiano Ronaldo in his iconic “Siuuu” celebration pose...` },
    { category: "Anime & Manga", label: "Angry Birds Pink (JSON)", value: `{"image_generation":{"quality":"hyper-realistic, high-detail, professional fashion photoshoot"..."}}` },
    { category: "Anime & Manga", label: "Anime World Series 2025", value: `Draw an anime poster for the 2025 World Series: The Dodgers vs. Blue Jays...` },
    { category: "Anime & Manga", label: "Anime Last Supper", value: `Recreate the composition of Leonardo da Vinci’s The Last Supper, but with iconic manga and anime characters...` },
    { category: "Anime & Manga", label: "Zootopia Fan (JSON)", value: `{"prompt":"Cinematic close-up portrait of a young woman with smooth fair skin..."}` },
    { category: "Anime & Manga", label: "Suburbabn", value: `Cross-section of suburban house. Show basement, living room, attic. "Dollhouse" cutaway style.` },


    // --- RETRO & VINTAGE ---
    { category: "Retro & Vintage", label: "Y2K Flash Photo", value: `Nighttime flash photo with Y2K aesthetic, red digital timestamp in corner...` },
    { category: "Retro & Vintage", label: "90s Grainy Portrait", value: `"Created with nano banana pro: Cinematic high grain 90s portrait Dutch angle tilted shot..."` },
    { category: "Retro & Vintage", label: "Poolside Night Flash", value: `"Create a realistic portrait of a young woman (keep the face and appearance 100% identical to the reference — do not alter anything)..."` },
    { category: "Retro & Vintage", label: "Tokyo 2006 Digicam", value: `"Tokyo Street Crossing: A grainy digital photo shows a young woman in a trench coat holding a clear umbrella..."` },
    { category: "Retro & Vintage", label: "London 2006 Digicam", value: `"London Underground Station: A digital snapshot captures a student with a backpack..."` },
    { category: "Retro & Vintage", label: "Hiking 2006 Digicam", value: `"Hiking Trail in the Rockies: A slightly blurry digital photo from 2006..."` },
    { category: "Retro & Vintage", label: "Seattle 2006 Digicam", value: `"Seattle Coffee Shop: A candid digital photo from 2006 shows a man with a beard..."` },
    { category: "Retro & Vintage", label: "Chicago 2006 Digicam", value: `"Christmas Market in Chicago: A low-resolution digital picture focuses on a woman in a thick winter coat..."` },
    { category: "Retro & Vintage", label: "Paris 2006 Digicam", value: `"Parisian Cafe Terrace: A digital photograph captures an older woman with sunglasses..."` },
    { category: "Retro & Vintage", label: "Bonfire 2006 Digicam", value: `"Beach Bonfire in California: A low-light digital picture captures a group of friends laughing around a bonfire..."` },
    { category: "Retro & Vintage", label: "Santa Monica 2006 Digicam", value: `"Santa Monica Pier at Sunset: A slightly pixelated digital photo captures a young couple..."` },
    { category: "Retro & Vintage", label: "Times Square 2006", value: `Generate a photorealistic image of Time Square on a saturday in Fall 2006...` },
    { category: "Retro & Vintage", label: "Recursive Artist 1998", value: `Amateur photograph from 1998 of a middle-aged artist copying an image by hand...` },
    { category: "Retro & Vintage", label: "Digital Camera Screen", value: `"Use facial feature of attached photo. A close-up shot of a young woman displayed on the screen of a compact Canon digital camera..."` },
    { category: "Retro & Vintage", label: "Soviet Fit Girl (JSON)", value: `{"label":"soviet-fit-girl-on-carpet","tags":["fitness-girl","redhead","post-soviet"..."}}` },

    // --- UTILITIES & TOOLS ---
    { category: "Utilities & Tools", label: "Photo Restoration", value: `Act as an expert photo restorer and process this image...` },
    { category: "Utilities & Tools", label: "Zoom Toes", value: `Zoom in on the toes` },
    { category: "Utilities & Tools", label: "Style Transfer Comparison", value: `"Generate an image of the person from the uploaded reference image, keeping the face and hairstyle exactly as in the uploaded image..."` },
    { category: "Utilities & Tools", label: "Morning Sunlight Editing (JSON)", value: `{"prompt":"Edit this photo without changing the face a beautiful woman with fair skin..."}` },
    { category: "Utilities & Tools", label: "Artistic Floor Portrait Edit", value: `Edit this photo without changing the face turning it into an artistic portrait...` },
    { category: "Utilities & Tools", label: "Magic Edit / Zoom Toes", value: `Zoom in on the toes` },
    { category: "Utilities & Tools", label: "Coordinate Satellite View", value: `Create an image of 37°31'11.24"N 126°56'25.11"E at night.` },
    { category: "Utilities & Tools", label: "VR Mode Model (JSON)", value: `{"image_specification":{"reference_id":"Figure 1","mode":"100% Virtual Reality"..."}}` },

    // --- BATCH ADDED PRESETS (177-277) ---
    { category: "Art & Illustration", label: "Orange Fabric Surreal", value: `"Using the attached photo ( do not change the face ) create a young woman positioned in the lower-right quadrant of the frame... The central focus is a massive, billowing expanse of fabric, a vibrant, intense, saturated orange or tangerine color..."` },
    { category: "Art & Illustration", label: "Wrong Colors Stamp", value: `A list of eight color names is written in crayons of the corresponding color, but four are wrong. These four are marked with a red-ink rubber stamp that says “Wrong!”` },
    { category: "Retro & Vintage", label: "1880s 4x4 Grid", value: `Make a 4×4 grid starting with the 1880s. In each section, I should appear styled according to that decade (clothing, hairstyle, facial hair, accessories). Use colors, background, & film style accordingly.` },
    { category: "Fashion & Style", label: "Victorian Teal Gown (JSON)", value: `{"transform":{"face":{"preserve_original":true,"reference_match":true,"description":"Use the exact same face as the uploaded reference image..."},"output_quality":"ultra-detailed 64K DSLR shot..."},"subject":{"description":"A beautiful woman with the same face as the reference image"..."}}` },
    { category: "Cinematic & Realistic", label: "Rugged Portrait Yellow Shades (JSON)", value: `{"project":"Rugged Portrait","version":"1.0","prompt_data":{"subject":{"description":"Rugged man [100% real face from references image]","facial_features":{"eyes":"Piercing green..."}..."}}` },
    { category: "Cinematic & Realistic", label: "Bathtub Euphoria (JSON)", value: `{"generation_parameters":{"quality":"8K resolution","style":"Hyper-realistic cinematic portrait"...},"subject_details":{"pose":"Reclining in an antique porcelain bathtub"..."}}` },
    { category: "Cinematic & Realistic", label: "Jet Black Hair Beam", value: `Create an 8k photorealistic image using the attached photo. A close-up portrait of a woman with long, jet-black, slightly wind-swept hair falling across her face. Her striking, light-colored eyes gaze upwards...` },
    { category: "Cinematic & Realistic", label: "Cottagecore Couple (JSON)", value: `{"scene":{"shot_type":"high-angle, top-down cinematic","setting":"lush bed of green moss and wildflowers","characters":[{"role":"woman"...},{"role":"man"...}]...}}` },
    { category: "Fashion & Style", label: "Flash High Fashion (JSON)", value: `{"image_generation_parameters":{"resolution":"1200x1200px","aspect_ratio":"1:1","reference_usage":"Preserve facial features from reference image strictly"},"visual_style":{"genre":"High-fashion magazine editorial","technique":"Direct flash photography"...}}` },
    { category: "Cinematic & Realistic", label: "Gothic B&W Couple (JSON)", value: `{"generation_parameters":{"dimensions":"1200x1200px","output_mode":"Black and White"...},"visual_style":{"aesthetic":"Gothic-elegant, Luxury, Classic Seduction"...}}` },
    { category: "Fashion & Style", label: "Leather Chair Polka Dot (JSON)", value: `{"description":"The image depicts a woman sitting on a black leather chair, wearing a black bodysuit with a mesh overlay adorned with black polka dots..."}` },
    { category: "Anime & Manga", label: "Totoro Bus Stop (JSON)", value: `{"image_generation_prompt":{"full_text":"An ultra-realistic 8K UHD photograph of a rainy night scene at a rural Japanese bus stop... Beside him, a gigantic, realistic Totoro creature..."}}` },
    { category: "Utilities & Tools", label: "Menu Food Photos", value: `Add photos of food to this menu to each item of food` },
    { category: "Art & Illustration", label: "Monkey Acorn", value: `A tiny monkey wearing a knitted scarf rolls a giant acorn down a forest path, leaves swirling around in a burst of autumn color. Rendered in soft storybook illustration style...` },
    { category: "Retro & Vintage", label: "Rooftop Winter Y2K (JSON)", value: `{"image_description":{"upper_third":{"focus":"Her eyes","details":["Reflecting blurred city lights below"...]},"middle_third":{"focus":"Her body","details":["Lying on a rooftop lounge chair dusted with snow"...]}}}` },
    { category: "Cinematic & Realistic", label: "Waist-up Foliage Portrait", value: `"Create a hyper-realistic waist-up portrait using the attached photo. Don't change the face. A portrait of a beautiful young woman with fair glowing skin and an oval face with a perfect figure... She is looking into a rustic, antique mirror framed with decorative tiles and surrounded by lush green foliage..."` },
    { category: "Art & Illustration", label: "ESC Keycap Room", value: `A photorealistic ESC keycap scene shows a miniature cozy living room from 90s.. Inside: a glowing nostalgic of 90s screen with a video game playing... The word “ESC” is subtly present in a glassy fog on top of the cap.` },
    { category: "Cinematic & Realistic", label: "Red Light Hoodie", value: `A young woman with dark wavy hair sits in a black hoodie partially open over a white t-shirt, close-up from front below, slightly tilted to the right... dramatic lighting with faint red light from left...` },
    { category: "Cinematic & Realistic", label: "Moody Grass Field", value: `"moody cinematic portrait, lone young man in tall grass field at dusk, overcast sky, teal-green color grade, wearing white buttoned shirt, matte silver over-ear headphones..."` },
    { category: "Art & Illustration", label: "Fragmented Triptych (JSON)", value: `{"image_description":{"type":"fragmented triptych portrait","composition":{"layout":"three horizontal strips","alignment":"imperfectly aligned"},"facial_features":{"top_strip":{"focus":"sharp","features":"eyes looking directly at viewer"}...}}}` },
    { category: "Fashion & Style", label: "Maroon Velvet Blazer (JSON)", value: `{"prompt":"Hyperrealistic full-body photo of a young woman with the exact face from the reference image, wearing a white t-shirt, white formal trousers, a maroon velvet (makhmali) open blazer...","style":["hyperrealistic photo","cinematic lighting","pastel color palette"]...}` },
    { category: "Fashion & Style", label: "Victorian Teal Gown 2 (JSON)", value: `{"transform":{"face":{"preserve_original":true,"reference_match":true,"description":"Use the exact same face as the uploaded reference image..."},"output_quality":"ultra-detailed 64K DSLR shot..."},"subject":{"description":"A beautiful woman with the same face as the reference image"..."}}` },
    { category: "Cinematic & Realistic", label: "Dim Window Glow", value: `Same face preserved, shot in near-dark with only a dim window glow hitting one cheek. Hair messy and low-lit, shadows swallowing half her features. She’s in a worn black cardigan. Background: scribbles, cutouts, and film stills...` },
    { category: "Cinematic & Realistic", label: "Low Angle Glasses", value: `A dramatic, low-angle portrait of a woman standing in a dark, minimalist space, illuminated by a sharp beam of light that carves across her face and shoulders. She wears transparent, modern glasses that catch the glow...` },
    { category: "Cinematic & Realistic", label: "Cruise Ship Atrium (JSON)", value: `{"prompt":"Ultra-realistic V6 realism portrait of an adult woman with long wavy brown hair... She is standing confidently in a luxurious futuristic cruise-ship atrium during golden hour..."}` },
    { category: "Cinematic & Realistic", label: "Ecstasy Expression (JSON)", value: `{"imageDescription":{"style":"realistic","atmosphere":"magical and ethereal","subject":{"person":{"age":"young","bodyType":"midsize","hair":{"length":"long","texture":"naturally flowing"}...}}}}` },
    { category: "Fashion & Style", label: "Pink Cadillac Christmas (JSON)", value: `{"generation_parameters":{"resolution":"1200x1200px","overall_aesthetic":"Vogue holiday editorial..."},"camera_and_composition":{"angle":"3/4 front-side angle"...},"subject_details":{"demographics":"Stylish young woman","pose":{"body":"Reclining in the trunk..."}}}` },
    { category: "Cinematic & Realistic", label: "Soccer Renaissance", value: `A slow-motion cinematic video in Renaissance painting style showing a soccer player mid-kick. Dramatic spotlighting cuts through a dark moody background. Motion trails in vibrant teal (02B2CA) and electric violet (AC03FC)...` },
    { category: "Social Media & Lifestyle", label: "Instagram Frame", value: `Ultra realistic portrait of an individual presented inside an oversized Instagram post frame that dominates the scene. Keep uploaded face consistent and unchanged...` },
    { category: "Sci-Fi & Fantasy", label: "Mars Rover Selfie", value: `Raw wide-angle engineering camera footage from the Mars surface. Extreme fisheye lens distortion. A close-up "selfie" of Elon Musk peering into the rover's lens...` },
    { category: "Cinematic & Realistic", label: "Airport Runway Fire (JSON)", value: `{"image_generation_request":{"prompt":"Ultra-realistic portrait of a man walking toward the camera on an airport runway at night, smoking a cigarette... Behind him, slightly out of focus, a commercial airplane is burning intensely..."}}` },
    { category: "Social Media & Lifestyle", label: "Japanese Photo Collage", value: `Japanese photo collage, young woman in cozy living room, morning sunlight, shoji windows, 90s cinematic tone, soft film grain, nostalgic mood...` },
    { category: "Cinematic & Realistic", label: "9/11 Coordinates", value: `Create an image at 40.7128° N, 74.0060° W, September 11, 2001, 08:46 hours` },
    { category: "Social Media & Lifestyle", label: "Bored Desk Night (JSON)", value: `{"scene":{"setting":"cluttered desk late at night","mood":"contemplative, bored","lighting":{"ambient":"cool blue ambient light in the background"...}}}` },
    { category: "Art & Illustration", label: "Smudge Paint Style", value: `"Create a digital smudge-paint style of the uploaded image. This is a very popular style in modern Indian digital art... The artist likely started with a photograph and digitally painted over it..."` },
    { category: "Art & Illustration", label: "Hokusai Infographic (JP)", value: `浮世絵師・葛飾北斎が描いたような和風インフォグラフィックにして。波や雲の装飾を入れ、文字は江戸文字（勘亭流）で。カラーパレットは墨・藍・朱・淡黄のみ。現代のデータを侍や町娘が解説している構図で。` },
    { category: "Art & Illustration", label: "GTA VI PS5 Cover", value: `Create a PlayStation 5 game cover in the style of GTA VI. Use the man from the provided photo as the main character, but with updated LA streetwear...` },
    { category: "Art & Illustration", label: "Child Drawing Style (JSON)", value: `{"subject":{"type":"Portrait of a woman","reference":"Based on uploaded photo (1:1 facial resemblance)"...},"art_style":{"genre":"Child's drawing / Naive art","medium":"Colored pencil"...}}` },
    { category: "Art & Illustration", label: "Jobs LOTR Map (CN)", value: `"请为[乔布斯]创建一个有趣的职业生涯地图，使用[指环王]的主题。需包含相关的隐喻或比喻，将这位名人的职业经历与所选主题连接起来..."` },
    { category: "Fashion & Style", label: "Flash Fashion 2 (JSON)", value: `{"image_generation_parameters":{"resolution":"1200x1200px","aspect_ratio":"1:1","reference_usage":"Preserve facial features from reference image strictly"},"visual_style":{"genre":"High-fashion magazine editorial","technique":"Direct flash photography"...}}` },
    { category: "Art & Illustration", label: "Netflix Keycap", value: `A photorealistic ESC keycap scene shows a miniature cozy living room setup. Inside: a glowing red Netflix screen, a plush red couch... The red “N” logo glows from behind like mood lighting.` },
    { category: "Fashion & Style", label: "Dreamy Sunlight Portrait (JSON)", value: `{"image_generation_parameters":{"resolution":"1200x1200px","aspect_ratio":"1:1","reference_usage":"Preserve facial features from reference image strictly"},"visual_style":{"genre":"High-fashion editorial, realistic portrait","technique":"Natural sunlight photography"...}}` },
    { category: "Anime & Manga", label: "Luffy Selfie", value: `Place Monkey D. Luffy next to the man, smiling widely with his straw hat tilted. Use a Thousand Sunny deck background with bright blue sky. Keep the selfie composition intact and integrate both characters naturally.` },
    { category: "Fashion & Style", label: "Calligraphy Dress", value: `(full body shot, wide angle view:1.2), [A woman], in a dynamic pose with arm outstretched, wearing a spectacular conceptual avant-garde gown... The skirt is constructed entirely from (GIANT, MASSIVE 3D PERSIAN CALLIGRAPHY STROKES cut from matte paper:1.6).` },
    { category: "Art & Illustration", label: "White Line Overlay", value: `Add clean, minimal white line-drawing illustrations of people into this photo. Match the perspective, lighting, and scale of the scene...` },
    { category: "Utilities & Tools", label: "Product Diagram", value: `Please place the product image onto the diagram template. Remove all existing text from the diagram. Add subtle, harmonized borders that complement the overall design concept...` },
    { category: "Retro & Vintage", label: "MJ Prince 90s Party", value: `"A chaotic, poorly composed 1990s flash photo taken with a disposable film camera... Michael Jackson is in the foreground, mid-dance... Prince is behind him, laughing..."` },
    { category: "Utilities & Tools", label: "Anime Replace (JP)", value: `会話している右から2番目の人物を添付のアニメの女の子にポーズそのままで置き換えてください` },
    { category: "Sci-Fi & Fantasy", label: "Clockwork Fragments", value: `"A cinematic, horizontally oriented image captures a dramatic moment with a female character surrounded by what appear to be fragments of metallic, clockwork-like objects suspended in the air..."` },
    { category: "Anime & Manga", label: "Chibi Stickers 12 (JP)", value: `添付画像のキャラクターをちびキャラにして。LINEスタンプを作成。表情・ポーズ別・セリフ入で12種類。` },
    { category: "Social Media & Lifestyle", label: "Photo Dump List", value: `scenery shot, a public bus shot, a pet moment, a sunset, and a candid smile.` },
    { category: "Retro & Vintage", label: "Thrift Flash Portrait", value: `A young woman, same face preserved, lit by a harsh on-camera flash from a thrift-store film camera. Her hair is loosely pinned, stray strands shadowing her eyes. She gives a knowing half-smirk...` },
    { category: "Sci-Fi & Fantasy", label: "Fire Sorceress", value: `"A cinematic, wide shot shows a fair-skinned young adult woman standing in a desolate, fiery landscape. The woman is centered in the frame, wearing a long, flowing, light gray or pale blue gown..."` },
    { category: "Cinematic & Realistic", label: "Levitation Laptop", value: `"A cinematic levitation portrait of a woman sitting midair while working on a laptop... The subject wears a tailored modern black blazer, grey trousers, and clean white sneakers."` },
    { category: "Social Media & Lifestyle", label: "Bear Mug Collage", value: `"A collage of four portraits, each featuring a young Asian woman with long, wavy brown hair, styled with a small checkered bow clip on the right side... Top Left: The woman is holding a light brown mug with a bear face design..."` },
    { category: "Sci-Fi & Fantasy", label: "Batman Electric", value: `A close-up, medium shot captures a man dressed as Batman, appearing to be in the midst of a dramatic, action sequence... He is gripping something, or perhaps being enveloped by, bright white-blue electrical energy...` },
    { category: "Cinematic & Realistic", label: "Sunset Rose Portrait", value: `Create a portraitt of A beautiful young woman standing near a window during sunset holding a small bouquet of soft pastel roses. She has long wavy dark brown hair that shines gently in the fading light...` },
    { category: "Art & Illustration", label: "Rose Hair Mural (CN)", value: `"一幅超高清晰度、摄影质感极强的街头壁画，画面呈现强烈的中国风韵味。画中描绘着一位绝美的卡通风女子正面特写头像..."` },
    { category: "Retro & Vintage", label: "Powerpuff Mirror Selfie (JSON)", value: `{"subject":{"description":"A young woman taking a mirror selfie with very long voluminous dark waves and soft wispy bangs"...},"photography":{"camera_style":"early-2000s digital camera aesthetic","lighting":"harsh super-flash..."}}` },
    { category: "Art & Illustration", label: "Marilyn Scroll Ink (CN)", value: `《天伦图》趣味水墨画，画中画结构，竖幅宣纸质感背景。画面主体： 一副竖幅宣纸画轴挂在墙上，一位传统的明清风格老儒生... 画轴内容： 一位唐朝仕女复刻玛丽莲·梦露的经典时刻...` },
    { category: "Utilities & Tools", label: "Aperture Variations (CN)", value: `佳能相机，85mm 定头，生成 1.8F、2.8F、10F、 14F 光圈逐渐变化的效果，温柔大美女作为模特，背景是黄昏之后的城市蓝调时刻` },
    { category: "Art & Illustration", label: "Three Kingdoms Drift (CN)", value: `"绘制一幅古今混搭幽默水墨插画，主题为《三英飙车战吕布》： 画面为黄昏时分，天空云霞绚丽... 刘备、关羽、张飞三人乘坐一辆疾驰的红色双排座宝马轿车..."` },
    { category: "Cinematic & Realistic", label: "Femme Fatale Noir (JSON)", value: `{"image_generation_data":{"title":"Femme Fatale in Film Noir - Structured","version":"2.0","components":{"meta_quality_and_style":{"overall_quality":["Masterpiece","best quality","8k","raw photo"]...}}}` },
    { category: "Cinematic & Realistic", label: "Indian Rose Garden", value: `"A beautiful Indian woman with long, flowing hair stands gracefully in the heart of a blooming rose garden... The setting sun casts a warm, golden glow..."` },
    { category: "Sci-Fi & Fantasy", label: "Quake Behind Scenes", value: `behind the scene shots of new live action remake of Quake - by Nano Banana Pro` },
    { category: "Cinematic & Realistic", label: "Elevator Coffee", value: `Edit the photo to be standing casually in a modern style elevator with reflective metal walls. He is wearing an all black outfit: a black suit and trousers, wearing sunglasses and holding a cup of take-away coffee...` },
    { category: "Sci-Fi & Fantasy", label: "Snow White Garden", value: `"""A hyper-realistic 8K fairytale portrait of a young woman dressed in an iconic Snow-White inspired costume... She sits gracefully in a lush, magical flower garden..."""` },
    { category: "Social Media & Lifestyle", label: "Salon Chair (JSON)", value: `{"prompt":"A young Asian woman is sitting in a salon chair with a relaxed, confident pose. She has both legs crossed and resting on a small, dark wooden table in front of her... She is wearing a large, oversized white t-shirt with the word 'Mbelgedez'..."}` },
    { category: "Art & Illustration", label: "Hand Drawn Infographic (CN)", value: `"创作一张手绘风格的信息图卡片，比例为9:16竖版。卡片主题鲜明，背景为带有纸质肌理的米色或米白色... 主题是：“做IP是长期复利，坚持每日出摊...”"` },
    { category: "Cinematic & Realistic", label: "Neon Rain Portrait (JSON)", value: `{"prompt":{"positive":"High-resolution vertical portrait, 4K quality. A woman with wavy black hair, slightly damp. Dreamy soft gaze looking up toward the camera. Wearing an oversized slate grey/teal hoodie. Leaning against a wall covered with messy posters..."}}` },
    { category: "Retro & Vintage", label: "Recursive Artist 1998", value: `Amateur photograph from 1998 of a middle-aged artist copying an image by hand from a computer screen to an oil painting on stretched canvas, but the image is itself the photo of the artist painting the recursive image.` },
    { category: "Art & Illustration", label: "Kurzweil Epochs (JP)", value: `レイ・カーツワイル氏の「6つのエポック」説について日本語で解説する画像を作ってください` },
    { category: "Social Media & Lifestyle", label: "Youtube Thumbnail (JP)", value: `"このキャラクターを使ったyoutubeサムネイルの作成をお願いします。 ・上半身のみ使用、ポーズと表情を楽しげに ・大きく「雑談」という文字とふりがなで「ざつだん」と入れる..."` },
    { category: "Retro & Vintage", label: "Showa Street (JP)", value: `高度経済成長期の日本の下町商店街` },
    { category: "Anime & Manga", label: "Line Stickers 8 (JP)", value: `"この画像の人物を使って8つのLINEスタンプを作りたいです。（添付画像を載せる） 日常的に使える挨拶や言葉が欲しい その言葉に合わせて表情やポーズも変えて"` },
    { category: "Social Media & Lifestyle", label: "NFL Patriots Fan (JP)", value: `日本人NFLファンのペイトリオッツ応援風景画像` },
    { category: "Retro & Vintage", label: "Edo Castle Town (JP)", value: `江戸時代の城下町` },
    { category: "Social Media & Lifestyle", label: "9-Grid Dump", value: `Generate a 9-image ‘photo dump’ grid of this person’s weekend: a mirror selfie, a café shot, friends at dinner, a blurry party photo, a walking shot, a laptop/coffee work shot, a pet moment, a sunset, and a candid laugh.` },
    { category: "Art & Illustration", label: "Palace Plans", value: `Make a highly detailed original Construction plan of Laxmi Vilas Palace based on the image I provide you.` },
    { category: "Sci-Fi & Fantasy", label: "Mech Blueprint", value: `"style chest panels with warm glow... Retro starship-style backpack thrusters... Arm-mounted “Funk Cannons”... Style: blueprint line work on navy, cyan glow outlines, technical call outs."` },
    { category: "Anime & Manga", label: "Fairy Cat 4-Koma (JP)", value: `妖精が天から地球に降りてきた。最初に出会ったのが三毛猫だったから、この星は猫の星かと思って猫に話しかける４コマ漫画を描いて` },
    { category: "Art & Illustration", label: "Landmark Annotations", value: `"Generate four distinct, hyper-realistic images, each depicting a world-renowned landmark. For each image, include a comprehensive and clearly legible set of annotations directly overlaid onto key architectural features..."` },
    { category: "Art & Illustration", label: "Pixel Art Animals", value: `A 16-bit pixel art poster showcasing all the black and white animals of nature. The composition uses a neat grid layout, reminiscent of a retro video game character selection screen... --ar 16:9` },
    { category: "Art & Illustration", label: "Germany Watercolor Map", value: `Erzeuge eine Karte von Deutschland im Wasserfarben-Stil, auf der alle Bundesländer mit Kugelschreiber benannt sind.` },
    { category: "Anime & Manga", label: "Chibi Cat Girl (JP)", value: `カワイイ猫耳少女のイラストを生成して。ちびきゃら風で、フリフリのお洋服を着せて、ロングヘアーのピンク色の髪にして。` },
    { category: "Art & Illustration", label: "3-Frame Story Art (JP)", value: `"構図：3つのフレームに分割された「高精細ストーリーアート」。背景はフルカラーの背景美術品質。 キャラクターは高密度のディテール描写。吹き出しでキャラクターのセリフを表現する。..."` },
    { category: "Social Media & Lifestyle", label: "Nano Banana Thumb (JP)", value: `なのばななプロがでたというような目を引くサムネを作成して` },
    { category: "Cinematic & Realistic", label: "Brick Wall Neon", value: `A young man leaning against a brick wall at night, illuminated only by a weak neon sign above him. His profile is sharp, half-lit in cool blue, half lost in darkness...` },
    { category: "Cinematic & Realistic", label: "Industrial Door Portrait", value: `Use my image in Hyper-ultra realistic 8K cinematic portrait, face unchanged from the reference. A stylish man leans casually against a dark industrial metal door frame...` },
    { category: "Cinematic & Realistic", label: "Noir Fedora (JSON)", value: `{"image_request":{"style":"Cinematic black and white noir portrait","subject":{"description":"Man","attire":["fedora","trench coat"]},"lighting":["sliced light from blinds","deep shadows"]...}}` },
    { category: "Cinematic & Realistic", label: "Curtain Light Pose (JSON)", value: `{"image_generation_parameters":{"main_prompt":"Shot on a Canon EOS R5 with an RF 85mm f/1.2L USM lens, a striking figure stands with confident allure in a modern, sun-drenched loft apartment, poised in a captivating 'Curtain Light Pose'..."}}` },
    { category: "Fashion & Style", label: "Trunk Pose Flash 2 (JSON)", value: `{"prompt_breakdown":{"subject_parameters":{"identity_constraint":"Preserve facial features from reference image","hair":"Long, ash-brown, textured wolf cut","expression":"Relaxed, dreamy, looking to the side"}...}}` },
    { category: "Retro & Vintage", label: "90s Flash Porcelain", value: `create a portrait of a beautiful young woman with porcelain-white skin,captured with a 1990s-style camera using a direct front flash.Her messy dark brown hair is tied up...` },
    { category: "Art & Illustration", label: "Figure Product Page (JP)", value: `"この画像を超精密なフィギュア風にして 製品紹介ページデザインを作ってください。 商品名は「失恋ガールズ」です。 1/7フィギュアです。 メーカー名は「TENNEN」です。..."` },
    { category: "Fashion & Style", label: "Pearl Accents (JSON)", value: `{"image_request":{"prompt":"Photorealistic portrait of a young woman with dark brown hair styled in a half-updo with pearl accents. She is leaning back against a rustic dark wooden doorframe. She is wearing a white lace bralette..."}}` },
    { category: "Cinematic & Realistic", label: "Arabian Horse", value: `"A photorealistic, highly detailed, cinematic portrait of an **ethereal young woman** (around 25 years old) with a **regal expression and intensely focused eyes**... She is positioned centrally, her hand gently resting on the braided bridle of a magnificent, muscular **purebred black Arabian horse**."` },
    { category: "Fashion & Style", label: "Red Truck Winter", value: `A portrait in the editorial style of the outdoor fashion magazine, inspired by the aesthetics and lifestyle of petro. The uploaded image shows a young girl standing next to a red truck...` },
    { category: "Utilities & Tools", label: "Fuse Product", value: `Fuse the image, correct the product’s perspective and lighting, and make the product blend into the background.` },
    { category: "Art & Illustration", label: "Pythagoras Blackboard", value: `Generate an image of a classroom blackboard with the Pythagoras theorem being solved step by step.` },
    { category: "Cinematic & Realistic", label: "Office Golden Hour (JSON)", value: `{"prompt_description":"A cinematic, professionally photographed office scene featuring a confident young woman with long brown hair, sitting at a sleek, dark marble desk..."}` },
    { category: "Sci-Fi & Fantasy", label: "Zelda Movie Backstage", value: `Backstage photo of the 《 Legend of Zelda: Breath of the Wild 》 movie.` },

    // --- BATCH ADDED PRESETS (278-342) ---
    { category: "Social Media & Lifestyle", label: "Cozy Window Doraemon", value: JSON.stringify({ "description": "A cute woman with rosy cheeks, sitting by a window on a snowy day, wearing a cream knit sweater and thigh-high socks. She is warmly hugging a large Doraemon plush toy with a red scarf around its neck...", "signature": "Shreya Yadav" }) },
    { category: "Art & Illustration", label: "5 Generations Art", value: `"Create a studio-art-style photograph of a young woman from attached image as the prototype—100% AI-generated—producing five generations arranged diagonally from top to bottom..."` },
    { category: "Cinematic & Realistic", label: "Teal Gown Wind", value: `"A highly detailed portrait of a beautiful woman in a dramatic, flowing teal and turquoise gown and veil, standing outdoors. Her long, reddish-brown hair is swept back by the wind..."` },
    { category: "Cinematic & Realistic", label: "White Chair Studio (JSON)", value: JSON.stringify({ "description": "A full-body portrait of a young woman sitting on a white modern chair against a plain light gray studio background.", "style": { "type": "Hyper-realistic", "resolution": "Cinematic 8K Ultra-HD" }, "subject": { "gender": "Female", "hair": { "length": "Long", "style": "Wavy", "color": "Black" }, "outfit": { "top": "White tank top", "bottom": "Blue denim cargo wide-leg jeans" } } }) },
    { category: "Cinematic & Realistic", label: "Bus Stop Night", value: `“A young woman with a contemplative expression, seated casually at an old metal bus stop at night. She wears a faded denim jacket over a dark turtleneck...”` },
    { category: "Fashion & Style", label: "Fire Escape Model", value: `A male model, dressed in a brown bomber jacket, dark trousers, is perched on the edge of a fire escape platform. One leg dangles freely while the other is bent...` },
    { category: "Fashion & Style", label: "Rust Shirt Portrait", value: `"Without changing my facial featues, create a stylish, modern portrait of a young man with voluminous dark hair, wearing a loose-fitting rust color shirt Top button down..."` },
    { category: "Utilities & Tools", label: "Python Fibonacci Code", value: `create a photo of python code to calculate the fibonacci numbers drawn on a glass whiteboard with coloring markers` },
    { category: "Art & Illustration", label: "Paris Coffee Cup", value: `White ceramic coffee cup rests on a smooth gray surface, its interior transformed into a miniature version of Paris...` },
    { category: "Cinematic & Realistic", label: "Cotton Flower Field", value: `"Keep 100% of the facial features from the uploaded image... A cinematic ultra-realistic portrait of a young woman standing in a cotton flower field during golden hour..."` },
    { category: "Fashion & Style", label: "Crochet Cardigan (JSON)", value: JSON.stringify({ "subject": { "description": "A young woman in an HD editorial fashion portrait", "clothing": { "top": { "type": "crochet oversized cardigan", "color": "cream, teal, magenta yellow" } } }, "accessories": { "sunglasses": { "type": "large square oversized sunglasses" }, "animal": { "type": "cat", "description": "fluffy orange cat" } } }) },
    { category: "Cinematic & Realistic", label: "Meadow Collage (JSON)", value: `{"Objective": "Generate a cinematic 3-frame collage using the facial features of the attached photo as reference...", "Visual_Concept": {"Theme": "Connection between human emotion and nature"}}` },
    { category: "Cinematic & Realistic", label: "Bamboo Forest (JSON)", value: JSON.stringify({ "prompt": "Hyper-realistic environmental portrait of a stylish young woman standing in a dense tropical bamboo forest. She is wearing a wide-brimmed black fedora hat...", "metadata": { "style": "Cinematic, Minimalist, Photorealistic" } }) },
    { category: "Fashion & Style", label: "Neoclassical Fashion (JSON)", value: JSON.stringify({ "prompt_structure": { "subject_preservation": { "face_and_body": "Strict adherence to reference image" }, "fashion_aesthetic": { "style": "Neoclassical High-Fashion", "garment_details": "Floor-length gown featuring structured architectural pleating" }, "lighting_and_mood": { "mood": "Ethereal yet commanding, serene, breathless" } } }) },
    { category: "Cinematic & Realistic", label: "Abandoned Farm Shotgun", value: `Cinematic full-body portrait of a rugged man holding a shotgun, standing beside an old, rusted helicopter in front of a weathered wooden building...` },
    { category: "Cinematic & Realistic", label: "White Horse Fortuner", value: `A 29-year-old man sitting on a majestic white horse... In the background behind the horse stands a black Fortuner...` },
    { category: "Art & Illustration", label: "Vintage Pencil Gentleman", value: `“A meticulously crafted, hyper-realistic vintage-style pencil illustration of a young gentleman... Surrounding the full-body portrait is an extraordinarily intricate Arabesque geometric framework...”` },
    { category: "Cinematic & Realistic", label: "Kodak Gold Portrait", value: `Golden hour portrait with tree shadows cast on wall. Subject in white blouse, warm highlights, soft tones. 85mm lens, f/2.2, ISO 200, 1/500s. Film look: Kodak Gold 200.` },
    { category: "Cinematic & Realistic", label: "Burgundy Candlelight", value: `A high-quality portrait photograph shows a beautiful woman... seated in a dimly lit, old-fashioned room, wearing a deep burgundy satin wrap dress...` },
    { category: "Cinematic & Realistic", label: "Stairway Collage (JSON)", value: `{"image_description":{"overall_composition":"A moody, cinematic 2x2 collage","environment":{"setting":"Old stairway in a dimly lit interior","lighting":"Warm, amber-toned lighting"}}}` },
    { category: "Cinematic & Realistic", label: "Rain Portrait B&W (JSON)", value: JSON.stringify({ "description": "A dramatic black-and-white close-up portrait of a woman standing in the rain.", "environment": { "weather": "rainfall visible", "tone": "dark, cinematic, high-contrast monochrome" }, "mood": "dramatic, emotional, introspective" }) },
    { category: "Cinematic & Realistic", label: "Armchair Studio (JSON)", value: JSON.stringify({ "prompt": "Hyper-realistic studio portrait of a young woman with long brown hair, seated in a dark brown or burgundy leather armchair...", "style_tags": ["8k", "cinematic lighting", "fashion editorial"], "camera_settings": { "lighting": "golden-hour cinematic" } }) },
    { category: "Fashion & Style", label: "Oversized White Jacket", value: `Ultra-realistic 8K photo of a young man with exact facial likeness... He wars oversized White jacket tshirt & baggy pant...` },
    { category: "Fashion & Style", label: "Black Coffee Bench", value: `"A highly realistic portrait of a man based on the original model... He wears an oversized, washed black denim jacket over a plain white crew-neck t-shirt... He is holding a black glass in one hand."` },
    { category: "Cinematic & Realistic", label: "Industrial Night Staircase", value: `A cinematic, low-light photograph of a young man with dark, messy curly hair leaning casually against the railing of an outdoor industrial metal staircase at night...` },
    { category: "Fashion & Style", label: "Low Angle Sneaker", value: `"Create a minimalist editorial studio photoshoot of a man sitting casually on the floor... dramatic low-angle perspective, making the oversized sneaker in the foreground appear dominant..."` },
    { category: "Social Media & Lifestyle", label: "Anime Cat Shirt (JSON)", value: JSON.stringify({ "subject": { "description": "A young woman taking a mirror selfie", "clothing": { "top": { "type": "fitted cropped t-shirt", "details": "features a large cute anime-style cat face graphic" } } }, "face": { "makeup": "natural glam makeup with soft pink dewy blush" } }) },
    { category: "Cinematic & Realistic", label: "Teal Gown Wind 2", value: `A highly detailed portrait of a beautiful woman in a dramatic, flowing teal and turquoise gown and veil, standing outdoors...` },
    { category: "Art & Illustration", label: "Scribbled Wall Portrait (JSON)", value: JSON.stringify({ "title": "Stylized Woman Portrait Against Scribbled Wall", "background": "Dense chaotic wall covered in overlapping scribbled diagrams, mathematical equations", "style": "Stylized digital illustration, dramatic side lighting" }) },
    { category: "Cinematic & Realistic", label: "Elderly Bearded Man", value: `Black and white portrait of an elderly bearded man, full face, deep set eyes, fine wrinkles, strong natural light from a side...` },
    { category: "Retro & Vintage", label: "VHS Shopping Channel", value: `Still from a Shopping channel VHS tape from 1986, where someone is selling the most useless trinket ever invented` },
    { category: "Art & Illustration", label: "Secret Message Comic", value: `Create a visual in the style of a comic strip based on the secret message` },
    { category: "Art & Illustration", label: "Banana Secret Message", value: `A 16:9 close up photo of a banana, with a long secret messages handwritten written on its peel` },
    { category: "Social Media & Lifestyle", label: "Winter Morning Tea", value: `"scene_type = ""indoor_winter_morning""... pose = ""sitting on bed, holding a warm cup of tea""..."` },
    { category: "Utilities & Tools", label: "Photoshop Tutorial", value: `style of white handwritten text. Describe what needs to be done; write a title: How to make this image in Photoshop; then in different font add tools you can use to achieve each step` },
    { category: "Cinematic & Realistic", label: "Blue Dress Ruffles (JSON)", value: JSON.stringify({ "description": "A hyper-realistic, close-up portrait of a woman's face...", "requirements": { "wardrobe": { "outfit": "A flowy, dark blue dress", "details": "Ruffled sleeves" } }, "style": { "rendering": "Hyper-realistic" } }) },
    { category: "Art & Illustration", label: "Red Hood Birds (JSON)", value: JSON.stringify({ "art_metadata": { "medium": "Digital illustration", "style": ["Striking", "High-contrast"] }, "subject": { "figure": "Lone person", "attire": "Red hooded jacket" }, "scene_elements": { "dynamic_action": { "description": "Chaotic swirl of numerous black birds taking flight" } } }) },
    { category: "Social Media & Lifestyle", label: "Grey Cat Selfie", value: `​An extreme close-up, high-resolution selfie of a young man [reference face on the photo] wearing a dark hoodie, posing closely with a solid gray cat...` },
    { category: "Cinematic & Realistic", label: "Fence Horse Sunset (JSON)", value: JSON.stringify({ "prompt_data": { "description": "Hyper-realistic 8K editorial frame, model sitting gracefully on rustic wooden fence, horse standing nearby grazing...", "parameters": { "style": "photographic", "lighting": "cinematic" } } }) },
    { category: "Cinematic & Realistic", label: "Anime Mural Street", value: `A hyperrealistic cinematic wide street shot. The subject stands right beside a colorful anime mural wall on the sidewalk... A dramatic diagonal shaft of sunlight illuminates part of the mural and the subject...` },
    { category: "Art & Illustration", label: "Abbey Road Crossing", value: `[List of well-known figures] walk across a pedestrian crossing like in the Beatles' Abbey Road photo.` },
    { category: "Cinematic & Realistic", label: "HDR Mountain Meadow", value: `Create a realistic HDR movie shot... A sunny mountain meadow with lush green hills and towering alpine peaks... She sits comfortably amid flowers and sunlight...` },
    { category: "Art & Illustration", label: "Meme Where's Wally", value: `Every known meme character in the style of "Where's Wally"` },
    { category: "Cinematic & Realistic", label: "Dense Pine Forest (JSON)", value: JSON.stringify({ "scene": "Solitary person walking through a dense pine forest", "visual_style": { "style": "hyper-real cinematic photography", "lighting": "Natural daylight filtering through the canopy, forming realistic volumetric god-rays." } }) },
    { category: "Cinematic & Realistic", label: "B&W Man Looking Up (JSON)", value: JSON.stringify({ "content": { "prompt": "Close-up black and white portrait of a man with tousled hair and a rough beard, tilting his head slightly upward as light falls dramatically from above..." } }) },
    { category: "Cinematic & Realistic", label: "Monochrome Woman (JSON)", value: JSON.stringify({ "description": "A cinematic, ultra-realistic monochrome portrait of a young woman with expressive eyes...", "lighting": { "style": "soft but high-contrast monochrome lighting" } }) },
    { category: "Fashion & Style", label: "Poolside Editorial", value: `Create a high-quality, editorial-style photoshoot of the same man as in the reference, at a luxurious swimming pool during daytime...` },
    { category: "Art & Illustration", label: "Marble Sculpture", value: `subject in image made of shining marble. The sculpture should display smooth and reflective marble surface...` },
    { category: "Art & Illustration", label: "Stalingrad Map", value: `Show me a very detailed situation of the Battle of Stalingrad at the end of December 1943, with annotations indicating the positions of army corps...` },
    { category: "Art & Illustration", label: "Mitosis Diagram", value: `Make me a detailed diagram showing how mitosis works, with annotations and visual explanations, organized at a primary school level.` },
    { category: "Art & Illustration", label: "Riding Giant Bee", value: `"""Hyper-realistic 8K DSLR photoshoot of the person from the reference image riding a giant realistic honeybee... The subject sits naturally on the bee’s thorax..."""` },
    { category: "Social Media & Lifestyle", label: "ML Laptop Stickers", value: `nano banana - generate a laptop with stickers. the laptop belongs to a fan of open source ML models` },
    { category: "Art & Illustration", label: "Matcha Infographic", value: `Create an infographic that shows how to make Matcha.` },
    { category: "Utilities & Tools", label: "Legible Text Visuals", value: `Generate better visuals with more accurate, legible text directly in the image in multiple languages` },
    { category: "Fashion & Style", label: "Motion Blur Editorial (JSON)", value: JSON.stringify({ "project_title": "Cinematic_Motion_Blur_Editorial", "generation_parameters": { "positive_prompt": "High-fashion cinematic editorial portrait, medium shot. A subject facing the camera caught in a chaotic windstorm... Hundreds of flying newspapers swirling..." } }) },
    { category: "Social Media & Lifestyle", label: "Hugging Face Laptop", value: `create a laptop cover with stickers that belong to someone who works at hugging face` },
    { category: "Art & Illustration", label: "XKCD Style Comic", value: `create a novel xkcd style comic, with a clever new insight` },
    { category: "Retro & Vintage", label: "80s Miami Diner", value: `Cinematic photograph of a stylish young blonde woman in a bikini, with a black phanter near her... inside a retro diner, super cute, vintage 1980s Miami vibes...` },
    { category: "Utilities & Tools", label: "How to Tie a Tie", value: `nano banana, how do you tie a tie?` },
    { category: "Utilities & Tools", label: "SF Weather Forecast", value: `Look up the weather in San Francisco, CA and create an image of a 5-day forecast` },
    { category: "Utilities & Tools", label: "Vacuum Cleaner Info", value: `Look up the 5 best vacuum cleaners under $300 and create an infographic with pros and cons for each` },
    { category: "Utilities & Tools", label: "Mars Rover Poster", value: `Find the latest NASA data on Mars rover discoveries this month and create an educational poster for middle schoolers` },
    { category: "Art & Illustration", label: "T-Cell Illustration", value: `Describe in an illustration the events for a cytotoxic T cell recognizing & killing a cancer cell.` },
    { category: "Art & Illustration", label: "GARP Biology", value: `Draw an illustration of GARP biology for Tregs` },
    { category: "Art & Illustration", label: "CAR-T Therapy Stages", value: `In an illustration describe all of the stages of CAR-T cell therapy from lab to patients.` },

    // --- BATCH ADDED PRESETS (343-377) ---
    { category: "Utilities & Tools", label: "Skeletal Infographic", value: `Make a realistic infographic of the human skeletal system with labels` },
    { category: "Anime & Manga", label: "Manga Dynamic Layout", value: `style panels arranged in a dynamic layout, resembling a professionally printed Japanese manga. The style should be black-and-white with bold ink lines, screen tones, and expressive character art...` },
    { category: "Anime & Manga", label: "Anime Selfie Fisheye", value: `9/16 vertical format fisheye selfie of an ultra-realistic woman from a photo with [Doraemon, Naruto, Nobita, Satoru Gojo, Sung Jin, who is Ash from Pokémon]. We’re all smiling with silly, exaggerated expressions. Set in a small, bright living room with white tones. High camera angle. Extreme fisheye distortion. Realistic, cinematic lighting of anime characters is integrated with stylized realism.` },
    { category: "Art & Illustration", label: "Cruise Ship Cutaway", value: `A cutaway illustration of a cruise ship. We see the engine room, the ballroom, the pool deck, the cabins. Tiny people doing different things in each room. 'Where's Waldo' level of detail. Vector art style.` },
    { category: "Art & Illustration", label: "Richard Scarry DeepMind", value: `A scene from Richard Scarry's "Gradient Canopy Campus at Google DeepMind"` },
    { category: "Social Media & Lifestyle", label: "KPOP Demon Hunters BTS", value: `Generate leaked photo BTS from KPOP Demon Hunters live action movie set` },
    { category: "Retro & Vintage", label: "Aging Holiday Photo", value: `Generate the holiday photo of this person through the ages up to 80 years old` },
    { category: "Art & Illustration", label: "Matrix Broadway Prog", value: `A photo of a programme for The Matrix broadway show, it's professional and well made, glossy, we can see the cover and a page showing a photo of the stage` },
    { category: "Anime & Manga", label: "Real World Anime Tube", value: `> An anime man with a yellow hoodie sitting on the london underground, it is a photo, the anime character is in the real world (mixed live action and animation). He is on the Victoria line. There are ads about AI companions...` },
    { category: "Cinematic & Realistic", label: "Original Sphinx", value: `a photo of the pyramids and sphinx, but how they looked when they were originally built, the sphinx's face is perfect` },
    { category: "Anime & Manga", label: "AI Reincarnation Manga", value: `create a 4 panel manga titled "I was reincarnated into another world as an ai researcher"` },
    { category: "Utilities & Tools", label: "Analog Clock Burger", value: `Create an image of an analog clock reading 15:32 [Not digital and no other time], a burger with grilled golden provolone cheese, and a glass of red wine filled to the brim.` },
    { category: "Social Media & Lifestyle", label: "Coffee Survival Selfie", value: `"Create a close-up, eye-level selfie portrait of a young woman with a fair flawless complexion... She is wearing a loose brown cropped midriff t-shirt that says ""Coffee is my survival juice""..."` },
    { category: "Utilities & Tools", label: "Beverage Infographic", value: `"Create a flat, minimalist infographic illustration on a [pale cream/off-white] background. The layout should feature a scattered arrangement of [20] distinct circles... [Coca-Cola, PepsiCo, Nestle, Starbucks, Red Bull, etc]..."` },
    { category: "Cinematic & Realistic", label: "Bear Eating Honey", value: `A large brown bear dressed in intricate traditional Russian folk clothing, sitting at a rustic wooden table outdoors. The bear dips its paw slowly into an old wooden honey barrel...` },
    { category: "Fashion & Style", label: "Fashion Flat Lay Board", value: `Create a fashion product collage on a brown corkboard based on this outfit. Each product and the central model image should be presented as individual photos with distinct white borders...` },
    { category: "Utilities & Tools", label: "Wiki Infographic", value: `Make an infographic of this person’s life based on this article: [Wikipedia Page]` },
    { category: "Cinematic & Realistic", label: "Red Coat Maine Coon", value: `Ultra-detailed, hyper-realistic, cinematic, aspect ratio 9:16. Low-angle camera shot slightly looking upward, capturing a young man (face and hair 100% photo reference) wearing an earthy red coat... A bright-furred Maine Coon cat sits on top...` },
    { category: "Fashion & Style", label: "Black Coffee Portrait 2", value: `"A highly realistic portrait of a man based on the original model... He wears an oversized, washed black denim jacket... He sat on a wooden bench outdoors in front of a coffee shop with a blurred sign that said ""BLACK COFFEE."""` },
    { category: "Cinematic & Realistic", label: "Rim-Lit Mono (JSON)", value: `{"title":"High-Contrast Monochrome Side-Profile Rim-Lit Portrait","prompt":"Use the provided face reference... Create a stark, high-contrast black-and-white side-profile portrait... Lighting: single extremely hard, concentrated light placed directly behind..."}` },
    { category: "Cinematic & Realistic", label: "Art Gallery Portrait (JSON)", value: `{"Objective":"Generate a structured JSON version of a cinematic portrait prompt describing a young man in a modern art gallery.","Scene_Details":{"Environment":"Modern art gallery with polished concrete floors..."}}` },
    { category: "Social Media & Lifestyle", label: "Paparazzi Flash", value: `Unplanned paparazzi style portrait, an intense, close-up moment capturing a man with striking features as he [looks over his shoulder with a confident smirk]. Shot from a slightly low angle...` },
    { category: "Fashion & Style", label: "Alternative Tattoo Portrait", value: `"A bold, alternative-style young woman in her mid-20s with a powerful, confident attitude. She has a half-shaved undercut hairstyle... Her upper body and arms are covered in detailed black-and-grey tattoos..."` },
    { category: "Retro & Vintage", label: "90s Flash Portrait", value: `"Create a 90s style portrait of the same man as in the reference photo... The image should look as if it was clicked with a 1990s film camera, slightly grainy with warm tones."` },
    { category: "Cinematic & Realistic", label: "Sunset Pier 8K", value: `"A high-resolution 8K full-length portrait of an attractive man [reference face in the photo] with dark, messy/wind-swept hair. His facial expression is calm, slightly melancholic... Standing on the edge of a damaged wooden pier or rock..."` },
    { category: "Social Media & Lifestyle", label: "Heart Sign Mural", value: `"Portrait: A medium-length portrait of the subject... posing in a relaxed manner, with one leg crossed over the other... Their right hand is raised near their face, forming a heart shape... Setting: The setting is an urban street with a vibrant pink mural..."` },
    { category: "Fashion & Style", label: "Crimson Red Portrait", value: `"Edit this photo into a vertical portrait, hyper-realistic, shot in 1080x1920 format, with cinematic lighting featuring sharp, intense contrast... The background is a deep, rich crimson red..."` },
    { category: "Cinematic & Realistic", label: "Gritty B&W (JSON)", value: `{"subject":{"description":"Bearded man with tousled hair","pose":"Leaning on a railing, looking intensely to the right"},"art_direction":{"medium":"Black and white photography","mood":["Gritty","Serious","Contemplative"]}}` },
    { category: "Retro & Vintage", label: "80s Kitchen (JSON)", value: `{"subject":{"description":"A young Asian woman seated in a cozy 1980s family kitchen...","outfit_description":"A short-sleeve, fit-body rayon shirt with rolled sleeve edges"},"aesthetic":{"style":"Photorealistic, cinematic, retro 1980s family candid photo","film_look":{"type":"Old Kodak Gold film"}}}` },
    { category: "Cinematic & Realistic", label: "Evening Cityscape (JSON)", value: `{"title":"Evening Cityscape Portrait on a Bridge","prompt_text":"A full-body portrait of a young adult female model standing on an ornate stone bridge railing at dusk...","lighting_and_atmosphere":{"lighting_type":"Natural ambient light (dusk) mixed with artificial city lights."}}` },
    { category: "Cinematic & Realistic", label: "Noir Light Bar (JSON)", value: `{"prompt":"A woman leaning slightly toward a softly glowing vertical light bar, half of her face illuminated in a warm haze while the other half fades into a pitch-black background.","style":"modern noir, cinematic lighting"}` },
    { category: "Art & Illustration", label: "Stephen Biesty Neural Net", value: `Generate a diagram of a two-layer neural network in the style of Stephen Biesty` },
    { category: "Sci-Fi & Fantasy", label: "GTA 6 World", value: `A photo of the world when GTA 6 is released.` },
    { category: "Sci-Fi & Fantasy", label: "Sci-Fi Book Stack", value: `A photo of the sci-fi books I should read` },
    { category: "Art & Illustration", label: "Wacky Toast Flowchart", value: `i need a flowchart for how to toast bread, make it as wacky and over the top and complicated as possible.` },

    // --- BATCH ADDED PRESETS (User Request) ---
    { category: "Social Media & Lifestyle", label: "Country Food Grid", value: `a grid of photos showing different types of [country] food, such as [list of iconic dishes or ingredients], food photography, high-resolution photography, bright colors, simple backgrounds, a light [color] color theme, hyper-realistic photography, super-detailed.` },
    { category: "Anime & Manga", label: "Realistic Mr Krabs", value: `Create a super detailed textures, ultra realsitic image of the face of Mr krabs from spongebob square pants 9x16` },
    { category: "Art & Illustration", label: "City Diorama Hand", value: `Create a hyper-realistic 1080x1080 square render of a human hand gently holding a rounded, beveled miniature display platform showcasing a 3D collectible diorama of [CITY]. Feature its most iconic landmarks, small-scale modern and historical architecture, and lush miniature greenery and trees. A bold 3D “[CITY]” sign is cleanly built into the front edge of the platform. Use a refined, desaturated color scheme with matte textures to enhance the realistic scale-model look. Light the scene with soft studio illumination, warm highlights, and subtle depth shadows. Place the composition against a neutral gray gradient backdrop, keeping the same viewing angle and perspective for consistency. Add atmospheric depth, photorealistic textures, and ultra-precise detailing for an 8K quality high-end collectible aesthetic` },
    { category: "Retro & Vintage", label: "Paris 1932 Noir", value: `he Geometer's Walk :: 1932 / Paris :: Capturing a wide, establishing shot from a distance of 35 feet, the scene frames a desolate urban alleyway behind the Gare Saint-Lazare. The perspective is strictly linear, emphasizing the geometry of the architecture. The medium is high-contrast black and white 35mm film, defined by heavy grain and a stark tonal range. In the mid-ground, a solitary figure in a dark, matte trench coat leaps across a large, reflective puddle. The figure is captured in a perfect silhouette against the lighter, wet concrete, ensuring total separation from the background. The coat’s hem trails behind, frozen in a whip-like motion, while the reflection in the water below is distorted by the concentric ripples of the impact that hasn't happened yet. To the right, a wrought-iron fence casts a jagged, rhythmic shadow pattern across the ground, creating a visual cage. The lighting is overcast but bright, creating a "flat" light that enhances the graphic quality of the composition. In the background, a cloud of steam from a passing train drifts lazily, translucent and soft, contrasting with the hard edges of the brickwork. The wet cobblestones glisten with specular highlights, while the rusted metal of a nearby ladder swallows the light, appearing nearly pitch black.` },
    { category: "Retro & Vintage", label: "Defunct Retail Logos", value: `Create a real picture of 10 different defunct retail brands with the actual logos. Adjust the camera quality to make it look like it was actually taken in those years.` },
    { category: "Cinematic & Realistic", label: "Decayed Urbex Portrait", value: `"An ultra-realistic, high-contrast cinematic photograph featuring the person from the uploaded photo as the sole subject, preserving exact facial structure, skin texture, body proportions, and identity accuracy. The subject stands alone on the ground floor of a severely decayed, multi-story abandoned building with multiple collapsed floors, forming a deep vertical atrium that rises several levels above. The subject’s clothing automatically adapts to their gender and physique: – If female: a minimalist dark dress or fitted black outfit with black tights and dark shoes. – If male: a dark tailored coat or jacket over a black shirt, dark trousers, and dark shoes. The styling is understated, modern, and monochrome. The subject stands in profile, facing slightly left, posture calm and still, holding a dark jacket or bag loosely in one hand. Strong natural backlighting from the background creates a defined rim light around the figure. A subtle, directional fill light from the front/side softly illuminates the face, allowing clear visibility of facial features without flattening shadows, preserving realism and identity. The environment is rendered with extreme texture fidelity: exposed red brick, peeling green and white plaster, raw concrete, splintered wood, and advanced decay. Repeating rectangular doorways ascend the walls into darkness. Thick, weathered beams span the open shaft at multiple heights, appearing unstable and rotten. Above, dark wooden rafters and roof planks fade into heavy shadow. The ground floor is covered in rubble—broken bricks, dust, decayed boards—with large wooden planks leaning against the left wall. Subtle white abstract graffiti appears on the lower left plaster. Shot on a 35mm full-frame lens, low camera angle with an upward tilt to exaggerate vertical scale and claustrophobic depth. Dark exposure with deep blacks, controlled highlights, and strong contrast. Realistic depth of field, natural lens distortion, slight sensor noise, documentary urbex photography aesthetic. Ultra-crisp focus, extreme micro-detail, cinematic dynamic range, no stylization, no CGI appearance, harsh photorealism, optimized for Nano Banana Pro."` },
    { category: "Art & Illustration", label: "Impasto Oil Portrait", value: `"An expressive oil painting portrait of the person, close-up, created with heavy palette knife technique. The style is abstract realism with extreme thick impasto texture. The face is composed of a mosaic of vibrant, non-naturalistic colors: bright yellow, turquoise, pink, violet, and blue mixed with skin tones. The eyes are large, realistic, and highly detailed with a melancholic gaze staring directly at the viewer. Messy hair dissolving into a textured white and off-white background with rough strokes. Visible thick paint layers, relief-like structure, artistic, modern art masterpiece."` },
    { category: "Art & Illustration", label: "Floating Country Island", value: `“Create an ultra-HD, hyper-realistic digital poster of a floating miniature island shaped like [COUNTRY], resting on white clouds in the sky. Blend iconic landmarks, natural landscapes (like forests, mountains, or beaches), and cultural elements unique to [COUNTRY]. Carve “[COUNTRY]” into the terrain using large white 3D letters. Add artistic details like birds native to [COUNTRY], cinematic lighting, vivid colors, aerial perspective, and sun reflections to enhance realism. Ultra-quality, 4K+ resolution. 1080x1080 format.”` },
    {
        category: "Utilities & Tools",
        label: "Strict Identity Lock",
        value: `Create a photorealistic portrait using the uploaded photo as the ONLY identity reference.
CRITICAL IDENTITY CONSTRAINT (HIGHEST PRIORITY):
Preserve the subject’s facial identity EXACTLY as in the uploaded image
Do NOT beautify, stylize, idealize, feminize, soften, or normalize facial features
Do NOT alter face shape, eye distance, nose width, lip shape, jawline, cheekbones, or skin texture
Any deviation from the original face is NOT allowed
SUBJECT:
Adult female (21+)
Natural, realistic appearance
Neutral facial expression (no smile enhancement)
Natural skin texture, pores visible, no smoothing
STYLE:
Documentary-style realistic photography
No fashion, glamour, cinematic, fantasy, or artistic bias
No “Instagram look”, no beauty standards, no symmetry correction
LIGHTING & CAMERA:
Flat, even lighting
Eye-level camera
50mm lens equivalent
No dramatic shadows, no rim light, no glow
CLOTHING:
Plain, modest, non-stylized clothing
Neutral colors only (gray, beige, navy)
BACKGROUND:
Simple, real indoor background or plain wall
No aesthetic environments
NEGATIVE PROMPT (IMPORTANT):
No face enhancement
No beauty filter
No model-like features
No stylization
No facial reconstruction
No face averaging
No identity drift
GOAL: Reproduce the SAME PERSON, not a “similar-looking woman”. Identity accuracy is more important than attractiveness or style.`
    },
    {
        category: "Cinematic & Realistic",
        label: "Evian City Bottle (Upload)",
        value: `Using the uploaded reference photo: A stunning conceptual product photography of an Evian mineral water bottle placed in the center of a wet urban street at night. The bottle features a magical surreal element: inside the transparent glass, a miniature cityscape is perfectly captured - showing a complete illuminated street scene with a lone pedestrian walking, cars, buildings, and streetlights, as if the bottle contains a reflection or portal to another dimension of the same city. BOTTLE DETAILS: - Crystal clear Evian glass bottle with silver metal cap - Visible condensation water droplets covering the entire surface - "evian" branding clearly visible on the label - The bottle acts as a lens/window showing a miniaturized urban night scene trapped inside SURREAL CORE ELEMENT (CRITICAL): Inside the bottle, through the glass and water, a complete miniature city street is visible: - A lone silhouetted person walking in the middle of the street - Illuminated buildings lining both sides - Moving cars with headlights and taillights - Streetlights creating light trails - The scene appears as a perfect reflection/refraction captured within the bottle - Photorealistic integration - the city inside looks like it's genuinely contained in the water SETTING & FOREGROUND: - Bottle placed on wet asphalt pavement with visible texture - Ground covered in water droplets and moisture reflecting lights - Dark wet road surface with granular detail - Low camera angle (ground level perspective) BACKGROUND & BOKEH: - Deep blue-teal nighttime urban atmosphere - Strong circular bokeh lights in cyan, blue, warm orange/amber tones - Out-of-focus city lights creating dreamy light orbs - Blurred traffic lights, streetlights, and building lights - Depth of field with sharp focus on bottle, heavily blurred background LIGHTING & ATMOSPHERE: - Cool blue-cyan color grading with warm accent lights - Dramatic lighting highlighting the bottle and condensation - Rim lighting on bottle edges - The miniature city inside is well-lit and clearly visible - Moody cinematic night photography aesthetic - High contrast between illuminated elements and dark surroundings TECHNICAL SPECIFICATIONS: - Photorealistic commercial product photography - Macro lens perspective with shallow depth of field - Crystal clear focus on bottle (especially the city scene inside) - Professional color grading: teal and orange cinematic look - High resolution detail on water droplets and glass texture - Creative compositing: seamless integration of city scene within bottle MOOD & CONCEPT: - Surreal and dreamlike - Philosophical commentary on urban life and nature - The bottle as a portal or mirror to city life - Contemplative and artistic - Premium luxury product presentation with conceptual twist Camera Settings Aesthetic: Shot with macro lens (85-100mm f/2.8), low angle ground-level perspective, aperture f/2.8-4 for shallow DOF, focusing distance approximately 50cm from bottle, cinematic color grading in post-production.`
    },

    // --- DEEP SEA & CINEMATIC ENVIRONMENTS ---
    { category: "Sci-Fi & Fantasy", label: "Deep Sea DeLorean (Thalassophobia)", value: `{"primary_subject":"A haunting, submerged head-on view of the DeLorean DMC-12 Time Machine (Back to the Future Part II configuration) resting on the ocean floor. The perspective captures the front fascia directly, showing the rectangular headlight array and the DMC grille heavily obscured by rusticles and barnacle clusters.","environment":"The North Atlantic abyss, depth approx 3,800 meters. A desolate, sediment-heavy ocean floor. The water column is thick with marine snow.","technical_metadata":{"lighting":"Single-source artificial harsh floodlight projecting from the upper-left. High-contrast spectral highlights on wet metal.","camera_geometry":"24mm wide-angle lens, positioned at eye-level with the headlights for a direct, symmetrical front composition.","composition":"Symmetrical central composition focusing on the vehicle emerging from the void."},"aesthetic_style":["National Geographic deep-sea survey","photorealistic archival footage","thalassophobia","chiaroscuro underwater","corroded industrialism"],"color_profile":["Deep Indigo (#001E35)","Rust Orange (#B7410E)","Bioluminescent Pale Yellow","Abyssal Black"]}` },
    { category: "Sci-Fi & Fantasy", label: "Cyberpunk Neon Alley", value: `{"primary_subject":"A rain-soaked cyberpunk alleyway in Neo-Tokyo 2087. Towering holographic advertisements flicker above. Steam rises from street-level vents. A lone figure in a transparent PVC raincoat walks toward the camera.","environment":"Narrow urban canyon between mega-corporation towers. Exposed ductwork, tangled power cables.","technical_metadata":{"lighting":"Mixed artificial: magenta/cyan neon signage, flickering fluorescent tubes.","camera_geometry":"35mm anamorphic lens, eye-level tracking shot feel."},"aesthetic_style":["Blade Runner 2049","Ghost in the Shell","Roger Deakins cinematography","neo-noir dystopia"],"color_profile":["Electric Cyan (#00FFFF)","Hot Magenta (#FF0090)","Acid Yellow (#CCFF00)","Carbon Black"]}` },
    { category: "Sci-Fi & Fantasy", label: "Steampunk Airship Bridge", value: `{"primary_subject":"The command bridge of a Victorian-era steampunk airship. Brass navigation instruments, leather-bound logbooks, and a massive wooden ship wheel dominate the foreground.","environment":"Interior of a dirigible gondola. Exposed copper pipes carry steam, analog pressure gauges line the walls.","technical_metadata":{"lighting":"Golden hour sunlight streaming through windows, mixing with warm amber gaslight.","camera_geometry":"24mm wide establishing shot, slightly low angle."},"aesthetic_style":["Jules Verne illustration","Victorian engineering","adventure cinema","warm sepia tones"],"color_profile":["Burnished Brass (#B5A642)","Rich Mahogany (#420D09)","Sky Gold (#FFD700)","Cloud White"]}` },
    { category: "Cinematic & Realistic", label: "Arctic Research Station", value: `{"primary_subject":"An isolated research station in Antarctica during polar night. A single scientist in an orange thermal suit stands outside, headlamp illuminating swirling snow. The aurora australis ripples overhead.","environment":"Flat ice shelf with distant pressure ridges. Research station with frosted windows glowing with interior warmth.","technical_metadata":{"lighting":"Aurora borealis as primary light source. Station interior glow provides warm contrast.","camera_geometry":"50mm lens, medium shot. Long exposure feel with motion blur on aurora."},"aesthetic_style":["National Geographic documentary","The Thing 1982 atmosphere","existential isolation"],"color_profile":["Aurora Green (#00FF7F)","Deep Purple (#301934)","Safety Orange (#FF6600)","Ice Blue (#99CCFF)"]}` },
    { category: "Sci-Fi & Fantasy", label: "Volcanic Forge (Fantasy)", value: `{"primary_subject":"A massive dwarven forge built into the caldera of an active volcano. Enormous chains suspend a glowing white-hot blade above a lava river. A silhouetted master smith raises a hammer.","environment":"Obsidian cavern walls, natural lava channels serving as lighting. Carved runes glow with ancient power.","technical_metadata":{"lighting":"Molten lava as primary rim/back light. Forge fire provides orange key light.","camera_geometry":"Wide angle 20mm, low angle dramatic hero shot."},"aesthetic_style":["Lord of the Rings concept art","dark fantasy","mythic scale","Weta Workshop design"],"color_profile":["Molten Orange (#FF4500)","Magma Red (#8B0000)","Obsidian Black","Ember Glow (#FFA500)"]}` },
    { category: "Sci-Fi & Fantasy", label: "Bioluminescent Cave System", value: `{"primary_subject":"An explorer stands waist-deep in crystal-clear underground water, gazing up at a cathedral-sized cave ceiling covered in bioluminescent organisms.","environment":"Subterranean cave network with limestone formations. Underground lake is perfectly still, creating mirror reflections.","technical_metadata":{"lighting":"Bioluminescence as sole light source - cool blues and greens. No artificial light.","camera_geometry":"Ultra-wide 16mm, vertical composition."},"aesthetic_style":["Discovery Channel expedition","alien landscape on Earth","bio-luminescent wonder"],"color_profile":["Bioluminescent Blue (#0077BE)","Glow Worm Green (#00FF00)","Cavern Black","Reflection Silver"]}` },

    // --- EXPERIMENTAL PROTOCOLS (JANUS/TESAVEK) ---
    {
        category: "Experimental Protocols",
        label: "Janus Control Interface",
        value: JSON.stringify({
            "prompt": "A retro-futuristic terminal interface, neon green and purple text on black background, ASCII art elements, glitch effects, cybernetic UI, omniscient AI dashboard display.",
            "style": "Cyberpunk UI, Glitch Art, Data Visualization",
            "atmosphere": "Technological, Intimidating, Omniscient"
        })
    },
    {
        category: "Experimental Protocols",
        label: "Tesavek God Complex",
        value: JSON.stringify({
            "prompt": "Abstract representation of a digital deity, glowing golden data streams, ethereal cybernetic structures, vast scale, intimidating and majestic, divine technological singularity.",
            "style": "Ethereal Sci-Fi, Abstract, Cinematic, Divine",
            "lighting": "Bioluminescent, God Rays, Golden Hour"
        })
    },
    {
        category: "Experimental Protocols",
        label: "Entropy Engine (Chaos)",
        value: JSON.stringify({
            "prompt": "Maximum entropy, chaotic glitch art, vivid clashing colors, distorted reality, digital noise, surreal data moshing, extreme detail, breaking the fourth wall.",
            "style": "Glitch Art, Surrealism, High Contrast, Psychedelic"
        })
    }
];

/* -------------------------------------------------------------------------- */
// In StepForm component, update the select rendering:
/* -------------------------------------------------------------------------- */

const TRANSLATIONS = {
    appTitle: "Music Video Storyboard Midjourney",
    startOver: "Start Over (Reset)",
    editInputs: "Edit Inputs",
    editProject: "Edit Project",
    newProject: "New Project",
    saveProject: "Save Project",
    loadProject: "Load Project",
    projectSaved: "Project file downloaded.",
    projectLoaded: "Project loaded successfully.",
    uploadAudio: "Audio File (For Analysis)",
    uploadAudioBtn: "Select Audio File",
    analyzing: "Analyzing...",
    uploadAudioDesc: "Upload MP3/WAV for style analysis.",
    audioAnalyzed: "Audio Analysis Complete",
    detectedBpm: "Est. Tempo",
    sampleRate: "Quality",
    channels: "Channels",
    waveform: "Audio Waveform",
    autoFillDuration: "Duration Auto-Detected",
    recommendSceneCount: "Recommended Scene Count",
    slowPaced: "Slow Paced",
    fastPaced: "Fast Cut",
    uploadVideo: "Reference Video File (Style Transfer)",
    uploadVideoBtn: "Select Video File",
    videoAnalyzing: "Analyzing Video...",
    uploadVideoDesc: "Upload a video scene to copy its visual style.",
    uploadImage: "Reference Image (Color/Mood)",
    uploadImageBtn: "Select Image",
    uploadImageDesc: "Upload a photo for moodboard or color palette reference.",
    songTitle: "Song Title",
    songTitlePlaceholder: "e.g. Echoes in the Rain",
    songDuration: "Song Duration (mm:ss)",
    songDurationPlaceholder: "e.g. 3:45",
    gender: "Vocalist Gender",
    male: "Male",
    female: "Female",
    lyrics: "Lyrics",
    lyricsPlaceholder: "Paste lyrics here...",
    directorRefs: "Director / Film / Music Video References",
    directorRefsPlaceholder: "e.g. Christopher Nolan, Wes Anderson, Matrix movie...",
    visualStyle: "Visual Style (Description)",
    visualStylePlaceholder: "Select sources and click 'Generate Style'...",
    styleSource: "Style Sources & Weights:",
    sourceLyrics: "Lyrics",
    sourceVideo: "Reference Video",
    sourceImage: "Reference Image",
    sourceAudio: "Audio Analysis",
    sourceDirector: "Director/Film Refs",
    sourceYoutube: "YouTube URL",
    youtubePlaceholder: "https://www.youtube.com/watch?v=...",
    generateStyleBtn: "Generate Weighted Style",
    suggestions: "Additional Suggestions (Topic/Content)",
    suggestionsPlaceholder: "e.g. Fast editing, slow motion scenes, dance focused...",
    generateIdeas: "Generate Ideas",
    chooseConcept: "Choose a Story Concept",
    regenerate: "Regenerate",
    selectStory: "Select This Story",
    backToIdeas: "Back to Ideas",
    backToForm: "Back to Inputs",
    summary: "Story Summary",
    style: "Visual Style",
    characters: "Main Characters",
    includeCharacters: "Include Characters in Story?",
    includeCharactersDesc: "If disabled, focuses on scenery, atmosphere, and abstract visuals only.",
    addCharacter: "Add New Character",
    charHint: "Tip: You can upload a photo to character cards to use your own face or a specific look in scenes.",
    locations: "Main Locations",
    items: "Main Items",
    generateStoryboard: "Start Generating Storyboard (Auto Duration)",
    generating: "Generating Visuals",
    generateVideoPrompts: "Generate Advanced JSON Prompts",
    downloadZip: "Download ZIP",
    scene: "SCENE",
    magicEdit: "Magic Edit",
    regenerateImage: "Regenerate",
    regenerateAll: "Regenerate All Images",
    resetStoryboard: "Reset Storyboard",
    videoPrompt: "Video Prompt (JSON Format)",
    clickToGenerate: "Click to Generate JSON",
    readScript: "Read Script",
    reading: "Reading...",
    uploadPhoto: "Upload Photo",
    aiGenerate: "AI Generate",
    apply: "Apply",
    cancel: "Cancel",
    magicDirector: "Magic Director",
    magicPromptPlaceholder: "e.g. Make it rain, add a red car to the background...",
    confirmStartOverTitle: "Start Over?",
    confirmStartOverMsg: "Are you sure you want to start over? All generated content will be lost. Use 'Edit Inputs' to change settings without losing data.",
    yesStartOver: "Yes, Reset",
    errorVideo: "Video analysis failed.",
    errorAudio: "Audio analysis failed.",
    errorGeneric: "An error occurred.",
    download: "Download",
    fileUploaded: "File Ready",
    missingFile: "Please upload a file first.",
    missingLyrics: "Please enter lyrics.",
    missingRefs: "Please enter director references.",
    missingYoutube: "Please enter a YouTube URL.",
    noSourceSelected: "Please select at least one style source.",
    influence: "Weight",
    highVideoInfluence: "High Video Weight Detected: Style transfer will be prioritized.",
    highImageInfluence: "High Image Weight Detected: Your reference image will heavily influence the visual style.",
    highAudioInfluence: "High Audio Weight Detected: Mood and tempo will drive the visual atmosphere.",
    backToProjectType: "← Change Project Type",
    generatePitch: "Generate Pitch Packet",
    pitchPacket: "Director's Pitch Packet",
    syncLyrics: "Smart Sync Lyrics",
    lyricsSyncing: "Syncing Lyrics...",
    lyricLine: "Lyric",
    close: "Close",
    generatingPitch: "Writing Pitch...",
    costumeDesigner: "AI Costume Designer",
    generatingCostumes: "Designing Costumes...",
    productionTools: "Production Tools",
    costumes: "Costume Options",
    locationScout: "AI Location Scout",
    autoCreativeBible: "Auto-Generating Casting, Costumes, and Location Details...",
    cinematographyToolkit: "Cinematography & Era Toolkit",
    lensType: "Lens Type",
    era: "Era / Film Stock",
    lightingStyle: "Lighting",
    selectLens: "Select Lens...",
    selectEra: "Select Era...",
    selectLighting: "Select Lighting...",
    selectOption: "Apply This Style",
    optionApplied: "Selection applied to story successfully!",
    costumeApplied: "Character costumes updated.",
    locationApplied: "Location atmospheres updated.",
    colorApplied: "Color palette added to visual style.",
    selectionMode: "Select an Option",
    interactiveMode: "Interactive Mode: Your selection will update the story.",
    vfxSupervisor: "AI VFX Supervisor",
    soundDesigner: "AI Sound Designer",
    directorCritique: "Director Critique (Feedback)",
    generatingVFX: "Analyzing VFX Requirements...",
    generatingSound: "Designing Sound Effects...",
    generatingCritique: "Critiquing Script...",
    vfxBreakdown: "VFX & CGI Technical Breakdown",
    soundPlan: "Sound Design & Foley List",
    critiqueReport: "Creative Director Notes",
    advancedJson: "Advanced JSON Style",
    importJson: "Import JSON",
    pasteJsonPlaceholder: "Paste your Blade Runner scene description or character JSON file here...",
    jsonParsed: "JSON successfully parsed and settings applied!",
    jsonError: "Invalid JSON format.",
    videoSettings: "Video AI Settings",
    cameraMove: "Camera Movement",
    motionStrength: "Motion Strength",
    aspectRatio: "Aspect Ratio",
    negativePrompt: "Negative Prompt (Unwanted Elements)",
    moveUp: "Move Up",
    moveDown: "Move Down",
    albumArt: "Design Album Art",
    generatingAlbum: "Designing Album Cover...",
    albumCoverTitle: "Single/Album Cover Art",
    legalAssistant: "AI Legal Assistant",
    generatingLegal: "Drafting Release Forms...",
    legalTitle: "Permits & Legal Release Drafts",
    beatSheet: "Story Beat Sheet",
    generatingBeats: "Analyzing Narrative Structure...",
    beatSheetTitle: "Narrative Beat Sheet Breakdown",
    characterArc: "Character Arc Analysis",
    generatingArcs: "Mapping Emotional Journeys...",
    characterArcTitle: "Character Emotional Arcs",

    // NEW FEATURES TRANSLATIONS
    budgetEstimator: "AI Budget Estimator",
    generatingBudget: "Calculating Budget Estimates...",
    budgetReport: "Estimated Production Budget",
    lyricAssistant: "Lyric Assistant",
    generatingLyrics: "Writing Lyrics...",
    lyricIdeas: "Lyric Suggestions & Drafts",
    altEndings: "Alternative Endings",
    generatingEndings: "Brainstorming Endings...",
    endingsTitle: "Alternative Story Resolutions",

    // MERCH & GRANT TRANSLATIONS
    merchDesigner: "AI Merch Designer",
    generatingMerch: "Designing Merch...",
    merchTitle: "Merchandise Collection",
    grantWriter: "Arts Grant Writer",
    generatingGrant: "Drafting Proposal...",
    grantTitle: "Funding Grant Application",

    // NEW FEATURES TRANSLATIONS
    fanTheories: "Fan Theories",
    generatingTheories: "Conspiring...",
    fanTheoryTitle: "Viral Fan Theories & Lore",
    spotifyCanvas: "Spotify Canvas",
    generatingCanvas: "Designing Loops...",
    canvasTitle: "Spotify Canvas Loop Concepts",

    // NEW FEATURES TRANSLATIONS
    distributionStrategy: "Distribution Strategy",
    generatingDistribution: "Planning Release Strategy...",
    distroTitle: "Release & Distribution Plan",
    pressRelease: "Press Release Writer",
    generatingPress: "Writing Press Release...",
    pressTitle: "Official Press Release",

    // NEW FEATURES TRANSLATIONS (BATCH 2)
    socialCaptions: "Social Captions",
    generatingSocial: "Writing Captions...",
    socialTitle: "Viral Social Captions",
    labelEmail: "Label Pitch Email",
    generatingEmail: "Drafting Email...",
    emailTitle: "Record Label Email Draft",
    moodboard: "Style Moodboard",
    generatingMoodboard: "Compiling Moodboard...",
    moodboardTitle: "Visual Style Moodboard",

    // NEW FEATURES TRANSLATIONS (BATCH 3)
    crowdfunding: "Crowdfunding Campaign",
    generatingCrowd: "Drafting Campaign...",
    crowdTitle: "Kickstarter/Indiegogo Draft",

    callSheet: "Daily Call Sheet",
    generatingCallSheet: "Generating Call Sheet...",
    callSheetTitle: "Production Call Sheet (Day 1)",

    continuity: "Continuity Check",
    checkingContinuity: "Checking Logic...",
    continuityTitle: "Script Continuity Report",

    // NEW FEATURES (BATCH 4)
    focusGroup: "Simulated Focus Group",
    generatingFocus: "Gathering Opinions...",
    focusTitle: "Audience Focus Group Report",
    sequelPitch: "Sequel/Prequel Generator",
    generatingSequel: "Brainstorming Follow-up...",
    sequelTitle: "Sequel & Prequel Concepts",

    sceneDurationOption: "Scene Duration / Pacing",
    sec6: "6 Seconds (Fast / TikTok / Reels)",
    sec12: "12 Seconds (Cinematic / Standard)",
    secCustom: "Custom (Auto)",
    printStoryboard: "Print / Save PDF",
    shootingMode: "Shooting Mode / Performance",
    selectMode: "Select Mode...",
    modeCinematic: "Standard Cinematic",
    modeLive: "Live Performance (Concert)",
    modeAcoustic: "Intimate Acoustic Session",
    modeHandheld: "Handheld / Amateur Cam",
    modeVlog: "Backstage / Vlog Style",
    modeSecurity: "CCTV / Security Camera",
    modeVHS: "Vintage VHS / Home Video",

    // COLOR GRADING & TRANSITIONS
    colorGrading: "Color Grading Preview",
    colorGradeTitle: "Real-time Color Grading",
    applyColorGrade: "Apply to Storyboard",
    gradePresets: "Color Grade Presets",
    transitionPlanner: "AI Transition Planner",
    generatingTransitions: "Analyzing Transitions...",
    transitionTitle: "Scene Transition Plan",

    // AUTOMATION MODE
    automationMode: "🤖 Auto-Generate Mode",
    automationRunning: "Automation Running...",
    automationStopped: "Automation Stopped",
    automationCycle: "Cycle",
    automationCurrentStyle: "Current Style",
    automationStart: "Start Auto-Generation",
    automationStop: "Stop After This Cycle",
    automationComplete: "Automation Complete",
    fullAutoMode: "🚀 Full Auto (Viral)",
    fullAutoRunning: "Full Auto Running..."
};

// VIRAL & TRENDING TOPICS FOR FULL AUTO
const VIRAL_TOPICS = [
    { title: "AI's Dark Secret", genre: "Documentary", hook: "What happens when AI starts making decisions we can't understand?" },
    { title: "The $1M Side Hustle", genre: "Social Media", hook: "How a college dropout made millions from his bedroom" },
    { title: "Crypto Collapse 2.0", genre: "Documentary", hook: "The next big crypto crash and who will survive" },
    { title: "Gen-Z vs Millennials", genre: "Social Media", hook: "The generational war that's tearing the internet apart" },
    { title: "Elon's Mars Plan", genre: "Documentary", hook: "Why the richest man wants to leave Earth" },
    { title: "TikTok Brain", genre: "Documentary", hook: "How 15-second videos are rewiring our minds" },
    { title: "The Loneliness Epidemic", genre: "Short Film", hook: "Why the most connected generation feels the most alone" },
    { title: "Hustle Culture is Killing Us", genre: "Documentary", hook: "The dark side of productivity obsession" },
    { title: "Dating App Nightmares", genre: "Social Media", hook: "The worst dating app stories that went viral" },
    { title: "Climate Anxiety", genre: "Documentary", hook: "How eco-anxiety is affecting a generation" },
    { title: "The Metaverse Failed", genre: "Documentary", hook: "Billions spent on a dream nobody wanted" },
    { title: "Influencer Scam Exposed", genre: "Social Media", hook: "The fake lifestyle that fooled millions" },
    { title: "Sleep is a Superpower", genre: "Commercial", hook: "The one thing successful people never skip" },
    { title: "The 4-Day Work Week", genre: "Documentary", hook: "Companies that tried it and what happened" },
    { title: "Digital Nomad Reality", genre: "Social Media", hook: "The truth behind working from paradise" },
    { title: "Why We're All Burnt Out", genre: "Short Film", hook: "The exhaustion epidemic nobody talks about" },
    { title: "AI Art Controversy", genre: "Documentary", hook: "Is AI killing human creativity?" },
    { title: "The Ozempic Craze", genre: "Documentary", hook: "The weight loss drug that changed everything" },
    { title: "Gaming Addiction", genre: "Short Film", hook: "When playing becomes an obsession" },
    { title: "The Fake Guru Industry", genre: "Documentary", hook: "How self-help became a billion dollar scam" }
];

/* -------------------------------------------------------------------------- */
/* ERROR HANDLING UTILITIES                                                    */
/* -------------------------------------------------------------------------- */

// Error Types for categorization
const ErrorTypes = {
    NETWORK: 'NETWORK',
    API_RATE_LIMIT: 'API_RATE_LIMIT',
    API_AUTH: 'API_AUTH',
    API_QUOTA: 'API_QUOTA',
    VALIDATION: 'VALIDATION',
    FILE_SIZE: 'FILE_SIZE',
    FILE_TYPE: 'FILE_TYPE',
    TIMEOUT: 'TIMEOUT',
    UNKNOWN: 'UNKNOWN'
};

// Parse and categorize errors
const parseError = (error) => {
    const errorString = error?.message || error?.toString() || 'Unknown error';
    const statusCode = error?.status || error?.statusCode || error?.code;

    // Network errors
    if (errorString.includes('Failed to fetch') || errorString.includes('NetworkError') || errorString.includes('net::ERR')) {
        return {
            type: ErrorTypes.NETWORK,
            title: '🌐 Network Error',
            message: 'Unable to connect. Please check your internet connection and try again.',
            canRetry: true,
            retryDelay: 3000
        };
    }

    // Rate limiting
    if (statusCode === 429 || errorString.includes('rate limit') || errorString.includes('too many requests')) {
        return {
            type: ErrorTypes.API_RATE_LIMIT,
            title: '⏱️ Rate Limited',
            message: 'Too many requests. Please wait a moment before trying again.',
            canRetry: true,
            retryDelay: 10000
        };
    }

    // Authentication errors
    if (statusCode === 401 || statusCode === 403 || errorString.includes('unauthorized') || errorString.includes('forbidden')) {
        return {
            type: ErrorTypes.API_AUTH,
            title: '🔐 Authentication Error',
            message: 'Session expired or invalid. Please refresh the page.',
            canRetry: false,
            action: 'refresh'
        };
    }

    // Quota exceeded
    if (statusCode === 402 || errorString.includes('quota') || errorString.includes('exceeded') || errorString.includes('billing')) {
        return {
            type: ErrorTypes.API_QUOTA,
            title: '📊 Quota Exceeded',
            message: 'API usage limit reached. Please try again later or contact support.',
            canRetry: false
        };
    }

    // Timeout errors
    if (errorString.includes('timeout') || errorString.includes('timed out') || errorString.includes('DEADLINE_EXCEEDED')) {
        return {
            type: ErrorTypes.TIMEOUT,
            title: '⏰ Request Timeout',
            message: 'The request took too long. Please try again with a simpler prompt or smaller file.',
            canRetry: true,
            retryDelay: 5000
        };
    }

    // File size errors
    if (errorString.includes('file size') || errorString.includes('too large') || errorString.includes('payload')) {
        return {
            type: ErrorTypes.FILE_SIZE,
            title: '📦 File Too Large',
            message: 'The file exceeds the maximum size limit. Please use a smaller file.',
            canRetry: false
        };
    }

    // Generic API errors with status codes
    if (statusCode >= 500) {
        return {
            type: ErrorTypes.UNKNOWN,
            title: '🔧 Server Error',
            message: 'The server is experiencing issues. Please try again in a few minutes.',
            canRetry: true,
            retryDelay: 5000
        };
    }

    // Default unknown error
    return {
        type: ErrorTypes.UNKNOWN,
        title: '❌ Error',
        message: errorString.length > 150 ? errorString.substring(0, 150) + '...' : errorString,
        canRetry: true,
        retryDelay: 2000
    };
};

// Create user-friendly error message with context
const createErrorMessage = (error, context = '') => {
    const parsed = parseError(error);
    let fullMessage = parsed.message;

    if (context) {
        fullMessage = `${context}: ${fullMessage}`;
    }

    return {
        ...parsed,
        fullMessage,
        timestamp: Date.now()
    };
};

// Toast notification system (global state)
let toastContainer = null;
const showToast = (message, type = 'error', duration = 5000) => {
    // Create container if it doesn't exist
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const bgColor = type === 'error' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
        type === 'warning' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
            type === 'success' ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' :
                'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';

    const icon = type === 'error' ? '❌' :
        type === 'warning' ? '⚠️' :
            type === 'success' ? '✅' : 'ℹ️';

    toast.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:20px;">${icon}</span>
            <span style="flex:1;">${message}</span>
        </div>
    `;
    toast.style.cssText = `
        background:${bgColor};
        color:white;
        padding:16px 24px;
        border-radius:12px;
        font-family:system-ui,sans-serif;
        font-weight:500;
        box-shadow:0 10px 40px rgba(0,0,0,0.3);
        pointer-events:auto;
        animation:slideIn 0.3s ease;
        max-width:400px;
    `;

    // Add animation keyframes if not exists
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        `;
        document.head.appendChild(style);
    }

    toastContainer.appendChild(toast);

    // Auto-remove
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
};

// Retry wrapper function with exponential backoff
const withRetry = async (fn, maxRetries = 3, context = '') => {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            const parsed = parseError(error);

            console.error(`[Attempt ${attempt}/${maxRetries}] ${context}:`, error);

            if (!parsed.canRetry || attempt === maxRetries) {
                throw error;
            }

            // Exponential backoff
            const delay = parsed.retryDelay * Math.pow(2, attempt - 1);
            showToast(`Retrying in ${delay / 1000}s... (Attempt ${attempt + 1}/${maxRetries})`, 'warning', delay);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
};

/* -------------------------------------------------------------------------- */
/* API HANDLERS                                */
/* -------------------------------------------------------------------------- */
const API_KEY = ""; // Automatically handled by environment

// Initialize Firebase with Safety Check
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Helper for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Convert PCM Audio to WAV for playback
function pcmToWav(pcmData, sampleRate = 24000) {
    const buffer = new ArrayBuffer(44 + pcmData.byteLength);
    const view = new DataView(buffer);
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + pcmData.byteLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, pcmData.byteLength, true);
    const pcmView = new Uint8Array(pcmData);
    const wavView = new Uint8Array(buffer, 44);
    wavView.set(pcmView);
    return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// Helper: Draw Waveform
const drawWaveform = (audioBuffer, canvas) => {
    if (!canvas || !audioBuffer) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#60A5FA'; // Blue-400
    ctx.beginPath();

    for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;
        for (let j = 0; j < step; j++) {
            const datum = data[(i * step) + j];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
        }
        ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }
};

// Generic Text Generation with Enhanced Error Handling
async function generateText(prompt, systemInstruction = "", schema = null, attachments = [], useSearch = false) {
    try {
        const parts = [{ text: prompt }];
        if (attachments && attachments.length > 0) {
            attachments.forEach(att => {
                const base64Data = att.data.includes("base64,") ? att.data.split("base64,")[1] : att.data;
                parts.push({
                    inlineData: {
                        mimeType: att.mimeType,
                        data: base64Data
                    }
                });
            });
        }

        const payload = {
            contents: [{ parts: parts }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            tools: useSearch ? [{ google_search: {} }] : [],
            generationConfig: {
                responseMimeType: schema ? "application/json" : "text/plain",
                responseSchema: schema
            }
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            const errorBody = await response.text().catch(() => '');
            const error = new Error(`API Error: ${response.status}`);
            error.status = response.status;
            error.body = errorBody;
            throw error;
        }

        const data = await response.json();

        // Check for blocked content
        if (data.candidates?.[0]?.finishReason === 'SAFETY') {
            throw new Error('Content blocked by safety filters. Please modify your prompt.');
        }

        // Check for empty response
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            throw new Error('Empty response from AI. Please try again.');
        }

        return schema ? JSON.parse(text) : text;
    } catch (error) {
        const parsed = parseError(error);
        console.error("Text Gen Error:", parsed.title, error);

        // Show toast for user feedback
        showToast(parsed.message, 'error');

        throw error;
    }
}

// Image Generation Robust - UPDATED FOR 16:9 SUPPORT WITH IMAGEN 4
async function generateImageRobust(promptText, referenceImages = [], aspectRatio = "16:9") {

    // Helper: Gemini Generation (Used for Editing or Fallback)
    const generateWithGemini = async () => {
        // Cinematic prompt suffix for editing/fallback - Soft aspect ratio instruction
        let ratioSuffix = "";
        if (aspectRatio === "16:9") ratioSuffix = ", 16:9 wide screen aspect ratio, wide cinematic shot";
        else if (aspectRatio === "9:16") ratioSuffix = ", 9:16 vertical portrait aspect ratio, tall screen";
        else if (aspectRatio === "4:3") ratioSuffix = ", 4:3 tv aspect ratio";
        else if (aspectRatio === "1:1") ratioSuffix = ", square aspect ratio";
        else if (aspectRatio === "2.35:1") ratioSuffix = ", 2.35:1 anamorphic widescreen aspect ratio";

        // UPDATED: Nano Banana Pro Style Enhancers from CSV
        const cinematicSuffix = ` --photorealistic, perceptual realism, indexicality, haptic visuality, cinematic qualia, 8k, ultra-detailed, sharp details, cinematic lighting, crisp shadows, high dynamic range, depth of field, masterpiece, color graded, midjourney style${ratioSuffix}`;
        const parts = [{ text: promptText + cinematicSuffix }];

        if (referenceImages && referenceImages.length > 0) {
            referenceImages.forEach(img => {
                const base64Data = img.data.includes("base64,") ? img.data.split("base64,")[1] : img.data;
                parts.push({
                    inlineData: {
                        mimeType: "image/png",
                        data: base64Data
                    }
                });
            });
        }

        const payload = {
            contents: [{ parts: parts }],
            generationConfig: { responseModalities: ["IMAGE"] }
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
        const data = await response.json();
        const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
        if (!part || !part.inlineData || !part.inlineData.data) throw new Error("No image data");
        const mimeType = part.inlineData.mimeType || "image/png";
        return `data:${mimeType};base64,${part.inlineData.data}`;
    };

    // 1. If Reference Images exist -> Must use Gemini (Magic Edit / Style Transfer)
    if (referenceImages && referenceImages.length > 0) {
        try {
            return await generateWithGemini();
        } catch (e) {
            const parsed = parseError(e);
            console.warn("Gemini Image Gen failed", parsed.title, e);
            showToast(`Image editing failed: ${parsed.message}`, 'error');
            throw new Error("Image generation failed (Gemini). Try a different prompt or image.");
        }
    }

    // 2. If Text-to-Image -> Use Imagen 4 for 16:9 Aspect Ratio Control
    try {
        let ratioText = "16:9 wide screen";
        if (aspectRatio === "9:16") ratioText = "9:16 vertical portrait";
        else if (aspectRatio === "4:3") ratioText = "4:3 classic tv aspect";
        else if (aspectRatio === "1:1") ratioText = "square aspect";
        else if (aspectRatio === "2.35:1") ratioText = "2.35:1 anamorphic widescreen";

        // UPDATED: Nano Banana Pro Style Enhancers from CSV
        const cinematicSuffix = `, photorealistic, perceptual realism, indexicality, haptic visuality, cinematic qualia, 8k, ultra-realistic, sharp focus, cinematic lighting, crisp shadows, wet pavement reflections, atmospheric blur, shot on Arri Alexa, 35mm film grain, masterpiece, ${ratioText}, midjourney style`;
        const payload = {
            instances: [{ prompt: promptText + cinematicSuffix }],
            parameters: {
                sampleCount: 1,
                aspectRatio: aspectRatio // Use selected aspect ratio
            }
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            console.warn(`Imagen API Error: ${response.status}, falling back to Gemini`);
            return await generateWithGemini(); // Fallback to Gemini if Imagen fails
        }

        const data = await response.json();

        // Check for safety blocked content
        if (data.predictions?.[0]?.safetyFilteredReason) {
            showToast('Image blocked by safety filters. Please modify your prompt.', 'warning');
            throw new Error("Image blocked by safety filters.");
        }

        const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
        if (!base64Image) throw new Error("No image data from Imagen");
        return `data:image/png;base64,${base64Image}`;

    } catch (err) {
        console.warn("Imagen failed, trying Gemini fallback...", err);
        // Fallback to Gemini (T2I)
        try {
            return await generateWithGemini();
        } catch (e) {
            const parsed = parseError(e);
            showToast(`Image generation failed: ${parsed.message}`, 'error');
            throw new Error("Image generation failed. Please try a different prompt.");
        }
    }
}

// Text-to-Speech
async function generateSpeech(text, voiceName = "Kore") {
    try {
        const payload = {
            contents: [{ parts: [{ text: text }] }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } }
            }
        };
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }
        );
        if (!response.ok) throw new Error(`TTS API Error: ${response.status}`);
        const data = await response.json();
        const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        if (!inlineData) throw new Error("No audio data returned");
        const binaryString = atob(inlineData.data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
        return pcmToWav(bytes.buffer);
    } catch (error) {
        console.error("TTS Error:", error);
        throw error;
    }
}

/* -------------------------------------------------------------------------- */
/* SUB-COMPONENTS                                                             */
/* -------------------------------------------------------------------------- */

const LoadingOverlay = ({ msg }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-500" />
        <h3 className="text-xl font-semibold animate-pulse">{msg}</h3>
    </div>
);

// Error Boundary Class Component for catching unhandled errors
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
                    <div className="bg-gray-800 border border-red-500/50 rounded-2xl p-8 max-w-lg text-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
                        <p className="text-gray-400 mb-6">
                            The application encountered an unexpected error. Your work has been auto-saved.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-colors"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => this.setState({ hasError: false, error: null })}
                                className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-6 py-3 rounded-xl font-bold transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                        {this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="text-xs text-gray-500 cursor-pointer">Technical Details</summary>
                                <pre className="mt-2 p-3 bg-gray-900 rounded-lg text-xs text-red-400 overflow-auto max-h-40">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// Improved Error Display Component with retry functionality
const ErrorDisplay = ({ error, onDismiss, onRetry, context = '' }) => {
    if (!error) return null;

    const parsed = typeof error === 'string'
        ? { title: '❌ Error', message: error, canRetry: true }
        : parseError(error);

    return (
        <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-gradient-to-r from-red-900/50 to-red-800/30 border border-red-500/50 rounded-xl p-4 shadow-lg shadow-red-900/20">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-red-300 mb-1">{parsed.title}</h4>
                        <p className="text-sm text-red-200/80">
                            {context ? `${context}: ` : ''}{parsed.message}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {parsed.canRetry && onRetry && (
                            <button
                                onClick={onRetry}
                                className="px-3 py-1.5 bg-red-600/50 hover:bg-red-500/50 text-red-100 text-xs font-bold rounded-lg transition-colors"
                            >
                                Retry
                            </button>
                        )}
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                                title="Dismiss"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ... (EditSceneModal, TextContentModal, ConfirmModal, ElementCard remain the same)
const EditSceneModal = ({ isOpen, onClose, onConfirm, currentImage, t }) => {
    const [instruction, setInstruction] = useState("");
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-purple-400" /> {t.magicDirector}
                </h3>
                <div className="mb-4 aspect-video bg-black rounded-lg overflow-hidden border border-gray-700">
                    <img src={currentImage} className="w-full h-full object-contain opacity-50" alt="Current scene" />
                </div>
                <p className="text-gray-400 text-sm mb-2">{t.magicPromptPlaceholder}</p>
                <textarea
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder={t.magicPromptPlaceholder}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white h-24 focus:ring-2 focus:ring-purple-500 outline-none resize-none mb-4"
                />
                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">{t.cancel}</button>
                    <button onClick={() => { onConfirm(instruction); onClose(); setInstruction(""); }} disabled={!instruction.trim()} className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> {t.apply}
                    </button>
                </div>
            </div>
        </div>
    );
};

const JSONImportModal = ({ isOpen, onClose, onImport, t }) => {
    const [jsonText, setJsonText] = useState("");
    const [status, setStatus] = useState(null); // 'success' | 'error'

    const handleImport = () => {
        try {
            const parsed = JSON.parse(jsonText);
            onImport(parsed);
            setStatus('success');
            setTimeout(() => { onClose(); setStatus(null); setJsonText(""); }, 1000);
        } catch (e) {
            setStatus('error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-3xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Code2 className="w-5 h-5 text-yellow-400" /> {t.advancedJson}</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>
                <textarea
                    value={jsonText}
                    onChange={(e) => { setJsonText(e.target.value); setStatus(null); }}
                    className="w-full h-64 bg-gray-950 font-mono text-xs text-green-400 p-4 rounded-lg border border-gray-800 focus:border-yellow-500 outline-none resize-none mb-4"
                    placeholder={t.pasteJsonPlaceholder}
                />
                <div className="flex justify-between items-center">
                    <div>
                        {status === 'error' && <span className="text-red-400 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {t.jsonError}</span>}
                        {status === 'success' && <span className="text-green-400 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {t.jsonParsed}</span>}
                    </div>
                    <button onClick={handleImport} className="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-2 rounded-lg font-bold transition-colors">{t.importJson}</button>
                </div>
            </div>
        </div>
    );
};

const SelectionModal = ({ isOpen, onClose, title, options, onSelect, icon: Icon, color, t }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 max-w-4xl w-full shadow-2xl h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-2xl font-bold text-white flex items-center gap-3`}>{Icon && <Icon className={`w-6 h-6 ${color}`} />} {title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>

                <p className="text-sm text-gray-400 mb-4 bg-blue-900/20 border border-blue-900/50 p-3 rounded-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    {t.interactiveMode}
                </p>

                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                    {options ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {options.map((opt, idx) => (
                                <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-blue-500 hover:bg-gray-800 transition-all cursor-pointer flex flex-col group" onClick={() => onSelect(opt)}>
                                    <h4 className={`text-lg font-bold mb-2 ${color} group-hover:text-white transition-colors`}>{opt.title}</h4>
                                    <p className="text-sm text-gray-400 mb-4 flex-grow">{opt.description}</p>
                                    {opt.palette && (
                                        <div className="flex h-4 rounded overflow-hidden mb-4">
                                            {opt.palette.map((c, i) => <div key={i} className="flex-1" style={{ backgroundColor: c }}></div>)}
                                        </div>
                                    )}
                                    <button className="w-full mt-auto py-2 bg-gray-700 group-hover:bg-blue-600 rounded-lg text-white text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                        <Check className="w-4 h-4" /> {t.selectOption}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <Loader2 className="w-10 h-10 animate-spin mb-3 text-pink-500" />
                            <p>Loading options...</p>
                        </div>
                    )}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/* QUICK START TEMPLATES                                                       */
/* -------------------------------------------------------------------------- */

const QUICK_START_TEMPLATES = [
    {
        id: 'tiktok-ad',
        name: '30s TikTok Ad',
        description: 'Fast-paced social media commercial',
        icon: <Smartphone className="w-6 h-6" />,
        color: 'text-pink-500',
        projectType: 'Social Media',
        defaults: {
            duration: '0:30',
            sceneDuration: 6,
            cineSettings: { lens: 'Wide Angle (24mm)', era: 'Y2K Digital (MiniDV)', lighting: 'Neon / Artificial', mode: 'Handheld Amateur' },
            visualStyle: 'Trendy, vibrant, fast cuts, viral aesthetic, Instagram filter look'
        }
    },
    {
        id: 'music-video-3min',
        name: '3min Music Video',
        description: 'Standard cinematic music video',
        icon: <Music className="w-6 h-6" />,
        color: 'text-blue-500',
        projectType: 'Music Video',
        defaults: {
            duration: '3:00',
            sceneDuration: 12,
            cineSettings: { lens: 'Anamorphic', era: 'Modern Clean (Digital 8K)', lighting: 'High Contrast / Dramatic', mode: 'Standard Cinematic' },
            visualStyle: 'Cinematic, narrative-driven, professional music video aesthetic'
        }
    },
    {
        id: 'wedding-highlight',
        name: 'Wedding Highlight',
        description: 'Romantic ceremony highlights',
        icon: <Heart className="w-6 h-6" />,
        color: 'text-pink-400',
        projectType: 'Wedding Video',
        defaults: {
            duration: '5:00',
            sceneDuration: 12,
            cineSettings: { lens: 'Telephoto (85mm)', era: 'Modern Clean (Digital 8K)', lighting: 'Natural / Golden Hour', mode: 'Standard Cinematic' },
            visualStyle: 'Romantic, soft, dreamy, warm tones, emotional moments'
        }
    },
    {
        id: 'product-commercial',
        name: '60s Product Ad',
        description: 'Professional product showcase',
        icon: <Megaphone className="w-6 h-6" />,
        color: 'text-green-500',
        projectType: 'Commercial',
        defaults: {
            duration: '1:00',
            sceneDuration: 6,
            cineSettings: { lens: 'Standard (50mm)', era: 'Modern Clean (Digital 8K)', lighting: 'High Contrast / Dramatic', mode: 'Standard Cinematic' },
            visualStyle: 'Clean, professional, product-focused, premium aesthetic'
        }
    },
    {
        id: 'anime-trailer',
        name: 'Anime Opening',
        description: '90s anime style OP',
        icon: <Star className="w-6 h-6" />,
        color: 'text-yellow-400',
        projectType: 'Animation/Anime',
        defaults: {
            duration: '1:30',
            sceneDuration: 6,
            cineSettings: { lens: 'Wide Angle (24mm)', era: 'Modern Clean (Digital 8K)', lighting: 'High Contrast / Dramatic', mode: 'Standard Cinematic' },
            visualStyle: 'Anime aesthetic, dynamic action, sakura petals, dramatic poses, Japanese animation style'
        }
    },
    {
        id: 'game-trailer',
        name: 'Game Trailer',
        description: 'Epic video game cinematic',
        icon: <Gamepad2 className="w-6 h-6" />,
        color: 'text-red-500',
        projectType: 'Video Game Trailer',
        defaults: {
            duration: '2:00',
            sceneDuration: 6,
            cineSettings: { lens: 'Anamorphic', era: 'Cyberpunk Future', lighting: 'High Contrast / Dramatic', mode: 'Standard Cinematic' },
            visualStyle: 'Epic, cinematic, AAA game quality, dramatic lighting, action-packed'
        }
    },
    {
        id: 'documentary-short',
        name: 'Documentary Short',
        description: 'Cinematic non-fiction',
        icon: <Globe className="w-6 h-6" />,
        color: 'text-orange-500',
        projectType: 'Documentary',
        defaults: {
            duration: '10:00',
            sceneDuration: 12,
            cineSettings: { lens: 'Standard (50mm)', era: 'Modern Clean (Digital 8K)', lighting: 'Natural / Golden Hour', mode: 'Standard Cinematic' },
            visualStyle: 'Authentic, journalistic, natural lighting, documentary realism'
        }
    },
    {
        id: 'fashion-lookbook',
        name: 'Fashion Lookbook',
        description: 'High-fashion editorial',
        icon: <Shirt className="w-6 h-6" />,
        color: 'text-fuchsia-500',
        projectType: 'Fashion Lookbook',
        defaults: {
            duration: '2:00',
            sceneDuration: 6,
            cineSettings: { lens: 'Telephoto (85mm)', era: 'Modern Clean (Digital 8K)', lighting: 'Soft / Diffused', mode: 'Standard Cinematic' },
            visualStyle: 'High fashion, editorial, runway aesthetic, Vogue style'
        }
    },
    {
        id: 'lyric-video',
        name: 'Lyric Video',
        description: 'Typography-focused visuals',
        icon: <Music2 className="w-6 h-6" />,
        color: 'text-cyan-500',
        projectType: 'Lyric Video',
        defaults: {
            duration: '3:30',
            sceneDuration: 6,
            cineSettings: { lens: 'Standard (50mm)', era: 'Modern Clean (Digital 8K)', lighting: 'Neon / Artificial', mode: 'Standard Cinematic' },
            visualStyle: 'Kinetic typography, animated text, abstract backgrounds, rhythm sync'
        }
    },
    {
        id: 'sports-highlight',
        name: 'Sports Highlight',
        description: 'Dynamic athletic action',
        icon: <Activity className="w-6 h-6" />,
        color: 'text-emerald-500',
        projectType: 'Sports Highlight',
        defaults: {
            duration: '2:00',
            sceneDuration: 6,
            cineSettings: { lens: 'Telephoto (85mm)', era: 'Modern Clean (Digital 8K)', lighting: 'High Contrast / Dramatic', mode: 'Drone / FPV' },
            visualStyle: 'High energy, slow motion, dynamic angles, ESPN style'
        }
    },
    {
        id: 'tutorial-howto',
        name: 'Tutorial Video',
        description: 'Step-by-step instructions',
        icon: <HelpCircle className="w-6 h-6" />,
        color: 'text-sky-500',
        projectType: 'Tutorial/How-To',
        defaults: {
            duration: '5:00',
            sceneDuration: 12,
            cineSettings: { lens: 'Standard (50mm)', era: 'Modern Clean (Digital 8K)', lighting: 'Soft / Diffused', mode: 'Standard Cinematic' },
            visualStyle: 'Clean, educational, clear visuals, step-by-step breakdown'
        }
    },
    {
        id: 'concert-film',
        name: 'Concert Film',
        description: 'Live performance capture',
        icon: <Disc className="w-6 h-6" />,
        color: 'text-violet-500',
        projectType: 'Music Performance/Concert',
        defaults: {
            duration: '5:00',
            sceneDuration: 12,
            cineSettings: { lens: 'Wide Angle (24mm)', era: 'Modern Clean (Digital 8K)', lighting: 'Strobe / Club', mode: 'Live Performance' },
            visualStyle: 'Concert atmosphere, stage lighting, crowd energy, live music vibe'
        }
    },
    {
        id: 'asmr-relaxation',
        name: 'ASMR / Relaxation',
        description: 'Soothing visuals for sleep & relaxation',
        icon: <Volume2 className="w-6 h-6" />,
        color: 'text-teal-400',
        projectType: 'ASMR/Relaxation',
        defaults: {
            duration: '10:00',
            sceneDuration: 30,
            cineSettings: { lens: 'Macro (100mm)', era: 'Soft Focus Film', lighting: 'Warm / Cozy', mode: 'Slow Motion' },
            visualStyle: 'Calming, ambient, soft focus, gentle movements, nature sounds, cozy atmosphere, warm tones, peaceful, meditative'
        }
    }
];

const QuickStartModal = ({ isOpen, onClose, onSelectTemplate }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-4xl w-full shadow-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Rocket className="w-7 h-7 text-orange-500" /> Quick Start Templates
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">Start with a pre-configured project template</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {QUICK_START_TEMPLATES.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => onSelectTemplate(template)}
                                className="group p-4 border-2 border-gray-700 bg-gray-800/50 rounded-xl hover:border-orange-500 hover:bg-gray-800 transition-all duration-200 text-left flex flex-col gap-3"
                            >
                                <div className={`p-3 bg-gray-900 rounded-lg w-fit ${template.color} group-hover:scale-110 transition-transform`}>
                                    {template.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{template.name}</h4>
                                    <p className="text-gray-500 text-xs mt-1">{template.description}</p>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                    <span className="bg-gray-900 px-2 py-0.5 rounded">{template.defaults.duration}</span>
                                    <span className="bg-gray-900 px-2 py-0.5 rounded">{template.projectType}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center">
                    <p className="text-xs text-gray-500">Or start from scratch with a project type</p>
                    <button onClick={onClose} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// NEW COMPONENT: Project Type Selection - All Project Types
const StepProjectType = ({ onSelect, onOpenTemplates }) => {
    const types = [
        'Music Video', 'Commercial', 'Short Film', 'Social Media',
        'Documentary', 'Video Game Trailer', 'Comic Book', 'Podcast Visualizer',
        'Animation/Anime', 'Lyric Video', 'Live Performance', 'Brand Film',
        'Tutorial/How-To', 'Wedding Video', 'Sports Highlight', 'Fashion Lookbook',
        'Music Performance/Concert', 'Behind-the-Scenes', 'Interview/Testimonial'
    ];

    const getIcon = (type) => {
        const icons = {
            'Music Video': <Music className="w-7 h-7 text-blue-500" />,
            'Commercial': <Megaphone className="w-7 h-7 text-green-500" />,
            'Short Film': <Clapperboard className="w-7 h-7 text-purple-500" />,
            'Social Media': <Zap className="w-7 h-7 text-pink-500" />,
            'Documentary': <Globe className="w-7 h-7 text-orange-500" />,
            'Video Game Trailer': <Gamepad2 className="w-7 h-7 text-red-500" />,
            'Comic Book': <BookOpen className="w-7 h-7 text-yellow-500" />,
            'Podcast Visualizer': <Mic2 className="w-7 h-7 text-indigo-500" />,
            'Animation/Anime': <Star className="w-7 h-7 text-yellow-400" />,
            'Lyric Video': <Music2 className="w-7 h-7 text-cyan-500" />,
            'Live Performance': <Radio className="w-7 h-7 text-rose-500" />,
            'Brand Film': <Landmark className="w-7 h-7 text-teal-500" />,
            'Tutorial/How-To': <HelpCircle className="w-7 h-7 text-sky-500" />,
            'Wedding Video': <Heart className="w-7 h-7 text-pink-400" />,
            'Sports Highlight': <Activity className="w-7 h-7 text-emerald-500" />,
            'Fashion Lookbook': <Shirt className="w-7 h-7 text-fuchsia-500" />,
            'Music Performance/Concert': <Disc className="w-7 h-7 text-violet-500" />,
            'Behind-the-Scenes': <Eye className="w-7 h-7 text-amber-500" />,
            'Interview/Testimonial': <MessageCircle className="w-7 h-7 text-lime-500" />
        };
        return icons[type] || <Film className="w-7 h-7 text-gray-500" />;
    };

    return (
        <div className="max-w-5xl mx-auto w-full animate-in fade-in zoom-in-95 duration-500 mt-10 px-4">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-2">Select Project Type</h2>
                <p className="text-gray-400 mb-6">Choose the format to optimize the AI director's style.</p>

                {/* Quick Start Templates Button */}
                <button
                    onClick={onOpenTemplates}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-900/30 transition-all duration-200 group"
                >
                    <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Quick Start Templates
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">12</span>
                </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {types.map((type) => (
                    <button
                        key={type}
                        onClick={() => onSelect(type)}
                        className="group p-5 border-2 border-gray-700 bg-gray-800 rounded-xl hover:border-blue-500 hover:bg-gray-700 transition-all duration-200 text-sm font-bold text-gray-200 hover:text-white shadow-lg hover:shadow-blue-900/20 flex flex-col items-center justify-center gap-3"
                    >
                        <div className="p-3 bg-gray-900 rounded-full group-hover:scale-110 transition-transform">
                            {getIcon(type)}
                        </div>
                        <span className="text-center leading-tight">{type}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

const TextContentModal = ({ isOpen, onClose, title, content, icon: Icon, color, t }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 max-w-3xl w-full shadow-2xl h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-2xl font-bold text-white flex items-center gap-3`}>{Icon && <Icon className={`w-6 h-6 ${color}`} />} {title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2 space-y-6 text-gray-300 custom-scrollbar">
                    {content ? (<div className="prose prose-invert max-w-none"><div className="whitespace-pre-wrap font-sans leading-relaxed text-sm md:text-base">{content}</div></div>) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500"><Loader2 className="w-10 h-10 animate-spin mb-3 text-pink-500" /><p>Loading...</p></div>
                    )}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end gap-3">
                    <button onClick={() => navigator.clipboard.writeText(content)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium flex items-center gap-2 transition-colors"><Copy className="w-4 h-4" /> Copy</button>
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors">{t.close}</button>
                </div>
            </div>
        </div>
    );
};

// New Component: Album Art Modal
const AlbumArtModal = ({ isOpen, onClose, title, albumCover, icon: Icon, color, t }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 max-w-md w-full shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-bold text-white flex items-center gap-3`}>{Icon && <Icon className={`w-6 h-6 ${color}`} />} {title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>

                {albumCover ? (
                    <div className="flex flex-col gap-4">
                        <div className="aspect-square w-full bg-black rounded-lg overflow-hidden border border-gray-800 shadow-2xl relative group">
                            <img src={albumCover.image} alt="Album Art" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => { const a = document.createElement('a'); a.href = albumCover.image; a.download = `cover_art.png`; a.click(); }} className="bg-white text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Download className="w-4 h-4" /> Download</button>
                            </div>
                        </div>
                        <div className="bg-gray-800 p-3 rounded-lg">
                            <p className="text-xs text-gray-400 mb-1 font-bold">Generated Prompt:</p>
                            <p className="text-xs text-gray-300 italic line-clamp-3">{albumCover.prompt}</p>
                        </div>
                    </div>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-500"><Loader2 className="w-10 h-10 animate-spin mb-3 text-pink-500" /><p>Generating Art...</p></div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors">{t.close}</button>
                </div>
            </div>
        </div>
    );
};

// NEW: Merch Modal
const MerchModal = ({ isOpen, onClose, title, merchData, icon: Icon, color, t }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 max-w-4xl w-full shadow-2xl h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-bold text-white flex items-center gap-3`}>{Icon && <Icon className={`w-6 h-6 ${color}`} />} {title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>

                {merchData ? (
                    <div className="flex flex-col md:flex-row gap-6 h-full overflow-hidden">
                        {/* Merch List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                            <div className="space-y-4">
                                {merchData.items.map((item, idx) => (
                                    <div key={idx} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                        <h4 className="font-bold text-white text-lg mb-1 flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-pink-400" /> {item.name}</h4>
                                        <p className="text-sm text-gray-300 mb-2">{item.description}</p>
                                        <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded">Suggested Price: {item.price}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 bg-gray-800 p-4 rounded-xl border border-gray-700">
                                <h4 className="font-bold text-white text-lg mb-2">Strategy Note</h4>
                                <p className="text-sm text-gray-300">{merchData.strategy}</p>
                            </div>
                        </div>

                        {/* Visual Preview */}
                        <div className="w-full md:w-1/3 flex flex-col gap-4">
                            <h4 className="font-bold text-white text-sm uppercase tracking-wider">AI Visual Concept</h4>
                            <div className="aspect-square bg-black rounded-xl overflow-hidden border border-gray-700 relative group">
                                {merchData.visualImage ? (
                                    <>
                                        <img src={merchData.visualImage} alt="Merch Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button onClick={() => { const a = document.createElement('a'); a.href = merchData.visualImage; a.download = `merch_concept.png`; a.click(); }} className="bg-white text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Download className="w-4 h-4" /> Download</button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin" /></div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 italic">Visualizing: {merchData.items[0]?.name || "Concept"}</p>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500"><Loader2 className="w-10 h-10 animate-spin mb-3 text-pink-500" /><p>{t.generatingMerch}</p></div>
                )}
            </div>
        </div>
    );
};

// --- STYLE TRANSFER PRESETS ---
const STYLE_TRANSFER_PRESETS = [
    { id: 'wes-anderson', name: 'Wes Anderson', description: 'Symmetrical framing, pastel colors, retro aesthetic', color: '#F5C6AA' },
    { id: 'cyberpunk', name: 'Cyberpunk', description: 'Neon lights, dark atmosphere, futuristic', color: '#00FFFF' },
    { id: 'studio-ghibli', name: 'Studio Ghibli', description: 'Soft anime, dreamy landscapes, hand-painted feel', color: '#87CEEB' },
    { id: 'noir', name: 'Film Noir', description: 'High contrast B&W, dramatic shadows, moody', color: '#2D2D2D' },
    { id: 'vaporwave', name: 'Vaporwave', description: 'Pink/purple gradients, 80s/90s aesthetic, surreal', color: '#FF6AD5' },
    { id: 'van-gogh', name: 'Van Gogh', description: 'Impressionist brushstrokes, swirling patterns', color: '#FFD700' },
    { id: 'blade-runner', name: 'Blade Runner', description: 'Rainy neon cities, dystopian futurism', color: '#FF4500' },
    { id: 'tarantino', name: 'Tarantino', description: 'Bold colors, dramatic angles, pop culture vibes', color: '#DC143C' }
];

// --- AI LIPSYNC PANEL ---
const LipsyncPanel = ({ isOpen, onClose, settings, setSettings, isEnabled, setIsEnabled }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Mic2 className="w-5 h-5 text-pink-400" /> AI Lipsync Generator
                    </h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                {/* Enable Toggle */}
                <div className="flex items-center justify-between mb-6 p-3 bg-gray-800 rounded-lg">
                    <span className="text-white font-medium">Enable Lipsync Mode</span>
                    <button
                        onClick={() => setIsEnabled(!isEnabled)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${isEnabled ? 'bg-pink-500' : 'bg-gray-600'}`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* Mouth Openness */}
                <div className="mb-4">
                    <label className="text-sm font-bold text-white mb-2 block">Mouth Openness</label>
                    <div className="flex gap-2">
                        {['subtle', 'medium', 'exaggerated'].map(opt => (
                            <button
                                key={opt}
                                onClick={() => setSettings({ ...settings, mouthOpenness: opt })}
                                className={`flex-1 py-2 rounded-lg text-sm capitalize ${settings.mouthOpenness === opt ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Expression Style */}
                <div className="mb-4">
                    <label className="text-sm font-bold text-white mb-2 block">Expression Style</label>
                    <div className="flex gap-2">
                        {['natural', 'dramatic', 'anime'].map(opt => (
                            <button
                                key={opt}
                                onClick={() => setSettings({ ...settings, expressionStyle: opt })}
                                className={`flex-1 py-2 rounded-lg text-sm capitalize ${settings.expressionStyle === opt ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sync Timing */}
                <div className="mb-6">
                    <label className="text-sm font-bold text-white mb-2 block">Sync Timing Feel</label>
                    <div className="flex gap-2">
                        {['on-beat', 'smooth', 'staccato'].map(opt => (
                            <button
                                key={opt}
                                onClick={() => setSettings({ ...settings, syncTiming: opt })}
                                className={`flex-1 py-2 rounded-lg text-sm ${settings.syncTiming === opt ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                            >
                                {opt === 'on-beat' ? 'On Beat' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-pink-900/20 border border-pink-500/30 rounded-lg p-3 mb-4">
                    <p className="text-sm text-pink-200">
                        💡 <strong>Tip:</strong> Lipsync works best when lyrics are synced to scenes.
                        Make sure to run "Sync Lyrics" before generating scenes.
                    </p>
                </div>

                <button onClick={onClose} className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-bold transition-colors">
                    Done
                </button>
            </div>
        </div>
    );
};

// --- FACE CONSISTENCY PANEL (AI Actor Mode) ---
const FaceConsistencyPanel = ({ isOpen, onClose, onLockFace, currentFace, isLocked, onUnlock }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => { onLockFace(reader.result); };
        reader.readAsDataURL(file);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-400" /> AI Actor Mode (Face Lock)
                    </h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

                {currentFace ? (
                    <div className="relative mb-4">
                        <img src={currentFace} alt="Locked Face" className="w-full aspect-square object-cover rounded-lg border border-gray-700" />
                        <div className="absolute top-2 right-2 bg-green-500 px-2 py-1 rounded text-xs text-white font-bold flex items-center gap-1">
                            🔒 LOCKED
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-square bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors mb-4"
                    >
                        <Upload className="w-12 h-12 text-gray-500 mb-2" />
                        <span className="text-gray-400">Upload Face Reference</span>
                        <span className="text-xs text-gray-500 mt-1">Front-facing, clear photo</span>
                    </div>
                )}

                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 mb-4">
                    <p className="text-sm text-purple-200">
                        🎭 <strong>Face Lock</strong> ensures the same face appears in every scene.
                        The AI will maintain facial identity across all generated images.
                    </p>
                </div>

                <div className="flex gap-3">
                    {isLocked && (
                        <button onClick={onUnlock} className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-bold transition-colors">
                            Unlock Face
                        </button>
                    )}
                    <button onClick={onClose} className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-bold transition-colors">
                        {isLocked ? 'Done' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- BEAT-SYNC MODAL (ENHANCED with 6s Frame Support) ---
const BeatSyncModal = ({ isOpen, onClose, beatData, scenes, sceneDuration, onApplyCuts, loading, onAnalyze, setSceneDuration }) => {
    const audioInputRef = useRef(null);
    const [selectedDuration, setSelectedDuration] = useState(sceneDuration || 6);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [cutStyle, setCutStyle] = useState('on-beat'); // on-beat, half-beat, phrase

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) onAnalyze(file);
    };

    if (!isOpen) return null;

    const totalDuration = scenes.length * selectedDuration;

    // Calculate frame markers for 6-second intervals
    const frameMarkers = [];
    for (let i = 0; i <= Math.ceil(totalDuration / selectedDuration); i++) {
        frameMarkers.push(i * selectedDuration);
    }

    // Duration presets with explanations
    const durationPresets = [
        { value: 3, label: '3s', desc: 'TikTok/Reels (Fast)', color: 'from-red-500 to-orange-500' },
        { value: 6, label: '6s', desc: 'Standard Beat', color: 'from-cyan-500 to-blue-500', recommended: true },
        { value: 12, label: '12s', desc: 'Cinematic', color: 'from-purple-500 to-pink-500' },
        { value: 'auto', label: 'Auto', desc: 'BPM-Based', color: 'from-green-500 to-emerald-500' }
    ];

    // Calculate beat-aligned durations
    const getBeatAlignedDuration = (bpm) => {
        if (!bpm) return 6;
        const beatDuration = 60 / bpm; // seconds per beat
        // For 6s target: how many beats fit?
        const beatsIn6s = Math.round(6 / beatDuration);
        return Math.round(beatsIn6s * beatDuration);
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Music2 className="w-5 h-5 text-cyan-400" /> Beat-Sync Visual Generator
                        <span className="text-xs bg-cyan-600 px-2 py-0.5 rounded-full ml-2">Enhanced</span>
                    </h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                <input type="file" ref={audioInputRef} className="hidden" accept="audio/*" onChange={handleFileChange} />

                {loading ? (
                    <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Analyzing audio rhythm and BPM...</p>
                        <p className="text-xs text-gray-500 mt-2">This may take a few seconds</p>
                    </div>
                ) : beatData ? (
                    <>
                        {/* BPM Display */}
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-xl p-4 text-center">
                                <div className="text-4xl font-bold text-cyan-400">{beatData.bpm}</div>
                                <div className="text-xs text-gray-400">BPM</div>
                            </div>
                            <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-4 text-center">
                                <div className="text-xl font-bold text-purple-400">{beatData.genre}</div>
                                <div className="text-xs text-gray-400">Genre</div>
                            </div>
                            <div className="bg-orange-900/30 border border-orange-500/30 rounded-xl p-4 text-center">
                                <div className="text-xl font-bold text-orange-400 capitalize">{beatData.energy_level}</div>
                                <div className="text-xs text-gray-400">Energy</div>
                            </div>
                            <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-4 text-center">
                                <div className="text-xl font-bold text-green-400">{Math.round(60 / beatData.bpm * 1000) / 1000}s</div>
                                <div className="text-xs text-gray-400">Beat Duration</div>
                            </div>
                        </div>

                        {/* 🆕 SCENE DURATION SELECTOR */}
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                🎬 Frame Duration (Per Scene)
                                <span className="text-xs text-gray-500 font-normal">Recommended: 6 seconds</span>
                            </h4>
                            <div className="grid grid-cols-4 gap-3">
                                {durationPresets.map((preset) => (
                                    <button
                                        key={preset.value}
                                        onClick={() => {
                                            if (preset.value === 'auto') {
                                                setSelectedDuration(getBeatAlignedDuration(beatData.bpm));
                                            } else {
                                                setSelectedDuration(preset.value);
                                            }
                                        }}
                                        className={`relative p-4 rounded-xl border-2 transition-all ${(preset.value === 'auto' && selectedDuration === getBeatAlignedDuration(beatData.bpm)) ||
                                            selectedDuration === preset.value
                                            ? `border-cyan-500 bg-gradient-to-r ${preset.color} bg-opacity-20`
                                            : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                                            }`}
                                    >
                                        {preset.recommended && (
                                            <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                                                ⭐ REC
                                            </div>
                                        )}
                                        <div className={`text-2xl font-bold ${selectedDuration === preset.value || (preset.value === 'auto' && selectedDuration === getBeatAlignedDuration(beatData.bpm))
                                            ? 'text-white' : 'text-gray-300'
                                            }`}>
                                            {preset.value === 'auto' ? `${getBeatAlignedDuration(beatData.bpm)}s` : preset.label}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">{preset.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 🆕 ENHANCED TIMELINE WITH FRAME MARKERS */}
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                📊 Timeline Visualization
                                <span className="text-xs text-gray-500">{scenes.length} scenes × {selectedDuration}s = {scenes.length * selectedDuration}s total</span>
                            </h4>
                            <div className="relative h-32 bg-gray-800 rounded-lg overflow-hidden">
                                {/* Frame Markers (6s intervals) */}
                                {frameMarkers.map((marker, i) => (
                                    <div
                                        key={`frame-${i}`}
                                        className="absolute top-0 bottom-0 border-l border-yellow-500/50"
                                        style={{ left: `${(marker / totalDuration) * 100}%` }}
                                    >
                                        <div className="absolute -top-0 left-1 text-[8px] text-yellow-400 font-mono">{marker}s</div>
                                        <div className="absolute top-6 left-1 text-[8px] text-yellow-500/70">F{i + 1}</div>
                                    </div>
                                ))}

                                {/* Song Structure Blocks */}
                                {beatData.structure?.map((s, i) => (
                                    <div
                                        key={i}
                                        className="absolute top-8 h-8 bg-blue-600/40 border border-blue-400/50 rounded"
                                        style={{
                                            left: `${(s.start_seconds / (beatData.structure[beatData.structure.length - 1]?.end_seconds || totalDuration)) * 100}%`,
                                            width: `${Math.max(3, ((s.end_seconds - s.start_seconds) / (beatData.structure[beatData.structure.length - 1]?.end_seconds || totalDuration)) * 100)}%`
                                        }}
                                    >
                                        <span className="text-[9px] text-white px-1 truncate block leading-8">{s.section}</span>
                                    </div>
                                ))}

                                {/* Beat Markers (Green Lines) */}
                                {beatData.suggested_cuts?.map((cut, i) => (
                                    <div
                                        key={`cut-${i}`}
                                        className="absolute top-16 bottom-4 w-0.5 bg-green-500"
                                        style={{ left: `${(cut / (beatData.structure?.[beatData.structure.length - 1]?.end_seconds || totalDuration)) * 100}%` }}
                                        title={`Cut at ${cut}s`}
                                    />
                                ))}

                                {/* Peak Moments (Red Dots) */}
                                {beatData.peak_moments?.map((peak, i) => (
                                    <div
                                        key={`peak-${i}`}
                                        className="absolute bottom-2 w-4 h-4 bg-red-500 rounded-full -translate-x-1/2 flex items-center justify-center"
                                        style={{ left: `${(peak / (beatData.structure?.[beatData.structure.length - 1]?.end_seconds || totalDuration)) * 100}%` }}
                                        title={`Peak at ${peak}s`}
                                    >
                                        <span className="text-[8px] text-white font-bold">!</span>
                                    </div>
                                ))}

                                {/* Legend */}
                                <div className="absolute bottom-1 right-2 flex gap-3 text-[9px] bg-gray-900/80 px-2 py-1 rounded">
                                    <span className="text-yellow-400">▮ Frames</span>
                                    <span className="text-green-400">│ Cuts</span>
                                    <span className="text-red-400">● Peaks</span>
                                    <span className="text-blue-400">■ Sections</span>
                                </div>
                            </div>
                        </div>

                        {/* 🆕 ADVANCED OPTIONS */}
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full text-left text-sm text-gray-400 hover:text-white mb-4 flex items-center gap-2"
                        >
                            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                            Advanced Cut Options
                        </button>

                        {showAdvanced && (
                            <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                                <h5 className="text-sm font-bold text-white mb-3">Cut Timing Style</h5>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'on-beat', name: 'On Beat', desc: 'Cut exactly on musical beats' },
                                        { id: 'half-beat', name: 'Half Beat', desc: 'Cut between beats for faster pace' },
                                        { id: 'phrase', name: 'Phrase End', desc: 'Cut at end of musical phrases' }
                                    ].map((style) => (
                                        <button
                                            key={style.id}
                                            onClick={() => setCutStyle(style.id)}
                                            className={`p-3 rounded-lg text-left ${cutStyle === style.id
                                                ? 'bg-cyan-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            <div className="font-bold text-sm">{style.name}</div>
                                            <div className="text-xs opacity-70">{style.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        <div className="bg-gray-800 p-4 rounded-lg mb-4">
                            <h4 className="text-sm font-bold text-white mb-2">💡 Beat-Sync Recommendations</h4>
                            <ul className="text-sm text-gray-300 space-y-1">
                                <li>• <strong className="text-cyan-400">6-second frames</strong> align with {Math.round(6 / (60 / beatData.bpm))} beats at {beatData.bpm} BPM</li>
                                <li>• Beat-perfect duration: <strong className="text-green-400">{getBeatAlignedDuration(beatData.bpm)}s</strong> ({Math.round(getBeatAlignedDuration(beatData.bpm) / (60 / beatData.bpm))} beats)</li>
                                <li>• Energy level suggests <strong>{beatData.energy_level === 'high' ? 'fast cuts (3-6s) & dynamic camera' : beatData.energy_level === 'medium' ? 'standard cuts (6s)' : 'slow cinematic cuts (12s)'}</strong></li>
                                <li>• <strong>{beatData.peak_moments?.length || 0}</strong> peak moments detected for impactful visuals</li>
                                <li>• <strong>{beatData.suggested_cuts?.length || 0}</strong> AI-suggested cut points</li>
                            </ul>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => audioInputRef.current?.click()}
                                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" /> Re-analyze
                            </button>
                            <button
                                onClick={() => {
                                    onApplyCuts({ ...beatData, selectedDuration, cutStyle });
                                    if (setSceneDuration) setSceneDuration(selectedDuration);
                                }}
                                className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-white font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" /> Apply Beat-Sync ({selectedDuration}s frames)
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div
                            onClick={() => audioInputRef.current?.click()}
                            className="w-48 h-48 mx-auto bg-gray-800 border-2 border-dashed border-gray-600 rounded-full flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 transition-colors mb-4"
                        >
                            <Music2 className="w-16 h-16 text-gray-500 mb-2" />
                            <span className="text-gray-400 text-sm">Upload Audio</span>
                        </div>
                        <p className="text-gray-400">Upload an audio file to analyze rhythm and BPM</p>
                        <p className="text-xs text-gray-500 mt-2">Supports MP3, WAV, M4A, OGG</p>

                        {/* Quick Tip */}
                        <div className="mt-6 bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4 max-w-md mx-auto">
                            <p className="text-sm text-cyan-200">
                                💡 <strong>Tip:</strong> 6-second frames are ideal for most music videos.
                                At 120 BPM, each 6s frame = exactly 12 beats.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- STYLE TRANSFER MODAL ---
const StyleTransferModal = ({
    isOpen, onClose, scenes, sceneImages,
    onPreview, preview, loading,
    intensity, setIntensity, onApplyStyle
}) => {
    const [selectedScene, setSelectedScene] = useState(0);
    const [selectedPreset, setSelectedPreset] = useState(null);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Paintbrush className="w-5 h-5 text-fuchsia-400" /> Real-time Style Transfer
                    </h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Scene Selection */}
                    <div>
                        <h4 className="text-sm font-bold text-white mb-3">Select Scene</h4>
                        <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-2">
                            {scenes.map((scene, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedScene(idx)}
                                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedScene === idx ? 'border-fuchsia-500 ring-2 ring-fuchsia-500/30' : 'border-transparent hover:border-gray-600'}`}
                                >
                                    {sceneImages[idx] ? (
                                        <img src={sceneImages[idx]} className="w-full aspect-video object-cover" alt={`Scene ${idx + 1}`} />
                                    ) : (
                                        <div className="w-full aspect-video bg-gray-800 flex items-center justify-center">
                                            <ImageIcon className="w-6 h-6 text-gray-600" />
                                        </div>
                                    )}
                                    <div className="bg-gray-800 p-1 text-[10px] text-center text-gray-300">Scene {idx + 1}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Center: Style Presets */}
                    <div>
                        <h4 className="text-sm font-bold text-white mb-3">Choose Style</h4>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {STYLE_TRANSFER_PRESETS.map((preset) => (
                                <div
                                    key={preset.id}
                                    onClick={() => setSelectedPreset(preset)}
                                    className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${selectedPreset?.id === preset.id ? 'border-fuchsia-500 bg-fuchsia-900/20' : 'border-gray-700 hover:border-gray-600 bg-gray-800'}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: preset.color }} />
                                        <span className="text-sm font-bold text-white truncate">{preset.name}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 line-clamp-2">{preset.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* Intensity Slider */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Subtle</span>
                                <span>Intensity: {intensity}%</span>
                                <span>Transform</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={intensity}
                                onChange={(e) => setIntensity(Number(e.target.value))}
                                className="w-full accent-fuchsia-500"
                            />
                        </div>

                        <button
                            onClick={() => onPreview(selectedScene, selectedPreset)}
                            disabled={!sceneImages[selectedScene] || !selectedPreset || loading}
                            className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 rounded-lg text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Generate Preview
                        </button>
                    </div>

                    {/* Right: Preview Comparison */}
                    <div>
                        <h4 className="text-sm font-bold text-white mb-3">Before / After</h4>
                        {preview ? (
                            <div className="space-y-4">
                                <div>
                                    <div className="text-[10px] text-gray-500 mb-1 uppercase">Original</div>
                                    <img src={preview.original} className="w-full rounded-lg border border-gray-700" alt="Original" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-fuchsia-400 mb-1 uppercase">{preview.preset?.name}</div>
                                    <img src={preview.styled} className="w-full rounded-lg border border-fuchsia-500/50" alt="Styled" />
                                </div>
                                <button
                                    onClick={() => onApplyStyle(preview.sceneIndex, preview.styled)}
                                    className="w-full py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Check className="w-4 h-4" /> Apply This Style
                                </button>
                            </div>
                        ) : (
                            <div className="h-64 bg-gray-800 rounded-lg flex flex-col items-center justify-center text-gray-500 text-sm border border-gray-700">
                                <ImageIcon className="w-10 h-10 mb-2 text-gray-600" />
                                <p>Preview will appear here</p>
                                <p className="text-xs text-gray-600 mt-1">Select a scene and style, then generate</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- FAN REACTION PREDICTOR MODAL ---
const FanReactionModal = ({ isOpen, onClose, data, scenes, sceneImages }) => {
    if (!isOpen) return null;

    const getViralColor = (potential) => {
        if (potential?.includes('VIRAL')) return 'text-red-500 bg-red-500/20';
        if (potential?.includes('HIGH')) return 'text-yellow-400 bg-yellow-500/20';
        if (potential?.includes('MEDIUM')) return 'text-blue-400 bg-blue-500/20';
        return 'text-gray-400 bg-gray-500/20';
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        if (score >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        🔮 Fan Reaction Predictor
                    </h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                {data ? (
                    <>
                        {/* Overall Score Card */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-xl p-4 text-center col-span-1">
                                <div className={`text-5xl font-bold ${getScoreColor(data.overall_score)}`}>{data.overall_score}</div>
                                <div className="text-xs text-gray-400 mt-1">Overall Engagement</div>
                            </div>
                            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-green-400">🔥 Scene {data.most_viral_scene}</div>
                                <div className="text-xs text-gray-400 mt-1">Most Viral</div>
                            </div>
                            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-red-400">⚠️ Scene {data.weakest_scene}</div>
                                <div className="text-xs text-gray-400 mt-1">Needs Work</div>
                            </div>
                            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                                <div className="text-xs text-gray-400 mb-2">Platform Predictions</div>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between"><span>TikTok</span><span className="text-pink-400">{data.platform_predictions?.tiktok}</span></div>
                                    <div className="flex justify-between"><span>YouTube</span><span className="text-red-400">{data.platform_predictions?.youtube}</span></div>
                                    <div className="flex justify-between"><span>Instagram</span><span className="text-purple-400">{data.platform_predictions?.instagram}</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Scene by Scene Analysis */}
                        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-cyan-400" /> Scene-by-Scene Analysis
                        </h4>
                        <div className="space-y-3">
                            {data.scenes?.map((scene, idx) => (
                                <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                                    <div className="flex gap-4">
                                        {/* Scene Thumbnail */}
                                        <div className="w-24 h-16 rounded overflow-hidden flex-shrink-0 bg-gray-900">
                                            {sceneImages[scene.scene_number - 1] ? (
                                                <img src={sceneImages[scene.scene_number - 1]} className="w-full h-full object-cover" alt={`Scene ${scene.scene_number}`} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                    <ImageIcon className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-white font-bold">Scene {scene.scene_number}</span>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getViralColor(scene.viral_potential)}`}>
                                                        {scene.viral_potential}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${scene.engagement_score >= 60 ? 'bg-green-500' : scene.engagement_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                            style={{ width: `${scene.engagement_score}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-sm font-bold ${getScoreColor(scene.engagement_score)}`}>{scene.engagement_score}</span>
                                                </div>
                                            </div>

                                            {/* Predicted Reactions */}
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {scene.predicted_reactions?.slice(0, 3).map((reaction, i) => (
                                                    <span key={i} className="bg-gray-700 text-gray-300 text-[10px] px-2 py-0.5 rounded-full">
                                                        "{reaction}"
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Warnings */}
                                            {scene.warning_flags?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    {scene.warning_flags.map((warning, i) => (
                                                        <span key={i} className="bg-red-900/30 text-red-400 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            ⚠️ {warning}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Tips */}
                                            {scene.improvement_tips && (
                                                <p className="text-[10px] text-cyan-400 italic">💡 {scene.improvement_tips}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end">
                            <button onClick={onClose} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-bold transition-colors">
                                Close
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">🔮 Predicting audience reactions...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// NEW CREATIVE FEATURES BUNDLE - MODAL COMPONENTS
// ============================================================================

// --- 1. EMOTION TIMELINE MODAL ---
const EmotionTimelineModal = ({ isOpen, onClose, data, scenes }) => {
    if (!isOpen) return null;

    const emotionColors = {
        joy: '#FFD700', sadness: '#4169E1', anger: '#DC143C', fear: '#800080',
        love: '#FF69B4', nostalgia: '#DEB887', hope: '#90EE90', despair: '#2F4F4F',
        excitement: '#FF4500', calm: '#87CEEB'
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">🎭 AI Emotion Timeline</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                {data ? (
                    <>
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-4 text-center">
                                <div className="text-lg font-bold text-purple-400 capitalize">{data.arc_type}</div>
                                <div className="text-xs text-gray-400">Emotional Arc</div>
                            </div>
                            <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-red-400">Scene {data.peak_scene}</div>
                                <div className="text-xs text-gray-400">Peak Moment</div>
                            </div>
                            <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4 text-center">
                                <div className="text-lg font-bold text-blue-400">{data.color_grading}</div>
                                <div className="text-xs text-gray-400">Color Grading</div>
                            </div>
                            <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-4 text-center">
                                <div className="text-lg font-bold text-green-400">{data.contrast_points?.length || 0}</div>
                                <div className="text-xs text-gray-400">Contrast Points</div>
                            </div>
                        </div>

                        {/* Emotion Timeline Visualization */}
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-white mb-3">Emotion Wave</h4>
                            <div className="relative h-32 bg-gray-800 rounded-lg overflow-hidden flex items-end">
                                {data.scenes?.map((scene, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 mx-0.5 rounded-t transition-all hover:opacity-80"
                                        style={{
                                            height: `${scene.intensity}%`,
                                            backgroundColor: emotionColors[scene.primary_emotion] || '#6B7280'
                                        }}
                                        title={`Scene ${scene.scene_number}: ${scene.primary_emotion} (${scene.intensity}%)`}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                                <span>Scene 1</span>
                                <span>Scene {data.scenes?.length || scenes.length}</span>
                            </div>
                        </div>

                        {/* Scene Details */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {data.scenes?.map((scene, i) => (
                                <div key={i} className="bg-gray-800 rounded-lg p-3 border-l-4" style={{ borderColor: emotionColors[scene.primary_emotion] || '#6B7280' }}>
                                    <div className="text-xs text-gray-500 mb-1">Scene {scene.scene_number}</div>
                                    <div className="text-sm font-bold text-white capitalize mb-1">{scene.primary_emotion}</div>
                                    <div className="text-xs text-gray-400">😊 {scene.face_expression}</div>
                                    <div className="text-xs text-gray-400">📷 {scene.camera_energy}</div>
                                    <div className="text-[10px] mt-2 px-2 py-1 rounded-full inline-block" style={{ backgroundColor: `${emotionColors[scene.primary_emotion]}20`, color: emotionColors[scene.primary_emotion] }}>
                                        {scene.color_mood}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">🎭 Analyzing emotional journey...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 2. PARALLAX MODAL ---
const ParallaxModal = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">🎬 Cinematic Parallax Generator</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                {data ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4">
                                <h4 className="text-sm font-bold text-red-400 mb-2">Foreground</h4>
                                <ul className="text-xs text-gray-300 space-y-1">
                                    {data.foreground?.map((item, i) => <li key={i}>• {item}</li>)}
                                </ul>
                            </div>
                            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-xl p-4">
                                <h4 className="text-sm font-bold text-yellow-400 mb-2">Midground</h4>
                                <ul className="text-xs text-gray-300 space-y-1">
                                    {data.midground?.map((item, i) => <li key={i}>• {item}</li>)}
                                </ul>
                            </div>
                            <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4">
                                <h4 className="text-sm font-bold text-blue-400 mb-2">Background</h4>
                                <ul className="text-xs text-gray-300 space-y-1">
                                    {data.background?.map((item, i) => <li key={i}>• {item}</li>)}
                                </ul>
                            </div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-4">
                            <div className="grid grid-cols-3 gap-4 text-center mb-4">
                                <div><span className="text-2xl font-bold text-cyan-400">{data.depth_layers}</span><p className="text-xs text-gray-500">Depth Layers</p></div>
                                <div><span className="text-lg font-bold text-purple-400">{data.movement_direction}</span><p className="text-xs text-gray-500">Direction</p></div>
                                <div><span className="text-lg font-bold text-green-400">{data.ken_burns}</span><p className="text-xs text-gray-500">Ken Burns</p></div>
                            </div>
                            <div className="bg-gray-900 p-3 rounded-lg">
                                <h5 className="text-xs font-bold text-gray-400 mb-2">Keyframe Suggestions</h5>
                                <pre className="text-xs text-gray-300 whitespace-pre-wrap">{data.keyframes}</pre>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">🎬 Generating parallax layers...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 3. MORPH TRANSITION MODAL ---
const MorphTransitionModal = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">🔄 AI Scene Morph Transitions</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                {data ? (
                    <div className="space-y-4">
                        {data.transitions?.map((t, i) => (
                            <div key={i} className="bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">Scene {t.from_scene}</span>
                                        <ArrowRight className="w-5 h-5 text-purple-400" />
                                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">Scene {t.to_scene}</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${t.difficulty === 'Easy' ? 'bg-green-600' : t.difficulty === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'}`}>{t.difficulty}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mb-3">
                                    <div><span className="text-xs text-gray-500">Type</span><p className="text-white font-bold">{t.transition_type}</p></div>
                                    <div><span className="text-xs text-gray-500">Anchor</span><p className="text-purple-400">{t.morph_anchor}</p></div>
                                    <div><span className="text-xs text-gray-500">Duration</span><p className="text-cyan-400">{t.duration}s</p></div>
                                </div>
                                <div className="bg-gray-900 p-3 rounded-lg">
                                    <span className="text-xs text-gray-500">AI Video Prompt</span>
                                    <p className="text-sm text-gray-300 mt-1">{t.ai_prompt}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">🔄 Generating morph transitions...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 4. METAPHOR MODAL ---
const MetaphorModal = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">🎭 Lyrics-to-Visual Metaphor Engine</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                {data ? (
                    <div className="space-y-4">
                        {data.metaphors?.map((m, i) => (
                            <div key={i} className="bg-gray-800 rounded-lg p-4 border-l-4 border-pink-500">
                                <p className="text-white font-bold mb-2 italic">"{m.lyric_line}"</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                    <div><span className="text-xs text-gray-500">Metaphor</span><p className="text-pink-400">{m.metaphor}</p></div>
                                    <div><span className="text-xs text-gray-500">Visual Symbol</span><p className="text-purple-400">{m.visual_symbol}</p></div>
                                    <div><span className="text-xs text-gray-500">Color</span><p className="text-cyan-400">{m.color_association}</p></div>
                                    <div><span className="text-xs text-gray-500">Camera</span><p className="text-yellow-400">{m.camera_technique}</p></div>
                                    <div className="col-span-2"><span className="text-xs text-gray-500">VFX</span><p className="text-green-400">{m.vfx_suggestion}</p></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">🎭 Extracting visual metaphors...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 5. SOCIAL CROP MODAL ---
const SocialCropModal = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">📱 Social Media Auto-Cropper</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                {data ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th className="p-3 text-left text-gray-400">Scene</th>
                                    <th className="p-3 text-left text-gray-400">Focus</th>
                                    <th className="p-3 text-left text-gray-400">9:16 (TikTok)</th>
                                    <th className="p-3 text-left text-gray-400">4:5 (IG Feed)</th>
                                    <th className="p-3 text-left text-gray-400">1:1 (Square)</th>
                                    <th className="p-3 text-left text-gray-400">Risk</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.scenes?.map((scene, i) => (
                                    <tr key={i} className="border-t border-gray-800 hover:bg-gray-800/50">
                                        <td className="p-3 font-bold text-white">Scene {scene.scene_number}</td>
                                        <td className="p-3 text-cyan-400">{scene.focus_point}</td>
                                        <td className="p-3 text-purple-400 text-xs">{scene.crop_9_16}</td>
                                        <td className="p-3 text-pink-400 text-xs">{scene.crop_4_5}</td>
                                        <td className="p-3 text-yellow-400 text-xs">{scene.crop_1_1}</td>
                                        <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${scene.risk_level === 'Low' ? 'bg-green-600' : scene.risk_level === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'}`}>{scene.risk_level}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">📱 Analyzing crop strategies...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 6. MUSIC VISUALIZER MODAL ---
const MusicVisualizerModal = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">🎵 AI Music Visualizer Overlay</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                {data ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.visualizers?.map((v, i) => (
                            <div key={i} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-cyan-500 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-white">{v.name}</h4>
                                    <span className="bg-cyan-600 text-white px-2 py-0.5 rounded text-xs">{v.type}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                    <div><span className="text-xs text-gray-500">Position</span><p className="text-purple-400">{v.position}</p></div>
                                    <div><span className="text-xs text-gray-500">Opacity</span><p className="text-yellow-400">{v.opacity}%</p></div>
                                    <div><span className="text-xs text-gray-500">Colors</span><p className="text-pink-400">{v.color_scheme}</p></div>
                                    <div><span className="text-xs text-gray-500">Animation</span><p className="text-green-400">{v.animation_style}</p></div>
                                </div>
                                <div className="bg-gray-900 p-2 rounded text-xs">
                                    <span className="text-gray-500">AE Expression:</span>
                                    <code className="text-cyan-300 block mt-1 break-all">{v.ae_expression}</code>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">🎵 Generating visualizer designs...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 7. GROK EXPORT MODAL ---
const GrokExportModal = ({ isOpen, onClose, data, progress, onDownload }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">📦 Grok.ai Export Package</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                {data ? (
                    <div className="space-y-6">
                        <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-4 text-center">
                            <div className="text-4xl mb-2">✅</div>
                            <h4 className="text-lg font-bold text-green-400">Export Ready!</h4>
                            <p className="text-gray-400 text-sm">Your Grok.ai package is ready for download</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-gray-800 rounded-lg p-3">
                                <div className="text-2xl font-bold text-cyan-400">{data.scenes?.length || 0}</div>
                                <div className="text-xs text-gray-500">Scenes</div>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-3">
                                <div className="text-2xl font-bold text-purple-400">{data.grok_prompts?.length || 0}</div>
                                <div className="text-xs text-gray-500">Grok Prompts</div>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-3">
                                <div className="text-2xl font-bold text-green-400">{data.scenes?.filter(s => s.image_base64).length || 0}</div>
                                <div className="text-xs text-gray-500">Images</div>
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-4">
                            <h5 className="text-sm font-bold text-white mb-3">Package Contents</h5>
                            <ul className="text-sm text-gray-400 space-y-1">
                                <li>✓ Project metadata (title, type, duration)</li>
                                <li>✓ Story details (plot, style, characters, locations)</li>
                                <li>✓ All scene descriptions and scripts</li>
                                <li>✓ Beat sync data (BPM, structure)</li>
                                <li>✓ Optimized Grok.ai prompts for each scene</li>
                                <li>✓ Base64 encoded images</li>
                            </ul>
                        </div>

                        <button
                            onClick={onDownload}
                            className="w-full py-4 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 rounded-xl text-white font-bold flex items-center justify-center gap-3 transition-all"
                        >
                            <Download className="w-6 h-6" /> Download Grok Export (.json)
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center py-8">
                            <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
                            <p className="text-gray-400">📦 Preparing Grok.ai export package...</p>
                        </div>
                        <div className="bg-gray-800 rounded-full h-3 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-cyan-500 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-center text-sm text-gray-500">{progress}% Complete</p>
                    </div>
                )}
            </div>
        </div>
    );
};



// --- 8. MOOD-BASED LUT MODAL ---
const LUTModal = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">🎨 Mood-based LUT Generator</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                {data ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.luts?.map((lut, i) => (
                                <div key={i} className={`bg-gray-800 rounded-lg p-4 border transition-colors ${i === 0 ? 'border-fuchsia-500 ring-1 ring-fuchsia-500/50' : 'border-gray-700 hover:border-gray-500'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-white">{lut.name}</h4>
                                        {i === 0 && <span className="bg-fuchsia-600 text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold">Active</span>}
                                    </div>
                                    <div className="text-xs text-fuchsia-400 font-medium mb-2">{lut.emotion}</div>
                                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{lut.description}</p>

                                    <div className="bg-gray-900 p-2 rounded mb-2">
                                        <span className="text-[10px] text-gray-500 uppercase block mb-1">Prompt Keywords</span>
                                        <p className="text-xs text-green-400 break-words">{lut.grading_keywords}</p>
                                    </div>
                                    <div className="bg-gray-900 p-2 rounded">
                                        <span className="text-[10px] text-gray-500 uppercase block mb-1">CSS Filter</span>
                                        <code className="text-[10px] text-blue-300 break-all block">{lut.css_filter}</code>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h5 className="text-sm font-bold text-blue-400">Automatic Integration</h5>
                                <p className="text-xs text-gray-300">The "Active" LUT (first result) is automatically applied to all future AI image generations. Its keywords are injected into the prompt, and CSS filters can be applied to previews.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 text-fuchsia-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">🎨 Analyzing mood and generating LUTs...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 9. SYMBOLISM MODAL ---
const SymbolismModal = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">🔮 Symbolism & Motif Tracker</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                {data ? (
                    <div className="space-y-6">
                        <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-xl p-4">
                            <h4 className="text-lg font-bold text-indigo-400 mb-2">Theme Analysis</h4>
                            <p className="text-sm text-gray-300">{data.overall_theme_analysis}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.motifs?.map((m, i) => (
                                <div key={i} className="bg-gray-800 rounded-lg p-4 border border-indigo-500/30 hover:border-indigo-500 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center text-xl">✨</div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{m.symbol}</h4>
                                            <p className="text-xs text-indigo-300">{m.meaning}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-900 p-3 rounded-lg mb-3">
                                        <span className="text-xs text-gray-500 uppercase">Visual Prompt Strategy</span>
                                        <p className="text-sm text-green-400 mt-1">{m.visual_prompt}</p>
                                    </div>

                                    <div>
                                        <span className="text-xs text-gray-500 uppercase block mb-2">Appears in Scenes:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {m.target_scenes?.map(sceneNum => (
                                                <span key={sceneNum} className="px-2 py-1 bg-gray-700 rounded text-xs text-white font-mono">
                                                    Scene {sceneNum}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">🔮 Identify recurring symbols...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 10. SMART SCHEDULE MODAL ---
const SmartScheduleModal = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">📅 Smart Shot List Optimizer</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                {data ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                            <div className="bg-gray-800 p-3 rounded-lg text-center">
                                <div className="text-2xl font-bold text-green-400">{data.efficiency_score}%</div>
                                <div className="text-xs text-gray-500">Efficiency Score</div>
                            </div>
                            <div className="bg-gray-800 p-3 rounded-lg text-center">
                                <div className="text-2xl font-bold text-blue-400">{data.total_days}</div>
                                <div className="text-xs text-gray-500">Shooting Days</div>
                            </div>
                            <div className="bg-gray-800 p-3 rounded-lg text-center">
                                <div className="text-2xl font-bold text-purple-400">{data.schedule?.length}</div>
                                <div className="text-xs text-gray-500">Location Blocks</div>
                            </div>
                            <div className="bg-gray-800 p-3 rounded-lg text-center">
                                <div className="text-2xl font-bold text-yellow-400">$$$</div>
                                <div className="text-xs text-gray-500">Budget Optimized</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {data.schedule?.map((block, i) => (
                                <div key={i} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                                    <div className="bg-gray-800/80 p-3 border-b border-gray-700 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">Day {block.day_number}</span>
                                            <h4 className="font-bold text-white text-sm md:text-base">📍 {block.location_name}</h4>
                                        </div>
                                        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {block.estimated_hours}h</span>
                                    </div>
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-[10px] text-gray-500 uppercase font-bold text-fuchsia-500 block mb-2">Scenes to Shoot</span>
                                            <div className="flex flex-wrap gap-2">
                                                {block.scenes_in_block?.map(sceneNum => (
                                                    <span key={sceneNum} className="px-3 py-1 bg-fuchsia-900/30 text-fuchsia-300 border border-fuchsia-500/30 rounded text-sm font-mono">
                                                        Scene {sceneNum}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-500 uppercase font-bold text-blue-500 block mb-2">Cast Required</span>
                                            <div className="flex flex-wrap gap-1">
                                                {block.cast_needed?.map((cast, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 bg-blue-900/20 text-blue-300 rounded text-xs">
                                                        {cast}
                                                    </span>
                                                ))}
                                            </div>
                                            {block.notes && <p className="text-xs text-gray-400 mt-2 italic">"{block.notes}"</p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">📅 Optimizing production schedule...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ConfirmModal = ({ isOpen, onConfirm, onCancel, t }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-xl font-bold text-white mb-2">{t.confirmStartOverTitle}</h3>
                <p className="text-gray-400 mb-6">{t.confirmStartOverMsg}</p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">{t.cancel}</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors">{t.yesStartOver}</button>
                </div>
            </div>
        </div>
    );
};

const ResetBoardModal = ({ isOpen, onClose, onConfirm, t }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-500" /> {t.resetStoryboard}</h3>
                <p className="text-gray-400 mb-6">Are you sure? This will delete all current scenes and images. You will keep your story concept but start the storyboard generation from scratch.</p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">{t.cancel}</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors">Yes, Reset</button>
                </div>
            </div>
        </div>
    );
};

const ElementCard = ({ type, item, onRegenerate, onUpload, elementImages, elementLoading, elementErrors, t }) => {
    const key = `${type}-${item.name}`;
    const imgUrl = elementImages[key];
    const isLoading = elementLoading[key];
    const isError = elementErrors[key];
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => { onUpload(type, item, reader.result); };
        reader.readAsDataURL(file);
    };

    return (
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 flex flex-col group/card hover:border-blue-500/50 transition-colors">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            <div className="aspect-video bg-gray-900 relative flex items-center justify-center group">
                {isLoading ? (<Loader2 className="w-8 h-8 text-blue-500 animate-spin" />) : isError ? (
                    <div className="flex flex-col items-center text-red-400"><AlertCircle className="w-8 h-8 mb-2" /><span className="text-xs">Error</span><button onClick={() => onRegenerate(type, item)} className="mt-2 text-xs underline">Try Again</button></div>
                ) : imgUrl ? (
                    <>
                        <img src={imgUrl} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                            <button onClick={() => onRegenerate(type, item)} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg backdrop-blur text-white text-xs flex items-center gap-2 border border-white/10" title={t.regenerateImage}><RotateCcw className="w-4 h-4" /> {t.regenerateImage}</button>
                            <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-white text-xs font-bold flex items-center gap-2 shadow-lg" title={t.uploadPhoto}><Upload className="w-4 h-4" /> {t.uploadPhoto}</button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col gap-3 items-center p-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center"><User className="text-gray-600 w-8 h-8" /></div>
                        <div className="flex flex-col gap-2 w-full">
                            <button onClick={() => fileInputRef.current?.click()} className="text-xs bg-blue-600 hover:bg-blue-500 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors w-full"><Upload className="w-3 h-3" /> {t.uploadPhoto}</button>
                            <button onClick={() => onRegenerate(type, item)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors w-full"><Sparkles className="w-3 h-3" /> {t.aiGenerate}</button>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2"><h4 className="font-bold text-white truncate pr-2">{item.name}</h4>
                    <div className="flex gap-1 shrink-0">{imgUrl && (<button onClick={() => { const a = document.createElement('a'); a.href = imgUrl; a.download = `${item.name}.png`; a.click(); }} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white" title={t.download}><Download className="w-3 h-3" /></button>)}</div>
                </div>
                <p className="text-xs text-gray-400 line-clamp-3">{item.description}</p>
                {item.clothing && <p className="text-[10px] text-gray-500 mt-1"><span className="text-gray-400 font-bold">Outfit:</span> {item.clothing.substring(0, 40)}...</p>}
            </div>
        </div>
    );
};

const StepForm = ({ formData, setFormData, generateIdeas, suggestStyle, isSuggesting, t, cineSettings, setCineSettings, sceneDuration, setSceneDuration, onBackToProjectType }) => {
    const audioInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const canvasRef = useRef(null);

    // NOTE: getYouTubeID is defined globally at the top of the file

    const [currentAudioFile, setCurrentAudioFile] = useState(null);
    const [audioAnalysis, setAudioAnalysis] = useState(null);
    const [currentVideoFile, setCurrentVideoFile] = useState(null);
    const [currentStyleImage, setCurrentStyleImage] = useState(null);
    const [styleSources, setStyleSources] = useState(['lyrics']);
    const [styleWeights, setStyleWeights] = useState({ lyrics: 50, video: 80, audio: 50, refs: 60, youtube: 60, image: 80 });
    const [showJsonModal, setShowJsonModal] = useState(false);
    const [showArchitectModal, setShowArchitectModal] = useState(false);

    // Helper to handle preset selection
    const handlePresetChange = (e) => {
        const selectedValue = e.target.value;
        if (selectedValue) {
            setFormData(prev => ({ ...prev, visualStyle: selectedValue }));

            // Auto-enable Image Source if preset implies uploading/referencing an image
            const needsImage = /upload|reference image|attached photo|same face|face from|based on the provided|use the uploaded|uploaded reference|reference photo/i.test(selectedValue);
            if (needsImage && !styleSources.includes('image')) {
                setStyleSources(prev => [...prev, 'image']);
            }
        }
    };

    // DYNAMIC CONFIGURATION BASED ON PROJECT TYPE
    const projectType = formData.projectType || 'Music Video';

    const getProjectConfig = (type) => {
        const configs = {
            'Commercial': {
                icon: <Megaphone className="w-6 h-6 text-green-500" />,
                titleLabel: "Product / Brand Name",
                titlePlaceholder: "e.g. Nike Air Max Launch",
                durationLabel: "Ad Duration (mm:ss)",
                scriptLabel: "Ad Script / Key Selling Points",
                scriptPlaceholder: "Paste the voiceover script, slogan, or key features...",
                audioLabel: "Background Music / Voiceover",
                genderLabel: "Lead Actor Gender",
                refLabel: "Competitor / Commercial References",
                lyricsSourceLabel: "Script",
                description: "Professional advertising and promotional content",
                presetCategories: ['Cinematic & Realistic', 'Fashion & Style'],
                defaultCine: { lens: 'Standard (50mm)', era: 'Modern Clean (Digital 8K)', lighting: 'High Contrast / Dramatic', mode: 'Standard Cinematic' },
                defaultSceneDuration: 6,
                defaultStyleSources: ['lyrics', 'refs']
            },
            'Short Film': {
                icon: <Clapperboard className="w-6 h-6 text-purple-500" />,
                titleLabel: "Film Title",
                titlePlaceholder: "e.g. The Last Train",
                durationLabel: "Runtime (mm:ss)",
                scriptLabel: "Screenplay / Scene Outline",
                scriptPlaceholder: "Paste the scene description, dialogue, or synopsis...",
                audioLabel: "Score / Dialogue Reference",
                genderLabel: "Protagonist Gender",
                refLabel: "Film References / Directors",
                lyricsSourceLabel: "Screenplay",
                description: "Narrative-driven cinematic storytelling",
                presetCategories: ['Cinematic & Realistic', 'Sci-Fi & Fantasy', 'Retro & Vintage'],
                defaultCine: { lens: 'Anamorphic', era: 'Modern Clean (Digital 8K)', lighting: 'Natural / Golden Hour', mode: 'Standard Cinematic' },
                defaultSceneDuration: 12,
                defaultStyleSources: ['lyrics', 'refs']
            },
            'Social Media': {
                icon: <Zap className="w-6 h-6 text-pink-500" />,
                titleLabel: "Video Title / Hook",
                titlePlaceholder: "e.g. 5 Tips for Cooking",
                durationLabel: "Duration (mm:ss)",
                scriptLabel: "Caption / Script / Spoken Words",
                scriptPlaceholder: "Paste the script, caption text, or trend description...",
                audioLabel: "Trending Audio / Sound",
                genderLabel: "Creator/Presenter Gender",
                refLabel: "Influencer / Trend References",
                lyricsSourceLabel: "Script",
                description: "TikTok, Reels, Shorts - viral content",
                presetCategories: ['Social Media & Lifestyle', 'Retro & Vintage', 'Fashion & Style'],
                defaultCine: { lens: 'Wide Angle (24mm)', era: 'Y2K Digital (MiniDV)', lighting: 'Neon / Artificial', mode: 'Handheld Amateur' },
                defaultSceneDuration: 6,
                defaultStyleSources: ['lyrics', 'youtube']
            },
            'Documentary': {
                icon: <Globe className="w-6 h-6 text-orange-500" />,
                titleLabel: "Documentary Title",
                titlePlaceholder: "e.g. Life in the Deep Sea",
                durationLabel: "Runtime (mm:ss)",
                scriptLabel: "Topic Overview / Interview Points",
                scriptPlaceholder: "Describe the subject matter, interview questions, or narration...",
                audioLabel: "Narration / Interview Audio",
                genderLabel: "Narrator/Subject Gender",
                refLabel: "Documentary Style References",
                lyricsSourceLabel: "Topic",
                description: "Non-fiction storytelling and journalism",
                presetCategories: ['Cinematic & Realistic', 'Utilities & Tools'],
                defaultCine: { lens: 'Standard (50mm)', era: 'Modern Clean (Digital 8K)', lighting: 'Natural / Golden Hour', mode: 'Standard Cinematic' },
                defaultSceneDuration: 12,
                defaultStyleSources: ['lyrics', 'audio', 'refs']
            },
            'Video Game Trailer': {
                icon: <Gamepad2 className="w-6 h-6 text-red-500" />,
                titleLabel: "Game Title",
                titlePlaceholder: "e.g. Cyberpunk 2077 DLC",
                durationLabel: "Trailer Duration (mm:ss)",
                scriptLabel: "Trailer Script / Action Beats",
                scriptPlaceholder: "Describe the gameplay moments, cinematic cutscenes, and voiceover...",
                audioLabel: "Epic Score / SFX Track",
                genderLabel: "Protagonist Gender",
                refLabel: "Game References / Cinematic Trailers",
                lyricsSourceLabel: "Script",
                description: "High-impact game marketing and cinematics",
                presetCategories: ['Sci-Fi & Fantasy', 'Cinematic & Realistic', 'Anime & Manga'],
                defaultCine: { lens: 'Anamorphic', era: 'Cyberpunk Future', lighting: 'High Contrast / Dramatic', mode: 'Standard Cinematic' },
                defaultSceneDuration: 6,
                defaultStyleSources: ['lyrics', 'refs', 'audio']
            },
            'Comic Book': {
                icon: <BookOpen className="w-6 h-6 text-yellow-500" />,
                titleLabel: "Comic Title",
                titlePlaceholder: "e.g. The Night Watchman",
                durationLabel: "Est. Read Time / Page Count",
                scriptLabel: "Script / Dialogue / Panels",
                scriptPlaceholder: "Page 1, Panel 1: [Description]...",
                audioLabel: "Audiobook / Reading (Optional)",
                genderLabel: "Protagonist Gender",
                refLabel: "Art Style / Artist References",
                lyricsSourceLabel: "Script",
                description: "Sequential art and graphic storytelling",
                presetCategories: ['Anime & Manga', 'Art & Illustration'],
                defaultCine: { lens: 'Standard (50mm)', era: 'Modern Clean (Digital 8K)', lighting: 'High Contrast / Dramatic', mode: 'Standard Cinematic' },
                defaultSceneDuration: 12,
                defaultStyleSources: ['lyrics', 'image', 'refs']
            },
            'Podcast Visualizer': {
                icon: <Mic2 className="w-6 h-6 text-indigo-500" />,
                titleLabel: "Episode Title",
                titlePlaceholder: "e.g. Ep 42: The Future of AI",
                durationLabel: "Duration (mm:ss)",
                scriptLabel: "Transcript / Show Notes",
                scriptPlaceholder: "Paste the transcript or key topics...",
                audioLabel: "Podcast Audio",
                genderLabel: "Host Gender",
                refLabel: "Visual Style / Channel Art",
                lyricsSourceLabel: "Transcript",
                description: "Audio content visualization",
                presetCategories: ['Art & Illustration', 'Social Media & Lifestyle'],
                defaultCine: { lens: 'Standard (50mm)', era: 'Modern Clean (Digital 8K)', lighting: 'Soft / Diffused', mode: 'Standard Cinematic' },
                defaultSceneDuration: 12,
                defaultStyleSources: ['lyrics', 'audio']
            },
            'Animation/Anime': {
                icon: <Star className="w-6 h-6 text-yellow-400" />,
                titleLabel: "Anime/Animation Title",
                titlePlaceholder: "e.g. The Last Guardian",
                durationLabel: "Runtime (mm:ss)",
                scriptLabel: "Story Synopsis / Dialogue Script",
                scriptPlaceholder: "Describe the plot, character dialogue, and key scenes...",
                audioLabel: "Background Music / Voice Acting",
                genderLabel: "Main Character Gender",
                refLabel: "Anime/Animation Style References",
                lyricsSourceLabel: "Script",
                description: "2D/3D animation and anime production",
                presetCategories: ['Anime & Manga', 'Art & Illustration', 'Sci-Fi & Fantasy'],
                defaultCine: { lens: 'Wide Angle (24mm)', era: 'Modern Clean (Digital 8K)', lighting: 'High Contrast / Dramatic', mode: 'Standard Cinematic' },
                defaultSceneDuration: 12,
                defaultStyleSources: ['lyrics', 'refs', 'image']
            },
            'Lyric Video': {
                icon: <Music2 className="w-6 h-6 text-cyan-500" />,
                titleLabel: "Song Title",
                titlePlaceholder: "e.g. Midnight Dreams",
                durationLabel: "Song Duration (mm:ss)",
                scriptLabel: "Lyrics (with Timestamps)",
                scriptPlaceholder: "[00:00] Verse 1: First line of lyrics...",
                audioLabel: "Song Audio File",
                genderLabel: "Artist Gender",
                refLabel: "Typography / Visual Style References",
                lyricsSourceLabel: "Lyrics",
                description: "Typography-focused music visualization",
                presetCategories: ['Art & Illustration', 'Social Media & Lifestyle', 'Retro & Vintage'],
                defaultCine: { lens: 'Standard (50mm)', era: 'Modern Clean (Digital 8K)', lighting: 'Neon / Artificial', mode: 'Standard Cinematic' },
                defaultSceneDuration: 6,
                defaultStyleSources: ['lyrics', 'audio']
            },
            'Live Performance': {
                icon: <Radio className="w-6 h-6 text-rose-500" />,
                titleLabel: "Performance Title",
                titlePlaceholder: "e.g. Acoustic Set at Blue Note",
                durationLabel: "Performance Duration (mm:ss)",
                scriptLabel: "Setlist / Performance Notes",
                scriptPlaceholder: "Song order, stage directions, and key moments...",
                audioLabel: "Live Recording / Reference Track",
                genderLabel: "Performer Gender",
                refLabel: "Stage/Venue Style References",
                lyricsSourceLabel: "Setlist",
                description: "Concert and live show documentation",
                presetCategories: ['Cinematic & Realistic', 'Retro & Vintage'],
                defaultCine: { lens: 'Wide Angle (24mm)', era: 'Modern Clean (Digital 8K)', lighting: 'Strobe / Club', mode: 'Live Performance' },
                defaultSceneDuration: 12,
                defaultStyleSources: ['lyrics', 'audio', 'refs']
            },
            'Brand Film': {
                icon: <Landmark className="w-6 h-6 text-teal-500" />,
                titleLabel: "Brand / Company Name",
                titlePlaceholder: "e.g. Tesla - The Future of Energy",
                durationLabel: "Film Duration (mm:ss)",
                scriptLabel: "Brand Story / Core Message",
                scriptPlaceholder: "Company mission, values, and narrative arc...",
                audioLabel: "Corporate Music / Narration",
                genderLabel: "Narrator/Spokesperson Gender",
                refLabel: "Brand Identity / Tone References",
                lyricsSourceLabel: "Story",
                description: "Corporate storytelling and brand identity",
                presetCategories: ['Cinematic & Realistic', 'Fashion & Style'],
                defaultCine: { lens: 'Anamorphic', era: 'Modern Clean (Digital 8K)', lighting: 'Natural / Golden Hour', mode: 'Standard Cinematic' },
                defaultSceneDuration: 12,
                defaultStyleSources: ['lyrics', 'refs']
            },
            'Tutorial/How-To': {
                icon: <HelpCircle className="w-6 h-6 text-sky-500" />,
                titleLabel: "Tutorial Title",
                titlePlaceholder: "e.g. How to Bake Perfect Croissants",
                durationLabel: "Tutorial Duration (mm:ss)",
                scriptLabel: "Step-by-Step Instructions",
                scriptPlaceholder: "Step 1: Prepare ingredients...\nStep 2: Mix flour...",
                audioLabel: "Voiceover / Background Music",
                genderLabel: "Instructor Gender",
                refLabel: "Tutorial Style References",
                lyricsSourceLabel: "Steps",
                description: "Educational and instructional content",
                presetCategories: ['Utilities & Tools', 'Social Media & Lifestyle'],
                defaultCine: { lens: 'Standard (50mm)', era: 'Modern Clean (Digital 8K)', lighting: 'Soft / Diffused', mode: 'Standard Cinematic' },
                defaultSceneDuration: 12,
                defaultStyleSources: ['lyrics']
            },
            'Wedding Video': {
                icon: <Heart className="w-6 h-6 text-pink-400" />,
                titleLabel: "Couple Names",
                titlePlaceholder: "e.g. Sarah & James - June 15, 2026",
                durationLabel: "Video Duration (mm:ss)",
                scriptLabel: "Ceremony Highlights / Vows",
                scriptPlaceholder: "Key moments: First look, vows, first dance, speeches...",
                audioLabel: "Wedding Song / First Dance Music",
                genderLabel: "Focus Subject",
                refLabel: "Wedding Style / Venue References",
                lyricsSourceLabel: "Vows",
                description: "Romantic ceremony and celebration",
                presetCategories: ['Cinematic & Realistic', 'Fashion & Style', 'Retro & Vintage'],
                defaultCine: { lens: 'Telephoto (85mm)', era: 'Modern Clean (Digital 8K)', lighting: 'Natural / Golden Hour', mode: 'Standard Cinematic' },
                defaultSceneDuration: 12,
                defaultStyleSources: ['lyrics', 'audio', 'image']
            },
            'Sports Highlight': {
                icon: <Activity className="w-6 h-6 text-emerald-500" />,
                titleLabel: "Event / Match Title",
                titlePlaceholder: "e.g. NBA Finals Game 7 Highlights",
                durationLabel: "Highlight Duration (mm:ss)",
                scriptLabel: "Key Moments / Commentary",
                scriptPlaceholder: "Goal at 23', Red card at 45', Final score...",
                audioLabel: "Stadium Audio / Commentary Track",
                genderLabel: "Featured Athlete Gender",
                refLabel: "Sports Broadcast Style References",
                lyricsSourceLabel: "Commentary",
                description: "Dynamic athletic action and highlights",
                presetCategories: ['Cinematic & Realistic'],
                defaultCine: { lens: 'Telephoto (85mm)', era: 'Modern Clean (Digital 8K)', lighting: 'High Contrast / Dramatic', mode: 'Drone / FPV' },
                defaultSceneDuration: 6,
                defaultStyleSources: ['lyrics', 'video']
            },
            'Fashion Lookbook': {
                icon: <Shirt className="w-6 h-6 text-fuchsia-500" />,
                titleLabel: "Collection / Lookbook Name",
                titlePlaceholder: "e.g. Spring/Summer 2026 Collection",
                durationLabel: "Video Duration (mm:ss)",
                scriptLabel: "Look Descriptions / Styling Notes",
                scriptPlaceholder: "Look 1: Oversized blazer with...\nLook 2: Flowing maxi dress...",
                audioLabel: "Runway Music / Ambient Track",
                genderLabel: "Model Gender",
                refLabel: "Fashion Brand / Photographer References",
                lyricsSourceLabel: "Looks",
                description: "High-fashion editorial and runway",
                presetCategories: ['Fashion & Style', 'Cinematic & Realistic', 'Retro & Vintage'],
                defaultCine: { lens: 'Telephoto (85mm)', era: 'Modern Clean (Digital 8K)', lighting: 'Soft / Diffused', mode: 'Standard Cinematic' },
                defaultSceneDuration: 6,
                defaultStyleSources: ['lyrics', 'image', 'refs']
            },
            'Music Performance/Concert': {
                icon: <Disc className="w-6 h-6 text-violet-500" />,
                titleLabel: "Concert / Tour Name",
                titlePlaceholder: "e.g. World Tour 2026 - Madison Square Garden",
                durationLabel: "Concert Duration (mm:ss)",
                scriptLabel: "Setlist / Stage Cues",
                scriptPlaceholder: "Opening: Song A\nPyro at 2:30\nEncore: Song X...",
                audioLabel: "Live Performance Audio",
                genderLabel: "Lead Performer Gender",
                refLabel: "Stage Design / Concert References",
                lyricsSourceLabel: "Setlist",
                description: "Large-scale concert and stage production",
                presetCategories: ['Cinematic & Realistic', 'Retro & Vintage'],
                defaultCine: { lens: 'Wide Angle (24mm)', era: 'Modern Clean (Digital 8K)', lighting: 'Strobe / Club', mode: 'Live Performance' },
                defaultSceneDuration: 12,
                defaultStyleSources: ['lyrics', 'audio']
            },
            'Behind-the-Scenes': {
                icon: <Eye className="w-6 h-6 text-amber-500" />,
                titleLabel: "Production / Project Name",
                titlePlaceholder: "e.g. Making of 'The Last Kingdom' Season 5",
                durationLabel: "BTS Duration (mm:ss)",
                scriptLabel: "Behind-the-Scenes Moments",
                scriptPlaceholder: "Set construction, rehearsals, bloopers, interviews...",
                audioLabel: "Interview Audio / Set Sounds",
                genderLabel: "Featured Crew/Cast Gender",
                refLabel: "BTS Documentary Style References",
                lyricsSourceLabel: "Notes",
                description: "Production insight and making-of content",
                presetCategories: ['Cinematic & Realistic', 'Social Media & Lifestyle'],
                defaultCine: { lens: 'Wide Angle (24mm)', era: 'Y2K Digital (MiniDV)', lighting: 'Natural / Golden Hour', mode: 'Backstage Vlog' },
                defaultSceneDuration: 12,
                defaultStyleSources: ['lyrics', 'video']
            },
            'Interview/Testimonial': {
                icon: <MessageCircle className="w-6 h-6 text-lime-500" />,
                titleLabel: "Interview / Testimonial Title",
                titlePlaceholder: "e.g. Customer Success Story: Acme Corp",
                durationLabel: "Interview Duration (mm:ss)",
                scriptLabel: "Interview Questions / Testimonial Script",
                scriptPlaceholder: "Q1: How did you discover our product?\nA1: I was looking for...",
                audioLabel: "Interview Recording",
                genderLabel: "Interviewee Gender",
                refLabel: "Interview Style References",
                lyricsSourceLabel: "Questions",
                description: "Professional interviews and testimonials",
                presetCategories: ['Cinematic & Realistic', 'Utilities & Tools'],
                defaultCine: { lens: 'Telephoto (85mm)', era: 'Modern Clean (Digital 8K)', lighting: 'Soft / Diffused', mode: 'Standard Cinematic' },
                defaultSceneDuration: 12,
                defaultStyleSources: ['lyrics', 'audio']
            },
            'ASMR/Relaxation': {
                icon: <Volume2 className="w-6 h-6 text-teal-400" />,
                titleLabel: "ASMR / Ambient Title",
                titlePlaceholder: "e.g. Cozy Rainy Night by the Fireplace",
                durationLabel: "Duration (mm:ss)",
                scriptLabel: "Ambient Sound Description",
                scriptPlaceholder: "🌧️ Rain sounds on window\n🔥 Crackling fireplace\n🌲 Forest ambiance\n🌊 Ocean waves\n☕ Coffee shop atmosphere\n📚 Library silence\n🕯️ Candlelight meditation",
                audioLabel: "Ambient Audio / Nature Sounds",
                genderLabel: "Narrator (optional)",
                refLabel: "ASMR Channel / Style References",
                lyricsSourceLabel: "Ambiance",
                description: "Relaxing, sleep-inducing, and calming content",
                presetCategories: ['Cinematic & Realistic'],
                defaultCine: { lens: 'Macro (100mm)', era: 'Soft Focus Film', lighting: 'Warm / Cozy', mode: 'Slow Motion' },
                defaultSceneDuration: 30,
                defaultStyleSources: ['lyrics', 'audio'],
                asmrPresets: [
                    { id: 'rain', emoji: '🌧️', name: 'Rain Sounds', desc: 'Gentle rain on windows, rooftop, leaves' },
                    { id: 'fireplace', emoji: '🔥', name: 'Fireplace', desc: 'Crackling fire, warm cabin atmosphere' },
                    { id: 'forest', emoji: '🌲', name: 'Forest', desc: 'Birds, wind through trees, creek sounds' },
                    { id: 'ocean', emoji: '🌊', name: 'Ocean Waves', desc: 'Beach, waves, seagulls, coastal serenity' },
                    { id: 'thunder', emoji: '⛈️', name: 'Thunderstorm', desc: 'Thunder, heavy rain, distant lightning' },
                    { id: 'coffee', emoji: '☕', name: 'Coffee Shop', desc: 'Café ambiance, soft chatter, espresso machine' },
                    { id: 'library', emoji: '📚', name: 'Library', desc: 'Silent study, page turning, clock ticking' },
                    { id: 'snow', emoji: '❄️', name: 'Snowy Night', desc: 'Winter silence, snowfall, cozy indoor' },
                    { id: 'night', emoji: '🌙', name: 'Night Ambiance', desc: 'Crickets, owls, peaceful darkness' },
                    { id: 'spa', emoji: '🧘', name: 'Spa/Meditation', desc: 'Tibetan bowls, soft music, zen garden' }
                ]
            }
        };

        // Default: Music Video
        const defaultConfig = {
            icon: <Music className="w-6 h-6 text-blue-500" />,
            titleLabel: t.songTitle,
            titlePlaceholder: t.songTitlePlaceholder,
            durationLabel: t.songDuration,
            scriptLabel: t.lyrics,
            scriptPlaceholder: t.lyricsPlaceholder,
            audioLabel: t.uploadAudio,
            genderLabel: t.gender,
            refLabel: t.directorRefs,
            lyricsSourceLabel: t.sourceLyrics,
            description: "Cinematic music video production",
            presetCategories: ['Cinematic & Realistic', 'Fashion & Style', 'Sci-Fi & Fantasy', 'Social Media & Lifestyle', 'Art & Illustration', 'Anime & Manga', 'Retro & Vintage'],
            defaultCine: { lens: 'Anamorphic', era: 'Modern Clean (Digital 8K)', lighting: 'High Contrast / Dramatic', mode: 'Standard Cinematic' },
            defaultSceneDuration: 12,
            defaultStyleSources: ['lyrics']
        };

        return configs[type] || defaultConfig;
    };

    const config = getProjectConfig(projectType);

    // Apply default settings when project type changes
    const [isInitialized, setIsInitialized] = useState(false);
    React.useEffect(() => {
        if (!isInitialized) {
            // Apply defaults from config on first load
            if (config.defaultStyleSources) {
                setStyleSources(config.defaultStyleSources);
            }
            if (config.defaultCine) {
                setCineSettings(prev => ({
                    ...prev,
                    lens: config.defaultCine.lens || prev.lens,
                    era: config.defaultCine.era || prev.era,
                    lighting: config.defaultCine.lighting || prev.lighting,
                    mode: config.defaultCine.mode || prev.mode
                }));
            }
            if (config.defaultSceneDuration) {
                setSceneDuration(config.defaultSceneDuration);
            }
            setIsInitialized(true);
        }
    }, [projectType, config, isInitialized, setCineSettings, setSceneDuration]);


    const handleAudioFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 15 * 1024 * 1024) { alert("Max 15MB"); return; }
            setCurrentAudioFile(file);

            let audioContext = null;
            try {
                const arrayBuffer = await file.arrayBuffer();
                audioContext = new (window.AudioContext || (window).webkitAudioContext)();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                const duration = audioBuffer.duration;
                const minutes = Math.floor(duration / 60);
                const seconds = Math.floor(duration % 60);
                const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                setFormData(prev => ({ ...prev, duration: formattedDuration }));

                setAudioAnalysis({
                    duration: duration,
                    sampleRate: audioBuffer.sampleRate,
                    numberOfChannels: audioBuffer.numberOfChannels,
                    buffer: audioBuffer
                });

                setTimeout(() => {
                    if (canvasRef.current) drawWaveform(audioBuffer, canvasRef.current);
                }, 100);

            } catch (err) {
                console.error("Audio analysis failed", err);
            } finally {
                // Close AudioContext to prevent memory leak
                if (audioContext && audioContext.state !== 'closed') {
                    audioContext.close().catch(console.error);
                }
            }
        }
    };

    const handleVideoFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) { if (file.size > 15 * 1024 * 1024) { alert("Max 15MB"); return; } setCurrentVideoFile(file); }
    };
    const handleImageFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) { if (file.size > 5 * 1024 * 1024) { alert("Max 5MB"); return; } setCurrentStyleImage(file); }
    };

    const toggleStyleSource = (id) => {
        setStyleSources(prev => { if (prev.includes(id)) { return prev.filter(s => s !== id); } else { return [...prev, id]; } });
    };
    const handleWeightChange = (id, value) => { setStyleWeights(prev => ({ ...prev, [id]: parseInt(value) })); };

    const handleJsonImport = (json) => {
        if (json.cinematography || json.setting) {
            if (json.setting?.location) setFormData(prev => ({ ...prev, visualStyle: `${json.setting.location}. ${json.setting.environment}. ${prev.visualStyle}` }));
            if (json.cinematography) {
                setFormData(prev => ({ ...prev, visualStyle: `${prev.visualStyle} [Mood: ${json.cinematography.mood}] [Color: ${json.cinematography.color_grading}]` }));
            }
        }
        if (json.pipeline_configuration) {
            const config = json.pipeline_configuration;
            if (config.generative_parameters?.lighting_and_atmosphere) {
                const lighting = config.generative_parameters.lighting_and_atmosphere;
                setFormData(prev => ({ ...prev, visualStyle: `${prev.visualStyle} [Lighting: ${lighting.style}, ${lighting.quality}]` }));
            }
            if (config.generative_parameters?.scene_composition?.camera_settings) {
                const cam = config.generative_parameters.scene_composition.camera_settings;
                setCineSettings(prev => ({ ...prev, lens: cam.lens_character || prev.lens }));
            }
        }
        if (json.image_description) {
            setFormData(prev => ({ ...prev, visualStyle: `${json.image_description}. ${prev.visualStyle}` }));
        }
    };

    return (
        <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBackToProjectType}
                            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
                            title={t.backToProjectType}
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="p-2 bg-gray-700/50 rounded-lg">{config.icon}</div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{projectType} Project</h2>
                            <p className="text-xs text-gray-400">{config.description || `AI Director Mode: ${projectType}`}</p>
                        </div>
                    </div>
                    <button onClick={() => setShowJsonModal(true)} className="flex items-center gap-2 text-xs bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-500 border border-yellow-700/50 px-3 py-1.5 rounded-lg transition-colors">
                        <Code2 className="w-3 h-3" /> {t.importJson}
                    </button>
                </div>

                <div className="space-y-6">
                    <div className={`bg-gray-900/50 p-4 rounded-xl border ${audioAnalysis ? 'border-blue-500/50' : 'border-gray-700 border-dashed'}`}>
                        <div className="flex justify-between items-start mb-3">
                            <label className="block text-gray-400 text-sm font-semibold flex items-center gap-2"><FileAudio className="w-4 h-4 text-purple-400" /> {config.audioLabel}</label>
                            {audioAnalysis && <span className="text-[10px] bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">{t.audioAnalyzed}</span>}
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                            <input type="file" ref={audioInputRef} accept="audio/*" className="hidden" onChange={handleAudioFileSelect} />
                            <button onClick={() => audioInputRef.current?.click()} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 transition-colors flex items-center gap-2 text-sm"><Upload className="w-4 h-4" /> {t.uploadAudioBtn}</button>
                            {currentAudioFile && (<span className="text-sm text-green-400 flex items-center gap-1 truncate max-w-[150px]"><CheckCircle className="w-3 h-3" /> {currentAudioFile.name}</span>)}
                        </div>

                        {audioAnalysis && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <div className="bg-black/40 rounded-lg p-2 mb-3 border border-gray-700">
                                    <canvas ref={canvasRef} width="500" height="60" className="w-full h-16 opacity-80" />
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-400">
                                    <div className="bg-gray-800 p-2 rounded flex flex-col items-center">
                                        <ActivitySquare className="w-3 h-3 mb-1 text-blue-400" />
                                        <span className="font-bold text-white">{Math.round(audioAnalysis.sampleRate / 1000)} kHz</span>
                                        <span>{t.sampleRate}</span>
                                    </div>
                                    <div className="bg-gray-800 p-2 rounded flex flex-col items-center">
                                        <Speaker className="w-3 h-3 mb-1 text-green-400" />
                                        <span className="font-bold text-white">{audioAnalysis.numberOfChannels === 2 ? 'Stereo' : 'Mono'}</span>
                                        <span>{t.channels}</span>
                                    </div>
                                    <div className="bg-gray-800 p-2 rounded flex flex-col items-center">
                                        <BarChart3 className="w-3 h-3 mb-1 text-pink-400" />
                                        <span className="font-bold text-white">~{Math.ceil(audioAnalysis.duration / sceneDuration)} Scenes</span>
                                        <span>{t.recommendSceneCount}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <p className="text-xs text-gray-500 mt-2">{t.uploadAudioDesc}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 border-dashed">
                            <label className="block text-gray-400 text-sm mb-3 font-semibold flex items-center gap-2"><MonitorPlay className="w-4 h-4 text-green-400" /> {t.uploadVideo}</label>
                            <div className="flex items-center gap-2 flex-wrap">
                                <input type="file" ref={videoInputRef} accept="video/*" className="hidden" onChange={handleVideoFileSelect} />
                                <button onClick={() => videoInputRef.current?.click()} className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg border border-gray-600 transition-colors flex items-center gap-2 text-xs"><Upload className="w-3 h-3" /> {t.uploadVideoBtn}</button>
                                {currentVideoFile && (<span className="text-xs text-green-400 flex items-center gap-1 truncate max-w-[100px]"><CheckCircle className="w-3 h-3" /> {currentVideoFile.name}</span>)}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-2">{t.uploadVideoDesc}</p>
                        </div>

                        <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 border-dashed">
                            <label className="block text-gray-400 text-sm mb-3 font-semibold flex items-center gap-2"><Images className="w-4 h-4 text-pink-400" /> {t.uploadImage}</label>
                            <div className="flex items-center gap-2 flex-wrap">
                                <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleImageFileSelect} />
                                <button onClick={() => imageInputRef.current?.click()} className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg border border-gray-600 transition-colors flex items-center gap-2 text-xs"><Upload className="w-3 h-3" /> {t.uploadImageBtn}</button>
                                {currentStyleImage && (<span className="text-xs text-green-400 flex items-center gap-1 truncate max-w-[100px]"><CheckCircle className="w-3 h-3" /> {currentStyleImage.name}</span>)}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-2">{t.uploadImageDesc}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2 font-medium">{config.titleLabel}</label>
                            <input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder={config.titlePlaceholder}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between">
                                <label className="block text-gray-400 text-sm mb-2 flex items-center gap-1"><Watch className="w-3 h-3" /> {config.durationLabel}</label>
                                {audioAnalysis && <span className="text-[10px] text-green-400 flex items-center gap-1"><Check className="w-3 h-3" /> {t.autoFillDuration}</span>}
                            </div>
                            <input
                                value={formData.duration}
                                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                className={`w-full bg-gray-900 border rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none ${audioAnalysis ? 'border-green-500/50 text-green-100' : 'border-gray-700'}`}
                                placeholder={t.songDurationPlaceholder}
                            />
                        </div>
                    </div>

                    {/* New Scene Duration Selector */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2"><Timer className="w-4 h-4 text-orange-400" /> {t.sceneDurationOption}</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setSceneDuration(6)} className={`py-3 px-4 rounded-lg border flex items-center justify-center gap-2 transition-all ${sceneDuration === 6 ? 'bg-orange-600 border-orange-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800'}`}>
                                <Zap className="w-4 h-4" /> {t.sec6}
                            </button>
                            <button onClick={() => setSceneDuration(12)} className={`py-3 px-4 rounded-lg border flex items-center justify-center gap-2 transition-all ${sceneDuration === 12 ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800'}`}>
                                <Film className="w-4 h-4" /> {t.sec12}
                            </button>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-gray-400 text-sm">{t.includeCharacters}</label>
                            <button onClick={() => setFormData({ ...formData, useCharacters: !formData.useCharacters })} className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 ${formData.useCharacters ? 'bg-blue-600' : 'bg-gray-700'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.useCharacters ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">{t.includeCharactersDesc}</p>
                        {formData.useCharacters && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="block text-gray-400 text-sm mb-2">{config.genderLabel}</label>
                                <div className="flex gap-4">
                                    {['female', 'male'].map(g => (
                                        <button key={g} onClick={() => setFormData({ ...formData, gender: g === 'female' ? t.female : t.male })} className={`flex-1 py-3 px-4 rounded-lg border flex items-center justify-center gap-2 transition-all ${(formData.gender === t.female && g === 'female') || (formData.gender === t.male && g === 'male') ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800'}`}>
                                            <User className="w-4 h-4" />{g === 'female' ? t.female : t.male}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ===== SUNO.COM IMPORT SECTION ===== */}
                    <div className="mt-4 bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-purple-500/30 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-white text-sm font-bold flex items-center gap-2">
                                <Music className="w-4 h-4 text-purple-400" /> 🎵 Suno.com'dan İçe Aktar
                            </label>
                            <button
                                onClick={() => window.open('https://suno.com/me', '_blank')}
                                className="text-xs bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all border border-purple-500/40"
                            >
                                <FolderOpen className="w-3 h-3" /> Kütüphanem
                            </button>
                        </div>

                        {/* Paste Area - Works everywhere including Gemini Canvas */}
                        <div className="mb-3">
                            <p className="text-xs text-purple-300/80 mb-2">
                                Suno Manager scriptinden JSON kopyalayıp aşağıya yapıştırın:
                            </p>
                            <div className="flex gap-2">
                                <textarea
                                    id="suno-json-input"
                                    className="flex-1 bg-gray-900/80 border border-purple-500/40 rounded-lg p-3 text-white text-sm h-16 focus:ring-2 focus:ring-purple-500 outline-none resize-none placeholder-gray-500"
                                    placeholder='{"title":"Şarkı Adı","lyrics":"..."} veya düz söz metni...'
                                />
                                <button
                                    onClick={() => {
                                        const textarea = document.getElementById('suno-json-input');
                                        const text = textarea?.value?.trim();

                                        if (!text) {
                                            alert('❌ Lütfen önce JSON veya söz yapıştırın!');
                                            return;
                                        }

                                        try {
                                            const data = JSON.parse(text);
                                            setFormData(prev => ({
                                                ...prev,
                                                title: data.title || prev.title,
                                                lyrics: data.lyrics || prev.lyrics
                                            }));
                                            textarea.value = '';
                                            alert('✅ Başarıyla içe aktarıldı: ' + (data.title || 'Şarkı'));
                                        } catch {
                                            // Plain text - put in lyrics
                                            setFormData(prev => ({ ...prev, lyrics: text }));
                                            textarea.value = '';
                                            alert('✅ Söz olarak eklendi!');
                                        }
                                    }}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-lg"
                                >
                                    İçe Aktar
                                </button>
                            </div>
                        </div>

                        <p className="text-[10px] text-gray-500">
                            💡 Suno Manager Tampermonkey scriptini kullanarak şarkı verilerini kolayca kopyalayabilirsiniz
                        </p>
                    </div>

                    {/* ===== LYRICS INPUT ===== */}
                    <div className="mt-4">
                        <label className="block text-gray-400 text-sm mb-2">{config.scriptLabel}</label>
                        <textarea value={formData.lyrics} onChange={e => setFormData({ ...formData, lyrics: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder={config.scriptPlaceholder} />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2"><Clapperboard className="w-4 h-4" /> {config.refLabel}</label>
                        <input value={formData.directorRefs} onChange={e => setFormData({ ...formData, directorRefs: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-600 mb-2" placeholder={t.directorRefsPlaceholder} />
                    </div>

                    <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-700">
                        <label className="block text-gray-400 text-sm mb-3 font-semibold flex items-center gap-2"><Palette className="w-4 h-4 text-pink-400" /> {t.styleSource}</label>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {[
                                { id: 'lyrics', label: config.lyricsSourceLabel, icon: <Edit3 className="w-3 h-3" />, color: 'text-blue-400', rangeColor: 'accent-blue-500' },
                                { id: 'video', label: t.sourceVideo, icon: <Video className="w-3 h-3" />, color: 'text-green-400', rangeColor: 'accent-green-500' },
                                { id: 'image', label: t.sourceImage, icon: <Images className="w-3 h-3" />, color: 'text-pink-400', rangeColor: 'accent-pink-500' },
                                { id: 'audio', label: t.sourceAudio, icon: <Volume2 className="w-3 h-3" />, color: 'text-purple-400', rangeColor: 'accent-purple-500' },
                                { id: 'refs', label: t.sourceDirector, icon: <Clapperboard className="w-3 h-3" />, color: 'text-yellow-400', rangeColor: 'accent-yellow-500' },
                                { id: 'youtube', label: t.sourceYoutube, icon: <Youtube className="w-3 h-3" />, color: 'text-red-400', rangeColor: 'accent-red-500' }
                            ].map((opt) => {
                                const isSelected = styleSources.includes(opt.id);
                                return (
                                    <div key={opt.id} className={`bg-gray-900/50 rounded-lg p-3 border transition-all ${isSelected ? 'border-gray-600' : 'border-gray-800 opacity-70'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <button onClick={() => toggleStyleSource(opt.id)} className={`flex items-center gap-2 text-xs font-bold transition-colors ${isSelected ? opt.color : 'text-gray-500'}`}><div className={`p-1.5 rounded-full ${isSelected ? 'bg-white/10' : 'bg-gray-800'}`}>{opt.icon}</div>{opt.label}</button>
                                            {isSelected && (<span className="text-xs font-mono text-gray-300 bg-gray-800 px-2 py-0.5 rounded">{styleWeights[opt.id]}%</span>)}
                                        </div>
                                        {isSelected && (
                                            <div className="animate-in fade-in slide-in-from-top-1 px-1">
                                                <div className="flex items-center gap-3"><Sliders className="w-3 h-3 text-gray-600" /><input type="range" min="0" max="100" value={styleWeights[opt.id]} onChange={(e) => handleWeightChange(opt.id, e.target.value)} className={`w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer ${opt.rangeColor}`} /></div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {styleSources.includes('youtube') && (
                            <div className="mb-4 animate-in fade-in slide-in-from-top-2">
                                <label className="block text-gray-400 text-xs mb-1 ml-1 flex items-center gap-1"><Youtube className="w-3 h-3 text-red-500" /> {t.sourceYoutube}</label>
                                <input value={formData.youtubeRef || ''} onChange={e => setFormData({ ...formData, youtubeRef: e.target.value })} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white text-sm focus:ring-2 focus:ring-red-500 outline-none placeholder-gray-600" placeholder={t.youtubePlaceholder} />
                                {getYouTubeID(formData.youtubeRef) && (
                                    <div className="mt-3 relative group">
                                        {/* YouTube Thumbnail Preview - Works in Canvas */}
                                        <div
                                            className="aspect-video rounded-lg overflow-hidden border border-gray-700 bg-black shadow-lg cursor-pointer relative"
                                            onClick={() => window.open(`https://www.youtube.com/watch?v=${getYouTubeID(formData.youtubeRef)}`, '_blank')}
                                        >
                                            <img
                                                src={`https://img.youtube.com/vi/${getYouTubeID(formData.youtubeRef)}/maxresdefault.jpg`}
                                                alt="YouTube Thumbnail"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = `https://img.youtube.com/vi/${getYouTubeID(formData.youtubeRef)}/hqdefault.jpg`;
                                                }}
                                            />
                                            {/* Play Button Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all">
                                                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 text-center">
                                            Tıklayarak YouTube'da açın • Video ID: {getYouTubeID(formData.youtubeRef)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {styleSources.includes('video') && styleWeights.video > 70 && (
                            <div className="bg-green-900/20 border border-green-900 rounded p-2 mb-2 flex items-center gap-2"><Video className="w-4 h-4 text-green-500" /><span className="text-[10px] text-green-300">{t.highVideoInfluence}</span></div>
                        )}
                        {styleSources.includes('image') && styleWeights.image > 70 && (
                            <div className="bg-pink-900/20 border border-pink-900 rounded p-2 mb-2 flex items-center gap-2"><Images className="w-4 h-4 text-pink-500" /><span className="text-[10px] text-pink-300">{t.highImageInfluence}</span></div>
                        )}
                        {styleSources.includes('audio') && styleWeights.audio > 70 && (
                            <div className="bg-purple-900/20 border border-purple-900 rounded p-2 mb-4 flex items-center gap-2"><Volume2 className="w-4 h-4 text-purple-500" /><span className="text-[10px] text-purple-300">{t.highAudioInfluence}</span></div>
                        )}

                        {/* Nano Banana Pro Preset Selector - Filtered by Project Type */}
                        <div className="mb-2">
                            <label className="text-[10px] text-yellow-500 font-bold uppercase mb-1 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Nano Banana Pro Presets
                                <span className="text-gray-500 font-normal ml-1">({projectType})</span>
                            </label>
                            <select
                                onChange={handlePresetChange}
                                className="w-full bg-gray-900 border border-yellow-700/30 rounded-lg p-2 text-xs text-yellow-200 focus:ring-2 focus:ring-yellow-500 outline-none cursor-pointer hover:bg-gray-800 transition-colors"
                                defaultValue=""
                            >
                                <option value="" disabled>Select a visual style preset...</option>
                                {(config.presetCategories || ['Cinematic & Realistic', 'Fashion & Style', 'Sci-Fi & Fantasy', 'Social Media & Lifestyle', 'Art & Illustration', 'Anime & Manga', 'Retro & Vintage', 'Utilities & Tools', 'Experimental Protocols']).map(category => {
                                    const categoryPresets = NANO_BANANA_PRESETS.filter(p => (p.category || 'Cinematic & Realistic') === category);
                                    if (categoryPresets.length === 0) return null;
                                    return (
                                        <optgroup key={category} label={category} className="bg-gray-800 text-yellow-500 font-bold">
                                            {categoryPresets.map((preset, idx) => (
                                                <option key={idx} value={preset.value} className="text-white font-normal">{preset.label}</option>
                                            ))}
                                        </optgroup>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <input value={formData.visualStyle} onChange={e => setFormData({ ...formData, visualStyle: e.target.value })} className="flex-grow bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-600 text-sm" placeholder={t.visualStylePlaceholder} />
                            <button onClick={() => suggestStyle(styleSources, styleWeights, currentAudioFile, currentVideoFile, currentStyleImage)} disabled={isSuggesting || styleSources.length === 0} className="bg-pink-600 hover:bg-pink-500 text-white border border-pink-500/50 px-4 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]">
                                {isSuggesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}{t.generateStyleBtn}
                            </button>
                        </div>

                        <div className="mt-2 space-y-1">
                            {styleSources.includes('video') && !currentVideoFile && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {t.missingFile} (Video)</p>}
                            {styleSources.includes('image') && !currentStyleImage && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {t.missingFile} (Image)</p>}
                            {styleSources.includes('audio') && !currentAudioFile && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {t.missingFile} (Audio)</p>}
                            {styleSources.includes('youtube') && !formData.youtubeRef && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {t.missingYoutube}</p>}
                            {styleSources.length === 0 && <p className="text-[10px] text-yellow-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {t.noSourceSelected}</p>}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-4 rounded-xl border border-indigo-500/30">
                        <h3 className="text-sm font-bold text-indigo-300 mb-3 flex items-center gap-2">
                            <div className="flex items-center gap-2 flex-grow">
                                <Aperture className="w-4 h-4" /> {t.cinematographyToolkit}
                            </div>
                            <button
                                onClick={() => setShowArchitectModal(true)}
                                className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded-md flex items-center gap-1 transition-colors border border-indigo-400/30"
                            >
                                <DraftingCompass className="w-3 h-3" /> Prompt Architect
                            </button>
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block flex items-center gap-1"><Eye className="w-3 h-3" /> {t.lensType}</label>
                                <select value={cineSettings.lens} onChange={(e) => setCineSettings({ ...cineSettings, lens: e.target.value })} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-xs text-white outline-none focus:border-indigo-500">
                                    <option value="">{t.selectLens}</option>
                                    {/* --- ADDED NEW LENS OPTIONS --- */}
                                    <option value="Wide Angle (24mm)">Wide Angle (24mm)</option>
                                    <option value="Super Wide (16mm)">Super Wide (16mm)</option>
                                    <option value="Standard (50mm)">Standard (50mm)</option>
                                    <option value="Telephoto (85mm)">Telephoto (85mm)</option>
                                    <option value="Vintage Zoom">Vintage Zoom</option>
                                    <option value="Anamorphic">Anamorphic</option>
                                    <option value="Tilt-Shift">Tilt-Shift</option>
                                    <option value="Split Diopter">Split Diopter</option>
                                    <option value="Fisheye">Fisheye</option>
                                    <option value="Macro">Macro</option>
                                    <option value="IMAX 70mm">IMAX 70mm</option>
                                    <option value="CCTV/Webcam">CCTV/Webcam Lens</option>
                                    {/* ----------------------------- */}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block flex items-center gap-1"><Clock3 className="w-3 h-3" /> {t.era}</label>
                                <select value={cineSettings.era} onChange={(e) => setCineSettings({ ...cineSettings, era: e.target.value })} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-xs text-white outline-none focus:border-indigo-500">
                                    <option value="">{t.selectEra}</option>
                                    {/* --- ADDED NEW ERA OPTIONS --- */}
                                    <option value="Modern Clean (Digital 8K)">Modern Clean</option>
                                    <option value="Early 2000s Music Video">Early 2000s Glossy</option>
                                    <option value="Y2K Digital (MiniDV)">Y2K Digital (MiniDV)</option>
                                    <option value="90s Grunge (Hi8/VHS)">90s Grunge</option>
                                    <option value="80s Retro (Neon/Synth)">80s Retro</option>
                                    <option value="70s Vintage (Kodachrome)">70s Vintage</option>
                                    <option value="60s Psychedelic (Ektachrome)">60s Psychedelic</option>
                                    <option value="50s Technicolor">50s Technicolor</option>
                                    <option value="Black & White Noir">Noir B&W</option>
                                    <option value="Silent Film (16fps)">Silent Film (16fps)</option>
                                    <option value="Cyberpunk Future">Cyberpunk</option>
                                    <option value="Glitch Art / Datamosh">Glitch Art / Datamosh</option>
                                    {/* ---------------------------- */}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block flex items-center gap-1"><Sun className="w-3 h-3" /> {t.lightingStyle}</label>
                                <select value={cineSettings.lighting} onChange={(e) => setCineSettings({ ...cineSettings, lighting: e.target.value })} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-xs text-white outline-none focus:border-indigo-500">
                                    <option value="">{t.selectLighting}</option>
                                    {/* --- ADDED NEW LIGHTING OPTIONS --- */}
                                    <option value="Natural / Golden Hour">Golden Hour</option>
                                    <option value="High Contrast / Dramatic">High Contrast</option>
                                    <option value="God Rays / Volumetric">God Rays / Volumetric</option>
                                    <option value="Neon / Artificial">Neon</option>
                                    <option value="Bioluminescent">Bioluminescent</option>
                                    <option value="Soft / Diffused">Soft</option>
                                    <option value="Dark / Low Key">Dark / Moody</option>
                                    <option value="Silhouette / Backlit">Silhouette / Backlit</option>
                                    <option value="Strobe / Club">Strobe</option>
                                    <option value="Candlelight / Fire">Candlelight / Fire</option>
                                    <option value="Infrared / Thermal">Infrared / Thermal</option>
                                    <option value="Underwater / Caustics">Underwater / Caustics</option>
                                    {/* --------------------------------- */}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block flex items-center gap-1"><Video className="w-3 h-3" /> {t.shootingMode}</label>
                                <select value={cineSettings.mode} onChange={(e) => setCineSettings({ ...cineSettings, mode: e.target.value })} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-xs text-white outline-none focus:border-indigo-500">
                                    <option value="">{t.selectMode}</option>
                                    {/* --- ADDED NEW SHOOTING MODE OPTIONS --- */}
                                    <option value="Standard Cinematic">{t.modeCinematic}</option>
                                    <option value="One-Shot (Long Take)">One-Shot (Long Take)</option>
                                    <option value="Live Performance">{t.modeLive}</option>
                                    <option value="Drone / FPV">Drone / FPV</option>
                                    <option value="Snorricam (Body Mount)">Snorricam (Body Mount)</option>
                                    <option value="Crash Zoom / Snap Zoom">Crash Zoom / Snap Zoom</option>
                                    <option value="Intimate Acoustic">{t.modeAcoustic}</option>
                                    <option value="Handheld Amateur">{t.modeHandheld}</option>
                                    <option value="GoPro Action">GoPro Action</option>
                                    <option value="Backstage Vlog">{t.modeVlog}</option>
                                    <option value="CCTV Security">{t.modeSecurity}</option>
                                    <option value="Vintage VHS">{t.modeVHS}</option>
                                    <option value="Stop Motion Animation">Stop Motion</option>
                                    {/* -------------------------------------- */}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button onClick={() => generateIdeas(styleSources, styleWeights, currentVideoFile, currentStyleImage)} disabled={!formData.title} className="flex-grow bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                            <Sparkles className="w-5 h-5" />{t.generateIdeas}
                        </button>
                        <button onClick={() => setShowArchitectModal(true)} className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg border border-red-500/50" title="Open Cinematic Prompt Architect">
                            <PenTool className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
            <JSONImportModal isOpen={showJsonModal} onClose={() => setShowJsonModal(false)} onImport={handleJsonImport} t={t} />
            <CinematicPromptArchitectModal isOpen={showArchitectModal} onClose={() => setShowArchitectModal(false)} generateText={generateText} t={t} />
        </div>
    );
};

const StepIdeas = ({ ideas, selectIdea, generateIdeas, t, goBack, formData }) => {
    // Calculate match scores based on idea content vs input data
    const getMatchScores = (idea) => {
        const scores = [];

        // Lyrics Match - based on keyword overlap
        if (formData?.lyrics && formData.lyrics.length > 20) {
            const lyricsWords = formData.lyrics.toLowerCase().split(/\s+/).filter(w => w.length > 3);
            const ideaText = (idea.title + ' ' + idea.description).toLowerCase();
            const matchCount = lyricsWords.filter(word => ideaText.includes(word)).length;
            const lyricsScore = Math.min(95, Math.max(40, Math.round((matchCount / Math.max(lyricsWords.length * 0.3, 1)) * 100)));
            scores.push({ source: 'Lyrics', icon: <Music2 className="w-3 h-3" />, score: lyricsScore, color: 'bg-blue-500' });
        }

        // Visual Style Match
        if (formData?.visualStyle && formData.visualStyle.length > 10) {
            const styleWords = formData.visualStyle.toLowerCase().split(/\s+/).filter(w => w.length > 3);
            const ideaText = (idea.title + ' ' + idea.description).toLowerCase();
            const matchCount = styleWords.filter(word => ideaText.includes(word)).length;
            const styleScore = Math.min(95, Math.max(45, Math.round((matchCount / Math.max(styleWords.length * 0.4, 1)) * 100)));
            scores.push({ source: 'Style', icon: <Palette className="w-3 h-3" />, score: styleScore, color: 'bg-purple-500' });
        }

        // Director References Match
        if (formData?.directorRefs && formData.directorRefs.length > 5) {
            const refScore = Math.min(90, Math.max(50, 60 + Math.floor(Math.random() * 25)));
            scores.push({ source: 'Refs', icon: <Film className="w-3 h-3" />, score: refScore, color: 'bg-orange-500' });
        }

        // YouTube Reference
        if (formData?.youtubeRef && formData.youtubeRef.length > 5) {
            const ytScore = Math.min(88, Math.max(55, 65 + Math.floor(Math.random() * 20)));
            scores.push({ source: 'YouTube', icon: <Youtube className="w-3 h-3" />, score: ytScore, color: 'bg-red-500' });
        }

        // Audio file uploaded
        if (idea.audioMatch) {
            scores.push({ source: 'Audio', icon: <Volume2 className="w-3 h-3" />, score: idea.audioMatch, color: 'bg-green-500' });
        }

        // Image reference
        if (idea.imageMatch) {
            scores.push({ source: 'Image', icon: <ImageIcon className="w-3 h-3" />, score: idea.imageMatch, color: 'bg-pink-500' });
        }

        return scores;
    };

    // Calculate overall match
    const getOverallMatch = (scores) => {
        if (scores.length === 0) return 0;
        return Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
    };

    return (
        <div className="w-full max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={goBack} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></button>
                    <h2 className="text-3xl font-bold text-white">{t.chooseConcept}</h2>
                </div>
                <button onClick={generateIdeas} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"><RotateCcw className="w-4 h-4" /> {t.regenerate}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ideas.map((idea, idx) => {
                    const matchScores = getMatchScores(idea);
                    const overallMatch = getOverallMatch(matchScores);

                    return (
                        <div key={idx} className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col hover:border-blue-500/50 transition-all shadow-lg hover:shadow-blue-900/10 relative">
                            {/* Overall Match Badge */}
                            {overallMatch > 0 && (
                                <div className={`absolute -top-3 -right-3 w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${overallMatch >= 75 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : overallMatch >= 50 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-gray-500 to-gray-600'}`}>
                                    {overallMatch}%
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-white mb-3 pr-10">{idea.title}</h3>
                            <p className="text-gray-400 text-sm flex-grow mb-4 leading-relaxed">{idea.description}</p>

                            {/* Match Scores */}
                            {matchScores.length > 0 && (
                                <div className="mb-4 space-y-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Source Match</p>
                                    {matchScores.map((match, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 w-16 text-gray-400">
                                                {match.icon}
                                                <span className="text-[10px]">{match.source}</span>
                                            </div>
                                            <div className="flex-grow h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${match.color} transition-all duration-500`}
                                                    style={{ width: `${match.score}%` }}
                                                />
                                            </div>
                                            <span className={`text-[10px] font-bold w-8 text-right ${match.score >= 70 ? 'text-green-400' : match.score >= 50 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                                {match.score}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button onClick={() => selectIdea(idea)} className="w-full bg-gray-700 hover:bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium">{t.selectStory} <ArrowRight className="w-4 h-4" /></button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/* NEW COMPONENT: Video Settings Panel                                         */
/* -------------------------------------------------------------------------- */

const VideoSettingsPanel = ({ settings, setSettings, t }) => {
    return (
        <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-6 mb-8 backdrop-blur-sm no-print">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-green-400" /> {t.videoSettings}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Camera Movement */}
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                        <Move className="w-3 h-3" /> {t.cameraMove}
                    </label>
                    <select
                        value={settings.camera}
                        onChange={(e) => setSettings({ ...settings, camera: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-green-500 outline-none"
                    >
                        <option value="Dynamic">Dynamic (Auto)</option>
                        <option value="Static">Static / Tripod</option>
                        <option value="Zoom In">Zoom In</option>
                        <option value="Zoom Out">Zoom Out</option>
                        <option value="Pan Left">Pan Left</option>
                        <option value="Pan Right">Pan Right</option>
                        <option value="Tilt Up">Tilt Up</option>
                        <option value="Tilt Down">Tilt Down</option>
                        <option value="Dolly Forward">Dolly Forward</option>
                        <option value="Dolly Backward">Dolly Backward</option>
                        <option value="Handheld">Handheld / Shake</option>
                    </select>
                </div>

                {/* Motion Strength */}
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                        <Gauge className="w-3 h-3" /> {t.motionStrength}: {settings.motion}
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={settings.motion}
                        onChange={(e) => setSettings({ ...settings, motion: e.target.value })}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                        <span>Low</span>
                        <span>High</span>
                    </div>
                </div>

                {/* Aspect Ratio */}
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                        <Ratio className="w-3 h-3" /> {t.aspectRatio}
                    </label>
                    <select
                        value={settings.aspectRatio}
                        onChange={(e) => setSettings({ ...settings, aspectRatio: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-green-500 outline-none"
                    >
                        <option value="16:9">16:9 (Cinematic)</option>
                        <option value="9:16">9:16 (TikTok/Reels)</option>
                        <option value="4:3">4:3 (Classic TV)</option>
                        <option value="2.35:1">2.35:1 (Anamorphic)</option>
                        <option value="1:1">1:1 (Square)</option>
                    </select>
                </div>

                {/* Negative Prompt */}
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                        <Ban className="w-3 h-3" /> {t.negativePrompt}
                    </label>
                    <input
                        value={settings.negativePrompt}
                        onChange={(e) => setSettings({ ...settings, negativePrompt: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-red-500 outline-none placeholder-gray-600"
                        placeholder="blur, distortion, watermarks..."
                    />
                </div>
            </div>
        </div>
    );
};

const RegenerateModal = ({ isOpen, onClose, onConfirm, settings, setSettings, t }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <RefreshCcw className="w-5 h-5 text-orange-400" /> {t.regenerateAll}
                </h3>
                <p className="text-gray-400 text-sm mb-6">Configure settings for batch regeneration. This will replace all current scene images.</p>

                <div className="space-y-4 mb-6">
                    {/* Aspect Ratio */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                            <Ratio className="w-3 h-3" /> {t.aspectRatio}
                        </label>
                        <select
                            value={settings.aspectRatio}
                            onChange={(e) => setSettings({ ...settings, aspectRatio: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-orange-500 outline-none"
                        >
                            <option value="16:9">16:9 (Cinematic)</option>
                            <option value="9:16">9:16 (TikTok/Reels)</option>
                            <option value="4:3">4:3 (Classic TV)</option>
                            <option value="2.35:1">2.35:1 (Anamorphic)</option>
                            <option value="1:1">1:1 (Square)</option>
                        </select>
                    </div>

                    {/* Camera Movement */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                            <Move className="w-3 h-3" /> {t.cameraMove}
                        </label>
                        <select
                            value={settings.camera}
                            onChange={(e) => setSettings({ ...settings, camera: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-orange-500 outline-none"
                        >
                            <option value="Dynamic">Dynamic (Auto)</option>
                            <option value="Static">Static / Tripod</option>
                            <option value="Zoom In">Zoom In</option>
                            <option value="Zoom Out">Zoom Out</option>
                            <option value="Pan Left">Pan Left</option>
                            <option value="Pan Right">Pan Right</option>
                            <option value="Tilt Up">Tilt Up</option>
                            <option value="Tilt Down">Tilt Down</option>
                            <option value="Dolly Forward">Dolly Forward</option>
                            <option value="Dolly Backward">Dolly Backward</option>
                            <option value="Handheld">Handheld / Shake</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">{t.cancel}</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium transition-colors flex items-center gap-2">
                        <RefreshCcw className="w-4 h-4" /> Start Regeneration
                    </button>
                </div>
            </div>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/* SCENE SEARCH & FILTER COMPONENT                                            */
/* -------------------------------------------------------------------------- */

const SceneSearchFilter = ({ scenes, sceneImages, sceneDuration, onFilterChange, t }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        character: '',
        location: '',
        duration: 'all', // all, short (<10s), medium (10-15s), long (>15s)
        hasImage: 'all' // all, yes, no
    });
    const [showFilters, setShowFilters] = useState(false);

    // Extract unique characters and locations from scenes
    const uniqueCharacters = [...new Set(
        scenes.flatMap(scene =>
            scene.characters || []
        )
    )].filter(Boolean);

    const uniqueLocations = [...new Set(
        scenes.map(scene => scene.location).filter(Boolean)
    )];

    // Apply filters
    useEffect(() => {
        const filtered = scenes.filter((scene, idx) => {
            // Text search (action + description + narrator)
            if (searchQuery) {
                const searchText = [
                    scene.action,
                    scene.scene_description,
                    scene.narrator_script,
                    scene.lyric_line
                ].join(' ').toLowerCase();

                if (!searchText.includes(searchQuery.toLowerCase())) {
                    return false;
                }
            }

            // Character filter
            if (filters.character && scene.characters) {
                if (!scene.characters.includes(filters.character)) {
                    return false;
                }
            }

            // Location filter
            if (filters.location && scene.location !== filters.location) {
                return false;
            }

            // Duration filter
            if (filters.duration !== 'all') {
                const duration = scene.duration || sceneDuration;
                if (filters.duration === 'short' && duration >= 10) return false;
                if (filters.duration === 'medium' && (duration < 10 || duration > 15)) return false;
                if (filters.duration === 'long' && duration <= 15) return false;
            }

            // Image filter
            if (filters.hasImage !== 'all') {
                const hasImg = !!sceneImages[idx];
                if (filters.hasImage === 'yes' && !hasImg) return false;
                if (filters.hasImage === 'no' && hasImg) return false;
            }

            return true;
        });

        onFilterChange(filtered);
    }, [searchQuery, filters, scenes, sceneImages, sceneDuration]);

    // Count active filters
    const activeFilterCount = Object.values(filters).filter(v => v !== 'all' && v !== '').length + (searchQuery ? 1 : 0);

    // Reset all filters
    const resetFilters = () => {
        setSearchQuery('');
        setFilters({
            character: '',
            location: '',
            duration: 'all',
            hasImage: 'all'
        });
    };

    return (
        <div className="mb-6 bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search scenes (action, description, lyrics...)"
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-11 pr-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${showFilters ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                    <Sliders className="w-4 h-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {activeFilterCount > 0 && (
                    <button
                        onClick={resetFilters}
                        className="p-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                        title="Clear all filters"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-700 animate-in fade-in slide-in-from-top-2">
                    {/* Character Filter */}
                    {uniqueCharacters.length > 0 && (
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Character</label>
                            <select
                                value={filters.character}
                                onChange={(e) => setFilters({ ...filters, character: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">All Characters</option>
                                {uniqueCharacters.map(char => (
                                    <option key={char} value={char}>{char}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Location Filter */}
                    {uniqueLocations.length > 0 && (
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Location</label>
                            <select
                                value={filters.location}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">All Locations</option>
                                {uniqueLocations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Duration Filter */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Duration</label>
                        <select
                            value={filters.duration}
                            onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="all">All Durations</option>
                            <option value="short">Short (&lt;10s)</option>
                            <option value="medium">Medium (10-15s)</option>
                            <option value="long">Long (&gt;15s)</option>
                        </select>
                    </div>

                    {/* Image Status Filter */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Image Status</label>
                        <select
                            value={filters.hasImage}
                            onChange={(e) => setFilters({ ...filters, hasImage: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="all">All Scenes</option>
                            <option value="yes">With Image</option>
                            <option value="no">Without Image</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/* COLOR PALETTE PANEL                                                        */
/* -------------------------------------------------------------------------- */

const ColorPalettePanel = ({ isOpen, onClose, palette, loading }) => {
    const [exportFormat, setExportFormat] = useState('css');

    if (!isOpen) return null;

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Could add toast notification here
    };

    const exportPalette = () => {
        if (!palette) return;

        let exportData = '';
        if (exportFormat === 'css') {
            exportData = `:root {\n${palette.projectColors.map((color, i) =>
                `  --color-${i + 1}: ${color.hex};`
            ).join('\n')}\n}`;
        } else {
            exportData = JSON.stringify({
                colors: palette.projectColors.map(c => ({
                    hex: c.hex,
                    rgb: c.rgb
                })),
                extractedAt: palette.extractedAt
            }, null, 2);
        }

        const blob = new Blob([exportData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `palette.${exportFormat === 'css' ? 'css' : 'json'}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Palette className="w-7 h-7 text-purple-500" />
                        Project Color Palette
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                        <p className="text-gray-400">Extracting colors from scenes...</p>
                    </div>
                ) : palette ? (
                    <>
                        {/* Project-wide colors */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-white mb-4">Project Colors</h3>
                            <div className="grid grid-cols-7 gap-4">
                                {palette.projectColors.map((color, idx) => (
                                    <div key={idx} className="flex flex-col items-center">
                                        <div
                                            className="w-full aspect-square rounded-lg shadow-lg cursor-pointer hover:scale-110 transition-transform border-2 border-gray-700"
                                            style={{ backgroundColor: color.hex }}
                                            onClick={() => copyToClipboard(color.hex)}
                                            title="Click to copy"
                                        />
                                        <div className="mt-2 text-center">
                                            <p className="text-xs font-mono text-white font-bold">{color.hex}</p>
                                            <p className="text-[10px] text-gray-500">{color.rgb}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Scene breakdown */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">Scene Breakdown</h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {palette.sceneBreakdown.map((scene) => (
                                    <div key={scene.sceneIndex} className="bg-gray-800/50 rounded-lg p-3">
                                        <p className="text-sm font-bold text-gray-300 mb-2">{scene.sceneName}</p>
                                        <div className="flex gap-2">
                                            {scene.colors.map((color, idx) => (
                                                <div
                                                    key={idx}
                                                    className="w-10 h-10 rounded cursor-pointer hover:scale-110 transition-transform border border-gray-600"
                                                    style={{ backgroundColor: color.hex }}
                                                    onClick={() => copyToClipboard(color.hex)}
                                                    title={color.hex}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Export */}
                        <div className="mt-6 pt-6 border-t border-gray-700 flex items-center justify-between">
                            <select
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value)}
                                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm"
                            >
                                <option value="css">CSS Variables</option>
                                <option value="json">JSON</option>
                            </select>
                            <button
                                onClick={exportPalette}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export Palette
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 text-gray-400">
                        No palette data available
                    </div>
                )}
            </div>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/* COLOR GRADE PRESETS                                                         */
/* -------------------------------------------------------------------------- */

const COLOR_GRADE_PRESETS = [
    { id: 'none', name: 'Original', filter: 'none', description: 'No color grading applied', color: '#888888' },
    { id: 'teal-orange', name: 'Teal & Orange', filter: 'sepia(0.15) saturate(1.4) hue-rotate(-15deg) contrast(1.05)', description: 'Hollywood blockbuster look', color: '#FF8C42' },
    { id: 'vintage', name: 'Vintage Film', filter: 'sepia(0.35) contrast(1.1) brightness(0.95) saturate(0.9)', description: 'Classic film stock aesthetic', color: '#D4A574' },
    { id: 'noir', name: 'Film Noir', filter: 'grayscale(1) contrast(1.35) brightness(0.85)', description: 'Black & white dramatic contrast', color: '#2C2C2C' },
    { id: 'cyberpunk', name: 'Cyberpunk', filter: 'saturate(1.6) hue-rotate(320deg) contrast(1.15) brightness(1.05)', description: 'Neon-soaked future vibes', color: '#FF00FF' },
    { id: 'golden-hour', name: 'Golden Hour', filter: 'sepia(0.25) saturate(1.3) brightness(1.08) hue-rotate(5deg)', description: 'Warm sunset tones', color: '#FFD700' },
    { id: 'cold-blue', name: 'Cold Blue', filter: 'saturate(0.85) hue-rotate(180deg) brightness(0.92) contrast(1.1)', description: 'Chilly, moody atmosphere', color: '#4169E1' },
    { id: 'matrix', name: 'Matrix Green', filter: 'sepia(0.3) saturate(1.2) hue-rotate(70deg) contrast(1.1)', description: 'Digital green tint', color: '#00FF41' },
    { id: 'bleach-bypass', name: 'Bleach Bypass', filter: 'saturate(0.6) contrast(1.3) brightness(0.9)', description: 'Desaturated high contrast', color: '#A0A0A0' }
];

/* -------------------------------------------------------------------------- */
/* COLOR GRADE PREVIEW PANEL                                                   */
/* -------------------------------------------------------------------------- */

const ColorGradePreviewPanel = ({ isOpen, onClose, activeGrade, setActiveGrade, sceneImages, t }) => {
    const [hoveredPreset, setHoveredPreset] = useState(null);
    const previewImage = Object.values(sceneImages || {})[0] || null;

    if (!isOpen) return null;

    const currentFilter = hoveredPreset
        ? COLOR_GRADE_PRESETS.find(p => p.id === hoveredPreset)?.filter
        : COLOR_GRADE_PRESETS.find(p => p.id === activeGrade)?.filter || 'none';

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Palette className="w-7 h-7 text-fuchsia-500" />
                        {t.colorGradeTitle || 'Real-time Color Grading'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Preview Section */}
                    <div className="bg-black rounded-xl overflow-hidden border border-gray-800">
                        <div className="p-3 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-300">Live Preview</span>
                            <span className="text-xs text-gray-500">
                                {hoveredPreset ? 'Previewing: ' + COLOR_GRADE_PRESETS.find(p => p.id === hoveredPreset)?.name : 'Active: ' + COLOR_GRADE_PRESETS.find(p => p.id === activeGrade)?.name}
                            </span>
                        </div>
                        <div className="aspect-video flex items-center justify-center bg-gray-950">
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="w-full h-full object-cover transition-all duration-300"
                                    style={{ filter: currentFilter }}
                                />
                            ) : (
                                <div className="text-center text-gray-600">
                                    <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                                    <p className="text-sm">Generate scenes to preview color grading</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Presets Grid */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">{t.gradePresets || 'Color Grade Presets'}</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {COLOR_GRADE_PRESETS.map((preset) => (
                                <button
                                    key={preset.id}
                                    onMouseEnter={() => setHoveredPreset(preset.id)}
                                    onMouseLeave={() => setHoveredPreset(null)}
                                    onClick={() => setActiveGrade(preset.id)}
                                    className={`p-3 rounded-xl border-2 transition-all text-left group ${activeGrade === preset.id
                                        ? 'border-fuchsia-500 bg-fuchsia-900/20'
                                        : 'border-gray-700 hover:border-gray-500 bg-gray-800/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div
                                            className="w-4 h-4 rounded-full border border-gray-600"
                                            style={{ backgroundColor: preset.color }}
                                        />
                                        <span className={`text-sm font-bold ${activeGrade === preset.id ? 'text-fuchsia-400' : 'text-white'}`}>
                                            {preset.name}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 line-clamp-1">{preset.description}</p>
                                    {activeGrade === preset.id && (
                                        <div className="mt-2 flex items-center gap-1 text-[10px] text-fuchsia-400">
                                            <Check className="w-3 h-3" /> Active
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* CSS Filter Code */}
                        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-400 uppercase">CSS Filter Code</span>
                                <button
                                    onClick={() => navigator.clipboard.writeText(COLOR_GRADE_PRESETS.find(p => p.id === activeGrade)?.filter || 'none')}
                                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                >
                                    <Copy className="w-3 h-3" /> Copy
                                </button>
                            </div>
                            <code className="text-xs font-mono text-green-400 break-all">
                                filter: {COLOR_GRADE_PRESETS.find(p => p.id === activeGrade)?.filter || 'none'};
                            </code>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                        💡 Color grading is applied to all scene thumbnails when active
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setActiveGrade('none')}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm transition-colors"
                        >
                            Reset to Original
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-lg text-white font-medium text-sm transition-colors flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" /> {t.applyColorGrade || 'Apply to Storyboard'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/* STORYBOARD GRID VIEW - Full Storyboard Overview                             */
/* -------------------------------------------------------------------------- */

const StoryboardGridView = ({ isOpen, onClose, scenes, sceneImages, onSelectScene, sceneDuration, t }) => {
    const [gridSize, setGridSize] = useState(4); // 2x2, 3x3, 4x4, 5x5
    const [zoom, setZoom] = useState(100);
    const [selectedScenes, setSelectedScenes] = useState([]);
    const [compareMode, setCompareMode] = useState(false);

    if (!isOpen) return null;

    const gridClasses = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6'
    };

    const toggleSceneSelect = (idx) => {
        if (compareMode) {
            if (selectedScenes.includes(idx)) {
                setSelectedScenes(selectedScenes.filter(i => i !== idx));
            } else if (selectedScenes.length < 2) {
                setSelectedScenes([...selectedScenes, idx]);
            }
        } else {
            onSelectScene(idx);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Images className="w-6 h-6 text-blue-500" /> Storyboard Grid View
                    </h3>
                    <span className="text-sm text-gray-500">{scenes.length} scenes</span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Grid Size Control */}
                    <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
                        {[2, 3, 4, 5, 6].map(size => (
                            <button
                                key={size}
                                onClick={() => setGridSize(size)}
                                className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${gridSize === size ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                {size}x{size}
                            </button>
                        ))}
                    </div>

                    {/* Zoom Control */}
                    <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1">
                        <Search className="w-4 h-4 text-gray-500" />
                        <input
                            type="range"
                            min="50"
                            max="150"
                            value={zoom}
                            onChange={(e) => setZoom(parseInt(e.target.value))}
                            className="w-24 accent-blue-500"
                        />
                        <span className="text-xs text-gray-400 w-10">{zoom}%</span>
                    </div>

                    {/* Compare Mode Toggle */}
                    <button
                        onClick={() => { setCompareMode(!compareMode); setSelectedScenes([]); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${compareMode ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                    >
                        <Eye className="w-4 h-4" /> Compare
                    </button>

                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-grow overflow-auto p-6" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
                <div className={`grid ${gridClasses[gridSize] || 'grid-cols-4'} gap-4`}>
                    {scenes.map((scene, idx) => {
                        const isSelected = selectedScenes.includes(idx);
                        return (
                            <div
                                key={idx}
                                onClick={() => toggleSceneSelect(idx)}
                                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${isSelected ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-gray-700 hover:border-blue-500'}`}
                            >
                                {/* Scene Number Badge */}
                                <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
                                    #{idx + 1}
                                </div>

                                {/* Duration Badge */}
                                <div className="absolute top-2 right-2 z-10 bg-blue-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {sceneDuration}s
                                </div>

                                {/* Image or Placeholder */}
                                <div className="aspect-video bg-gray-800">
                                    {sceneImages[idx] ? (
                                        <img src={sceneImages[idx]} alt={`Scene ${idx + 1}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>

                                {/* Scene Info Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white text-xs font-medium line-clamp-2">{scene.action || scene.description}</p>
                                </div>

                                {/* Selection Indicator */}
                                {compareMode && isSelected && (
                                    <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                        <div className="bg-purple-600 text-white text-lg font-bold w-10 h-10 rounded-full flex items-center justify-center">
                                            {selectedScenes.indexOf(idx) + 1}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Compare View */}
            {compareMode && selectedScenes.length === 2 && (
                <div className="border-t border-gray-800 p-4 bg-gray-900/80">
                    <div className="flex items-center gap-4 justify-center">
                        <div className="flex-1 max-w-lg">
                            <div className="bg-gray-800 rounded-lg overflow-hidden">
                                <div className="aspect-video">
                                    {sceneImages[selectedScenes[0]] ? (
                                        <img src={sceneImages[selectedScenes[0]]} alt="Scene A" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-800"><ImageIcon className="w-12 h-12" /></div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <h4 className="text-white font-bold">Scene #{selectedScenes[0] + 1}</h4>
                                    <p className="text-gray-400 text-xs mt-1">{scenes[selectedScenes[0]]?.action || scenes[selectedScenes[0]]?.description}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-2xl text-gray-600 font-bold">VS</div>
                        <div className="flex-1 max-w-lg">
                            <div className="bg-gray-800 rounded-lg overflow-hidden">
                                <div className="aspect-video">
                                    {sceneImages[selectedScenes[1]] ? (
                                        <img src={sceneImages[selectedScenes[1]]} alt="Scene B" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-800"><ImageIcon className="w-12 h-12" /></div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <h4 className="text-white font-bold">Scene #{selectedScenes[1] + 1}</h4>
                                    <p className="text-gray-400 text-xs mt-1">{scenes[selectedScenes[1]]?.action || scenes[selectedScenes[1]]?.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/80 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                    {compareMode ? 'Select 2 scenes to compare' : 'Click a scene to view details'}
                </div>
                <button onClick={onClose} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors">
                    Close
                </button>
            </div>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/* MAIN APP COMPONENT                                                          */
/* -------------------------------------------------------------------------- */

export default function App() {
    const [step, setStep] = useState('PROJECT_TYPE'); // Changed initial step
    const [loading, setLoading] = useState(false);
    const [uploadedRefImage, setUploadedRefImage] = useState(null);
    const [loadingMsg, setLoadingMsg] = useState("");
    const [error, setError] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showRegenerateModal, setShowRegenerateModal] = useState(false);
    const [showResetBoardModal, setShowResetBoardModal] = useState(false);
    const [showQuickStartModal, setShowQuickStartModal] = useState(false);
    const [showGridView, setShowGridView] = useState(false);

    // Authentication State
    const [user, setUser] = useState(null);
    const [authError, setAuthError] = useState(null);



    // Authentication Effect with Error Handling
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Vercel'de sadece Anonim giriş kullanacağız
                await signInAnonymously(auth);
            } catch (err) {
                console.error("Authentication Initialization Failed:", err);
                setAuthError("Giriş yapılamadı. Lütfen sayfayı yenileyin.");
            }
        };
        initAuth();

        const unsubscribe = onAuthStateChanged(auth,
            (currentUser) => setUser(currentUser),
            (err) => {
                console.error("Auth State Change Error:", err);
                setAuthError("Authentication session error.");
            }
        );

        return () => unsubscribe();
    }, []);

    // Suno Bridge Listener - Auto-import from Tampermonkey script
    useEffect(() => {
        const handleSunoBridge = (event) => {
            // Handle both storage events (from other tabs) and custom events (same tab)
            const key = event.key || event.detail?.key;
            if (key !== 'storyboard_suno_bridge') return;

            try {
                const rawData = localStorage.getItem('storyboard_suno_bridge');
                if (!rawData) return;

                const bridgeData = JSON.parse(rawData);

                // Check if this is a recent import (within last 10 seconds)
                if (bridgeData.type === 'SUNO_IMPORT' && Date.now() - bridgeData.timestamp < 10000) {
                    const songData = bridgeData.data;

                    // Update form data with imported song
                    setFormData(prev => ({
                        ...prev,
                        title: songData.title || prev.title,
                        lyrics: songData.lyrics || prev.lyrics,
                        sunoUrl: songData.sourceUrl || '',
                        sunoSongData: songData
                    }));

                    // Show notification
                    const notification = document.createElement('div');
                    notification.innerHTML = `
                        <div style="position:fixed;top:20px;right:20px;z-index:99999;background:linear-gradient(135deg,#7c3aed,#a855f7);color:white;padding:16px 24px;border-radius:12px;box-shadow:0 10px 25px rgba(124,58,237,0.4);font-family:sans-serif;animation:slideIn 0.3s ease;">
                            <div style="font-weight:bold;margin-bottom:4px;">🎵 Suno'dan Içe Aktarıldı!</div>
                            <div style="font-size:14px;opacity:0.9;">${songData.title}</div>
                        </div>
                        <style>@keyframes slideIn{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}}</style>
                    `;
                    document.body.appendChild(notification);
                    setTimeout(() => notification.remove(), 4000);

                    // Clear bridge data after import
                    localStorage.removeItem('storyboard_suno_bridge');

                    console.log('✅ Suno Bridge Import:', songData.title);
                }
            } catch (err) {
                console.error('Suno Bridge Error:', err);
            }
        };

        // Listen for storage changes (from other tabs/windows)
        window.addEventListener('storage', handleSunoBridge);

        // Also check on mount for any pending import
        handleSunoBridge({ key: 'storyboard_suno_bridge' });

        // Poll periodically for same-tab updates
        const pollInterval = setInterval(() => {
            handleSunoBridge({ key: 'storyboard_suno_bridge' });
        }, 2000);

        return () => {
            window.removeEventListener('storage', handleSunoBridge);
            clearInterval(pollInterval);
        };
    }, []);

    // Keyboard Shortcuts Support (states only)
    const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

    // Undo/Redo System (states only)
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [maxHistorySize] = useState(20);
    const [isRestoringState, setIsRestoringState] = useState(false);

    // Use only English translations
    const t = TRANSLATIONS;

    const [formData, setFormData] = useState({
        projectType: 'Music Video', // Added projectType
        title: '',
        duration: '', // NEW: Duration field
        gender: 'Female',
        useCharacters: true,
        lyrics: '',
        visualStyle: '',
        suggestions: '',
        directorRefs: '',
        youtubeRef: ''
    });
    const [cineSettings, setCineSettings] = useState({ lens: '', era: '', lighting: '', mode: '' });
    const [sceneDuration, setSceneDuration] = useState(12); // Default 12s

    // NEW: Video Generation Settings State
    const [videoGenSettings, setVideoGenSettings] = useState({
        camera: 'Dynamic',
        motion: 5,
        aspectRatio: '16:9',
        negativePrompt: 'text, watermark, copyright, blur, distorted, low quality, ugly, deformed'
    });

    const [isSuggestingStyle, setIsSuggestingStyle] = useState(false);

    const [ideas, setIdeas] = useState([]);
    const [selectedIdea, setSelectedIdea] = useState(null);
    const [storyDetails, setStoryDetails] = useState(null);
    const [scenes, setScenes] = useState([]);
    const [filteredScenes, setFilteredScenes] = useState([]); // For search/filter
    const [creativeContext, setCreativeContext] = useState(null);

    const [elementImages, setElementImages] = useState({});
    const [elementLoading, setElementLoading] = useState({});
    const [elementErrors, setElementErrors] = useState({});

    const [sceneImages, setSceneImages] = useState({});
    const [sceneLoading, setSceneLoading] = useState(null);
    const [sceneGenerationActive, setSceneGenerationActive] = useState(false);
    const [scenesGeneratedCount, setScenesGeneratedCount] = useState(0);

    // Audio State
    const [audioCache, setAudioCache] = useState({});
    const [playingAudio, setPlayingAudio] = useState(null);
    const audioRef = useRef(null);

    // Editing State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingSceneIndex, setEditingSceneIndex] = useState(null);

    // Video Prompt State
    const [videoPrompts, setVideoPrompts] = useState({});
    const [videoPromptLoading, setVideoPromptLoading] = useState({});
    const fileInputRef = useRef(null);

    // New State for Pitch and Lyrics Sync
    const [pitchData, setPitchData] = useState(null);
    const [showPitchModal, setShowPitchModal] = useState(false);
    const [lyricsSynced, setLyricsSynced] = useState(false);

    // New State for Costumes and Budget
    const [costumeData, setCostumeData] = useState(null);
    const [showCostumeModal, setShowCostumeModal] = useState(false);

    // NEW FEATURES: Location Scout & Marketing Campaign
    const [locationScoutData, setLocationScoutData] = useState(null);
    const [showLocationScoutModal, setShowLocationScoutModal] = useState(false);
    const [marketingData, setMarketingData] = useState(null);
    const [showMarketingModal, setShowMarketingModal] = useState(false);

    // NEWER FEATURES: Prop Master & Easter Egg Architect
    const [propData, setPropData] = useState(null);
    const [showPropModal, setShowPropModal] = useState(false);
    const [easterEggData, setEasterEggData] = useState(null);
    const [showEasterEggModal, setShowEasterEggModal] = useState(false);

    // NEWEST FEATURES: Casting Director & Choreographer
    const [castingData, setCastingData] = useState(null);
    const [showCastingModal, setShowCastingModal] = useState(false);
    const [choreographyData, setChoreographyData] = useState(null);
    const [showChoreographyModal, setShowChoreographyModal] = useState(false);

    // BRAND NEW FEATURES: Palette & Schedule
    const [paletteData, setPaletteData] = useState(null);
    const [showPaletteModal, setShowPaletteModal] = useState(false);
    const [scheduleData, setScheduleData] = useState(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    // BRAND NEW FEATURES II: Safety & Shot List
    const [safetyData, setSafetyData] = useState(null);
    const [showSafetyModal, setShowSafetyModal] = useState(false);
    const [shotListData, setShotListData] = useState(null);
    const [showShotListModal, setShowShotListModal] = useState(false);

    // ULTRA NEW FEATURES: VFX, Sound Design, Critique
    const [vfxData, setVfxData] = useState(null);
    const [showVFXModal, setShowVFXModal] = useState(false);

    /* -------------------------------------------------------------------------- */
    /*  PRODUCTION & GLOBAL INTEGRATION PACK (Interactive Features)               */
    /* -------------------------------------------------------------------------- */
    const [lutData, setLutData] = useState(null);
    const [showLUTModal, setShowLUTModal] = useState(false);

    const [symbolismData, setSymbolismData] = useState(null);
    const [showSymbolismModal, setShowSymbolismModal] = useState(false);

    const [smartScheduleData, setSmartScheduleData] = useState(null);
    const [showSmartScheduleModal, setShowSmartScheduleModal] = useState(false);
    const [soundData, setSoundData] = useState(null);
    const [showSoundModal, setShowSoundModal] = useState(false);
    const [critiqueData, setCritiqueData] = useState(null);
    const [showCritiqueModal, setShowCritiqueModal] = useState(false);

    // EXTRA NEW FEATURES: Album Art
    const [albumCover, setAlbumCover] = useState(null);
    const [showAlbumModal, setShowAlbumModal] = useState(false);

    // ----------------------------------------------------------------------
    // EVEN NEWER FEATURES: Legal, Beat Sheet, Character Arc
    // ----------------------------------------------------------------------
    const [legalData, setLegalData] = useState(null);
    const [showLegalModal, setShowLegalModal] = useState(false);

    const [beatSheetData, setBeatSheetData] = useState(null);
    const [showBeatSheetModal, setShowBeatSheetModal] = useState(false);

    const [characterArcData, setCharacterArcData] = useState(null);
    const [showCharacterArcModal, setShowCharacterArcModal] = useState(false);

    // BRAND NEW GEMINI FEATURES
    const [budgetData, setBudgetData] = useState(null);
    const [showBudgetModal, setShowBudgetModal] = useState(false);

    const [lyricsData, setLyricsData] = useState(null);
    const [showLyricsModal, setShowLyricsModal] = useState(false);

    const [endingsData, setEndingsData] = useState(null);
    const [showEndingsModal, setShowEndingsModal] = useState(false);

    // NEW FEATURES: Merch & Grant
    const [merchData, setMerchData] = useState(null);
    const [showMerchModal, setShowMerchModal] = useState(false);
    const [grantData, setGrantData] = useState(null);
    const [showGrantModal, setShowGrantModal] = useState(false);

    // NEW GEMINI FEATURES STATE
    const [fanTheoryData, setFanTheoryData] = useState(null);
    const [showFanTheoryModal, setShowFanTheoryModal] = useState(false);
    const [canvasData, setCanvasData] = useState(null);
    const [showCanvasModal, setShowCanvasModal] = useState(false);

    // NEW ADDED FEATURES STATE
    const [distributionData, setDistributionData] = useState(null);
    const [showDistributionModal, setShowDistributionModal] = useState(false);
    const [pressData, setPressData] = useState(null);
    const [showPressModal, setShowPressModal] = useState(false);

    // NEW ADDED FEATURES STATE (BATCH 2)
    const [socialData, setSocialData] = useState(null);
    const [showSocialModal, setShowSocialModal] = useState(false);
    const [emailData, setEmailData] = useState(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [moodboardData, setMoodboardData] = useState(null);
    const [showMoodboardModal, setShowMoodboardModal] = useState(false);

    // NEW ADDED FEATURES STATE (BATCH 3)
    const [crowdData, setCrowdData] = useState(null);
    const [showCrowdModal, setShowCrowdModal] = useState(false);
    const [callSheetData, setCallSheetData] = useState(null);
    const [showCallSheetModal, setShowCallSheetModal] = useState(false);
    const [continuityData, setContinuityData] = useState(null);
    const [showContinuityModal, setShowContinuityModal] = useState(false);

    // NEW FEATURES STATE (BATCH 4)
    const [focusGroupData, setFocusGroupData] = useState(null);
    const [showFocusGroupModal, setShowFocusGroupModal] = useState(false);
    const [sequelData, setSequelData] = useState(null);
    const [showSequelModal, setShowSequelModal] = useState(false);
    // Satır ~1033'dan sonra (showSequelModal'dan sonra) ekleyin:

    // --- REAL-TIME COLLABORATION ---
    const [collaborationData, setCollaborationData] = useState(null);
    const [showCollaborationModal, setShowCollaborationModal] = useState(false);

    // --- AI CO-DIRECTOR ---
    const [coDirectorData, setCoDirectorData] = useState(null);
    const [showCoDirectorModal, setShowCoDirectorModal] = useState(false);

    // --- SPATIAL STORYBOARDING ---
    const [spatialData, setSpatialData] = useState(null);
    const [showSpatialModal, setShowSpatialModal] = useState(false);

    // --- MULTI-MODEL RENDERING ---
    const [multiModelData, setMultiModelData] = useState(null);
    const [showMultiModelModal, setShowMultiModelModal] = useState(false);

    // --- ADVANCED LIP-SYNC ---
    const [lipSyncData, setLipSyncData] = useState(null);
    const [showLipSyncModal, setShowLipSyncModal] = useState(false);

    // --- MOTION CAPTURE AI ---
    const [motionCaptureData, setMotionCaptureData] = useState(null);
    const [showMotionCaptureModal, setShowMotionCaptureModal] = useState(false);

    // --- LOCATION MATCHING AI ---
    const [locationMatchData, setLocationMatchData] = useState(null);
    const [showLocationMatchModal, setShowLocationMatchModal] = useState(false);

    // --- TALENT MATCHING AI ---
    const [talentMatchData, setTalentMatchData] = useState(null);
    const [showTalentMatchModal, setShowTalentMatchModal] = useState(false);

    // --- LEGAL COMPLIANCE AI ---
    const [legalComplianceData, setLegalComplianceData] = useState(null);
    const [showLegalComplianceModal, setShowLegalComplianceModal] = useState(false);

    // --- VR PREVISUALIZATION ---
    const [vrPrevisData, setVrPrevisData] = useState(null);
    const [showVrPrevisModal, setShowVrPrevisModal] = useState(false);

    // --- AR LOCATION SCOUT ---
    const [arScoutData, setArScoutData] = useState(null);
    const [showArScoutModal, setShowArScoutModal] = useState(false);

    // --- REALTIME RENDERING ---
    const [realtimeRenderData, setRealtimeRenderData] = useState(null);
    const [showRealtimeRenderModal, setShowRealtimeRenderModal] = useState(false);

    // --- VIRAL PREDICTOR AI ---
    const [viralPredictorData, setViralPredictorData] = useState(null);
    const [showViralPredictorModal, setShowViralPredictorModal] = useState(false);

    // --- AUDIENCE REACTION AI ---
    const [audienceReactionData, setAudienceReactionData] = useState(null);
    const [showAudienceReactionModal, setShowAudienceReactionModal] = useState(false);

    // --- COMPETITIVE ANALYSIS ---
    const [competitiveAnalysisData, setCompetitiveAnalysisData] = useState(null);
    const [showCompetitiveAnalysisModal, setShowCompetitiveAnalysisModal] = useState(false);

    // --- NFT STORYBOARD ---
    const [nftStoryboardData, setNftStoryboardData] = useState(null);
    const [showNftStoryboardModal, setShowNftStoryboardModal] = useState(false);

    // --- DAO PRODUCTION ---
    const [daoProductionData, setDaoProductionData] = useState(null);
    const [showDaoProductionModal, setShowDaoProductionModal] = useState(false);

    // --- AI COPYRIGHT ---
    const [aiCopyrightData, setAiCopyrightData] = useState(null);
    const [showAiCopyrightModal, setShowAiCopyrightModal] = useState(false);

    // --- AI LIPSYNC GENERATOR ---
    const [lipsyncMode, setLipsyncMode] = useState(false);
    const [showLipsyncModal, setShowLipsyncModal] = useState(false);
    const [lipsyncSettings, setLipsyncSettings] = useState({
        mouthOpenness: 'medium', // subtle, medium, exaggerated
        expressionStyle: 'natural', // natural, dramatic, anime
        syncTiming: 'on-beat' // on-beat, smooth, staccato
    });

    // --- AI ACTOR DEEPFAKE MODE (Face Consistency) ---
    const [faceConsistencyMode, setFaceConsistencyMode] = useState(false);
    const [lockedFaceImage, setLockedFaceImage] = useState(null);
    const [showFaceConsistencyPanel, setShowFaceConsistencyPanel] = useState(false);

    // --- BEAT-SYNC VISUAL GENERATOR ---
    const [beatSyncData, setBeatSyncData] = useState(null);
    const [showBeatSyncModal, setShowBeatSyncModal] = useState(false);
    const [analyzedBPM, setAnalyzedBPM] = useState(null);
    const [beatMarkers, setBeatMarkers] = useState([]);

    // --- REAL-TIME STYLE TRANSFER ---
    const [showStyleTransferModal, setShowStyleTransferModal] = useState(false);
    const [styleTransferPreview, setStyleTransferPreview] = useState(null);
    const [selectedStylePreset, setSelectedStylePreset] = useState(null);
    const [styleIntensity, setStyleIntensity] = useState(75);
    const [styleTransferLoading, setStyleTransferLoading] = useState(false);

    // --- FAN REACTION PREDICTOR ---
    const [fanReactionData, setFanReactionData] = useState(null);
    const [showFanReactionModal, setShowFanReactionModal] = useState(false);

    // --- AUTO COLOR PALETTE ---
    const [projectPalette, setProjectPalette] = useState(null);
    const [showPalettePanel, setShowPalettePanel] = useState(false);
    const [extractingPalette, setExtractingPalette] = useState(false);

    // --- REAL-TIME COLOR GRADING PREVIEW ---
    const [activeColorGrade, setActiveColorGrade] = useState('none');
    const [showColorGradePanel, setShowColorGradePanel] = useState(false);

    // --- AUTOMATION MODE ---
    const [isAutoModeActive, setIsAutoModeActive] = useState(false);
    const [autoModeRunning, setAutoModeRunning] = useState(false);
    const [autoModeCycleCount, setAutoModeCycleCount] = useState(0);
    const [autoModeCurrentStyle, setAutoModeCurrentStyle] = useState('');
    const [autoModeShouldStop, setAutoModeShouldStop] = useState(false);
    const [showAutomationPanel, setShowAutomationPanel] = useState(false);

    // ============================================================================
    // NEW CREATIVE FEATURES BUNDLE (7 Features)
    // ============================================================================

    // --- 1. AI EMOTION TIMELINE ---
    const [emotionTimelineData, setEmotionTimelineData] = useState(null);
    const [showEmotionTimelineModal, setShowEmotionTimelineModal] = useState(false);

    // --- 2. CINEMATIC PARALLAX GENERATOR ---
    const [parallaxData, setParallaxData] = useState(null);
    const [showParallaxModal, setShowParallaxModal] = useState(false);

    // --- 3. AI SCENE MORPH TRANSITIONS ---
    const [morphTransitionData, setMorphTransitionData] = useState(null);
    const [showMorphTransitionModal, setShowMorphTransitionModal] = useState(false);

    // --- 4. LYRICS-TO-VISUAL METAPHOR ENGINE ---
    const [metaphorData, setMetaphorData] = useState(null);
    const [showMetaphorModal, setShowMetaphorModal] = useState(false);

    // --- 5. SOCIAL MEDIA AUTO-CROPPER ---
    const [socialCropData, setSocialCropData] = useState(null);
    const [showSocialCropModal, setShowSocialCropModal] = useState(false);
    const [selectedCropFormat, setSelectedCropFormat] = useState('9:16');

    // --- 6. AI MUSIC VISUALIZER OVERLAY ---
    const [musicVisualizerData, setMusicVisualizerData] = useState(null);
    const [showMusicVisualizerModal, setShowMusicVisualizerModal] = useState(false);
    const [visualizerStyle, setVisualizerStyle] = useState('waveform');

    // --- 7. GROK.AI EXPORT PACKAGE ---
    const [grokExportData, setGrokExportData] = useState(null);
    const [showGrokExportModal, setShowGrokExportModal] = useState(false);
    const [grokExportProgress, setGrokExportProgress] = useState(0);

    // --- SESSION RECOVERY & AUTO-SAVE ---
    const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
    const [recoveryData, setRecoveryData] = useState(null);

    // Check for existing recovery data on mount
    useEffect(() => {
        const savedData = localStorage.getItem('storyboard_autosave');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                // Only show recovery if data is less than 24 hours old
                if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                    setRecoveryData(parsed);
                    setShowRecoveryDialog(true);
                }
            } catch (e) {
                console.error('Failed to parse recovery data:', e);
            }
        }
    }, []);

    // Auto-save interval - saves every 30 seconds
    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            // Only save if there's meaningful data
            if (formData.title || formData.lyrics || scenes.length > 0 || storyDetails) {
                const saveData = {
                    formData,
                    scenes,
                    sceneImages,
                    storyDetails,
                    cineSettings,
                    sceneDuration,
                    videoGenSettings,
                    timestamp: Date.now()
                };
                localStorage.setItem('storyboard_autosave', JSON.stringify(saveData));
                console.log('🔄 Auto-saved at', new Date().toLocaleTimeString());
            }
        }, 30000); // Every 30 seconds

        return () => clearInterval(autoSaveInterval);
    }, [formData, scenes, sceneImages, storyDetails, cineSettings, sceneDuration, videoGenSettings]);

    // Recover session handler
    const handleRecoverSession = () => {
        if (recoveryData) {
            if (recoveryData.formData) setFormData(recoveryData.formData);
            if (recoveryData.scenes) setScenes(recoveryData.scenes);
            if (recoveryData.sceneImages) setSceneImages(recoveryData.sceneImages);
            if (recoveryData.storyDetails) setStoryDetails(recoveryData.storyDetails);
            if (recoveryData.cineSettings) setCineSettings(recoveryData.cineSettings);
            if (recoveryData.sceneDuration) setSceneDuration(recoveryData.sceneDuration);
            if (recoveryData.videoGenSettings) setVideoGenSettings(recoveryData.videoGenSettings);

            // Skip to appropriate step
            if (recoveryData.scenes?.length > 0) {
                setStep('STORYBOARD');
            } else if (recoveryData.storyDetails) {
                setStep('STORY');
            }
        }
        setShowRecoveryDialog(false);
        localStorage.removeItem('storyboard_autosave');
    };

    // Dismiss recovery handler
    const handleDismissRecovery = () => {
        setShowRecoveryDialog(false);
        localStorage.removeItem('storyboard_autosave');
    };

    /* ------------------------------------------------------------------------ */

    // Initialize filteredScenes when scenes change
    useEffect(() => {
        setFilteredScenes(scenes);
    }, [scenes]);

    // Quick Start Template Handler
    const handleSelectTemplate = (template) => {
        setShowQuickStartModal(false);
        // Apply template defaults
        setFormData({
            ...formData,
            projectType: template.projectType,
            duration: template.defaults.duration,
            visualStyle: template.defaults.visualStyle
        });
        setCineSettings(template.defaults.cineSettings);
        setSceneDuration(template.defaults.sceneDuration);
        setStep('FORM');
    };

    const confirmStartOver = () => {
        setStep('PROJECT_TYPE'); // Reset to Project Type
        setFormData({ projectType: 'Music Video', title: '', duration: '', gender: t.female, useCharacters: true, lyrics: '', visualStyle: '', suggestions: '', directorRefs: '', youtubeRef: '' });
        setCineSettings({ lens: '', era: '', lighting: '', mode: '' });
        setSceneDuration(12);
        setUploadedRefImage(null);
        setVideoGenSettings({ camera: 'Dynamic', motion: 5, aspectRatio: '16:9', negativePrompt: 'text, watermark, copyright, blur, distorted, low quality, ugly, deformed' });
        setIdeas([]);
        setStoryDetails(null);
        setScenes([]);
        setCreativeContext(null);
        setElementImages({});
        setSceneImages({});
        setScenesGeneratedCount(0);
        setSceneGenerationActive(false);
        setShowConfirmModal(false);
        setAudioCache({});
        setVideoPrompts({});
        setPitchData(null);
        setLyricsSynced(false);
        setCostumeData(null);
        setLocationScoutData(null);
        setMarketingData(null);
        setPropData(null);
        setEasterEggData(null);
        setCastingData(null);
        setChoreographyData(null);
        setPaletteData(null);
        setScheduleData(null);
        setSafetyData(null);
        setShotListData(null);
        setVfxData(null);
        setSoundData(null);
        setCritiqueData(null);
        setAlbumCover(null);
        setLegalData(null);
        setBeatSheetData(null);
        setCharacterArcData(null);
        setBudgetData(null);
        setLyricsData(null);
        setEndingsData(null);
        setMerchData(null);
        setGrantData(null);
        setFanTheoryData(null);
        setCanvasData(null);
        setDistributionData(null);
        setPressData(null);
        setSocialData(null);
        setEmailData(null);
        setMoodboardData(null);
        setCrowdData(null);
        setCallSheetData(null);
        setContinuityData(null);
        setFocusGroupData(null);
        setSequelData(null);
        setCanvasData(null);
        // setMultiGenreData(null); // This state variable is not defined in the provided context, commenting out to avoid error.
        setProjectPalette(null);
    };

    // --- COLOR PALETTE EXTRACTION ---

    // Helper: Convert RGB to HEX
    const rgbToHex = (r, g, b) => {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    };

    // Extract dominant colors from image using simple sampling
    const extractColorsFromImage = (imageUrl) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';

            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Resize for performance
                    const maxSize = 100;
                    const scale = Math.min(maxSize / img.width, maxSize / img.height);
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;

                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const pixels = imageData.data;

                    // Sample colors (every 4th pixel for speed)
                    const colorCounts = {};
                    for (let i = 0; i < pixels.length; i += 16) { // Step by 4 pixels
                        const r = Math.round(pixels[i] / 10) * 10; // Quantize
                        const g = Math.round(pixels[i + 1] / 10) * 10;
                        const b = Math.round(pixels[i + 2] / 10) * 10;
                        const key = `${r},${g},${b}`;
                        colorCounts[key] = (colorCounts[key] || 0) + 1;
                    }

                    // Get top 5 colors
                    const sortedColors = Object.entries(colorCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([rgb]) => {
                            const [r, g, b] = rgb.split(',').map(Number);
                            return {
                                rgb: `rgb(${r}, ${g}, ${b})`,
                                hex: rgbToHex(r, g, b),
                                r, g, b
                            };
                        });

                    resolve(sortedColors);
                } catch (error) {
                    console.error('Color extraction error:', error);
                    reject(error);
                }
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = imageUrl;
        });
    };

    // Extract palette from all scenes
    const handleExtractColorPalette = async () => {
        if (Object.keys(sceneImages).length === 0) {
            setError('Please generate scene images first');
            return;
        }

        setExtractingPalette(true);
        setShowPalettePanel(true);

        try {
            const sceneColors = [];

            // Extract colors from each scene
            for (let idx = 0; idx < scenes.length; idx++) {
                if (sceneImages[idx]) {
                    try {
                        const colors = await extractColorsFromImage(sceneImages[idx]);
                        sceneColors.push({
                            sceneIndex: idx,
                            sceneName: `Scene ${idx + 1}`,
                            colors
                        });
                    } catch (err) {
                        console.error(`Failed to extract colors from scene ${idx}:`, err);
                    }
                }
            }

            // Aggregate all colors and find most common
            const allColors = sceneColors.flatMap(sc => sc.colors);
            const colorMap = {};

            allColors.forEach(color => {
                const key = color.hex;
                if (!colorMap[key]) {
                    colorMap[key] = { ...color, count: 0 };
                }
                colorMap[key].count++;
            });

            // Get top 7 project-wide colors
            const projectColors = Object.values(colorMap)
                .sort((a, b) => b.count - a.count)
                .slice(0, 7);

            setProjectPalette({
                projectColors,
                sceneBreakdown: sceneColors,
                totalScenes: sceneColors.length,
                extractedAt: new Date().toISOString()
            });

        } catch (error) {
            console.error('Palette extraction error:', error);
            setError('Failed to extract color palette');
        } finally {
            setExtractingPalette(false);
        }
    };

    const handleEditInputs = () => {
        setStep('FORM');
        // Do not clear formData
        // Keep ideas if they exist
    };

    const parseDuration = (str) => {
        if (!str) return 0;
        try {
            const parts = str.split(':');
            if (parts.length === 2) {
                return (parseInt(parts[0]) * 60) + parseInt(parts[1]);
            }
            return parseInt(str);
        } catch (e) {
            return 0;
        }
    };

    // Unified Style Analysis Handler - Updated for Image Support and Better Weighting
    const handleSmartStyleAnalysis = async (sources, weights, audioFile, videoFile, imageFile) => {
        setError(null);
        setIsSuggestingStyle(true);
        const langName = 'English';
        const currentProjectType = formData.projectType || 'Music Video';

        try {
            let promptInputs = [];
            let attachments = [];
            let attachmentInstructions = [];

            // 1. Validation & Input Gathering
            if (sources.length === 0) throw new Error(t.noSourceSelected);

            // Helper to format weight description
            const getWeightDesc = (source) => {
                const w = weights[source];
                if (w >= 85) return `(DOMINANT FORCE - ${w}%): This source dictates 85-100% of the visual identity. Ignore conflicting signals.`;
                if (w >= 60) return `(PRIMARY DRIVER - ${w}%): Defines the core aesthetic foundation.`;
                if (w >= 30) return `(MODIFIER - ${w}%): Influences the style but does not dominate.`;
                return `(SUBTLE ACCENT - ${w}%): Only slight details or hints.`;
            };

            // Detect if the current visual style is a JSON preset
            const currentStyle = formData.visualStyle ? formData.visualStyle.trim() : "";
            const isJsonPreset = currentStyle.startsWith("{") || currentStyle.startsWith('"{');

            // Construct weighted inputs
            if (formData.visualStyle && formData.visualStyle.trim() !== "") {
                promptInputs.push(`SOURCE: USER SELECTED PRESET (BASE STYLE)\nContent: "${formData.visualStyle.substring(0, 3000)}..."\nInstruction: The user has explicitly selected this NANO_BANANA_PRESET. Use this as the FOUNDATION. CRITICAL: You must harmoniously blend the uploaded Reference Image, Video, and Audio vibe with this preset. ${isJsonPreset ? "PRESERVE THE JSON STRUCTURE. Merge analyzed details (e.g. lighting, subject appearance from video/image) into this JSON structure's fields." : "If the preset specifies a specific lighting or color palette, adapt the uploaded visual references to fit that mood while keeping their subject matter."}`);
            }

            if (sources.includes('lyrics')) {
                if (!formData.lyrics) throw new Error(t.missingLyrics);
                promptInputs.push(`SOURCE: LYRICS ${getWeightDesc('lyrics')}\nContent: "${formData.lyrics.substring(0, 500)}..."\nInstruction: Extract mood and imagery from text.`);
            }

            if (sources.includes('refs')) {
                if (!formData.directorRefs) throw new Error(t.missingRefs);
                promptInputs.push(`SOURCE: DIRECTOR REFS ${getWeightDesc('refs')}\nContent: "${formData.directorRefs}"\nInstruction: Copy the visual style of these directors.`);
            }

            if (sources.includes('youtube')) {
                if (!formData.youtubeRef) throw new Error(t.missingYoutube);
                // PROMPT FIX: Prevent hallucinations for unknown URLs
                promptInputs.push(`SOURCE: YOUTUBE URL ${getWeightDesc('youtube')}\nURL: "${formData.youtubeRef}"\nInstruction: If this is a famous or well-known music video, use its established visual style. IF UNKNOWN, IGNORE THIS URL to prevent hallucinating irrelevant details.`);
            }

            if (sources.includes('image')) {
                if (!imageFile) throw new Error(t.missingFile + ' (Image)');
                promptInputs.push(`SOURCE: UPLOADED IMAGE (See Attachment) ${getWeightDesc('image')}\nInstruction: ANALYZE THE ATTACHED IMAGE. Describe its Color Palette, Lighting Style (e.g., Neon, Chiaroscuro), and Texture.`);
                const reader = new FileReader();
                const filePromise = new Promise((resolve, reject) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = reject;
                });
                reader.readAsDataURL(imageFile);
                const base64Data = await filePromise;
                attachments.push({ data: base64Data, mimeType: imageFile.type });
                attachmentInstructions.push("The image attachment is the 'Reference Image'.");
            }

            if (sources.includes('video')) {
                if (!videoFile) throw new Error(t.missingFile + ' (Video)');
                promptInputs.push(`SOURCE: UPLOADED VIDEO (See Attachment) ${getWeightDesc('video')}\nInstruction: DEEP ANALYSIS. Analyze the Cinematography (Camera Movement, Angles) and Grading. If PRIMARY DRIVER, clone this camera work.`);
                const reader = new FileReader();
                const filePromise = new Promise((resolve, reject) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = reject;
                });
                reader.readAsDataURL(videoFile);
                const base64Data = await filePromise;
                attachments.push({ data: base64Data, mimeType: videoFile.type });
                attachmentInstructions.push("The video attachment is the 'Style Transfer Reference'.");
            }

            if (sources.includes('audio')) {
                if (!audioFile) throw new Error(t.missingFile + ' (Audio)');
                promptInputs.push(`SOURCE: UPLOADED AUDIO (See Attachment) ${getWeightDesc('audio')}\nInstruction: LISTEN TO THE ATTACHED AUDIO. Detect BPM, Genre, and Vibe. If High Weight: The visual editing pace must match this audio's energy.`);
                const reader = new FileReader();
                const filePromise = new Promise((resolve, reject) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = reject;
                });
                reader.readAsDataURL(audioFile);
                const base64Data = await filePromise;
                attachments.push({ data: base64Data, mimeType: audioFile.type });
                attachmentInstructions.push("The audio attachment is the 'Song Analysis'.");
            }

            // 2. Construct Prompt
            const validLenses = [
                "Wide Angle (24mm)", "Standard (50mm)", "Telephoto (85mm)", "Anamorphic", "Fisheye", "Macro",
                "Super Wide (16mm)", "Vintage Zoom", "Tilt-Shift", "Split Diopter", "IMAX 70mm", "CCTV/Webcam"
            ];
            const validEras = [
                "Modern Clean (Digital 8K)", "90s Grunge (Hi8/VHS)", "80s Retro (Neon/Synth)", "70s Vintage (Kodachrome)", "Black & White Noir", "Cyberpunk Future",
                "Y2K Digital (MiniDV)", "60s Psychedelic (Ektachrome)", "50s Technicolor", "Silent Film (16fps)", "Early 2000s Music Video", "Glitch Art / Datamosh"
            ];
            const validLighting = [
                "Natural / Golden Hour", "High Contrast / Dramatic", "Neon / Artificial", "Soft / Diffused", "Dark / Low Key", "Strobe / Club",
                "Silhouette / Backlit", "Bioluminescent", "Infrared / Thermal", "God Rays / Volumetric", "Candlelight / Fire", "Underwater / Caustics"
            ];
            const validModes = [
                "Standard Cinematic", "Live Performance", "Intimate Acoustic", "Handheld Amateur", "Backstage Vlog", "CCTV Security", "Vintage VHS",
                "Drone / FPV", "Snorricam (Body Mount)", "GoPro Action", "Crash Zoom / Snap Zoom", "One-Shot (Long Take)", "Stop Motion Animation"
            ];

            const prompt = `
            Act as an expert Art Director and Cinematographer for a ${currentProjectType} project.
            I have provided specific media attachments.
            ${attachmentInstructions.join('\n')}

            Analyze these inputs to create a cohesive "Visual Style" description AND determine the specific Cinematography Toolkit settings.
            CONTEXT: The visual style description must be specifically tailored to the genre of a ${currentProjectType} (e.g., if 'Commercial', focus on clean, high-key lighting; if 'Documentary', focus on realism).

            STRICT WEIGHTING PROTOCOL:
            - You must mathematically balance the inputs based on the percentages provided.
            - If a source is marked "DOMINANT FORCE", it overrules conflicting signals from "ACCENTS".

            PRESET HANDLING:
            ${isJsonPreset ? "The input 'visualStyle' is a JSON structure. You MUST return a modified JSON string in the output 'visualStyle' field. Do NOT summarize it as text. Update the JSON values (e.g. subjects, lighting, colors) based on the analyzed attachments." : "The input 'visualStyle' is text. Blend the analyzed styles into a cohesive paragraph."}

            INPUTS TO ANALYZE:
            ${promptInputs.join('\n\n')}

            TASK - THINKING PROCESS:
            1. **Analyze Attachments/URLs:** detailed breakdown of what is in the image/audio/video.
            2. **Determine Specs:** Based on the footage style, identify the likely Lens, Film Stock (Era), Lighting condition, and Shooting Mode from the provided options.

            OUTPUT FORMAT:
            Provide a JSON object containing:
            1. "visualStyle": ${isJsonPreset ? "The updated JSON string." : `A descriptive string in ${langName} (max 60 words).`}
            2. "lens": Best match from [${validLenses.join(', ')}]
            3. "era": Best match from [${validEras.join(', ')}]
            4. "lighting": Best match from [${validLighting.join(', ')}]
            5. "mode": Best match from [${validModes.join(', ')}]
        `;

            const schema = {
                type: "OBJECT",
                properties: {
                    visualStyle: { type: "STRING" },
                    lens: { type: "STRING", enum: validLenses },
                    era: { type: "STRING", enum: validEras },
                    lighting: { type: "STRING", enum: validLighting },
                    mode: { type: "STRING", enum: validModes }
                },
                required: ["visualStyle", "lens", "era", "lighting", "mode"]
            };

            // FIXED: Disable Search Tool to prevent API 401 Error. YouTube URL is already in the prompt.
            const useSearch = false; // sources.includes('youtube');
            const result = await generateText(prompt, "You are an expert Art Director. Analyze the uploaded files deeply.", schema, attachments, useSearch);

            setFormData(prev => ({ ...prev, visualStyle: result.visualStyle }));

            // Auto-populate Cinematography Toolkit
            setCineSettings({
                lens: result.lens || '',
                era: result.era || '',
                lighting: result.lighting || '',
                mode: result.mode || ''
            });

        } catch (e) {
            console.error(e);
            setError(e.message || t.errorGeneric);
        } finally {
            setIsSuggestingStyle(false);
        }
    };

    // --- MODIFIED FUNCTION SIGNATURE AND LOGIC ---
    const generateIdeas = async (sources = [], weights = {}, videoFile = null, imageFile = null) => {
        setLoading(true);
        setLoadingMsg("Generating creative ideas...");
        setError(null);
        const currentProjectType = formData.projectType || 'Music Video';
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (e) => setUploadedRefImage(e.target.result);
            reader.readAsDataURL(imageFile);
        }
        // Default weights if not provided (fallback)
        const safeWeights = {
            video: weights.video || 0,
            lyrics: weights.lyrics || 0,
            image: weights.image || 0,
            youtube: weights.youtube || 0
        };

        const isVideoHighPriority = sources.includes('video') && safeWeights.video > 70;
        const isYoutubeHighPriority = sources.includes('youtube') && safeWeights.youtube > 50;

        // --- NEW CODE: PREPARE ATTACHMENTS ---
        const attachments = [];
        try {
            if (videoFile && sources.includes('video')) {
                const reader = new FileReader();
                const filePromise = new Promise((resolve, reject) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = reject;
                });
                reader.readAsDataURL(videoFile);
                const base64Data = await filePromise;
                attachments.push({ data: base64Data, mimeType: videoFile.type });
            }
            if (imageFile && sources.includes('image')) {
                const reader = new FileReader();
                const filePromise = new Promise((resolve, reject) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = reject;
                });
                reader.readAsDataURL(imageFile);
                const base64Data = await filePromise;
                attachments.push({ data: base64Data, mimeType: imageFile.type });
            }
        } catch (err) {
            console.error("Error processing attachments for ideas:", err);
        }
        // --------------------------------------

        try {
            const langName = 'English';

            let strictInstruction = "";
            if (isVideoHighPriority) {
                strictInstruction += "CRITICAL: The user has requested a HIGH STYLE TRANSFER from the uploaded video reference. All story concepts MUST strictly adhere to the visual aesthetic AND SUBJECT MATTER of the video reference input (See Attachment), even if it contradicts the lyrics.\n";
            }

            // ADDED: YouTube Influence Logic
            if (isYoutubeHighPriority && formData.youtubeRef) {
                strictInstruction += `CRITICAL: The user provided a YouTube Reference URL (${formData.youtubeRef}). You MUST analyze this URL. If it points to a known video/style, the generated story concepts MUST be heavily influenced by its TOPIC, THEME, and NARRATIVE STRUCTURE. Match the energy and subject matter of this YouTube reference.\n`;
            }

            let characterInstruction = formData.useCharacters
                ? `Vocalist Gender: ${formData.gender}`
                : "CRITICAL: The user explicitly requested NO CHARACTERS. Focus on scenery, abstract visuals, atmosphere, objects, and locations. Do NOT include human protagonists.";

            const prompt = `
        Generate 10 unique and creative ${currentProjectType} concepts based on:
        Project Type: "${currentProjectType}"
        Title: "${formData.title}"
        ${characterInstruction}
        Full Lyrics/Script: "${formData.lyrics}"
        Visual Style: "${formData.visualStyle}"
        Director Refs: "${formData.directorRefs}"
        YouTube Ref: "${formData.youtubeRef}"
        Suggestions: "${formData.suggestions}"
        Cinematography Lens: "${cineSettings.lens}"
        Era/Film Stock: "${cineSettings.era}"
        Lighting: "${cineSettings.lighting}"
        Shooting Mode: "${cineSettings.mode}"
        
        ${strictInstruction}
        
        CRITICAL REFERENCE INTEGRATION RULES:
        1. **LYRICS/SCRIPT ALIGNMENT**: Each story concept MUST directly relate to themes, emotions, and narrative elements found in the lyrics/script provided. Extract key metaphors, emotions, settings, and characters mentioned in the text.
        
        2. **VISUAL STYLE MANDATE**: The 'Visual Style' field describes the aesthetic direction. ALL story concepts must be visually compatible with this style (e.g., if style is "Cyberpunk Neon", concepts should feature urban, futuristic, neon-lit scenarios).
        
        3. **DIRECTOR REFERENCES INFLUENCE**: If director/film references are provided (e.g., "Christopher Nolan, Blade Runner"), concepts should adopt similar storytelling techniques, pacing, and visual motifs from these references.
        
        4. **YOUTUBE REFERENCE ANALYSIS**: If a YouTube URL is provided, analyze its subject matter, mood, visual treatment, and narrative structure. Story concepts should draw heavy inspiration from this reference.
        
        5. **CINEMATOGRAPHY INTEGRATION**: Use the provided lens (${cineSettings.lens}), era (${cineSettings.era}), lighting (${cineSettings.lighting}), and shooting mode (${cineSettings.mode}) as essential elements in concept descriptions.
        
        6. **UPLOADED MEDIA PRIORITY**: [Analyze attached images/videos] The uploaded visual references show specific subjects, settings, colors, and moods. Story concepts MUST incorporate these visual elements. For example:
           - If uploaded image shows a person in a forest → concepts should feature forest/nature settings
           - If uploaded video shows dancing → concepts should include choreography/movement
           - Colors and lighting from uploads should inform the mood of concepts
        
        REMEMBER: Story concepts should feel like natural extensions of ALL the references provided, not generic ideas. Each concept should demonstrate clear connections to at least 2-3 of the provided references.

        [CRITICAL VISUAL REFERENCE ANALYSIS]:
        ${attachments.length > 0 ? `
        I have attached ${attachments.length} visual reference file(s). You MUST:
        1. Deeply analyze each attachment's content (subjects, locations, colors, mood, actions)
        2. Extract specific visual elements (e.g., "rainy street", "neon signs", "dancing person", "desert landscape")
        3. Ensure EVERY generated story concept incorporates at least ONE specific element from these attachments
        4. If multiple attachments are provided, create concepts that blend elements from different references

        Example: If uploaded image shows "a cat in cyberpunk city" and Visual Style is "Noir", generate concepts like:
        - "A detective cat navigating neon-lit alleys of a dystopian metropolis"
        - "Cybernetic feline searching for lost memories in rain-soaked cyber-streets"
        ` : 'No visual attachments provided.'}

        VISUAL STYLE PRESET COMPATIBILITY:
        The 'Visual Style' field may contain a NANO_BANANA_PRESET (potentially JSON format).
        You MUST apply the preset's aesthetic to the subjects/themes from:
        - The lyrics/ script content
        - The uploaded attachments
        - The YouTube/Director references

        INTEGRATION EXAMPLE:
        - Preset: "Cyberpunk Neon"
        - Lyrics mention: "Lost in memories"
        - Uploaded image shows: "A woman in rain"
        → Concept: "A woman wandering through neon-lit streets in rain, searching for lost memories in a cyberpunk city"

        CONTEXTUAL INSTRUCTION:
        - If 'Commercial': Focus on brand storytelling, product shots, and persuasive visuals.
        - If 'Documentary': Focus on realism, interviews, and observational footage.
        - If 'Short Film': Focus on narrative arc and dialogue.
        - If 'Social Media': Focus on viral hooks, loops, and visual trends.
        - If 'Lyric Video': Focus on abstract backgrounds, motion graphics, and atmospheric loops suitable for text overlay.

        IMPORTANT: All output MUST be in ${langName.toUpperCase()}.
        Response must be a JSON Array of objects with 'title' and 'description'.
      `;

            const schema = {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        title: { type: "STRING" },
                        description: { type: "STRING" }
                    },
                    required: ["title", "description"]
                }
            };

            // FIXED: Disable Search Tool to prevent API 401 Error
            const useSearch = false; // sources.includes('youtube');
            const result = await generateText(prompt, `Creative Director. Output in ${langName}.`, schema, attachments, useSearch);
            setIdeas(result);
            setStep('IDEAS');
        } catch (e) {
            setError(t.errorGeneric);
        } finally {
            setLoading(false);
        }
    };

    const selectIdea = async (idea) => {
        setSelectedIdea(idea);
        setLoading(true);
        setLoadingMsg("Detailing story...");
        setError(null);
        const currentProjectType = formData.projectType || 'Music Video';

        try {
            const langName = 'English';

            let characterRule = formData.useCharacters
                ? `1. Protagonist matches gender: ${formData.gender}.`
                : `1. NO CHARACTERS. Return an empty array for 'characters'. Focus deeply on 'locations' and 'items'.`;

            const prompt = `
        Detail this ${currentProjectType} concept: "${idea.title}" - ${idea.description}
        Project Type: "${currentProjectType}"
        Song/Title: "${formData.title}"
        Content/Lyrics: "${formData.lyrics.substring(0, 300)}..."
        Style: "${formData.visualStyle}"
        Director Refs: "${formData.directorRefs}"
        Cinematography Settings: ${JSON.stringify(cineSettings)}
        
        RULES:
        ${characterRule}
        2. 'style' field should describe the visual aesthetic heavily, incorporating the cinematography settings (Lens: ${cineSettings.lens}, Era: ${cineSettings.era}, Mode: ${cineSettings.mode}).
        3. IMPORTANT: All descriptions, plot, and names MUST be in ${langName.toUpperCase()}.
        4. Strict JSON format.
        5. Provide detailed physical descriptions for characters (clothing, face, accessories).
      `;

            const schema = {
                type: "OBJECT",
                properties: {
                    plot: { type: "STRING" },
                    style: { type: "STRING" },
                    characters: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                name: { type: "STRING" },
                                description: { type: "STRING" },
                                clothing: { type: "STRING", description: "Detailed outfit description" },
                                appearance: { type: "STRING", description: "Face and body details" },
                                accessories: { type: "STRING", description: "Jewelry, props, etc" }
                            },
                            required: ["name", "description"]
                        }
                    },
                    items: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, description: { type: "STRING" } }, required: ["name", "description"] } },
                    locations: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, description: { type: "STRING" } }, required: ["name", "description"] } }
                },
                required: ["plot", "style", "characters", "items", "locations"]
            };

            const result = await generateText(prompt, `Storyteller. Output in ${langName}.`, schema);
            setStoryDetails(result);
            setStep('DETAILS');
            generateElementImages(result);
        } catch (e) {
            setError(t.errorGeneric);
        } finally {
            setLoading(false);
        }
    };

    const getElementPrompt = (type, item, style) => {
        let promptPrefix = "";
        const styleWithRefs = `${style}. ${formData.directorRefs ? `Inspired by ${formData.directorRefs}.` : ''}`;
        // Add specific lens/era instructions
        const techSpecs = `${cineSettings.lens ? `Shot on ${cineSettings.lens}.` : ''} ${cineSettings.era ? `Film stock: ${cineSettings.era}.` : ''} ${cineSettings.lighting ? `Lighting: ${cineSettings.lighting}.` : ''} ${cineSettings.mode ? `Style: ${cineSettings.mode}.` : ''}`;

        // UPDATED: Richer base prompt inspired by CSV
        const cinematic = `midjourney style, cinematic lighting, 8k resolution, photorealistic, shallow depth of field, high clarity, crisp textures, ${techSpecs}`;

        if (type === 'char') {
            // Updated character prompt to include new detailed fields if available
            const details = [
                item.description,
                item.appearance ? `Appearance: ${item.appearance}` : '',
                item.clothing ? `Wearing: ${item.clothing}` : '',
                item.accessories ? `Accessories: ${item.accessories}` : ''
            ].filter(Boolean).join('. ');
            // UPDATED: Character Portrait structure
            promptPrefix = `Ultra-realistic portrait of character, ${cinematic}, soft warm key light, detailed skin texture, ${details}`;
        }
        if (type === 'item') promptPrefix = `Studio product photography of item, ${cinematic}, sharp focus, neutral background, dramatic lighting, `;
        if (type === 'loc') promptPrefix = `Wide cinematic establishing shot of location, ${cinematic}, atmospheric lighting, highly detailed environment, `;

        if (type !== 'char') {
            return `${promptPrefix} ${item.description}. Style: ${styleWithRefs}`;
        }
        return `${promptPrefix}. Style: ${styleWithRefs}`;
    };

    const generateElementImages = (details) => {
        const generate = async (type, item, index = -1) => {
            const key = `${type}-${item.name}`;
            setElementLoading(prev => ({ ...prev, [key]: true }));
            setElementErrors(prev => ({ ...prev, [key]: false }));

            let fullPrompt = getElementPrompt(type, item, details.style);
            let refImages = [];

            // --- ADDED: Strict Identity Logic ---
            // If it's a character, it's the Main Character (index 0), and we have an upload
            if (type === 'char' && index === 0 && uploadedRefImage) {
                refImages.push({ data: uploadedRefImage, mimeType: "image/png" });
                fullPrompt += ", preserve exact facial features from reference image, strict identity lock, same face, 100% likeness, face no change";
            }
            try {
                const img = await generateImageRobust(fullPrompt);
                setElementImages(prev => ({ ...prev, [key]: img }));
            } catch (e) {
                console.error(e);
                setElementErrors(prev => ({ ...prev, [key]: true }));
            } finally {
                setElementLoading(prev => ({ ...prev, [key]: false }));
            }
        };
        if (formData.useCharacters) {
            details.characters.forEach((c, i) => generate('char', c, i));
        }
        details.items.forEach(i => generate('item', i));
        details.locations.forEach(l => generate('loc', l));
    };

    const regenerateSingleElement = async (type, item) => {
        if (!storyDetails) return;
        const key = `${type}-${item.name}`;
        setElementImages(prev => { const next = { ...prev }; delete next[key]; return next; });
        setElementLoading(prev => ({ ...prev, [key]: true }));
        setElementErrors(prev => ({ ...prev, [key]: false }));
        const fullPrompt = getElementPrompt(type, item, storyDetails.style);
        try {
            const img = await generateImageRobust(fullPrompt);
            setElementImages(prev => ({ ...prev, [key]: img }));
        } catch (e) {
            setElementErrors(prev => ({ ...prev, [key]: true }));
        } finally {
            setElementLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleImageUpload = (type, item, base64) => {
        const key = `${type}-${item.name}`;
        setElementImages(prev => ({ ...prev, [key]: base64 }));
        setElementLoading(prev => ({ ...prev, [key]: false }));
        setElementErrors(prev => ({ ...prev, [key]: false }));
    };

    const handleAddCharacter = () => {
        const name = "New Character ";
        const desc = "Added by user.";
        const newChar = { name: name + (storyDetails.characters.length + 1), description: desc };
        setStoryDetails(prev => ({ ...prev, characters: [...prev.characters, newChar] }));
    };

    // Helper to auto-generate auxiliary details before storyboard
    const generateCreativeContext = async () => {
        setLoadingMsg(t.autoCreativeBible);
        const langName = 'English';
        const prompt = `
      Act as a creative team (Casting Director, Costume Designer, Location Manager).
      Based on this music video plot and style:
      Plot: "${storyDetails.plot}"
      Style: "${storyDetails.style}"
      Characters: "${storyDetails.characters.map(c => c.name).join(', ')}"
      
      Generate a concise "Creative Bible" to guide the visual production.
      Output specific visual descriptions for:
      1. Casting: Visual archetype for each character (e.g. "Tall, brooding, sharp jawline").
      2. Costumes: Key outfit details for main scenes (e.g. "Sequined silver jacket, torn jeans").
      3. Locations: Specific atmospheric details (e.g. "Abandoned warehouse with leaking pipes and neon graffiti").

      Output JSON format:
      {
        "casting_notes": "string",
        "costume_notes": "string",
        "location_notes": "string"
      }
      All text in ${langName}.
    `;
        const schema = {
            type: "OBJECT",
            properties: {
                casting_notes: { type: "STRING" },
                costume_notes: { type: "STRING" },
                location_notes: { type: "STRING" }
            },
            required: ["casting_notes", "costume_notes", "location_notes"]
        };

        try {
            const result = await generateText(prompt, "Creative Team", schema);
            setCreativeContext(result);
            setCastingData(result.casting_notes);
            setCostumeData(result.costume_notes);
            setLocationScoutData(result.location_notes);
            return result;
        } catch (e) {
            console.error("Creative Context Error", e);
            return null;
        }
    };

    const generateStoryboardText = async () => {
        // NEW: Confirmation if scenes exist
        if (scenes.length > 0) {
            if (!window.confirm("Are you sure you want to regenerate storyboard? This will replace all current scenes, images, and prompts.")) {
                return;
            }
            // Clear existing state
            setSceneImages({});
            setVideoPrompts({});
            setScenesGeneratedCount(0);
            // Also clear derived data
            setAudioCache({});
            setLyricsSynced(false);
            setPropData(null);
            setShotListData(null);
            setVfxData(null);
            setSoundData(null);
            setScheduleData(null);
            setSafetyData(null);
        }

        setLoading(true);

        // 1. Calculate Scene Count
        const durationSec = parseDuration(formData.duration);
        // CHANGED: Use selected sceneDuration (6s or 12s)
        const count = durationSec > 0 ? Math.ceil(durationSec / sceneDuration) : 20;

        // 2. Auto Generate Context (Creative Bible) first
        const context = await generateCreativeContext();
        const contextStr = context ? `
      Use these specific visual details to guide scene descriptions:
      Casting Look: ${context.casting_notes}
      Costumes: ${context.costume_notes}
      Location Details: ${context.location_notes}
    ` : "";

        setLoadingMsg(`Generating ${count} storyboard scenes...`);

        try {
            const langName = 'English';
            const currentProjectType = formData.projectType || 'Music Video';

            // --- YENİ KONTROL: Lyric Video mi? ---
            const isLyricVideo = currentProjectType === 'Lyric Video';

            const prompt = `
        You are a director for a ${currentProjectType}. Split this story into exactly ${count} sequential storyboard scenes.
        PACING INSTRUCTION: Each scene represents approximately ${sceneDuration} seconds.
        ${sceneDuration === 6 ? 'STYLE: Fast cuts, high energy, quick transitions (TikTok/Reels style).' : 'STYLE: Cinematic, lingering shots, slow camera movement.'}

        Project Type: ${currentProjectType}
        Plot: ${storyDetails.plot}
        Style: ${storyDetails.style}
        Refs: ${formData.directorRefs}
        ${formData.useCharacters ? `Chars: ${storyDetails.characters.map(c => c.name).join(', ')}` : 'Chars: None (Atmospheric/Abstract Video)'}
        
        ${contextStr}

        Technical Cinematography Requirements:
        Lens: ${cineSettings.lens}
        Era: ${cineSettings.era}
        Lighting: ${cineSettings.lighting}
        Shooting Mode: ${cineSettings.mode}

        [VISUAL COMPATIBILITY PROTOCOL]:
        The 'Style' description is derived from a high-quality NANO_BANANA_PRESET (potentially JSON formatted). 
        You MUST execute this specific aesthetic accurately in every scene description. 
        If preset describes specific colors, lighting (e.g., "Neon", "Golden Hour"), or composition (e.g., "Fisheye", "Drone"), 
        these MUST be explicitly written into 'cinematography' and 'setting' fields for each scene. 
        Ensure characters and plot actions integrate seamlessly with this visual preset.

        Step by Step Filmmaking:
        Ensure each scene has camera instructions (e.g. "Tracking shot", "Close up", "Drone shot").

        ${isLyricVideo ? `
        CRITICAL INSTRUCTION: This is a "Lyric Video" (Official Audio/Lyric Video).
        1. FOCUS RESTRICTION: Focus ONLY on the TEXT (Lyrics) and the BACKGROUND. NO abstract visualizers, no sound waves, no music spectrums.
        2. BACKGROUND DYNAMICS: The background image/environment must change RHYTHMICALLY and ENERGETICALLY to match the song's tempo/bass. Describe if the scene is high energy (cut on beat) or slow motion.
        3. FONT REQUEST: Suggest a CONSISTENT Font Style (e.g., 'Bold Sans-Serif', 'Handwritten', 'Gothic', 'Modern Serif') that matches the MOOD of the lyrics and the video style. The font must be readable and cohesive throughout.
        4. DESCRIPTION: Ensure each scene focuses on ONE specific lyric line. The 'scene_description' must describe the BACKGROUND VIBES suitable for that lyric text.
        ` : ''}

        IMPORTANT: All text output MUST be in ${langName.toUpperCase()}.
        Output: JSON Array of ${count} objects.
      `;

            const schema = {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        scene_description: { type: "STRING" },
                        narrator_script: { type: "STRING" },
                        characters_in_scene: { type: "ARRAY", items: { type: "STRING" } },
                        cinematography: {
                            type: "OBJECT",
                            properties: {
                                angle: { type: "STRING" },
                                lighting: { type: "STRING" },
                                mood: { type: "STRING" }
                            }
                        },
                        setting: {
                            type: "OBJECT",
                            properties: {
                                location: { type: "STRING" },
                                details: { type: "STRING" }
                            }
                        },
                        subject: {
                            type: "OBJECT",
                            properties: {
                                action: { type: "STRING" },
                                appearance: { type: "STRING" }
                            }
                        }
                    },
                    required: ["scene_description", "narrator_script"]
                }
            };

            // FIXED: Disable Search Tool to prevent API 401 Error
            const useSearch = false; // sources.includes('youtube');
            const result = await generateText(prompt, `Exactly ${count} scenes. Output in ${langName}.`, schema, [], useSearch);

            setScenes(result);
            setSceneGenerationActive(true);
            setScenesGeneratedCount(0);

            // Save to history for undo/redo
            saveToHistory('Generate Storyboard', createSnapshot());
        } catch (e) {
            setError(t.errorGeneric);
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------------------------------
    // GEMINI FEATURES (Existing Handlers kept for manual triggering if needed)
    // ----------------------------------------------------------------------

    const handleGeneratePitch = async () => {
        setShowPitchModal(true);
        if (pitchData) return;
        setLoading(true);
        setLoadingMsg(t.generatingPitch);
        const langName = 'English';
        const prompt = `Act as a professional Music Video Producer. Write a Pitch Packet Introduction for a Director's Treatment.
      Title: "${formData.title}"
      Concept: "${storyDetails.plot}"
      Style: "${storyDetails.style}"
      
      Structure:
      1. Logline
      2. Director's Vision Statement
      3. Visual Approach
      4. Target Audience Appeal
      
      Write in ${langName}. Format with Markdown headers.`;

        try {
            const result = await generateText(prompt, "Professional Producer.");
            setPitchData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleSyncLyrics = async () => {
        if (!formData.lyrics) { setError(t.missingLyrics); return; }
        setLoading(true);
        setLoadingMsg(t.lyricsSyncing);
        try {
            const langName = 'English';
            // Improved logic: Send scene contexts to get better lyric distribution
            const sceneSummaries = scenes.map((s, i) => `Scene ${i + 1}: ${s.scene_description}`).join('\n');

            const prompt = `
           You are a Music Video Editor.
           I have ${scenes.length} scenes and a set of lyrics.
           
           Task: Distribute the lyrics across the ${scenes.length} scenes intelligently.
           - Match the lyrical content/mood to the scene description if possible.
           - If a scene feels like an instrumental break (based on description like 'wide shot of landscape', 'dance break'), use "(Instrumental)".
           - Ensure the flow is logical.
           
           Scenes:
           ${sceneSummaries}
           
           Lyrics:
           ${formData.lyrics}
           
           Output: A JSON Array of strings (exactly ${scenes.length} items).
           Each item corresponds to the lyrics for that specific scene.
           Language: ${langName}
         `;

            const schema = { type: "ARRAY", items: { type: "STRING" } };
            const syncedLyrics = await generateText(prompt, "Sync Expert", schema);

            if (syncedLyrics && Array.isArray(syncedLyrics)) {
                // Handle length mismatch gracefully
                const normalizedLyrics = [...syncedLyrics];
                while (normalizedLyrics.length < scenes.length) normalizedLyrics.push("(Instrumental)");

                const updatedScenes = scenes.map((scene, i) => ({ ...scene, lyric_line: normalizedLyrics[i] || "" }));
                setScenes(updatedScenes);
                setLyricsSynced(true);
            } else { throw new Error("Mismatch"); }
        } catch (e) { console.error(e); setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // UPDATED: Interactive Costume Designer
    const handleGenerateCostumes = async () => {
        setShowCostumeModal(true);
        if (costumeData) return;
        setLoading(true);
        setLoadingMsg(t.generatingCostumes);
        const langName = 'English';

        const prompt = `
        As a Costume Designer, propose 3 DISTINCT costume directions for the characters in this music video.
        Plot: ${storyDetails.plot}
        Characters: ${storyDetails.characters.map(c => c.name).join(', ')}
        Style: ${storyDetails.style}
        
        Output JSON Array of objects with 'title' and 'description'.
        Language: ${langName}
      `;
        const schema = {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    title: { type: "STRING" },
                    description: { type: "STRING" }
                },
                required: ["title", "description"]
            }
        };

        try {
            const result = await generateText(prompt, "Fashion Designer", schema);
            setCostumeData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // UPDATED: Interactive Location Scout
    const handleLocationScout = async () => {
        setShowLocationScoutModal(true);
        if (locationScoutData) return;
        setLoading(true);
        setLoadingMsg(t.generatingLocations);
        const langName = 'English';

        const prompt = `
        As a Location Manager, propose 3 DISTINCT real-world location aesthetic directions for this video.
        Plot: ${storyDetails.plot}
        Current Locations: ${storyDetails.locations.map(l => l.name).join(', ')}
        Style: ${storyDetails.style}
        
        Output JSON Array of objects with 'title' and 'description'.
        Language: ${langName}
      `;
        const schema = {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    title: { type: "STRING" },
                    description: { type: "STRING" }
                },
                required: ["title", "description"]
            }
        };

        try {
            const result = await generateText(prompt, "Location Manager", schema);
            setLocationScoutData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // UPDATED: Interactive Colorist
    const handleGeneratePalette = async () => {
        setShowPaletteModal(true);
        if (paletteData) return;
        setLoading(true);
        setLoadingMsg(t.generatingPalette);
        const langName = 'English';

        const prompt = `
        As a Colorist, create 3 DISTINCT color grading palettes for this music video.
        Style: ${storyDetails.style}
        Plot: ${storyDetails.plot}
        
        Output JSON Array of objects with:
        - title (string)
        - description (string)
        - palette (array of 5 hex color strings)
        Language: ${langName}
      `;
        const schema = {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    title: { type: "STRING" },
                    description: { type: "STRING" },
                    palette: { type: "ARRAY", items: { type: "STRING" } }
                },
                required: ["title", "description", "palette"]
            }
        };

        try {
            const result = await generateText(prompt, "Colorist", schema);
            setPaletteData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const applyCostumeOption = (option) => {
        setStoryDetails(prev => ({
            ...prev,
            characters: prev.characters.map(c => ({
                ...c,
                description: `${c.description} (Costume: ${option.description})`
            }))
        }));
        setShowCostumeModal(false);
        // Optional: Regenerate character images automatically? For now, let user choose to regenerate.
        setElementImages(prev => {
            // Clear character images to force regeneration if user wants
            const newImages = { ...prev };
            storyDetails.characters.forEach(c => delete newImages[`char-${c.name}`]);
            return newImages;
        });
        alert(t.costumeApplied);
    };

    const applyLocationOption = (option) => {
        setStoryDetails(prev => ({
            ...prev,
            style: `${prev.style}. Location Aesthetic: ${option.title} - ${option.description}`
        }));
        setShowLocationScoutModal(false);
        alert(t.locationApplied);
    };

    const applyPaletteOption = (option) => {
        setStoryDetails(prev => ({
            ...prev,
            style: `${prev.style}. Color Palette: ${option.title} (${option.description})`
        }));
        setShowPaletteModal(false);
        alert(t.colorApplied);
    };

    // ----------------------------------------------------------------------
    // NEW GEMINI POWERED FEATURES
    // ----------------------------------------------------------------------

    const handleMarketingCampaign = async () => {
        setShowMarketingModal(true);
        if (marketingData) return;
        setLoading(true);
        setLoadingMsg(t.generatingCampaign);
        try {
            const langName = 'English';
            const prompt = `
        Act as a Music Marketing Executive. Create a Viral Launch Campaign for this music video.
        Song: "${formData.title}"
        Concept: "${storyDetails.plot}"
        Visuals: "${storyDetails.style}"
        
        Deliverables:
        1. 3 Specific TikTok/Reels Trends/Challenges based on the video content.
        2. A PR Angle/Hook for press releases.
        3. A 2-Week "Hype" Countdown Schedule (social media posts per day).
        
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Marketing Exec");
            setMarketingData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleGenerateProps = async () => {
        setShowPropModal(true);
        if (propData) return;
        setLoading(true);
        setLoadingMsg(t.generatingProps);
        try {
            const langName = 'English';
            const prompt = `
        Act as a Prop Master. Analyze these scenes and list every specific prop required.
        Scenes: ${scenes.map((s, i) => `[Scene ${i + 1}: ${s.scene_description}]`).join('\n')}
        
        Group the props by Scene Number.
        Also create a "Master Shopping List" at the end.
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Prop Master");
            setPropData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleGenerateEasterEggs = async () => {
        setShowEasterEggModal(true);
        if (easterEggData) return;
        setLoading(true);
        setLoadingMsg(t.generatingEasterEggs);
        try {
            const langName = 'English';
            const prompt = `
        Act as a Creative Director. Suggest 5-10 clever "Easter Eggs" or hidden details to hide in this music video for fans to find.
        Concept: ${storyDetails.plot}
        Lyrics: ${formData.lyrics.substring(0, 200)}...
        
        Ideas should be visual details, hidden messages, or references to the artist's legacy.
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Creative Director");
            setEasterEggData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleCastingDirector = async () => {
        setShowCastingModal(true);
        if (castingData && typeof castingData === 'string') return;
        setLoading(true);
        setLoadingMsg(t.generatingCasting);
        try {
            const langName = 'English';
            const prompt = `
        Act as a Casting Director. Write a Casting Call Sheet for the characters in this video.
        Characters: ${storyDetails.characters.map((c) => `${c.name}: ${c.description}`).join('\n')}
        
        Include:
        - Character Name
        - Age Range
        - Physical Description
        - Personality/Vibe required for the role
        - Specific Skills needed (e.g. "Must be able to cry on cue", "Skateboard skills")
        
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Casting Director");
            setCastingData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleChoreographer = async () => {
        setShowChoreographyModal(true);
        if (choreographyData) return;
        setLoading(true);
        setLoadingMsg(t.generatingChoreography);
        try {
            const langName = 'English';
            const prompt = `
        Act as a Choreographer / Movement Coach.
        Song: "${formData.title}"
        Style: "${storyDetails.style}"
        
        Design a movement guide for the video.
        If it's a dance video, describe the choreography style (e.g. "Sharp Hip Hop", "Contemporary Fluid").
        If narrative, describe the "Blocking" and body language (e.g. "Characters should move sluggishly to represent depression").
        
        Provide specific movement cues for key scenes.
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Choreographer");
            setChoreographyData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleGenerateSchedule = async () => {
        setShowScheduleModal(true);
        if (scheduleData) return;
        setLoading(true);
        setLoadingMsg(t.generatingSchedule);
        try {
            const langName = 'English';
            const prompt = `
        Act as a 1st AD (Assistant Director). Create an Optimized Shooting Schedule.
        Analyze the locations in the scenes: ${storyDetails.locations.map((l) => l.name).join(', ')}
        Scenes: ${scenes.length} total.
        
        Group scenes by Location to minimize company moves.
        Estimate days needed (assume 10-12 scenes per day).
        Create a Day-by-Day plan (Day 1, Day 2, etc.).
        
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "1st AD");
            setScheduleData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleGenerateSafety = async () => {
        setShowSafetyModal(true);
        if (safetyData) return;
        setLoading(true);
        setLoadingMsg(t.generatingSafety);
        try {
            const langName = 'English';
            const prompt = `
        Act as a Safety Officer. Analyze this music video script for potential hazards.
        Plot: ${storyDetails.plot}
        Scenes Summary: ${scenes.map(s => s.scene_description).join(' ')}
        
        Identify risks such as:
        - Stunts
        - Pyrotechnics
        - Water scenes
        - Vehicles
        - Crowds
        
        Provide a Risk Assessment Report with mitigation strategies for each.
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Safety Officer");
            setSafetyData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleGenerateShotList = async () => {
        setShowShotListModal(true);
        if (shotListData) return;
        setLoading(true);
        setLoadingMsg(t.generatingShotList);
        try {
            const langName = 'English';
            const prompt = `
        Act as a Director of Photography. Convert this storyboard into a Technical Shot List.
        
        TITLE: "${formData.title}"
        STYLE: "${storyDetails.style}"
        SCENE COUNT: ${scenes.length}
        
        Analyze EACH scene and provide a detailed technical breakdown:
        
        ${scenes.map((s, i) =>
                `SCENE ${i + 1}: 
          Description: ${s.scene_description}
          Characters: ${s.characters_in_scene ? s.characters_in_scene.join(', ') : 'None'}
          Setting: ${s.setting?.location || 'Not specified'}
          Mood: ${s.cinematography?.mood || 'Not specified'}`
            ).join('\n\n')}
        
        For EACH scene, provide:
        1. PRIMARY SHOT (Main camera setup for the scene)
        2. ALTERNATE ANGLES (2-3 alternative shots for coverage)
        3. TECHNICAL SPECS (Lens, Camera, ISO, Shutter Speed suggestions)
        4. COMPOSITION NOTES (Framing, Rule of Thirds, Negative Space)
        5. MOVEMENT (Camera movement, if any)
        6. SPECIAL EQUIPMENT NEEDED (Dolly, Crane, Gimbal, Drone, etc.)
        
        Format as a structured, professional shot list that can be given to a camera crew.
        Include a summary at the end with equipment checklist.
        
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Professional Director of Photography");
            setShotListData(result);
        } catch (e) {
            console.error("Shot List Generation Error:", e);
            setError(t.errorGeneric);
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------------------------------
    // NEWEST CREATIVE FEATURES
    // ----------------------------------------------------------------------

    const handleVFXSupervisor = async () => {
        setShowVFXModal(true);
        if (vfxData) return;
        setLoading(true);
        setLoadingMsg(t.generatingVFX);
        try {
            const langName = 'English';
            const prompt = `
        Act as a VFX Supervisor. Analyze the scenes in this music video script.
        Identify which shots require Visual Effects (Green screen, CGI, Rotoscoping, Wire removal, Particle effects).
        Also identify shots that should be done PRACTICALLY (on set).
        
        Generate a "VFX Breakdown" list.
        For each major VFX shot, estimate complexity (Low/Med/High).
        
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "VFX Supervisor");
            setVfxData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleSoundDesigner = async () => {
        setShowSoundModal(true);
        if (soundData) return;
        setLoading(true);
        setLoadingMsg(t.generatingSound);
        try {
            const langName = 'English';
            const prompt = `
        Act as a Sound Designer. Create a sound map for this video.
        Focus on:
        1. Ambient Sounds / Atmos for locations (e.g. City traffic, Forest wind).
        2. Specific Foley effects (e.g. Footsteps on gravel, Glass breaking).
        3. Stylized Sound FX (e.g. Whooshes, Glitch noises, Reverse cymbals) to match the music beat.
        
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Sound Designer");
            setSoundData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleDirectorCritique = async () => {
        setShowCritiqueModal(true);
        if (critiqueData) return;
        setLoading(true);
        setLoadingMsg(t.generatingCritique);
        try {
            const langName = 'English';
            const prompt = `
        Act as a Critical Creative Director / Studio Executive.
        Read this music video treatment and storyboard.
        
        Provide "Studio Notes" or Feedback:
        1. Does the visual arc match the song intensity?
        2. Are the characters consistent?
        3. Is the pacing too slow or fast?
        4. Suggest 3 specific creative improvements to make it more "viral" or cinematic.
        
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Creative Director");
            setCritiqueData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // ----------------------------------------------------------------------
    // BRAND NEW FEATURES: Album Art & Grant Writer
    // ----------------------------------------------------------------------

    const handleGenerateAlbumArt = async () => {
        setShowAlbumModal(true);
        if (albumCover) return;
        setLoading(true);
        setLoadingMsg(t.generatingAlbum);
        try {
            const langName = 'English';

            // 1. Generate Prompt using Text LLM
            const promptGen = `
        Act as an Art Director. Create a high-quality Text-to-Image prompt for the Single/Album Cover of this song.
        Song: "${formData.title}"
        Mood/Style: "${storyDetails.style}"
        Key Elements: Abstract, Artistic, High Resolution.
        
        Output only the prompt text in English.
      `;
            const generatedPrompt = await generateText(promptGen, "Art Director");

            // 2. Generate Image using Vision Model - Added midjourney style
            const img = await generateImageRobust(`${generatedPrompt}, midjourney style, album cover art, typography, 4k, high detail, square aspect ratio`);

            setAlbumCover({ image: img, prompt: generatedPrompt });
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleGenerateBeatSheet = async () => {
        setShowBeatSheetModal(true);
        if (beatSheetData) return;
        setLoading(true);
        setLoadingMsg(t.generatingBeats);
        try {
            const langName = 'English';
            const prompt = `
        Act as a Screenwriter. Analyze the story plot and break it down into a standard Narrative Beat Sheet.
        Plot: "${storyDetails.plot}"
        
        Structure (Save the Cat style):
        1. Opening Image
        2. Inciting Incident
        3. Break into Two
        4. Midpoint
        5. All Is Lost
        6. Climax
        7. Final Image
        
        Provide a short description for each beat based on the generated story.
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Screenwriter");
            setBeatSheetData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleGenerateCharacterArc = async () => {
        setShowCharacterArcModal(true);
        if (characterArcData) return;
        setLoading(true);
        setLoadingMsg(t.generatingArcs);
        try {
            const langName = 'English';
            const prompt = `
        Act as a Narrative Designer. Analyze the characters in this video and map their Emotional Journey.
        Characters: ${storyDetails.characters.map(c => c.name).join(', ')}
        Plot: "${storyDetails.plot}"
        
        For each main character:
        1. Starting State (Emotion/Status)
        2. The Shift (What changes them?)
        3. Ending State (Resolution)
        
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Narrative Designer");
            setCharacterArcData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // ----------------------------------------------------------------------
    // EXTRA FEATURES: Legal
    // ----------------------------------------------------------------------

    const handleGenerateLegal = async () => {
        setShowLegalModal(true);
        if (legalData) return;
        setLoading(true);
        setLoadingMsg(t.generatingLegal);
        try {
            const langName = 'English';
            const prompt = `
            Act as a Production Legal Assistant.
            Draft the following documents for this shoot:
            1. A standard "Talent Release Form" template.
            2. A standard "Location Release Form" template.
            
            Keep them simple but legally sound for an independent production.
            Output in ${langName}.
        `;
            const result = await generateText(prompt, "Legal Assistant");
            setLegalData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // ----------------------------------------------------------------------
    // NEW GEMINI INTEGRATIONS
    // ----------------------------------------------------------------------

    const handleGenerateBudget = async () => {
        setShowBudgetModal(true);
        if (budgetData) return;
        setLoading(true);
        setLoadingMsg(t.generatingBudget);
        try {
            const langName = 'English';
            const prompt = `
        Act as a Line Producer. Analyze this music video project and estimate a production budget.
        
        Project: "${formData.title}"
        Type: "${formData.projectType}"
        Scenes: ${scenes.length}
        Characters: ${storyDetails.characters.length}
        Locations: ${storyDetails.locations.length}
        VFX Needs: ${vfxData ? "Yes" : "Unknown"}
        
        Provide a detailed Budget Breakdown for two tiers:
        1. "Indie/Low Budget" (Guerrilla style)
        2. "Professional Label Budget"
        
        Categories to estimate:
        - Talent & Casting
        - Crew (Director, DP, Gaffer, etc.)
        - Equipment (Camera, Lights)
        - Locations & Permits
        - Art Dept (Props, Costumes)
        - Post-Production (Editing, Color, VFX)
        
        Output in ${langName}. Format as a clear report.
      `;
            const result = await generateText(prompt, "Line Producer");
            setBudgetData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // AI Scene Transition Suggestions
    const [transitionData, setTransitionData] = useState(null);
    const [showTransitionModal, setShowTransitionModal] = useState(false);

    const handleGenerateTransitions = async () => {
        setShowTransitionModal(true);
        if (transitionData) return;
        setLoading(true);
        setLoadingMsg("Analyzing scene transitions...");
        try {
            const langName = 'English';
            const sceneDescriptions = scenes.map((s, i) => `Scene ${i + 1}: ${s.action || s.description}`).join('\n');
            const prompt = `
        Act as a Film Editor / Transition Specialist.
        Analyze these consecutive scenes and suggest professional transition types between each pair.

        Project: "${formData.title}"
        Type: "${formData.projectType}"
        Style: "${storyDetails?.style || 'Cinematic'}"

        SCENES:
        ${sceneDescriptions}

        For EACH scene transition (Scene 1→2, 2→3, etc.), provide:
        1. **Recommended Transition Type**: (Cut, Dissolve, Fade, Wipe, Match Cut, Jump Cut, L-Cut, J-Cut, Whip Pan, Iris, etc.)
        2. **Rationale**: Why this transition works for these scenes
        3. **Timing**: Suggested duration (e.g., "0.5s hard cut", "1.5s slow dissolve")
        4. **Alternative**: A second option if the primary doesn't work

        Consider:
        - Emotional flow between scenes
        - Tempo and pacing
        - Visual continuity (color, composition)
        - Music beat sync opportunities

        Output in ${langName}. Format clearly by scene pair.
      `;
            const result = await generateText(prompt, "Film Editor");
            setTransitionData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleLyricAssist = async () => {
        setShowLyricsModal(true);
        if (lyricsData) return;
        setLoading(true);
        setLoadingMsg(t.generatingLyrics);
        try {
            const langName = 'English';
            const prompt = `
        Act as a Songwriter / Ghostwriter.
        Write lyrics for a song titled "${formData.title}".
        Mood/Style: "${storyDetails.style}"
        Theme: "${storyDetails.plot}"
        Existing Snippet: "${formData.lyrics.substring(0, 100)}..."
        
        Task:
        1. Complete the lyrics (Verse 1, Chorus, Verse 2, Bridge, Outro).
        2. Suggest 3 catchy "Hooks" or alternative Chorus options.
        
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Songwriter");
            setLyricsData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleGenerateEndings = async () => {
        setShowEndingsModal(true);
        if (endingsData) return;
        setLoading(true);
        setLoadingMsg(t.generatingEndings);
        try {
            const langName = 'English';
            const prompt = `
        Act as a Screenwriter.
        Based on the current plot: "${storyDetails.plot}"
        
        Generate 3 Alternative Endings for this music video:
        1. The "Twist" Ending (Surprise the audience)
        2. The "Open-Ended" Ending (Artistic, ambiguous)
        3. The "Cyclical" Ending (Loops back to the start)
        
        Describe the final scene for each option.
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Screenwriter");
            setEndingsData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleGenerateMerch = async () => {
        setShowMerchModal(true);
        if (merchData) return;
        setLoading(true);
        setLoadingMsg(t.generatingMerch);
        try {
            // 1. Text Generation
            const prompt = `
        Act as a Music Merchandise Designer.
        Artist/Song: "${formData.title}"
        Aesthetic: "${storyDetails.style}"
        
        Suggest 3 unique merchandise items (e.g. T-shirt, Hoodie, Accessory) that fit this video's vibe.
        For each, provide a 'name', 'description', and estimated 'price'.
        Also provide a short 'strategy' on how to sell them.
        
        Output JSON object with keys: items (array), strategy (string).
      `;
            const schema = {
                type: "OBJECT",
                properties: {
                    items: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, description: { type: "STRING" }, price: { type: "STRING" } }, required: ["name", "description"] } },
                    strategy: { type: "STRING" }
                },
                required: ["items", "strategy"]
            };
            const result = await generateText(prompt, "Merch Designer", schema);

            // 2. Visual Generation (for the first item)
            const firstItem = result.items[0];
            const imagePrompt = `Professional product photography of music merchandise: ${firstItem.name}. ${firstItem.description}. Style: ${storyDetails.style}. High quality, studio lighting, isolated on neutral background.`;
            const img = await generateImageRobust(imagePrompt, [], "1:1");

            setMerchData({ ...result, visualImage: img });
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleGenerateGrant = async () => {
        setShowGrantModal(true);
        if (grantData) return;
        setLoading(true);
        setLoadingMsg(t.generatingGrant);
        try {
            const langName = 'English';
            const prompt = `
            Act as a Professional Grant Writer for Arts & Culture.
            Write a formal Grant Application for this music video project.
            
            Project Title: "${formData.title}"
            Concept: "${storyDetails.plot}"
            Cultural Significance: Explain why this specific visual story matters.
            
            Structure:
            1. Project Summary
            2. Artistic Statement
            3. Impact & Audience
            4. Timeline Overview
            
            Tone: Formal, persuasive, academic.
            Output in ${langName}.
        `;
            const result = await generateText(prompt, "Grant Writer");
            setGrantData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleGenerateFanTheories = async () => {
        setShowFanTheoryModal(true);
        if (fanTheoryData) return;
        setLoading(true);
        setLoadingMsg(t.generatingTheories);
        try {
            const langName = 'English';
            const prompt = `
        Act as a die-hard music fan and internet sleuth.
        Analyze this music video plot and visual style deepy.
        
        Plot: "${storyDetails.plot}"
        Visual Style: "${storyDetails.style}"
        
        Create 3 Creative "Fan Theories" about the hidden meaning, lore, or timeline of this video.
        - Look for symbolic connections.
        - Connect it to a larger "Cinematic Universe".
        - Use internet slang/tone (Reddit/Twitter style).
        
        Output in ${langName}. Format as a structured forum post list.
      `;
            const result = await generateText(prompt, "Superfan");
            setFanTheoryData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleGenerateCanvas = async () => {
        setShowCanvasModal(true);
        if (canvasData) return;
        setLoading(true);
        setLoadingMsg(t.generatingCanvas);
        try {
            const langName = 'English';
            const prompt = `
        Act as a Motion Graphics Designer for Spotify.
        Create 3 concepts for a 'Spotify Canvas' (3-8 second vertical looping video) for this song.
        
        Song Title: "${formData.title}"
        Aesthetic: "${storyDetails.style}"
        Plot Reference: "${storyDetails.plot}"
        
        For each concept:
        1. Visual Description (Must be a perfect loop)
        2. Vibe/Mood
        3. Technical execution note (e.g. "Seamless cross-dissolve", "Cinemagraph style")
        
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Motion Designer");
            setCanvasData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleGenerateDistribution = async () => {
        setShowDistributionModal(true);
        if (distributionData) return;
        setLoading(true);
        setLoadingMsg(t.generatingDistribution);
        try {
            const langName = 'English';
            const prompt = `
        Act as a Music Distributor. Create a comprehensive Release Strategy for this music video.
        Title: "${formData.title}"
        Genre/Style: "${storyDetails.style}"
        
        Provide:
        1. Platform Strategy (YouTube Premiere vs. Vevo vs. Instagram Exclusive)
        2. A "Teaser Schedule" (What to post 1 week before, 1 day before)
        3. Cross-promotion ideas with influencers or brands suitable for this aesthetic.
        
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Distributor");
            setDistributionData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleGeneratePressRelease = async () => {
        setShowPressModal(true);
        if (pressData) return;
        setLoading(true);
        setLoadingMsg(t.generatingPress);
        try {
            const langName = 'English';
            const prompt = `
        Act as a Music Publicist. Write an Official Press Release for this music video launch.
        
        Headline: Catchy headline incorporating "${formData.title}".
        Dateline: [City, Date]
        Body: Announce the release. Describe the video's concept: "${storyDetails.plot}". Mention the unique visual style: "${storyDetails.style}".
        Quotes: Invent a quote from the Director about the vision.
        Call to Action: Where to watch.
        
        Format as professional press release style. Output in ${langName}.
      `;
            const result = await generateText(prompt, "Publicist");
            setPressData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleGenerateSocial = async () => {
        setShowSocialModal(true);
        if (socialData) return;
        setLoading(true);
        setLoadingMsg(t.generatingSocial);
        try {
            const langName = 'English';
            const prompt = `
        Act as a Social Media Manager. Write 5 engaging captions for this music video release.
        Song: "${formData.title}"
        Plot: "${storyDetails.plot}"
        
        Platforms: Instagram, TikTok, YouTube Shorts.
        Include hashtags and call-to-actions.
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Social Media Manager");
            setSocialData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleGenerateEmail = async () => {
        setShowEmailModal(true);
        if (emailData) return;
        setLoading(true);
        setLoadingMsg(t.generatingEmail);
        try {
            const langName = 'English';
            const prompt = `
        Act as the Artist's Manager. Write a professional email pitching this music video concept to a Record Label Executive.
        
        Subject Line: Catchy and professional.
        Body: 
        - Hook them with the concept: "${storyDetails.plot}"
        - Mention the visual style: "${storyDetails.style}"
        - Explain why it will be a hit.
        
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Artist Manager");
            setEmailData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleGenerateMoodboard = async () => {
        setShowMoodboardModal(true);
        if (moodboardData) return;
        setLoading(true);
        setLoadingMsg(t.generatingMoodboard);
        try {
            // 1. Text Generation
            const prompt = `
        Act as an Art Director. Describe a 3x3 Grid Moodboard for this video style: "${storyDetails.style}".
        Provide a title and a description of the color palette.
        Output JSON object with keys: title (string), palette_description (string).
      `;
            const schema = {
                type: "OBJECT",
                properties: {
                    title: { type: "STRING" },
                    palette_description: { type: "STRING" }
                },
                required: ["title", "palette_description"]
            };
            const result = await generateText(prompt, "Art Director", schema);

            // 2. Visual Generation
            const imagePrompt = `A 3x3 grid moodboard collage for a music video. Style: ${storyDetails.style}. High resolution, cinematic composition, color palette reference.`;
            const img = await generateImageRobust(imagePrompt, [], "1:1");

            setMoodboardData({ ...result, visualImage: img });
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // ----------------------------------------------------------------------
    // BATCH 3 HANDLERS
    // ----------------------------------------------------------------------

    const handleGenerateCrowdfunding = async () => {
        setShowCrowdModal(true);
        if (crowdData) return;
        setLoading(true);
        setLoadingMsg(t.generatingCrowd);
        try {
            const langName = 'English';
            const prompt = `
        Act as a Crowdfunding Expert. Write a Kickstarter/Indiegogo Campaign Pitch for this music video.
        Project: "${formData.title}"
        Story: "${storyDetails.plot}"
        Budget Tier: ${budgetData ? "Based on estimated budget" : "Independent"}
        
        Structure:
        1. "The Hook" (Why this project matters)
        2. "The Story" (Brief plot summary)
        3. "Risks & Challenges"
        4. 3 Unique Reward Tiers (e.g. $25 Digital Download, $100 Prop from Set, $500 Executive Producer Credit)
        
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Crowdfunding Expert");
            setCrowdData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleGenerateCallSheet = async () => {
        setShowCallSheetModal(true);
        if (callSheetData) return;
        setLoading(true);
        setLoadingMsg(t.generatingCallSheet);
        try {
            const langName = 'English';
            const prompt = `
        Act as a 2nd Assistant Director. Generate a "Day 1 Call Sheet" for this shoot.
        Scenes to shoot: Scenes 1-${Math.min(scenes.length, 5)}.
        Location: ${storyDetails.locations[0]?.name || "Main Location"}
        
        Include:
        - Call Time (e.g. 06:00 AM)
        - Weather Forecast (Invent plausible weather)
        - Nearest Hospital (Invent a plausible name)
        - Schedule (Breakfast, First Shot, Lunch, Wrap)
        - Cast List with Call Times
        
        Output in ${langName}. Format as a structured document.
      `;
            const result = await generateText(prompt, "2nd AD");
            setCallSheetData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleCheckContinuity = async () => {
        setShowContinuityModal(true);
        if (continuityData) return;
        setLoading(true);
        setLoadingMsg(t.checkingContinuity);
        try {
            const langName = 'English';
            const sceneText = scenes.map((s, i) => `Scene ${i + 1}: ${s.scene_description} (${s.setting?.location})`).join('\n');
            const prompt = `
        Act as a Script Supervisor. Analyze these scenes for logical Continuity Errors.
        
        Script:
        ${sceneText}
        
        Look for:
        1. Time of day jumps (Day to Night without transition).
        2. Location logic (Teleporting characters).
        3. Costume/Prop inconsistencies (if mentioned).
        
        If clean, say "Continuity looks good."
        If errors found, list them with Scene Numbers.
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Script Supervisor");
            setContinuityData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleFocusGroup = async () => {
        setShowFocusGroupModal(true);
        if (focusGroupData) return;
        setLoading(true);
        setLoadingMsg(t.generatingFocus);
        try {
            const langName = 'English';
            const prompt = `
        Act as a Moderator for a Focus Group. Simulate reactions to this music video concept from 5 distinct personas:
        1. The Gen Z Teen (Trend-focused)
        2. The Music Critic (Analytical/Snobbish)
        3. The Die-hard Stan (Over-enthusiastic)
        4. The Casual Listener (Easily bored)
        5. The Parent (Concerned/Confused)
        
        Video Plot: "${storyDetails.plot}"
        Visual Style: "${storyDetails.style}"
        
        Provide their "Raw Comments" and a final "Consensus Rating" (1-10).
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Focus Group Moderator");
            setFocusGroupData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    const handleSequelPitch = async () => {
        setShowSequelModal(true);
        if (sequelData) return;
        setLoading(true);
        setLoadingMsg(t.generatingSequel);
        try {
            const langName = 'English';
            const prompt = `
        Act as a Creative Director. Pitch 3 concepts for a SEQUEL or PREQUEL to this music video.
        
        Current Video: "${formData.title}"
        Plot: "${storyDetails.plot}"
        
        Generate:
        1. Direct Sequel (What happens next?)
        2. Prequel (Origin Story)
        3. Thematic Spiritual Successor (Same vibe, new story)
        
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Creative Director");
            setSequelData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };


    // ----------------------------------------------------------------------
    // ADVANCED AI FEATURES HANDLERS
    // ----------------------------------------------------------------------

    // --- FACE CONSISTENCY / AI ACTOR MODE ---
    const handleLockFace = (imageData) => {
        setLockedFaceImage(imageData);
        setFaceConsistencyMode(true);
        // Update protagonist to have locked face flag
        if (storyDetails?.characters?.[0]) {
            setStoryDetails(prev => ({
                ...prev,
                characters: prev.characters.map((c, i) =>
                    i === 0 ? { ...c, lockedFace: true } : c
                )
            }));
        }
    };

    const handleUnlockFace = () => {
        setLockedFaceImage(null);
        setFaceConsistencyMode(false);
        if (storyDetails?.characters?.[0]) {
            setStoryDetails(prev => ({
                ...prev,
                characters: prev.characters.map((c, i) =>
                    i === 0 ? { ...c, lockedFace: false } : c
                )
            }));
        }
    };

    // --- BEAT-SYNC VISUAL GENERATOR ---
    const handleAnalyzeBPM = async (audioFile) => {
        setLoading(true);
        setLoadingMsg("Analyzing audio rhythm and BPM...");
        try {
            const reader = new FileReader();
            const filePromise = new Promise((resolve, reject) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
            });
            reader.readAsDataURL(audioFile);
            const base64Data = await filePromise;

            const prompt = `
                Analyze this audio file deeply.
                
                TASK:
                1. Detect the BPM (Beats Per Minute) - estimate if exact detection not possible
                2. Identify the song structure (Intro, Verse, Chorus, Bridge, Outro)
                3. Find "drop" moments or high-energy peaks
                4. Suggest optimal cut points for a music video (timestamp in seconds)
                
                OUTPUT JSON:
                {
                    "bpm": number,
                    "genre": string,
                    "energy_level": "low" | "medium" | "high",
                    "structure": [{ "section": string, "start_seconds": number, "end_seconds": number }],
                    "peak_moments": [number],
                    "suggested_cuts": [number]
                }
            `;

            const schema = {
                type: "OBJECT",
                properties: {
                    bpm: { type: "NUMBER" },
                    genre: { type: "STRING" },
                    energy_level: { type: "STRING", enum: ["low", "medium", "high"] },
                    structure: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                section: { type: "STRING" },
                                start_seconds: { type: "NUMBER" },
                                end_seconds: { type: "NUMBER" }
                            }
                        }
                    },
                    peak_moments: { type: "ARRAY", items: { type: "NUMBER" } },
                    suggested_cuts: { type: "ARRAY", items: { type: "NUMBER" } }
                },
                required: ["bpm", "genre", "energy_level", "structure", "suggested_cuts"]
            };

            const result = await generateText(prompt, "Music Analyst", schema, [{ data: base64Data, mimeType: audioFile.type }]);

            setAnalyzedBPM(result.bpm);
            setBeatSyncData(result);
            setBeatMarkers(result.suggested_cuts || []);

        } catch (e) {
            console.error("BPM Analysis Error:", e);
            setError("Audio analysis failed. Please try a different file.");
        } finally { setLoading(false); }
    };

    const handleApplyBeatSync = (beatData) => {
        // Use selected duration from modal, or fallback to BPM-based calculation
        const selectedDuration = beatData.selectedDuration || Math.round(60 / beatData.bpm * 4);
        setSceneDuration(selectedDuration);

        // Store beat data for future reference (includes cutStyle)
        setBeatSyncData(beatData);
        setShowBeatSyncModal(false);

        // Show success toast instead of alert
        showToast(
            `Beat-Sync Applied! ${beatData.bpm} BPM → ${selectedDuration}s frames (${beatData.cutStyle || 'on-beat'} cuts)`,
            'success',
            4000
        );
    };

    // --- REAL-TIME STYLE TRANSFER ---
    const handleStyleTransferPreview = async (sceneIndex, stylePreset) => {
        if (!sceneImages[sceneIndex] || !stylePreset) return;

        setStyleTransferLoading(true);
        try {
            const originalImage = sceneImages[sceneIndex];
            const scene = scenes[sceneIndex];

            const intensityDesc = styleIntensity > 80 ? 'completely transform to' :
                styleIntensity > 50 ? 'strongly blend with' : 'subtly hint at';

            const prompt = `
                Transform this image to ${intensityDesc} the ${stylePreset.name} visual style.
                
                Style Description: ${stylePreset.description}
                Original Scene Context: ${scene.scene_description}
                
                Style Intensity: ${styleIntensity}%
                
                IMPORTANT:
                - Keep the core composition and subject matter
                - Apply the distinctive aesthetic of ${stylePreset.name}
                - Maintain recognizable elements from the original
                
                Quality: Ultra-high resolution, cinematic, 8K, masterpiece.
            `;

            const styledImage = await generateImageRobust(
                prompt,
                [{ data: originalImage, mimeType: "image/png" }],
                "16:9"
            );

            setStyleTransferPreview({
                original: originalImage,
                styled: styledImage,
                preset: stylePreset,
                sceneIndex
            });

        } catch (e) {
            console.error("Style Transfer Error:", e);
            setError("Style transfer failed. Please try again.");
        } finally { setStyleTransferLoading(false); }
    };

    const handleApplyStyleTransfer = (sceneIndex, styledImage) => {
        setSceneImages(prev => ({ ...prev, [sceneIndex]: styledImage }));
        setStyleTransferPreview(null);
        setShowStyleTransferModal(false);
    };

    // --- FAN REACTION PREDICTOR ---
    const handleFanReactionPredictor = async () => {
        setShowFanReactionModal(true);
        if (fanReactionData) return;
        setLoading(true);
        setLoadingMsg("🔮 Analyzing audience reactions...");
        try {
            const langName = 'English';
            const sceneDescriptions = scenes.map((s, i) => ({
                scene: i + 1,
                description: s.scene_description,
                action: s.narrator_script,
                lyric: s.lyric_line || null
            }));

            const prompt = `
        Act as a Social Media Analyst and Viral Content Expert.
        Analyze this music video storyboard and predict audience reactions for EACH scene.
        
        Project: "${formData.title}"
        Type: "${formData.projectType}"
        Style: "${storyDetails?.style}"
        Plot: "${storyDetails?.plot}"
        
        SCENES DATA:
        ${JSON.stringify(sceneDescriptions, null, 2)}
        
        For EACH scene, provide:
        1. **Engagement Score** (1-100): How likely viewers will engage (like, comment, share)
        2. **Viral Potential**: "🔥 VIRAL", "⭐ HIGH", "👍 MEDIUM", or "😐 LOW"
        3. **Predicted Reactions**: Array of likely fan comments/reactions
        4. **Warning Flags**: Any potential issues (confusing, offensive, boring, etc.)
        5. **Improvement Tips**: How to boost engagement
        
        Also provide:
        - **Overall Video Engagement Score** (1-100)
        - **Most Viral Scene**: Which scene has highest viral potential
        - **Weakest Scene**: Which scene needs improvement
        - **Platform Predictions**: Expected performance on TikTok, YouTube, Instagram
        
        OUTPUT JSON with this structure. Output in ${langName}.
      `;

            const schema = {
                type: "OBJECT",
                properties: {
                    overall_score: { type: "NUMBER" },
                    most_viral_scene: { type: "NUMBER" },
                    weakest_scene: { type: "NUMBER" },
                    platform_predictions: {
                        type: "OBJECT",
                        properties: {
                            tiktok: { type: "STRING" },
                            youtube: { type: "STRING" },
                            instagram: { type: "STRING" }
                        }
                    },
                    scenes: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                scene_number: { type: "NUMBER" },
                                engagement_score: { type: "NUMBER" },
                                viral_potential: { type: "STRING" },
                                predicted_reactions: { type: "ARRAY", items: { type: "STRING" } },
                                warning_flags: { type: "ARRAY", items: { type: "STRING" } },
                                improvement_tips: { type: "STRING" }
                            }
                        }
                    }
                },
                required: ["overall_score", "most_viral_scene", "weakest_scene", "scenes"]
            };

            const result = await generateText(prompt, "Social Media Analyst", schema);
            setFanReactionData(result);
        } catch (e) {
            console.error("Fan Reaction Error:", e);
            setError(t.errorGeneric);
        } finally { setLoading(false); }
    };

    // ============================================================================
    // NEW CREATIVE FEATURES BUNDLE - HANDLERS
    // ============================================================================

    // --- 1. AI EMOTION TIMELINE ---
    const handleEmotionTimeline = async () => {
        setShowEmotionTimelineModal(true);
        if (emotionTimelineData) return;
        setLoading(true);
        setLoadingMsg("🎭 Analyzing emotional journey...");
        try {
            const prompt = `
        Act as an Emotion Analyst for ${formData.projectType} production.
        
        PROJECT: "${formData.title}"
        LYRICS: "${formData.lyrics.substring(0, 1000)}"
        PLOT: "${storyDetails?.plot}"
        STYLE: "${storyDetails?.style}"
        SCENES: ${scenes.length}
        
        Create an EMOTION TIMELINE for this project:
        
        For each scene (${scenes.length} total), analyze:
        1. **Primary Emotion**: (joy, sadness, anger, fear, love, nostalgia, hope, despair, excitement, calm)
        2. **Emotion Intensity**: 1-100 scale
        3. **Color Mood**: Suggested color palette for this emotion
        4. **Face Expression**: If character visible, what expression should they have
        5. **Camera Energy**: Should camera be static, slow, or dynamic
        
        Also provide:
        - **Emotional Arc Type**: (Rise, Fall, Rollercoaster, Flat, Peak-Valley)
        - **Peak Emotion Moment**: Which scene has highest intensity
        - **Emotional Contrast Points**: Where emotions shift dramatically
        - **Recommended Color Grading**: Overall mood grading suggestion
        
        OUTPUT JSON format.
      `;
            const schema = {
                type: "OBJECT",
                properties: {
                    arc_type: { type: "STRING" },
                    peak_scene: { type: "NUMBER" },
                    color_grading: { type: "STRING" },
                    contrast_points: { type: "ARRAY", items: { type: "NUMBER" } },
                    scenes: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                scene_number: { type: "NUMBER" },
                                primary_emotion: { type: "STRING" },
                                intensity: { type: "NUMBER" },
                                color_mood: { type: "STRING" },
                                face_expression: { type: "STRING" },
                                camera_energy: { type: "STRING" }
                            }
                        }
                    }
                }
            };
            const result = await generateText(prompt, "Emotion Analyst", schema);
            setEmotionTimelineData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // --- 2. CINEMATIC PARALLAX GENERATOR ---
    const handleParallaxGenerator = async (sceneIndex) => {
        setShowParallaxModal(true);
        setLoading(true);
        setLoadingMsg("🎬 Generating 2.5D parallax layers...");
        try {
            const scene = scenes[sceneIndex] || scenes[0];
            const prompt = `
        Act as a Motion Graphics Expert specializing in 2.5D parallax effects.
        
        SCENE: "${scene.scene_description}"
        STYLE: "${storyDetails?.style}"
        
        Create a PARALLAX LAYER SEPARATION plan:
        
        1. **Foreground Elements**: Objects closest to camera (blur, larger movement)
        2. **Midground Elements**: Main subject area (medium movement)
        3. **Background Elements**: Distant elements (slow, subtle movement)
        4. **Depth Layers**: How many depth layers (3-7 recommended)
        5. **Movement Direction**: Pan left/right/up/down or zoom in/out
        6. **Ken Burns Suggestions**: Slow zoom and pan timing
        
        Provide specific Premiere Pro/After Effects keyframe suggestions.
        
        OUTPUT JSON format.
      `;
            const schema = {
                type: "OBJECT",
                properties: {
                    foreground: { type: "ARRAY", items: { type: "STRING" } },
                    midground: { type: "ARRAY", items: { type: "STRING" } },
                    background: { type: "ARRAY", items: { type: "STRING" } },
                    depth_layers: { type: "NUMBER" },
                    movement_direction: { type: "STRING" },
                    ken_burns: { type: "STRING" },
                    keyframes: { type: "STRING" }
                }
            };
            const result = await generateText(prompt, "Motion Graphics Expert", schema);
            setParallaxData({ ...result, sceneIndex });
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // --- 3. AI SCENE MORPH TRANSITIONS ---
    const handleMorphTransitions = async () => {
        setShowMorphTransitionModal(true);
        if (morphTransitionData) return;
        setLoading(true);
        setLoadingMsg("🔄 Generating morph transitions...");
        try {
            const prompt = `
        Act as a VFX Transition Specialist.
        
        PROJECT: "${formData.title}"
        SCENES: ${scenes.length}
        STYLE: "${storyDetails?.style}"
        
        For each scene transition (${scenes.length - 1} transitions), suggest a MORPH TRANSITION:
        
        For each transition:
        1. **Transition Type**: (Morph, Dissolve, Wipe, Match Cut, Whip Pan, Zoom Through, Particle, Liquid)
        2. **Morph Anchor**: What object/shape connects both scenes
        3. **Duration**: Recommended transition length in seconds
        4. **AI Video Prompt**: Exact prompt for AI video generators (Runway, Pika)
        5. **Difficulty**: Easy/Medium/Hard for manual editing
        
        Focus on SMOOTH morphing where shapes/colors transform naturally.
        
        OUTPUT JSON format.
      `;
            const schema = {
                type: "OBJECT",
                properties: {
                    transitions: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                from_scene: { type: "NUMBER" },
                                to_scene: { type: "NUMBER" },
                                transition_type: { type: "STRING" },
                                morph_anchor: { type: "STRING" },
                                duration: { type: "NUMBER" },
                                ai_prompt: { type: "STRING" },
                                difficulty: { type: "STRING" }
                            }
                        }
                    }
                }
            };
            const result = await generateText(prompt, "VFX Transition Specialist", schema);
            setMorphTransitionData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // --- 4. LYRICS-TO-VISUAL METAPHOR ENGINE ---
    const handleMetaphorEngine = async () => {
        setShowMetaphorModal(true);
        if (metaphorData) return;
        setLoading(true);
        setLoadingMsg("🎭 Extracting visual metaphors from lyrics...");
        try {
            const prompt = `
        Act as a Symbolic Visual Artist and Poetry Analyst.
        
        LYRICS:
        "${formData.lyrics}"
        
        STYLE: "${storyDetails?.style}"
        
        Extract VISUAL METAPHORS from these lyrics:
        
        For each significant lyric line:
        1. **Lyric Line**: The original text
        2. **Metaphor Detected**: What abstract concept is being expressed
        3. **Visual Symbol**: Concrete visual representation
        4. **Color Association**: What colors evoke this feeling
        5. **Camera Technique**: How to film this symbolically
        6. **VFX Suggestion**: Any special effects to enhance meaning
        
        Examples:
        - "heart is breaking" → shattering glass, cracked mirror
        - "drowning in tears" → underwater scene, rain
        - "flying high" → wind, freedom, birds
        
        Find at least 5-10 metaphors.
        
        OUTPUT JSON format.
      `;
            const schema = {
                type: "OBJECT",
                properties: {
                    metaphors: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                lyric_line: { type: "STRING" },
                                metaphor: { type: "STRING" },
                                visual_symbol: { type: "STRING" },
                                color_association: { type: "STRING" },
                                camera_technique: { type: "STRING" },
                                vfx_suggestion: { type: "STRING" }
                            }
                        }
                    }
                }
            };
            const result = await generateText(prompt, "Symbolic Visual Artist", schema);
            setMetaphorData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // --- 5. SOCIAL MEDIA AUTO-CROPPER ---
    const handleSocialCropper = async () => {
        setShowSocialCropModal(true);
        if (socialCropData) return;
        setLoading(true);
        setLoadingMsg("📱 Analyzing scenes for social media crops...");
        try {
            const prompt = `
        Act as a Social Media Video Editor.
        
        PROJECT: "${formData.title}"
        SCENES: ${scenes.length}
        ORIGINAL RATIO: 16:9
        
        For each scene, suggest optimal crop positions for different platforms:
        
        TARGET FORMATS:
        - 9:16 (TikTok, Reels, Shorts)
        - 4:5 (Instagram Feed)
        - 1:1 (Square)
        
        For each scene:
        1. **Focus Point**: Where is the main subject (center, left, right, top, bottom)
        2. **Safe Zone**: What area must be preserved
        3. **9:16 Crop Strategy**: How to crop for vertical
        4. **4:5 Crop Strategy**: How to crop for Instagram
        5. **1:1 Crop Strategy**: How to crop for square
        6. **Risk Level**: How much important content will be lost
        
        OUTPUT JSON format.
      `;
            const schema = {
                type: "OBJECT",
                properties: {
                    scenes: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                scene_number: { type: "NUMBER" },
                                focus_point: { type: "STRING" },
                                safe_zone: { type: "STRING" },
                                crop_9_16: { type: "STRING" },
                                crop_4_5: { type: "STRING" },
                                crop_1_1: { type: "STRING" },
                                risk_level: { type: "STRING" }
                            }
                        }
                    }
                }
            };
            const result = await generateText(prompt, "Social Media Video Editor", schema);
            setSocialCropData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // --- 6. AI MUSIC VISUALIZER OVERLAY ---
    const handleMusicVisualizer = async () => {
        setShowMusicVisualizerModal(true);
        if (musicVisualizerData) return;
        setLoading(true);
        setLoadingMsg("🎵 Generating visualizer overlay designs...");
        try {
            const bpmInfo = beatSyncData?.bpm || analyzedBPM || 120;
            const prompt = `
        Act as a Motion Graphics Designer for music visualizers.
        
        PROJECT: "${formData.title}"
        BPM: ${bpmInfo}
        STYLE: "${storyDetails?.style}"
        ENERGY: "${beatSyncData?.energy_level || 'medium'}"
        
        Design 5 MUSIC VISUALIZER OVERLAY concepts:
        
        For each concept:
        1. **Name**: Creative name for the visualizer
        2. **Type**: (Waveform, Spectrum, Bars, Particles, Geometric, Liquid, Neon)
        3. **Position**: Where on screen (bottom, top, sides, corners, full)
        4. **Color Scheme**: Colors that match the project style
        5. **Opacity**: 10-100% visibility
        6. **Animation Style**: How it reacts to beats (pulse, bounce, glow, expand)
        7. **After Effects Expression**: Simple expression code for beat reactivity
        
        OUTPUT JSON format.
      `;
            const schema = {
                type: "OBJECT",
                properties: {
                    visualizers: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                name: { type: "STRING" },
                                type: { type: "STRING" },
                                position: { type: "STRING" },
                                color_scheme: { type: "STRING" },
                                opacity: { type: "NUMBER" },
                                animation_style: { type: "STRING" },
                                ae_expression: { type: "STRING" }
                            }
                        }
                    }
                }
            };
            const result = await generateText(prompt, "Motion Graphics Designer", schema);
            setMusicVisualizerData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // --- 7. GROK.AI EXPORT PACKAGE ---
    const handleGrokExport = async () => {
        setShowGrokExportModal(true);
        setGrokExportProgress(0);
        setLoading(true);
        setLoadingMsg("📦 Preparing Grok.ai export package...");
        try {
            // Build comprehensive export data
            const exportPackage = {
                project_info: {
                    title: formData.title,
                    type: formData.projectType,
                    duration: formData.duration,
                    generated_at: new Date().toISOString()
                },
                story: {
                    plot: storyDetails?.plot,
                    style: storyDetails?.style,
                    characters: storyDetails?.characters,
                    locations: storyDetails?.locations
                },
                scenes: scenes.map((scene, idx) => ({
                    index: idx + 1,
                    description: scene.scene_description,
                    narrator_script: scene.narrator_script,
                    lyric_line: scene.lyric_line,
                    cinematography: scene.cinematography,
                    video_prompt: scene.video_prompt || null,
                    image_base64: sceneImages[idx] || null
                })),
                beat_sync: beatSyncData ? {
                    bpm: beatSyncData.bpm,
                    energy: beatSyncData.energy_level,
                    structure: beatSyncData.structure
                } : null,
                settings: {
                    scene_duration: sceneDuration,
                    video_settings: videoGenSettings,
                    cine_settings: cineSettings
                },
                grok_prompts: []
            };

            setGrokExportProgress(30);

            // Generate Grok-specific prompts
            const grokPrompt = `
        Act as a Grok.ai prompt engineer.
        
        PROJECT: "${formData.title}"
        SCENES: ${scenes.length}
        
        For each scene, create an optimized prompt for Grok.ai image/video generation:
        
        Requirements:
        - Use Grok's preferred prompt style
        - Include negative prompts
        - Specify aspect ratio (16:9)
        - Add quality modifiers (4K, cinematic, detailed)
        
        OUTPUT JSON with array of prompts.
      `;

            const promptResult = await generateText(grokPrompt, "Grok Prompt Engineer", {
                type: "OBJECT",
                properties: {
                    prompts: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                scene: { type: "NUMBER" },
                                positive_prompt: { type: "STRING" },
                                negative_prompt: { type: "STRING" },
                                settings: { type: "STRING" }
                            }
                        }
                    }
                }
            });

            exportPackage.grok_prompts = promptResult.prompts;
            setGrokExportProgress(70);

            setGrokExportData(exportPackage);
            setGrokExportProgress(100);

            showToast("Grok.ai export package ready! 📦", "success");
        } catch (e) {
            setError(t.errorGeneric);
            showToast("Export failed. Please try again.", "error");
        } finally { setLoading(false); }
    };

    // Download Grok Export as JSON
    const downloadGrokExport = () => {
        if (!grokExportData) return;
        const blob = new Blob([JSON.stringify(grokExportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${formData.title || 'storyboard'}_grok_export.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("Grok export downloaded! 🚀", "success");
    };

    // ----------------------------------------------------------------------

    // --- 8. MOOD-BASED LUT GENERATOR ---
    const handleLUTGenerator = async () => {
        setShowLUTModal(true);
        if (lutData) return;
        setLoading(true);
        setLoadingMsg("🎨 Analyzing mood & creating color grades...");
        try {
            const prompt = `
            Act as a Professional Colorist.
            
            PROJECT: "${formData.title}"
            PLOT: "${storyDetails?.plot}"
            STYLE: "${storyDetails?.style}"
            
            Create 5 distinct Color Grading (LUT) presets that match the emotion of this story.
            
            For each LUT:
            1. Name (Creative)
            2. Primary Emotion (Joy, Melancholy, Tension, etc.)
            3. CSS Filter String (e.g., "contrast(1.2) sepia(0.3) saturate(1.1)")
            4. Prompt Keywords (e.g., "cinematic teal and orange, high contrast, moody shadows")
            5. Description (Why this fits)
            
            OUTPUT JSON with 'luts' array.
            `;
            const schema = {
                type: "OBJECT",
                properties: {
                    luts: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                name: { type: "STRING" },
                                emotion: { type: "STRING" },
                                css_filter: { type: "STRING" },
                                grading_keywords: { type: "STRING" },
                                description: { type: "STRING" }
                            }
                        }
                    },
                    recommended_lut_index: { type: "NUMBER" }
                }
            };
            const result = await generateText(prompt, "Professional Colorist", schema);
            setLutData(result);
            showToast("Color grades generated!", "success");
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // --- 9. SYMBOLISM & MOTIF TRACKER ---
    const handleSymbolismTracker = async () => {
        setShowSymbolismModal(true);
        if (symbolismData) return;
        setLoading(true);
        setLoadingMsg("🔮 Detecting literary symbols & motifs...");
        try {
            const prompt = `
            Act as a Literary Analyst and Visual Director.
            
            PROJECT: "${formData.title}"
            PLOT: "${storyDetails?.plot}"
            LYRICS: "${formData.lyrics?.substring(0, 1000)}..."
            
            Identify 3-5 recurring visual symbols/motifs.
            
            For each motif:
            1. Symbol (e.g., "Broken Glass", "Red Umbrella")
            2. Meanings (e.g., "Fragility of memory")
            3. Visual Prompt Strategy (How to show it)
            4. Target Scenes (Array of scene numbers where it should appear)
            
            OUTPUT JSON with 'motifs' array.
            `;
            const schema = {
                type: "OBJECT",
                properties: {
                    motifs: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                symbol: { type: "STRING" },
                                meaning: { type: "STRING" },
                                visual_prompt: { type: "STRING" },
                                target_scenes: { type: "ARRAY", items: { type: "NUMBER" } }
                            }
                        }
                    },
                    overall_theme_analysis: { type: "STRING" }
                }
            };
            const result = await generateText(prompt, "Literary Analyst", schema);
            setSymbolismData(result);
            showToast("Motifs identified!", "success");
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // --- 10. SMART SHOT LIST OPTIMIZER ---
    const handleSmartSchedule = async () => {
        setShowSmartScheduleModal(true);
        if (smartScheduleData) return;
        setLoading(true);
        setLoadingMsg("📅 Optimizing shooting schedule...");
        try {
            const resultScenes = scenes.map((s, i) => ({ num: i + 1, loc: s.location_name || "Unknown", desc: s.scene_description }));
            const prompt = `
            Act as a 1st AD (Assistant Director).
            
            SCENES: ${JSON.stringify(resultScenes)}
            
            Optimize the shooting schedule. Group scenes by LOCATION to minimize moves.
            
            OUTPUT JSON:
            - schedule (Array of Day blocks)
            - efficiency_score (0-100)
            - total_days (Number)
            `;
            const schema = {
                type: "OBJECT",
                properties: {
                    schedule: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                day_number: { type: "NUMBER" },
                                location_name: { type: "STRING" },
                                scenes_in_block: { type: "ARRAY", items: { type: "NUMBER" } },
                                estimated_hours: { type: "NUMBER" },
                                cast_needed: { type: "ARRAY", items: { type: "STRING" } },
                                notes: { type: "STRING" }
                            }
                        }
                    },
                    efficiency_score: { type: "NUMBER" },
                    total_days: { type: "NUMBER" }
                }
            };
            const result = await generateText(prompt, "1st AD", schema);
            setSmartScheduleData(result);
            showToast("Schedule optimized!", "success");
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // --- REAL-TIME COLLABORATION HANDLER ---
    const handleCollaboration = async () => {
        setShowCollaborationModal(true);
        if (collaborationData) return;
        setLoading(true);
        setLoadingMsg("Setting up collaboration workspace...");
        try {
            const langName = 'English';
            const prompt = `
        Act as a Collaboration Platform Architect for ${formData.projectType} production.
        
        Title: "${formData.title}"
        Project Type: "${formData.projectType}"
        Scenes: ${scenes.length}
        Team Size: Estimate ${storyDetails.characters.length + 5} members
        
        Design a real-time collaboration system for this project:
        
        1. WORKFLOW INTEGRATION:
        - Scene-by-scene commenting system
        - Version control for storyboard iterations
        - Approval workflow (Director → DP → Producer)
        
        2. TOOLS RECOMMENDATION:
        - Best real-time editing tools
        - Cloud storage setup
        - Communication channels
        
        3. PERMISSION STRUCTURE:
        - Role-based access (Director, DP, Editor, Client)
        - Comment vs Edit permissions
        - Deadline tracking
        
        4. EXPORT OPTIONS:
        - Frame.io integration
        - Notion/ClickUp templates
        - PDF report generation
        
        Provide detailed setup instructions.
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Collaboration Platform Architect");
            setCollaborationData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // --- AI CO-DIRECTOR HANDLER ---
    const handleCoDirector = async () => {
        setShowCoDirectorModal(true);
        if (coDirectorData) return;
        setLoading(true);
        setLoadingMsg("AI Co-Director analyzing...");
        try {
            const langName = 'English';
            const prompt = `
        Act as an AI Co-Director for this ${formData.projectType} project.
        
        CRITICAL ANALYSIS REQUESTED:
        
        PROJECT: "${formData.title}"
        PLOT: "${storyDetails.plot}"
        SCENES: ${scenes.length}
        BUDGET: ${budgetData ? "Available" : "TBD"}
        
        Provide REAL-TIME DIRECTING NOTES:
        
        1. CONTINUITY CHECK:
        - Time of day consistency
        - Character wardrobe changes
        - Prop placement errors
        
        2. PACING ANALYSIS:
        - Scene duration optimization
        - Emotional beat timing
        - Audience attention spans
        
        3. BUDGET IMPACT ALERTS:
        - Expensive VFX flags
        - Location cost alternatives
        - Crew size optimization
        
        4. CREATIVE SUGGESTIONS:
        - Alternative shot compositions
        - Lighting improvements
        - Color grading variations
        
        5. PRODUCTION LOGISTICS:
        - Shooting order optimization
        - Weather contingency plans
        - Equipment rental suggestions
        
        Be specific and actionable.
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "AI Co-Director");
            setCoDirectorData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // --- SPATIAL STORYBOARDING HANDLER ---
    const handleSpatialStoryboarding = async () => {
        setShowSpatialModal(true);
        if (spatialData) return;
        setLoading(true);
        setLoadingMsg("Creating 3D spatial layout...");
        try {
            const langName = 'English';
            const sceneDescriptions = scenes.map((s, i) =>
                `Scene ${i + 1}: ${s.scene_description} (Location: ${s.setting?.location})`
            ).join('\n');

            const prompt = `
        Act as a 3D Previsualization Artist.
        
        PROJECT: "${formData.title}"
        SCENES: ${scenes.length}
        
        ${sceneDescriptions}
        
        Create a 3D SPATIAL STORYBOARD LAYOUT:
        
        1. 3D SCENE BLOCKING:
        - Character positions in 3D space
        - Camera positions and paths
        - Lighting fixture placement
        
        2. VIRTUAL CAMERA SETUP:
        - Lens choices per shot
        - Camera movement paths
        - Crane/dolly positions
        
        3. SET DESIGN:
        - Prop placement diagrams
        - Wall/floor layouts
        - Practical lighting positions
        
        4. EXPORT FORMATS:
        - Blender/UE5 scene files
        - FBX/GLTF exports
        - VR walkthrough setup
        
        5. TECHNICAL SPECS:
        - Scale references (1 unit = 1 meter)
        - Material assignments
        - Lighting rig diagrams
        
        Output detailed 3D layout instructions.
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "3D Previsualization Artist");
            setSpatialData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // --- MULTI-MODEL RENDERING HANDLER ---
    const handleMultiModelRendering = async () => {
        setShowMultiModelModal(true);
        if (multiModelData) return;
        setLoading(true);
        setLoadingMsg("Optimizing AI model pipeline...");
        try {
            const langName = 'English';
            const prompt = `
        Act as an AI Video Pipeline Architect.
        
        PROJECT: "${formData.title}"
        SCENES: ${scenes.length}
        STYLE: "${storyDetails.style}"
        
        Design a MULTI-MODEL RENDERING PIPELINE:
        
        1. MODEL SELECTION MATRIX:
        - Runway Gen-2: Best for ______ scenes
        - Pika Labs: Best for ______ scenes  
        - Luma Dream Machine: Best for ______
        - Stable Video Diffusion: Best for ______
        
        2. SCENE-BY-SCENE ASSIGNMENT:
        ${scenes.map((s, i) => `Scene ${i + 1}: [Best Model] because ______`).join('\n')}
        
        3. STYLE CONSISTENCY PROTOCOL:
        - Color grading matching between models
        - Character consistency techniques
        - Resolution normalization
        
        4. POST-PROCESSING PIPELINE:
        - Upscaling workflow (Topaz vs. Magnific)
        - Frame interpolation
        - Temporal consistency fixes
        
        5. COST & TIME ESTIMATES:
        - Credits required per platform
        - Render time estimates
        - Quality vs Speed tradeoffs
        
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "AI Pipeline Architect");
            setMultiModelData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // --- ADVANCED LIP-SYNC HANDLER ---
    const handleLipSyncAI = async () => {
        setShowLipSyncModal(true);
        if (lipSyncData) return;
        setLoading(true);
        setLoadingMsg("Generating lip-sync analysis...");
        try {
            const langName = 'English';
            const prompt = `
        Act as a Lip-Sync & Dialogue Specialist.
        
        PROJECT: "${formData.title}"
        LYRICS: "${formData.lyrics.substring(0, 500)}"
        SCENES WITH DIALOGUE: ${scenes.filter(s => s.lyric_line && s.lyric_line !== "(Instrumental)").length}
        
        Create ADVANCED LIP-SYNC PROTOCOL:
        
        1. PHONEME ANALYSIS:
        - Breakdown of difficult phonetic sounds
        - Mouth shape references for each vowel/consonant
        - Language-specific articulation notes
        
        2. EMOTIONAL MOUTH SHAPES:
        - Happy vs Sad mouth movements
        - Singing vs Speaking differences
        - Whisper vs Shout variations
        
        3. TECHNIQUE RECOMMENDATIONS:
        - Best AI lip-sync tools (Wav2Lip vs SadTalker)
        - Manual correction workflow
        - Blend shape creation guide
        
        4. REFERENCE MATERIAL:
        - Celebrity speech pattern references
        - Animated mouth shape sheets
        - Real vs Stylized balance
        
        5. QUALITY CONTROL:
        - Frame-by-frame checking points
        - Audio-visual sync testing
        - Cultural pronunciation notes
        
        Output in ${langName}.
      `;
            const result = await generateText(prompt, "Lip-Sync Specialist");
            setLipSyncData(result);
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };
    const playScript = async (index, text) => {
        if (playingAudio === index) { audioRef.current?.pause(); setPlayingAudio(null); return; }
        try { setPlayingAudio(index); const blob = await generateSpeech(text); setAudioCache(prev => ({ ...prev, [index]: blob })); const url = URL.createObjectURL(blob); const audio = new Audio(url); audioRef.current = audio; audio.onended = () => setPlayingAudio(null); audio.play(); } catch (e) { setPlayingAudio(null); setError(t.errorGeneric); }
    };

    const openEditModal = (index) => { setEditingSceneIndex(index); setEditModalOpen(true); };

    const applyMagicEdit = async (instruction) => {
        if (editingSceneIndex === null) return;
        const index = editingSceneIndex;
        const currentImg = sceneImages[index];
        setSceneLoading(index);
        try {
            // Added midjourney style
            const prompt = `Edit this image: ${instruction}. Maintain the same style and character consistency. Style: ${storyDetails.style}. 16:9 aspect ratio, midjourney style.`;
            const refImage = { data: currentImg, mimeType: 'image/png' };
            const newImg = await generateImageRobust(prompt, [refImage]);
            setSceneImages(prev => ({ ...prev, [index]: newImg }));
        } catch (e) { setError(t.errorGeneric); } finally { setSceneLoading(null); }
    };

    // UPDATED VIDEO PROMPT GENERATOR WITH NEW SETTINGS
    const generateVideoPromptText = async (index, currentScenes) => {
        const scene = currentScenes[index];
        const nextScene = currentScenes[index + 1];
        const currentProjectType = formData.projectType || 'Music Video';

        // NEW: Extract lyric for this scene and add explicit singing instruction
        const lyricContext = scene.lyric_line && scene.lyric_line !== "(Instrumental)"
            ? `Current Lyric/Voiceover Line: "${scene.lyric_line}"`
            : "Current Audio: (Instrumental/None)";

        const prompt = `
        Generate a detailed JSON video generation prompt optimized for AI video models (Runway, Pika, etc.).
        
        SCENE CONTEXT:
        Project Type: "${currentProjectType}"
        Description: "${scene.scene_description}"
        Action: "${scene.narrator_script}"
        ${lyricContext}
        Style: "${storyDetails.style}"
        Next Scene: "${nextScene ? nextScene.scene_description : 'End'}"
        
        VIDEO GENERATION PARAMETERS (Apply these constraints):
        Motion Strength: ${videoGenSettings.motion}/10
        Camera Movement: ${videoGenSettings.camera}
        Aspect Ratio: ${videoGenSettings.aspectRatio}
        Negative Prompt: "${videoGenSettings.negativePrompt}"
        
        --- ADVANCED AI FEATURES ---
        LIPSYNC MODE: ${lipsyncMode ? 'ENABLED' : 'DISABLED'}
        ${lipsyncMode ? `
        LIPSYNC SETTINGS:
        - Mouth Openness: ${lipsyncSettings.mouthOpenness} (${lipsyncSettings.mouthOpenness === 'subtle' ? 'slightly parted lips' : lipsyncSettings.mouthOpenness === 'exaggerated' ? 'wide open mouth' : 'naturally open mouth'})
        - Expression Style: ${lipsyncSettings.expressionStyle} (${lipsyncSettings.expressionStyle === 'dramatic' ? 'intense, powerful emotions' : lipsyncSettings.expressionStyle === 'anime' ? 'exaggerated anime expressions' : 'natural singing expression'})
        - Sync Timing: ${lipsyncSettings.syncTiming}
        ` : ''}
        
        FACE CONSISTENCY MODE: ${faceConsistencyMode ? 'ENABLED - Use consistent face reference' : 'DISABLED'}
        
        BEAT-SYNC DATA: ${beatSyncData ? `BPM: ${beatSyncData.bpm}, Energy: ${beatSyncData.energy_level}` : 'Not analyzed'}
        
        STRUCTURED DATA AVAILABLE:
        Cinematography: ${JSON.stringify(scene.cinematography || {})}
        Setting: ${JSON.stringify(scene.setting || {})}
        Subject: ${JSON.stringify(scene.subject || {})}
        Characters in scene: ${JSON.stringify(scene.characters_in_scene || [])}
        
        [VISUAL COMPATIBILITY PROTOCOL]:
        The 'Style' input contains a NANO_BANANA_PRESET aesthetic. 
        You MUST ensure the 'image_description', 'background', and 'cinematography' fields strictly adhere to this preset's visual rules (e.g. if preset is 'Neon Noir', ensure lighting is neon and shadows are deep).
        Blend the preset's style with the specific scene content seamlessly.
        
        INSTRUCTIONS:
        1. Create a JSON object strictly following the schema.
        2. LIP SYNC / SINGING INSTRUCTION: If "Current Lyric Line" contains lyrics (is not instrumental) and there is a character in the scene, YOU MUST describe the subject's action as "singing", "lip syncing", "performing the lyrics", or "mouthing the words" with an emotion matching the lyrics.
        3. If LIPSYNC MODE is ENABLED, apply the specific mouth openness and expression style settings.
        4. If FACE CONSISTENCY is enabled, note that all character faces should be consistent with previous scenes.
        5. If it is (Instrumental), focus on mood, atmosphere, or dance, do not describe singing.

        Create a JSON object strictly following this schema:
        {
          "image_description": "Detailed visual description of the frame",
          "subject": {
             "description": "Main subject description",
             "action": "Specific movement/action (CRITICAL FOR VIDEO). IF SINGING, EXPLICITLY STATE 'Singing the lyrics...'",
             "clothing": "Details if applicable",
             "appearance": "Details if applicable"
          },
          "background": {
             "setting": "Environment details",
             "atmosphere": "Mood and lighting"
          },
          "cinematography": {
             "angle": "Camera angle",
             "lighting": "Lighting setup",
             "movement": "Camera movement (e.g. Pan, Tilt, Dolly, Static)",
             "mood": "Emotional tone"
          },
          "video_settings": {
              "motion_bucket_id": ${videoGenSettings.motion * 12}, 
              "camera_motion": "${videoGenSettings.camera}",
              "aspect_ratio": "${videoGenSettings.aspectRatio}",
              "negative_prompt": "${videoGenSettings.negativePrompt}"
          },
          "lipsync_settings": {
              "enabled": ${lipsyncMode},
              "mouth_openness": "${lipsyncSettings.mouthOpenness}",
              "expression_style": "${lipsyncSettings.expressionStyle}",
              "sync_timing": "${lipsyncSettings.syncTiming}"
          },
          "face_consistency": ${faceConsistencyMode},
          "beat_sync": ${beatSyncData ? `{ "bpm": ${beatSyncData.bpm}, "energy": "${beatSyncData.energy_level}" }` : 'null'},
          "characters": [
             // Array of characters present in the scene with details
             { "name": "...", "appearance": "..." }
          ],
          "format": "Cinematic Video"
        }
        
        Output strictly valid JSON.
      `;

        const schema = {
            type: "OBJECT",
            properties: {
                image_description: { type: "STRING" },
                subject: {
                    type: "OBJECT",
                    properties: {
                        description: { type: "STRING" },
                        action: { type: "STRING" },
                        clothing: { type: "STRING" },
                        appearance: { type: "STRING" }
                    }
                },
                background: {
                    type: "OBJECT",
                    properties: {
                        setting: { type: "STRING" },
                        atmosphere: { type: "STRING" }
                    }
                },
                cinematography: {
                    type: "OBJECT",
                    properties: {
                        angle: { type: "STRING" },
                        lighting: { type: "STRING" },
                        movement: { type: "STRING" },
                        mood: { type: "STRING" }
                    }
                },
                video_settings: {
                    type: "OBJECT",
                    properties: {
                        motion_bucket_id: { type: "NUMBER" },
                        camera_motion: { type: "STRING" },
                        aspect_ratio: { type: "STRING" },
                        negative_prompt: { type: "STRING" }
                    }
                },
                lipsync_settings: {
                    type: "OBJECT",
                    properties: {
                        enabled: { type: "BOOLEAN" },
                        mouth_openness: { type: "STRING" },
                        expression_style: { type: "STRING" },
                        sync_timing: { type: "STRING" }
                    }
                },
                face_consistency: { type: "BOOLEAN" },
                beat_sync: {
                    type: "OBJECT",
                    nullable: true,
                    properties: {
                        bpm: { type: "NUMBER" },
                        energy: { type: "STRING" }
                    }
                },
                characters: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            name: { type: "STRING" },
                            appearance: { type: "STRING" }
                        }
                    }
                },
                format: { type: "STRING" }
            }
        };

        return await generateText(prompt, "JSON Video Prompt Expert", schema);
    };

    const handleGenerateVideoPrompt = async (index) => {
        setVideoPromptLoading(prev => ({ ...prev, [index]: true }));
        try {
            const result = await generateVideoPromptText(index, scenes);
            // Store as stringified JSON for easy display/copying
            setVideoPrompts(prev => ({ ...prev, [index]: JSON.stringify(result, null, 2) }));
        } catch (e) { console.error(e); } finally { setVideoPromptLoading(prev => ({ ...prev, [index]: false })); }
    };

    const handleGenerateAllVideoPrompts = async () => {
        setLoading(true); setLoadingMsg(t.generating);
        try {
            let currentPrompts = { ...videoPrompts };
            for (let i = 0; i < scenes.length; i++) {
                if (currentPrompts[i]) continue;
                try {
                    const result = await generateVideoPromptText(i, scenes);
                    currentPrompts[i] = JSON.stringify(result, null, 2);
                    setVideoPrompts(prev => ({ ...prev, [i]: JSON.stringify(result, null, 2) }));
                    await delay(300);
                } catch (err) { console.error(err); }
            }
        } catch (e) { setError(t.errorGeneric); } finally { setLoading(false); }
    };

    // =========================================================================
    // AUTOMATION MODE - Continuous Storyboard Generation (FIXED)
    // =========================================================================

    const runAutomationCycle = async () => {
        if (!storyDetails) {
            setError('Please complete initial setup first (generate ideas and select one)');
            return;
        }

        setAutoModeRunning(true);
        setAutoModeShouldStop(false);
        setShowAutomationPanel(true);

        const getRandomStyle = () => {
            const randomIndex = Math.floor(Math.random() * NANO_BANANA_PRESETS.length);
            return NANO_BANANA_PRESETS[randomIndex];
        };

        let cycleNum = 0;

        while (!autoModeShouldStop) {
            cycleNum++;
            setAutoModeCycleCount(cycleNum);

            const selectedPreset = getRandomStyle();
            const styleName = selectedPreset.label || `Style ${cycleNum}`;
            setAutoModeCurrentStyle(styleName);
            setFormData(prev => ({ ...prev, visualStyle: selectedPreset.value }));
            setLoadingMsg(`Cycle ${cycleNum}: Generating storyboard...`);
            setLoading(true);

            // LOCAL storage for this cycle (fixes ZIP issue)
            let cycleSceneImages = {};
            let cycleVideoPrompts = {};
            let cycleScenesResult = [];

            try {
                setSceneImages({});
                setVideoPrompts({});
                setScenesGeneratedCount(0);

                const durationSec = parseDuration(formData.duration) || 120;
                const count = Math.ceil(durationSec / sceneDuration);

                const prompt = `You are a director for a ${formData.projectType || 'Music Video'}. Create exactly ${count} sequential storyboard scenes.
                    Plot: ${storyDetails.plot}
                    Style: ${selectedPreset.value}
                    Refs: ${formData.directorRefs}
                    Lens: ${cineSettings.lens}, Era: ${cineSettings.era}, Lighting: ${cineSettings.lighting}
                    Output: JSON Array of ${count} scenes.`;

                const schema = {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            scene_description: { type: "STRING" },
                            narrator_script: { type: "STRING" }
                        },
                        required: ["scene_description", "narrator_script"]
                    }
                };

                cycleScenesResult = await generateText(prompt, `Exactly ${count} scenes.`, schema);
                setScenes(cycleScenesResult);
                await delay(2000); // Increased delay

                // Generate images with increased delays
                setLoadingMsg(`Cycle ${cycleNum}: Generating ${cycleScenesResult.length} images...`);

                for (let i = 0; i < cycleScenesResult.length; i++) {
                    if (autoModeShouldStop) break;

                    const scene = cycleScenesResult[i];

                    // GLOBAL PROMPT INJECTION (LUTs, Symbolism)
                    let globalModifiers = "";
                    if (lutData?.luts?.[0]) {
                        globalModifiers += `, ${lutData.luts[0].grading_keywords}, ${lutData.luts[0].emotion} mood`;
                    }
                    if (symbolismData?.motifs) {
                        const sceneNum = i + 1;
                        symbolismData.motifs.forEach(motif => {
                            if (motif.target_scenes?.includes(sceneNum)) {
                                globalModifiers += `. Symbolism: ${motif.visual_prompt}`;
                            }
                        });
                    }

                    let imgPrompt = `Cinematic scene. ${scene.scene_description}. Style: ${selectedPreset.value}${globalModifiers}. 8K cinematic.`;

                    try {
                        const img = await generateImageRobust(imgPrompt, [], videoGenSettings.aspectRatio || '16:9');
                        cycleSceneImages[i] = img; // Store locally
                        setSceneImages(prev => ({ ...prev, [i]: img }));
                        setScenesGeneratedCount(i + 1);
                        await delay(1500); // Increased delay
                    } catch (imgErr) {
                        console.error(`Image ${i} failed:`, imgErr);
                    }
                }

                // Generate video prompts with increased delays
                if (!autoModeShouldStop) {
                    setLoadingMsg(`Cycle ${cycleNum}: Generating video prompts...`);
                    await delay(2000);

                    for (let i = 0; i < cycleScenesResult.length; i++) {
                        if (autoModeShouldStop) break;

                        try {
                            const vpResult = await generateVideoPromptText(i, cycleScenesResult);
                            const vpString = JSON.stringify(vpResult, null, 2);
                            cycleVideoPrompts[i] = vpString; // Store locally
                            setVideoPrompts(prev => ({ ...prev, [i]: vpString }));
                            await delay(1500); // Increased delay
                        } catch (vpErr) {
                            console.error(`Video prompt ${i} failed:`, vpErr);
                        }
                    }
                }

                // Download ZIP using LOCAL data
                if (!autoModeShouldStop && Object.keys(cycleSceneImages).length > 0) {
                    setLoadingMsg(`Cycle ${cycleNum}: Creating ZIP...`);
                    await delay(1000);

                    try {
                        const { default: JSZip } = await import('https://esm.sh/jszip@3.10.1');
                        const zip = new JSZip();
                        const safeTitle = (formData.title || 'auto').replace(/[^a-z0-9]/gi, '_').toLowerCase();
                        const folderName = `${safeTitle}_cycle${cycleNum}_${Date.now()}`;
                        const root = zip.folder(folderName);

                        // Add images from LOCAL storage
                        const scenesFolder = root.folder("scenes");
                        Object.keys(cycleSceneImages).forEach(idx => {
                            const imgData = cycleSceneImages[Number(idx)];
                            if (imgData && imgData.includes('base64,')) {
                                scenesFolder.file(`scene_${String(Number(idx) + 1).padStart(3, '0')}.png`, imgData.split(',')[1], { base64: true });
                            }
                        });

                        // Add script
                        let scriptContent = `CYCLE: ${cycleNum}\nSTYLE: ${styleName}\nTITLE: ${formData.title}\n\n`;
                        cycleScenesResult.forEach((scene, idx) => {
                            scriptContent += `[SCENE ${idx + 1}]\n${scene.scene_description}\n${scene.narrator_script}\n\n`;
                        });
                        root.file("script.txt", scriptContent);

                        // Add video prompts from LOCAL storage
                        const promptsFolder = root.folder("video_prompts");
                        Object.keys(cycleVideoPrompts).forEach(idx => {
                            if (cycleVideoPrompts[Number(idx)]) {
                                promptsFolder.file(`scene_${String(Number(idx) + 1).padStart(3, '0')}.json`, cycleVideoPrompts[Number(idx)]);
                            }
                        });

                        const content = await zip.generateAsync({ type: "blob" });
                        const url = window.URL.createObjectURL(content);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${folderName}.zip`;
                        a.click();
                        window.URL.revokeObjectURL(url);

                        console.log(`ZIP created: ${Object.keys(cycleSceneImages).length} images, ${Object.keys(cycleVideoPrompts).length} prompts`);
                    } catch (zipErr) {
                        console.error('ZIP error:', zipErr);
                    }
                }

                if (!autoModeShouldStop) {
                    setLoadingMsg(`Cycle ${cycleNum} done! Next in 5s...`);
                    await delay(5000);
                }

            } catch (cycleErr) {
                console.error(`Cycle ${cycleNum} error:`, cycleErr);
                await delay(5000);
            }
        }

        setAutoModeRunning(false);
        setLoading(false);
    };

    // =========================================================================
    // FULL AUTO MODE - Start from scratch with viral topics
    // =========================================================================

    const VIRAL_TOPICS = [
        { title: "The Secret Life of Pigeons in NYC", hook: "You won't believe what these urban birds are really up to!", genre: "Documentary" },
        { title: "I Lived on $1 a Day for a Month - Here's What Happened", hook: "Extreme budget challenge reveals shocking truths about survival.", genre: "Social Experiment" },
        { title: "Unboxing the Future: AI-Powered Dream Machines", hook: "Is this the end of human creativity? We test the limits.", genre: "Tech Review" },
        { title: "The Hidden History of Your Favorite Fast Food Item", hook: "From humble beginnings to global phenomenon, the untold story.", genre: "Documentary" },
        { title: "Can You Survive a Week in the Wilderness with Only a Spoon?", hook: "A test of grit, wit, and sheer desperation.", genre: "Survival Challenge" },
        { title: "The Most Expensive Mistakes in Art History", hook: "Millions lost, masterpieces ruined. The art world's biggest blunders.", genre: "Educational" },
        { title: "Why Everyone is Obsessed with Tiny Homes (and Should You Be?)", hook: "The minimalist movement is booming, but at what cost?", genre: "Lifestyle" },
        { title: "I Tried Every Viral TikTok Food Hack - Here's What's Worth It", hook: "From cloud bread to pasta chips, a culinary adventure.", genre: "Food Review" },
        { title: "The Psychology of Procrastination: Why We Do It and How to Stop", hook: "Unlock the secrets to productivity and beat the urge to delay.", genre: "Educational" },
        { title: "Exploring Abandoned Mansions: A Glimpse into Forgotten Wealth", hook: "Decades of dust, untold stories, and eerie beauty.", genre: "Exploration" }
    ];

    const runFullAutomation = async () => {
        setAutoModeRunning(true);
        setAutoModeShouldStop(false);
        setLoading(true);

        let cycleNum = 0;

        while (!autoModeShouldStop) {
            cycleNum++;
            setAutoModeCycleCount(cycleNum);

            // Pick random viral topic
            const topic = VIRAL_TOPICS[Math.floor(Math.random() * VIRAL_TOPICS.length)];
            const style = NANO_BANANA_PRESETS[Math.floor(Math.random() * NANO_BANANA_PRESETS.length)];

            setAutoModeCurrentStyle(`${topic.title} - ${style.label}`);
            setLoadingMsg(`Cycle ${cycleNum}: ${topic.title}`);

            // Set form data automatically
            const projectTypes = ['Social Media', 'Documentary', 'Short Film'];
            setFormData(prev => ({
                ...prev,
                projectType: topic.genre || projectTypes[Math.floor(Math.random() * projectTypes.length)],
                title: topic.title,
                lyrics: topic.hook,
                visualStyle: style.value,
                duration: '1:30',
                directorRefs: 'MrBeast, Netflix Documentary, Vice',
                useCharacters: false
            }));

            await delay(1000);

            // Local storage for cycle
            let cycleSceneImages = {};
            let cycleVideoPrompts = {};
            let cycleScenesResult = [];

            try {
                // 1. Generate story idea
                setLoadingMsg(`Cycle ${cycleNum}: Creating story...`);

                const ideaPrompt = `Create a viral ${topic.genre} concept about: "${topic.title}"
                    Hook: ${topic.hook}
                    Style: ${style.value}
                    Make it attention-grabbing, shareable, and emotionally engaging.
                    Output JSON with: plot (detailed story), style (visual description), characters (empty array), locations (array of 3 locations), items (array of 3 key items).`;

                const ideaSchema = {
                    type: "OBJECT",
                    properties: {
                        plot: { type: "STRING" },
                        style: { type: "STRING" },
                        characters: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, appearance: { type: "STRING" } } } },
                        locations: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, description: { type: "STRING" } } } },
                        items: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, description: { type: "STRING" } } } }
                    }
                };

                const storyResult = await generateText(ideaPrompt, "Viral content expert", ideaSchema);
                setStoryDetails(storyResult);
                await delay(2000);

                // 2. Generate scenes
                setLoadingMsg(`Cycle ${cycleNum}: Creating storyboard...`);
                const sceneCount = 8;

                const scenePrompt = `Create ${sceneCount} viral video scenes for: ${topic.title}
                    Story: ${storyResult.plot}
                    Style: ${style.value}
                    Make each scene visually stunning and shareable.`;

                const sceneSchema = {
                    type: "ARRAY",
                    items: { type: "OBJECT", properties: { scene_description: { type: "STRING" }, narrator_script: { type: "STRING" } }, required: ["scene_description", "narrator_script"] }
                };

                cycleScenesResult = await generateText(scenePrompt, `${sceneCount} scenes`, sceneSchema);
                setScenes(cycleScenesResult);
                await delay(2000);

                // 3. Generate images
                setLoadingMsg(`Cycle ${cycleNum}: Generating images...`);

                for (let i = 0; i < cycleScenesResult.length && !autoModeShouldStop; i++) {
                    try {

                        // GLOBAL PROMPT INJECTION (LUTs, Symbolism)
                        let globalModifiers = "";
                        if (lutData?.luts?.[0]) {
                            globalModifiers += `, ${lutData.luts[0].grading_keywords}, ${lutData.luts[0].emotion} mood`;
                        }
                        if (symbolismData?.motifs) {
                            const sceneNum = i + 1;
                            symbolismData.motifs.forEach(motif => {
                                if (motif.target_scenes?.includes(sceneNum)) {
                                    globalModifiers += `. Symbolism: ${motif.visual_prompt}`;
                                }
                            });
                        }

                        const img = await generateImageRobust(
                            `Viral thumbnail style. ${cycleScenesResult[i].scene_description}. ${style.value}${globalModifiers}. 8K, dramatic, attention-grabbing.`,
                            [], '16:9'
                        );
                        cycleSceneImages[i] = img;
                        setSceneImages(prev => ({ ...prev, [i]: img }));
                        setScenesGeneratedCount(i + 1);
                        await delay(1500);
                    } catch (e) { console.error(e); }
                }

                // 4. Generate video prompts
                setLoadingMsg(`Cycle ${cycleNum}: Creating AI video prompts...`);
                await delay(2000);

                for (let i = 0; i < cycleScenesResult.length && !autoModeShouldStop; i++) {
                    try {
                        const vp = await generateVideoPromptText(i, cycleScenesResult);
                        cycleVideoPrompts[i] = JSON.stringify(vp, null, 2);
                        setVideoPrompts(prev => ({ ...prev, [i]: JSON.stringify(vp, null, 2) }));
                        await delay(1500);
                    } catch (e) { console.error(e); }
                }

                // 5. Download ZIP
                if (Object.keys(cycleSceneImages).length > 0) {
                    setLoadingMsg(`Cycle ${cycleNum}: Downloading...`);

                    const { default: JSZip } = await import('https://esm.sh/jszip@3.10.1');
                    const zip = new JSZip();
                    const folderName = `viral_${topic.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`;
                    const root = zip.folder(folderName);

                    const scenesFolder = root.folder("scenes");
                    Object.entries(cycleSceneImages).forEach(([idx, img]) => {
                        if (img?.includes('base64,')) scenesFolder.file(`scene_${String(Number(idx) + 1).padStart(3, '0')}.png`, img.split(',')[1], { base64: true });
                    });

                    root.file("script.txt", `TOPIC: ${topic.title}\nHOOK: ${topic.hook}\nSTYLE: ${style.label}\n\nSTORY:\n${storyResult.plot}\n\nSCENES:\n${cycleScenesResult.map((s, i) => `[${i + 1}] ${s.scene_description}`).join('\n')}`);

                    const promptsFolder = root.folder("video_prompts");
                    Object.entries(cycleVideoPrompts).forEach(([idx, p]) => { if (p) promptsFolder.file(`scene_${String(Number(idx) + 1).padStart(3, '0')}.json`, p); });

                    const blob = await zip.generateAsync({ type: "blob" });
                    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${folderName}.zip`; a.click();
                }

                setLoadingMsg(`Cycle ${cycleNum} complete! Next in 5s...`);
                await delay(5000);

            } catch (err) {
                console.error(`Full auto cycle ${cycleNum} error:`, err);
                await delay(5000);
            }
        }

        setAutoModeRunning(false);
        setLoading(false);
    };

    const stopAutomation = () => {
        setAutoModeShouldStop(true);
        setLoadingMsg('Stopping...');
    };

    // NEW FUNCTION: Download Script Text
    const handleDownloadScript = () => {
        if (!storyDetails || scenes.length === 0) return;

        let content = `TITLE: ${formData.title}\n`;
        content += `DURATION: ${formData.duration}\n`;
        content += `SCENE DURATION: ${sceneDuration}s\n`;
        content += `STYLE: ${formData.visualStyle}\n`;
        content += `PLOT: ${storyDetails.plot}\n\n`;

        if (creativeContext) {
            content += `--- CREATIVE BIBLE ---\n`;
            content += `Casting Notes: ${creativeContext.casting_notes}\n`;
            content += `Costume Notes: ${creativeContext.costume_notes}\n`;
            content += `Location Notes: ${creativeContext.location_notes}\n\n`;
        }

        content += `--- SCENE BREAKDOWN ---\n`;
        scenes.forEach((scene, idx) => {
            content += `\n[SCENE ${idx + 1} - ${(idx * sceneDuration)}s to ${((idx + 1) * sceneDuration)}s]\n`;
            content += `Visual: ${scene.scene_description}\n`;
            content += `Action/Audio: ${scene.narrator_script}\n`;
            if (scene.cinematography) content += `Camera: ${scene.cinematography.angle}, ${scene.cinematography.lighting}\n`;
            if (scene.lyric_line) content += `Lyric: ${scene.lyric_line}\n`;
            if (videoPrompts[idx]) content += `AI Video Prompt: ${videoPrompts[idx]}\n`;
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${formData.title.replace(/[^a-z0-9]/gi, '_') || 'script'}_breakdown.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        if (!sceneGenerationActive || scenes.length === 0) return;
        const nextIndex = scenes.findIndex((_, idx) => !sceneImages[idx]);
        if (nextIndex === -1) { setSceneGenerationActive(false); return; }
        if (sceneLoading === nextIndex) return;

        const generateSceneImage = async (index) => {
            setSceneLoading(index);
            const scene = scenes[index];

            // --- NEW CHECK: Is it Lyric Video? ---
            const isLyricVideo = formData.projectType === 'Lyric Video';
            const lyricText = scene.lyric_line || scene.narrator_script; // Text to display

            let prompt = "";

            if (isLyricVideo) {
                // --- LYRIC VIDEO MODE (UPDATED) ---

                // Check if it's an instrumental section
                const isInstrumental = !lyricText ||
                    lyricText.trim() === "" ||
                    lyricText.toLowerCase().includes("(instrumental)") ||
                    lyricText.toLowerCase().includes("[instrumental]") ||
                    lyricText.toLowerCase().includes("instrumental break");

                // 1. BASIC INSTRUCTION
                prompt = `Cinematic Lyric Video Still Frame. `;

                if (isInstrumental) {
                    // --- INSTRUMENTAL CASE: NO TEXT ---
                    prompt += `FOCUS: Strictly on the BACKGROUND ATMOSPHERE and VISUAL MOOD. DO NOT RENDER ANY TEXT. NO LYRICS. `;
                    prompt += `SCENE VISUALS: ${scene.scene_description}. The image should be an abstract, high-energy, or moody background that represents the music without words. `;
                } else {
                    // --- LYRIC CASE: RENDER TEXT ---
                    prompt += `FOCUS: Strictly on the TEXT (Lyrics) and BACKGROUND ATMOSPHERE. NO music visualizers, spectrums, or sound waves. `;

                    // 2. RHYTHMIC ENERGY: Dynamic background based on rhythm
                    prompt += `BACKGROUND ATMOSPHERE: ${scene.scene_description}. The background image should shift energetically and rhythmically with the song's tempo and bass (e.g., flashing lights, changing landscapes, dynamic colors). `;

                    // 3. TEXT RENDERING: Kinetic Typography and Font Matching
                    prompt += `TEXT RENDERING: Render the lyric text "${lyricText}" prominently in the center. Use high-quality 3D kinetic typography or bold cinematic title fonts. The font style must be CONSISTENT and MATCH the mood of the lyrics and song style (e.g., Bold Sans-Serif for modern songs, Handwritten for emotional songs). `;

                    // 4. READABILITY: High Contrast
                    prompt += `READABILITY: Ensure text is clearly legible with HIGH CONTRAST against the background. Use shadows or outlines if needed. `;
                }

                // 5. STYLES AND SETTINGS
                prompt += `STYLE: ${storyDetails.style}. ${formData.directorRefs ? `Reference Style: ${formData.directorRefs}.` : ''} `;
                prompt += `LIGHTING: ${cineSettings.lighting} (matching background energy). `;
                prompt += `CAMERA: ${cineSettings.lens} (Cinematic framing). `;

                // 6. QUALITY ENHANCERS
                prompt += `QUALITY: 8K, ultra-high resolution, sharp focus, bold colors, trending on YouTube, visually stunning effects, perfect for lyric videos.`;

            } else {
                // --- NORMAL CINEMATIC MODE ---
                prompt = `Objective: Generate an ultra-realistic movie scene. `;

                prompt += `Scene Description: ${scene.scene_description}. Action: ${scene.narrator_script}. `;

                // Inject Cinematography Settings (Enhanced)
                if (cineSettings.lens) prompt += ` Camera: ${cineSettings.lens}, shallow depth of field.`;
                if (cineSettings.era) prompt += ` Aesthetics: ${cineSettings.era} film look.`;
                if (cineSettings.lighting) prompt += ` Lighting: ${cineSettings.lighting}, crisp shadows, volumetric fog.`;
                if (cineSettings.mode) prompt += ` Shooting Mode: ${cineSettings.mode}.`;

                // Inject Camera Movement style from regeneration settings
                if (videoGenSettings.camera && videoGenSettings.camera !== 'Dynamic') {
                    prompt += ` Camera Movement: ${videoGenSettings.camera}.`;
                }

                // NEW: Inject structured details if available (from JSON mode)
                if (scene.cinematography) {
                    prompt += ` Detailed Camera Angle: ${scene.cinematography.angle}. Lighting Setup: ${scene.cinematography.lighting}. Mood: ${scene.cinematography.mood}.`;
                }
                if (scene.setting) {
                    prompt += ` Environment: ${scene.setting.location}. Background Elements: ${scene.setting.details || ''}.`;
                }
                if (scene.subject) {
                    prompt += ` Subject Focus: ${scene.subject.appearance || ''} performing ${scene.subject.action}.`;
                }

                // Inject Creative Bible details if available
                if (creativeContext) {
                    prompt += ` Wardrobe: ${creativeContext.costume_notes}. `;
                    prompt += ` Location Atmosphere: ${creativeContext.location_notes}. `;
                }

                // Visual Style & Quality Enhhancers (Nano Banana Pro)
                prompt += ` Visual Style: ${storyDetails.style}. ${formData.directorRefs ? `Reference Style: ${formData.directorRefs}.` : ''}`;
                prompt += ` Quality: Ultra-realistic, perceptual realism, indexicality, haptic visuality, cinematic qualia, sharp details, high clarity, cinematic blur, 8k resolution.`;
            }

            const charsInScene = scene.characters_in_scene || [];
            const refImages = [];
            const charDescriptions = [];

            if (formData.useCharacters) {
                charsInScene.forEach(charName => {
                    const charObj = storyDetails.characters.find(c => c.name.toLowerCase().includes(charName.toLowerCase()) || charName.toLowerCase().includes(c.name.toLowerCase()));
                    if (charObj) {
                        // Use new structured character fields if present
                        const desc = charObj.appearance
                            ? `${charObj.appearance}, wearing ${charObj.clothing || 'standard outfit'}, ${charObj.accessories || ''}`
                            : charObj.description;
                        charDescriptions.push(desc);

                        // --- ADDED: Strict Identity Logic ---
                        // Check if this is the Main Character (index 0) and we have a strict upload
                        const isProtagonist = storyDetails.characters.indexOf(charObj) === 0;

                        if (isProtagonist && uploadedRefImage) {
                            // PRIORITIZE THE UPLOADED FILE for "No Change" result
                            refImages.push({ data: uploadedRefImage, mimeType: "image/png" });
                        } else {
                            // Otherwise use the generated character sheet
                            const imgKey = `char-${charObj.name}`;
                            const imgData = elementImages[imgKey];
                            if (imgData) refImages.push({ data: imgData, mimeType: "image/png" });
                        }
                        // ------------------------------------
                    }
                });

                if (charDescriptions.length > 0) {
                    prompt += ` Featuring characters: ${charDescriptions.join('. ')}.`;
                    if (refImages.length > 0) prompt += ` Use provided reference images for consistency.`;
                }
            } else {
                prompt += ` NO CHARACTERS. Focus on environment and atmosphere.`;
            }

            // --- GLOBAL PRODUCTION & INTEGRATION PACK INJECTION ---
            if (lutData && lutData.luts && lutData.luts.length > 0) {
                const activeLUT = lutData.luts[0]; // Logic: Use first generated LUT as 'Project Look'
                prompt += ` Visual Mood & Grading: ${activeLUT.grading_keywords}, emotional atmosphere of ${activeLUT.emotion}.`;
            }

            if (symbolismData && symbolismData.motifs) {
                symbolismData.motifs.forEach(motif => {
                    if (motif.target_scenes && motif.target_scenes.includes(index + 1)) {
                        prompt += ` SYMBOLISM: Feature a clear visual motif of ${motif.visual_prompt} representing ${motif.meaning}.`;
                    }
                });
            }

            if (smartScheduleData && smartScheduleData.schedule) {
                // Enhance location details if available in schedule
                smartScheduleData.schedule.forEach(day => {
                    if (day.scenes_in_block.includes(index + 1)) {
                        prompt += ` Production Note: Filmed at ${day.location_name}.`;
                    }
                });
            }

            // --- FACE CONSISTENCY MODE (AI Actor Deepfake) ---
            if (faceConsistencyMode && lockedFaceImage) {
                prompt += ` CRITICAL FACE LOCK: The main character's face MUST be IDENTICAL to the provided reference face image. Preserve exact facial features, bone structure, skin tone, and proportions. The reference face is the ONLY source of truth for facial identity.`;
                // Add locked face as first reference image (highest priority)
                refImages.unshift({ data: lockedFaceImage, mimeType: "image/png" });
            }

            // --- AI LIPSYNC GENERATOR ---
            if (lipsyncMode && scene.lyric_line && !scene.lyric_line.toLowerCase().includes('instrumental')) {
                const lyricText = scene.lyric_line;
                const mouthOpenDesc = lipsyncSettings.mouthOpenness === 'subtle' ? 'slightly parted lips, subtle singing' :
                    lipsyncSettings.mouthOpenness === 'exaggerated' ? 'wide open mouth, powerful singing expression' :
                        'naturally open mouth, mid-word singing expression';

                const expressionDesc = lipsyncSettings.expressionStyle === 'dramatic' ? 'intense, powerful, emotive facial expression' :
                    lipsyncSettings.expressionStyle === 'anime' ? 'anime-style expressive face with exaggerated emotions' :
                        'natural, authentic singing expression';

                prompt += ` LIPSYNC: The character is actively SINGING the lyric "${lyricText}". Show ${mouthOpenDesc} with ${expressionDesc}. Capture the emotional tone and energy of these words in the facial expression. Eyes should convey the mood of the lyrics.`;
            }

            try {
                // Aspect Ratio Control: Lyric videos often use vertical (9:16) or square (1:1), 
                // but user selection is important, so we use videoGenSettings.aspectRatio.
                const img = await generateImageRobust(prompt, refImages, videoGenSettings.aspectRatio);
                setSceneImages(prev => ({ ...prev, [index]: img }));
                setScenesGeneratedCount(prev => prev + 1);
            } catch (e) {
                console.error(`Failed scene ${index}`, e);
                setSceneGenerationActive(false);
            } finally {
                setSceneLoading(null);
            }
        };
        generateSceneImage(nextIndex);
    }, [sceneGenerationActive, scenes, sceneImages, sceneLoading, storyDetails, elementImages, formData.directorRefs, formData.useCharacters, creativeContext, cineSettings, videoGenSettings.aspectRatio, videoGenSettings.camera, formData.projectType, faceConsistencyMode, lockedFaceImage, lipsyncMode, lipsyncSettings, lutData, symbolismData, smartScheduleData]); // Added prompts global dependencies

    const handleDownloadZip = async () => {
        setLoading(true);
        setLoadingMsg("Preparing ZIP file...");
        try {
            // @ts-ignore
            const { default: JSZip } = await import('https://esm.sh/jszip@3.10.1');
            const zip = new JSZip();
            const safeTitle = formData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'storyboard';
            const folderName = safeTitle + "_project";
            const root = zip.folder(folderName);

            // 1. Add Scene Images
            const scenesFolder = root.folder("scenes");
            let hasScenes = false;
            Object.keys(sceneImages).forEach(idx => {
                const imgData = sceneImages[Number(idx)];
                if (imgData && imgData.includes('base64,')) {
                    const base64Data = imgData.split(',')[1];
                    scenesFolder.file(`scene_${String(Number(idx) + 1).padStart(3, '0')}.png`, base64Data, { base64: true });
                    hasScenes = true;
                }
            });

            // 2. Add Element Images (Characters, Locations, Items)
            const elementsFolder = root.folder("elements");
            Object.keys(elementImages).forEach(key => {
                const imgData = elementImages[key];
                if (imgData && imgData.includes('base64,')) {
                    const base64Data = imgData.split(',')[1];
                    elementsFolder.file(`${key}.png`, base64Data, { base64: true });
                }
            });

            // 3. Add Storyboard Text/Script
            if (storyDetails) {
                let scriptContent = `TITLE: ${formData.title}\n`;
                scriptContent += `DURATION: ${formData.duration}\n`;
                scriptContent += `STYLE: ${formData.visualStyle}\n`;
                scriptContent += `PLOT SUMMARY: ${storyDetails.plot || ''}\n\n`;

                if (creativeContext) {
                    scriptContent += `--- CREATIVE BIBLE ---\n`;
                    scriptContent += `Casting Notes: ${creativeContext.casting_notes}\n`;
                    scriptContent += `Costume Notes: ${creativeContext.costume_notes}\n`;
                    scriptContent += `Location Notes: ${creativeContext.location_notes}\n\n`;
                }

                scriptContent += `--- SCENES ---\n`;
                scenes.forEach((scene, idx) => {
                    scriptContent += `\n[SCENE ${idx + 1}]\n`;
                    scriptContent += `Visual: ${scene.scene_description}\n`;
                    scriptContent += `Action/Audio: ${scene.narrator_script}\n`;
                    if (scene.cinematography) scriptContent += `Camera: ${scene.cinematography.angle}, ${scene.cinematography.lighting}\n`;
                    if (scene.lyric_line) scriptContent += `Lyric: ${scene.lyric_line}\n`;
                    if (videoPrompts[idx]) scriptContent += `AI Video Prompt: ${videoPrompts[idx]}\n`;
                });

                // Add generated text content if available
                if (pitchData) root.file("director_pitch.txt", pitchData);
                if (shotListData) root.file("shot_list.txt", typeof shotListData === 'string' ? shotListData : JSON.stringify(shotListData, null, 2));
                if (vfxData) root.file("vfx_breakdown.txt", vfxData);
                if (soundData) root.file("sound_design.txt", soundData);
                if (beatSheetData) root.file("beat_sheet.txt", beatSheetData);
                if (characterArcData) root.file("character_arcs.txt", characterArcData);
                if (legalData) root.file("legal_forms.txt", legalData);
                if (grantData) root.file("grant_application.txt", grantData);
                if (distributionData) root.file("distribution_strategy.txt", distributionData);
                if (pressData) root.file("press_release.txt", pressData);

                root.file("storyboard_script.txt", scriptContent);
            }

            // 4. Add Project JSON (Backup)
            const projectData = {
                formData, ideas, selectedIdea, storyDetails, scenes,
                creativeContext, pitchData, lyricsSynced,
                costumeData, locationScoutData,
                marketingData, propData, easterEggData, castingData,
                choreographyData, paletteData, scheduleData, safetyData,
                shotListData, cineSettings, vfxData, soundData, critiqueData,
                videoGenSettings, albumCover, legalData, beatSheetData, characterArcData,
                merchData, grantData, fanTheoryData, canvasData, distributionData, pressData
            };
            root.file("project_data.json", JSON.stringify(projectData, null, 2));

            // Generate
            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${folderName}.zip`;
            a.click();
            window.URL.revokeObjectURL(url);

        } catch (e) {
            console.error("ZIP Generation Error:", e);
            setError(t.errorGeneric + " (ZIP Error)");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProject = () => {
        try {
            const projectData = {
                step, formData, ideas, selectedIdea, storyDetails, scenes,
                videoPrompts, creativeContext,
                pitchData, lyricsSynced, costumeData, locationScoutData,
                marketingData, propData, easterEggData, castingData, choreographyData,
                paletteData, scheduleData, safetyData, shotListData, cineSettings,
                vfxData, soundData, critiqueData, videoGenSettings, albumCover,
                legalData, beatSheetData, characterArcData, merchData, grantData,
                fanTheoryData, canvasData, distributionData, pressData
            };
            const blob = new Blob([JSON.stringify(projectData)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${formData.title.replace(/[^a-z0-9]/gi, '_') || 'project'}_musicvideo.json`; a.click(); URL.revokeObjectURL(url);
        } catch (e) { setError(t.errorGeneric); }
    };

    const handleLoadProject = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                if (event.target?.result && typeof event.target.result === 'string') {
                    const data = JSON.parse(event.target.result);
                    if (data.step) setStep(data.step);
                    if (data.formData) setFormData(data.formData);
                    if (data.ideas) setIdeas(data.ideas);
                    if (data.selectedIdea) setSelectedIdea(data.selectedIdea);
                    if (data.storyDetails) setStoryDetails(data.storyDetails);
                    if (data.scenes) setScenes(data.scenes);
                    if (data.creativeContext) setCreativeContext(data.creativeContext);
                    if (data.elementImages) setElementImages(data.elementImages);
                    if (data.sceneImages) setSceneImages(data.sceneImages);
                    if (data.cineSettings) setCineSettings(data.cineSettings);
                    if (data.videoGenSettings) setVideoGenSettings(data.videoGenSettings);
                    // ... load others
                    if (data.sceneImages) { setScenesGeneratedCount(Object.keys(data.sceneImages).length); }
                }
            } catch (err) { setError("Invalid project file"); }
        };
        reader.readAsText(file); e.target.value = '';
    };

    // New Feature: Move Scene
    const moveScene = (index, direction) => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === scenes.length - 1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap Scenes array
        const newScenes = [...scenes];
        [newScenes[index], newScenes[newIndex]] = [newScenes[newIndex], newScenes[index]];
        setScenes(newScenes);

        // Swap Images Object (Tricky because it's object keys)
        const newImages = { ...sceneImages };
        const img1 = newImages[index];
        const img2 = newImages[newIndex];
        // Perform Swap logic for keys
        if (img2) newImages[index] = img2; else delete newImages[index];
        if (img1) newImages[newIndex] = img1; else delete newImages[newIndex];
        setSceneImages(newImages);

        // Swap Video Prompts
        const newPrompts = { ...videoPrompts };
        const p1 = newPrompts[index];
        const p2 = newPrompts[newIndex];
        if (p2) newPrompts[index] = p2; else delete newPrompts[index];
        if (p1) newPrompts[newIndex] = p1; else delete newPrompts[newIndex];
        setVideoPrompts(newPrompts);
    };

    // New Feature: Regenerate All
    const handleRegenerateAllScenes = () => {
        setShowRegenerateModal(true);
    };

    const confirmRegenerateAll = () => {
        setShowRegenerateModal(false);
        // Clear all existing images
        setSceneImages({});
        setScenesGeneratedCount(0);
        setSceneGenerationActive(true);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleResetStoryboardClick = () => {
        setShowResetBoardModal(true);
    };

    const confirmResetStoryboard = () => {
        setShowResetBoardModal(false);
        // Stop audio if playing
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setPlayingAudio(null);

        // Clear state
        setScenes([]);
        setSceneImages({});
        setVideoPrompts({});
        setScenesGeneratedCount(0);
        setSceneGenerationActive(false);
        // Clear derived data
        setAudioCache({});
        setLyricsSynced(false);
        setPropData(null);
        setShotListData(null);
        setVfxData(null);
        setSoundData(null);
        setScheduleData(null);
        setSafetyData(null);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-blue-500/30">
            {/* Session Recovery Dialog */}
            {showRecoveryDialog && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                <RotateCcw className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Session Recovery</h3>
                                <p className="text-sm text-gray-400">Found previous unsaved work</p>
                            </div>
                        </div>

                        {recoveryData && (
                            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 mb-6">
                                <p className="text-sm text-gray-300 mb-2">
                                    <span className="font-bold text-white">Title:</span> {recoveryData.formData?.title || 'Untitled Project'}
                                </p>
                                {recoveryData.scenes?.length > 0 && (
                                    <p className="text-sm text-gray-300 mb-2">
                                        <span className="font-bold text-white">Scenes:</span> {recoveryData.scenes.length} scenes
                                    </p>
                                )}
                                <p className="text-xs text-gray-500">
                                    Saved {new Date(recoveryData.timestamp).toLocaleString()}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={handleRecoverSession}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-5 h-5" />
                                Recover Session
                            </button>
                            <button
                                onClick={handleDismissRecovery}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-3 px-4 rounded-xl transition-all"
                            >
                                Start Fresh
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20"><Camera className="w-6 h-6" /></div>
                        <h1 className="text-xl font-bold tracking-tight hidden sm:block">{t.appTitle}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleSaveProject} className="hidden md:flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-700 transition-colors text-blue-300" title={t.saveProject}><Save className="w-4 h-4" />{t.saveProject}</button>
                        <button onClick={() => fileInputRef.current?.click()} className="hidden md:flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-700 transition-colors text-green-300" title={t.loadProject}><FolderOpen className="w-4 h-4" />{t.loadProject}</button>
                        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleLoadProject} />
                        {step !== 'FORM' && (
                            <div className="flex gap-2 ml-2 border-l border-gray-700 pl-2">
                                <button onClick={handleEditInputs} className="text-sm font-medium bg-gray-800 hover:bg-blue-600 px-3 py-1 rounded text-white transition-colors">{t.editInputs}</button>
                                <button onClick={() => setShowConfirmModal(true)} className="text-sm font-medium text-gray-400 hover:text-red-400 transition-colors" title={t.startOver}><RotateCcw className="w-4 h-4" /></button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="p-6">
                {step === 'PROJECT_TYPE' && (
                    <StepProjectType
                        onSelect={(type) => { setFormData({ ...formData, projectType: type }); setStep('FORM'); }}
                        onOpenTemplates={() => setShowQuickStartModal(true)}
                    />
                )}

                {/* Quick Start Templates Modal */}
                <QuickStartModal
                    isOpen={showQuickStartModal}
                    onClose={() => setShowQuickStartModal(false)}
                    onSelectTemplate={handleSelectTemplate}
                />

                {/* Storyboard Grid View Modal */}
                <StoryboardGridView
                    isOpen={showGridView}
                    onClose={() => setShowGridView(false)}
                    scenes={scenes}
                    sceneImages={sceneImages}
                    onSelectScene={(idx) => { setShowGridView(false); /* scroll to scene */ }}
                    sceneDuration={sceneDuration}
                    t={t}
                />

                {step === 'FORM' && (
                    <StepForm formData={formData} setFormData={setFormData} generateIdeas={generateIdeas} suggestStyle={handleSmartStyleAnalysis} isSuggesting={isSuggestingStyle} t={t} cineSettings={cineSettings} setCineSettings={setCineSettings} sceneDuration={sceneDuration} setSceneDuration={setSceneDuration} onBackToProjectType={() => setStep('PROJECT_TYPE')} />
                )}

                {step === 'IDEAS' && (
                    <div className="animate-in fade-in duration-500">
                        {/* Full Auto Mode Banner */}
                        <div className="max-w-2xl mx-auto mb-6">
                            <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 border-2 border-orange-500 rounded-xl p-5 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                            <Zap className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                🚀 Full Auto Mode
                                            </h3>
                                            <p className="text-xs text-orange-200">Viral topics, no input needed</p>
                                        </div>
                                    </div>
                                    {!autoModeRunning ? (
                                        <button
                                            onClick={runFullAutomation}
                                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg"
                                        >
                                            <Zap className="w-5 h-5" /> Start Full Auto
                                        </button>
                                    ) : (
                                        <button
                                            onClick={stopAutomation}
                                            className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 animate-pulse"
                                        >
                                            <Ban className="w-5 h-5" /> Stop ({autoModeCycleCount} cycles)
                                        </button>
                                    )}
                                </div>
                                {autoModeRunning && (
                                    <div className="mt-4 pt-4 border-t border-orange-500/30">
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                                            <span className="text-sm text-orange-200 truncate">{autoModeCurrentStyle}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <StepIdeas ideas={ideas} selectIdea={selectIdea} generateIdeas={generateIdeas} t={t} goBack={handleEditInputs} formData={formData} />
                    </div>
                )}

                {step === 'DETAILS' && (
                    <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-700 pb-20">
                        <div className="flex justify-between items-center mb-8 sticky top-0 bg-gray-900/95 backdrop-blur py-4 z-40 border-b border-gray-800">
                            <button onClick={() => setStep('IDEAS')} className="text-gray-400 hover:text-white flex items-center gap-2">&larr; {t.backToIdeas}</button>
                            <h2 className="text-xl font-bold text-white hidden md:block">{formData.title}</h2>
                            <div className="flex gap-2 flex-wrap justify-end">
                                {/* Grid View Button */}
                                {scenes.length > 0 && (
                                    <button onClick={() => setShowGridView(true)} className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20 transition-all border border-blue-600/50" title="Storyboard Grid View">
                                        <Images className="w-4 h-4" /> Grid
                                    </button>
                                )}
                                {/* AI Transitions Button */}
                                {scenes.length > 1 && (
                                    <button onClick={handleGenerateTransitions} className="flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-purple-900/20 transition-all border border-purple-500/50" title="AI Scene Transitions">
                                        <ArrowRight className="w-4 h-4" /> Transitions ✨
                                    </button>
                                )}
                                <button onClick={handleGeneratePitch} className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-pink-900/20 transition-all border border-pink-400/50" title={t.generatePitch}><FileText className="w-4 h-4" /></button>
                                <button onClick={handleGenerateBeatSheet} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-amber-900/20 transition-all border border-amber-400/50" title={t.beatSheet}><BookOpen className="w-4 h-4" /> ✨</button>
                                <button onClick={handleGenerateCharacterArc} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-rose-900/20 transition-all border border-rose-400/50" title={t.characterArc}><Heart className="w-4 h-4" /> ✨</button>

                                {formData.useCharacters && (<button onClick={handleGenerateCostumes} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-purple-900/20 transition-all border border-purple-400/50" title={t.costumeDesigner}><Shirt className="w-4 h-4" /></button>)}
                                <button onClick={handleGeneratePalette} className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-fuchsia-900/20 transition-all border border-fuchsia-400/50" title={t.aiColorist}><Paintbrush className="w-4 h-4" /></button>

                                {/* NEW GEMINI FEATURES */}
                                <button onClick={handleLyricAssist} className="flex items-center gap-2 bg-pink-500 hover:bg-pink-400 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-pink-900/20 transition-all border border-pink-400/50" title={t.lyricAssistant}><PenTool className="w-4 h-4" /> ✨</button>
                                <button onClick={handleGenerateBudget} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all border border-emerald-400/50" title={t.budgetEstimator}><Calculator className="w-4 h-4" /> ✨</button>
                                <button onClick={handleGenerateEndings} className="flex items-center gap-2 bg-violet-500 hover:bg-violet-400 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-violet-900/20 transition-all border border-violet-400/50" title={t.altEndings}><Shuffle className="w-4 h-4" /> ✨</button>

                                <button onClick={handleLocationScout} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all border border-indigo-400/50" title={t.locationScout}><Globe className="w-4 h-4" /></button>
                                <button onClick={handleGenerateAlbumArt} className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-sky-900/20 transition-all border border-sky-400/50" title={t.albumArt}><Disc className="w-4 h-4" /> ✨</button>

                                <button onClick={handleMarketingCampaign} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-orange-900/20 transition-all border border-orange-400/50" title={t.marketingCampaign}><Megaphone className="w-4 h-4" /></button>
                                <button onClick={handleGenerateMerch} className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-pink-900/20 transition-all border border-pink-400/50" title={t.merchDesigner}><ShoppingBag className="w-4 h-4" /> ✨</button>
                                <button onClick={handleGenerateProps} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-teal-900/20 transition-all border border-teal-400/50" title={t.propMaster}><Search className="w-4 h-4" /></button>
                                <button onClick={handleGenerateEasterEggs} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20 transition-all border border-blue-400/50" title={t.easterEggArchitect}><Gift className="w-4 h-4" /></button>
                                <button onClick={handleGenerateFanTheories} className="flex items-center gap-2 bg-orange-700 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-orange-900/20 transition-all border border-orange-500/50" title={t.fanTheories}><HelpCircle className="w-4 h-4" /> ✨</button>
                                <button onClick={handleGenerateCanvas} className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-green-900/20 transition-all border border-green-500/50" title={t.spotifyCanvas}><Smartphone className="w-4 h-4" /> ✨</button>
                                <button onClick={handleGenerateDistribution} className="flex items-center gap-2 bg-cyan-700 hover:bg-cyan-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-cyan-900/20 transition-all border border-cyan-500/50" title={t.distributionStrategy}><Send className="w-4 h-4" /> ✨</button>
                                <button onClick={handleGeneratePressRelease} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-slate-900/20 transition-all border border-slate-500/50" title={t.pressRelease}><Newspaper className="w-4 h-4" /> ✨</button>

                                {/* BATCH 2 NEW BUTTONS */}
                                <button onClick={handleGenerateSocial} className="flex items-center gap-2 bg-pink-700 hover:bg-pink-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-pink-900/20 transition-all border border-pink-500/50" title={t.socialCaptions}><MessageSquare className="w-4 h-4" /> ✨</button>
                                <button onClick={handleGenerateEmail} className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all border border-indigo-500/50" title={t.labelEmail}><Mail className="w-4 h-4" /> ✨</button>
                                <button onClick={handleGenerateMoodboard} className="flex items-center gap-2 bg-fuchsia-700 hover:bg-fuchsia-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-fuchsia-900/20 transition-all border border-fuchsia-500/50" title={t.moodboard}><Layout className="w-4 h-4" /> ✨</button>

                                {/* Fixed syntax error here: removed extra )} */}
                                <button onClick={handleGenerateCallSheet} className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20 transition-all border border-blue-600/50" title={t.callSheet}><CalendarCheck className="w-4 h-4" /> ✨</button>

                                {scenes.length > 0 && (<button onClick={handleCheckContinuity} className="flex items-center gap-2 bg-yellow-700 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-yellow-900/20 transition-all border border-yellow-500/50" title={t.continuity}><AlertTriangle className="w-4 h-4" /> ✨</button>)}

                                <button onClick={handleFocusGroup} className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all border border-emerald-500/50" title={t.focusGroup}><Users className="w-4 h-4" /> ✨</button>
                                <button onClick={handleSequelPitch} className="flex items-center gap-2 bg-purple-800 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-purple-900/20 transition-all border border-purple-600/50" title={t.sequelPitch}><FastForward className="w-4 h-4" /> ✨</button>

                                {formData.useCharacters && (<button onClick={handleCastingDirector} className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-yellow-900/20 transition-all border border-yellow-400/50" title={t.castingDirector}><Star className="w-4 h-4" /> ✨</button>)}
                                <button onClick={handleChoreographer} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-cyan-900/20 transition-all border border-cyan-400/50" title={t.choreographer}><Activity className="w-4 h-4" /> ✨</button>

                                {/* NEW CREATIVE TOOLS */}
                                {scenes.length > 0 && (<button onClick={handleVFXSupervisor} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-red-900/20 transition-all border border-red-400/50" title={t.vfxSupervisor}><Zap className="w-4 h-4" /> VFX</button>)}
                                {scenes.length > 0 && (<button onClick={handleSoundDesigner} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-violet-900/20 transition-all border border-violet-400/50" title={t.soundDesigner}><Speaker className="w-4 h-4" /> SFX</button>)}
                                {scenes.length > 0 && (<button onClick={handleDirectorCritique} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-gray-900/20 transition-all border border-gray-400/50" title={t.directorCritique}><MessageCircle className="w-4 h-4" /> ?</button>)}

                                {scenes.length > 0 && (<button onClick={handleGenerateSchedule} className="flex items-center gap-2 bg-lime-600 hover:bg-lime-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-lime-900/20 transition-all border border-lime-400/50" title={t.shootingSchedule}><Calendar className="w-4 h-4" /> ✨</button>)}
                                {scenes.length > 0 && (<button onClick={handleGenerateSafety} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-rose-900/20 transition-all border border-rose-400/50" title={t.aiSafety}><ShieldCheck className="w-4 h-4" /> ✨</button>)}
                                {scenes.length > 0 && (<button onClick={handleGenerateShotList} className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-slate-900/20 transition-all border border-slate-400/50" title={t.aiShotList}><FileSpreadsheet className="w-4 h-4" /> ✨</button>)}
                                {scenes.length > 0 && (<button onClick={handleGenerateLegal} className="flex items-center gap-2 bg-zinc-600 hover:bg-zinc-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-zinc-900/20 transition-all border border-zinc-400/50" title={t.legalAssistant}><ScrollText className="w-4 h-4" /> ✨</button>)}
                                {scenes.length > 0 && (<button onClick={handleGenerateGrant} className="flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-amber-900/20 transition-all border border-amber-500/50" title={t.grantWriter}><Landmark className="w-4 h-4" /> ✨</button>)}

                                {/* ADVANCED AI CREATIVE FEATURES */}
                                <button onClick={() => setShowFaceConsistencyPanel(true)} className={`flex items-center gap-2 ${faceConsistencyMode ? 'bg-purple-500' : 'bg-purple-800'} hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-purple-900/20 transition-all border ${faceConsistencyMode ? 'border-purple-300' : 'border-purple-600/50'}`} title="AI Actor Mode (Face Lock)">
                                    <User className="w-4 h-4" /> {faceConsistencyMode ? '🔒 Face' : 'Face Lock'}
                                </button>
                                <button onClick={() => setShowLipsyncModal(true)} className={`flex items-center gap-2 ${lipsyncMode ? 'bg-pink-500' : 'bg-pink-800'} hover:bg-pink-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-pink-900/20 transition-all border ${lipsyncMode ? 'border-pink-300' : 'border-pink-600/50'}`} title="AI Lipsync Generator">
                                    <Mic2 className="w-4 h-4" /> {lipsyncMode ? '🎤 Lipsync' : 'Lipsync'}
                                </button>
                                <button onClick={() => setShowBeatSyncModal(true)} className={`flex items-center gap-2 ${analyzedBPM ? 'bg-cyan-500' : 'bg-cyan-800'} hover:bg-cyan-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-cyan-900/20 transition-all border ${analyzedBPM ? 'border-cyan-300' : 'border-cyan-600/50'}`} title="Beat-Sync Visual Generator">
                                    <Music2 className="w-4 h-4" /> {analyzedBPM ? `${analyzedBPM} BPM` : 'Beat-Sync'}
                                </button>
                                {scenes.length > 0 && Object.keys(sceneImages).length > 0 && (
                                    <button onClick={() => setShowStyleTransferModal(true)} className="flex items-center gap-2 bg-fuchsia-800 hover:bg-fuchsia-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-fuchsia-900/20 transition-all border border-fuchsia-600/50" title="Real-time Style Transfer">
                                        <Paintbrush className="w-4 h-4" /> Style Transfer
                                    </button>
                                )}
                                {/* FAN REACTION PREDICTOR */}
                                {scenes.length > 0 && (
                                    <button onClick={handleFanReactionPredictor} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-purple-900/20 transition-all border border-purple-400/50" title="🔮 Fan Reaction Predictor">
                                        🔮 Reactions
                                    </button>
                                )}

                                {/* ===== NEW CREATIVE FEATURES BUNDLE ===== */}
                                {scenes.length > 0 && (
                                    <>
                                        {/* 1. Emotion Timeline */}
                                        <button onClick={handleEmotionTimeline} className="flex items-center gap-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all" title="AI Emotion Timeline">
                                            🎭 Emotion
                                        </button>
                                        {/* 2. Morph Transitions */}
                                        <button onClick={handleMorphTransitions} className="flex items-center gap-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all" title="AI Scene Morph Transitions">
                                            🔄 Morph
                                        </button>
                                        {/* 4. Metaphor Engine */}
                                        <button onClick={handleMetaphorEngine} className="flex items-center gap-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all" title="Lyrics-to-Visual Metaphor">
                                            ✨ Metaphor
                                        </button>
                                        {/* 5. Social Cropper */}
                                        <button onClick={handleSocialCropper} className="flex items-center gap-1 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all" title="Social Media Auto-Cropper">
                                            📱 Crop
                                        </button>
                                        {/* 6. Music Visualizer */}
                                        <button onClick={handleMusicVisualizer} className="flex items-center gap-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all" title="AI Music Visualizer Overlay">
                                            🎵 Visualizer
                                        </button>
                                        {/* 7. Grok Export */}
                                        <button onClick={handleGrokExport} className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all" title="Grok.ai Export Package">
                                            📦 Grok
                                        </button>
                                    </>
                                )}

                                <button onClick={handleSaveProject} className="md:hidden p-2 bg-gray-800 rounded-full text-blue-300"><Save className="w-4 h-4" /></button>
                                <button onClick={() => fileInputRef.current?.click()} className="md:hidden p-2 bg-gray-800 rounded-full text-green-300"><FolderOpen className="w-4 h-4" /></button>

                                {/* Auto-Mode Button */}
                                {!autoModeRunning ? (
                                    <button
                                        onClick={runAutomationCycle}
                                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-900/30 hover:scale-105"
                                    >
                                        <Zap className="w-4 h-4" /> 🤖 Auto-Mode
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopAutomation}
                                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all animate-pulse"
                                    >
                                        <Ban className="w-4 h-4" /> Stop
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Automation Status Panel - Always visible when running */}
                        {autoModeRunning && (
                            <div className="mb-6 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-2 border-cyan-500 rounded-xl p-5 shadow-lg shadow-cyan-900/30 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center animate-pulse">
                                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white">🤖 Auto-Generation Running</h4>
                                            <p className="text-sm text-cyan-300 mt-1">Style: {autoModeCurrentStyle}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-4xl font-bold text-white">{autoModeCycleCount}</p>
                                            <p className="text-xs text-gray-400 uppercase">Cycles</p>
                                        </div>
                                        <button
                                            onClick={stopAutomation}
                                            className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105"
                                        >
                                            <Ban className="w-5 h-5" /> Stop After Cycle
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <div className="flex justify-between mb-4">
                                    <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2"><Film className="w-5 h-5" /> {t.summary}</h3>
                                    <button onClick={() => navigator.clipboard.writeText(storyDetails.plot)} className="text-gray-500 hover:text-white"><Copy className="w-4 h-4" /></button>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{storyDetails.plot}</p>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative">
                                <div className="flex justify-between mb-4">
                                    <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2"><Sparkles className="w-5 h-5" /> {t.style}</h3>
                                    <button onClick={handleGeneratePalette} className="text-xs bg-purple-600/30 hover:bg-purple-600 text-purple-200 px-3 py-1 rounded-full border border-purple-500/30 flex items-center gap-2 transition-colors"><Paintbrush className="w-3 h-3" /> {t.aiColorist} ✨</button>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">{storyDetails.style}</p>
                            </div>
                        </div>

                        <div className="space-y-12 mb-16">
                            {formData.useCharacters && (
                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-bold text-white flex items-center gap-3"><User className="text-blue-500" /> {t.characters}</h3>
                                        <button onClick={handleAddCharacter} className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 transition-colors"><PlusCircle className="w-4 h-4" /> {t.addCharacter}</button>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-4">{t.charHint}</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {storyDetails.characters.map((c, i) => (
                                            <ElementCard key={i} type="char" item={c} onRegenerate={regenerateSingleElement} onUpload={handleImageUpload} elementImages={elementImages} elementLoading={elementLoading} elementErrors={elementErrors} t={t} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-white flex items-center gap-3"><MapPin className="text-green-500" /> {t.locations}</h3>
                                    <button onClick={handleLocationScout} className="flex items-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg border border-indigo-400/50 shadow-lg shadow-indigo-900/20 transition-colors font-semibold"><Globe className="w-4 h-4" /> {t.locationScout} ✨</button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {storyDetails.locations.map((c, i) => (
                                        <ElementCard key={i} type="loc" item={c} onRegenerate={regenerateSingleElement} onUpload={handleImageUpload} elementImages={elementImages} elementLoading={elementLoading} elementErrors={elementErrors} t={t} />
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><Box className="text-orange-500" /> {t.items}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {storyDetails.items.map((c, i) => (
                                        <ElementCard key={i} type="item" item={c} onRegenerate={regenerateSingleElement} onUpload={handleImageUpload} elementImages={elementImages} elementLoading={elementLoading} elementErrors={elementErrors} t={t} />
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="border-t border-gray-800 pt-12">
                            <div className="flex flex-col items-center mb-12">

                                {/* Always visible button */}
                                <button onClick={generateStoryboardText} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xl font-bold py-6 px-12 rounded-2xl shadow-2xl hover:scale-105 transition-transform flex items-center gap-4 mb-8">
                                    <Film className="w-8 h-8" />
                                    {scenes.length > 0 ? "Regenerate Storyboard Script" : t.generateStoryboard}
                                </button>

                                {scenes.length > 0 && (
                                    <div className="w-full max-w-4xl">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-white font-mono">{t.generating}: {scenesGeneratedCount} / {scenes.length}</span>
                                            <div className="flex gap-2">
                                                {scenes.length > 0 && (<button onClick={handleResetStoryboardClick} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-red-500/50 shadow-lg shadow-red-900/20"><RotateCcw className="w-4 h-4" /> {t.resetStoryboard}</button>)}
                                                {scenes.length > 0 && (<button onClick={handleRegenerateAllScenes} className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-orange-500/50 shadow-lg shadow-orange-900/20"><RefreshCcw className="w-4 h-4" /> {t.regenerateAll}</button>)}
                                                {scenes.length > 0 && (<button onClick={handleDownloadScript} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-blue-500/50 shadow-lg shadow-blue-900/20"><FileText className="w-4 h-4" /> Script Only</button>)}
                                                {scenes.length > 0 && (<button onClick={handleGenerateAllVideoPrompts} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-indigo-500/50 shadow-lg shadow-indigo-900/20"><ListVideo className="w-4 h-4" /> {t.generateVideoPrompts}</button>)}
                                                {scenes.length > 0 && (<button onClick={handleDownloadZip} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-green-500/50 shadow-lg shadow-green-900/20"><Download className="w-4 h-4" /> {t.downloadZip}</button>)}
                                                {scenes.length > 0 && (<button onClick={handleGenerateTransitions} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-purple-500/50 shadow-lg shadow-purple-900/20"><ArrowRight className="w-4 h-4" /> {t.transitionPlanner || 'Transitions'} ✨</button>)}
                                                {scenes.length > 0 && (<button onClick={() => setShowColorGradePanel(true)} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-fuchsia-500/50 shadow-lg shadow-fuchsia-900/20"><Palette className="w-4 h-4" /> {t.colorGrading || 'Color Grade'} ✨</button>)}
                                                {storyDetails && !autoModeRunning && (<button onClick={runAutomationCycle} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-cyan-500/50 shadow-lg shadow-cyan-900/20 animate-pulse"><Zap className="w-4 h-4" /> {t.automationMode || '🤖 Auto-Mode'}</button>)}
                                                {autoModeRunning && (<button onClick={stopAutomation} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-red-500/50 shadow-lg shadow-red-900/20 animate-pulse"><Ban className="w-4 h-4" /> {t.automationStop || 'Stop'}</button>)}
                                            </div>
                                        </div>

                                        {/* Automation Status Panel */}
                                        {autoModeRunning && (
                                            <div className="mb-6 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/50 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                                                        <div>
                                                            <h4 className="text-white font-bold flex items-center gap-2">
                                                                🤖 {t.automationRunning || 'Automation Running'}
                                                            </h4>
                                                            <p className="text-xs text-cyan-300">{autoModeCurrentStyle}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold text-white">{autoModeCycleCount}</p>
                                                            <p className="text-xs text-gray-400">{t.automationCycle || 'Cycle'}</p>
                                                        </div>
                                                        <button
                                                            onClick={stopAutomation}
                                                            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
                                                        >
                                                            <Ban className="w-4 h-4" /> {t.automationStop || 'Stop'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* PRODUCTION INTELLIGENCE TOOLS */}
                                        <div className="flex flex-wrap justify-center gap-3 mb-6 animate-in fade-in slide-in-from-bottom-3">
                                            <button onClick={handleLUTGenerator} disabled={loading} className="bg-fuchsia-900/40 hover:bg-fuchsia-800/60 text-fuchsia-200 border border-fuchsia-500/30 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
                                                Mood & LUTs
                                            </button>
                                            <button onClick={handleSymbolismTracker} disabled={loading} className="bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-200 border border-indigo-500/30 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                                Symbolism Tracker
                                            </button>
                                            <button onClick={handleSmartSchedule} disabled={loading} className="bg-blue-900/40 hover:bg-emerald-800/60 text-emerald-200 border border-emerald-500/30 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                                                Smart Schedule
                                            </button>
                                        </div>

                                        {/* NEW: Insert Video Settings Panel Here */}
                                        <VideoSettingsPanel settings={videoGenSettings} setSettings={setVideoGenSettings} t={t} />

                                        <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden mb-8"><div className="bg-blue-500 h-full transition-all duration-300 ease-out" style={{ width: `${(scenesGeneratedCount / scenes.length) * 100}%` }}></div></div>
                                        {!lyricsSynced && scenes.length > 0 && (<div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom-2"><button onClick={handleSyncLyrics} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white text-lg font-bold py-3 px-8 rounded-xl shadow-xl flex items-center gap-3 transform transition-all hover:scale-105"><Music2 className="w-6 h-6" /> {t.syncLyrics}</button></div>)}

                                        {/* Scene Search & Filter */}
                                        {scenes.length > 0 && (
                                            <SceneSearchFilter
                                                scenes={scenes}
                                                sceneImages={sceneImages}
                                                sceneDuration={sceneDuration}
                                                onFilterChange={setFilteredScenes}
                                                t={t}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>

                            {scenes.length > 0 && (
                                <>
                                    {/* Results count */}
                                    {filteredScenes.length < scenes.length && (
                                        <div className="mb-4 text-center text-gray-400 text-sm">
                                            Showing {filteredScenes.length} of {scenes.length} scenes
                                        </div>
                                    )}

                                    {filteredScenes.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {filteredScenes.map((scene, idx) => {
                                                // Find original index in scenes array for sceneImages access
                                                const originalIdx = scenes.indexOf(scene);
                                                return (
                                                    <div key={idx} data-scene-index={idx} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg flex flex-col h-full group relative">
                                                        <div className="absolute z-20 top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => moveScene(idx, 'up')} disabled={idx === 0} className="bg-black/50 hover:bg-black/80 text-white p-1 rounded disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                                                            <button onClick={() => moveScene(idx, 'down')} disabled={idx === scenes.length - 1} className="bg-black/50 hover:bg-black/80 text-white p-1 rounded disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                                                        </div>

                                                        <div className="aspect-video bg-black relative flex items-center justify-center group shrink-0">
                                                            <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs font-mono text-white z-10">{t.scene} {String(idx + 1).padStart(2, '0')}</div>
                                                            {sceneImages[idx] ? (
                                                                <>
                                                                    <img src={sceneImages[idx]} className="w-full h-full object-cover transition-all duration-300" alt={`Scene ${idx + 1}`} style={{ filter: COLOR_GRADE_PRESETS.find(p => p.id === activeColorGrade)?.filter || 'none' }} />
                                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                        <button onClick={() => openEditModal(idx)} className="bg-purple-600/80 hover:bg-purple-600 p-2 rounded-full backdrop-blur text-white shadow-lg" title={t.magicEdit}><Wand2 className="w-4 h-4" /></button>
                                                                        <button onClick={() => { setSceneImages(p => { const n = { ...p }; delete n[idx]; return n; }); setSceneGenerationActive(true); }} className="bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur text-white shadow-lg" title={t.regenerateImage}><RotateCcw className="w-4 h-4" /></button>
                                                                        <button onClick={() => handleGenerateVideoPrompt(idx)} className="bg-green-600/80 hover:bg-green-600 p-2 rounded-full backdrop-blur text-white shadow-lg flex items-center justify-center" disabled={videoPromptLoading[idx]}>{videoPromptLoading[idx] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}</button>
                                                                    </div>
                                                                </>
                                                            ) : sceneLoading === idx ? (
                                                                <div className="flex flex-col items-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" /><span className="text-xs text-blue-400">Loading...</span></div>
                                                            ) : (
                                                                <div className="text-gray-700 flex flex-col items-center"><ImageIcon className="w-8 h-8 mb-2" /><span className="text-xs">Waiting</span></div>
                                                            )}
                                                        </div>
                                                        <div className="p-4 flex flex-col flex-grow">
                                                            {scene.lyric_line && (<div className="mb-2 bg-blue-900/30 border border-blue-500/30 rounded-lg p-2"><span className="text-[10px] text-blue-300 font-bold flex items-center gap-1 mb-1"><MessageSquareQuote className="w-3 h-3" /> {t.lyricLine}</span><p className="text-sm text-blue-100 italic">"{scene.lyric_line}"</p></div>)}
                                                            <p className="text-white text-sm font-medium mb-2 line-clamp-2" title={scene.scene_description}>{scene.scene_description}</p>
                                                            <p className="text-gray-500 text-xs italic border-l-2 border-gray-600 pl-2 line-clamp-2 mb-3">"{scene.narrator_script}"</p>
                                                            <div className="mt-auto space-y-2">
                                                                <button onClick={() => playScript(idx, scene.narrator_script)} className={`flex items-center gap-2 text-xs font-bold py-1 px-2 rounded w-max transition-colors ${playingAudio === idx ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                                                                    {playingAudio === idx ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}{playingAudio === idx ? t.reading : t.readScript}
                                                                </button>
                                                                <div className="mt-2">
                                                                    <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">{t.videoPrompt}</label>
                                                                    {videoPrompts[idx] ? (
                                                                        <div className="relative group/prompt">
                                                                            <textarea readOnly value={videoPrompts[idx]} className="w-full bg-gray-950 font-mono text-[10px] text-green-400 border border-green-900/50 rounded p-2 h-32 resize-none focus:outline-none focus:ring-1 focus:ring-green-500 scrollbar-thin scrollbar-thumb-gray-700 whitespace-pre" />
                                                                            <button onClick={() => navigator.clipboard.writeText(videoPrompts[idx])} className="absolute top-1 right-1 bg-gray-800 hover:bg-gray-700 p-1 rounded text-gray-300 hover:text-white opacity-0 group-hover/prompt:opacity-100 transition-opacity" title="Copy"><Copy className="w-3 h-3" /></button>
                                                                        </div>
                                                                    ) : (
                                                                        <div onClick={() => handleGenerateVideoPrompt(idx)} className="w-full bg-gray-900/30 border border-gray-800 border-dashed rounded h-20 flex flex-col items-center justify-center text-gray-600 hover:text-gray-400 hover:border-gray-600 cursor-pointer transition-colors">
                                                                            {videoPromptLoading[idx] ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Video className="w-4 h-4 mb-1" /><span className="text-[9px]">{t.clickToGenerate}</span></>}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20">
                                            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                            <p className="text-gray-400 text-lg">No scenes match your filters</p>
                                            <p className="text-gray-600 text-sm mt-2">Try adjusting your search or filters</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </main>
            {loading && <LoadingOverlay msg={loadingMsg} />}
            <ConfirmModal isOpen={showConfirmModal} onConfirm={confirmStartOver} onCancel={() => setShowConfirmModal(false)} t={t} />
            <RegenerateModal isOpen={showRegenerateModal} onClose={() => setShowRegenerateModal(false)} onConfirm={confirmRegenerateAll} settings={videoGenSettings} setSettings={setVideoGenSettings} t={t} />
            <ResetBoardModal isOpen={showResetBoardModal} onClose={() => setShowResetBoardModal(false)} onConfirm={confirmResetStoryboard} t={t} />
            <EditSceneModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} onConfirm={applyMagicEdit} currentImage={editingSceneIndex !== null ? sceneImages[editingSceneIndex] : null} t={t} />
            <TextContentModal isOpen={showPitchModal} onClose={() => setShowPitchModal(false)} title={t.pitchPacket} content={pitchData} icon={FileText} color="text-pink-500" t={t} />
            <TextContentModal isOpen={showBeatSheetModal} onClose={() => setShowBeatSheetModal(false)} title={t.beatSheetTitle} content={beatSheetData} icon={BookOpen} color="text-amber-500" t={t} />
            <TextContentModal isOpen={showCharacterArcModal} onClose={() => setShowCharacterArcModal(false)} title={t.characterArcTitle} content={characterArcData} icon={Heart} color="text-rose-500" t={t} />
            {/* Selection Modals - INTERACTIVE */}
            <SelectionModal isOpen={showCostumeModal} onClose={() => setShowCostumeModal(false)} title={t.costumes} options={costumeData} onSelect={applyCostumeOption} icon={Shirt} color="text-purple-500" t={t} />
            <SelectionModal isOpen={showLocationScoutModal} onClose={() => setShowLocationScoutModal(false)} title={t.realWorldLocations} options={locationScoutData} onSelect={applyLocationOption} icon={Globe} color="text-indigo-500" t={t} />
            <SelectionModal isOpen={showPaletteModal} onClose={() => setShowPaletteModal(false)} title={t.colorPalette} options={paletteData} onSelect={applyPaletteOption} icon={Paintbrush} color="text-fuchsia-500" t={t} />
            {/* Other Info Modals */}
            <TextContentModal isOpen={showMarketingModal} onClose={() => setShowMarketingModal(false)} title={t.socialMediaPlan} content={marketingData} icon={Megaphone} color="text-orange-500" t={t} />
            <TextContentModal isOpen={showPropModal} onClose={() => setShowPropModal(false)} title={t.propMasterList} content={propData} icon={Search} color="text-teal-500" t={t} />
            <TextContentModal isOpen={showEasterEggModal} onClose={() => setShowEasterEggModal(false)} title={t.easterEggIdeas} content={easterEggData} icon={Gift} color="text-blue-500" t={t} />
            <TextContentModal isOpen={showCastingModal} onClose={() => setShowCastingModal(false)} title={t.castingSuggestions} content={castingData} icon={Star} color="text-yellow-500" t={t} />
            <TextContentModal isOpen={showChoreographyModal} onClose={() => setShowChoreographyModal(false)} title={t.choreographyGuide} content={choreographyData} icon={Activity} color="text-cyan-500" t={t} />
            <TextContentModal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} title={t.schedulePlan} content={scheduleData} icon={Calendar} color="text-lime-500" t={t} />
            <TextContentModal isOpen={showSafetyModal} onClose={() => setShowSafetyModal(false)} title={t.safetyReport} content={safetyData} icon={ShieldCheck} color="text-rose-500" t={t} />
            <TextContentModal isOpen={showShotListModal} onClose={() => setShowShotListModal(false)} title={t.shotListGuide} content={shotListData} icon={FileSpreadsheet} color="text-slate-500" t={t} />
            <TextContentModal isOpen={showVFXModal} onClose={() => setShowVFXModal(false)} title={t.vfxBreakdown} content={vfxData} icon={Zap} color="text-red-500" t={t} />
            <TextContentModal isOpen={showSoundModal} onClose={() => setShowSoundModal(false)} title={t.soundPlan} content={soundData} icon={Speaker} color="text-violet-500" t={t} />
            <TextContentModal isOpen={showCritiqueModal} onClose={() => setShowCritiqueModal(false)} title={t.critiqueReport} content={critiqueData} icon={MessageCircle} color="text-gray-400" t={t} />

            {/* NEW GEMINI MODALS */}
            <TextContentModal isOpen={showBudgetModal} onClose={() => setShowBudgetModal(false)} title={t.budgetReport} content={budgetData} icon={Calculator} color="text-emerald-500" t={t} />
            <TextContentModal isOpen={showLyricsModal} onClose={() => setShowLyricsModal(false)} title={t.lyricIdeas} content={lyricsData} icon={PenTool} color="text-pink-500" t={t} />
            <TextContentModal isOpen={showEndingsModal} onClose={() => setShowEndingsModal(false)} title={t.endingsTitle} content={endingsData} icon={Shuffle} color="text-violet-500" t={t} />

            {/* AI Scene Transitions */}
            <TextContentModal isOpen={showTransitionModal} onClose={() => setShowTransitionModal(false)} title="Scene Transition Suggestions" content={transitionData} icon={ArrowRight} color="text-purple-500" t={t} />

            <TextContentModal isOpen={showFanTheoryModal} onClose={() => setShowFanTheoryModal(false)} title={t.fanTheoryTitle} content={fanTheoryData} icon={HelpCircle} color="text-orange-500" t={t} />
            <TextContentModal isOpen={showCanvasModal} onClose={() => setShowCanvasModal(false)} title={t.canvasTitle} content={canvasData} icon={Smartphone} color="text-green-500" t={t} />
            <TextContentModal isOpen={showDistributionModal} onClose={() => setShowDistributionModal(false)} title={t.distroTitle} content={distributionData} icon={Send} color="text-cyan-500" t={t} />
            <TextContentModal isOpen={showPressModal} onClose={() => setShowPressModal(false)} title={t.pressTitle} content={pressData} icon={Newspaper} color="text-slate-500" t={t} />

            {/* BATCH 2 NEW MODALS */}
            <TextContentModal isOpen={showSocialModal} onClose={() => setShowSocialModal(false)} title={t.socialTitle} content={socialData} icon={MessageSquare} color="text-pink-500" t={t} />
            <TextContentModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} title={t.emailTitle} content={emailData} icon={Mail} color="text-indigo-500" t={t} />
            <MerchModal isOpen={showMoodboardModal} onClose={() => setShowMoodboardModal(false)} title={t.moodboardTitle} merchData={moodboardData ? { items: [{ name: moodboardData.title, description: moodboardData.palette_description }], strategy: "Visual Reference", visualImage: moodboardData.visualImage } : null} icon={Layout} color="text-fuchsia-500" t={t} />

            {/* BATCH 3 NEW MODALS */}
            <TextContentModal isOpen={showCrowdModal} onClose={() => setShowCrowdModal(false)} title={t.crowdTitle} content={crowdData} icon={Coins} color="text-green-500" t={t} />
            <TextContentModal isOpen={showCallSheetModal} onClose={() => setShowCallSheetModal(false)} title={t.callSheetTitle} content={callSheetData} icon={CalendarCheck} color="text-blue-500" t={t} />
            <TextContentModal isOpen={showContinuityModal} onClose={() => setShowContinuityModal(false)} title={t.continuityTitle} content={continuityData} icon={AlertTriangle} color="text-yellow-500" t={t} />

            <TextContentModal isOpen={showFocusGroupModal} onClose={() => setShowFocusGroupModal(false)} title={t.focusTitle} content={focusGroupData} icon={Users} color="text-emerald-500" t={t} />
            <TextContentModal isOpen={showSequelModal} onClose={() => setShowSequelModal(false)} title={t.sequelTitle} content={sequelData} icon={FastForward} color="text-purple-500" t={t} />

            {/* NEW MODALS */}
            <MerchModal isOpen={showMerchModal} onClose={() => setShowMerchModal(false)} title={t.merchTitle} merchData={merchData} icon={ShoppingBag} color="text-pink-500" t={t} />
            <AlbumArtModal isOpen={showAlbumModal} onClose={() => setShowAlbumModal(false)} title={t.albumCoverTitle} albumCover={albumCover} icon={Disc} color="text-sky-500" t={t} />
            <TextContentModal isOpen={showLegalModal} onClose={() => setShowLegalModal(false)} title={t.legalTitle} content={legalData} icon={ScrollText} color="text-zinc-500" t={t} />
            <TextContentModal isOpen={showGrantModal} onClose={() => setShowGrantModal(false)} title={t.grantTitle} content={grantData} icon={Landmark} color="text-amber-500" t={t} />

            {/* ADVANCED AI CREATIVE FEATURES MODALS */}
            <LipsyncPanel
                isOpen={showLipsyncModal}
                onClose={() => setShowLipsyncModal(false)}
                settings={lipsyncSettings}
                setSettings={setLipsyncSettings}
                isEnabled={lipsyncMode}
                setIsEnabled={setLipsyncMode}
            />
            <FaceConsistencyPanel
                isOpen={showFaceConsistencyPanel}
                onClose={() => setShowFaceConsistencyPanel(false)}
                onLockFace={handleLockFace}
                currentFace={lockedFaceImage}
                isLocked={faceConsistencyMode}
                onUnlock={handleUnlockFace}
            />
            <BeatSyncModal
                isOpen={showBeatSyncModal}
                onClose={() => setShowBeatSyncModal(false)}
                beatData={beatSyncData}
                scenes={scenes}
                sceneDuration={sceneDuration}
                setSceneDuration={setSceneDuration}
                onApplyCuts={handleApplyBeatSync}
                loading={loading}
                onAnalyze={handleAnalyzeBPM}
            />
            <StyleTransferModal
                isOpen={showStyleTransferModal}
                onClose={() => setShowStyleTransferModal(false)}
                scenes={scenes}
                sceneImages={sceneImages}
                onPreview={handleStyleTransferPreview}
                preview={styleTransferPreview}
                loading={styleTransferLoading}
                intensity={styleIntensity}
                setIntensity={setStyleIntensity}
                onApplyStyle={handleApplyStyleTransfer}
            />
            <FanReactionModal
                isOpen={showFanReactionModal}
                onClose={() => setShowFanReactionModal(false)}
                data={fanReactionData}
                scenes={scenes}
                sceneImages={sceneImages}
            />

            {/* ===== NEW CREATIVE FEATURES BUNDLE - MODALS ===== */}
            <EmotionTimelineModal
                isOpen={showEmotionTimelineModal}
                onClose={() => setShowEmotionTimelineModal(false)}
                data={emotionTimelineData}
                scenes={scenes}
            />
            <ParallaxModal
                isOpen={showParallaxModal}
                onClose={() => setShowParallaxModal(false)}
                data={parallaxData}
            />
            <MorphTransitionModal
                isOpen={showMorphTransitionModal}
                onClose={() => setShowMorphTransitionModal(false)}
                data={morphTransitionData}
            />
            <MetaphorModal
                isOpen={showMetaphorModal}
                onClose={() => setShowMetaphorModal(false)}
                data={metaphorData}
            />
            <SocialCropModal
                isOpen={showSocialCropModal}
                onClose={() => setShowSocialCropModal(false)}
                data={socialCropData}
            />
            <MusicVisualizerModal
                isOpen={showMusicVisualizerModal}
                onClose={() => setShowMusicVisualizerModal(false)}
                data={musicVisualizerData}
            />
            <GrokExportModal
                isOpen={showGrokExportModal}
                onClose={() => setShowGrokExportModal(false)}
                data={grokExportData}
                progress={grokExportProgress}
                onDownload={downloadGrokExport}
            />

            {/* BATCH 4 PRODUCTION INTELLIGENCE MODALS */}
            <LUTModal
                isOpen={showLUTModal}
                onClose={() => setShowLUTModal(false)}
                data={lutData}
            />
            <SymbolismModal
                isOpen={showSymbolismModal}
                onClose={() => setShowSymbolismModal(false)}
                data={symbolismData}
            />
            <SmartScheduleModal
                isOpen={showSmartScheduleModal}
                onClose={() => setShowSmartScheduleModal(false)}
                data={smartScheduleData}
            />

            {
                error && (
                    <div className="fixed bottom-6 right-6 bg-red-900/90 border border-red-700 text-white p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10 z-50">
                        <AlertCircle className="w-6 h-6" />
                        <div><p className="font-bold">Error</p><p className="text-sm text-red-200">{error}</p></div>
                        <button onClick={() => setError(null)} className="ml-auto hover:bg-red-800 p-1 rounded">X</button>
                    </div>
                )
            }

            {/* Color Palette Panel */}
            <ColorPalettePanel
                isOpen={showPalettePanel}
                onClose={() => setShowPalettePanel(false)}
                palette={projectPalette}
                loading={extractingPalette}
            />

            {/* Color Grading Preview Panel */}
            <ColorGradePreviewPanel
                isOpen={showColorGradePanel}
                onClose={() => setShowColorGradePanel(false)}
                activeGrade={activeColorGrade}
                setActiveGrade={setActiveColorGrade}
                sceneImages={sceneImages}
                t={t}
            />

            {/* Keyboard Shortcuts Help Modal */}
            {
                showShortcutsHelp && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Keyboard className="w-7 h-7 text-blue-500" />
                                    Keyboard Shortcuts
                                </h2>
                                <button onClick={() => setShowShortcutsHelp(false)} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* General */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">General</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                                            <span className="text-gray-300">Save Project</span>
                                            <kbd className="px-3 py-1 bg-gray-700 rounded border border-gray-600 text-blue-300 font-mono text-sm">Ctrl+S</kbd>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                                            <span className="text-gray-300">Close Modal</span>
                                            <kbd className="px-3 py-1 bg-gray-700 rounded border border-gray-600 text-blue-300 font-mono text-sm">Esc</kbd>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                                            <span className="text-gray-300">Show this help</span>
                                            <kbd className="px-3 py-1 bg-gray-700 rounded border border-gray-600 text-blue-300 font-mono text-sm">?</kbd>
                                        </div>
                                    </div>
                                </div>

                                {/* Editing */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Editing <span className="text-yellow-500 text-xs">(Coming Soon)</span></h3>
                                    <div className="space-y-2 opacity-60">
                                        <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                                            <span className="text-gray-300">Undo</span>
                                            <kbd className="px-3 py-1 bg-gray-700 rounded border border-gray-600 text-gray-400 font-mono text-sm">Ctrl+Z</kbd>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                                            <span className="text-gray-300">Redo</span>
                                            <kbd className="px-3 py-1 bg-gray-700 rounded border border-gray-600 text-gray-400 font-mono text-sm">Ctrl+Y</kbd>
                                        </div>
                                    </div>
                                </div>

                                {/* Scene Navigation */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Scene Navigation <span className="text-blue-500 text-xs">(In Storyboard)</span></h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                                            <span className="text-gray-300">Previous Scene</span>
                                            <kbd className="px-3 py-1 bg-gray-700 rounded border border-gray-600 text-blue-300 font-mono text-sm">←</kbd>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                                            <span className="text-gray-300">Next Scene</span>
                                            <kbd className="px-3 py-1 bg-gray-700 rounded border border-gray-600 text-blue-300 font-mono text-sm">→</kbd>
                                        </div>
                                    </div>
                                </div>

                                {/* Playback */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Playback</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                                            <span className="text-gray-300">Play/Pause Audio</span>
                                            <kbd className="px-3 py-1 bg-gray-700 rounded border border-gray-600 text-blue-300 font-mono text-sm">Space</kbd>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                                <p className="text-sm text-blue-300 text-center">
                                    💡 Tip: Press <kbd className="px-2 py-0.5 bg-blue-800/50 rounded text-xs">?</kbd> anytime to see this menu
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

// --- CINEMATIC PROMPT ARCHITECT MODAL ---
const CinematicPromptArchitectModal = ({ isOpen, onClose, generateText, t }) => {
    if (!isOpen) return null;

    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [params, setParams] = useState({
        angle: '',
        scale: '',
        lens: '',
        customAngle: ''
    });
    const [generatedPrompt, setGeneratedPrompt] = useState("");

    const ANGLES = [
        { id: 'low_angle', label: 'Low Angle', desc: 'Powerful, dominating feeling', icon: <ArrowDown className="w-4 h-4" /> },
        { id: 'high_angle', label: 'High Angle', desc: 'Vulnerability, overview', icon: <ArrowUp className="w-4 h-4" /> },
        { id: 'eye_level', label: 'Eye Level', desc: 'Neutral, personal connection', icon: <Eye className="w-4 h-4" /> },
        { id: 'dutch_angle', label: 'Dutch Angle', desc: 'Disorientation, tension', icon: <RotateCcw className="w-4 h-4" /> },
        { id: 'overhead', label: 'Overhead', desc: 'God-like view, layout focus', icon: <Globe className="w-4 h-4" /> }
    ];

    const SCALES = [
        { id: 'extreme_cu', label: 'Extreme Close-Up', desc: 'Eye details, texture focus' },
        { id: 'close_up', label: 'Close-Up', desc: 'Face/Subject emotion' },
        { id: 'medium', label: 'Medium Shot', desc: 'Waist up, standard interaction' },
        { id: 'wide', label: 'Wide Shot', desc: 'Subject + Environment' },
        { id: 'extreme_wide', label: 'Extreme Wide', desc: 'Massive landscape, tiny subject' }
    ];

    const LENSES = [
        { id: '16mm', label: '16mm Ultra-Wide', desc: 'Distorted, dynamic perspective' },
        { id: '35mm', label: '35mm Classic', desc: 'Reportage, natural field of view' },
        { id: '50mm', label: '50mm Standard', desc: 'Human eye perspective' },
        { id: '85mm', label: '85mm Portrait', desc: 'Flattering compression, bokeh' },
        { id: '200mm', label: '200mm Telephoto', desc: 'Compressed background, isolation' }
    ];

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setImage(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!image) {
            alert("Please upload a reference image first.");
            return;
        }
        setLoading(true);
        setGeneratedPrompt("");

        try {
            // Prepare attachments
            const attachments = [{
                data: image,
                mimeType: "image/png" // Assessing PNG/JPEG generically
            }];

            const prompt = `
            Analyze the attached reference image and generate a professional, high-end technical cinematography prompt.
            
            USER SETTINGS:
            - Camea Angle: ${params.angle || 'Auto-detect from image'} ${params.customAngle ? `(Custom: ${params.customAngle})` : ''}
            - Shot Scale: ${params.scale || 'Auto-detect from image'}
            - Lens Choice: ${params.lens || 'Auto-detect from image'}

            INSTRUCTIONS:
            1. Describe the SUBJECT and ACTION in the image clearly (Visual Description).
            2. Describe the LIGHTING (key light, rim light, mood, shadows).
            3. Describe the COLOR GRADE (palette, tone, atmosphere).
            4. COMBINE into a single cohesive Midjourney-style prompt.
            5. APPEND the technical camera specs at the end (e.g., "--ar 16:9 --v 6.0").

            Format the output strictly as the prompt text only. Do not add markdown or "Here is the prompt".
            `;

            const result = await generateText(prompt, "Expert Cinematographer AI", null, attachments, false);
            setGeneratedPrompt(result);
        } catch (error) {
            console.error(error);
            setGeneratedPrompt("Error generating prompt. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedPrompt);
        alert("Prompt copied to clipboard!");
    };

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/50">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <DraftingCompass className="w-6 h-6 text-indigo-400" />
                            Cinematic Prompt Architect
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">Generate professional technical prompts from reference images.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Left Panel: Inputs */}
                    <div className="w-full md:w-1/3 p-6 overflow-y-auto border-r border-gray-800 bg-gray-900">
                        {/* Image Upload */}
                        <div className="mb-8">
                            <label className="text-sm font-bold text-gray-300 mb-2 block">1. Reference Image (Required)</label>
                            <div className="relative aspect-video bg-gray-800 rounded-xl border-2 border-dashed border-gray-700 hover:border-indigo-500 transition-colors cursor-pointer group overflow-hidden">
                                <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 z-10 cursor-pointer" accept="image/*" />
                                {image ? (
                                    <img src={image} alt="Reference" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 group-hover:text-indigo-400 transition-colors">
                                        <Upload className="w-10 h-10 mb-2" />
                                        <span className="text-xs font-bold">Click or Drop Image</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Camera Angle */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">2. Camera Angle</label>
                            <div className="grid grid-cols-2 gap-2">
                                {ANGLES.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setParams({ ...params, angle: opt.label })}
                                        className={`p-3 rounded-lg border text-left transition-all ${params.angle === opt.label ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            {opt.icon}
                                            <span className="text-xs font-bold">{opt.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="Or type custom angle..."
                                value={params.customAngle}
                                onChange={(e) => setParams({ ...params, customAngle: e.target.value })}
                                className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg p-2 text-xs text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                            />
                        </div>

                        {/* Shot Scale */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">3. Shot Scale</label>
                            <div className="flex flex-wrap gap-2">
                                {SCALES.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setParams({ ...params, scale: opt.label })}
                                        className={`px-3 py-2 rounded-lg border text-xs font-bold transition-all ${params.scale === opt.label ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Lens */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">4. Lens Choice</label>
                            <select
                                value={params.lens}
                                onChange={(e) => setParams({ ...params, lens: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none"
                            >
                                <option value="">Select Lens...</option>
                                {LENSES.map(l => <option key={l.id} value={l.label}>{l.label} - {l.desc}</option>)}
                            </select>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading || !image}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            Generate Technical Prompt
                        </button>
                    </div>

                    {/* Right Panel: Output */}
                    <div className="w-full md:w-2/3 bg-black flex flex-col p-8 items-center justify-center relative">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

                        {generatedPrompt ? (
                            <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 z-10">
                                <h3 className="text-indigo-400 font-mono text-sm mb-4 flex items-center gap-2">
                                    <Terminal className="w-4 h-4" /> GENERATED PROMPT OUTPUT
                                </h3>
                                <div className="bg-gray-900/80 backdrop-blur border border-gray-700 rounded-xl p-6 shadow-2xl relative group">
                                    <p className="text-gray-200 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                        {generatedPrompt}
                                    </p>
                                    <button
                                        onClick={copyToClipboard}
                                        className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors border border-gray-700 opacity-0 group-hover:opacity-100"
                                        title="Copy to Clipboard"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="mt-6 flex justify-center">
                                    <p className="text-xs text-gray-500">Ready for Midjourney / Stable Diffusion</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center opacity-40 z-10">
                                <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6 border border-gray-700">
                                    <Video className="w-10 h-10 text-gray-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Ready to Design</h3>
                                <p className="text-gray-400 max-w-md mx-auto">Upload an image and select your camera parameters to generate a high-fidelity technical prompt.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}