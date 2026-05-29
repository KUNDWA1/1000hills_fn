const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

let _token = null;
export function setToken(t) { _token = t; }
export function clearToken() { _token = null; }

function headers(isFormData = false) {
  const h = {};
  if (_token) h['Authorization'] = `Bearer ${_token}`;
  if (!isFormData) h['Content-Type'] = 'application/json';
  return h;
}

async function request(method, path, body = null, isFormData = false) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(isFormData),
    body: body ? (isFormData ? body : JSON.stringify(body)) : null,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let message = 'Request failed';
    try {
      const err = JSON.parse(text);
      message = err.message || err.error || (res.status === 401 ? 'Unauthorized — please sign in again' : message);
    } catch {
      message = res.status === 401 ? 'Unauthorized — please sign in again'
              : res.status === 403 ? 'Access denied'
              : text || message;
    }
    throw new Error(message);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  get:    (path)              => request('GET',    path),
  post:   (path, body)        => request('POST',   path, body),
  put:    (path, body)        => request('PUT',    path, body),
  patch:  (path, body)        => request('PATCH',  path, body),
  delete: (path)              => request('DELETE', path),
  upload: (path, formData)    => request('POST',   path, formData, true),
  uploadPut: (path, formData) => request('PUT',    path, formData, true),
};
