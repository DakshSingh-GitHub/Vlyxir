package com.vlyxir.judge.data.models

import com.google.gson.annotations.SerializedName

data class SubmitResponse(
    @SerializedName("problem_id") val problemId: String,
    @SerializedName("final_status") val finalStatus: String,
    @SerializedName("total_duration") val totalDuration: Float,
    val summary: Summary,
    @SerializedName("test_case_results") val testCaseResults: List<TestCaseResult>
)

data class Summary(
    val passed: Int,
    val total: Int
)

data class TestCaseResult(
    @SerializedName("test_case") val testCase: Int,
    val status: String,
    val input: String? = null,
    @SerializedName("actual_output") val actualOutput: String? = null,
    @SerializedName("expected_output") val expectedOutput: String? = null,
    val error: String? = null,
    val duration: Float? = null
)
