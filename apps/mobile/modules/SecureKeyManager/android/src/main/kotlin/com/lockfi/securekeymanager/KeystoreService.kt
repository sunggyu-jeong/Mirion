package com.lockfi.securekeymanager

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.KeyStore
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

internal class KeystoreService(context: Context) {
  private val keyStore: KeyStore by lazy {
    KeyStore.getInstance(KEYSTORE_PROVIDER).apply { load(null) }
  }
  private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  fun hasKey(keyId: String): Boolean =
    prefs.contains(keyId) && keyStore.containsAlias(keyAlias(keyId))

  fun generateAndStore(keyId: String): Boolean {
    val alias = keyAlias(keyId)
    ensureKeystoreKey(alias)
    val privateKeyBytes = ByteArray(32).also { SecureRandom().nextBytes(it) }
    return try {
      val encoded = encrypt(alias, privateKeyBytes)
      prefs.edit().putString(keyId, encoded).commit()
    } finally {
      privateKeyBytes.fill(0)
    }
  }

  fun retrieve(keyId: String): String? {
    val alias = keyAlias(keyId)
    val encoded = prefs.getString(keyId, null) ?: return null
    val decrypted = decrypt(alias, encoded)
    return try {
      decrypted.joinToString("") { "%02x".format(it) }
    } finally {
      decrypted.fill(0)
    }
  }

  fun storeData(keyId: String, data: String): Boolean {
    val alias = keyAlias(keyId)
    ensureKeystoreKey(alias)
    val dataBytes = data.toByteArray(Charsets.UTF_8)
    return try {
      val encoded = encrypt(alias, dataBytes)
      prefs.edit().putString(keyId, encoded).commit()
    } finally {
      dataBytes.fill(0)
    }
  }

  fun retrieveData(keyId: String): String? {
    val alias = keyAlias(keyId)
    val encoded = prefs.getString(keyId, null) ?: return null
    return try {
      val decrypted = decrypt(alias, encoded)
      String(decrypted, Charsets.UTF_8)
    } catch (_: Exception) {
      null
    }
  }

  fun delete(keyId: String): Boolean {
    val alias = keyAlias(keyId)
    prefs.edit().remove(keyId).commit()
    if (keyStore.containsAlias(alias)) keyStore.deleteEntry(alias)
    return true
  }

  private fun ensureKeystoreKey(alias: String) {
    if (keyStore.containsAlias(alias)) return
    val spec = KeyGenParameterSpec.Builder(
      alias,
      KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
    )
      .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
      .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
      .setKeySize(256)
      .setUserAuthenticationRequired(true)
      .setUserAuthenticationValidityDurationSeconds(30)
      .build()
    KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, KEYSTORE_PROVIDER)
      .apply { init(spec) }
      .generateKey()
  }

  private fun encrypt(alias: String, data: ByteArray): String {
    val secretKey = keyStore.getKey(alias, null) as SecretKey
    val cipher = Cipher.getInstance(CIPHER_TRANSFORMATION).apply {
      init(Cipher.ENCRYPT_MODE, secretKey)
    }
    val ciphertext = cipher.doFinal(data)
    val combined = cipher.iv + ciphertext
    return Base64.encodeToString(combined, Base64.NO_WRAP)
  }

  private fun decrypt(alias: String, encoded: String): ByteArray {
    val combined = Base64.decode(encoded, Base64.NO_WRAP)
    val iv = combined.copyOfRange(0, GCM_IV_LENGTH)
    val ciphertext = combined.copyOfRange(GCM_IV_LENGTH, combined.size)
    val secretKey = keyStore.getKey(alias, null) as SecretKey
    return Cipher.getInstance(CIPHER_TRANSFORMATION).apply {
      init(Cipher.DECRYPT_MODE, secretKey, GCMParameterSpec(GCM_TAG_LENGTH, iv))
    }.doFinal(ciphertext)
  }

  private fun keyAlias(keyId: String) = "${KEY_ALIAS_PREFIX}${keyId}"

  companion object {
    private const val KEYSTORE_PROVIDER = "AndroidKeyStore"
    private const val PREFS_NAME = "lockfi_secure_prefs"
    private const val KEY_ALIAS_PREFIX = "lockfi_wallet_"
    private const val CIPHER_TRANSFORMATION = "AES/GCM/NoPadding"
    private const val GCM_IV_LENGTH = 12
    private const val GCM_TAG_LENGTH = 128
  }
}
