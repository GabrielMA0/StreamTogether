import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import axios from 'axios';
import "./style.css";
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

      setVideoUrl(response.data.fileUrl || ""); // Garante que pega o link certo
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
    if (videoRef.current) {
      setIsSeeking((prev) => {
        if (!prev) {
          socket.emit("sync-video", {
            action: "seek",
            currentTime: videoRef.current.currentTime,
          });

          // Permite que novas buscas sejam enviadas no futuro
          setTimeout(() => setIsSeeking(false), 500);
        }
        return true;
      });
    }
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
    socket.on("sync-video", ({ action, currentTime }) => {
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
        // <div className="w-full bg-gray-200 rounded h-4 mt-2">
        //   <div className="bg-blue-500 h-4 rounded" style={{ width: `${progress}%` }} />
        //   <span>Carregando {progress}%</span>
        // </div>
        <Loading></Loading>
      ) : !videoUrl ? (
        <div className="containerUploadFile">
          <div className="containerTexts">
            <p>Arraste um vídeo para o navegador ou clique no botão abaixo e selecione o vídeo</p>
            <p className="subTitle">(Arquivos suportados: MP4, MOV, AVI, MKV)</p>
            <button className="btnUpload" onClick={handleButtonClick}>
              Subir arquivo
            </button>
          </div>
          <input ref={inputRef} type="file" accept=".mkv,.mp4,.avi,.mov" onChange={handleFileUpload} />
        </div>
      ) : (
        <div className="video-container">
          <video ref={videoRef} onPlay={handlePlay} onPause={handlePause} onSeeked={handleSeek} controls muted>
            <source src={`http://localhost:5000${videoUrl.fileUrl}`} type="video/mp4" />
            {/* <source src={videoUrl} type={videoUrl.mimetype} /> */}
            Seu navegador não suporta a tag de vídeo.
          </video>
          <button className="btnUpload" onClick={handleChangeFile}>Escolher outro arquivo</button>
        </div>
      )}
    </>
  );
};

export default VideoPlayer;
