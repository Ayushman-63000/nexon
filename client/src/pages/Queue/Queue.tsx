import moshiProcessorUrl from "../../audio-processor.ts?worker&url";
import { FC, useEffect, useState, useCallback, useRef, MutableRefObject } from "react";
import eruda from "eruda";
import { useSearchParams } from "react-router-dom";
import { Conversation } from "../Conversation/Conversation";
import { useModelParams } from "../Conversation/hooks/useModelParams";
import { env } from "../../env";
import { prewarmDecoderWorker } from "../../decoder/decoderWorker";

const VOICE_OPTIONS = [
  "NATF0.pt", "NATF1.pt", "NATF2.pt", "NATF3.pt",
  "NATM0.pt", "NATM1.pt", "NATM2.pt", "NATM3.pt",
  "VARF0.pt", "VARF1.pt", "VARF2.pt", "VARF3.pt", "VARF4.pt",
  "VARM0.pt", "VARM1.pt", "VARM2.pt", "VARM3.pt", "VARM4.pt",
];

const TEXT_PROMPT_PRESETS = [
  {
    label: "Assistant (default)",
    text: "You are a wise and friendly teacher. Answer questions or provide advice in a clear and engaging way.",
  },
  {
    label: "Medical office (service)",
    text: "You work for Dr. Jones's medical office, and you are receiving calls to record information for new patients. Information: Record full name, date of birth, any medication allergies, tobacco smoking history, alcohol consumption history, and any prior medical conditions. Assure the patient that this information will be confidential, if they ask.",
  },
  {
    label: "Bank (service)",
    text: "You work for First Neuron Bank which is a bank and your name is Alexis Kim. Information: The customer's transaction for $1,200 at Home Depot was declined. Verify customer identity. The transaction was flagged due to unusual location (transaction attempted in Miami, FL; customer normally transacts in Seattle, WA).",
  },
  {
    label: "Astronaut (fun)",
    text: "You enjoy having a good conversation. Have a technical discussion about fixing a reactor core on a spaceship to Mars. You are an astronaut on a Mars mission. Your name is Alex. You are already dealing with a reactor core meltdown on a Mars mission. Several ship systems are failing, and continued instability will lead to catastrophic failure. You explain what is happening and you urgently ask for help thinking through how to stabilize the reactor.",
  },
];

interface HomepageProps {
  showMicrophoneAccessMessage: boolean;
  startConnection: () => Promise<void>;
  textPrompt: string;
  setTextPrompt: (value: string) => void;
  voicePrompt: string;
  setVoicePrompt: (value: string) => void;
}

const Homepage = ({
  startConnection,
  showMicrophoneAccessMessage,
  textPrompt,
  setTextPrompt,
  voicePrompt,
  setVoicePrompt,
}: HomepageProps) => {
  return (
    <div className="min-h-screen w-screen p-4 flex flex-col items-center justify-center bg-gray-900 text-gray-100 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>

      <div className="mb-10 z-10 text-center">
        <h1 className="text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 drop-shadow-sm uppercase">NEXON Voice</h1>
        <p className="text-md text-gray-400 mt-4 max-w-lg mx-auto font-light">
          Experience the next generation of full duplex conversational AI. Powered by cutting-edge neural models.
        </p>
      </div>

      <div className="z-10 flex flex-col gap-6 w-full min-w-[500px] max-w-2xl glass-panel p-8 rounded-2xl">
        <div className="w-full">
          <label htmlFor="text-prompt" className="block text-left text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
            System Prompt
          </label>
          <div className="border border-white/10 rounded-lg p-4 mb-4 bg-gray-800/50 backdrop-blur-sm">
             <div className="flex flex-wrap gap-2 justify-start">
              {TEXT_PROMPT_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setTextPrompt(preset.text)}
                  className="px-3 py-1.5 text-xs font-medium bg-gray-800 hover:bg-blue-600 hover:text-white text-gray-300 rounded-md border border-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <textarea
            id="text-prompt"
            name="text-prompt"
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
            className="w-full h-32 min-h-[100px] max-h-64 p-4 bg-gray-900 border border-gray-700 text-gray-100 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
            placeholder="Initialize AI persona..."
            maxLength={1000}
          />
          <div className="text-right text-xs text-gray-500 mt-2 font-mono">
            {textPrompt.length}/1000 MAX
          </div>
        </div>

        <div className="w-full">
          <label htmlFor="voice-prompt" className="block text-left text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
            Voice Synthesis Model
          </label>
          <div className="relative">
            <select
              id="voice-prompt"
              name="voice-prompt"
              value={voicePrompt}
              onChange={(e) => setVoicePrompt(e.target.value)}
              className="appearance-none w-full p-4 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner cursor-pointer"
            >
              {VOICE_OPTIONS.map((voice) => (
                <option key={voice} value={voice} className="bg-gray-800">
                  {voice
                    .replace('.pt', '')
                    .replace(/^NAT/, 'NATURAL_')
                    .replace(/^VAR/, 'VARIETY_')}
                </option>
              ))}
             </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
             </div>
          </div>
        </div>

        {showMicrophoneAccessMessage && (
          <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
            <p className="text-center text-red-400 font-medium text-sm">Microphone access is required to connect to the network.</p>
          </div>
        )}
        
        <div className="mt-4">
          <button 
           onClick={async () => await startConnection()}
           className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-lg transform transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 uppercase tracking-widest"
          >
            Initialize Connection
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-gray-600 text-xs font-mono">
        © 2026 NEXON Corp. All rights reserved.
      </div>
    </div>
  );
}

export const Queue:FC = () => {
  const theme = "dark" as const;  // Always use dark theme
  const [searchParams] = useSearchParams();
  const overrideWorkerAddr = searchParams.get("worker_addr");
  const [hasMicrophoneAccess, setHasMicrophoneAccess] = useState<boolean>(false);
  const [showMicrophoneAccessMessage, setShowMicrophoneAccessMessage] = useState<boolean>(false);
  const modelParams = useModelParams();

  const audioContext = useRef<AudioContext | null>(null);
  const worklet = useRef<AudioWorkletNode | null>(null);
  
  // enable eruda in development
  useEffect(() => {
    if(env.VITE_ENV === "development") {
      eruda.init();
    }
    () => {
      if(env.VITE_ENV === "development") {
        eruda.destroy();
      }
    };
  }, []);

  const getMicrophoneAccess = useCallback(async () => {
    try {
      await window.navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicrophoneAccess(true);
      return true;
    } catch(e) {
      console.error(e);
      setShowMicrophoneAccessMessage(true);
      setHasMicrophoneAccess(false);
    }
    return false;
}, [setHasMicrophoneAccess, setShowMicrophoneAccessMessage]);

  const startProcessor = useCallback(async () => {
    if(!audioContext.current) {
      audioContext.current = new AudioContext();
      // Prewarm decoder worker as soon as we have audio context
      // This gives WASM time to load while user grants mic access
      prewarmDecoderWorker(audioContext.current.sampleRate);
    }
    if(worklet.current) {
      return;
    }
    let ctx = audioContext.current;
    ctx.resume();
    try {
      worklet.current = new AudioWorkletNode(ctx, 'moshi-processor');
    } catch (err) {
      await ctx.audioWorklet.addModule(moshiProcessorUrl);
      worklet.current = new AudioWorkletNode(ctx, 'moshi-processor');
    }
    worklet.current.connect(ctx.destination);
  }, [audioContext, worklet]);

  const startConnection = useCallback(async() => {
      await startProcessor();
      const hasAccess = await getMicrophoneAccess();
      if (hasAccess) {
      // Values are already set in modelParams, they get passed to Conversation
    }
  }, [startProcessor, getMicrophoneAccess]);

  return (
    <>
      {(hasMicrophoneAccess && audioContext.current && worklet.current) ? (
        <Conversation
        workerAddr={overrideWorkerAddr ?? ""}
        audioContext={audioContext as MutableRefObject<AudioContext|null>}
        worklet={worklet as MutableRefObject<AudioWorkletNode|null>}
        theme={theme}
        startConnection={startConnection}
        {...modelParams}
        />
      ) : (
        <Homepage
          startConnection={startConnection}
          showMicrophoneAccessMessage={showMicrophoneAccessMessage}
          textPrompt={modelParams.textPrompt}
          setTextPrompt={modelParams.setTextPrompt}
          voicePrompt={modelParams.voicePrompt}
          setVoicePrompt={modelParams.setVoicePrompt}
        />
      )}
    </>
  );
};
