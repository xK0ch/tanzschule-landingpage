function initYear(): void {
  const y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
}

function initStickyNav(): void {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = (): void => {
    if (window.scrollY > 8) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initSmoothScroll(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e: MouseEvent) => {
      const href = a.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 60,
        behavior: 'smooth',
      });
    });
  });
}

type FieldName = 'name' | 'school' | 'email' | 'message';

function validate(field: FieldName | string, value: string): string {
  if (!value || !value.trim()) return 'Bitte ausfüllen.';
  if (field === 'email') {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!re.test(value.trim())) return 'Bitte eine gültige E-Mail-Adresse.';
  }
  return '';
}

function showError(input: HTMLInputElement | HTMLTextAreaElement, msg: string): void {
  const wrap = input.closest('.field');
  if (!wrap) return;
  wrap.classList.toggle('has-error', !!msg);
  const err = wrap.querySelector('.err');
  if (err) err.textContent = msg || '';
}

function initContactForm(): void {
  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  if (!form) return;

  const inputs = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea');

  inputs.forEach((input) => {
    input.addEventListener('blur', () => {
      showError(input, validate(input.name, input.value));
    });
    input.addEventListener('input', () => {
      const wrap = input.closest('.field');
      if (wrap && wrap.classList.contains('has-error')) {
        showError(input, validate(input.name, input.value));
      }
    });
  });

  const sendError = form.querySelector<HTMLElement>('.send-error');

  form.addEventListener('submit', async (e: SubmitEvent) => {
    e.preventDefault();
    let ok = true;
    inputs.forEach((input) => {
      const msg = validate(input.name, input.value);
      showError(input, msg);
      if (msg) ok = false;
    });
    if (!ok) return;

    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const lbl = btn?.querySelector<HTMLElement>('.btn-label');
    const restore = (): void => {
      if (btn) btn.disabled = false;
      if (lbl) lbl.textContent = 'Anfrage senden';
    };

    if (sendError) sendError.hidden = true;
    if (btn) btn.disabled = true;
    if (lbl) lbl.textContent = 'Wird gesendet…';

    const payload = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      organisation: (form.elements.namedItem('school') as HTMLInputElement).value.trim(),
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim(),
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      form.classList.add('is-sent');
    } catch {
      restore();
      if (sendError) {
        sendError.textContent =
          'Das Senden hat leider nicht geklappt. Bitte versuchen Sie es erneut oder schreiben Sie direkt an mail@fynn-koch.de.';
        sendError.hidden = false;
      }
    }
  });
}

initYear();
initStickyNav();
initSmoothScroll();
initContactForm();
