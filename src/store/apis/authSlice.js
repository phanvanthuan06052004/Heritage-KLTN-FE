import { apiSlice } from './apiSlice'

const unwrapData = (response) => response?.data ?? response

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signUp: builder.mutation({
      query: (data) => ({
        url: '/auth/signup',
        method: 'POST',
        body: data,
      }),
      transformResponse: unwrapData,
    }),
    signIn: builder.mutation({
      query: (data) => ({
        url: '/auth/signin',
        method: 'POST',
        body: data,
      }),
      transformResponse: unwrapData,
    }),
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: data,
      }),
      transformResponse: unwrapData,
    }),
    resendOtp: builder.mutation({
      query: (data) => ({
        url: '/auth/resend-otp',
        method: 'POST',
        body: data,
      }),
      transformResponse: unwrapData,
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
      transformResponse: unwrapData,
    }),
    verifyForgotPasswordOtp: builder.mutation({
      query: (data) => ({
        url: '/auth/verify-forgot-password-otp',
        method: 'POST',
        body: data,
      }),
      transformResponse: unwrapData,
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
      transformResponse: unwrapData,
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data,
      }),
      transformResponse: unwrapData,
    }),
    refreshToken: builder.mutation({
      query: (data) => ({
        url: '/auth/refresh-token',
        method: 'POST',
        body: data,
      }),
      transformResponse: unwrapData,
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      transformResponse: unwrapData,
    }),
    metaMaskChallenge: builder.mutation({
      query: (data) => ({
        url: '/auth/metamask/challenge',
        method: 'POST',
        body: data,
      }),
      transformResponse: unwrapData,
    }),
    metaMaskSignIn: builder.mutation({
      query: (data) => ({
        url: '/auth/metamask/signin',
        method: 'POST',
        body: data,
      }),
      transformResponse: unwrapData,
    }),
    linkWallet: builder.mutation({
      query: (data) => ({
        url: '/auth/metamask/link',
        method: 'POST',
        body: data,
      }),
      transformResponse: unwrapData,
    }),
    verifyLinkWallet: builder.mutation({
      query: (data) => ({
        url: '/auth/metamask/verify-link',
        method: 'POST',
        body: data,
      }),
      transformResponse: unwrapData,
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
