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
    console.log('[DECRYPT] Starting decryption process...')
    console.log('[DECRYPT] Key present:', !!SECRET_KEY, 'Key length:', SECRET_KEY?.length)
    console.log('[DECRYPT] Encrypted data type:', typeof encryptedData)
    console.log('[DECRYPT] Encrypted data length:', encryptedData?.length)
    console.log('[DECRYPT] Encrypted data (first 100 chars):', encryptedData?.substring(0, 100))
    
    if (!SECRET_KEY) {
      throw new Error('VITE_SECRET_KEY_ENC environment variable is not set. Make sure you have restarted your dev server after creating the .env file.')
    }

    if (!encryptedData || typeof encryptedData !== 'string') {
      throw new Error('Invalid encrypted data format')
    }

    // The backend uses AES with ECB mode and PKCS7 padding
    // The key should be parsed as UTF-8
    const key = CryptoJS.enc.Utf8.parse(SECRET_KEY)
    console.log('[DECRYPT] Key parsed successfully, key length:', key.sigBytes)
    
    // The encrypted data comes as base64 string from the backend
    // CryptoJS.AES.decrypt expects base64 encoded ciphertext
    console.log('[DECRYPT] Attempting AES decryption with ECB mode and PKCS7 padding...')
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)
    
    console.log('[DECRYPT] Decrypted text length:', decryptedText?.length)
    console.log('[DECRYPT] Decrypted text preview:', decryptedText?.substring(0, 100))
    
    if (!decryptedText || decryptedText.length === 0) {
      console.error('[DECRYPT ERROR] Decryption result is empty. This usually means:')
      console.error('1. The encryption key doesn\'t match between frontend and backend')
      console.error('2. The encrypted data format is incorrect')
      console.error('3. The key length is incorrect (should be 16, 24, or 32 bytes for AES-128, AES-192, or AES-256)')
      console.error('[DECRYPT ERROR] Frontend key (first 10 chars):', SECRET_KEY?.substring(0, 10))
      console.error('[DECRYPT ERROR] Encrypted data (hex preview):', CryptoJS.enc.Base64.parse(encryptedData).toString().substring(0, 50))
      throw new Error('Decryption failed - empty result. Check if the encryption key matches between frontend and backend.')
    }

    console.log('[DECRYPT] Attempting to parse decrypted text as JSON...')
    const parsed = JSON.parse(decryptedText)
    console.log('[DECRYPT] Successfully decrypted and parsed JSON')
    return parsed
  } catch (error) {
    console.error('[DECRYPT ERROR] Decryption error details:', error)
    console.error('[DECRYPT ERROR] Error name:', error.name)
    console.error('[DECRYPT ERROR] Error message:', error.message)
    if (error.message.includes('Malformed UTF-8') || error.message.includes('Unexpected token')) {
      throw new Error('Decryption failed: The encryption key may not match between frontend and backend, or the data format is incorrect.')
    }
    if (error.message.includes('JSON')) {
      throw new Error('Decryption succeeded but failed to parse JSON. The encryption key may not match.')
    }
    throw new Error('Failed to decrypt response: ' + error.message)
  }
}

