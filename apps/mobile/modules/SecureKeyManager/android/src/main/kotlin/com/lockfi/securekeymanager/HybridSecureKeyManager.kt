package com.lockfi.securekeymanager

import android.app.Application
import com.margelo.nitro.com.lockfi.securekeymanager.HybridSecureKeyManagerSpec
import com.margelo.nitro.com.lockfi.securekeymanager.Variant_NullType_String
import com.margelo.nitro.core.NullType
import com.margelo.nitro.core.Promise

class HybridSecureKeyManager : HybridSecureKeyManagerSpec() {
  private val keystoreService: KeystoreService by lazy {
    KeystoreService(requireAppContext())
  }

  override fun hasPrivateKey(keyId: String): Boolean =
    keystoreService.hasKey(keyId)

  override fun deletePrivateKey(keyId: String): Boolean =
    keystoreService.delete(keyId)

  override fun generateAndStorePrivateKey(keyId: String): Promise<Boolean> =
    Promise.async { keystoreService.generateAndStore(keyId) }

  override fun retrievePrivateKey(keyId: String): Promise<Variant_NullType_String> =
    Promise.async {
      val hex = keystoreService.retrieve(keyId)
      if (hex != null) Variant_NullType_String.create(hex)
      else Variant_NullType_String.create(NullType.NULL)
    }

  override fun storeData(keyId: String, data: String): Promise<Boolean> =
    Promise.async { keystoreService.storeData(keyId, data) }

  override fun retrieveData(keyId: String): Promise<Variant_NullType_String> =
    Promise.async {
      val str = keystoreService.retrieveData(keyId)
      if (str != null) Variant_NullType_String.create(str)
      else Variant_NullType_String.create(NullType.NULL)
    }

  companion object {
    @Volatile
    private var appContext: Application? = null

    fun initialize(app: Application) {
      appContext = app
    }

    private fun requireAppContext(): Application =
      appContext
        ?: error("HybridSecureKeyManager.initialize(application) must be called before use")
  }
}
