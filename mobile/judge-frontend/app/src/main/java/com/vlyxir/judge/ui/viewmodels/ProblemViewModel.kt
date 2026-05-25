package com.vlyxir.judge.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vlyxir.judge.data.models.Problem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ProblemViewModel : ViewModel() {
    private val _problems = MutableStateFlow<List<Problem>>(emptyList())
    val problems: StateFlow<List<Problem>> = _problems

    private val _currentProblem = MutableStateFlow<Problem?>(null)
    val currentProblem: StateFlow<Problem?> = _currentProblem

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    init {
        loadProblems()
    }

    fun loadProblems() {
        viewModelScope.launch {
            _isLoading.value = true
            // In a real app, call the API here
            // Mocking for now
            _problems.value = listOf(
                Problem("1", "Two Sum", "Find two numbers that add up to a target.", "Easy"),
                Problem("2", "Reverse Integer", "Reverse digits of an integer.", "Medium"),
                Problem("3", "Longest Common Prefix", "Find the longest common prefix string.", "Easy")
            )
            _isLoading.value = false
        }
    }

    fun loadProblem(id: String) {
        viewModelScope.launch {
            _isLoading.value = true
            // Mocking
            _currentProblem.value = _problems.value.find { it.id == id }
            _isLoading.value = false
        }
    }
}
