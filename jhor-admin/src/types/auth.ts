export interface AuthCredentials {
  username: string
  password: string
}

export interface AuthSession {
  token: string
  tokenType: string
  expiresAt: string
  username: string
}

export interface AuthCredentialUpdateResponse {
  id: string
  username: string
}
