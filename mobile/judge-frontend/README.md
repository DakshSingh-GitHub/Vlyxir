# Vlyxir Judge Mobile

This is the mobile frontend for the Vlyxir Code Judge, built with Kotlin and Jetpack Compose.

## Features
- **Problem List**: Browse through available coding challenges.
- **Problem Viewer**: Read problem descriptions with Markdown support.
- **Code Editor**: A simple code editor with syntax highlighting (planned) and monospaced font.
- **Test & Submit**: Run your code against sample test cases and submit for final judging.
- **Submissions History**: View your past performance.

## Tech Stack
- **Language**: Kotlin
- **UI Framework**: Jetpack Compose
- **Navigation**: Compose Navigation
- **Networking**: Retrofit & Gson
- **Database/Auth**: Supabase (Integration in progress)
- **Markdown**: Compose-Markdown

## Getting Started
1. Open this folder (`mobile/judge-frontend`) in Android Studio.
2. Sync the project with Gradle files.
3. Run the `app` module on an emulator or physical device.

## Project Structure
- `data/api`: API interface and networking setup.
- `data/models`: Data classes for Problems, Submissions, etc.
- `ui/screens`: Main Compose screens.
- `ui/viewmodels`: ViewModel logic for data handling.
- `ui/theme`: Material3 theme configuration.
