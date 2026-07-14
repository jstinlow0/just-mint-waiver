import { useState, useEffect, useRef, Component } from "react";

// ── Design tokens (matches JustMintWaiver.jsx) ───────────────────────────────
const C = {
  green: '#008922', dark: '#206100', bg: '#F4FBF6',
  white: '#ffffff', border: '#b8dfc4', text: '#0d2615', muted: '#4a7a58',
};

const STATUSES = ['Intake', 'Cleaning & Prep', 'Done', 'Returned'];

// Free-plan safe: longest edge ~1600px, target < 4 MB (also under Vercel's 4.5 MB
// function limit). Compress harder if a photo is still too big.
const MAX_EDGE = 1600;
const TARGET_BYTES = 4 * 1024 * 1024;

// ── Shared UI primitives (mirrors the waiver app) ────────────────────────────
const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: 15, fontFamily: 'Georgia,serif',
  background: C.bg, color: C.text, borderRadius: 8, boxSizing: 'border-box',
  outline: 'none', WebkitAppearance: 'none', border: `1.5px solid ${C.border}`,
};

function Box({ children }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
      {children}
    </div>
  );
}
function Cap({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', color: C.muted, textTransform: 'uppercase', marginBottom: 10 }}>{children}</div>;
}
function Btn({ children, onClick, disabled, outline }) {
  return (
    <button onClick={onClick} disabled={disabled} type="button" style={{
      width: '100%', padding: 15, fontSize: 15, fontWeight: 600, borderRadius: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      border: outline ? `1.5px solid ${C.green}` : 'none',
      background: outline ? 'transparent' : disabled ? C.muted : C.green,
      color: outline ? C.green : '#fff', marginBottom: 10, fontFamily: 'Georgia,serif',
    }}>
      {children}
    </button>
  );
}

// ── Image compression (canvas, no deps — same approach as the SigPad canvas) ──
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read image'));
    img.src = URL.createObjectURL(file);
  });
}
async function compressImage(file) {
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d').drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(img.src);

  let quality = 0.85;
  let blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality));
  // Step quality down until under target (floor at 0.4 to keep usable detail).
  while (blob && blob.size > TARGET_BYTES && quality > 0.4) {
    quality -= 0.1;
    blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality));
  }
  return blob;
}

// ── API helpers ──────────────────────────────────────────────────────────────
async function fetchRefs() {
  const res = await fetch('/api/list-refs');
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Failed to load clients/orders');
  return data;
}
async function syncCard(payload) {
  const res = await fetch('/api/sync-card', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Failed to save card');
  return data;
}
async function uploadPhoto(pageId, blob, filename) {
  const qs = new URLSearchParams({ pageId, filename, type: 'image/jpeg' });
  const res = await fetch(`/api/upload-card-photo?${qs}`, {
    method: 'POST',
    headers: { 'Content-Type': 'image/jpeg' },
    body: blob,
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Photo upload failed');
  return data;
}

// ── Capture screen ────────────────────────────────────────────────────────────
function Capture() {
  const [refs, setRefs] = useState({ clients: [], orders: [], cards: [] });
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [refsError, setRefsError] = useState(null);

  const [editingId, setEditingId] = useState(null); // null = creating new
  const [cardName, setCardName] = useState('');
  const [clientId, setClientId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState('Intake');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]); // { file, previewUrl }

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null); // { msg, orderStatus }
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { reloadRefs(); }, []);

  async function reloadRefs() {
    setLoadingRefs(true); setRefsError(null);
    try { setRefs(await fetchRefs()); }
    catch (e) { setRefsError(e.message); }
    finally { setLoadingRefs(false); }
  }

  function resetForm() {
    setEditingId(null); setCardName(''); setStatus('Intake'); setNotes('');
    setPhotos([]); setResult(null); setError(null);
  }

  function loadCard(c) {
    setEditingId(c.id);
    setCardName(c.name === '(untitled)' ? '' : c.name);
    setClientId(c.clientId || '');
    setOrderId(c.orderId || '');
    setStatus(STATUSES.includes(c.status) ? c.status : 'Intake');
    setNotes(c.notes || '');
    setPhotos([]); // existing photos already live in Notion; add new ones here
    setResult(null); setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function onPick(e) {
    const files = Array.from(e.target.files || []);
    const next = files.filter((f) => f.type.startsWith('image/'))
      .map((f) => ({ file: f, previewUrl: URL.createObjectURL(f) }));
    setPhotos((p) => [...p, ...next]);
    if (fileRef.current) fileRef.current.value = '';
  }
  function removePhoto(i) {
    setPhotos((p) => {
      URL.revokeObjectURL(p[i]?.previewUrl);
      return p.filter((_, idx) => idx !== i);
    });
  }

  function validate() {
    if (cardName.trim().length < 1) return 'Enter a card name.';
    if (!clientId) return 'Select a client.';
    if (!orderId) return 'Select an order.';
    return null;
  }

  async function save() {
    const v = validate();
    if (v) { setError(v); return; }
    setBusy(true); setError(null); setResult(null); setProgress('Saving card…');

    try {
      const { pageId, orderStatus } = await syncCard({
        pageId: editingId || undefined,
        cardName: cardName.trim(), orderId, clientId, status, notes: notes.trim(),
      });

      // Upload photos one at a time (compress -> raw binary). Sequential keeps
      // every request small and lets us report progress + fail one photo cleanly.
      for (let i = 0; i < photos.length; i++) {
        setProgress(`Uploading photo ${i + 1} of ${photos.length}…`);
        const blob = await compressImage(photos[i].file);
        if (!blob) throw new Error(`Could not process photo ${i + 1}`);
        const name = (photos[i].file.name || `photo-${i + 1}`).replace(/\.[^.]+$/, '') + '.jpg';
        await uploadPhoto(pageId, blob, name);
      }

      setResult({
        msg: editingId ? 'Card updated.' : 'Card saved to Notion.',
        orderStatus,
      });
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setPhotos([]);
      setEditingId(pageId);
      reloadRefs();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false); setProgress('');
    }
  }

  const selStyle = { ...inputStyle, fontFamily: 'Georgia,serif' };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', minHeight: '100vh', background: C.bg, fontFamily: 'Georgia,serif', paddingBottom: 48 }}>
      <div style={{ height: 4, background: `linear-gradient(90deg,${C.green},${C.dark})` }} />
      <div style={{ textAlign: 'center', padding: '22px 16px 18px' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>Just Mint Card Care</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 3, letterSpacing: '.06em', textTransform: 'uppercase' }}>
          Card Intake &amp; Documentation
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {editingId && (
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
            Editing existing card ·{' '}
            <button onClick={resetForm} type="button" style={{ background: 'none', border: 'none', color: C.green, cursor: 'pointer', textDecoration: 'underline', fontSize: 12 }}>
              start a new card
            </button>
          </div>
        )}

        <Box>
          <Cap>Card Name *</Cap>
          <input value={cardName} placeholder="e.g. Charizard VMAX 074/073"
            onChange={(e) => { setCardName(e.target.value); setError(null); }} style={inputStyle} />
        </Box>

        <Box>
          <Cap>Client *</Cap>
          {loadingRefs ? <div style={{ fontSize: 13, color: C.muted }}>Loading…</div> : (
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} style={selStyle}>
              <option value="">Select a client…</option>
              {refs.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          {refsError && <div style={{ color: '#b91c1c', fontSize: 12, marginTop: 6 }}>{refsError}</div>}
        </Box>

        <Box>
          <Cap>Order *</Cap>
          {loadingRefs ? <div style={{ fontSize: 13, color: C.muted }}>Loading…</div> : (
            <select value={orderId} onChange={(e) => setOrderId(e.target.value)} style={selStyle}>
              <option value="">Select an order…</option>
              {refs.orders.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          )}
        </Box>

        <Box>
          <Cap>Status *</Cap>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={selStyle}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Box>

        <Box>
          <Cap>Notes</Cap>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            placeholder="Condition, before/after observations, special instructions…"
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
        </Box>

        <Box>
          <Cap>Photos {editingId ? '(adds to existing)' : ''}</Cap>
          <p style={{ fontSize: 12, color: C.muted, margin: '0 0 10px' }}>
            Compressed automatically before upload. JPG/PNG/WebP.
          </p>
          <input ref={fileRef} type="file" accept="image/*" multiple capture="environment"
            onChange={onPick} style={{ fontSize: 13, marginBottom: photos.length ? 12 : 0 }} />
          {photos.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(84px,1fr))', gap: 8 }}>
              {photos.map((p, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={p.previewUrl} alt="" style={{ width: '100%', height: 84, objectFit: 'cover', borderRadius: 8, border: `1px solid ${C.border}` }} />
                  <button onClick={() => removePhoto(i)} type="button" aria-label="Remove"
                    style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%', border: 'none', background: '#b91c1c', color: '#fff', cursor: 'pointer', fontSize: 13, lineHeight: '22px' }}>×</button>
                </div>
              ))}
            </div>
          )}
        </Box>

        {error && (
          <div style={{ background: '#fde8e8', border: '1px solid #f5b5b5', color: '#b91c1c', borderRadius: 10, padding: 12, fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}
        {result && (
          <div style={{ background: '#e7f6ec', border: `1px solid ${C.border}`, color: C.dark, borderRadius: 10, padding: 12, fontSize: 13, marginBottom: 12 }}>
            ✓ {result.msg}
            {result.orderStatus && <div style={{ marginTop: 4, color: C.muted }}>Order status auto-updated to “{result.orderStatus}”.</div>}
          </div>
        )}

        <Btn onClick={save} disabled={busy}>{busy ? (progress || 'Working…') : (editingId ? 'Update Card' : 'Save Card to Notion')}</Btn>

        {/* ── Recent cards (reopen / edit) ── */}
        <div style={{ marginTop: 18 }}>
          <Cap>Recent Cards</Cap>
          {refs.cards.length === 0 ? (
            <div style={{ fontSize: 13, color: C.muted }}>No cards yet.</div>
          ) : refs.cards.map((c) => (
            <div key={c.id} onClick={() => loadCard(c)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: C.white, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: '10px 12px', marginBottom: 8, cursor: 'pointer',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{c.name}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{c.photoCount} photo{c.photoCount === 1 ? '' : 's'}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.green, border: `1px solid ${C.border}`, borderRadius: 999, padding: '3px 10px' }}>{c.status || '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Error boundary (mirrors the waiver app) ──────────────────────────────────
class Boundary extends Component {
  state = { err: null };
  static getDerivedStateFromError(e) { return { err: e.message || 'Unknown error' }; }
  render() {
    if (this.state.err) return (
      <div style={{ padding: 32, fontFamily: 'Georgia,serif', color: C.text, background: C.bg, minHeight: '100vh' }}>
        <div style={{ height: 4, background: `linear-gradient(90deg,${C.green},${C.dark})`, marginBottom: 24 }} />
        <div style={{ fontSize: 18, fontWeight: 700, color: C.dark, marginBottom: 8 }}>Something went wrong</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>{this.state.err}</div>
        <button onClick={() => this.setState({ err: null })}
          style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer' }}>
          Try again
        </button>
      </div>
    );
    return this.props.children;
  }
}

export default function App() {
  return <Boundary><Capture /></Boundary>;
}
