import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'

interface UserProfile {
  profile_image?: string
  username: string
  description?: string
  role?: string
}

interface ProfileContextType {
  userProfile: UserProfile | null
  updateProfileImage: (newImage: string) => void
  refreshProfile: () => Promise<void>
  profileImageKey: number
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}

interface ProfileProviderProps {
  children: ReactNode
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileImageKey, setProfileImageKey] = useState(0)

  useEffect(() => {
    if (user?.username) {
      refreshProfile()
    } else {
      setUserProfile(null)
    }
  }, [user])

  const refreshProfile = async () => {
    if (!user?.username) return

    try {
      const response = await axios.get(`/api/get-profile?username=${user.username}&t=${Date.now()}`)
      setUserProfile(response.data)
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
    }
  }

  const updateProfileImage = (newImage: string) => {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        profile_image: newImage
      })
      setProfileImageKey(prev => prev + 1)
    }
  }

  const value: ProfileContextType = {
    userProfile,
    updateProfileImage,
    refreshProfile,
    profileImageKey
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}
