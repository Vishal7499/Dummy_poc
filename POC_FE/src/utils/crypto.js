import CryptoJS from 'crypto-js'

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY_ENC || ''

export function encryptData(data) {
  try {
    if (!SECRET_KEY) {
      throw new Error('VITE_SECRET_KEY_ENC environment variable is not set. Make sure you have restarted your dev server after creating the .env file.')
    }

    // Convert data to JSON string (matching backend behavior)
    const jsonData = JSON.stringify(data)
    
    // Parse the key as UTF-8 (matching backend behavior)
    const key = CryptoJS.enc.Utf8.parse(SECRET_KEY)
    
    // Encrypt using AES with ECB mode and PKCS7 padding (matching backend)
    const encrypted = CryptoJS.AES.encrypt(jsonData, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })
    
    // Return base64-encoded string (matching backend behavior)
    return encrypted.toString()
  } catch (error) {
    console.error('Encryption error details:', error)
    throw new Error('Failed to encrypt data: ' + error.message)
  }
}

export function decryptData(encryptedData) {
  try {
    console.log('Decrypting data. Key present:', !!SECRET_KEY, 'Key length:', SECRET_KEY?.length)
    console.log('Encrypted data length:', encryptedData?.length)
    
    if (!SECRET_KEY) {
      throw new Error('VITE_SECRET_KEY_ENC environment variable is not set. Make sure you have restarted your dev server after creating the .env file.')
    }

    if (!encryptedData || typeof encryptedData !== 'string') {
      throw new Error('Invalid encrypted data format')
    }

    // The backend uses AES with ECB mode and PKCS7 padding
    // The key should be parsed as UTF-8
    const key = CryptoJS.enc.Utf8.parse(SECRET_KEY)
    
    // The encrypted data comes as base64 string from the backend
    // CryptoJS.AES.decrypt expects base64 encoded ciphertext
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)
    
    console.log('Decrypted text length:', decryptedText?.length)
    console.log('Decrypted text preview:', decryptedText?.substring(0, 100))
    
    if (!decryptedText) {
      console.error('Decryption result is empty. This usually means:')
      console.error('1. The encryption key doesn\'t match between frontend and backend')
      console.error('2. The encrypted data format is incorrect')
      console.error('3. The key length is incorrect (should be 16, 24, or 32 bytes for AES-128, AES-192, or AES-256)')
      throw new Error('Decryption failed - empty result. Check if the encryption key matches between frontend and backend.')
    }

    const parsed = JSON.parse(decryptedText)
    console.log('Successfully decrypted and parsed JSON')
    return parsed
  } catch (error) {
    console.error('Decryption error details:', error)
    if (error.message.includes('Malformed UTF-8')) {
      throw new Error('Decryption failed: The encryption key may not match between frontend and backend, or the data format is incorrect.')
    }
    throw new Error('Failed to decrypt response: ' + error.message)
  }
}

