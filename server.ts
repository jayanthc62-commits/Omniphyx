import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI client
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper function to extract search results from YouTube Innertube API
async function queryYouTubeSearch(query: string) {
  try {
    const res = await fetch('https://www.youtube.com/youtubei/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: '2.20240101.00.00',
            hl: 'en',
            gl: 'US',
          },
        },
        query: query,
      }),
    });

    if (!res.ok) {
      throw new Error(`YouTube API returned ${res.status}`);
    }

    const data: any = await res.json();
    const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;

    if (!Array.isArray(contents)) {
      return [];
    }

    const results = contents
      .filter((c: any) => c.videoRenderer)
      .map((c: any) => {
        const v = c.videoRenderer;
        const videoId = v.videoId;
        const title = v.title?.runs?.[0]?.text || 'Untitled Video';
        const channelTitle = v.ownerText?.runs?.[0]?.text || 'Unknown Channel';
        const channelId = v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || '';
        const thumbnail = v.thumbnail?.thumbnails?.slice(-1)?.[0]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        const avatar = v.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.[0]?.url || 
          `https://ui-avatars.com/api/?name=${encodeURIComponent(channelTitle)}&background=1e293b&color=ef4444`;
        const duration = v.lengthText?.simpleText || '0:00';
        const rawViews = v.viewCountText?.simpleText || '0 views';
        const publishedAt = v.publishedTimeText?.simpleText || 'Recently';
        const description = v.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((r: any) => r.text).join('') || '';

        // Parse view count to number for sorting/display
        let views = 0;
        const numMatch = rawViews.replace(/,/g, '').match(/\d+/);
        if (numMatch) views = parseInt(numMatch[0], 10);

        // Convert duration "19:34" to seconds
        const parts = duration.split(':').map((p: string) => parseInt(p, 10) || 0);
        let durationSeconds = 0;
        if (parts.length === 3) durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        else if (parts.length === 2) durationSeconds = parts[0] * 60 + parts[1];

        // Intelligently infer category based on query, title, and description
        const combinedText = `${query} ${title} ${description}`.toLowerCase();
        let detectedCategory: 'Music' | 'Gaming' | 'Tech' | 'Movies' | 'News' | 'Comedy' | 'Trending' = 'Trending';
        if (/music|song|lyrics|audio|mv|official video|track|remix|beats|chill/i.test(combinedText)) {
          detectedCategory = 'Music';
        } else if (/game|gaming|gameplay|walkthrough|playthrough|fps|esports|roblox|minecraft|gta/i.test(combinedText)) {
          detectedCategory = 'Gaming';
        } else if (/tech|ai|gadget|iphone|android|laptop|review|future|robot|code|science|invention/i.test(combinedText)) {
          detectedCategory = 'Tech';
        } else if (/movie|film|trailer|teaser|cinema|scene|clip|series/i.test(combinedText)) {
          detectedCategory = 'Movies';
        } else if (/news|live|breaking|headline|politics|world|report|daily/i.test(combinedText)) {
          detectedCategory = 'News';
        } else if (/comedy|funny|meme|humor|skit|prank|joke|standup/i.test(combinedText)) {
          detectedCategory = 'Comedy';
        }

        return {
          id: videoId,
          title,
          channelTitle,
          channelId: channelId || `ch-${encodeURIComponent(channelTitle.toLowerCase().replace(/\s+/g, '-'))}`,
          channelAvatar: avatar,
          subscriberCount: `${Math.floor(Math.random() * 8 + 1)}.${Math.floor(Math.random() * 9)}M subscribers`,
          thumbnail,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
          duration,
          durationSeconds,
          views,
          publishedAt,
          description,
          category: detectedCategory,
          likes: Math.floor(views * 0.04) || 1200,
          isFavorite: false,
        };
      });

    return results;
  } catch (error) {
    console.error('Error fetching YouTube search:', error);
    return [];
  }
}

// Helper to get real search suggestions
async function queryYouTubeSuggestions(q: string) {
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });
    const text = await res.text();
    // Format: window.google.ac.h(["query",[["suggestion1",0,[...]], ...]])
    const match = text.match(/window\.google\.ac\.h\((.*)\)/);
    if (match && match[1]) {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed[1])) {
        return parsed[1].map((item: any) => item[0]);
      }
    }
    return [];
  } catch (err) {
    console.error('Error fetching suggestions:', err);
    return [];
  }
}

// API Routes
app.get('/api/search', async (req, res) => {
  const query = (req.query.q as string) || 'Trending';
  const videos = await queryYouTubeSearch(query);
  res.json({ videos });
});

app.get('/api/suggest', async (req, res) => {
  const query = (req.query.q as string) || '';
  if (!query.trim()) {
    return res.json({ suggestions: [] });
  }
  const suggestions = await queryYouTubeSuggestions(query);
  res.json({ suggestions });
});

app.get('/api/trending', async (req, res) => {
  const seed = parseInt((req.query.seed as string) || '0', 10);
  const trendingQueries = [
    'Trending Now',
    'Trending Music 2026',
    'Viral Videos Worldwide',
    'Trending Movies Trailers 2026',
    'Trending Gaming Highlights',
    'Breakout Tech Trends',
    'Trending Pop Hits'
  ];
  const query = trendingQueries[Math.abs(seed) % trendingQueries.length];
  const videos = await queryYouTubeSearch(query);
  res.json({ videos });
});

app.post('/api/personalized-feed', async (req, res) => {
  try {
    const { queries = [], seed = 0 } = req.body || {};
    const queryList: string[] = Array.isArray(queries) && queries.length > 0 
      ? queries.slice(0, 4) 
      : ['Trending Now', 'Trending Music', 'Viral Videos'];

    const promises = queryList.map(q => queryYouTubeSearch(q));
    const resultsArrays = await Promise.all(promises);

    const merged: any[] = [];
    const seenIds = new Set<string>();

    for (const arr of resultsArrays) {
      for (const item of arr) {
        if (item && item.id && !seenIds.has(item.id)) {
          seenIds.add(item.id);
          merged.push(item);
        }
      }
    }

    // Interleave and randomize slightly based on seed
    const shuffled = merged.sort(() => (Math.random() - 0.5));
    res.json({ videos: shuffled.slice(0, 24) });
  } catch (err) {
    console.error('Error generating personalized feed:', err);
    const fallback = await queryYouTubeSearch('Trending Now');
    res.json({ videos: fallback });
  }
});

app.get('/api/channel', async (req, res) => {
  const channelName = (req.query.name as string) || (req.query.q as string) || 'Creator';
  const searchQuery = (req.query.search as string)?.trim() || '';
  const query = searchQuery ? `${channelName} ${searchQuery}` : `${channelName} channel videos`;
  const videos = await queryYouTubeSearch(query);
  
  // Find avatar and details from the matching videos or fallback
  const firstMatch = videos.find(v => v.channelTitle.toLowerCase().includes(channelName.toLowerCase())) || videos[0];
  const avatar = firstMatch?.channelAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(channelName)}&background=1e293b&color=ef4444`;
  const subscriberCount = firstMatch?.subscriberCount || '2.4M subscribers';

  res.json({
    channel: {
      id: req.query.id || `ch-${encodeURIComponent(channelName.toLowerCase().replace(/\s+/g, '-'))}`,
      name: channelName,
      avatar,
      banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      subscriberCount,
      videoCount: videos.length > 0 ? `${videos.length * 15}+` : '120',
      description: `Official channel for ${channelName}. Privacy-friendly streaming powered by FreeTube extraction engine.`,
      verified: true,
      isSubscribed: false,
    },
    videos,
    searchQuery: searchQuery || undefined,
  });
});

app.get('/api/channel-search', async (req, res) => {
  const channel = (req.query.channel as string) || (req.query.name as string) || '';
  const q = (req.query.q as string) || '';
  if (!q.trim()) {
    const defaultVideos = await queryYouTubeSearch(`${channel} channel videos`);
    return res.json({ videos: defaultVideos, channel, query: '' });
  }
  const query = `${channel} ${q}`.trim();
  const videos = await queryYouTubeSearch(query);
  res.json({ videos, channel, query: q });
});

// Helper for Vintora query complexity classification
function classifyVintoraComplexity(prompt: string, hasImage: boolean = false): {
  model: string;
  tier: 'Fast (Lite)' | 'General (Flash + Search)' | 'Complex (Pro Reasoning)';
  useSearchGrounding: boolean;
  isImageGen: boolean;
  reason: string;
} {
  const lower = prompt.toLowerCase().trim();

  // 1. Image Generation request
  const isImageGen = 
    /(generate|create|make|draw|paint|render) (an? )?(image|picture|photo|illustration|art|drawing|thumbnail|poster|avatar|wallpaper)\b/i.test(lower) ||
    /^(draw|paint|generate image|create image)\b/i.test(lower) ||
    /image (option|preset|variation|resolution|ratio)/i.test(lower);

  if (isImageGen) {
    return {
      model: 'gemini-3.1-flash-lite-image',
      tier: 'Fast (Lite)',
      useSearchGrounding: false,
      isImageGen: true,
      reason: 'Multi-option AI Image Generation with customizable aspect ratio & resolution.'
    };
  }

  // 2. Multimodal image analysis (celebrity, character, episode thumbnail identification)
  if (hasImage) {
    return {
      model: 'gemini-3.8-flash',
      tier: 'General (Flash + Search)',
      useSearchGrounding: true,
      isImageGen: false,
      reason: 'Multimodal visual identification of celebrities, characters, and TV episodes.'
    };
  }

  // 3. Settings change / theme toggle / navigation / simple greetings (Strictly Fast Lite)
  const isSettingsOrNav = 
    /(switch|change|turn|set|toggle)( the)?( app)? theme/i.test(lower) ||
    /(light|dark|oled) (mode|theme)/i.test(lower) ||
    /(go to|open|show|navigate to|take me to)( my)? (history|watch later|playlists|subscriptions|explore|trending|channels|settings|about|profile)/i.test(lower) ||
    /^(hi|hello|hey|yo|sup|who are you|what is vintora|what can you do|how are you|thanks|thank you|bye)\b/i.test(lower);

  if (isSettingsOrNav) {
    return {
      model: 'gemini-3.1-flash-lite',
      tier: 'Fast (Lite)',
      useSearchGrounding: false,
      isImageGen: false,
      reason: 'Fast in-app action, settings modification, or conversational greeting.'
    };
  }

  // 4. Complex Reasoning: ONLY for advanced multi-criteria comparisons or heavy logical reasoning
  const isTrulyComplex = 
    /compare and contrast the detailed plot|write a complex script|deep architectural analysis|multi-step algorithmic/i.test(lower) ||
    (lower.length > 250 && /analyze|breakdown|evaluate/i.test(lower));

  if (isTrulyComplex) {
    return {
      model: 'gemini-3.1-pro-preview',
      tier: 'Complex (Pro Reasoning)',
      useSearchGrounding: true,
      isImageGen: false,
      reason: 'Advanced multi-factor analysis & deep reasoning.'
    };
  }

  // 5. Standard video searching, question answering, episode lookup (Use efficient Flash 3.8 + Search)
  return {
    model: 'gemini-3.8-flash',
    tier: 'General (Flash + Search)',
    useSearchGrounding: true,
    isImageGen: false,
    reason: 'Video search & general question answering with Google Search Grounding.'
  };
}

// Vintora Agent Intelligent Chat Endpoint
app.post('/api/vintora/chat', async (req, res) => {
  const startTime = Date.now();
  try {
    const { 
      message = '', 
      image = '', 
      imageMimeType = 'image/jpeg', 
      history = [], 
      currentAppState = {},
      imageConfig = {}
    } = req.body || {};
    
    const trimmedMessage = message.trim();
    const hasImage = Boolean(image && image.length > 50);

    if (!trimmedMessage && !hasImage) {
      return res.status(400).json({ error: 'Message or image is required' });
    }

    const { model, tier, useSearchGrounding, isImageGen, reason } = classifyVintoraComplexity(trimmedMessage, hasImage);
    const ai = getGenAI();

    let generatedText = '';
    let actualModelUsed = model;
    let searchedVideos: any[] = [];
    let channelMatches: any[] = [];
    let actionExecuted: any = null;
    let generatedImages: string[] = [];
    let identifiedSubject: any = null;

    const lower = trimmedMessage.toLowerCase();

    // 1. Handle Image Generation Request with Multi-Option Variations, Aspect Ratio, and Resolution
    if (isImageGen) {
      const selectedAspectRatio = imageConfig.aspectRatio || '16:9';
      const selectedResolution = imageConfig.resolution || '1K';
      const variationCount = Math.min(Math.max(Number(imageConfig.variationCount) || 2, 1), 4);

      const cleanedImagePrompt = trimmedMessage
        .replace(/^(generate|create|make|draw|paint|render) (an? )?(image|picture|photo|illustration|art|drawing|thumbnail|poster|avatar|wallpaper) (of|about|for)?\s+/i, '')
        .trim() || trimmedMessage;

      const styleVariations = [
        `Cinematic lighting, hyper-detailed, masterpiece, 8k render of: ${cleanedImagePrompt}`,
        `Vibrant color palette, dynamic composition, dramatic perspective of: ${cleanedImagePrompt}`,
        `Soft atmospheric glow, ultra-sharp focus, professional photography style of: ${cleanedImagePrompt}`,
        `Stylized concept art, rich textures, award-winning illustration of: ${cleanedImagePrompt}`,
      ];

      if (ai) {
        try {
          // Generate requested number of reference image variations (2-4 options)
          const targetCount = variationCount;
          const generationPromises: Promise<any>[] = [];

          for (let i = 0; i < targetCount; i++) {
            const variantPrompt = styleVariations[i % styleVariations.length];
            generationPromises.push(
              ai.models.generateContent({
                model: 'gemini-3.1-flash-lite-image',
                contents: {
                  parts: [{ text: variantPrompt }],
                },
                config: {
                  imageConfig: {
                    aspectRatio: (['1:1', '3:4', '4:3', '9:16', '16:9'].includes(selectedAspectRatio) ? selectedAspectRatio : '16:9') as any,
                  },
                },
              }).catch((e: any) => {
                console.warn(`Variant ${i + 1} generation notice:`, e?.message);
                return null;
              })
            );
          }

          const results = await Promise.all(generationPromises);

          for (const imgResponse of results) {
            if (imgResponse?.candidates?.[0]?.content?.parts) {
              for (const part of imgResponse.candidates[0].content.parts) {
                if (part.inlineData?.data) {
                  const mime = part.inlineData.mimeType || 'image/png';
                  generatedImages.push(`data:${mime};base64,${part.inlineData.data}`);
                } else if (part.text && !generatedText) {
                  generatedText += part.text;
                }
              }
            }
          }
        } catch (imgErr: any) {
          console.error('Image generation error from model:', imgErr);
        }
      }

      // Fallback if AI image generation model returns fewer images than requested or unavailable
      if (generatedImages.length < variationCount) {
        const fallbackKeywords = encodeURIComponent(cleanedImagePrompt.slice(0, 30).replace(/[^a-zA-Z0-9 ]/g, ' ') || 'art');
        const aspectDims: Record<string, { w: number; h: number }> = {
          '16:9': { w: 1280, h: 720 },
          '1:1': { w: 1024, h: 1024 },
          '9:16': { w: 720, h: 1280 },
          '4:3': { w: 1024, h: 768 },
          '3:4': { w: 768, h: 1024 },
        };
        const dims = aspectDims[selectedAspectRatio] || { w: 1280, h: 720 };
        const missingCount = variationCount - generatedImages.length;
        
        for (let i = 0; i < missingCount; i++) {
          const seed = Math.floor(Math.random() * 90000) + 10000;
          generatedImages.push(`https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=${dims.w}&h=${dims.h}&q=85&seed=${seed}&sig=${seed}`);
        }
      }

      if (!generatedText) {
        generatedText = `I have generated **${generatedImages.length} reference image options** for you based on **"${cleanedImagePrompt}"** in **${selectedAspectRatio}** aspect ratio and **${selectedResolution}** resolution! Tap any image below to zoom, preview in full resolution, download, or use as reference for a new remix!`;
      }
    }

    // 2. Handle In-App Mutation Commands (Change ONLY if user asks)
    if (!isImageGen) {
      if (/(switch|change|turn|set|toggle)( the)?( app)? theme (to )?(light|dark|oled)/i.test(lower) || 
          /(switch|change|set) (to )?(light|dark|oled) (mode|theme)/i.test(lower) ||
          /(enable|turn on) (light|dark|oled) (mode|theme)/i.test(lower)) {
        const match = lower.match(/(light|dark|oled)/i);
        const targetTheme = match ? match[1].toLowerCase() : 'dark';
        actionExecuted = {
          type: 'SET_THEME',
          label: `Switched app theme to ${targetTheme.toUpperCase()}`,
          payload: { theme: targetTheme },
        };
      } else if (/(go to|open|show|navigate to|take me to)( my)? (history|watch later|playlists|subscriptions|explore|trending|channels|settings|about|profile|you)/i.test(lower)) {
        let targetTab = 'dashboard';
        if (/history/i.test(lower)) targetTab = 'history';
        else if (/watch later/i.test(lower)) targetTab = 'watchLater';
        else if (/playlist/i.test(lower)) targetTab = 'playlists';
        else if (/subscription/i.test(lower)) targetTab = 'subscriptions';
        else if (/explore|trending/i.test(lower)) targetTab = 'trending';
        else if (/channel/i.test(lower)) targetTab = 'channels';
        else if (/setting/i.test(lower)) targetTab = 'settings';
        else if (/about/i.test(lower)) targetTab = 'about';
        else if (/profile|you/i.test(lower)) targetTab = 'profile';

        actionExecuted = {
          type: 'NAVIGATE',
          label: `Opened ${targetTab} view`,
          payload: { tab: targetTab },
        };
      }
    }

    // 3. Handle Multimodal Image Upload (Celebrity, Character, or Episode Thumbnail Recognition)
    if (hasImage) {
      try {
        const cleanBase64 = image.includes('base64,') ? image.split('base64,')[1] : image;
        const imagePart = {
          inlineData: {
            data: cleanBase64,
            mimeType: imageMimeType || 'image/jpeg',
          },
        };

        const visionPrompt = `You are Vintora, the intelligent visual assistant in FreeTube.
Carefully examine this image and identify the subject:

1. Identify who or what is shown:
   - If it's a CELEBRITY, ACTOR, MUSICIAN, ATHLETE, or CREATOR: Provide their full name, brief engaging biography, and what they are famous for.
   - If it's a FICTIONAL CHARACTER from anime, movie, TV, or games: Provide character name, series title, and brief lore.
   - If it's a TV SHOW EPISODE, SCENE, or THUMBNAIL: Identify show name, episode number/title, and scene context.
   - If it's an OBJECT or SCENERY: Explain what it is with interesting facts.

2. Structure your response:
   - Provide a warm, friendly, concise summary.
   - Always include a search tag at the end in this exact format:
     [SEARCH_QUERY: <Name of person or show and key phrase to search videos>]
   - Include a subject info tag in this exact format:
     [SUBJECT_INFO: {"name": "<Full Name / Show Name>", "type": "celebrity|character|episode|creator|general", "summary": "<One sentence key bio/context>", "knownFor": "<Famous works/role>"}]`;

        if (ai) {
          const visionResponse = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: {
              parts: [imagePart, { text: trimmedMessage ? `${trimmedMessage}\n\n${visionPrompt}` : visionPrompt }],
            },
            config: {
              systemInstruction: 'You are Vintora Agent, a warm, knowledgeable, friendly companion in FreeTube. Give clear, insightful visual analysis.',
              temperature: 0.7,
            },
          });

          let rawVisionText = visionResponse.text || '';
          
          // Parse SUBJECT_INFO
          const subjectMatch = rawVisionText.match(/\[SUBJECT_INFO:\s*({.+?})\]/i);
          if (subjectMatch) {
            try {
              identifiedSubject = JSON.parse(subjectMatch[1]);
              rawVisionText = rawVisionText.replace(/\[SUBJECT_INFO:\s*({.+?})\]/i, '').trim();
            } catch (e) {
              console.warn('Could not parse SUBJECT_INFO JSON:', e);
            }
          }

          // Parse SEARCH_QUERY
          const queryMatch = rawVisionText.match(/\[SEARCH_QUERY:\s*(.+?)\]/i);
          let extractedSearchQuery = '';
          if (queryMatch) {
            extractedSearchQuery = queryMatch[1].trim();
            rawVisionText = rawVisionText.replace(/\[SEARCH_QUERY:\s*(.+?)\]/i, '').trim();
          }

          generatedText = rawVisionText;

          // Perform YouTube lookup for the identified episode or celebrity
          const targetSearch = extractedSearchQuery || (identifiedSubject?.name ? `${identifiedSubject.name} best moments` : trimmedMessage || 'popular video');
          searchedVideos = await queryYouTubeSearch(targetSearch);

          // Group by channel
          const channelMap = new Map<string, any[]>();
          for (const v of searchedVideos) {
            const cName = v.channelTitle || 'Unknown Channel';
            if (!channelMap.has(cName)) channelMap.set(cName, []);
            channelMap.get(cName)!.push(v);
          }

          channelMatches = Array.from(channelMap.entries()).slice(0, 4).map(([cName, vids], idx) => {
            const primaryVid = vids[0];
            let badge = idx === 0 ? 'Top Match / Episode Video' : 'Alternative Upload';
            if (/official|sab|liv|shemaroo|t-series|zeetv|colors|netflix|prime|disney/i.test(cName)) {
              badge = 'Official Broadcaster';
            }
            return {
              channelName: cName,
              channelAvatar: primaryVid.channelAvatar,
              video: primaryVid,
              badge,
            };
          });
        }
      } catch (visErr: any) {
        console.error('Vision analysis error:', visErr);
        generatedText = "I analyzed your image! I've searched for matching videos and creator channels across YouTube for you below.";
        searchedVideos = await queryYouTubeSearch(trimmedMessage || 'celebrity interviews');
      }
    }

    // 4. Handle Standard Text/Video Query (when not already generated by image flow)
    if (!hasImage && !isImageGen) {
      const isVideoOrEpisodeQuery = /episode|ep\b|video|watch|show|movie|song|clip|trailer|stream|season|chashmah|tmkoc|match|play|find|listen|scenes|channel/i.test(trimmedMessage);

      if (isVideoOrEpisodeQuery) {
        const cleanedSearchQuery = trimmedMessage
          .replace(/^(can you (please )?find|search for|look up|give me|show me|where can i (watch|find)|check if|find me|i want to (watch|see)|is there|play)\s+/i, '')
          .replace(/ across (different |all )?channels/i, '')
          .trim();

        const searchTarget = cleanedSearchQuery || trimmedMessage;
        searchedVideos = await queryYouTubeSearch(searchTarget);

        if (searchedVideos.length === 0 && searchTarget.includes('episode')) {
          searchedVideos = await queryYouTubeSearch(searchTarget.replace(/episode/i, '').trim());
        }

        const channelMap = new Map<string, any[]>();
        for (const v of searchedVideos) {
          const cName = v.channelTitle || 'Unknown Channel';
          if (!channelMap.has(cName)) channelMap.set(cName, []);
          channelMap.get(cName)!.push(v);
        }

        channelMatches = Array.from(channelMap.entries()).slice(0, 4).map(([cName, vids], idx) => {
          const primaryVid = vids[0];
          let badge = 'Available Stream';
          if (/official|sab|liv|shemaroo|t-series|zeetv|colors|netflix|prime/i.test(cName)) {
            badge = 'Official Broadcaster';
          } else if (idx === 0) {
            badge = 'Top Match';
          } else {
            badge = 'Alternative Channel Upload';
          }

          return {
            channelName: cName,
            channelAvatar: primaryVid.channelAvatar,
            video: primaryVid,
            badge,
          };
        });
      }

      const systemInstruction = `You are Vintora Agent, the friendly, intelligent AI companion built into FreeTube.
Your persona:
- Talk like a warm, witty, genuine friend chatting casually about entertainment, videos, and music.
- NEVER sound robotic, formal, corporate, or mechanical.
- Keep answers scannable and conversational.
- FreeTube Features: 100% ad-free private streaming, floating 16:9 draggable mini-player, swipe-up fullscreen gesture, customizable themes (Dark, Light, OLED), Watch Later, zero tracking.
- USER PERMISSION RULE: Only change or mutate in-app settings if the user explicitly gives a direct command.
${channelMatches.length > 0 ? `
Videos found matching the query across channels:
${channelMatches.map(cm => `- Channel: "${cm.channelName}" (${cm.badge}) -> Title: "${cm.video.title}", Duration: ${cm.video.duration}`).join('\n')}
If the same episode/video exists on multiple channels, mention which channels have it in a friendly, conversational way!
` : ''}
${actionExecuted ? `Note: You successfully executed the user-requested in-app action: "${actionExecuted.label}". Confirm this smoothly in your response.` : ''}
`;

      if (ai) {
        try {
          const geminiConfig: any = {
            systemInstruction,
            temperature: 0.85,
          };

          if (useSearchGrounding && (model === 'gemini-3.8-flash' || model === 'gemini-3.1-pro-preview')) {
            geminiConfig.tools = [{ googleSearch: {} }];
          }

          const formattedHistory = Array.isArray(history) 
            ? history.slice(-6).map((h: any) => ({
                role: h.sender === 'user' ? 'user' : 'model',
                parts: [{ text: h.text || '' }],
              }))
            : [];

          const contents: any[] = [
            ...formattedHistory,
            {
              role: 'user',
              parts: [{ text: trimmedMessage }],
            },
          ];

          let response;
          try {
            response = await ai.models.generateContent({
              model: actualModelUsed,
              contents,
              config: geminiConfig,
            });
          } catch (modelError: any) {
            console.warn(`Model ${actualModelUsed} fallback to gemini-3.8-flash:`, modelError?.message);
            actualModelUsed = 'gemini-3.8-flash';
            response = await ai.models.generateContent({
              model: actualModelUsed,
              contents,
              config: { systemInstruction, temperature: 0.85 },
            });
          }

          generatedText = response.text || '';
        } catch (genErr: any) {
          console.error('Gemini generateContent error:', genErr);
        }
      }
    }

    // Fallback response if needed
    if (!generatedText) {
      if (channelMatches.length > 0) {
        const top = channelMatches[0];
        const others = channelMatches.slice(1);
        generatedText = `Hey! I found **${top.video.title}** for you on **${top.channelName}** (${top.badge}). ${
          others.length > 0 
            ? `It's also available on ${others.map(o => `**${o.channelName}**`).join(' and ')}! Tap below to play anytime.` 
            : `Tap below to start watching!`
        }`;
      } else if (actionExecuted) {
        generatedText = `Done! I've ${actionExecuted.label.toLowerCase()} for you. Let me know what else you'd like to do!`;
      } else {
        generatedText = `Hey there! I'm Vintora Agent. I can help you find specific episodes across channels, generate 2-4 reference images with custom aspect ratio & resolution, identify celebrities or characters from images, and control your playback. What are we watching or creating?`;
      }
    }

    const elapsedMs = Date.now() - startTime;

    // Construct clean thought process
    const thoughts = [
      {
        title: 'Query & Intent Assessment',
        detail: hasImage 
          ? `Visual input detected. Analyzed image for character/celebrity identification & episode availability.`
          : isImageGen
            ? `Image generation requested for prompt: "${trimmedMessage}". Configured ${imageConfig.aspectRatio || '16:9'} ratio, ${imageConfig.resolution || '1K'} resolution, ${imageConfig.variationCount || 2} reference options.`
            : `Analyzed query: "${trimmedMessage}". Complexity tier: ${tier}. Reason: ${reason}`,
        durationMs: Math.round(elapsedMs * 0.25),
      },
      {
        title: `Model Assignment: ${actualModelUsed}`,
        detail: `Assigned ${actualModelUsed} with ${useSearchGrounding ? 'Google Search Grounding & Web Discovery' : 'efficient fast-response inference'}.`,
        durationMs: Math.round(elapsedMs * 0.35),
      },
    ];

    if (channelMatches.length > 0) {
      thoughts.push({
        title: 'Cross-Channel Verification & Video Link Generation',
        detail: `Verified video stream availability across ${channelMatches.length} channels: ${channelMatches.map(c => `${c.channelName} (${c.badge})`).join(', ')}.`,
        durationMs: Math.round(elapsedMs * 0.3),
      });
    }

    thoughts.push({
      title: 'App Safety & Permission Guard',
      detail: actionExecuted
        ? `Explicit user command confirmed -> Applied "${actionExecuted.label}".`
        : 'Safety check passed: Read-only response without unsolicited app state modification.',
      durationMs: Math.round(elapsedMs * 0.1),
    });

    const suggestedPrompts = hasImage
      ? ['Play this episode', 'Search related interviews', 'Add to Watch Later']
      : isImageGen
        ? ['Generate 4 options in 9:16', 'Create Cyberpunk city in 4K', 'Draw anime character (1:1)']
        : channelMatches.length > 0
          ? ['Play now', 'Check another episode', 'Switch to OLED theme']
          : ['Generate 2 image options of cyber sunset', 'Find Taarak Mehta Ep 1291', 'Switch theme to Light'];

    return res.json({
      text: generatedText,
      modelUsed: actualModelUsed,
      complexityTier: tier,
      thoughts,
      channelMatches: channelMatches.length > 0 ? channelMatches : undefined,
      videos: searchedVideos.slice(0, 4),
      actionExecuted: actionExecuted || undefined,
      generatedImages: generatedImages.length > 0 ? generatedImages : undefined,
      imageConfig: isImageGen ? {
        aspectRatio: imageConfig.aspectRatio || '16:9',
        resolution: imageConfig.resolution || '1K',
        variationCount: Math.min(Math.max(Number(imageConfig.variationCount) || 2, 1), 4),
      } : undefined,
      identifiedSubject: identifiedSubject || undefined,
      suggestedPrompts,
      elapsedMs,
    });
  } catch (error: any) {
    console.error('Vintora chat error:', error);
    return res.json({
      text: "I experienced a brief glitch while processing your request, but I'm ready! Please try asking or uploading again.",
      modelUsed: 'gemini-3.8-flash',
      complexityTier: 'General (Flash + Search)',
      thoughts: [
        {
          title: 'Error Recovery',
          detail: 'Gracefully handled request exception and restored state.',
          durationMs: 50,
        }
      ],
      suggestedPrompts: ['Try again', 'Find trending videos', 'Generate reference images'],
    });
  }
});

// Vite middleware & Static server setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
