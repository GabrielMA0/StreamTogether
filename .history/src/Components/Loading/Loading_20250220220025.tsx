
const Loading = ({ progress }: { progress: number }) => {
    return (
        <div className="flex flex-col items-center gap-2 w-sm">
            <span className="text-gray-700 font-bold">Carregando</span>
            <div className="w-full bg-gray-300 rounded-lg overflow-hidden h-5">
                <div
                    className="bg-green-500 h-full text-center text-white text-sm"
                    style={{ width: `${progress}%` }}
                >
                    <span>{progress}%</span>
                </div>
            </div>
        </div>
    );
};

export default Loading;
