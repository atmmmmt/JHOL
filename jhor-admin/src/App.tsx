import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CredentialsDialog } from './components/credentials-dialog'
import { LoginScreen } from './components/login-screen'
import { DashboardPage } from './pages/dashboard-page'
import {
  AUTH_UNAUTHORIZED_EVENT,
  clearStoredAuthSession,
  getStoredAuthSession,
  login,
  updateAuthCredentials,
  updateStoredAuthUsername,
} from './lib/content-api'
import type { AuthSession } from './types/auth'

type LoginStatus = 'idle' | 'submitting' | 'error'
type CredentialsStatus = 'idle' | 'saving' | 'success' | 'error'

function App() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(() =>
    getStoredAuthSession(),
  )
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('idle')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginNotice, setLoginNotice] = useState<string | null>(null)
  const [isCredentialsOpen, setCredentialsOpen] = useState(false)
  const [credentialsStatus, setCredentialsStatus] =
    useState<CredentialsStatus>('idle')
  const [credentialsMessage, setCredentialsMessage] = useState<string | null>(null)

  useEffect(() => {
    function handleUnauthorized() {
      setAuthSession(null)
      setCredentialsOpen(false)
      setCredentialsStatus('idle')
      setCredentialsMessage(null)
      setLoginStatus('idle')
      setLoginError(null)
      setLoginNotice('انتهت الجلسة الحالية. سجل الدخول مرة أخرى للمتابعة.')
    }

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)

    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
    }
  }, [])

  useEffect(() => {
    if (!isCredentialsOpen || credentialsStatus !== 'success') {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setCredentialsOpen(false)
      setCredentialsStatus('idle')
      setCredentialsMessage(null)
    }, 1100)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isCredentialsOpen, credentialsStatus])

  async function handleLogin(credentials: {
    username: string
    password: string
  }) {
    setLoginStatus('submitting')
    setLoginError(null)
    setLoginNotice(null)

    try {
      const nextSession = await login(credentials)
      setAuthSession(nextSession)
      setLoginStatus('idle')
    } catch (error) {
      setLoginStatus('error')
      setLoginError(
        error instanceof Error
          ? error.message
          : 'تعذر تسجيل الدخول. حاول مرة أخرى.',
      )
    }
  }

  function handleLogout() {
    clearStoredAuthSession()
    setAuthSession(null)
    setCredentialsOpen(false)
    setCredentialsStatus('idle')
    setCredentialsMessage(null)
    setLoginStatus('idle')
    setLoginError(null)
    setLoginNotice('تم تسجيل الخروج بنجاح.')
  }

  function handleOpenCredentials() {
    setCredentialsOpen(true)
    setCredentialsStatus('idle')
    setCredentialsMessage(null)
  }

  function handleCloseCredentials() {
    if (credentialsStatus === 'saving') {
      return
    }

    setCredentialsOpen(false)
    setCredentialsStatus('idle')
    setCredentialsMessage(null)
  }

  async function handleUpdateCredentials(credentials: {
    username: string
    password: string
  }) {
    setCredentialsStatus('saving')
    setCredentialsMessage(null)

    try {
      const updatedAccount = await updateAuthCredentials(credentials)

      updateStoredAuthUsername(updatedAccount.username)
      setAuthSession((currentSession) =>
        currentSession
          ? {
              ...currentSession,
              username: updatedAccount.username,
            }
          : currentSession,
      )
      setCredentialsStatus('success')
      setCredentialsMessage('تم تحديث اسم المستخدم وكلمة المرور بنجاح.')
    } catch (error) {
      setCredentialsStatus('error')
      setCredentialsMessage(
        error instanceof Error
          ? error.message
          : 'تعذر تحديث بيانات الدخول الحالية.',
      )
    }
  }

  if (!authSession) {
    return (
      <LoginScreen
        status={loginStatus}
        error={loginError}
        notice={loginNotice}
        onSubmit={handleLogin}
      />
    )
  }

  const dashboardElement = (
    <DashboardPage
      username={authSession.username}
      onLogout={handleLogout}
      onOpenCredentials={handleOpenCredentials}
    />
  )

  const settingsElement = (
    <DashboardPage
      username={authSession.username}
      onLogout={handleLogout}
      onOpenCredentials={handleOpenCredentials}
      settingsMode
    />
  )

  const videosElement = (
    <DashboardPage
      username={authSession.username}
      onLogout={handleLogout}
      onOpenCredentials={handleOpenCredentials}
      videosMode
    />
  )

  const packagesElement = (
    <DashboardPage
      username={authSession.username}
      onLogout={handleLogout}
      onOpenCredentials={handleOpenCredentials}
      packagesMode
    />
  )

  const sectorsElement = (
    <DashboardPage
      username={authSession.username}
      onLogout={handleLogout}
      onOpenCredentials={handleOpenCredentials}
      sectorsMode
    />
  )

  const sliderCardsElement = (
    <DashboardPage
      username={authSession.username}
      onLogout={handleLogout}
      onOpenCredentials={handleOpenCredentials}
      sliderCardsMode
    />
  )

  const heroElement = (
    <DashboardPage
      username={authSession.username}
      onLogout={handleLogout}
      onOpenCredentials={handleOpenCredentials}
      heroMode
    />
  )

  const ordersElement = (
    <DashboardPage
      username={authSession.username}
      onLogout={handleLogout}
      onOpenCredentials={handleOpenCredentials}
      ordersMode
      authToken={authSession.token}
    />
  )

  const briefsElement = (
    <DashboardPage
      username={authSession.username}
      onLogout={handleLogout}
      onOpenCredentials={handleOpenCredentials}
      briefsMode
      authToken={authSession.token}
    />
  )

  const seoElement = (
    <DashboardPage
      username={authSession.username}
      onLogout={handleLogout}
      onOpenCredentials={handleOpenCredentials}
      seoMode
    />
  )

  return (
    <>
      <Routes>
        <Route path="/" element={dashboardElement} />
        <Route path="/settings" element={settingsElement} />
        <Route path="/videos" element={videosElement} />
        <Route path="/packages" element={packagesElement} />
        <Route path="/sectors" element={sectorsElement} />
        <Route path="/slider-cards" element={sliderCardsElement} />
        <Route path="/hero" element={heroElement} />
        <Route path="/orders" element={ordersElement} />
        <Route path="/briefs" element={briefsElement} />
        <Route path="/seo" element={seoElement} />
        <Route path="/content/:contentId" element={dashboardElement} />
        <Route
          path="/content/:contentId/project/:projectId"
          element={dashboardElement}
        />
        <Route
          path="/content/:contentId/gallery-item/:galleryItemId"
          element={dashboardElement}
        />
        <Route path="/content/:contentId/slide/:slideId" element={dashboardElement} />
        <Route path="/content/:contentId/post/:postId" element={dashboardElement} />
        <Route
          path="/content/:contentId/service/:serviceId"
          element={dashboardElement}
        />
        <Route
          path="/content/:contentId/package/:packageId"
          element={dashboardElement}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {isCredentialsOpen ? (
        <CredentialsDialog
          key={authSession.username}
          isOpen={isCredentialsOpen}
          currentUsername={authSession.username}
          status={credentialsStatus}
          message={credentialsMessage}
          onClose={handleCloseCredentials}
          onSubmit={handleUpdateCredentials}
        />
      ) : null}
    </>
  )
}

export default App
