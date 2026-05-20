type ExhibitorSession = {
  id: string;
  booth_name: string;
  company_name: string;
  contact_name: string;
  email: string;
};

const EXHIBITOR_AUTH_STORAGE_KEY = "bioenergy_exhibitor_authenticated";

export function getExhibitorSession(): ExhibitorSession | null {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(EXHIBITOR_AUTH_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ExhibitorSession;
  } catch {
    try {
      sessionStorage.removeItem(EXHIBITOR_AUTH_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
    return null;
  }
}

export function isExhibitorAuthenticated() {
  return Boolean(getExhibitorSession());
}

export function setExhibitorSession(session: ExhibitorSession) {
  try {
    sessionStorage.setItem(EXHIBITOR_AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignore storage errors
  }
}

export function clearExhibitorSession() {
  try {
    sessionStorage.removeItem(EXHIBITOR_AUTH_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}
