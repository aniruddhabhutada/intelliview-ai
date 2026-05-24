import { useState, useEffect, useRef } from 'react';

/**
 * Hook utilizing browser SpeechSynthesis API to read interview questions.
 */
export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [paused, setPaused] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSupported(true);
    }
  }, []);

  const speak = (text) => {
    if (!supported) return;
    
    window.speechSynthesis.cancel(); // Stop current first

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose a high-quality professional default voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
                         voices.find(v => v.lang.startsWith('en')) || 
                         voices[0];
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    utterance.onstart = () => {
      setSpeaking(true);
      setPaused(false);
    };
    
    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    
    utterance.onerror = (e) => {
      console.error("[Speech Synthesis] Playback error:", e);
      setSpeaking(false);
      setPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  const pause = () => {
    if (!supported || !speaking) return;
    window.speechSynthesis.pause();
    setPaused(true);
  };

  const resume = () => {
    if (!supported || !paused) return;
    window.speechSynthesis.resume();
    setPaused(false);
  };

  return {
    supported,
    speaking,
    paused,
    speak,
    stop,
    pause,
    resume
  };
}

/**
 * Hook utilizing browser MediaRecorder API to record microphone audio.
 */
export function useAudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [supported, setSupported] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setSupported(true);
    }
  }, []);

  const startRecording = async () => {
    if (!supported) {
      throw new Error("Microphone capture is not supported by this browser.");
    }

    audioChunksRef.current = [];
    setAudioBlob(null);
    setRecordingTime(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Webm is widely supported. For high fidelity, fallback to audio/webm
      const options = { mimeType: 'audio/webm' };
      
      let recorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        recorder = new MediaRecorder(stream); // Fallback standard format
      }

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Stop all audio track streams to release microphone hardware icon
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start(10); // Capture data chunks every 10ms
      setRecording(true);

      // Start recording timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("[Audio Recorder] Microphone access denied or failed:", err);
      throw err;
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    
    mediaRecorderRef.current.stop();
    setRecording(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  return {
    supported,
    recording,
    audioBlob,
    recordingTime,
    startRecording,
    stopRecording,
    clearRecording
  };
}
