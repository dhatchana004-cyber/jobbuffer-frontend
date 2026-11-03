import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  ChevronDown,
  Trash2,
  RotateCw,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Send,
  Laptop,
  Smartphone,
  Info,
  Building,
  Check,
  Search,
  FileText
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import api from '../../services/api';

interface EmailTemplate {
  code: string;
  name: string;
  subject: string;
  body: string;
  language: string;
  category: 'AUTOMATION' | 'ANNOUNCEMENT';
  replyTo?: string;
  customReplyTo: boolean;
  variables: string[];
  updatedAt: string;
}

interface DeliveryLog {
  id: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  bodySnippet?: string;
  templateCode?: string;
  status: 'DELIVERED' | 'SENT' | 'FAILED';
  channel: 'EMAIL' | 'IN_APP' | 'BOTH';
  error?: string;
  sentAt: string;
}

const AVAILABLE_VARIABLES = [
  { tag: '{candidate_name}', desc: 'Full Name of the Candidate' },
  { tag: '{job_title}', desc: 'Position / Job Requisition Title' },
  { tag: '{company_name}', desc: 'Your Company / Employer Brand' },
  { tag: '{interview_url}', desc: 'Google Meet / Meeting Room Link' },
  { tag: '{interview_date}', desc: 'Scheduled Date (e.g. Oct 28, 2026)' },
  { tag: '{interview_time}', desc: 'Scheduled Time (e.g. 10:30 AM)' },
  { tag: '{user_first_name}', desc: 'Your Recruiter First Name' },
  { tag: '{user_last_name}', desc: 'Your Recruiter Last Name' },
  { tag: '{action_url}', desc: 'Application Review / Action Link' }
];

export default function RecruiterEmailTemplates() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'TEMPLATES' | 'LOGS'>('TEMPLATES');

  // Form State
  const [selectedTemplateCode, setSelectedTemplateCode] = useState<string>('INTERVIEW_REMINDER');
  const [templateName, setTemplateName] = useState<string>('Reminder');
  const [language, setLanguage] = useState<string>('English (English)');
  const [customReplyTo, setCustomReplyTo] = useState<boolean>(false);
  const [replyToAddress, setReplyToAddress] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [isVariableDropdownOpen, setIsVariableDropdownOpen] = useState(false);
  const [activeInputFocus, setActiveInputFocus] = useState<'subject' | 'body'>('body');

  // Modals & Status
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isTestEmailModalOpen, setIsTestEmailModalOpen] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [testSendStatus, setTestSendStatus] = useState<{ loading: boolean; msg: string; error?: boolean }>({
    loading: false,
    msg: ''
  });

  const subjectInputRef = useRef<HTMLInputElement>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch Templates (Scoped specifically to logged in Recruiter's Company)
  const { data: rawData, isLoading: templatesLoading } = useQuery({
    queryKey: ['recruiterEmailTemplates'],
    queryFn: async () => {
      const res = await api.get('/recruiter/email-templates');
      return res.data;
    }
  });

  const allTemplates: EmailTemplate[] = Array.isArray(rawData) ? rawData : (rawData?.templates || []);
  const companyInfo = !Array.isArray(rawData) ? rawData?.company : null;

  // Filter for recruiter relevant candidate templates
  const recruiterTemplates = allTemplates.filter(
    (t) => t.code !== 'REGISTRATION_OTP' && t.code !== 'ANNOUNCEMENT'
  );
  const displayTemplates = recruiterTemplates.length > 0 ? recruiterTemplates : allTemplates;

  // Sync selected template form
  useEffect(() => {
    if (displayTemplates.length > 0) {
      const current = displayTemplates.find((t) => t.code === selectedTemplateCode) || displayTemplates[0];
      if (current) {
        setSelectedTemplateCode(current.code);
        setTemplateName(current.name);
        setLanguage(current.language || 'English (English)');
        setCustomReplyTo(Boolean(current.customReplyTo));
        setReplyToAddress(current.replyTo || '');
        setSubject(current.subject || '');
        setBody(current.body || '');
      }
    }
  }, [displayTemplates, selectedTemplateCode]);

  // Update Template Mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async (payload: { code: string; data: Partial<EmailTemplate> }) => {
      const res = await api.put(`/recruiter/email-templates/${payload.code}`, payload.data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterEmailTemplates'] });
      setSaveSuccessMsg('Template saved successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    }
  });

  const handleSaveTemplate = () => {
    updateTemplateMutation.mutate({
      code: selectedTemplateCode,
      data: {
        name: templateName,
        language,
        customReplyTo,
        replyTo: customReplyTo ? replyToAddress : '',
        subject,
        body
      }
    });
  };

  const handleInsertVariable = (tag: string) => {
    if (activeInputFocus === 'subject') {
      const el = subjectInputRef.current;
      if (el) {
        const start = el.selectionStart || 0;
        const end = el.selectionEnd || 0;
        const newSub = subject.substring(0, start) + ' ' + tag + ' ' + subject.substring(end);
        setSubject(newSub);
      } else {
        setSubject((prev) => prev + ' ' + tag);
      }
    } else {
      const el = bodyTextareaRef.current;
      if (el) {
        const start = el.selectionStart || 0;
        const end = el.selectionEnd || 0;
        const newBody = body.substring(0, start) + tag + body.substring(end);
        setBody(newBody);
      } else {
        setBody((prev) => prev + ' ' + tag);
      }
    }
    setIsVariableDropdownOpen(false);
  };

  // Test Email Send
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailInput.trim()) return;
    setTestSendStatus({ loading: true, msg: 'Dispatching test email to your inbox...' });
    try {
      const res = await api.post('/recruiter/email-templates/test-send', {
        code: selectedTemplateCode,
        targetEmail: testEmailInput.trim(),
        customSubject: subject,
        customBody: body,
        customReplyTo: customReplyTo ? replyToAddress : undefined
      });
      setTestSendStatus({
        loading: false,
        msg: res.data.message || 'Test email dispatched!',
        error: !res.data.success
      });
      queryClient.invalidateQueries({ queryKey: ['recruiterDeliveryLogs'] });
      setTimeout(() => {
        setIsTestEmailModalOpen(false);
        setTestSendStatus({ loading: false, msg: '' });
      }, 2500);
    } catch (err: any) {
      setTestSendStatus({
        loading: false,
        msg: err.response?.data?.message || 'SMTP delivery failed',
        error: true
      });
    }
  };

  // Preview Render
  const getRenderedPreview = () => {
    const sampleData: Record<string, string> = {
      '{candidate_name}': 'Alex Mercer',
      '{job_title}': 'Senior Full Stack Engineer',
      '{company_name}': 'Your Company Ltd',
      '{interview_url}': 'https://meet.google.com/jobuffer-demo',
      '{interview_date}': new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      '{interview_time}': '10:30 AM IST',
      '{user_first_name}': 'Sarah',
      '{user_last_name}': 'Recruiter',
      '{action_url}': `${import.meta.env.VITE_FRONTEND_URL || 'https://jobuffer.com'}/login`
    };

    let pSub = subject;
    let pBody = body;
    for (const [tag, val] of Object.entries(sampleData)) {
      pSub = pSub.split(tag).join(val);
      pBody = pBody.split(tag).join(val);
    }
    return { subject: pSub, body: pBody };
  };

  // Delivery Logs
  const [logSearch, setLogSearch] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState('ALL');

  const { data: deliveryLogs = [], isLoading: logsLoading, refetch: refetchLogs } = useQuery<DeliveryLog[]>({
    queryKey: ['recruiterDeliveryLogs', logStatusFilter],
    queryFn: async () => {
      const res = await api.get(`/recruiter/email-delivery-logs?status=${logStatusFilter}`);
      return res.data;
    }
  });

  const filteredLogs = deliveryLogs.filter((log) => {
    if (!logSearch) return true;
    const s = logSearch.toLowerCase();
    return (
      log.recipientEmail.toLowerCase().includes(s) ||
      (log.recipientName && log.recipientName.toLowerCase().includes(s)) ||
      log.subject.toLowerCase().includes(s) ||
      (log.templateCode && log.templateCode.toLowerCase().includes(s))
    );
  });

  const totalLogs = deliveryLogs.length;
  const deliveredCount = deliveryLogs.filter((l) => l.status === 'DELIVERED').length;

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-300" />
                {companyInfo?.name ? `${companyInfo.name} Custom Templates` : 'Employer Brand Studio'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Company Isolation Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Recruiter Email Templates & Candidate Outreach
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
              Every company can define their own distinct templates for interview invitations, application receipts, shortlisting, rejections, and job offers. Your candidates will receive your company's customized messages and custom reply-to inbox.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('TEMPLATES')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-sm flex items-center gap-2 ${
                activeTab === 'TEMPLATES' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Templates
            </button>
            <button
              onClick={() => setActiveTab('LOGS')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-sm flex items-center gap-2 ${
                activeTab === 'LOGS' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <FileText className="w-4 h-4" />
              Delivery Logs ({totalLogs})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Candidate Templates" value={displayTemplates.length} icon={Mail} color="blue" />
        <StatCard title="Emails Delivered" value={deliveredCount} icon={CheckCircle2} color="green" />
        <StatCard title="Active Hiring Triggers" value="5 Stages" icon={Calendar} color="purple" />
      </div>

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Sub-Header Tabs */}
        <div className="border-b border-gray-200 bg-gray-50/70 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('TEMPLATES')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'TEMPLATES' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Mail className="w-4 h-4" />
              Templates Email / SMS
            </button>
            <button
              onClick={() => setActiveTab('LOGS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'LOGS' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              Delivery Logs & History
            </button>
          </div>

          {activeTab === 'LOGS' && (
            <button
              onClick={() => refetchLogs()}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg transition"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Refresh Logs
            </button>
          )}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: TEMPLATE EDITOR                                   */}
        {/* ======================================================== */}
        {activeTab === 'TEMPLATES' && (
          <div className="flex flex-col lg:flex-row min-h-[640px]">
            {/* Sidebar Submenu */}
            <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-200 p-5 bg-gray-50/50 space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2.5">
                  Recruitment Triggers
                </span>
                <div className="space-y-1">
                  {templatesLoading ? (
                    <div className="py-4 text-center text-xs text-gray-400">Loading templates...</div>
                  ) : (
                    displayTemplates.map((tpl) => (
                      <button
                        key={tpl.code}
                        onClick={() => setSelectedTemplateCode(tpl.code)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                          selectedTemplateCode === tpl.code
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-gray-700 hover:bg-gray-200/60'
                        }`}
                      >
                        <span className="truncate">{tpl.name}</span>
                        {selectedTemplateCode === tpl.code && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2 text-gray-600 font-medium">
                  <Info className="w-3.5 h-3.5 text-blue-500" />
                  <span>Applicant Personalization</span>
                </div>
                <p className="text-[11px] leading-relaxed text-gray-400">
                  Whenever an applicant moves through your pipeline (e.g. Shortlisted or Interview), this customized copy will be automatically delivered.
                </p>
              </div>
            </div>

            {/* Main Template Editor */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
              <div className="space-y-6 max-w-4xl">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Email template</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Customizable email for applicants & candidates</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-semibold text-gray-500">Auto-pipeline synced</span>
                  </div>
                </div>

                {/* Template Name & Language */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                      Language
                      <span className="text-gray-400 font-normal cursor-help" title="Configures communication locale">ⓘ</span>
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      <option value="English (English)">English (English)</option>
                      <option value="Tamil (தமிழ்)">Tamil (தமிழ்)</option>
                      <option value="Sinhala (සිංහල)">Sinhala (සිංහල)</option>
                    </select>
                  </div>
                </div>

                {/* Custom Reply-To Toggle */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                      Custom Reply-To address
                      <span className="text-gray-400 font-normal cursor-help" title="Replies from candidates will be routed directly to this address">ⓘ</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setCustomReplyTo(!customReplyTo)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        customReplyTo ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          customReplyTo ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-semibold text-gray-500">
                      {customReplyTo ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  {customReplyTo && (
                    <input
                      type="email"
                      placeholder="e.g. careers@yourcompany.com"
                      value={replyToAddress}
                      onChange={(e) => setReplyToAddress(e.target.value)}
                      className="w-full max-w-md px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-mono text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  )}
                </div>

                {/* Rich Editor Canvas */}
                <div className="border border-gray-300 rounded-2xl overflow-hidden shadow-xs bg-white">
                  {/* Toolbar */}
                  <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-1 text-gray-600">
                      <button
                        type="button"
                        onClick={() => handleInsertVariable('**bold**')}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition"
                        title="Bold"
                      >
                        <Bold className="w-4 h-4 font-bold" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertVariable('*italic*')}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition"
                        title="Italic"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertVariable('{interview_url}')}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition"
                        title="Insert Meeting Link"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>
                      <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
                      <button
                        type="button"
                        onClick={() => handleInsertVariable('\n- ')}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition"
                        title="Bullet List"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertVariable('\n1. ')}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition"
                        title="Numbered List"
                      >
                        <ListOrdered className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Insert Variable Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsVariableDropdownOpen(!isVariableDropdownOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 hover:border-blue-500 rounded-xl text-xs font-semibold text-gray-700 shadow-xs transition"
                      >
                        <span className="text-blue-600 font-bold">+</span>
                        Insert Variable
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      </button>

                      {isVariableDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in">
                          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                            Candidate Replacement Tag
                          </div>
                          <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                            {AVAILABLE_VARIABLES.map((v) => (
                              <button
                                key={v.tag}
                                type="button"
                                onClick={() => handleInsertVariable(v.tag)}
                                className="w-full text-left px-3 py-2 hover:bg-blue-50 text-xs transition flex flex-col gap-0.5"
                              >
                                <span className="font-mono font-bold text-blue-700 text-xs">{v.tag}</span>
                                <span className="text-[11px] text-gray-500">{v.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SUBJECT */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                      SUBJECT
                    </span>
                    <input
                      ref={subjectInputRef}
                      type="text"
                      required
                      value={subject}
                      onFocus={() => setActiveInputFocus('subject')}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Reminder: Job interview for {job_title} at {company_name}"
                      className="w-full py-1 text-sm font-semibold text-gray-900 border-none outline-none focus:ring-0 placeholder:text-gray-400"
                    />

                    {/* Quick Variable Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      <span className="text-[10px] text-gray-400">Quick insert:</span>
                      {['{job_title}', '{company_name}', '{candidate_name}'].map((pill) => (
                        <button
                          key={pill}
                          type="button"
                          onClick={() => {
                            setActiveInputFocus('subject');
                            setSubject((prev) => prev + ' ' + pill);
                          }}
                          className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-[11px] font-mono font-medium transition"
                        >
                          {pill}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BODY */}
                  <div className="p-4 bg-white">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                      BODY
                    </span>
                    <textarea
                      ref={bodyTextareaRef}
                      rows={12}
                      required
                      value={body}
                      onFocus={() => setActiveInputFocus('body')}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Hi {candidate_name}, how is everything going?..."
                      className="w-full text-sm text-gray-800 leading-relaxed border-none outline-none focus:ring-0 resize-y font-normal"
                    ></textarea>

                    <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-gray-100 text-[11px] text-gray-400">
                      <span>Tokens active in template:</span>
                      {AVAILABLE_VARIABLES.filter((v) => body.includes(v.tag) || subject.includes(v.tag)).map((v) => (
                        <span
                          key={v.tag}
                          className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-mono text-[10px] font-bold"
                        >
                          {v.tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{updateTemplateMutation.isPending ? 'Saving...' : 'Saved'}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsTestEmailModalOpen(true)}
                    className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Test Email
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="px-4 py-2 border border-gray-300 hover:border-blue-600 hover:text-blue-600 text-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Email preview
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    disabled={updateTemplateMutation.isPending}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md disabled:opacity-50"
                  >
                    {updateTemplateMutation.isPending ? 'Saving...' : 'Save Template'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: DELIVERY LOGS                                     */}
        {/* ======================================================== */}
        {activeTab === 'LOGS' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/70 p-4 rounded-xl border border-gray-200">
              <div className="relative max-w-md w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search applicant email, candidate name, or subject..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                {['ALL', 'DELIVERED', 'SENT', 'FAILED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setLogStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      logStatusFilter === st
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
              <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Trigger & Subject</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Sent Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {logsLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-400">
                        Loading applicant email history...
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-400">
                        No candidate delivery logs found.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-gray-900">
                          <div>{log.recipientName || 'Candidate'}</div>
                          <div className="text-[11px] text-gray-400 font-mono">{log.recipientEmail}</div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-gray-800 truncate">{log.subject}</div>
                          {log.templateCode && (
                            <span className="inline-block mt-0.5 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-mono rounded">
                              {log.templateCode}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[10px] rounded">
                            {log.channel}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {log.status === 'DELIVERED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Delivered
                            </span>
                          ) : log.status === 'FAILED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800" title={log.error}>
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              Failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                              Sent
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                          {new Date(log.sentAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 relative flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">Rendered Email Preview</h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded-lg transition ${
                      previewDevice === 'desktop' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-500'
                    }`}
                    title="Desktop Preview"
                  >
                    <Laptop className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded-lg transition ${
                      previewDevice === 'mobile' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-500'
                    }`}
                    title="Mobile Preview"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 bg-slate-100 rounded-2xl my-4 p-4 flex justify-center">
              <div
                className={`bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden transition-all ${
                  previewDevice === 'mobile' ? 'w-[360px]' : 'w-full max-w-[540px]'
                }`}
              >
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between border-b-2 border-blue-500">
                  <div>
                    <h1 className="text-lg font-black tracking-wide">JoBuffer</h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Applicant Notification</p>
                  </div>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-semibold">
                    Verified
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  <div className="pb-3 border-b border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">SUBJECT:</span>
                    <h2 className="text-sm font-bold text-gray-900 mt-0.5">
                      {getRenderedPreview().subject}
                    </h2>
                  </div>

                  <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {getRenderedPreview().body}
                  </div>

                  <div className="pt-3 text-center">
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
                    >
                      Open Candidate Portal
                    </a>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 text-center border-t border-slate-100 text-[10px] text-slate-400">
                  <p>&copy; {new Date().getFullYear()} JoBuffer Careers. All rights reserved.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {isTestEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setIsTestEmailModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Send Test Email</h3>
                <p className="text-xs text-gray-500">Dispatch live test to your email address</p>
              </div>
            </div>

            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Destination Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. yourname@domain.com"
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {testSendStatus.msg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    testSendStatus.error
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {testSendStatus.error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{testSendStatus.msg}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTestEmailModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={testSendStatus.loading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                >
                  {testSendStatus.loading ? 'Sending...' : 'Send Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
