
import "./style.css";

const Loading = () => {

    return (
        <div className="teste">
            <span className="text">Carregando</span>
            <div className="progress-container">
                <div className="progress-bar" id="progressBar">0%</div>
            </div>
        </div>
    );
};

export default Loading;
