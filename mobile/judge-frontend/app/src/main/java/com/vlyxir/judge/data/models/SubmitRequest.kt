package com.vlyxir.judge.data.models

import com.google.gson.annotations.SerializedName

data class SubmitRequest(
    @SerializedName("problem_id") val problemId: String,
    val code: String,
    @SerializedName("test_only") val testOnly: Boolean = false
)
