import type { Metadata } from "next"
import SignUpClient from "./SignUpClient"

export const metadata: Metadata = {
  title: "Get Started",
  description: "Create your free Nairaly account and join a community of curious Nigerian readers and writers.",
  robots: { index: false, follow: false },
}

export default function SignUpPage() {
  return <SignUpClient />
}