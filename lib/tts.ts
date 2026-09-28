import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import path from "path";
import fs from "fs";
import type { Language } from "@/types";

export interface TtsVoiceConfig {
  languageCode: string;
  name: string;
  ssmlGender?: "FEMALE" | "MALE" | "NEUTRAL";
}

export function getTtsVoice(language: Language): TtsVoiceConfig {
  switch (language) {
    case "bm":
      return {
        languageCode: "ms-MY",
        name: "ms-MY-Wavenet-A",
        ssmlGender: "FEMALE",
      };
    case "zh":
      return {
        languageCode: "cmn-CN",
        name: "cmn-CN-Wavenet-A",
        ssmlGender: "FEMALE",
      };
    case "ta":
      return {
        languageCode: "ta-IN",
        name: "ta-IN-Wavenet-A",
        ssmlGender: "FEMALE",
      };
    case "en":
    default:
      return {
        languageCode: "en-US",
        name: "en-US-Neural2-F",
        ssmlGender: "FEMALE",
      };
  }
}

let ttsClient: TextToSpeechClient | null = null;

export function getTtsClient(): TextToSpeechClient {
  if (ttsClient) return ttsClient;

  const credentialsPath = process.env.GOOGLE_CLOUD_TTS_CREDENTIALS;
  let options: any = {};

  if (credentialsPath) {
    const fullPath = path.isAbsolute(credentialsPath)
      ? credentialsPath
      : path.resolve(process.cwd(), credentialsPath);

    if (fs.existsSync(fullPath)) {
      options.keyFilename = fullPath;
    } else {
      console.warn(`TTS credentials file not found at ${fullPath}. Falling back to default auth.`);
    }
  }

  ttsClient = new TextToSpeechClient(options);
  return ttsClient;
}

export async function synthesizeSpeech(
  params: { text: string; language: Language },
  clientOverride?: any
): Promise<Buffer> {
  const client = clientOverride || getTtsClient();
  const voice = getTtsVoice(params.language);

  const cleanText = params.text.trim();

  const request = {
    input: { text: cleanText },
    voice: {
      languageCode: voice.languageCode,
      name: voice.name,
      ssmlGender: voice.ssmlGender,
    },
    audioConfig: {
      audioEncoding: "MP3" as const,
      speakingRate: 0.95,
      pitch: 0,
    },
  };

  const [response] = await client.synthesizeSpeech(request);
  if (!response.audioContent) {
    throw new Error("No audio content returned from Google Cloud TTS.");
  }

  return Buffer.from(response.audioContent as Uint8Array);
}
