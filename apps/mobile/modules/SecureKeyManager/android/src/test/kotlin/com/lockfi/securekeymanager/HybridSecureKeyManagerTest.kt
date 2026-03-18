package com.lockfi.securekeymanager

import android.app.Application
import android.content.Context
import android.content.SharedPreferences
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.junit.MockitoJUnitRunner

@RunWith(MockitoJUnitRunner::class)
class HybridSecureKeyManagerTest {

  @Mock private lateinit var mockApp: Application
  @Mock private lateinit var mockPrefs: SharedPreferences

  @Before
  fun setUp() {
    `when`(mockApp.getSharedPreferences(any(), anyInt())).thenReturn(mockPrefs)
    HybridSecureKeyManager.initialize(mockApp)
  }

  @Test
  fun `initialize sets app context without throwing`() {
    assertDoesNotThrow { HybridSecureKeyManager.initialize(mockApp) }
  }

  @Test
  fun `methods throw IllegalStateException when context is not initialized`() {
    // Companion object fields live on the Companion class, not the outer class.
    // Use companion.javaClass (HybridSecureKeyManager$Companion) to access the field.
    val companion = HybridSecureKeyManager.Companion
    val field = companion.javaClass.getDeclaredField("appContext")
    field.isAccessible = true
    val saved = field.get(companion)
    try {
      field.set(companion, null)
      val manager = HybridSecureKeyManager()
      // keystoreService is `by lazy`; the first method call triggers initialization,
      // which calls requireAppContext() and throws IllegalStateException.
      assertThrows(IllegalStateException::class.java) {
        manager.hasPrivateKey("test-key")
      }
    } finally {
      field.set(companion, saved)
    }
  }

  private fun assertDoesNotThrow(block: () -> Unit) {
    try {
      block()
    } catch (e: Exception) {
      fail("Expected no exception but got: ${e.message}")
    }
  }
}
