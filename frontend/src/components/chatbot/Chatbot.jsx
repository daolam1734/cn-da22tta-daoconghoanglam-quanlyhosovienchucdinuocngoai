import React, { useState, useRef, useEffect } from 'react';
import { MdChat, MdClose, MdSend, MdSmartToy } from 'react-icons/md';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { text: 'Xin chào! Tôi là trợ lý ảo TVU. Tôi có thể giúp gì cho bạn?', isBot: true, time: new Date() }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMsg = { text: message, isBot: false, time: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setMessage('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            if (data.success) {
                setMessages(prev => [...prev, { text: data.data.reply, isBot: true, time: new Date() }]);
            } else {
                setMessages(prev => [...prev, { text: 'Xin lỗi, tôi đang gặp sự cố kết nối.', isBot: true, time: new Date() }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { text: 'Lỗi kết nối đến máy chủ.', isBot: true, time: new Date() }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`chatbot-wrapper ${isOpen ? 'open' : ''}`}>
            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="bot-avatar">
                                <MdSmartToy size={20} />
                            </div>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Trợ lý ảo TVU</div>
                                <div style={{ fontSize: '0.7rem', color: '#81c995' }}>● Đang trực tuyến</div>
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>
                            <MdClose size={20} />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-bubble ${msg.isBot ? 'bot' : 'user'}`}>
                                <div className="text">{msg.text}</div>
                                <div className="time">
                                    {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="message-bubble bot">
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Nhập câu hỏi của bạn..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={loading}
                        />
                        <button type="submit" disabled={!message.trim() || loading}>
                            <MdSend size={20} />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Button */}
            <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <MdClose size={28} /> : <MdChat size={28} />}
                {!isOpen && <span className="notification-dot"></span>}
            </button>
        </div>
    );
};

export default Chatbot;
