import { apiSlice } from './apiSlice'

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signUp: builder.mutation({
      query: (data) => ({
        url: '/auth/signup',
        method: 'POST',
        body: data,
      }),
    }),
    signIn: builder.mutation({
      query: (data) => ({
        url: '/auth/signin',
        method: 'POST',
        body: data,
      }),
    }),
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: data,
      }),
    }),
    resendOtp: builder.mutation({
      query: (data) => ({
        url: '/auth/resend-otp',
        method: 'POST',
        body: data,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    verifyForgotPasswordOtp: builder.mutation({
      query: (data) => ({
        url: '/auth/verify-forgot-password-otp',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data,
      }),
    }),
    refreshToken: builder.mutation({
      query: (data) => ({
        url: '/auth/refresh-token',
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    metaMaskChallenge: builder.mutation({
      query: (data) => ({
        url: '/auth/metamask/challenge',
        method: 'POST',
        body: data,
      }),
    }),
    metaMaskSignIn: builder.mutation({
      query: (data) => ({
        url: '/auth/metamask/signin',
        method: 'POST',
        body: data,
      }),
    }),
    linkWallet: builder.mutation({
      query: (data) => ({
        url: '/auth/metamask/link',
        method: 'POST',
        body: data,
      }),
    }),
    verifyLinkWallet: builder.mutation({
      query: (data) => ({
        url: '/auth/metamask/verify-link',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const {
  useSignUpMutation,
  useSignInMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useForgotPasswordMutation,
  useVerifyForgotPasswordOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useMetaMaskChallengeMutation,
  useMetaMaskSignInMutation,
  useLinkWalletMutation,
  useVerifyLinkWalletMutation,
} = authApiSlice
