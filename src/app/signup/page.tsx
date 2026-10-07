'use client';

import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';


import { createClient } from '@/lib/supabase/client';

interface Country {
  name: string;
  dial_code: string;
  code: string;
  flag: string;
}

const SignupPage = () => {
  const { t } = useTranslation('common');
  // const router = useRouter();
  const supabase = createClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState<string>('Benin');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const countryData: Country[] = [
    { name: 'Benin', dial_code: '+229', code: 'BJ', flag: '/flags/bj.png' },
    { name: 'Burkina Faso', dial_code: '+226', code: 'BF', flag: '/flags/bf.png' },
    { name: 'Cape Verde', dial_code: '+238', code: 'CV', flag: '/flags/cv.png' },
    { name: "Côte d'Ivoire", dial_code: '+225', code: 'CI', flag: '/flags/ci.png' },
    { name: 'Gambia', dial_code: '+220', code: 'GM', flag: '/flags/gm.png' },
    { name: 'Ghana', dial_code: '+233', code: 'GH', flag: '/flags/gh.png' },
    { name: 'Guinea', dial_code: '+224', code: 'GN', flag: '/flags/gn.png' },
    { name: 'Guinea-Bissau', dial_code: '+245', code: 'GW', flag: '/flags/gw.png' },
    { name: 'Liberia', dial_code: '+231', code: 'LR', flag: '/flags/lr.png' },
    { name: 'Mali', dial_code: '+223', code: 'ML', flag: '/flags/ml.png' },
    { name: 'Niger', dial_code: '+227', code: 'NE', flag: '/flags/ne.png' },
    { name: 'Nigeria', dial_code: '+234', code: 'NG', flag: '/flags/ng.png' },
    { name: 'Senegal', dial_code: '+221', code: 'SN', flag: '/flags/sn.png' },
    { name: 'Sierra Leone', dial_code: '+232', code: 'SL', flag: '/flags/sl.png' },
    { name: 'Togo', dial_code: '+228', code: 'TG', flag: '/flags/tg.png' }
  ];

  const getCountryDetails = (countryName: string) =>
    countryData.find((country) => country.name === countryName);

 
const handleEmailSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  const countryDetails = getCountryDetails(country);

  if (!countryDetails) {
    return setError(t('signup.errors.invalid_country'));
  }

  let normalizedPhoneNumber = phoneNumber.replace(/\s+/g, '');

  if (!normalizedPhoneNumber.startsWith(countryDetails.dial_code)) {
    normalizedPhoneNumber = `${countryDetails.dial_code}${normalizedPhoneNumber}`;
  }

  const phoneRegex = /^\+\d{1,4}\d{6,}$/;

  if (!phoneRegex.test(normalizedPhoneNumber)) {
    return setError(t('signup.errors.invalid_phone'));
  }

  try {
    const { error: authError } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/login`,
    data: {
      first_name: firstName,
      last_name: lastName,
      occupation,
      gender,
      phone_number: normalizedPhoneNumber,
      country,
    },
  },
});

    if (authError) {
      const errorMessage = authError.message.toLowerCase();

      if (
        authError.code === 'user_already_exists' ||
        errorMessage.includes('already registered') ||
        errorMessage.includes('already exists')
      ) {
        setError(t('signup.errors.email_in_use'));
      } else {
        setError(authError.message);
      }

      return;
    }

    setVerificationSent(true);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred.';

    setError(
      t('signup.errors.unknown', {
        message,
      })
    );
  }
};

  if (verificationSent) {
  return (
    <div className="bg-[var(--yellow)] min-h-screen flex flex-col">
      {/* <Navbar /> */}

      <div className="flex-grow flex items-center justify-center px-5 py-10">
        <div className="bg-[var(--medium-green)] w-full max-w-lg rounded-lg p-8 text-center shadow-lg">
          <div className="flex justify-center mb-5">
            <Image
              src="/logo.png"
              alt="EcoAgris logo"
              width={60}
              height={60}
            />
          </div>

          <h1 className="text-[var(--white)] text-2xl sm:text-3xl font-bold mb-4">
            Verify Your Email
          </h1>

          <p className="text-[var(--white)] text-sm sm:text-base leading-relaxed mb-4">
            Your ECOAGRIS account has been created successfully.
          </p>

          <p className="text-[var(--yellow)] text-sm sm:text-base font-medium leading-relaxed mb-6">
            We have sent a verification link to your email address.
            Please check your inbox and click the link to verify your account.
          </p>

          <p className="text-[var(--white)]/80 text-sm mb-6">
            If you do not see the email, please check your spam or junk folder.
          </p>

          <Link
            href="/login"
            className="inline-block bg-[var(--wine)] hover:bg-[var(--yellow)] text-[var(--white)] px-6 py-3 rounded-lg font-medium transition-all duration-300"
          >
            Go to Login
          </Link>
        </div>
      </div>

      {/* <Footer /> */}
    </div>
  );
}

return (
  <div className="bg-[var(--yellow)] min-h-screen flex flex-col">
      {/* <Navbar /> */}
      <div className="flex-grow">
        <div className="bg-[var(--medium-green)] grid grid-cols-1 sm:grid-cols-2 w-[90%] max-w-5xl mx-auto mt-10 mb-10 px-5 py-4 rounded-lg">
          
          {/* Left side */}
          <div
            className="relative rounded-lg p-10 bg-cover bg-center"
            style={{ backgroundImage: "url('/sign.jpg')" }}
          >
            <span className="absolute inset-0 bg-black/20 z-0 rounded-lg"></span>
            <div className="relative z-10">
              <div className="flex items-center justify-start gap-2 mb-7">
                <Image src="/logo.png" alt="EcoAgris logo" width={40} height={40} />
                <h1 className="font-bold text-[var(--white)] text-[17px] sm:text-[20px]">EcoAgris</h1>
              </div>
              <div className="flex flex-col leading-none">
                <h1 className="text-[var(--white)] text-[40px] sm:text-[60px] font-semibold">{t('signup.hello')}</h1>
                <h1 className="text-[var(--yellow)] text-[40px] sm:text-[60px] font-bold">{t('signup.welcome')}</h1>
              </div>
              <div className="mt-7">
                <h3 className="bg-[var(--olive-green)] px-4 py-3 rounded-lg text-[var(--white)] text-[12px] sm:text-[15px] font-medium">
                  {t('signup.welcome_text')}
                </h3>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="ml-0 sm:ml-5 p-6 rounded-lg">
            <form onSubmit={handleEmailSignup} className="space-y-4">
              {/* First and Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label htmlFor="firstName" className="sr-only">{t('signup.first_name')}</label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    placeholder={t('signup.first_name')}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="text-[var(--olive-green)] bg-[var(--white)] p-2 rounded-lg border border-[var(--medium-green)] focus:ring-2 focus:ring-[var(--yellow)] outline-none w-full"
                    required
                    aria-label={t('signup.first_name')}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="sr-only">{t('signup.last_name')}</label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    placeholder={t('signup.last_name')}
                    onChange={(e) => setLastName(e.target.value)}
                    className="text-[var(--olive-green)] bg-[var(--white)] p-2 rounded-lg border border-[var(--medium-green)] focus:ring-2 focus:ring-[var(--yellow)] outline-none w-full"
                    required
                    aria-label={t('signup.last_name')}
                  />
                </div>
              </div>

              {/* Occupation and Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label htmlFor="occupation" className="sr-only">{t('signup.occupation')}</label>
                  <input
                    id="occupation"
                    type="text"
                    value={occupation}
                    placeholder={t('signup.occupation')}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="text-[var(--olive-green)] bg-[var(--white)] p-2 rounded-lg border border-[var(--medium-green)] focus:ring-2 focus:ring-[var(--yellow)] outline-none w-full"
                    required
                    aria-label={t('signup.occupation')}
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="sr-only">{t('signup.gender')}</label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="text-[var(--olive-green)] bg-[var(--white)] p-2 rounded-lg border border-[var(--medium-green)] focus:ring-2 focus:ring-[var(--yellow)] outline-none w-full"
                    required
                    aria-label={t('signup.gender')}
                  >
                    <option value="">{t('signup.select_gender')}</option>
                    <option value="Male">{t('signup.male')}</option>
                    <option value="Female">{t('signup.female')}</option>
                    <option value="Other">{t('signup.other')}</option>
                  </select>
                </div>
              </div>

              {/* Phone Number and Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label htmlFor="phoneNumber" className="sr-only">{t('signup.phone_number')}</label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    placeholder={t('signup.phone_number')}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="text-[var(--olive-green)] bg-[var(--white)] p-2 rounded-lg border border-[var(--medium-green)] focus:ring-2 focus:ring-[var(--yellow)] outline-none w-full mt-7"
                    required
                    aria-label={t('signup.phone_number')}
                  />
                </div>

                <div className="relative">
                  <label htmlFor="country" className="block text-[12px] sm:text-[15px] text-[var(--white)] mb-1">
                    {t('signup.select_country')}
                  </label>
                  <div
                    className="text-[var(--olive-green)] bg-[var(--white)] p-2 rounded-lg border border-[var(--medium-green)] focus:ring-2 focus:ring-[var(--yellow)] outline-none cursor-pointer flex items-center gap-2"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    role="button"
                    aria-label={`Select country, current: ${country}`}
                    tabIndex={0}
                  >
                    <Image
                      src={getCountryDetails(country)?.flag || '/flags/bj.png'}
                      alt={`${country} flag`}
                      width={20}
                      height={20}
                      className="inline-block"
                    />
                    <span>{country}</span>
                  </div>
                  {isDropdownOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-[var(--white)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {countryData.map((option) => (
                        <div
                          key={option.code}
                          className="flex items-center gap-2 p-2 hover:bg-[var(--yellow)]/50 cursor-pointer text-[var(--olive-green)]"
                          onClick={() => {
                            setCountry(option.name);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <Image src={option.flag} alt={`${option.name} flag`} width={20} height={20} className="inline-block" />
                          <span>{option.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="sr-only">{t('signup.email')}</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  placeholder={t('signup.email')}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-[var(--olive-green)] bg-[var(--white)] p-2 rounded-lg border border-[var(--medium-green)] focus:ring-2 focus:ring-[var(--yellow)] outline-none w-full"
                  required
                  aria-label={t('signup.email')}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="sr-only">{t('signup.password')}</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  placeholder={t('signup.password')}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-[var(--olive-green)] bg-[var(--white)] p-2 rounded-lg border border-[var(--medium-green)] focus:ring-2 focus:ring-[var(--yellow)] outline-none w-full"
                  required
                  aria-label={t('signup.password')}
                />
              </div>

              {/* Error & Submit */}
              <div className="mt-4">
                {error && (
                  <p className="text-red-500 text-sm" role="alert">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="bg-[var(--wine)] hover:bg-[var(--yellow)] text-[var(--white)] px-3 py-2 w-full rounded-lg font-medium transition-all duration-300 ease-in-out focus:ring-2 focus:ring-[var(--yellow)] outline-none cursor-pointer"
                  aria-label="Sign Up"
                >
                  {t('signup.signup_button')}
                </button>
              </div>

              {/* Login Link */}
              <p className="text-[var(--white)] text-[15px] mt-4 text-center">
                {t('signup.already_account')}{' '}
                <Link className="text-[var(--yellow)] hover:underline font-medium" href="/login">
                  {t('signup.login_link')}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default SignupPage;
