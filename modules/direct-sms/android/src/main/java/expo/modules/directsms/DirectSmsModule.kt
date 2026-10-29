package expo.modules.directsms

import android.app.Activity
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.hardware.camera2.CameraManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.telephony.SmsManager
import androidx.core.content.ContextCompat
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.atomic.AtomicBoolean

class DirectSmsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DirectSms")

    AsyncFunction("sendDirectSms") { phoneNumber: String, message: String, promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.resolve(false)
        return@AsyncFunction
      }

      val cleanPhone = phoneNumber.replace(Regex("[^0-9+*#]"), "")
      if (cleanPhone.isEmpty()) {
        promise.resolve(false)
        return@AsyncFunction
      }

      if (ContextCompat.checkSelfPermission(context, android.Manifest.permission.SEND_SMS)
          != PackageManager.PERMISSION_GRANTED) {
        android.util.Log.e("DirectSms", "SEND_SMS permission not granted at runtime")
        promise.resolve(false)
        return@AsyncFunction
      }

      try {
        val smsManager: SmsManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
          context.getSystemService(SmsManager::class.java) ?: SmsManager.getDefault()
        } else {
          @Suppress("DEPRECATION")
          SmsManager.getDefault()
        }

        val actionSent = "${context.packageName}.DIRECT_SMS_SENT_${System.currentTimeMillis()}"
        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
          PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
        } else {
          PendingIntent.FLAG_ONE_SHOT
        }

        val sentIntent = PendingIntent.getBroadcast(
          context,
          0,
          Intent(actionSent).setPackage(context.packageName),
          flags
        )

        val hasResolved = AtomicBoolean(false)
        val handler = Handler(Looper.getMainLooper())

        val receiver = object : BroadcastReceiver() {
          override fun onReceive(c: Context?, intent: Intent?) {
            try {
              context.unregisterReceiver(this)
            } catch (_: Exception) {}

            if (hasResolved.compareAndSet(false, true)) {
              val success = (resultCode == Activity.RESULT_OK)
              promise.resolve(success)
            }
          }
        }

        val timeoutRunnable = Runnable {
          try {
            context.unregisterReceiver(receiver)
          } catch (_: Exception) {}

          if (hasResolved.compareAndSet(false, true)) {
            promise.resolve(false)
          }
        }
        handler.postDelayed(timeoutRunnable, 10000L)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
          context.registerReceiver(receiver, IntentFilter(actionSent), Context.RECEIVER_NOT_EXPORTED)
        } else {
          context.registerReceiver(receiver, IntentFilter(actionSent))
        }

        val parts = smsManager.divideMessage(message)
        if (parts.size > 1) {
          val sentIntents = ArrayList<PendingIntent>()
          for (i in parts.indices) {
            sentIntents.add(
              if (i == parts.size - 1) sentIntent
              else PendingIntent.getBroadcast(context, i + 1, Intent(actionSent).setPackage(context.packageName), flags)
            )
          }
          smsManager.sendMultipartTextMessage(cleanPhone, null, parts, sentIntents, null)
        } else {
          smsManager.sendTextMessage(cleanPhone, null, message, sentIntent, null)
        }
      } catch (e: Exception) {
        android.util.Log.e("DirectSms", "Failed to send SMS: ${e.message}", e)
        promise.resolve(false)
      }
    }

    AsyncFunction("setTorchNative") { enabled: Boolean ->
      setTorchInternal(enabled)
    }

    AsyncFunction("setTorchMode") { enabled: Boolean ->
      setTorchInternal(enabled)
    }
  }

  private fun setTorchInternal(enabled: Boolean): Boolean {
    val context = appContext.reactContext ?: return false
    val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as? CameraManager
      ?: return false

    return try {
      val cameraId = cameraManager.cameraIdList.firstOrNull { id ->
        val characteristics = cameraManager.getCameraCharacteristics(id)
        characteristics.get(android.hardware.camera2.CameraCharacteristics.FLASH_INFO_AVAILABLE) == true
      } ?: "0"

      cameraManager.setTorchMode(cameraId, enabled)
      true
    } catch (e: Exception) {
      android.util.Log.e("DirectSms", "setTorch failed: ${e.message}", e)
      false
    }
  }
}
