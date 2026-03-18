package com.lockfi.securekeymanager

import android.content.Context
import android.content.SharedPreferences
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.junit.MockitoJUnitRunner

/**
 * Unit tests for KeystoreService covering paths that don't touch AndroidKeyStore.
 *
 * Tests requiring AndroidKeyStore (generateAndStore, retrieve with stored data,
 * hasKey with existing entry) must run as instrumented tests or with Robolectric,
 * because "AndroidKeyStore" is only available on a real Android device/emulator.
 */
@RunWith(MockitoJUnitRunner::class)
class KeystoreServiceTest {

  @Mock private lateinit var mockContext: Context
  @Mock private lateinit var mockPrefs: SharedPreferences
  @Mock private lateinit var mockEditor: SharedPreferences.Editor

  @Before
  fun setUp() {
    `when`(mockContext.getSharedPreferences(any(), anyInt())).thenReturn(mockPrefs)
    `when`(mockPrefs.edit()).thenReturn(mockEditor)
    `when`(mockEditor.remove(any())).thenReturn(mockEditor)
    `when`(mockEditor.commit()).thenReturn(true)
  }

  // prefs.contains == false → short-circuit: keyStore.containsAlias never called
  @Test
  fun `hasKey returns false when prefs does not contain keyId`() {
    `when`(mockPrefs.contains("wallet-1")).thenReturn(false)
    val service = KeystoreService(mockContext)
    assertFalse(service.hasKey("wallet-1"))
    verify(mockPrefs).contains("wallet-1")
  }

  // prefs.getString == null → early return: keyStore decrypt never called
  @Test
  fun `retrieve returns null when prefs has no entry`() {
    `when`(mockPrefs.getString("wallet-1", null)).thenReturn(null)
    val service = KeystoreService(mockContext)
    assertNull(service.retrieve("wallet-1"))
  }

  // prefs is always cleared; keyStore.containsAlias may throw in non-Android env
  @Test
  fun `delete always clears prefs entry`() {
    val service = KeystoreService(mockContext)
    try {
      service.delete("wallet-1")
    } catch (_: Exception) {
      // keyStore lazy init throws KeyStoreException in non-Android JVM — expected
    }
    verify(mockEditor).remove("wallet-1")
    verify(mockEditor).commit()
  }
}
