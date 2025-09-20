import React, { useState, useEffect, useRef } from 'react';
import { getChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import { PaperAirplaneIcon } from './icons/Icons';
import { Chat } from '@google/genai';
import { useLocalization } from '../contexts/LocalizationContext';

const AiChat: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { t } = useLocalization();

    useEffect(() => {
        const newChat = getChat();
        setChat(newChat);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !chat || isLoading) return;

        const newUserMessage: ChatMessage = { role: 'user', text: userInput };
        setMessages(prev => [...prev, newUserMessage, { role: 'model', text: '' }]);
        const messageToSend = userInput;
        setUserInput('');
        setIsLoading(true);
        
        try {
            const result = await chat.sendMessageStream({ message: messageToSend });
            let text = '';
            for await (const chunk of result) {
                text += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'model') {
                        newMessages[newMessages.length - 1].text = text;
                    }
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                 if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'model') {
                    newMessages[newMessages.length - 1].text = "Sorry, I encountered an error. Please try again.";
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const ChatBubble: React.FC<{ message: ChatMessage; isLastModelMessage: boolean }> = ({ message, isLastModelMessage }) => {
        const isUser = message.role === 'user';
        const isTyping = isLoading && isLastModelMessage && message.text === '';

        const userBubbleClasses = 'bg-teal-500 text-white rounded-br-none rtl:rounded-br-2xl rtl:rounded-bl-none';
        const modelBubbleClasses = 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none rtl:rounded-bl-2xl rtl:rounded-br-none';

        return (
            <div className={`flex my-2 animate-fadeInUp ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${isUser ? userBubbleClasses : modelBubbleClasses}`}>
                    {isTyping ? (
                        <div className="flex items-center space-x-1 p-1">
                           <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                           <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                           <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></span>
                        </div>
                    ) : (
                        <p className="whitespace-pre-wrap">{message.text}</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 8rem)' }}>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t('aiCompanion')}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-md mb-4">{t('aiCompanionDescription')}</p>
            
            <div className="flex-grow overflow-y-auto space-y-2 pr-2 -mr-2 rtl:pr-0 rtl:-ml-2 rtl:pl-2">
                {messages.map((msg, index) => (
                    <ChatBubble 
                        key={index} 
                        message={msg}
                        isLastModelMessage={index === messages.length - 1 && msg.role === 'model'}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="mt-4 flex items-center space-x-3 rtl:space-x-reverse">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={t('askAQuestion')}
                    className="flex-grow p-3 border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow shadow-sm"
                    disabled={isLoading}
                    aria-label="Chat input"
                />
                <button
                    type="submit"
                    className="bg-teal-500 text-white p-3 rounded-xl disabled:bg-gray-300 dark:disabled:bg-gray-600 transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-teal-500/20"
                    disabled={isLoading || !userInput.trim()}
                    aria-label={t('sendMessage')}
                >
                    <PaperAirplaneIcon className="w-6 h-6" />
                </button>
            </form>
        </div>
    );
};

export default AiChat;