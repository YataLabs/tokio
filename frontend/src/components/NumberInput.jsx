/**
 * Text input that displays thousand-separated numbers (id-ID locale).
 * `value` prop: raw numeric string (no separators).
 * `onChange` fires with raw numeric string.
 */
export default function NumberInput({ value, onChange, className = "", ...props }) {
  function format(raw) {
    const digits = raw.replace(/[^\d]/g, "");
    if (!digits) return "";
    return parseInt(digits, 10).toLocaleString("id-ID");
  }

  function handleChange(e) {
    const digits = e.target.value.replace(/[^\d]/g, "");
    onChange(digits);
  }

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      value={format(value)}
      onChange={handleChange}
      className={className}
    />
  );
}
