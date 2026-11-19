'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Phrase } from '@/lib/supabase/database.types';

export default function RecordPage() {
  const params = useParams();
  const router = useRouter();
  const phraseId = params.id as string;

  // State
  const [phrase, setPhrase] = useState<Phrase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recording state
  const [stage, setStage] = useState<'idle' | 'recording' | 'preview' | 'uploading' | 'done'>('idle');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<BlobPart[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxDurationRef = useRef(35);

  // Fetch phrase data
  useEffect(() => {
    async function fetchPhrase() {
      try {
        const res = await fetch(`/api/phrases/${phraseId}`);
        const data = await res.json();
        if (data.phrase) {
          setPhrase(data.phrase);
          maxDurationRef.current = (data.phrase.video_duration || 30) + 5;
        } else {
          setError(data.error || 'Frase não encontrada');
        }
      } catch {
        setError('Erro de conexão');
      } finally {
        setLoading(false);
      }
    }
    fetchPhrase();
  }, [phraseId]);

  // Initialize camera
  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    try {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      setStream(newStream);
      if (cameraRef.current) {
        cameraRef.current.srcObject = newStream;
      }
      return newStream;
    } catch (err) {
      console.error('Camera error:', err);
      setError('Não foi possível acessar a câmera. Verifique as permissões.');
      return null;
    }
  }, [stream]);

  // Toggle camera (front/back)
  const toggleCamera = useCallback(async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    await startCamera(newMode);
  }, [facingMode, startCamera]);

  // Start recording
  const handleStartRecording = useCallback(async () => {
    const currentStream = stream || await startCamera(facingMode);
    if (!currentStream) return;

    const recorder = new MediaRecorder(currentStream, {
      mimeType: 'video/webm;codecs=vp9,opus',
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        setRecordedChunks((prev) => [...prev, e.data]);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setStage('preview');
    };

    setMediaRecorder(recorder);
    setRecordedChunks([]);
    recorder.start(100);
    setStage('recording');
    setRecordingTime(0);

    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime((t) => t + 1);
    }, 1000);

    const maxDuration = maxDurationRef.current;
    setTimeout(() => {
      if (stage === 'recording') handleStopRecording();
    }, maxDuration * 1000);
  }, [facingMode, startCamera, stage, recordedChunks, stream]);

  // Stop recording
  const handleStopRecording = useCallback(() => {
    if (mediaRecorder && stage === 'recording') {
      mediaRecorder.stop();
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  }, [mediaRecorder, stage]);

  // Retry recording
  const handleRetry = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setRecordedChunks([]);
    setRecordingTime(0);
    setStage('idle');
  }, [previewUrl]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage (0-100)
  const progressPercent = Math.min(100, (recordingTime / maxDurationRef.current) * 100);

  // Upload recording
  const handleUpload = useCallback(async () => {
    if (!previewUrl || !phrase) return;

    setStage('uploading');
    setUploadProgress(0);

    try {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const filename = `recording-${Date.now()}.webm`;

      const signRes = await fetch('/api/storage/sign-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, contentType: 'video/webm' }),
      });

      const { signedUrl, publicUrl, path } = await signRes.json();

      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': 'video/webm' },
      });

      if (!uploadRes.ok) throw new Error('Upload failed');

      setUploadProgress(50);

      const recordingRes = await fetch('/api/recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phrase_id: phrase.id,
          video_url: publicUrl,
          video_duration: recordingTime,
          video_size_bytes: blob.size,
          mime_type: 'video/webm',
          user_agent: navigator.userAgent,
          metadata: { recordedAt: new Date().toISOString() },
        }),
      });

      if (!recordingRes.ok) throw new Error('Failed to save recording');

      setUploadProgress(100);
      setStage('done');

      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        setStream(null);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Erro ao enviar gravação. Tente novamente.');
      setStage('preview');
    }
  }, [previewUrl, phrase, recordedChunks, recordingTime, stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [stream, previewUrl]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-body-md text-body">Carregando...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !phrase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
        <div className="max-w-md mx-auto p-8 rounded-md bg-surface-card border border-hairline text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-body-md text-body mb-4">{error}</p>
          <a href="/" className="btn-secondary">Voltar</a>
        </div>
      </div>
    );
  }

  if (!phrase) return null;

  const maxDuration = maxDurationRef.current;

  return (
    <main className="min-h-screen bg-canvas flex flex-col">
      {/* Header - Pinterest style nav */}
      <header className="primary-nav sticky top-0 z-10">
        <div className="container-max h-full flex items-center justify-between gap-4 px-4">
          <a href="/" className="btn-tertiary text-body-strong" aria-label="Voltar à lista de frases">
            ← Voltar
          </a>
          <h1 className="text-heading-md truncate flex-1 text-center px-4">{phrase.text_pt}</h1>
          {phrase.text_gloss && (
            <span className="pin-overlay-pill text-xs shrink-0">{phrase.text_gloss}</span>
          )}
        </div>
      </header>

      {/* Recording Studio */}
      <div className="flex-1 section" style={{ paddingTop: '0' }}>
        <div className="container-max">
          {/* Progress steps */}
          <div className="mb-6 flex items-center gap-2" role="progressbar" aria-valuenow={['idle', 'recording', 'preview', 'uploading', 'done'].indexOf(stage) + 1} aria-valuemin={1} aria-valuemax={5} aria-label="Progresso da gravação">
            {['idle', 'recording', 'preview', 'uploading', 'done'].map((s, i) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    ['idle', 'recording', 'preview', 'uploading', 'done'].indexOf(stage) >= i
                      ? 'bg-primary text-on-primary'
                      : 'bg-secondary-bg text-ash'
                  }`}
                >
                  {['1', '2', '3', '4', '✓'][i]}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${['idle', 'recording', 'preview', 'uploading', 'done'].indexOf(stage) >= i ? 'text-ink' : 'text-ash'}`}>
                  {['Pronto', 'Gravar', 'Ver', 'Enviar', 'Fim'][i]}
                </span>
              </div>
            ))}
          </div>

          {/* Visual progress bar during recording */}
          {stage === 'recording' && (
            <div className="mb-6 progress-bar-thick" role="progressbar" aria-valuenow={Math.round(progressPercent)} aria-valuemin={0} aria-valuemax={100} aria-label="Tempo de gravação">
              <div
                className={`
                  h-full rounded-full transition-all duration-300 ease-out
                  ${progressPercent < 50 ? 'bg-success' : progressPercent < 80 ? 'bg-accent-purple' : 'bg-error'}
                `}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="mb-6 p-4 rounded-md bg-error-pale border border-error text-error text-body-sm" role="alert">
              {error}
            </div>
          )}

          {/* Stage: Idle - Ready to record */}
          {stage === 'idle' && (
            <div className="feature-card text-center py-12 animate-in">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-heading-xl tracking-tight mb-3">Gravar este sinal</h2>
              <p className="text-body-md text-body mb-6 max-w-md mx-auto leading-relaxed">
                Assista ao vídeo de referência. Depois toque em "Começar" para gravar você fazendo o sinal.
              </p>
              <button onClick={handleStartRecording} className="btn-primary text-body-strong px-8 py-3 w-full sm:w-auto min-h-[48px]">
                Começar gravação
              </button>
            </div>
          )}

          {/* Stage: Recording / Preview */}
          {(stage === 'recording' || stage === 'preview') && (
            <>
            <div className="recording-studio">
              {/* Reference Video */}
              <div className="relative video-container pin-aspect-4-3">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  src={phrase.video_url}
                  controls
                  controlsList="nodownload nofullscreen noremoteplayback"
                  preload="auto"
                  muted={stage === 'recording'}
                  playsInline
                  onError={() => setError('Erro ao carregar vídeo de referência')}
                  aria-label="Vídeo de referência em Libras"
                />
                {stage === 'recording' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-ink/60" aria-hidden="true">
                    <span className="pin-overlay-pill text-base font-semibold animate-pulse">
                      Referência tocando
                    </span>
                  </div>
                )}
              </div>

              {/* Camera / Preview */}
              <div className="relative video-container pin-aspect-4-3">
                {stage === 'recording' ? (
                  <>
                    <video
                      ref={cameraRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      playsInline
                      aria-label="Sua câmera gravando"
                    />
                    {/* Camera toggle button */}
                    <button
                      onClick={toggleCamera}
                      className="camera-toggle-btn"
                      aria-label={facingMode === 'user' ? 'Trocar para câmera traseira' : 'Trocar para câmera frontal'}
                      type="button"
                    >
                      {facingMode === 'user' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 3.5a7 7 0 01-14 0 7 7 0 0114 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>

                    {/* REC indicator - large and pulsing */}
                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-error/95 text-on-primary px-4 py-2 rounded-full shadow-pin-hover">
                      <span className="w-2.5 h-2.5 rounded-full bg-on-primary animate-pulse" aria-hidden="true" />
                      <span className="text-button-md font-semibold">REC</span>
                      <span className="text-button-md font-semibold tabular-nums">{formatTime(recordingTime)}</span>
                    </div>

                    {/* Time elapsed / total */}
                    <div className="absolute bottom-3 right-3 text-button-sm text-on-dark/90 bg-ink/80 px-3 py-1.5 rounded-full">
                      {formatTime(recordingTime)} / {formatTime(maxDuration)}
                    </div>
                  </>
                ) : (
                  <>
                    {previewUrl && (
                      <>
                        <video
                          className="w-full h-full object-cover"
                          src={previewUrl}
                          controls
                          autoPlay
                          playsInline
                          aria-label="Sua gravação para revisão"
                        />
                        <div className="absolute bottom-3 right-3 text-button-sm text-on-dark/90 bg-ink/80 px-3 py-1.5 rounded-full">
                          Duração: {formatTime(recordingTime)}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              {stage === 'recording' && (
                <button
                  onClick={handleStopRecording}
                  className="btn-primary bg-error active:bg-error-deep text-body-strong px-8 py-3 w-full sm:w-auto min-h-[48px]"
                  aria-label="Parar gravação agora"
                >
                  Parar
                </button>
              )}

              {stage === 'preview' && (
                <>
                  <button
                    onClick={handleRetry}
                    className="btn-secondary w-full sm:w-auto min-h-[48px]"
                    aria-label="Gravar novamente"
                  >
                    Gravar de novo
                  </button>
                  <button
                    onClick={handleUpload}
                    className="btn-primary w-full sm:w-auto min-h-[48px] font-semibold"
                    disabled={uploadProgress > 0}
                    aria-label={uploadProgress > 0 ? 'Enviando gravação, aguarde' : 'Enviar gravação para o banco'}
                  >
                    {uploadProgress > 0 ? 'Enviando...' : 'Enviar'}
                  </button>
                </>
              )}
            </div>
            </>
          )}

          {/* Stage: Uploading */}
          {stage === 'uploading' && (
            <div className="feature-card text-center py-12 animate-in">
              <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-label="Enviando gravação" />
              <h2 className="text-heading-xl tracking-tight mb-2">Enviando sua gravação...</h2>
              <div className="w-56 mx-auto">
                <div className="progress-bar-thick">
                  <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-caption-md text-mute mt-2">{uploadProgress}%</p>
              </div>
            </div>
          )}

          {/* Stage: Done */}
          {stage === 'done' && (
            <div className="feature-card text-center py-12 animate-in">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success-pale flex items-center justify-center">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-heading-xl tracking-tight mb-2">Enviado com sucesso!</h2>
              <p className="text-body-md text-body mb-6 max-w-md mx-auto leading-relaxed">
                Obrigado! Sua gravação foi salva no banco de dados de Libras para pesquisa.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href={`/record/${phraseId}`} className="btn-primary w-full sm:w-auto min-h-[48px]">
                  Gravar outro
                </a>
                <a href="/" className="btn-secondary w-full sm:w-auto min-h-[48px]">
                  Escolher outra frase
                </a>
              </div>
            </div>
          )}

          {/* Mobile: collapsible reference video during recording */}
          {stage === 'recording' && (
            <details className="mt-8 sm:hidden">
              <summary className="cursor-pointer text-body-strong text-primary flex items-center gap-2 p-3 rounded-md bg-surface-card hover:bg-secondary-bg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2z" />
                </svg>
                Ver vídeo de referência
              </summary>
              <div className="mt-4 relative video-container pin-aspect-4-3">
                <video
                  src={phrase.video_url}
                  controls
                  controlsList="nodownload nofullscreen"
                  autoPlay
                  muted
                  playsInline
                  aria-label="Vídeo de referência em Libras"
                />
              </div>
            </details>
          )}
        </div>
      </div>
    </main>
  );
}