package com.vlyxir.judge

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.vlyxir.judge.ui.screens.ProblemListScreen
import com.vlyxir.judge.ui.screens.ProblemDetailScreen
import com.vlyxir.judge.ui.theme.VlyxirJudgeTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            VlyxirJudgeTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    NavHost(navController = navController, startDestination = "problemList") {
                        composable("problemList") {
                            ProblemListScreen(
                                onProblemClick = { problemId ->
                                    navController.navigate("problemDetail/$problemId")
                                }
                            )
                        }
                        composable("problemDetail/{problemId}") { backStackEntry ->
                            val problemId = backStackEntry.arguments?.getString("problemId") ?: ""
                            ProblemDetailScreen(
                                problemId = problemId,
                                onBack = { navController.popBackStack() }
                            )
                        }
                    }
                }
            }
        }
    }
}
