// Jozi Nites calling card. Copy this file into every app you build so the signature stays identical.
export default function SignatureFooter() {
  return (
    <footer className="signature">
      <span>
        Built in Johannesburg by <strong>Jozi Nites</strong>
      </span>
      <span>&copy; {new Date().getFullYear()} TASKit</span>
    </footer>
  );
}
