package com.vlyxir.judge.data.api

import com.vlyxir.judge.data.models.Problem
import com.vlyxir.judge.data.models.SubmitRequest
import com.vlyxir.judge.data.models.SubmitResponse
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path

interface JudgeApi {
    @GET("problems")
    async fun getProblems(): List<Problem>

    @GET("problems/{id}")
    async fun getProblemById(@Path("id") id: String): Problem

    @POST("submit")
    async fun submitCode(
        @Body request: SubmitRequest,
        @Header("Authorization") token: String? = null
    ): SubmitResponse
}
