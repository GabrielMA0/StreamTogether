
import "./style.css";

const Loading = () => {

    return (
        <div className="teste">
            <div className="progress-container">
                <div className="progress-bar" id="progressBar">0%</div>
            </div>
            <span className="text">Carregando...</span>
        </div>
    );
};

export default Loading;
