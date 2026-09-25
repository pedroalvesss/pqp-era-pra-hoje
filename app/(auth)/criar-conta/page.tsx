import type { Metadata } from "next";
import { RegisterForm } from "./_components/RegisterForm";

export const metadata: Metadata = { title: "criar conta · pqp, era pra hoje?" };

export default function RegisterPage() {
  return <RegisterForm />;
}
