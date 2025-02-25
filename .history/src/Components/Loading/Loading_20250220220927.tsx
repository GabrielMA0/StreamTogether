
const Loading = ({ progress }: { progress: number }) => {
    return (
        <div className="flex flex-col items-center gap-2 w-sm">
            <span className="text-gray-700 font-bold">Carregando</span>
            <div className="w-full bg-gray-300 rounded-lg overflow-hidden h-5 relative">
                <span className="w-full text-white text-sm text-center">{progress}%</span>
                <div
                    className="bg-green-500 h-full "
                    style={{ width: `${progress}%` }}
                >
                </div>
            </div>
        </div>
    );
};

export default Loading;
