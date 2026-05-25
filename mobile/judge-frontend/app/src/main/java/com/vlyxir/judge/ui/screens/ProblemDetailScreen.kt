package com.vlyxir.judge.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import dev.jeziellago.compose.markdown.MarkdownText

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProblemDetailScreen(problemId: String, onBack: () -> Unit) {
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("Description", "Code", "Submissions")

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Problem #$problemId") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding)) {
            TabRow(selectedTabIndex = selectedTab) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = { Text(title) }
                    )
                }
            }
            when (selectedTab) {
                0 -> ProblemDescriptionTab(problemId)
                1 -> CodeEditorTab(problemId)
                2 -> SubmissionsTab(problemId)
            }
        }
    }
}

@Composable
fun ProblemDescriptionTab(problemId: String) {
    Column(modifier = Modifier.padding(16.dp)) {
        MarkdownText(
            markdown = """
                # Problem Title
                
                This is the problem description for problem $problemId.
                
                ### Constraints
                - 1 <= n <= 100
            """.trimIndent()
        )
    }
}

@Composable
fun CodeEditorTab(problemId: String) {
    var code by remember { mutableStateOf("# Write your code here") }
    Column(modifier = Modifier.padding(16.dp).fillMaxSize()) {
        TextField(
            value = code,
            onValueChange = { code = it },
            modifier = Modifier.fillMaxWidth().weight(1f),
            textStyle = LocalTextStyle.current.copy(fontFamily = FontFamily.Monospace),
            label = { Text("Code") }
        )
        Row(modifier = Modifier.padding(vertical = 8.dp).fillMaxWidth()) {
            Button(onClick = { /* Test */ }, modifier = Modifier.weight(1f).padding(end = 4.dp)) {
                Text("Test")
            }
            Button(onClick = { /* Submit */ }, modifier = Modifier.weight(1f).padding(start = 4.dp)) {
                Text("Submit")
            }
        }
    }
}

@Composable
fun SubmissionsTab(problemId: String) {
    Text("Submissions for problem $problemId", modifier = Modifier.padding(16.dp))
}
