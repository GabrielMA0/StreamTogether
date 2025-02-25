import { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import axios from 'axios';
import Loading from '../Components/Loading/Loading'

const socket = io("http://localhost:5000"); // Conectando ao backend

const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/video/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        },
      });

      setVideoUrl(response.data); // Garante que pega o link certo
    } catch (error: any) {
      console.error("Erro ao enviar arquivo:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handlePlay = () => {
    socket.emit("sync-video", { action: "play" });
  };

  const handlePause = () => {
    socket.emit("sync-video", { action: "pause" });
  };

  const handleSeek = () => {
    if (!videoRef.current) return; // Sai da função se videoRef.current for null

    setIsSeeking((prev) => {
      if (!prev) {
        socket.emit("sync-video", {
          action: "seek",
          currentTime: videoRef.current!.currentTime, // O "!" agora é seguro
        });

        setTimeout(() => setIsSeeking(false), 500);
      }
      return true;
    });
  };

  const handleChangeFile = async () => {
    try {
      await axios.delete(`http://localhost:5000/video`);
      window.location.reload();

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  }

  useEffect(() => {
    socket.on("sync-video", ({ action, currentTime }: { action: string, currentTime: number }) => {
      if (videoRef.current) {
        if (action === "play" && videoRef.current.paused) {
          videoRef.current.play().catch((err) => console.error("Erro ao dar play:", err));
        }
        if (action === "pause" && !videoRef.current.paused) {
          videoRef.current.pause();
        }
        if (action === "seek") {
          setIsSeeking(true);
          videoRef.current.currentTime = currentTime;

          setTimeout(() => {
            setIsSeeking(false);
          }, 500);
        }
      }
    });

    return () => {
      socket.off("sync-video");
    };
  }, []);


  useEffect(() => {
    const searchVideo = async () => {
      if (!videoUrl) {
        try {
          const response = await axios.get(`http://localhost:5000/video`);
          setVideoUrl(response.data)

          console.log(response.data)
        } catch (error) {
          console.error(error.response.data);
        }
      }
    }

    searchVideo()

  }, [videoUrl]);

  return (
    <>
      {isLoading ? (
        <Loading progress={progress} />
      ) : !videoUrl ? (
        <div className="p-[20px] w-[90%] sm:w-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-blue-200/30 border-4 border-blue-500 rounded-3xl sm:p-20">
          <div className="flex flex-col items-center gap-2">
            <p>Clique no botão abaixo e selecione um vídeo</p>
            <p className="font-bold">(Arquivos suportados: MP4, MOV, AVI, MKV)</p>
            <button className="px-6 py-3 rounded-lg border border-blue-500 bg-blue-300 transition-transform hover:scale-110" onClick={handleButtonClick}>
              Subir arquivo
            </button>
          </div>
          <input ref={inputRef} type="file" accept=".mkv,.mp4,.avi,.mov" onChange={handleFileUpload} className="hidden" />
        </div>
      ) : (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-5 w-full">
          <video ref={videoRef} onPlay={handlePlay} onPause={handlePause} onSeeked={handleSeek} controls muted className="w-[90%] sm:w-2/5">
            <source src={`http://localhost:5000${videoUrl.fileUrl}`} type="video/mp4" />
            Seu navegador não suporta a tag de vídeo.
          </video>
          <button className="px-6 py-3 rounded-lg border border-blue-500 bg-blue-300 transition-transform hover:scale-110" onClick={handleChangeFile}>
            Escolher outro arquivo
          </button>
        </div>
      )}
    </>
  );
};

export default VideoPlayer;
