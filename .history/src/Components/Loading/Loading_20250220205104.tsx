
import "./style.css";

const Loading = () => {

    return (
        <div className="teste">
            <div class="progress-container">
                <div class="progress-bar" id="progressBar">0%</div>
            </div>
            <span className="text">Carregando...</span>
        </div>
    );
};

export default Loading;
