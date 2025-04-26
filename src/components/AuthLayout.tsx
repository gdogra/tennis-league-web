// src/components/AuthLayout.tsx
import Head from "next/head";

export default function AuthLayout({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Head>
        <title>{title ? `${title} — Tennis League` : "Tennis League"}</title>
      </Head>
      <div className="max-w-md w-full bg-white p-6 rounded shadow">
        {children}
      </div>
    </div>
  );
}
