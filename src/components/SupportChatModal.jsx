// src/components/SupportChatModal.jsx
// AL Rehman Meta Eggs — VIP 24/7 Live Support & Chat Desk
// Direct WhatsApp Link to Admin + In-App Live Chat with Edit/Delete

import React, { useState, useEffect, useRef } from 'react';
import { useFarm } from '../context/FarmContext';

export default function SupportChatModal({ isOpen, onClose }) {
  const {
    user,
    platformSettings,
    supportMessages,
    sendSupportMessage,
    editSupportMessage,
    deleteSupportMessage,
    getWhatsAppSupportUrl
  } = useFarm();

  const [inputMessage, setInputMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editInputText, setEditInputText] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'channels'
  const chatScrollRef = useRef(null);

  const supportPhone = platformSettings?.communityLinks?.supportPhone || '+923412017923';
  const whatsappGroup = platformSettings?.communityLinks?.whatsappGroup || 'https://chat.whatsapp.com/alrehman-meta-eggs-official';
  const whatsappChannel = platformSettings?.communityLinks?.whatsappChannel || 'https://whatsapp.com/channel/0029VbE0EnG0AgWAs0V6V80j';

  // Filter messages relevant to current farmer (or broadcast)
  const currentUserId = String(user?.accountId || user?.username || '1197');
  const userMessages = supportMessages.filter(
    (m) =>
      String(m.userId) === currentUserId ||
      String(m.userId) === String(user?.username) ||
      m.userId === 'broadcast'
  );

  // Auto-scroll to bottom of chat when new message arrives
  useEffect(() => {
    if (isOpen && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [isOpen, userMessages.length, activeTab]);

  if (!isOpen) return null;

  // Handle Send
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;
    const textToSend = inputMessage;
    setInputMessage('');
    await sendSupportMessage({ message: textToSend });
    if (chatScrollRef.current) {
      setTimeout(() => {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }, 50);
    }
  };

  // Start Editing a message
  const handleStartEdit = (msg) => {
    setEditingMessageId(msg.id);
    setEditInputText(msg.message);
  };

  // Submit Edited message
  const handleSaveEdit = async (msgId) => {
    if (!editInputText.trim()) return;
    await editSupportMessage({ messageId: msgId, newMessage: editInputText });
    setEditingMessageId(null);
    setEditInputText('');
  };

  // Cancel Editing
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditInputText('');
  };

  // Handle Delete
  const handleDelete = async (msgId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      await deleteSupportMessage({ messageId: msgId });
      if (editingMessageId === msgId) {
        handleCancelEdit();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
    >
      <div className="w-full sm:max-w-md bg-gradient-to-b from-[#0a2318] to-[#071911] text-white rounded-t-3xl sm:rounded-3xl border border-emerald-500/40 shadow-[0_10px_50px_rgba(0,0,0,0.95)] flex flex-col h-[88vh] sm:h-auto sm:max-h-[85vh] overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-3.5 bg-gradient-to-r from-emerald-950 via-[#0d3322] to-emerald-950 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <i className="fa-solid fa-headset text-sm"></i>
            </div>
            <div>
              <h3 id="support-modal-title" className="font-manrope font-black text-xs uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <span>Official Live Support Desk</span>
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] text-emerald-200/90 font-semibold tracking-wide">
                  Admin Online • 24/7 Verified Desk
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 border border-emerald-500/40 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
            aria-label="Close Support Desk"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Quick Action WhatsApp & Helpline Banner */}
        <div className="p-3 bg-black/30 border-b border-emerald-500/20 grid grid-cols-2 gap-2">
          {/* Direct WhatsApp Button */}
          <a
            href={getWhatsAppSupportUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-manrope font-black text-[11px] uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all text-center"
            title="Chat directly with Admin on WhatsApp"
          >
            <i className="fa-brands fa-whatsapp text-sm"></i>
            <span>WhatsApp Admin</span>
          </a>

          {/* Direct Call Helpline */}
          <a
            href={`tel:${supportPhone}`}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 text-white font-manrope font-black text-[11px] uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all text-center"
            title="Call Support Helpline"
          >
            <i className="fa-solid fa-phone text-xs"></i>
            <span>Call Helpline</span>
          </a>
        </div>

        {/* Tab Selector: In-App Chat vs Community Links */}
        <div className="flex border-b border-emerald-500/20 bg-black/20 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'text-[#c9f36a] border-b-2 border-[#c9f36a] bg-emerald-950/40 font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-comments text-xs"></i>
            <span>In-App Live Chat</span>
            {userMessages.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-[9px] text-emerald-300 font-mono">
                {userMessages.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('channels')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'channels'
                ? 'text-[#c9f36a] border-b-2 border-[#c9f36a] bg-emerald-950/40 font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-users-line text-xs"></i>
            <span>Official Groups</span>
          </button>
        </div>

        {/* Content Body */}
        {activeTab === 'chat' ? (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* Messages Scroll Area */}
            <div
              ref={chatScrollRef}
              className="flex-1 min-h-0 p-3.5 space-y-3 overflow-y-auto custom-scrollbar"
            >
              {/* Bot Greeting Header */}
              <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-3 text-xs flex items-start gap-2.5 shadow-sm">
                <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                  <i className="fa-solid fa-robot text-xs"></i>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-[#c9f36a] text-[11px]">AL Rehman Support Bot</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-300 text-[8px] font-black uppercase">Official</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Assalam-o-Alaikum <strong>{user?.username || 'Farmer'}</strong>! Welcome to AL Rehman Meta Eggs VIP Helpdesk.
                    Send your questions below or tap <strong>WhatsApp Admin</strong> for instant direct WhatsApp chat.
                  </p>
                </div>
              </div>

              {/* Chat Messages */}
              {userMessages.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <i className="fa-solid fa-message text-2xl text-emerald-500/40 mb-2 block"></i>
                  <span>No message history yet. Type your query below!</span>
                </div>
              ) : (
                userMessages.map((msg) => {
                  const isAdminMsg = msg.senderRole === 'admin';
                  const isMyFarmerMsg = !isAdminMsg;
                  const isEditingThis = editingMessageId === msg.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMyFarmerMsg ? 'items-end' : 'items-start'} group`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[9.5px] font-bold text-slate-400">
                          {isAdminMsg ? 'Admin Support' : (msg.senderName || 'You')}
                        </span>
                        <span className="text-[8.5px] text-slate-500 font-mono">
                          {msg.createdAt
                            ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </span>
                        {isMyFarmerMsg && (
                          <span className="ml-1 inline-flex items-center">
                            {msg.isRead ? (
                              <i className="fa-solid fa-check-double text-emerald-400 text-[9px]" title="Read by Admin"></i>
                            ) : (
                              <i className="fa-solid fa-check text-slate-400 text-[9px]" title="Delivered"></i>
                            )}
                          </span>
                        )}
                        {msg.isEdited && (
                          <span className="text-[8px] text-amber-400/80 italic">(edited)</span>
                        )}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md relative ${
                          isMyFarmerMsg
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-tr-xs border border-emerald-400/30'
                            : 'bg-[#133224] text-slate-100 rounded-tl-xs border border-emerald-500/40'
                        }`}
                      >
                        {isEditingThis ? (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              value={editInputText}
                              onChange={(e) => setEditInputText(e.target.value)}
                              className="w-full bg-black/60 border border-amber-400/60 rounded-lg p-2 text-xs text-white focus:outline-none"
                              placeholder="Edit your message..."
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-2 py-1 rounded bg-black/40 text-slate-300 text-[10px] hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(msg.id)}
                                className="px-2.5 py-1 rounded bg-amber-500 text-black font-extrabold text-[10px] hover:bg-amber-400"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap break-words leading-relaxed">
                            {msg.message}
                          </p>
                        )}
                      </div>

                      {/* Message Actions (Edit / Delete) for User's messages */}
                      {isMyFarmerMsg && !isEditingThis && (
                        <div className="flex items-center gap-2 mt-1 px-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(msg)}
                            className="text-[9.5px] text-amber-300/90 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
                            title="Edit this message"
                          >
                            <i className="fa-solid fa-pen text-[8px]"></i>
                            <span>Edit</span>
                          </button>
                          <span className="text-slate-600">•</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(msg.id)}
                            className="text-[9.5px] text-rose-400/90 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                            title="Delete this message"
                          >
                            <i className="fa-solid fa-trash-can text-[8px]"></i>
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Inquiry FAQ Chips */}
            <div className="px-3 py-1.5 bg-black/40 border-t border-emerald-500/20 flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
              <span className="text-[8.5px] uppercase font-bold text-slate-400 whitespace-nowrap">FAQ:</span>
              {[
                "How to buy hens with Easypisa/JazzCash?",
                "When will my withdrawal arrive?",
                "What is today's egg rate?",
                "How does referral bonus work?"
              ].map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputMessage(q)}
                  className="px-2.5 py-1 rounded-full bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/30 text-[10px] text-emerald-300 whitespace-nowrap cursor-pointer transition-all active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-2.5 bg-black/60 border-t border-emerald-500/20 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message to Admin Support..."
                className="flex-1 bg-black/70 border border-emerald-500/40 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-[#16a34a] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shadow-sm cursor-pointer shrink-0"
                title="Send Message"
                aria-label="Send Message"
              >
                <i className="fa-solid fa-paper-plane text-xs"></i>
              </button>
            </form>
          </div>
        ) : (
          /* Official Community Channels View */
          <div className="flex-1 min-h-0 p-4 space-y-3 overflow-y-auto">
            {/* WhatsApp Group */}
            <div className="bg-[#0f2d1e] border border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center text-lg">
                  <i className="fa-brands fa-whatsapp"></i>
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
                    Official WhatsApp Group
                  </h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    Connect with 10,000+ active farmers &amp; get tips.
                  </p>
                </div>
              </div>
              <a
                href={whatsappGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[10px] uppercase tracking-wider shrink-0 transition-all active:scale-95 shadow-xs"
              >
                Join
              </a>
            </div>

            {/* WhatsApp Channel */}
            <div className="bg-[#0f2d1e] border border-purple-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center text-lg">
                  <i className="fa-solid fa-bullhorn"></i>
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
                    Official News Channel
                  </h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    Daily egg rates, policy updates &amp; announcements.
                  </p>
                </div>
              </div>
              <a
                href={whatsappChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-extrabold text-[10px] uppercase tracking-wider shrink-0 transition-all active:scale-95 shadow-xs"
              >
                Follow
              </a>
            </div>

            {/* Direct Admin WhatsApp Chat Details */}
            <div className="bg-black/40 border border-emerald-500/20 rounded-2xl p-3 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Admin Support Number:</span>
                <span className="text-emerald-300 font-mono font-bold text-xs">{supportPhone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Response Time:</span>
                <span className="text-[#c9f36a] font-bold text-xs">2 - 5 Minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Operating Hours:</span>
                <span className="text-white font-bold text-xs">24 Hours / 7 Days</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer info pill with safe-area padding */}
        <div className="px-3.5 py-2.5 pb-[max(12px,env(safe-area-inset-bottom,12px))] bg-black/80 border-t border-emerald-500/20 flex items-center justify-between text-[9px] text-slate-400 shrink-0">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <i className="fa-solid fa-shield-check"></i>
            <span>End-to-End SSL Encrypted</span>
          </span>
          <span>AL Rehman Meta Eggs Official</span>
        </div>

      </div>
    </div>
  );
}
