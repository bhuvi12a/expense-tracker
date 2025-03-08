import ResetPassword from './reset-password';
import Navbar from '../Components/Navbar';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your password',
};

export default function ResetPasswordPage() {
  return (
    <>
      <Navbar />
      <ResetPassword />
    </>
  );
} 