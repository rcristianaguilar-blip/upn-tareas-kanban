import { useState } from 'react';

export default function LogoUPN({ className = '' }) {
  const [failed, setFailed] = useState(false);
  const logoSrc = `${import.meta.env.BASE_URL}upn-logo.png`;

  if (failed) {
    return (
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-md border border-upn-yellow bg-upn-yellow text-sm font-black text-upn-black ${className}`}
        aria-label="UPN"
      >
        UPN
      </div>
    );
  }

  return (
    <img
      src={logoSrc}
      alt="Logo UPN"
      className={`h-10 w-10 rounded-md object-contain ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
