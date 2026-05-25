package com.vlyxir.judge.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.vlyxir.judge.data.models.Problem

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProblemListScreen(onProblemClick: (String) -> Unit) {
    // Mock data
    val problems = listOf(
        Problem("1", "Two Sum", "Find two numbers that add up to a target.", "Easy"),
        Problem("2", "Reverse Integer", "Reverse digits of an integer.", "Medium"),
        Problem("3", "Longest Common Prefix", "Find the longest common prefix string.", "Easy")
    )

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Problems") })
        }
    ) { padding ->
        LazyColumn(modifier = Modifier.padding(padding)) {
            items(problems) { problem ->
                ProblemItem(problem = problem, onClick = { onProblemClick(problem.id) })
            }
        }
    }
}

@Composable
fun ProblemItem(problem: Problem, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
            .clickable { onClick() }
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = problem.title, style = MaterialTheme.typography.titleMedium)
            Text(text = problem.difficulty ?: "Unknown", style = MaterialTheme.typography.bodySmall)
        }
    }
}
