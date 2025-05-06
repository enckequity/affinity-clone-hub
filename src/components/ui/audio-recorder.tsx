
import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Mic, Square, Loader2, AlertCircle } from "lucide-react"
import { cn } from '@/lib/utils'
import { useToast } from "@/hooks/use-toast"

interface AudioRecorderProps {
  onRecordingComplete: (base64Audio: string, duration: number) => void
  isProcessing?: boolean
  className?: string
}

export function AudioRecorder({ onRecordingComplete, isProcessing = false, className }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
      stopRecording()
    }
  }, [])

  const startRecording = async () => {
    setError(null)
    chunksRef.current = []
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      
      // Initialize the MediaRecorder with better options
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })
      
      mediaRecorderRef.current = mediaRecorder
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event)
        setError("Recording error occurred")
        stopRecording()
        
        toast({
          title: "Recording Error",
          description: "An error occurred while recording audio.",
          variant: "destructive"
        })
      }
      
      mediaRecorder.onstop = async () => {
        try {
          // Combine chunks into a single blob
          if (chunksRef.current.length === 0) {
            throw new Error("No audio data captured")
          }
          
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
          
          if (audioBlob.size < 100) {
            throw new Error("Audio recording too short or empty")
          }
          
          console.log("Audio recording complete, blob size:", audioBlob.size, "bytes")
          
          // Convert blob to base64
          const reader = new FileReader()
          reader.readAsDataURL(audioBlob) 
          reader.onloadend = function() {
            const base64data = reader.result as string
            // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
            const base64Audio = base64data.split(',')[1]
            console.log("Base64 audio length:", base64Audio.length)
            onRecordingComplete(base64Audio, recordingTime)
          }
          reader.onerror = function(error) {
            console.error("Error converting audio to base64:", error)
            setError("Failed to process recording")
            
            toast({
              title: "Processing Error",
              description: "Failed to process the audio recording.",
              variant: "destructive"
            })
          }
          
          // Stop all tracks on the stream to release the microphone
          stream.getTracks().forEach(track => track.stop())
        } catch (error) {
          console.error("Error processing recording:", error)
          setError(error.message || "Failed to process recording")
          
          toast({
            title: "Processing Error",
            description: error.message || "Failed to process the audio recording.",
            variant: "destructive"
          })
        }
      }
      
      // Start recording
      mediaRecorder.start(1000)  // Collect data every second
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start the timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
      setError("Microphone access denied")
      
      toast({
        title: "Microphone Access Denied",
        description: "Could not access the microphone. Please ensure you have granted permission.",
        variant: "destructive"
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop()
      } catch (error) {
        console.error("Error stopping media recorder:", error)
      }
      
      setIsRecording(false)
      
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive font-medium bg-destructive/10 px-3 py-2 rounded-md w-full">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      {isProcessing ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing audio...</span>
        </div>
      ) : isRecording ? (
        <>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-destructive animate-pulse"></span>
            <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
          </div>
          <Button 
            onClick={stopRecording} 
            size="sm" 
            variant="destructive"
          >
            <Square className="h-4 w-4 mr-1" /> Stop Recording
          </Button>
        </>
      ) : (
        <Button 
          onClick={startRecording} 
          size="sm"
          variant="outline"
        >
          <Mic className="h-4 w-4 mr-1" /> Start Recording
        </Button>
      )}
    </div>
  )
}
