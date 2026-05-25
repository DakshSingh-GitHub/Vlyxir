package com.vlyxir.judge.data.models

data class Submission(
    val id: String,
    val problemId: String,
    val problemTitle: String,
    val code: String,
    val finalStatus: String,
    val passed: Int,
    val total: Int,
    val duration: Float
)
