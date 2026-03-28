import React, { useEffect, useState } from 'react';
import { getOfflineHistory } from '../utils/pwa-utils';

const OfflinePage: React.FC = () => {
    const [offlineHistory, setOfflineHistory] = useState<any[]>([]);
    
    useEffect(() => {
        const loadHistory = async () => {
            const history = await getOfflineHistory();
            setOfflineHistory(history);
        };
        loadHistory();
    }, []);

    return (
        <div className="offline-container p-6 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">You are currently offline</h1>
            <p className="text-gray-600 mb-8">
                The application will function normally once a stable connection is regained.
                Your classification history is currently being saved to your local storage.
            </p>

            <div className="history-section mt-12">
                <h2 className="text-xl font-semibold mb-6">Local Classification History Samples</h2>
                {offlineHistory.length > 0 ? (
                    <div className="history-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {offlineHistory.map((item, index) => (
                            <div key={index} className="history-item p-4 bg-white shadow-md rounded-lg">
                                <p className="font-medium">{item.label}</p>
                                <p className="text-sm text-gray-400">{new Date(item.timestamp).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 italic">No offline classifications found.</p>
                )}
            </div>

            <button 
                className="mt-12 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
                onClick={() => window.location.reload()}
            >
                Try Reconnecting
            </button>
        </div>
    );
};

export default OfflinePage;
