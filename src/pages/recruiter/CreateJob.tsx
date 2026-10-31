import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Sparkles, 
  Briefcase, 
  MapPin, 
  Globe, 
  Building2, 
  DollarSign, 
  Clock, 
  Plus, 
  X, 
  CheckCircle2, 
  Check,
  Eye, 
  AlertCircle,
  Flame,
  Award,
  Layers,
  Upload,
  Trash2,
  ShieldCheck
} from 'lucide-react';
import api from '../../services/api';

const CATEGORIES = [
  'Engineering & Technology',
  'Product & Design',
  'Sales & Business Development',
  'Marketing & Content',
  'Human Resources & Recruitment',
  'Finance & Accounting',
  'Operations & Logistics',
  'Customer Support',
  'Data Science & Analytics',
  'Other'
];

const JOB_TYPES = [
  { id: 'Full-time', label: 'Full-time', desc: 'Permanent 40h/week' },
  { id: 'Part-time', label: 'Part-time', desc: 'Flexible 20h/week' },
  { id: 'Contract', label: 'Contract', desc: 'Project-based / Freelance' },
  { id: 'Internship', label: 'Internship', desc: 'Graduate / Trainee' },
];

const WORK_MODES = [
  { id: 'On-site', label: 'On-site', icon: Building2, desc: 'Work from office' },
  { id: 'Hybrid', label: 'Hybrid', icon: Layers, desc: 'Mix of office & home' },
  { id: 'Remote', label: 'Remote', icon: Globe, desc: 'Work from anywhere' },
];

const POPULAR_SKILLS = [
  'React', 'Node.js', 'Python', 'TypeScript', 'JavaScript', 
  'Java', 'SQL', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 
  'Figma', 'UI/UX', 'TailwindCSS', 'Next.js', 'Express', 'Git'
];

const POPULAR_BENEFITS = [
  'Health Insurance',
  'Flexible Working Hours',
  'Work From Home Options',
  'Annual Performance Bonus',
  'Paid Leave / Sick Leave',
  'Employee Stock Options (ESOPs)',
  'Learning & Training Budget',
  'Free Food & Cafeteria',
  'Provident Fund (PF)'
];

const ROLE_TEMPLATES: Record<string, {
  title: string;
  category: string;
  workMode: string;
  jobType: string;
  description: string;
  responsibilities: string;
  requirements: string;
  skills: string[];
}> = {
  'Full Stack Developer': {
    title: 'Senior Full Stack Developer',
    category: 'Engineering & Technology',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    description: 'We are seeking an experienced Full Stack Developer to build, scale, and maintain modern web applications. You will collaborate closely with product and design teams to deliver seamless user experiences and robust backend APIs.',
    responsibilities: '• Architect and implement resilient REST and GraphQL APIs using Node.js and TypeScript.\n• Build high-performance, responsive web interfaces with React and TailwindCSS.\n• Manage PostgreSQL and Redis databases with optimized queries.\n• Participate in code reviews, CI/CD pipelines, and automated testing.',
    requirements: '• 3+ years of professional full stack web development experience.\n• Proficiency in React, Node.js, TypeScript, and modern relational databases.\n• Experience with cloud deployments (AWS, GCP, or Docker).\n• Strong problem-solving aptitude and teamwork skills.',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker']
  },
  'Python Developer': {
    title: 'Python Backend Engineer',
    category: 'Engineering & Technology',
    workMode: 'Remote',
    jobType: 'Full-time',
    description: 'Looking for a skilled Python Backend Engineer to develop scalable backend services, asynchronous workers, and data pipelines for our core platform.',
    responsibilities: '• Design and develop high-throughput microservices using Python (FastAPI / Django / Flask).\n• Integrate with third-party APIs and relational databases.\n• Optimize application performance, caching, and database queries.\n• Implement security best practices and automated test suites.',
    requirements: '• 2+ years of backend development experience with Python.\n• Strong database knowledge (SQL, schema design, index optimization).\n• Familiarity with message brokers (RabbitMQ, Kafka, or Redis).\n• Clear written and verbal communication.',
    skills: ['Python', 'SQL', 'PostgreSQL', 'Docker', 'Git', 'AWS']
  },
  'UI/UX Designer': {
    title: 'Lead UI/UX Product Designer',
    category: 'Product & Design',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    description: 'We are hiring a creative and user-focused UI/UX Designer to transform complex workflows into intuitive, beautiful web and mobile product experiences.',
    responsibilities: '• Create wireframes, user flows, and interactive high-fidelity prototypes in Figma.\n• Conduct user research, usability testing, and translate feedback into design improvements.\n• Build and maintain a scalable design system with reusable components.\n• Collaborate seamlessly with frontend engineers during feature rollouts.',
    requirements: '• 2+ years of UI/UX design experience with a strong portfolio.\n• Mastery of Figma, auto-layout, design tokens, and prototyping.\n• Deep empathy for user needs and typography/visual design craft.\n• Ability to communicate design decisions with clarity.',
    skills: ['Figma', 'UI/UX', 'Prototyping', 'User Research', 'Design Systems']
  },
  'HR / Recruiter': {
    title: 'Technical Talent Acquisition Specialist',
    category: 'Human Resources & Recruitment',
    workMode: 'On-site',
    jobType: 'Full-time',
    description: 'Join our team as a Talent Acquisition Specialist to drive our hiring strategy, source top talent, and deliver an outstanding candidate experience.',
    responsibilities: '• Source, screen, and interview candidates for technical and operational roles.\n• Manage job postings across channels and review inbound applicants.\n• Partner with hiring managers to define hiring criteria and timelines.\n• Coordinate direct interviews and negotiate competitive offers.',
    requirements: '• 2+ years of full-cycle recruiting experience.\n• Excellent interpersonal, communication, and candidate negotiation skills.\n• Familiarity with ATS tools, LinkedIn Recruiter, and sourcing techniques.\n• Highly organized with strong follow-up habits.',
    skills: ['Sourcing', 'Screening', 'Talent Acquisition', 'Interviewing']
  }
};

export default function CreateJob() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch recruiter company details for preview
  const { data: companyProfile } = useQuery({
    queryKey: ['recruiterCompanyProfile'],
    queryFn: async () => {
      try {
        const res = await api.get('/recruiter/company');
        return res.data;
      } catch (e) {
        return null;
      }
    }
  });

  // Hiring Organization & Profile State
  const [postingCompanyName, setPostingCompanyName] = useState('');
  const [postingCompanyLogo, setPostingCompanyLogo] = useState('');
  const [postingCompanyWebsite, setPostingCompanyWebsite] = useState('');
  const [isLogoInvalid, setIsLogoInvalid] = useState(false);
  const [logoInputMode, setLogoInputMode] = useState<'upload' | 'url'>('upload');

  // Sync initial values from loaded company profile
  useEffect(() => {
    if (companyProfile) {
      if (companyProfile.name && !postingCompanyName) {
        setPostingCompanyName(companyProfile.name);
      }
      if (companyProfile.logo && !postingCompanyLogo) {
        setPostingCompanyLogo(companyProfile.logo);
      }
      if (companyProfile.website && !postingCompanyWebsite) {
        setPostingCompanyWebsite(companyProfile.website);
      }
    }
  }, [companyProfile]);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Logo file size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPostingCompanyLogo(reader.result);
        setIsLogoInvalid(false);
        setErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  // Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [jobType, setJobType] = useState('Full-time');
  const [workMode, setWorkMode] = useState('Hybrid');
  const [location, setLocation] = useState('Chennai, India');
  const [isRemoteEverywhere, setIsRemoteEverywhere] = useState(false);

  // Description & Requirements
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');

  // Skills
  const [skills, setSkills] = useState<string[]>(['React', 'Node.js']);
  const [skillInput, setSkillInput] = useState('');

  // Experience & Compensation
  const [experienceMin, setExperienceMin] = useState('1');
  const [experienceMax, setExperienceMax] = useState('3');
  const [salaryCurrency, setSalaryCurrency] = useState('INR');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([
    'Health Insurance', 'Work From Home Options', 'Paid Leave / Sick Leave'
  ]);

  // Settings
  const [openings, setOpenings] = useState('1');
  const [deadline, setDeadline] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Skill tag add/remove
  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleKeyDownSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill(skillInput);
    }
  };

  // Toggle benefit
  const toggleBenefit = (benefit: string) => {
    if (selectedBenefits.includes(benefit)) {
      setSelectedBenefits(selectedBenefits.filter(b => b !== benefit));
    } else {
      setSelectedBenefits([...selectedBenefits, benefit]);
    }
  };

  // Apply Quick Template
  const applyTemplate = (templateKey: string) => {
    const tpl = ROLE_TEMPLATES[templateKey];
    if (!tpl) return;
    setTitle(tpl.title);
    setCategory(tpl.category);
    setWorkMode(tpl.workMode);
    setJobType(tpl.jobType);
    setDescription(tpl.description);
    setResponsibilities(tpl.responsibilities);
    setRequirements(tpl.requirements);
    setSkills(tpl.skills);
    setErrorMsg('');
  };

  // Submit Handler
  const handleSaveJob = async (status: 'PUBLISHED' | 'DRAFT' = 'PUBLISHED') => {
    const isDraft = status === 'DRAFT';

    if (!isDraft) {
      if (!title.trim()) {
        setErrorMsg('Please enter a Job Title');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!location.trim() && !isRemoteEverywhere) {
        setErrorMsg('Please specify job location');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!description.trim() || description.length < 20) {
        setErrorMsg('Please provide a job description (at least 20 characters)');
        return;
      }
    } else {
      if (!title.trim()) {
        setErrorMsg('Please enter at least a Job Title to save as draft');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const finalLocation = isRemoteEverywhere 
        ? 'Remote (Anywhere)' 
        : (location.trim() || 'Remote');

      const finalCompanyName = postingCompanyName.trim() || companyProfile?.name || 'Your Company';

      const payload = {
        title: title.trim() || 'Untitled Job Draft',
        category: category || 'Engineering & Technology',
        jobType: jobType || 'Full-time',
        workMode: workMode || 'On-site',
        location: finalLocation,
        companyName: finalCompanyName,
        companyLogo: postingCompanyLogo.trim() || null,
        companyWebsite: postingCompanyWebsite.trim() || null,
        description: description.trim() || (isDraft ? 'Draft job description pending completion.' : 'Job details to be discussed.'),
        responsibilities: responsibilities.trim() || description.trim() || 'Responsibilities to be discussed',
        requirements: requirements.trim() || 'Requirements to be discussed',
        skills: skills && skills.length > 0 ? skills : [],
        experienceMin: experienceMin && !isNaN(Number(experienceMin)) ? Number(experienceMin) : null,
        experienceMax: experienceMax && !isNaN(Number(experienceMax)) ? Number(experienceMax) : null,
        salaryMin: salaryMin && !isNaN(Number(salaryMin)) ? Number(salaryMin) : null,
        salaryMax: salaryMax && !isNaN(Number(salaryMax)) ? Number(salaryMax) : null,
        salaryCurrency: salaryCurrency || 'INR',
        benefits: selectedBenefits || [],
        openings: openings && !isNaN(Number(openings)) ? Math.max(1, Number(openings)) : 1,
        deadline: deadline || null,
        isUrgent: isUrgent,
        status: isDraft ? 'DRAFT' : 'PUBLISHED'
      };

      await api.post('/recruiter/jobs', payload);

      await queryClient.invalidateQueries({ queryKey: ['recruiterJobs'] });
      await queryClient.invalidateQueries({ queryKey: ['recruiterDashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['recruiterCompanyProfile'] });
      navigate('/recruiter/jobs');
    } catch (err: any) {
      console.error('Job submission failed:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save job. Please check all fields and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayCompanyName = postingCompanyName.trim() || companyProfile?.name || 'Your Company';
  const displayLogo = !isLogoInvalid && postingCompanyLogo ? postingCompanyLogo : '';

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <button 
            type="button"
            onClick={() => navigate('/recruiter/jobs')}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Back to Jobs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Post a New Job</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                Opening Setup
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Create an appealing opening to attract qualified talent across our network.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            Live Preview
          </button>

          <button 
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSaveJob('DRAFT')}
            className="py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            Save as Draft
          </button>

          <button 
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSaveJob('PUBLISHED')}
            className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSubmitting ? 'Publishing...' : 'Publish Job Opening'}
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm shadow-2xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Quick Template Autofill Chips */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/60 to-white border border-blue-200/70 rounded-2xl p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Quick Role Templates (1-Click Fill)
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Click any role to prefill description, responsibilities & skills
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {Object.keys(ROLE_TEMPLATES).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => applyTemplate(key)}
              className="py-1.5 px-3 bg-white hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200 hover:border-blue-600 rounded-xl text-xs font-medium transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Main Form + Live Preview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form Area (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Section 1: Hiring Company & Posting Profile */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Hiring Company & Posting Profile</h3>
                  <p className="text-slate-500 text-xs">Customize the organization name, brand logo, and career site candidates see.</p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Live Brand Profile
              </span>
            </div>

            <div className="space-y-4">
              {/* Company Name & Website in 2-col grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Hiring Company / Entity Name *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={postingCompanyName}
                      onChange={(e) => setPostingCompanyName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Official Website / Career Page (Optional)
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={postingCompanyWebsite}
                      onChange={(e) => setPostingCompanyWebsite(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Company Logo Setting */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-800">
                      Company Brand Logo
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload an image file or paste a logo image URL to display on candidate discovery feeds.
                    </p>
                  </div>
                  {/* Mode switcher */}
                  <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg text-xs self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setLogoInputMode('upload')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                        logoInputMode === 'upload' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoInputMode('url')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                        logoInputMode === 'url' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Avatar / Logo Box */}
                  <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center flex-shrink-0 shadow-2xs overflow-hidden">
                    {displayLogo ? (
                      <img
                        src={displayLogo}
                        alt="Logo Preview"
                        className="w-full h-full object-contain rounded-lg"
                        onError={() => setIsLogoInvalid(true)}
                      />
                    ) : (
                      <div className="w-full h-full rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-base">
                        {(displayCompanyName || 'CO').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {logoInputMode === 'upload' ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold cursor-pointer shadow-2xs transition">
                          <Upload className="w-3.5 h-3.5 text-blue-600" />
                          <span>Choose Logo Image...</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileUpload}
                            className="hidden"
                          />
                        </label>
                        {postingCompanyLogo && (
                          <button
                            type="button"
                            onClick={() => {
                              setPostingCompanyLogo('');
                              setIsLogoInvalid(false);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                        <span className="text-[11px] text-slate-400 block w-full sm:w-auto">PNG, JPG, SVG or WebP up to 2MB</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={postingCompanyLogo}
                          onChange={(e) => {
                            setPostingCompanyLogo(e.target.value);
                            setIsLogoInvalid(false);
                          }}
                          className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                        {postingCompanyLogo && (
                          <button
                            type="button"
                            onClick={() => {
                              setPostingCompanyLogo('');
                              setIsLogoInvalid(false);
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                            title="Clear URL"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Basic Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Basic Role Information</h3>
                <p className="text-slate-500 text-xs">Define the title, category, and work location.</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Job Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              {/* Category & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Category / Department *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Job Type Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Employment Type *
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  >
                    {JOB_TYPES.map((jt) => (
                      <option key={jt.id} value={jt.id}>{jt.label} ({jt.desc})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Work Mode Visual Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Work Mode Setting *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {WORK_MODES.map((wm) => {
                    const Icon = wm.icon;
                    const isSelected = workMode === wm.id;
                    return (
                      <button
                        key={wm.id}
                        type="button"
                        onClick={() => setWorkMode(wm.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected 
                            ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-100 text-blue-900 shadow-2xs' 
                            : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <div className="mt-2">
                          <span className="font-bold text-xs block">{wm.label}</span>
                          <span className="text-[10px] text-slate-500">{wm.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Office / Work City Location *
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-blue-600 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRemoteEverywhere}
                      onChange={(e) => setIsRemoteEverywhere(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Remote Anywhere
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    disabled={isRemoteEverywhere}
                    value={isRemoteEverywhere ? 'Remote (Anywhere in India / Global)' : location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Detailed Description & Responsibilities */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Role Overview & Responsibilities</h3>
                <p className="text-slate-500 text-xs">Describe the role, day-to-day duties, and ideal fit.</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Role Summary */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Job Description / Role Summary *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all leading-relaxed"
                />
              </div>

              {/* Responsibilities */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Key Responsibilities
                </label>
                <textarea
                  rows={4}
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all leading-relaxed"
                />
              </div>

              {/* Candidate Requirements */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Candidate Requirements & Qualifications
                </label>
                <textarea
                  rows={4}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Required Skills & Experience Level */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Key Skills & Experience</h3>
                <p className="text-slate-500 text-xs">Add skills to help matching candidates find your posting.</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Interactive Skills Tags */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Required Skills & Technologies (Type & press Enter)
                </label>
                
                {/* Active Skill Pills */}
                <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-[50px] focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  {skills.map((sk) => (
                    <span 
                      key={sk} 
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-2xs animate-in zoom-in-95 duration-150"
                    >
                      {sk}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(sk)}
                        className="hover:bg-blue-700 p-0.5 rounded-full text-white/80 hover:text-white cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleKeyDownSkill}
                    className="flex-1 min-w-[140px] bg-transparent outline-none text-xs text-slate-900 font-medium py-1 px-1"
                  />
                  
                  {skillInput.trim() && (
                    <button
                      type="button"
                      onClick={() => handleAddSkill(skillInput)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  )}
                </div>

                {/* Popular Skill Suggestions */}
                <div className="mt-2.5">
                  <span className="text-[11px] font-medium text-slate-400 mr-2">Suggestions:</span>
                  <div className="inline-flex flex-wrap gap-1.5 mt-1">
                    {POPULAR_SKILLS.filter(s => !skills.includes(s)).slice(0, 8).map((ps) => (
                      <button
                        key={ps}
                        type="button"
                        onClick={() => handleAddSkill(ps)}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-md text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        + {ps}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Experience Range */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Experience Level (Years)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Minimum Experience (Yrs)</span>
                    <input
                      type="number"
                      min="0"
                      value={experienceMin}
                      onChange={(e) => setExperienceMin(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Maximum Experience (Yrs)</span>
                    <input
                      type="number"
                      min="0"
                      value={experienceMax}
                      onChange={(e) => setExperienceMax(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Compensation & Benefits */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                5
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Compensation & Employee Benefits</h3>
                <p className="text-slate-500 text-xs">Transparent salary ranges boost qualified applicant rate by 40%.</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Salary Currency & Range */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Currency
                  </label>
                  <select
                    value={salaryCurrency}
                    onChange={(e) => setSalaryCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  >
                    <option value="INR">₹ INR (Indian Rupee)</option>
                    <option value="USD">$ USD (US Dollar)</option>
                    <option value="EUR">€ EUR (Euro)</option>
                    <option value="GBP">£ GBP (British Pound)</option>
                    <option value="AED">AED (Emirati Dirham)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Minimum Salary (Annual CTC)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Maximum Salary (Annual CTC)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Benefits Multi-Select Chips */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Key Perks & Benefits (Click to select)
                </label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_BENEFITS.map((ben) => {
                    const isSelected = selectedBenefits.includes(ben);
                    return (
                      <button
                        key={ben}
                        type="button"
                        onClick={() => toggleBenefit(ben)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                        {ben}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Application Settings */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                6
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Hiring Pipeline & Settings</h3>
                <p className="text-slate-500 text-xs">Configure openings count and application deadline.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Total Openings / Vacancies *
                </label>
                <input
                  type="number"
                  min="1"
                  value={openings}
                  onChange={(e) => setOpenings(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Application Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Urgent Badge Toggle */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-amber-600" />
                <div>
                  <span className="text-xs font-bold text-amber-900 block">Mark as Urgent Hiring</span>
                  <span className="text-[11px] text-amber-700">Display an Urgent badge on candidate search feeds.</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSaveJob('DRAFT')}
              className="py-3 px-5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs transition-all shadow-2xs cursor-pointer"
            >
              Save as Draft
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSaveJob('PUBLISHED')}
              className="py-3 px-7 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSubmitting ? 'Publishing...' : 'Publish Job Opening'}
            </button>
          </div>
        </div>

        {/* Right Sticky Column: Live Candidate View Preview (4 cols) */}
        <div className="lg:col-span-4 sticky top-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              Live Candidate Card Preview
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Live Updates
            </span>
          </div>

          {/* The Actual Job Card Preview */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4 relative overflow-hidden">
            {isUrgent && (
              <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg shadow-2xs flex items-center gap-1">
                <Flame className="w-3 h-3" />
                Urgent Opening
              </div>
            )}

            {/* Top Row: Company Avatar + Title */}
            <div className="flex items-start gap-3 pt-1">
              {displayLogo ? (
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center flex-shrink-0 shadow-xs overflow-hidden">
                  <img
                    src={displayLogo}
                    alt={displayCompanyName}
                    className="w-full h-full object-contain rounded-lg"
                    onError={() => setIsLogoInvalid(true)}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-xs">
                  {(displayCompanyName || 'CO').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0 pr-6">
                <h3 className="font-bold text-slate-900 text-base leading-snug truncate">
                  {title || 'Job Title (e.g. Senior Software Engineer)'}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs font-semibold text-slate-700 truncate">
                    {displayCompanyName}
                  </p>
                  {postingCompanyWebsite && (
                    <span className="text-[10px] text-blue-600 font-medium truncate">
                      • {postingCompanyWebsite.replace(/^https?:\/\//, '')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Location & Meta Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg text-[11px] font-medium">
                <MapPin className="w-3 h-3 text-slate-400" />
                {isRemoteEverywhere ? 'Remote (Anywhere)' : (location || 'Location')}
              </span>

              <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg text-[11px] font-semibold">
                <Globe className="w-3 h-3" />
                {workMode}
              </span>

              <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg text-[11px] font-medium">
                <Briefcase className="w-3 h-3 text-slate-400" />
                {jobType}
              </span>

              {experienceMin && (
                <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg text-[11px] font-semibold">
                  <Award className="w-3 h-3" />
                  {experienceMin} - {experienceMax || `${experienceMin}+`} yrs
                </span>
              )}
            </div>

            {/* Salary Estimate Banner */}
            {(salaryMin || salaryMax) ? (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>
                    {salaryCurrency === 'INR' ? '₹' : '$'}
                    {salaryMin ? Number(salaryMin).toLocaleString() : '0'} 
                    {salaryMax ? ` - ${salaryCurrency === 'INR' ? '₹' : '$'}${Number(salaryMax).toLocaleString()}` : ''}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">Per Year</span>
              </div>
            ) : null}

            {/* Snippet Description */}
            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
              {description || 'Provide a compelling role description to preview how candidate seekers will read about this position.'}
            </p>

            {/* Skills Badges */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.slice(0, 4).map((sk) => (
                  <span key={sk} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                    {sk}
                  </span>
                ))}
                {skills.length > 4 && (
                  <span className="px-1.5 py-0.5 rounded-md text-[11px] font-semibold text-slate-400">
                    +{skills.length - 4} more
                  </span>
                )}
              </div>
            )}

            {/* Card Footer Preview */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Posted Just Now
              </span>
              <button
                type="button"
                className="py-1.5 px-3 bg-blue-600 text-white rounded-lg text-xs font-bold pointer-events-none"
              >
                Apply Now
              </button>
            </div>
          </div>

          {/* Recruiter Trust & Quality Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
            <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              Portal Best Practices
            </h5>
            <ul className="space-y-1 text-slate-500 text-[11px] leading-relaxed">
              <li>• Precise skills match candidates 3x faster in discovery feeds.</li>
              <li>• Transparency on CTC / salary increases application conversion by 45%.</li>
              <li>• Once published, applicants will appear in your Applications tab instantly.</li>
            </ul>
          </div>
        </div>

      </div>

      {/* Full Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Candidate Job Post Preview</h3>
                <p className="text-xs text-slate-500 mt-0.5">This is the full detail view candidates see in web and mobile app.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
                {displayLogo ? (
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                    <img
                      src={displayLogo}
                      alt={displayCompanyName}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-sm">
                    {(displayCompanyName || 'CO').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-black text-slate-900">{title || 'Untitled Opening'}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-sm font-semibold text-blue-600">{displayCompanyName}</p>
                    {postingCompanyWebsite && (
                      <span className="text-xs text-slate-400">• {postingCompanyWebsite}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {location || 'Remote'}
                    </span>
                    <span>•</span>
                    <span>{workMode}</span>
                    <span>•</span>
                    <span>{jobType}</span>
                  </div>
                </div>
              </div>

              {/* Compensation */}
              {(salaryMin || salaryMax) && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-emerald-700 font-semibold block text-[11px] uppercase">Offered Compensation</span>
                    <span className="text-base font-black text-emerald-900">
                      {salaryCurrency === 'INR' ? '₹' : '$'}
                      {salaryMin ? Number(salaryMin).toLocaleString() : '0'} 
                      {salaryMax ? ` - ${salaryCurrency === 'INR' ? '₹' : '$'}${Number(salaryMax).toLocaleString()}` : ''} / year
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-xs">
                    Competitive CTC
                  </span>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">About The Role</h4>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {description || 'No description provided.'}
                </p>
              </div>

              {/* Responsibilities */}
              {responsibilities && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Key Responsibilities</h4>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {responsibilities}
                  </p>
                </div>
              )}

              {/* Requirements */}
              {requirements && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Qualifications & Skills</h4>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {requirements}
                  </p>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Technologies & Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((sk) => (
                      <span key={sk} className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {selectedBenefits.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Perks & Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBenefits.map((b) => (
                      <span key={b} className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-medium">
                        ✓ {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
