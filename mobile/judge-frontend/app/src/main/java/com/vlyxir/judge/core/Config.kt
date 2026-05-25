package com.vlyxir.judge.core

object Config {
    // API Base URLs
    const val REMOTE_URL = "https://code-judge-6fm6.vercel.app"
    const val LOCAL_URL = "http://10.0.2.2:5000" // Use 10.0.2.2 for Android Emulator to reach localhost
    
    var BASE_URL = REMOTE_URL

    // Supabase Configuration
    const val SUPABASE_URL = "YOUR_SUPABASE_URL"
    const val SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY"
}
