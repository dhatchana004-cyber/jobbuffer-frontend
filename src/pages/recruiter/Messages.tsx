import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Send, 
  MessageSquare, 
  MapPin, 
  Check, 
  CheckCheck, 
  Plus, 
  X, 
  Loader2,
  PhoneCall,
  Mail,
  Sparkles,
  Zap
} from 'lucide-react';
import api from '../../services/api';

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    email: string;
    role: string;
    location: string;
    phone?: string;
    profileImage: string | null;
  };
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: string;
    read: boolean;
  } | null;
  updatedAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
}

const QUICK_TEMPLATES = [
  { id: '1', label: '👋 Introduction', text: 'Hi, thank you for applying! We reviewed your profile and would love to discuss your experience.' },
  { id: '2', label: '📞 Phone Call', text: 'Would you be available for a brief 15-minute phone screening this week? Let us know your preferred time slot.' },
  { id: '3', label: '📄 Latest Resume', text: 'Could you kindly share an updated copy of your resume or portfolio link for our technical team to review?' },
  { id: '4', label: '⭐ Shortlisted', text: 'Great news! Your application has been shortlisted. Our hiring manager is looking forward to connecting with you.' }
];

export default function Messages() {
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [selectedCandidateUserId, setSelectedCandidateUserId] = useState('');
  const [initialChatMessage, setInitialChatMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user to know which messages are mine
  const { data: currentUserData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data;
    }
  });

  const currentUserId = currentUserData?.user?.id || currentUserData?.id;

  // Fetch all conversations
  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery<Conversation[]>({
    queryKey: ['recruiterConversations'],
    queryFn: async () => {
      const res = await api.get('/recruiter/messages/conversations');
      return res.data;
    },
    refetchInterval: 5000 // Poll every 5s for new messages
  });

  // Automatically select the first conversation if none selected
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  // Fetch active conversation messages
  const { data: activeConversation, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['conversationMessages', activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return null;
      const res = await api.get(`/recruiter/messages/conversations/${activeConversationId}`);
      return res.data;
    },
    enabled: !!activeConversationId,
    refetchInterval: 3000
  });

  // Fetch candidates for "+ New Chat"
  const { data: candidates = [] } = useQuery({
    queryKey: ['candidatesForChat'],
    queryFn: async () => {
      const res = await api.get('/recruiter/candidates');
      return res.data;
    }
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ convId, content }: { convId: string; content: string }) => {
      const res = await api.post(`/recruiter/messages/conversations/${convId}/messages`, { content });
      return res.data;
    },
    onSuccess: () => {
      setMessageInput('');
      queryClient.invalidateQueries({ queryKey: ['conversationMessages', activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ['recruiterConversations'] });
    }
  });

  // Start new conversation mutation
  const startConversationMutation = useMutation({
    mutationFn: async ({ recipientUserId, initialMessage }: { recipientUserId: string; initialMessage: string }) => {
      const res = await api.post('/recruiter/messages/start', { recipientUserId, initialMessage });
      return res.data;
    },
    onSuccess: (newConv) => {
      queryClient.invalidateQueries({ queryKey: ['recruiterConversations'] });
      setIsNewChatModalOpen(false);
      setSelectedCandidateUserId('');
      setInitialChatMessage('');
      setActiveConversationId(newConv.id);
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversationId || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate({
      convId: activeConversationId,
      content: messageInput.trim()
    });
  };

  const handleStartChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidateUserId) return;
    startConversationMutation.mutate({
      recipientUserId: selectedCandidateUserId,
      initialMessage: initialChatMessage
    });
  };

  const getInitials = (name: string) => {
    if (!name) return 'CD';
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formatMessageTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = (Array.isArray(conversations) ? conversations : []).filter(c => 
    !searchTerm ||
    (c.participant?.name && c.participant.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.participant?.email && c.participant.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const currentParticipant = activeConversation?.participants?.find(
    (p: any) => p.id !== currentUserId
  ) || activeConversation?.participants?.[0];

  return (
    <div className="space-y-4 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Candidate InMail & Chat</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Direct Messaging
            </span>
          </div>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">
            Real-time candidate correspondence, interview coordination, and inquiries.
          </p>
        </div>
        <button
          onClick={() => setIsNewChatModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Start New Conversation
        </button>
      </div>

      {/* Main Chat Layout */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[calc(100vh-220px)] min-h-[560px]">
        {/* Left Sidebar: Conversations list */}
        <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col h-full bg-gray-50/50">
          {/* Search Bar */}
          <div className="p-3.5 border-b border-gray-200 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 absolute inset-y-0 left-3 my-auto text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="absolute right-3 top-2.5 text-[11px] text-gray-400 pointer-events-none">
                  Search chats
                </span>
              )}
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {isLoadingConversations ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-700">No active discussions</p>
                <p className="text-[11px] text-gray-400 mt-1">Click "Start New Conversation" to reach out to any candidate.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConversationId;
                const isUnread = conv.lastMessage && !conv.lastMessage.read && conv.lastMessage.senderId !== currentUserId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                      isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-gray-100/70 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-xs">
                      {getInitials(conv.participant.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-gray-900 text-xs truncate">
                          {conv.participant.name}
                        </span>
                        {conv.lastMessage && (
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {formatMessageTime(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {conv.lastMessage ? conv.lastMessage.content : 'No messages yet'}
                      </p>
                    </div>
                    {isUnread && (
                      <span className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0 mt-1.5 ring-2 ring-white"></span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Main Area: Chat Window */}
        <div className="flex-1 flex flex-col h-full bg-white">
          {activeConversationId && currentParticipant ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                    {getInitials(currentParticipant.name)}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">
                      {currentParticipant.name}
                    </h2>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span>{currentParticipant.email}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {currentParticipant.candidateProfile?.location || 'Candidate'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Contact Buttons */}
                <div className="flex items-center gap-2">
                  {currentParticipant.candidateProfile?.phone && (
                    <a
                      href={`tel:${currentParticipant.candidateProfile.phone}`}
                      className="p-2 border border-gray-200 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                      title={`Call ${currentParticipant.candidateProfile.phone}`}
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>
                  )}
                  {currentParticipant.email && (
                    <a
                      href={`mailto:${currentParticipant.email}`}
                      className="p-2 border border-gray-200 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title={`Email ${currentParticipant.email}`}
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/40">
                {isLoadingMessages ? (
                  <div className="py-12 text-center text-xs text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading messages...
                  </div>
                ) : activeConversation?.messages?.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 text-xs">
                    <p className="font-semibold text-gray-600">No messages in this discussion yet.</p>
                    <p className="mt-1 text-gray-400">Send a greeting or use one of the quick templates below.</p>
                  </div>
                ) : (
                  activeConversation?.messages?.map((msg: Message) => {
                    const isMine = msg.senderId === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isMine
                              ? 'bg-blue-600 text-white rounded-br-xs'
                              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-xs'
                          }`}
                        >
                          <p>{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 px-1">
                          <span>{formatMessageTime(msg.createdAt)}</span>
                          {isMine && (
                            msg.read ? (
                              <CheckCheck className="w-3 h-3 text-blue-600" />
                            ) : (
                              <Check className="w-3 h-3 text-gray-400" />
                            )
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Templates Bar */}
              <div className="px-3 py-2 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1 flex-shrink-0">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Quick Reply:
                </span>
                {QUICK_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setMessageInput(tmpl.text)}
                    className="px-2.5 py-1 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-600 whitespace-nowrap transition-colors"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Direct Candidate Messaging</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Select an existing conversation from the list or start a new chat with an applicant.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Start New Candidate Message</h3>
                <p className="text-xs text-gray-500 mt-0.5">Reach out directly to an applicant from your pool.</p>
              </div>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartChatSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select Candidate *
                </label>
                <select
                  value={selectedCandidateUserId}
                  onChange={(e) => setSelectedCandidateUserId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Choose Candidate --</option>
                  {candidates.map((c: any) => (
                    <option key={c.id} value={c.userId}>
                      {c.name} ({c.role} • {c.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Initial Message (Optional)
                </label>
                <textarea
                  rows={3}
                  value={initialChatMessage}
                  onChange={(e) => setInitialChatMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewChatModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedCandidateUserId || startConversationMutation.isPending}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-md"
                >
                  {startConversationMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Start Discussion</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
