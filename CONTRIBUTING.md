# Contributing to Quanta

First off, thank you for considering contributing to Quanta. It's people like you that make open source such a great community.

### How Can I Contribute?

* **Reporting Bugs:** If you find a bug, please create an issue in the repository. Describe the bug in detail and, if possible, provide steps to reproduce it.

* **Suggesting Enhancements:** If you have an idea for a new feature or an improvement to an existing one, create an issue to discuss it.

* **Pull Requests:** We welcome pull requests for bug fixes and new features.

### Pull Request Process

We follow a standard "fork and pull" model for contributions. Here's a quick guide:

1. **Fork the Repository:** Start by forking the main Quanta repository to your own GitHub account.

2. **Create a Branch:** For any new feature or bug fix, create a new branch in your forked repository with a descriptive name.
    ```
    git checkout -b feature/amazing-new-feature
    ```
3. **Make Your Changes:** Make your code changes, ensuring you follow the project's coding style.

4. **Run Tests:** Before submitting, please ensure all tests pass.
    ```
    docker compose run --rm backend pytest
    ```

5. **Submit a Pull Request:** Push your branch to your fork and open a pull request to the `main` branch of the Quanta repository. Please provide a clear title and a detailed description of the changes you've made.

6. **Code Review:** One of the project maintainers will review your pull request. We may suggest some changes or improvements. Once the pull request is approved, it will be merged.