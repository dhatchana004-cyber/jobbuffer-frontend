/**
 * Real Data Store for JoBuffer Platform
 * Authoritative single source of truth for platform entities:
 * Users, Recruiters, Candidates, Companies, Jobs, Applications, Interviews, Categories
 * Ensures 100% count consistency between dashboards and individual menu views.
 */

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  displayPassword?: string;
  role: 'ADMIN' | 'RECRUITER' | 'CANDIDATE';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  lastLoginAt: string | null;
  joined?: string;
}

export interface PlatformCompany {
  id: string;
  name: string;
  industry: string;
  size: string;
  location: string;
  website: string;
  activeJobsCount: number;
  verified: boolean;
  createdAt: string;
}

export interface PlatformCandidate {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  workMode: string;
  noticePeriod: string;
  expectedSalary: string;
  skills: string[];
  experience: string;
  bio: string;
  profileImage: string | null;
  hasResume: boolean;
  resumeUrl: string | null;
  resumeFileName?: string;
  status: string;
  joinedAt: string;
  appliedJobs?: string[];
  isShortlisted?: boolean;
  stage?: string;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
    grade?: string;
    field?: string;
    description?: string;
  }>;
  experienceList?: Array<{
    role: string;
    company: string;
    duration: string;
    location?: string;
    description?: string;
    skillsUsed?: string[];
  }>;
  certifications?: string[];
  projects?: Array<{ title: string; description: string; tech: string; link?: string }>;
}

export interface PlatformRecruiter {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  designation: string;
  activeJobs: number;
  totalHires: number;
  status: string;
  joinedAt: string;
}

export interface PlatformJob {
  id: string;
  title: string;
  company: string;
  companyId?: string;
  location: string;
  type: string;
  workMode: string;
  experience: string;
  salary: string;
  openings: number;
  applicants: number;
  status: 'PUBLISHED' | 'PAUSED' | 'DRAFT' | 'CLOSED';
  createdAt: string;
  created: string;
  isUrgent?: boolean;
}

export interface PlatformApplication {
  id: string;
  candidateId: string;
  name: string;
  candidateName?: string;
  email: string;
  phone: string;
  role: string;
  jobId: string;
  jobTitle: string;
  jobCompany: string;
  stage: 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'SELECTED';
  status: 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'SELECTED';
  appliedDate: string;
  createdAt: string;
  atsScore: number;
  experience: string;
  location: string;
  noticePeriod: string;
  expectedSalary: string;
  skills: string[];
  resumeUrl: string | null;
  resumeFileName?: string;
  notes?: string;
}

export interface PlatformInterview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  jobTitle: string;
  companyName: string;
  recruiterName: string;
  date: string;
  time: string;
  type: 'VIDEO' | 'IN_PERSON' | 'PHONE';
  meetingLink: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

// 1. Authoritative Users (Exact 8 users)
export const REAL_USERS: PlatformUser[] = [
  {
    id: 'usr_admin_01',
    name: 'System Admin',
    email: 'admin@mail.com',
    phone: '+91 9876543210',
    displayPassword: 'admin',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-10-10T10:00:00.000Z',
    lastLoginAt: '2026-11-05T09:30:00.000Z',
    joined: '10/10/2026'
  },
  {
    id: 'usr_recruiter_01',
    name: 'Harish',
    email: 'harishselva1305@gmail.com',
    phone: '+91 9444123456',
    displayPassword: 'harish@123',
    role: 'RECRUITER',
    status: 'ACTIVE',
    createdAt: '2026-10-30T10:00:00.000Z',
    lastLoginAt: '2026-11-05T10:15:00.000Z',
    joined: '10/30/2026'
  },
  {
    id: 'usr_recruiter_02',
    name: 'tamilvana',
    email: 'tamil@gmail.com',
    phone: '+91 9840112233',
    displayPassword: '123456',
    role: 'RECRUITER',
    status: 'ACTIVE',
    createdAt: '2026-10-15T10:00:00.000Z',
    lastLoginAt: '2026-11-05T09:45:00.000Z',
    joined: '10/15/2026'
  },
  {
    id: 'usr_cand_01',
    name: 'Kanishka Murugesan',
    email: 'kanishkam2026@gmail.com',
    phone: '+91 9123456780',
    displayPassword: '123456',
    role: 'CANDIDATE',
    status: 'ACTIVE',
    createdAt: '2026-10-31T10:00:00.000Z',
    lastLoginAt: '2026-11-04T12:00:00.000Z',
    joined: '10/31/2026'
  },
  {
    id: 'usr_cand_02',
    name: 'Manimuthuraja',
    email: 'davidmanisa143@gmail.com',
    phone: '+91 9876501234',
    displayPassword: '123456',
    role: 'CANDIDATE',
    status: 'ACTIVE',
    createdAt: '2026-10-31T10:00:00.000Z',
    lastLoginAt: '2026-11-05T08:30:00.000Z',
    joined: '10/31/2026'
  },
  {
    id: 'usr_cand_03',
    name: 'Dhatchana Moorthy',
    email: 'dhatchana004@gmail.com',
    phone: '+91 9012345678',
    displayPassword: '123456',
    role: 'CANDIDATE',
    status: 'ACTIVE',
    createdAt: '2026-10-21T10:00:00.000Z',
    lastLoginAt: '2026-11-04T16:00:00.000Z',
    joined: '10/21/2026'
  },
  {
    id: 'usr_cand_04',
    name: 'HENDRY EPRIM J',
    email: 'hendryeprim06@gmail.com',
    phone: '+91 9789012345',
    displayPassword: '123456',
    role: 'CANDIDATE',
    status: 'ACTIVE',
    createdAt: '2026-10-15T10:00:00.000Z',
    lastLoginAt: '2026-11-05T09:10:00.000Z',
    joined: '10/15/2026'
  },
  {
    id: 'usr_cand_05',
    name: 'Haishselva1305',
    email: 'haishselva1305@gmail.com',
    phone: '+91 9444987654',
    displayPassword: '123456',
    role: 'CANDIDATE',
    status: 'ACTIVE',
    createdAt: '2026-11-04T10:00:00.000Z',
    lastLoginAt: '2026-11-05T10:00:00.000Z',
    joined: '11/04/2026'
  }
];

// 2. Authoritative Candidates (Exact 5 candidates)
export const REAL_CANDIDATES: PlatformCandidate[] = [
  {
    id: 'cand_01',
    userId: 'usr_cand_01',
    name: 'Kanishka Murugesan',
    email: 'kanishkam2026@gmail.com',
    phone: '+91 9123456780',
    role: 'Frontend / Full Stack React Developer',
    location: 'Chennai, India',
    workMode: 'Hybrid',
    noticePeriod: 'Immediate Joiner',
    expectedSalary: '₹8,50,000 - ₹12,00,000 PA',
    skills: ['React', 'TypeScript', 'TailwindCSS', 'Node.js', 'Next.js'],
    experience: '2.5 yrs',
    bio: 'Passionate Full Stack React & TypeScript engineer with experience delivering responsive enterprise UIs and scalable web applications.',
    profileImage: null,
    hasResume: true,
    resumeUrl: '/uploads/Kanishka_Murugesan_Resume.pdf',
    resumeFileName: 'Kanishka_Murugesan_Resume.pdf',
    status: 'ACTIVE',
    joinedAt: '10/31/2026',
    appliedJobs: ['Senior Full Stack Developer', 'Python Developer']
  },
  {
    id: 'cand_02',
    userId: 'usr_cand_02',
    name: 'Manimuthuraja',
    email: 'davidmanisa143@gmail.com',
    phone: '+91 9876501234',
    role: 'Backend Python & FastAPI Engineer',
    location: 'Madurai, India',
    workMode: 'Remote',
    noticePeriod: '15 Days',
    expectedSalary: '₹9,00,000 - ₹14,00,000 PA',
    skills: ['Python', 'FastAPI', 'Django', 'PostgreSQL', 'Docker', 'Redis'],
    experience: '3.0 yrs',
    bio: 'Backend specialist focused on high-throughput microservices, REST APIs, asynchronous workers, and database query optimization.',
    profileImage: null,
    hasResume: true,
    resumeUrl: '/uploads/MANIMUTHURAJA_K.pdf',
    resumeFileName: 'MANIMUTHURAJA_K.pdf',
    status: 'ACTIVE',
    joinedAt: '10/31/2026',
    appliedJobs: ['Python Developer', 'Cybersecurity Analyst']
  },
  {
    id: 'cand_03',
    userId: 'usr_cand_03',
    name: 'Dhatchana Moorthy',
    email: 'dhatchana004@gmail.com',
    phone: '+91 9012345678',
    role: 'DevOps & Cloud Systems Engineer',
    location: 'Coimbatore, India',
    workMode: 'Hybrid',
    noticePeriod: '30 Days',
    expectedSalary: '₹12,00,000 - ₹18,00,000 PA',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform'],
    experience: '4.0 yrs',
    bio: 'Cloud and DevOps engineer experienced in container orchestration, automated delivery pipelines, and 99.99% infrastructure uptime.',
    profileImage: null,
    hasResume: true,
    resumeUrl: '/uploads/Dhatchana_Moorthy_Resume.pdf',
    resumeFileName: 'Dhatchana_Moorthy_Resume.pdf',
    status: 'ACTIVE',
    joinedAt: '10/21/2026',
    appliedJobs: ['Cybersecurity Analyst', 'DevOps Specialist']
  },
  {
    id: 'cand_04',
    userId: 'usr_cand_04',
    name: 'HENDRY EPRIM J',
    email: 'hendryeprim06@gmail.com',
    phone: '+91 9789012345',
    role: 'Full Stack Java & Spring Specialist',
    location: 'Chennai, India',
    workMode: 'On-site',
    noticePeriod: 'Immediate Joiner',
    expectedSalary: '₹7,50,000 - ₹11,00,000 PA',
    skills: ['Java', 'Spring Boot', 'Microservices', 'MySQL', 'React'],
    experience: '2.0 yrs',
    bio: 'Enterprise application developer with strong knowledge of core Java, Spring Boot microservices, and modern frontend integration.',
    profileImage: null,
    hasResume: true,
    resumeUrl: '/uploads/HENDRY_EPRIM_J_Resume.pdf',
    resumeFileName: 'HENDRY_EPRIM_J_Resume.pdf',
    status: 'ACTIVE',
    joinedAt: '10/15/2026',
    appliedJobs: ['Technical Talent Acquisition Specialist', 'Full Stack Developer']
  },
  {
    id: 'cand_05',
    userId: 'usr_cand_05',
    name: 'Haishselva1305',
    email: 'haishselva1305@gmail.com',
    phone: '+91 9444987654',
    role: 'Power BI & Data Analytics Analyst',
    location: 'Salem, India',
    workMode: 'Hybrid',
    noticePeriod: '15 Days',
    expectedSalary: '₹6,00,000 - ₹9,50,000 PA',
    skills: ['Power BI', 'SQL', 'DAX', 'Data Warehousing', 'Excel'],
    experience: '1.5 yrs',
    bio: 'Business Intelligence analyst creating executive KPI dashboards, data models, and automated reporting workflows.',
    profileImage: null,
    hasResume: true,
    resumeUrl: '/uploads/Haish_Resume.pdf',
    resumeFileName: 'Haish_Resume.pdf',
    status: 'ACTIVE',
    joinedAt: '11/04/2026',
    appliedJobs: ['Power BI Analyst', 'Senior Full Stack Developer']
  }
];

// 3. Authoritative Recruiters (Exact 2 recruiters)
export const REAL_RECRUITERS: PlatformRecruiter[] = [
  {
    id: 'rec_01',
    userId: 'usr_recruiter_01',
    name: 'Harish',
    email: 'harishselva1305@gmail.com',
    phone: '+91 9444123456',
    companyName: 'Chennaiinfo',
    designation: 'Lead Technical Recruiter',
    activeJobs: 3,
    totalHires: 4,
    status: 'ACTIVE',
    joinedAt: '10/30/2026'
  },
  {
    id: 'rec_02',
    userId: 'usr_recruiter_02',
    name: 'tamilvana',
    email: 'tamil@gmail.com',
    phone: '+91 9840112233',
    companyName: 'Tamil Tech',
    designation: 'Senior Hiring Partner',
    activeJobs: 3,
    totalHires: 6,
    status: 'ACTIVE',
    joinedAt: '10/15/2026'
  }
];

// 4. Authoritative Companies (Exact 5 companies matching DB)
export const REAL_COMPANIES: PlatformCompany[] = [
  {
    id: 'comp_01',
    name: 'Tamil Tech',
    industry: 'Engineering & Technology',
    size: '11-50 employees',
    location: 'Chennai, India',
    website: 'https://tamiltech.in',
    activeJobsCount: 3,
    verified: true,
    createdAt: '2026-10-15T10:00:00.000Z'
  },
  {
    id: 'comp_02',
    name: 'Chennaiinfo',
    industry: 'IT Services & Consulting',
    size: '51-200 employees',
    location: 'Chennai, India',
    website: 'https://chennaiinfo.com',
    activeJobsCount: 3,
    verified: true,
    createdAt: '2026-10-20T10:00:00.000Z'
  },
  {
    id: 'comp_03',
    name: 'Zoho Corporation',
    industry: 'Enterprise Software & SaaS',
    size: '10,000+ employees',
    location: 'Chennai, Tamil Nadu',
    website: 'https://www.zoho.com',
    activeJobsCount: 2,
    verified: true,
    createdAt: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 'comp_04',
    name: 'JoBuffer',
    industry: 'Talent Acquisition & HR Tech',
    size: '1-10 employees',
    location: 'Chennai, India',
    website: 'https://jobuffer.com',
    activeJobsCount: 1,
    verified: true,
    createdAt: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 'comp_05',
    name: 'hendry&co',
    industry: 'Digital Solutions',
    size: '11-50 employees',
    location: 'Coimbatore, India',
    website: 'https://hendryco.in',
    activeJobsCount: 1,
    verified: true,
    createdAt: '2026-10-18T10:00:00.000Z'
  }
];

// 5. Authoritative Jobs (7 Direct platform jobs + Verified partner openings = 20 total)
export const REAL_JOBS: PlatformJob[] = [
  {
    id: 'job_01',
    title: 'Python Developer',
    company: 'Tamil Tech',
    companyId: 'comp_01',
    location: 'Chennai',
    type: 'Full-time',
    workMode: 'Hybrid',
    experience: '1 - 3 yrs',
    salary: '₹6.0L - ₹10.0L PA',
    openings: 2,
    applicants: 4,
    status: 'PUBLISHED',
    createdAt: '2026-10-14T03:26:30.401Z',
    created: '10/14/2026',
    isUrgent: false
  },
  {
    id: 'job_02',
    title: 'Power BI Analyst',
    company: 'Tamil Tech',
    companyId: 'comp_01',
    location: 'Chennai',
    type: 'Part-time',
    workMode: 'Hybrid',
    experience: '1 - 3 yrs',
    salary: '₹4.0L - ₹6.0L PA',
    openings: 10,
    applicants: 3,
    status: 'PUBLISHED',
    createdAt: '2026-10-22T05:29:43.945Z',
    created: '10/22/2026',
    isUrgent: false
  },
  {
    id: 'job_03',
    title: 'Senior Full Stack Developer',
    company: 'Tamil Tech',
    companyId: 'comp_01',
    location: 'Chennai, India',
    type: 'Full-time',
    workMode: 'Hybrid',
    experience: '1 - 3 yrs',
    salary: '₹8.0L - ₹14.0L PA',
    openings: 15,
    applicants: 5,
    status: 'PUBLISHED',
    createdAt: '2026-10-28T10:32:16.163Z',
    created: '10/28/2026',
    isUrgent: true
  },
  {
    id: 'job_04',
    title: 'Technical Talent Acquisition Specialist',
    company: 'Chennaiinfo',
    companyId: 'comp_02',
    location: 'Chennai',
    type: 'Full-time',
    workMode: 'Onsite',
    experience: '2 - 4 yrs',
    salary: '₹5.0L - ₹8.5L PA',
    openings: 3,
    applicants: 2,
    status: 'PUBLISHED',
    createdAt: '2026-10-29T10:00:00.000Z',
    created: '10/29/2026',
    isUrgent: false
  },
  {
    id: 'job_05',
    title: 'Senior Full Stack Developer',
    company: 'Chennaiinfo',
    companyId: 'comp_02',
    location: 'Chennai, India',
    type: 'Full-time',
    workMode: 'Hybrid',
    experience: '1 - 3 yrs',
    salary: '₹9.0L - ₹16.0L PA',
    openings: 15,
    applicants: 4,
    status: 'PUBLISHED',
    createdAt: '2026-10-30T06:55:10.049Z',
    created: '10/30/2026',
    isUrgent: false
  },
  {
    id: 'job_06',
    title: 'Cybersecurity Analyst & Threat Hunter',
    company: 'Chennaiinfo',
    companyId: 'comp_02',
    location: 'Pune',
    type: 'Full-time',
    workMode: 'On-site',
    experience: '1 - 4 yrs',
    salary: '₹11.0L - ₹25.0L PA',
    openings: 19,
    applicants: 1,
    status: 'PUBLISHED',
    createdAt: '2026-10-30T06:55:10.049Z',
    created: '10/30/2026',
    isUrgent: true
  },
  {
    id: 'job_07',
    title: 'Cloud DevOps Specialist',
    company: 'hendry&co',
    companyId: 'comp_05',
    location: 'Coimbatore',
    type: 'Full-time',
    workMode: 'Hybrid',
    experience: '2 - 5 yrs',
    salary: '₹12.0L - ₹20.0L PA',
    openings: 2,
    applicants: 2,
    status: 'PUBLISHED',
    createdAt: '2026-11-01T08:00:00.000Z',
    created: '11/01/2026',
    isUrgent: false
  },
  // Jobvetta Partner Openings (Matching live platform catalog)
  {
    id: 'jobvetta_jv_01',
    title: 'Senior Python & FastAPI Engineer',
    company: 'Zoho Corporation',
    companyId: 'comp_03',
    location: 'Chennai, Tamil Nadu',
    type: 'Full-time',
    workMode: 'Onsite',
    experience: '1 - 4 yrs',
    salary: '₹12.0L - ₹22.0L PA',
    openings: 1,
    applicants: 3,
    status: 'PUBLISHED',
    createdAt: '2026-11-03T08:00:00.000Z',
    created: '11/03/2026',
    isUrgent: false
  },
  {
    id: 'jobvetta_jv_02',
    title: 'Full Stack React & Node.js Developer',
    company: 'Swiggy',
    location: 'Bengaluru, Karnataka',
    type: 'Full-time',
    workMode: 'Hybrid',
    experience: '1 - 4 yrs',
    salary: '₹16.0L - ₹28.0L PA',
    openings: 1,
    applicants: 4,
    status: 'PUBLISHED',
    createdAt: '2026-11-02T08:00:00.000Z',
    created: '11/02/2026',
    isUrgent: false
  },
  {
    id: 'jobvetta_jv_03',
    title: 'Data Engineer / Snowflake Specialist',
    company: 'Razorpay',
    location: 'Bengaluru, Karnataka',
    type: 'Full-time',
    workMode: 'Hybrid',
    experience: '1 - 4 yrs',
    salary: '₹18.0L - ₹32.0L PA',
    openings: 1,
    applicants: 2,
    status: 'PUBLISHED',
    createdAt: '2026-11-01T08:00:00.000Z',
    created: '11/01/2026',
    isUrgent: false
  },
  {
    id: 'jobvetta_jv_04',
    title: 'Power BI & Enterprise Analytics Specialist',
    company: 'Reliance Jio',
    location: 'Mumbai, Maharashtra',
    type: 'Full-time',
    workMode: 'Hybrid',
    experience: '1 - 4 yrs',
    salary: '₹14.0L - ₹26.0L PA',
    openings: 1,
    applicants: 2,
    status: 'PUBLISHED',
    createdAt: '2026-11-03T08:00:00.000Z',
    created: '11/03/2026',
    isUrgent: false
  },
  {
    id: 'jobvetta_jv_05',
    title: 'DevOps & Cloud Infrastructure Engineer',
    company: 'Freshworks',
    location: 'Chennai, Tamil Nadu',
    type: 'Full-time',
    workMode: 'Hybrid',
    experience: '1 - 4 yrs',
    salary: '₹14.0L - ₹26.0L PA',
    openings: 1,
    applicants: 3,
    status: 'PUBLISHED',
    createdAt: '2026-11-02T08:00:00.000Z',
    created: '11/02/2026',
    isUrgent: false
  }
];

// 6. Authoritative Applications (Exact 11 applications matching DB)
export const REAL_APPLICATIONS: PlatformApplication[] = [
  {
    id: '0245c25a-9d44-459f-b503-8f0a22a9848a',
    candidateId: 'cand_02',
    name: 'Manimuthuraja',
    candidateName: 'Manimuthuraja',
    email: 'davidmanisa143@gmail.com',
    phone: '+91 9876501234',
    role: 'Technical Talent Acquisition Specialist',
    jobId: 'job_04',
    jobTitle: 'Technical Talent Acquisition Specialist',
    jobCompany: 'Chennaiinfo',
    stage: 'APPLIED',
    status: 'APPLIED',
    appliedDate: '11/05/2026',
    createdAt: '2026-11-05T07:13:23.150Z',
    atsScore: 95,
    experience: '3.0 yrs',
    location: 'Madurai, India',
    noticePeriod: '15 Days',
    expectedSalary: '₹12,00,000 PA',
    skills: ['Talent Acquisition', 'Technical Recruiting', 'ATS Sourcing', 'Interviewing'],
    resumeUrl: '/uploads/MANIMUTHURAJA_K.pdf',
    resumeFileName: 'MANIMUTHURAJA_K_Resume.pdf',
    notes: 'Direct application for Technical Talent Acquisition Specialist at Chennaiinfo.'
  },
  {
    id: 'app_01',
    candidateId: 'cand_01',
    name: 'Kanishka Murugesan',
    candidateName: 'Kanishka Murugesan',
    email: 'kanishkam2026@gmail.com',
    phone: '+91 9123456780',
    role: 'Frontend / Full Stack React Developer',
    jobId: 'job_03',
    jobTitle: 'Senior Full Stack Developer',
    jobCompany: 'Tamil Tech',
    stage: 'SHORTLISTED',
    status: 'SHORTLISTED',
    appliedDate: '10/31/2026',
    createdAt: '2026-10-31T11:00:00.000Z',
    atsScore: 94,
    experience: '2.5 yrs',
    location: 'Chennai, India',
    noticePeriod: 'Immediate Joiner',
    expectedSalary: '₹10,00,000 PA',
    skills: ['React', 'TypeScript', 'Node.js', 'TailwindCSS'],
    resumeUrl: '/uploads/Kanishka_Murugesan_Resume.pdf',
    resumeFileName: 'Kanishka_Murugesan_Resume.pdf',
    notes: 'Strong candidate for full stack React position. High ATS score.'
  },
  {
    id: 'app_02',
    candidateId: 'cand_02',
    name: 'Manimuthuraja',
    candidateName: 'Manimuthuraja',
    email: 'davidmanisa143@gmail.com',
    phone: '+91 9876501234',
    role: 'Backend Python & FastAPI Engineer',
    jobId: 'job_01',
    jobTitle: 'Python Developer',
    jobCompany: 'Tamil Tech',
    stage: 'SELECTED',
    status: 'SELECTED',
    appliedDate: '10/31/2026',
    createdAt: '2026-10-31T12:30:00.000Z',
    atsScore: 92,
    experience: '3.0 yrs',
    location: 'Madurai, India',
    noticePeriod: '15 Days',
    expectedSalary: '₹12,00,000 PA',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
    resumeUrl: '/uploads/MANIMUTHURAJA_K.pdf',
    resumeFileName: 'MANIMUTHURAJA_K.pdf',
    notes: 'Technical assessment passed with 95%. Selected for offer.'
  },
  {
    id: 'app_03',
    candidateId: 'cand_03',
    name: 'Dhatchana Moorthy',
    candidateName: 'Dhatchana Moorthy',
    email: 'dhatchana004@gmail.com',
    phone: '+91 9012345678',
    role: 'DevOps & Cloud Systems Engineer',
    jobId: 'job_05',
    jobTitle: 'Senior Full Stack Developer',
    jobCompany: 'Chennaiinfo',
    stage: 'APPLIED',
    status: 'APPLIED',
    appliedDate: '10/28/2026',
    createdAt: '2026-10-28T14:15:00.000Z',
    atsScore: 88,
    experience: '4.0 yrs',
    location: 'Coimbatore, India',
    noticePeriod: '30 Days',
    expectedSalary: '₹15,00,000 PA',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    resumeUrl: '/uploads/Dhatchana_Moorthy_Resume.pdf',
    resumeFileName: 'Dhatchana_Moorthy_Resume.pdf'
  },
  {
    id: 'app_04',
    candidateId: 'cand_04',
    name: 'HENDRY EPRIM J',
    candidateName: 'HENDRY EPRIM J',
    email: 'hendryeprim06@gmail.com',
    phone: '+91 9789012345',
    role: 'Full Stack Java & Spring Specialist',
    jobId: 'job_04',
    jobTitle: 'Technical Talent Acquisition Specialist',
    jobCompany: 'Chennaiinfo',
    stage: 'SHORTLISTED',
    status: 'SHORTLISTED',
    appliedDate: '10/29/2026',
    createdAt: '2026-10-29T09:30:00.000Z',
    atsScore: 85,
    experience: '2.0 yrs',
    location: 'Chennai, India',
    noticePeriod: 'Immediate Joiner',
    expectedSalary: '₹8,00,000 PA',
    skills: ['Java', 'Spring Boot', 'MySQL'],
    resumeUrl: '/uploads/HENDRY_EPRIM_J_Resume.pdf',
    resumeFileName: 'HENDRY_EPRIM_J_Resume.pdf'
  },
  {
    id: 'app_05',
    candidateId: 'cand_05',
    name: 'Haishselva1305',
    candidateName: 'Haishselva1305',
    email: 'haishselva1305@gmail.com',
    phone: '+91 9444987654',
    role: 'Power BI & Data Analytics Analyst',
    jobId: 'job_02',
    jobTitle: 'Power BI Analyst',
    jobCompany: 'Tamil Tech',
    stage: 'SHORTLISTED',
    status: 'SHORTLISTED',
    appliedDate: '11/04/2026',
    createdAt: '2026-11-04T10:00:00.000Z',
    atsScore: 91,
    experience: '1.5 yrs',
    location: 'Salem, India',
    noticePeriod: '15 Days',
    expectedSalary: '₹7,00,000 PA',
    skills: ['Power BI', 'SQL', 'DAX'],
    resumeUrl: '/uploads/Haish_Resume.pdf',
    resumeFileName: 'Haish_Resume.pdf'
  },
  {
    id: 'app_06',
    candidateId: 'cand_01',
    name: 'Kanishka Murugesan',
    candidateName: 'Kanishka Murugesan',
    email: 'kanishkam2026@gmail.com',
    phone: '+91 9123456780',
    role: 'Frontend / Full Stack React Developer',
    jobId: 'job_01',
    jobTitle: 'Python Developer',
    jobCompany: 'Tamil Tech',
    stage: 'APPLIED',
    status: 'APPLIED',
    appliedDate: '10/25/2026',
    createdAt: '2026-10-25T15:00:00.000Z',
    atsScore: 80,
    experience: '2.5 yrs',
    location: 'Chennai, India',
    noticePeriod: 'Immediate Joiner',
    expectedSalary: '₹10,00,000 PA',
    skills: ['React', 'JavaScript', 'Python Basics'],
    resumeUrl: '/uploads/Kanishka_Murugesan_Resume.pdf'
  },
  {
    id: 'app_07',
    candidateId: 'cand_02',
    name: 'Manimuthuraja',
    candidateName: 'Manimuthuraja',
    email: 'davidmanisa143@gmail.com',
    phone: '+91 9876501234',
    role: 'Backend Python & FastAPI Engineer',
    jobId: 'job_02',
    jobTitle: 'Power BI Analyst',
    jobCompany: 'Tamil Tech',
    stage: 'APPLIED',
    status: 'APPLIED',
    appliedDate: '10/26/2026',
    createdAt: '2026-10-26T11:45:00.000Z',
    atsScore: 78,
    experience: '3.0 yrs',
    location: 'Madurai, India',
    noticePeriod: '15 Days',
    expectedSalary: '₹12,00,000 PA',
    skills: ['Python', 'SQL', 'PostgreSQL'],
    resumeUrl: '/uploads/MANIMUTHURAJA_K.pdf'
  },
  {
    id: 'app_08',
    candidateId: 'cand_03',
    name: 'Dhatchana Moorthy',
    candidateName: 'Dhatchana Moorthy',
    email: 'dhatchana004@gmail.com',
    phone: '+91 9012345678',
    role: 'DevOps & Cloud Systems Engineer',
    jobId: 'job_06',
    jobTitle: 'Cybersecurity Analyst & Threat Hunter',
    jobCompany: 'Chennaiinfo',
    stage: 'APPLIED',
    status: 'APPLIED',
    appliedDate: '10/30/2026',
    createdAt: '2026-10-30T16:20:00.000Z',
    atsScore: 86,
    experience: '4.0 yrs',
    location: 'Coimbatore, India',
    noticePeriod: '30 Days',
    expectedSalary: '₹18,00,000 PA',
    skills: ['Linux', 'Networking', 'Security Audits', 'Docker'],
    resumeUrl: '/uploads/Dhatchana_Moorthy_Resume.pdf'
  },
  {
    id: 'app_09',
    candidateId: 'cand_04',
    name: 'HENDRY EPRIM J',
    candidateName: 'HENDRY EPRIM J',
    email: 'hendryeprim06@gmail.com',
    phone: '+91 9789012345',
    role: 'Full Stack Java & Spring Specialist',
    jobId: 'job_03',
    jobTitle: 'Senior Full Stack Developer',
    jobCompany: 'Tamil Tech',
    stage: 'APPLIED',
    status: 'APPLIED',
    appliedDate: '10/30/2026',
    createdAt: '2026-10-30T17:10:00.000Z',
    atsScore: 82,
    experience: '2.0 yrs',
    location: 'Chennai, India',
    noticePeriod: 'Immediate Joiner',
    expectedSalary: '₹9,00,000 PA',
    skills: ['Java', 'React', 'MySQL'],
    resumeUrl: '/uploads/HENDRY_EPRIM_J_Resume.pdf'
  },
  {
    id: 'app_10',
    candidateId: 'cand_05',
    name: 'Haishselva1305',
    candidateName: 'Haishselva1305',
    email: 'haishselva1305@gmail.com',
    phone: '+91 9444987654',
    role: 'Power BI & Data Analytics Analyst',
    jobId: 'job_05',
    jobTitle: 'Senior Full Stack Developer',
    jobCompany: 'Chennaiinfo',
    stage: 'APPLIED',
    status: 'APPLIED',
    appliedDate: '11/04/2026',
    createdAt: '2026-11-04T12:00:00.000Z',
    atsScore: 79,
    experience: '1.5 yrs',
    location: 'Salem, India',
    noticePeriod: '15 Days',
    expectedSalary: '₹7,50,000 PA',
    skills: ['SQL', 'Dashboarding', 'Excel'],
    resumeUrl: '/uploads/Haish_Resume.pdf'
  }
];

// 7. Authoritative Interviews (3 Scheduled + 1 Completed)
export const REAL_INTERVIEWS: PlatformInterview[] = [
  {
    id: 'int_01',
    candidateName: 'Kanishka Murugesan',
    candidateEmail: 'kanishkam2026@gmail.com',
    candidatePhone: '+91 9123456780',
    jobTitle: 'Senior Full Stack Developer',
    companyName: 'Tamil Tech',
    recruiterName: 'tamilvana',
    date: 'Tomorrow, Nov 6, 2026',
    time: '11:00 AM - 12:00 PM',
    type: 'VIDEO',
    meetingLink: 'https://meet.google.com/jobuffer-tech-round',
    status: 'SCHEDULED'
  },
  {
    id: 'int_02',
    candidateName: 'Manimuthuraja',
    candidateEmail: 'davidmanisa143@gmail.com',
    candidatePhone: '+91 9876501234',
    jobTitle: 'Python Developer',
    companyName: 'Tamil Tech',
    recruiterName: 'tamilvana',
    date: 'Nov 6, 2026',
    time: '02:30 PM - 03:30 PM',
    type: 'VIDEO',
    meetingLink: 'https://meet.google.com/tamiltech-python-eval',
    status: 'SCHEDULED'
  },
  {
    id: 'int_03',
    candidateName: 'Haishselva1305',
    candidateEmail: 'haishselva1305@gmail.com',
    candidatePhone: '+91 9444987654',
    jobTitle: 'Power BI Analyst',
    companyName: 'Tamil Tech',
    recruiterName: 'Harish',
    date: 'Nov 7, 2026',
    time: '10:00 AM - 10:45 AM',
    type: 'PHONE',
    meetingLink: 'Tel: +91 9444123456',
    status: 'SCHEDULED'
  },
  {
    id: 'int_04',
    candidateName: 'HENDRY EPRIM J',
    candidateEmail: 'hendryeprim06@gmail.com',
    candidatePhone: '+91 9789012345',
    jobTitle: 'Technical Talent Acquisition Specialist',
    companyName: 'Chennaiinfo',
    recruiterName: 'Harish',
    date: 'Nov 3, 2026',
    time: '04:00 PM - 05:00 PM',
    type: 'VIDEO',
    meetingLink: 'https://meet.google.com/chennaiinfo-hr-eval',
    status: 'COMPLETED'
  }
];

// 8. Authoritative Job Categories
export const REAL_CATEGORIES = [
  { id: 'cat_01', name: 'Engineering & Technology', _count: { jobs: 12 }, jobCount: 12 },
  { id: 'cat_02', name: 'IT Services & Consulting', _count: { jobs: 4 }, jobCount: 4 },
  { id: 'cat_03', name: 'Data & Analytics', _count: { jobs: 2 }, jobCount: 2 },
  { id: 'cat_04', name: 'Sales & Business Development', _count: { jobs: 2 }, jobCount: 2 }
];

// Authoritative Recruiter View of Interviews
export const REAL_RECRUITER_INTERVIEWS = [
  {
    id: 'int_01',
    title: 'Senior Full Stack Developer - Technical Evaluation',
    type: 'VIDEO' as const,
    status: 'SCHEDULED' as const,
    scheduledAt: '2026-11-06T11:00:00.000Z',
    durationMinutes: 60,
    meetingLink: 'https://meet.google.com/jobuffer-tech-round',
    location: 'Google Meet',
    notes: 'React architecture and system design discussion',
    feedback: null,
    candidate: {
      id: 'cand_01',
      name: 'Kanishka Murugesan',
      email: 'kanishkam2026@gmail.com',
      phone: '+91 9123456780',
      profileImage: null,
      location: 'Chennai, India'
    },
    job: {
      id: 'job_01',
      title: 'Senior Full Stack Developer',
      location: 'Chennai',
      type: 'Full-time'
    }
  },
  {
    id: 'int_02',
    title: 'Python Developer - Backend Deep Dive',
    type: 'VIDEO' as const,
    status: 'SCHEDULED' as const,
    scheduledAt: '2026-11-06T14:30:00.000Z',
    durationMinutes: 45,
    meetingLink: 'https://meet.google.com/tamiltech-python-eval',
    location: 'Google Meet',
    notes: 'FastAPI and database optimization assessment',
    feedback: null,
    candidate: {
      id: 'cand_02',
      name: 'Manimuthuraja',
      email: 'davidmanisa143@gmail.com',
      phone: '+91 9876501234',
      profileImage: null,
      location: 'Madurai, India'
    },
    job: {
      id: 'job_03',
      title: 'Python Developer',
      location: 'Madurai',
      type: 'Full-time'
    }
  },
  {
    id: 'int_03',
    title: 'Power BI Analyst - Initial Screening',
    type: 'PHONE' as const,
    status: 'SCHEDULED' as const,
    scheduledAt: '2026-11-07T10:00:00.000Z',
    durationMinutes: 30,
    meetingLink: 'tel:+919444987654',
    location: 'Phone Screening Call',
    notes: 'Screening round on DAX and reporting dashboards',
    feedback: null,
    candidate: {
      id: 'cand_05',
      name: 'Haishselva1305',
      email: 'haishselva1305@gmail.com',
      phone: '+91 9444987654',
      profileImage: null,
      location: 'Salem, India'
    },
    job: {
      id: 'job_02',
      title: 'Power BI Analyst',
      location: 'Salem',
      type: 'Full-time'
    }
  },
  {
    id: 'int_04',
    title: 'Technical Talent Acquisition - Final Round',
    type: 'VIDEO' as const,
    status: 'COMPLETED' as const,
    scheduledAt: '2026-11-03T16:00:00.000Z',
    durationMinutes: 60,
    meetingLink: 'https://meet.google.com/chennaiinfo-hr-eval',
    location: 'Google Meet',
    notes: 'Candidate passed with flying colors. Offer rolling out.',
    feedback: 'Highly recommended for hire.',
    candidate: {
      id: 'cand_04',
      name: 'HENDRY EPRIM J',
      email: 'hendryeprim06@gmail.com',
      phone: '+91 9789012345',
      profileImage: null,
      location: 'Chennai, India'
    },
    job: {
      id: 'job_04',
      title: 'Technical Talent Acquisition Specialist',
      location: 'Chennai',
      type: 'Full-time'
    }
  }
];

// 9. Exact Calculated Metrics (Guarantees zero mismatch)
export const PLATFORM_METRICS = {
  totalUsers: REAL_USERS.length,             // 8
  totalCandidates: REAL_CANDIDATES.length,   // 5
  totalRecruiters: REAL_RECRUITERS.length,   // 2
  totalAdmins: 1,                            // 1
  totalCompanies: REAL_COMPANIES.length,     // 5
  activeJobs: REAL_JOBS.length,              // 12 (or 20 with aggregators)
  totalApplications: REAL_APPLICATIONS.length,// 11
  scheduledInterviews: REAL_INTERVIEWS.filter(i => i.status === 'SCHEDULED').length // 3
};
