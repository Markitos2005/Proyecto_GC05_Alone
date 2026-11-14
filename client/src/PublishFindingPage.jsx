import { useEffect, useRef, useState } from 'react';
import { getHallazgoOptions, publishHallazgo } from './api/hallazgos.js';

// Mismos límites que el servidor (SCRUM-49 / SCRUM-105).
const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const TEXT_MAX = 2000;
const IMAGE_TYPES = ['image/jpeg', 'image/png'];

function today() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

const empty = () => ({
  facultadId: '', categoriaId: '', descripcion: '', fechaHallazgo: today(),
  latitud: '', longitud: '', puntoEntrega: '', rasgosPrivados: '',
});

const length = (text) => [...text].length;

function coordinate(value, limit) {
  if (value.trim() === '') return null;
  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number) <= limit ? number : null;
}

/** US-008-AC-07: valida antes de enviar; el servidor vuelve a validarlo todo. */
function validate(form, files) {
  const errors = {};
  if (!form.facultadId) errors.facultadId = 'Selecciona la facultad donde se entregará el objeto.';
  if (!form.categoriaId) errors.categoriaId = 'Selecciona una categoría.';
  if (!form.descripcion.trim()) errors.descripcion = 'Describe el objeto encontrado.';
  else if (length(form.descripcion.trim()) > TEXT_MAX) errors.descripcion = `No puede superar los ${TEXT_MAX} caracteres.`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.fechaHallazgo)) errors.fechaHallazgo = 'Indica la fecha del hallazgo.';
  else if (form.fechaHallazgo > today()) errors.fechaHallazgo = 'La fecha no puede ser futura.';
  if (coordinate(form.latitud, 90) === null) errors.latitud = 'Introduce una latitud entre -90 y 90.';
  if (coordinate(form.longitud, 180) === null) errors.longitud = 'Introduce una longitud entre -180 y 180.';
  for (const field of ['puntoEntrega', 'rasgosPrivados']) {
    if (length(form[field]) > TEXT_MAX) errors[field] = `No puede superar los ${TEXT_MAX} caracteres.`;
  }
  if (files.length < 1 || files.length > MAX_IMAGES) errors.imagenes = 'Adjunta entre 1 y 5 fotos.';
  else if (files.some(file => !IMAGE_TYPES.includes(file.type))) errors.imagenes = 'Solo se admiten fotos JPG o PNG.';
  else if (files.some(file => !file.size || file.size > MAX_IMAGE_BYTES)) errors.imagenes = 'Cada foto debe ocupar como máximo 5 MiB.';
  return errors;
}

const size = (bytes) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);

/** SCRUM-103 / US-008 · Publicar un hallazgo. Cualquier usuario autenticado puede publicar. */
export function PublishFindingPage() {
  const [options, setOptions] = useState(null);
  const [status, setStatus] = useState('loading');
  const [form, setForm] = useState(empty);
  const [files, setFiles] = useState([]);
  const [fileInput, setFileInput] = useState(0);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: '', ok: false, login: false });
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const busy = useRef(false);
  const feedback = useRef(null);

  useEffect(() => {
    getHallazgoOptions()
      .then(data => { setOptions({ facultades: data?.facultades ?? [], categorias: data?.categorias ?? [] }); setStatus('ready'); })
      .catch(error => { setStatus(error.status === 401 ? 'unauthenticated' : 'error'); setMessage({ text: error.message, ok: false, login: false }); });
  }, []);

  useEffect(() => {
    if (message.text) feedback.current?.focus();
  }, [message]);

  const change = field => event => setForm(current => ({ ...current, [field]: event.target.value }));

  function locate() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm(current => ({ ...current, latitud: coords.latitude.toFixed(6), longitud: coords.longitude.toFixed(6) }));
        setLocating(false);
      },
      () => {
        setErrors(current => ({ ...current, latitud: 'No se ha podido obtener tu ubicación. Introduce las coordenadas a mano.' }));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function submit(event) {
    event.preventDefault();
    if (busy.current) return;
    setErrors({});
    setMessage({ text: '', ok: false, login: false });

    const validationErrors = validate(form, files);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setMessage({ text: 'Revisa los datos introducidos.', ok: false, login: false });
      return;
    }

    busy.current = true;
    setSaving(true);
    try {
      const data = await publishHallazgo({
        ...form, descripcion: form.descripcion.trim(),
        latitud: Number(form.latitud), longitud: Number(form.longitud),
      }, files);
      setForm(empty());
      setFiles([]);
      setFileInput(key => key + 1);
      setMessage({ text: data?.message || 'Hallazgo publicado correctamente.', ok: true, login: false });
    } catch (error) {
      setErrors(error.errors || {});
      setMessage({ text: error.message, ok: false, login: error.status === 401 });
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  const describedBy = (name, help) => [help && `hallazgo-${name}-help`, errors[name] && `hallazgo-${name}-error`].filter(Boolean).join(' ') || undefined;
  const fieldError = name => errors[name] && <p id={`hallazgo-${name}-error`} className="error">{errors[name]}</p>;
  const common = name => ({
    id: `hallazgo-${name}`, name, value: form[name], onChange: change(name), disabled: saving,
    'aria-invalid': Boolean(errors[name]),
  });

  const feedbackLine = <p ref={feedback} role="status" aria-live="polite" tabIndex="-1" className={message.ok ? 'success' : 'error'}>
    {message.text}{message.login && <> <a href="#inicio-sesion">Iniciar sesión</a></>}
  </p>;

  let content;
  if (status === 'loading') content = <p role="status">Cargando el formulario…</p>;
  else if (status === 'unauthenticated') content = <p className="error">Debes iniciar sesión para publicar un hallazgo. <a href="#inicio-sesion">Iniciar sesión</a></p>;
  else if (status === 'error') content = feedbackLine;
  else if (!options.facultades.length || !options.categorias.length) {
    content = <p className="error">Todavía no hay facultades o categorías disponibles, así que no se puede publicar. Avisa a la administración.</p>;
  } else {
    content = <form onSubmit={submit} aria-busy={saving} noValidate>
      <label htmlFor="hallazgo-facultadId">Facultad donde se entregará</label>
      <select {...common('facultadId')} aria-describedby={describedBy('facultadId')}>
        <option value="">Selecciona una facultad</option>
        {options.facultades.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
      </select>
      {fieldError('facultadId')}

      <label htmlFor="hallazgo-categoriaId">Categoría</label>
      <select {...common('categoriaId')} aria-describedby={describedBy('categoriaId')}>
        <option value="">Selecciona una categoría</option>
        {options.categorias.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
      </select>
      {fieldError('categoriaId')}

      <label htmlFor="hallazgo-descripcion">Descripción pública</label>
      <textarea {...common('descripcion')} rows={4} maxLength={TEXT_MAX} aria-describedby={describedBy('descripcion', true)} />
      <p id="hallazgo-descripcion-help" className="help">Visible para todos. No incluyas datos que solo conozca el propietario.</p>
      {fieldError('descripcion')}

      <label htmlFor="hallazgo-fechaHallazgo">Fecha del hallazgo</label>
      <input {...common('fechaHallazgo')} type="date" max={today()} aria-describedby={describedBy('fechaHallazgo')} />
      {fieldError('fechaHallazgo')}

      <fieldset className="coordinates" aria-describedby="hallazgo-ubicacion-help">
        <legend>Ubicación donde se encontró</legend>
        <p id="hallazgo-ubicacion-help" className="help">Coordenadas en grados decimales, por ejemplo 39.4789 y -6.3424.</p>
        <div className="coordinate-fields">
          <div>
            <label htmlFor="hallazgo-latitud">Latitud</label>
            <input {...common('latitud')} type="number" inputMode="decimal" step="any" min={-90} max={90} aria-describedby={describedBy('latitud')} />
            {fieldError('latitud')}
          </div>
          <div>
            <label htmlFor="hallazgo-longitud">Longitud</label>
            <input {...common('longitud')} type="number" inputMode="decimal" step="any" min={-180} max={180} aria-describedby={describedBy('longitud')} />
            {fieldError('longitud')}
          </div>
        </div>
        {'geolocation' in navigator && <button type="button" className="secondary" onClick={locate} disabled={saving || locating}>
          {locating ? 'Obteniendo ubicación…' : 'Usar mi ubicación actual'}
        </button>}
      </fieldset>

      <label htmlFor="hallazgo-puntoEntrega">Punto de entrega (opcional)</label>
      <input {...common('puntoEntrega')} type="text" maxLength={TEXT_MAX} aria-describedby={describedBy('puntoEntrega', true)} />
      <p id="hallazgo-puntoEntrega-help" className="help">Por ejemplo, la conserjería donde se ha dejado el objeto.</p>
      {fieldError('puntoEntrega')}

      <label htmlFor="hallazgo-rasgosPrivados">Rasgos identificativos privados (opcional)</label>
      <textarea {...common('rasgosPrivados')} rows={3} maxLength={TEXT_MAX} aria-describedby={describedBy('rasgosPrivados', true)} />
      <p id="hallazgo-rasgosPrivados-help" className="help">No se mostrarán en el listado público. Sirven para comprobar que quien lo reclama es el propietario.</p>
      {fieldError('rasgosPrivados')}

      <label htmlFor="hallazgo-imagenes">Fotos</label>
      <input key={fileInput} id="hallazgo-imagenes" name="imagenes" type="file" accept="image/jpeg,image/png" multiple
        disabled={saving} onChange={event => setFiles([...event.target.files])}
        aria-invalid={Boolean(errors.imagenes)} aria-describedby={describedBy('imagenes', true)} />
      <p id="hallazgo-imagenes-help" className="help">De 1 a 5 fotos JPG o PNG, de 5 MiB como máximo cada una. Se eliminan sus metadatos, como la ubicación GPS.</p>
      {files.length > 0 && <ul className="file-list" aria-label="Fotos seleccionadas">
        {files.map((file, index) => <li key={`${index}-${file.name}`}>{file.name} · {size(file.size)}</li>)}
      </ul>}
      {fieldError('imagenes')}

      <div className="actions">
        <button type="submit" disabled={saving}>{saving ? 'Publicando…' : 'Publicar hallazgo'}</button>
      </div>
    </form>;
  }

  return <main className="publish-finding">
    <header>
      <a className="brand" href="#app">Lost&Found UEx</a>
      <p><a href="#app">Volver al inicio</a></p>
    </header>
    <section className="card" aria-labelledby="publish-title">
      <h1 id="publish-title">Publicar un hallazgo</h1>
      <p className="help">Los campos sin «opcional» son obligatorios.</p>
      {content}
      {status === 'ready' && feedbackLine}
    </section>
  </main>;
}
