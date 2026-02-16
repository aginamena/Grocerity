
// Define the structured design interface
export interface Design {
  concept: {
    title: string;
    vibe: string;
    duration: number;
    imageCount: number;
  };
  voiceover: string;
  segments: Array<{
    imageId: string;
    voSegment: string;
    duration: number;
    animation: string;
  }>;
  timingSummary: {
    durations: number[];
    totalDuration: number;
  };
}

export interface DesignWithUrls extends Design {
  voiceoverUrl: string;
  segments: Array<{
    imageId: string;
    voSegment: string;
    duration: number;
    animation: string;
    imageUrl: string;
  }>;
}