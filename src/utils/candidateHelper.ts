/**
 * Candidate Helper Utilities:
 * 1. Format candidate names cleanly (prevent 'Tester' or generic strings)
 * 2. Resolve absolute backend Resume URLs for viewing and downloading
 * 3. Extract candidate initials
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.VITE_API_URL 
    ? String(import.meta.env.VITE_API_URL).replace(/\/api(\/v\d+)?\/?$/i, '') 
    : 'https://api.jobuffer.com');

export function formatCandidateName(
  name?: string | null,
  email?: string | null,
  resumeFileName?: string | null
): string {
  const raw = (name || '').trim();
  const isDummy = !raw || /^(tester|test candidate|test candidate suite|approutes candidate|test|candidate|admin|error test)$/i.test(raw);

  if (isDummy) {
    // 1. Try to extract clean name from resume file name
    if (resumeFileName) {
      const clean = decodeURIComponent(resumeFileName)
        .split('/')
        .pop()!
        .replace(/\.(pdf|docx?|txt)$/gi, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\b(resume|cv|biodata|profile)\b/gi, '')
        .replace(/[0-9]+/g, '')
        .trim();

      if (clean.length >= 3 && !/^(test|dummy|untitled|document)$/i.test(clean)) {
        return clean
          .split(' ')
          .filter(Boolean)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
      }
    }

    // 2. Try to derive from email prefix
    if (email) {
      const prefix = email.split('@')[0]
        .replace(/[0-9]+/g, ' ')
        .replace(/[._-]+/g, ' ')
        .trim();

      if (prefix.length >= 3 && !/^(test|err|admin|candidate)/i.test(prefix)) {
        return prefix
          .split(' ')
          .filter(Boolean)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
      }
    }

    return 'Candidate Profile';
  }

  return raw;
}

export function getCleanResumeUrl(
  candOrUrl: any,
  forDownload = false
): string | null {
  if (!candOrUrl) return null;

  let rawUrl: string = '';
  let candidateName: string = '';
  let rawFileName: string = '';

  if (typeof candOrUrl === 'string') {
    rawUrl = candOrUrl;
  } else if (typeof candOrUrl === 'object') {
    rawUrl = candOrUrl.resumeUrl || candOrUrl.fileUrl || candOrUrl.resume || '';
    candidateName = candOrUrl.name || candOrUrl.candidateName || '';
    rawFileName = candOrUrl.resumeFileName || candOrUrl.fileName || '';
  }

  if (!rawUrl && !rawFileName) return null;

  let resolved = rawUrl;

  // If storage.jobbuffer.in mock URL, convert to Express backend resume endpoint
  if (resolved.includes('storage.jobbuffer.in') || resolved.includes('storage.orassys.in')) {
    const fn = resolved.split('/').pop() || rawFileName || 'Resume.pdf';
    resolved = `/api/resumes/${encodeURIComponent(fn)}`;
  } else if (!resolved && rawFileName) {
    resolved = `/api/resumes/${encodeURIComponent(rawFileName)}`;
  }

  // Normalize any accidental duplicate /api/v1/api/ paths
  resolved = resolved.replace(/\/api\/v\d+\/api\//i, '/api/');

  // Prepend backend port if relative
  if (resolved.startsWith('/api/') || resolved.startsWith('/uploads/')) {
    resolved = `${API_BASE}${resolved}`;
  } else if (resolved.startsWith('http://localhost:5173/api/')) {
    resolved = resolved.replace('http://localhost:5173', API_BASE);
  } else if (resolved.startsWith('https://jobuffer.com/api/')) {
    resolved = resolved.replace('https://jobuffer.com', API_BASE);
  }

  // Ensure no duplicate /api/v1/api/ in full absolute URL
  resolved = resolved.replace(/^(https?:\/\/[^/]+)\/api\/v\d+\/api\//i, '$1/api/');

  if (forDownload) {
    const sep = resolved.includes('?') ? '&' : '?';
    const cleanName = candidateName || rawFileName || 'Resume';
    resolved = `${resolved}${sep}download=true&name=${encodeURIComponent(cleanName)}`;
  }

  return resolved;
}

export function getInitials(name?: string | null): string {
  if (!name) return 'CA';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
