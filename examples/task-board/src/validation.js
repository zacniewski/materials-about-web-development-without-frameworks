export const STATUSES = ['TODO', 'DOING', 'DONE'];
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (v) => String(Array.isArray(v) ? v[0] : v ?? '').trim();
const result = (values, errors) => ({ ok: Object.keys(errors).length === 0, values, errors });

export function parseId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function parseTags(value) {
  return [...new Set(str(value).split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))];
}

export function validateTask(input) {
  const errors = {};
  const values = {
    title: str(input.title),
    description: str(input.description),
    priority: str(input.priority) || 'MEDIUM',
    tags: str(input.tags),
  };
  if (!values.title) errors.title = 'Title is required.';
  else if (values.title.length > 200) errors.title = 'Title must be at most 200 characters.';
  if (values.description.length > 2000) errors.description = 'Description must be at most 2000 characters.';
  if (!PRIORITIES.includes(values.priority)) errors.priority = 'Invalid priority.';
  const tags = parseTags(values.tags);
  if (tags.length > 5) errors.tags = 'At most 5 tags.';
  else if (tags.some((t) => t.length > 30 || !/^[a-z0-9-]+$/.test(t))) errors.tags = 'Tags: letters, digits and dashes, max 30 chars.';
  return result(values, errors);
}

export function validateStatus(input) {
  const status = str(input.status);
  return STATUSES.includes(status) ? status : null;
}

export function validateBoard(input) {
  const errors = {};
  const values = { name: str(input.name) };
  if (!values.name) errors.name = 'Name is required.';
  else if (values.name.length > 100) errors.name = 'Name must be at most 100 characters.';
  return result(values, errors);
}

export function validateRegistration(input) {
  const errors = {};
  const values = { name: str(input.name), email: str(input.email).toLowerCase() };
  const password = String(input.password ?? '');
  if (!values.name) errors.name = 'Name is required.';
  if (!EMAIL_RE.test(values.email)) errors.email = 'Enter a valid email address.';
  if (password.length < 8) errors.password = 'Password must have at least 8 characters.';
  return { ...result(values, errors), password };
}
