"use client";

import { useState, useCallback, useRef } from 'react';

interface EvidenceCaptureState {
  isRecording: boolean;
  recordingDuration: number;
  hasCamera: boolean;
  hasMicrophone: boolean;
  capturedPhotos: string[];
  capturedAudio: string[];
}

interface UseEvidenceCaptureReturn {
  state: EvidenceCaptureState;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  capturePhoto: () => Promise<string | null>;
  requestPermissions: () => Promise<{ camera: boolean; microphone: boolean }>;
  clearEvidence: () => void;
}

export function useEvidenceCapture(): UseEvidenceCaptureReturn {
  const [state, setState] = useState<EvidenceCaptureState>({
    isRecording: false,
    recordingDuration: 0,
    hasCamera: false,
    hasMicrophone: false,
    capturedPhotos: [],
    capturedAudio: [],
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const requestPermissions = useCallback(async () => {
    try {
      // Check camera
      let camera = false;
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraStream.getTracks().forEach(track => track.stop());
        camera = true;
      } catch {
        camera = false;
      }

      // Check microphone
      let microphone = false;
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStream.getTracks().forEach(track => track.stop());
        microphone = true;
      } catch {
        microphone = false;
      }

      setState(prev => ({ ...prev, hasCamera: camera, hasMicrophone: microphone }));
      return { camera, microphone };
    } catch (err) {
      console.error('Failed to request permissions:', err);
      return { camera: false, microphone: false };
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!state.hasMicrophone) {
      await requestPermissions();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setState(prev => ({ ...prev, isRecording: true, recordingDuration: 0 }));

      // Start duration timer
      recordingTimerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, recordingDuration: prev.recordingDuration + 1 }));
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, [state.hasMicrophone, requestPermissions]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !state.isRecording) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setState(prev => ({
          ...prev,
          isRecording: false,
          recordingDuration: 0,
          capturedAudio: [...prev.capturedAudio, audioUrl],
        }));

        // Stop all tracks
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }

        resolve(audioUrl);
      };

      mediaRecorderRef.current.stop();
    });
  }, [state.isRecording]);

  const capturePhoto = useCallback(async (): Promise<string | null> => {
    if (!state.hasCamera) {
      const perms = await requestPermissions();
      if (!perms.camera) {
        return null;
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => resolve();
      });

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        stream.getTracks().forEach(track => track.stop());
        return null;
      }

      ctx.drawImage(video, 0, 0);
      const photoUrl = canvas.toDataURL('image/jpeg', 0.8);

      stream.getTracks().forEach(track => track.stop());

      setState(prev => ({
        ...prev,
        capturedPhotos: [...prev.capturedPhotos, photoUrl],
      }));

      return photoUrl;
    } catch (err) {
      console.error('Failed to capture photo:', err);
      return null;
    }
  }, [state.hasCamera, requestPermissions]);

  const clearEvidence = useCallback(() => {
    // Revoke object URLs to prevent memory leaks
    state.capturedPhotos.forEach(url => URL.revokeObjectURL(url));
    state.capturedAudio.forEach(url => URL.revokeObjectURL(url));

    setState({
      isRecording: false,
      recordingDuration: 0,
      hasCamera: state.hasCamera,
      hasMicrophone: state.hasMicrophone,
      capturedPhotos: [],
      capturedAudio: [],
    });
  }, [state.capturedPhotos, state.capturedAudio, state.hasCamera, state.hasMicrophone]);

  return {
    state,
    startRecording,
    stopRecording,
    capturePhoto,
    requestPermissions,
    clearEvidence,
  };
}

// Utility function to format recording duration
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
