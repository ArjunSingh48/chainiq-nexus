

# Plan: Add Voice-to-Text Button in Chat + Fix Build Error

## Overview
Add a microphone button next to the send button in the chat interface that uses the browser's Web Speech API for speech-to-text transcription. Also fix the existing build error.

Note: Since the ElevenLabs API key provided is a server-side key (sk_*), and the ElevenLabs STT API requires server-side calls, we'll use the browser's built-in Web Speech API (`webkitSpeechRecognition`) for voice-to-text. This works entirely client-side, requires no API key, and provides real-time transcription. This avoids needing a backend edge function setup.

If you specifically want ElevenLabs STT instead, we'd need to set up Supabase/Lovable Cloud with an edge function — let me know.

## Changes

### 1. Fix build error in `src/components/SupplierPanel.tsx`
Replace `.replaceAll('_', ' ')` with `.split('_').join(' ')` on line 40 to avoid the ES2021 target requirement.

### 2. Add voice button to `src/components/ChatInterface.tsx`
- Import `Mic` and `MicOff` icons from lucide-react
- Add state: `isListening` (boolean)
- Create a `toggleListening` function that:
  - Creates a `webkitSpeechRecognition` instance
  - On result, appends recognized text to the input field
  - Shows a pulsing red mic icon while listening
- Add the mic button next to the send button in all three chat views (full screen, minimized-expanded, minimized bar)
- The mic button will pulse/animate red when actively listening
- Clicking again stops listening

## UI Layout
```text
┌──────────────────────────────────────┐
│ [text input.....................] 🎤 ➤│
└──────────────────────────────────────┘
```
The mic button sits between the input and send button, with a red pulse animation when active.

