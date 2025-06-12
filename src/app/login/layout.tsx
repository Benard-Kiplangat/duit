import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Duit app - Login page",
  description: "A revolutionary system to how you handle your to-do tasks",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
        {children}
    </div>
  );
}
