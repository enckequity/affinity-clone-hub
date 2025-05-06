
import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Mic, Square, Loader2 } from "lucide-react"
import { cn } from '@/lib/utils'

interface AudioRecorderProps {
  onRecordingComplete: (base64Audio: string, duration: number) => void
  isProcessing?: boolean
  className?: string
}

export function AudioRecorder({ onRecordingComplete, isProcessing = false, className }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
      stopRecording()
    }
  }, [])

  const startRecording = async () => {
    chunksRef.current = []
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Initialize the MediaRecorder
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
      
      mediaRecorder.onstop = async () => {
        // Combine chunks into a single blob
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        
        // Convert blob to base64
        const reader = new FileReader()
        reader.readAsDataURL(audioBlob) 
        reader.onloadend = function() {
          const base64data = reader.result as string
          // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
          const base64Audio = base64data.split(',')[1]
          onRecordingComplete(base64Audio, recordingTime)
        }
        
        // Stop all tracks on the stream to release the microphone
        stream.getTracks().forEach(track => track.stop())
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
      alert('Could not access the microphone. Please ensure you have granted permission.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
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
    <div className={cn("flex items-center gap-4", className)}>
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
