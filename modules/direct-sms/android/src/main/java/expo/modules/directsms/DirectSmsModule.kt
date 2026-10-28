package expo.modules.directsms

import android.content.Context
import android.hardware.camera2.CameraManager
import android.os.Build
import android.telephony.SmsManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DirectSmsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DirectSms")

    AsyncFunction("sendDirectSms") { phoneNumber: String, message: String ->
      try {
        val cleanPhone = phoneNumber.replace(Regex("[^0-9+*#]"), "")
        if (cleanPhone.isEmpty()) {
          return@AsyncFunction false
        }

        val smsManager: SmsManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
          appContext.reactContext?.getSystemService(SmsManager::class.java) ?: SmsManager.getDefault()
        } else {
          @Suppress("DEPRECATION")
          SmsManager.getDefault()
        }

        val parts = smsManager.divideMessage(message)
        if (parts.size > 1) {
          smsManager.sendMultipartTextMessage(cleanPhone, null, parts, null, null)
        } else {
          smsManager.sendTextMessage(cleanPhone, null, message, null, null)
        }
        true
      } catch (e: Exception) {
        android.util.Log.e("DirectSms", "Failed to send background SMS", e)
        false
      }
    }

    AsyncFunction("setTorchMode") { enabled: Boolean ->
      try {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
          val context = appContext.reactContext ?: return@AsyncFunction false
          val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as? CameraManager
            ?: return@AsyncFunction false
          val cameraId = cameraManager.cameraIdList.firstOrNull() ?: return@AsyncFunction false
          cameraManager.setTorchMode(cameraId, enabled)
          true
        } else {
          false
        }
      } catch (e: Exception) {
        android.util.Log.e("DirectSms", "Failed to toggle torch mode", e)
        false
      }
    }
  }
}

