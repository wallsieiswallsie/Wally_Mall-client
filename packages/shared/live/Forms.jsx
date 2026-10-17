import { useRef } from 'react';
import { useState } from 'react';
import { names } from './format.js';
import { displayValue } from './format.js';

function ErrorMessage({ error }) {
  return error ? (
    <p className="w-error" role="alert">
      {error.message}
      {error.requestId && <small>Referensi: {error.requestId}</small>}
    </p>
  ) : null;
}
function Resource({ resource, children, loadingText = "Memuat data…" }) {
  if (resource.loading) return <p role="status">{loadingText}</p>;
  if (resource.error)
    return (
      <>
        <ErrorMessage error={resource.error} />
        <button className="btn btn-outline" onClick={resource.reload}>
          Coba lagi
        </button>
      </>
    );
  return resource.data == null ? null : children(resource.data);
}
function Action({ children, run, onDone, disabled = false }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(null);
  const lock = useRef(false);
  return (
    <span className="live-action">
      <button
        className="btn btn-outline"
        disabled={busy || disabled}
        onClick={async () => {
          if (lock.current) return;
          lock.current = true;
          setBusy(true);
          setError(null);
          try {
            const result = await run();
            onDone?.(result);
          } catch (e) {
            setError(e);
          } finally {
            lock.current = false;
            setBusy(false);
          }
        }}
      >
        {busy ? "Memproses…" : children}
      </button>
      <ErrorMessage error={error} />
    </span>
  );
}
function Form({
  fields,
  submit,
  button = "Simpan",
  onDone,
  children,
  disabled = false,
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(null);
  const lock = useRef(false);
  const [saved, setSaved] = useState(false);
  const unavailable = fields.some(
    (f) => f.options && !f.options.length && !f.optional,
  );
  return (
    <form
      className="form-stack"
      onSubmit={async (e) => {
        e.preventDefault();
        if (lock.current || disabled) return;
        const form = e.currentTarget;
        const values = Object.fromEntries(
          [...new FormData(form)].filter(([, value]) => value !== ""),
        );
        lock.current = true;
        setBusy(true);
        setError(null);
        setSaved(false);
        try {
          const result = await submit(values);
          onDone?.(result);
          setSaved(true);
        } catch (e) {
          setError(e);
        } finally {
          lock.current = false;
          setBusy(false);
        }
      }}
    >
      {fields.map((field) => {
        const f = typeof field === "string" ? { key: field } : field;
        const props = {
          name: f.key,
          required: !f.optional,
          defaultValue: f.value,
          disabled: busy,
        };
        return (
          <label className="field" key={f.key}>
            <span>{f.label || names[f.key] || f.key}</span>
            {f.options ? (
              <select
                className="select"
                {...props}
                {...(f.placeholder ? { defaultValue: f.value ?? "" } : {})}
              >
                {f.placeholder && (
                  <option value="" disabled>
                    {f.placeholder}
                  </option>
                )}
                {f.options.map((option) => (
                  <option
                    key={option.value ?? option}
                    value={option.value ?? option}
                  >
                    {option.label ?? option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="input"
                {...props}
                type={
                  f.type ||
                  (f.key === "password"
                    ? "password"
                    : f.key === "email"
                      ? "email"
                      : "text")
                }
                min={f.min}
                max={f.max}
                minLength={f.key === "password" ? 12 : undefined}
                maxLength={f.key === "password" ? 128 : undefined}
                step={f.step}
                placeholder={f.placeholder}
              />
            )}
          </label>
        );
      })}
      <ErrorMessage error={error} />
      {saved && <p role="status">Berhasil disimpan.</p>}
      {unavailable && (
        <p role="status">Pilihan yang diperlukan belum tersedia.</p>
      )}
      {typeof children === "function" ? children(busy) : children}
      <button
        disabled={busy || unavailable || disabled}
        className="btn btn-primary"
      >
        {busy ? "Memproses…" : button}
      </button>
    </form>
  );
}
function Facts({ row }) {
  return (
    <dl className="w-totals">
      {Object.entries(row || {})
        .filter(
          ([key, value]) =>
            value !== null &&
            typeof value !== "object" &&
            !key.endsWith("_id") &&
            key !== "id" &&
            !["password_hash"].includes(key),
        )
        .map(([key, value]) => (
          <div key={key}>
            <dt>{names[key] || key.replaceAll("_", " ")}</dt>
            <dd>{displayValue(key, value)}</dd>
          </div>
        ))}
    </dl>
  );
}
export { ErrorMessage, Resource, Action, Form, Facts };
