import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
}

export const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "¡Hola! Soy tu asistente de becas de la UCE. ¿En qué te puedo ayudar hoy?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMsg: Message = { id: Date.now().toString(), sender: "user", text: inputText };
    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "El certificado bancario debe estar a tu nombre y ser de una cuenta activa.",
        "Una vez que subas el contrato, la Inteligencia Artificial lo validará en menos de 1 minuto.",
        "Los desembolsos se realizan a través de Stripe después de la validación del Coordinador.",
        "Si tienes problemas con tu beca, puedes escribir a soporte@uce.edu.ec.",
      ];
      const botResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: "bot", text: botResponse },
      ]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-uce-red hover:bg-red-800 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 flex items-center justify-center"
        >
          <MessageSquare size={28} />
        </button>
      )}

      {/* Ventana de Chat */}
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[500px] animate-fade-in">
          <div className="bg-uce-blue p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot size={24} />
              <h3 className="font-bold">Asistente IA - Becas UCE</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-300">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.sender === "user"
                      ? "bg-uce-blue text-white rounded-br-none"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {msg.sender === "user" ? <User size={12} /> : <Bot size={12} />}
                    <span className="text-[10px] opacity-70 font-bold uppercase">
                      {msg.sender}
                    </span>
                  </div>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Escribe tu pregunta..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-uce-blue text-sm"
            />
            <button
              onClick={handleSend}
              className="bg-uce-blue text-white p-2 rounded-full hover:bg-blue-800 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
