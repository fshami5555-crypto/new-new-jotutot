import React, { useState, useEffect, useRef } from 'react';
import { Course, ChatMessage, Language } from '../types';
import { getChatbotResponse } from '../services/geminiService';

interface ChatbotProps {
    courses: Course[];
    onSelectCourse: (id: string) => void;
    strings: { [key: string]: string };
    language: Language;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ courses, onSelectCourse, strings, language, isOpen, setIsOpen }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    // Message for under construction
    const underConstructionMsg = "المساعد الذكي Mr.Pincel تحت الإنشاء حالياً وسيكون متاحاً لمساعدتكم قريباً جداً. نحن نعمل بجهد لتقديم تجربة تعليمية فريدة مدعومة بالذكاء الاصطناعي. شكراً لصبركم!";

    useEffect(() => {
        const showTimer = setTimeout(() => {
            if (!isOpen) {
                setShowTooltip(true);
            }
        }, 2000);

        const hideTimer = setTimeout(() => {
            setShowTooltip(false);
        }, 9000);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, [isOpen]);


    useEffect(() => {
        if (isOpen) {
            setShowTooltip(false);
            if (messages.length === 0) {
                // Set initial message to the construction notice
                setMessages([{ sender: 'bot', text: underConstructionMsg }]);
            }
        }
    }, [isOpen, messages.length]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const userMsg = userInput.trim();
        setUserInput('');
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const { responseText, recommendedCourseIds } = await getChatbotResponse(userMsg, courses);
            
            setMessages(prev => [...prev, { 
                sender: 'bot', 
                text: responseText,
                recommendedCourseIds 
            }]);
        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages(prev => [...prev, { 
                sender: 'bot', 
                text: language === 'ar' ? 'عذراً، حدث خطأ ما. يرجى المحاولة لاحقاً.' : 'Sorry, something went wrong. Please try again later.' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const mrPincelIcon = "https://i.ibb.co/sd7GkLLT/image-removebg-preview.png";

    return (
        <>
            {/* Tooltip */}
            <div 
                role="tooltip"
                className={`fixed bottom-24 right-6 w-64 bg-blue-900 text-white p-3 rounded-lg shadow-lg z-50 transition-all duration-500 ease-in-out ${showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <p className="text-sm text-center font-medium">
                    {language === 'ar' ? 'مساعدك الذكي Mr.Pincel متاح الآن!' : 'Mr.Pincel AI Assistant is now available!'}
                </p>
                <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-blue-900"></div>
            </div>

            {/* FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 bg-green-500 text-white rounded-full p-2 shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-transform duration-300 z-50 border-2 border-white ${isOpen ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`}
                aria-label="Open Chat"
            >
                <img 
                    src={mrPincelIcon} 
                    alt="Mr.Pincel" 
                    className="w-14 h-14 object-contain"
                />
            </button>

            {/* Chat Window */}
            <div className={`fixed bottom-24 right-6 w-full max-w-sm h-[70vh] max-h-[600px] bg-white rounded-xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                {/* Header */}
                <div className="flex-shrink-0 bg-blue-900 text-white p-4 flex justify-between items-center rounded-t-xl">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="bg-white rounded-full p-1">
                             <img src={mrPincelIcon} alt="Mr.Pincel" className="w-8 h-8 object-contain" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{strings.chatbotTitle}</h3>
                            <p className="text-xs text-green-400 font-bold">Online ✨</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-lg shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                
                                {msg.recommendedCourseIds && msg.recommendedCourseIds.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <p className="text-xs font-bold text-blue-900 mb-2">
                                            {language === 'ar' ? 'الدورات المقترحة:' : 'Recommended Courses:'}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {msg.recommendedCourseIds.map(courseId => {
                                                const course = courses.find(c => c.id === courseId);
                                                if (!course) return null;
                                                return (
                                                    <button
                                                        key={courseId}
                                                        onClick={() => {
                                                            onSelectCourse(courseId);
                                                            setIsOpen(false);
                                                        }}
                                                        className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full hover:bg-green-100 transition-colors"
                                                    >
                                                        {language === 'ar' ? course.title : (course.title_en || course.title)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white text-gray-800 border border-gray-200 p-3 rounded-lg rounded-bl-none shadow-sm flex items-center space-x-2 space-x-reverse">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="flex-shrink-0 p-4 border-t bg-white">
                    <div className="flex space-x-2 space-x-reverse">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={language === 'ar' ? 'اسأل Mr.Pincel...' : 'Ask Mr.Pincel...'}
                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        <button 
                            type="submit"
                            disabled={!userInput.trim() || isLoading}
                            className="bg-blue-900 text-white font-bold px-4 rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                           {strings.chatbotSend}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Chatbot;