import { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import axios from 'axios';
import Loading from '../Components/Loading/Loading'

// const socket = io(import.meta.env.VITE_SOCKET_SERVER_URL);
const currentUrl = window.location.hostname;
const baseUrl = import.meta.env.VITE_SOCKET_SERVER_URL
console.log(currentUrl);
const socket = io(currentUrl === 'localhost' ? "http://localhost:5000" : baseUrl);

const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<{ fileUrl: string } | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_SOCKET_SERVER_URL}/video/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        },
      });

      setVideoUrl(response.data);
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
    if (videoRef.current?.paused) return; // Se já está pausado, não dispara

    socket.emit("sync-video", { action: "play" });
    console.log("play");
  };

  const handlePause = () => {
    if (!videoRef.current?.paused) return; // Se já está rodando, não dispara

    socket.emit("sync-video", { action: "pause" });
    console.log("pause");
  };


  // const handleSeek = () => {
  //   if (!videoRef.current || isSeeking) return;

  //   setIsSeeking(true);
  //   socket.emit("sync-video", {
  //     action: "seek",
  //     currentTime: videoRef.current.currentTime,
  //   });

  //   console.log("seek");

  //   setTimeout(() => setIsSeeking(false), 500);
  // };

  const handleChangeFile = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_SOCKET_SERVER_URL}/video`);
      window.location.reload();

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  }

  useEffect(() => {
    socket.on("sync-video", ({ action, currentTime }: { action: string, currentTime: number }) => {

      if (videoRef.current) {
        if (action === "play") {
          videoRef.current.play();
        }
        if (action === "pause") {
          videoRef.current.pause();
        }
        if (action === "seek") {
          videoRef.current.currentTime = currentTime;
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
          const response = await axios.get(`${import.meta.env.VITE_SOCKET_SERVER_URL}/video`);
          setVideoUrl(response.data)
        } catch (error) {
          if (error instanceof Error) {
            console.error(error.message);
          } else {
            console.error("Erro desconhecido:", error);
          }
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
            <button className="px-6 py-3 rounded-lg border cursor-pointer border-blue-500 bg-blue-300 transition-transform hover:scale-110" onClick={handleButtonClick}>
              Subir arquivo
            </button>
          </div>
          <input ref={inputRef} type="file" accept=".mkv,.mp4,.avi,.mov" onChange={handleFileUpload} className="hidden" />
        </div>
      ) : (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-5 w-full">
          <video ref={videoRef} onPlay={handlePlay} onPause={handlePause} controls muted className="w-[90%] sm:w-2/5">
            <source src={`${import.meta.env.VITE_SOCKET_SERVER_URL}${videoUrl.fileUrl}`} type="video/mp4" />
            Seu navegador não suporta a tag de vídeo.
          </video>
          <button className="px-6 py-3 rounded-lg cursor-pointer border border-blue-500 bg-blue-300 transition-transform hover:scale-110" onClick={handleChangeFile}>
            Escolher outro arquivo
          </button>
        </div>
      )}
    </>
  );
};

export default VideoPlayer;
