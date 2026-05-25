package com.vlyxir.judge.data.models

data class Problem(
    val id: String,
    val title: String,
    val description: String,
    val difficulty: String? = null,
    val inputFormat: String? = null,
    val outputFormat: String? = null,
    val sampleTestCases: List<SampleTestCase>? = null,
    val constraints: String? = null
)

data class SampleTestCase(
    val input: String,
    val output: String
)
