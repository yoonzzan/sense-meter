// components/Auth.tsx
import React from 'react';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabaseClient';
import SenseMeterIcon from './icons/SenseMeterIcon';

const AuthComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
            <SenseMeterIcon />
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
            <SupabaseAuth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#FF6B00',
                      brandAccent: '#E66000',
                    },
                  },
                },
              }}
              providers={[]}
              localization={{
                variables: {
                    sign_up: {
                        email_label: "이메일 주소",
                        password_label: "비밀번호",
                        button_label: "회원가입",
                        social_provider_text: "{{provider}}로 계속하기",
                        link_text: "계정이 없으신가요? 회원가입",
                        confirmation_text: "가입 확인을 위해 이메일의 링크를 확인해주세요."
                    },
                    sign_in: {
                        email_label: "이메일 주소",
                        password_label: "비밀번호",
                        button_label: "로그인",
                        social_provider_text: "{{provider}}로 계속하기",
                        link_text: "이미 계정이 있으신가요? 로그인"
                    },
                    forgotten_password: {
                        email_label: "이메일 주소",
                        password_label: "비밀번호",
                        button_label: "비밀번호 재설정 링크 보내기",
                        link_text: "비밀번호를 잊으셨나요?",
                        confirmation_text: "비밀번호 재설정을 위해 이메일의 링크를 확인해주세요."
                    },
                }
              }}
            />
        </div>
      </div>
    </div>
  );
};

export default AuthComponent;
