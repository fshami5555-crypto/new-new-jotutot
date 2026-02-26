
import React, { useState, useRef, useEffect } from 'react';
import { getChatbotResponse } from '../../services/geminiService';
import { Course } from '../../types';

interface AIAssistantViewProps {
    courses: Course[];
}

const AIAssistantView: React.FC<AIAssistantViewProps> = ({ courses }) => {
    const [messages, setMessages] = useState<{sender: 'user' | 'bot', text: string}[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const { responseText } = await getChatbotResponse(userMsg, courses);
            setMessages(prev => [...prev, { sender: 'bot', text: responseText }]);
        } catch (error) {
            console.error('AI Assistant error:', error);
            setMessages(prev => [...prev, { sender: 'bot', text: 'عذراً، حدث خطأ ما. يرجى المحاولة لاحقاً.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">المساعد الذكي Mr.Pincel</h1>
            <div className="bg-white p-6 rounded-xl shadow-md h-[600px] flex flex-col border border-gray-100">
                <div className="flex-grow mb-4 p-4 bg-gray-50 rounded-xl overflow-y-auto space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-16">
                            <div className="text-5xl mb-4">🤖</div>
                            <p className="text-xl font-bold text-blue-900 mb-2">مرحباً! أنا Mr.Pincel</p>
                            <p>أنا هنا لمساعدتك في رحلتك التعليمية. اسألني عن أي شيء!</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white text-gray-800 border border-gray-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-2 space-x-reverse">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSend} className="flex gap-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="اسأل عن أي شيء..." 
                        className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <button 
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="bg-blue-900 text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                    >
                        إرسال
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIAssistantView;
