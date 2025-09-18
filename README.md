## Quanta - Personal Finance & Budgeting App
Quanta is a modern, mobile-first application designed to help you take control of your finances. Track your accounts, manage transactions, set budgets, and gain insights into your spending habits with a clean, intuitive interface.

![Screenshot](https://github.com/user-attachments/assets/a8bb7c5f-b96d-4841-8996-c7b3d56097e6)

### Key Features

* **Multi-Account Management:** Track all your bank accounts, credit cards, and cash in one place.
* **Monthly Dashboard:** A clear, visual overview of your financial health for the current month, with the ability to look back at previous months.
* **Transaction Tracking:** Easily add and monitor your transactions.
* **Custom Categories:** Organize your spending with default and user-created categories, complete with custom colors.
* **Budgeting:** Set monthly budgets for different spending categories and track your progress.
* **Recurring Transactions:** Set up passive income and expenses (like subscriptions or salary) to be automatically recorded.
* **CSV Import/Export:** Seamlessly import your transaction history or export your data.

### Tech Stack

* **Backend:** Django, Django REST Framework, PostgreSQL
* **Frontend:** React Native (Expo)
* **Development & CI/CD:** Docker, GitHub Actions

### Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

#### Prerequisites

* **Docker & Docker Compose:** For running the backend services. [Install Docker](https://docs.docker.com/get-docker/)
* **Node.js & npm:** For running the frontend application. [Install Node.js](https://nodejs.org/)
* **Python & venv** (Optional): If you prefer to run the backend locally.

#### Setup & Installation

1.  **Clone the repository:**
    ```
    git clone https://github.com/Parsa-SadeghiAsl/Quanta.git
    cd Quanta
    ```

2.  **Create the Environment File:**
    Create a `.env` file in the project root by copying the example file. This file stores your secret keys and database credentials.
    ```
    cp .env.example .env
    ```
    *Open the `.env` file and fill in the required variables.*

3.  **Build and Run the Backend (Docker):**
    This command will start the Django API server and the PostgreSQL database.
    ```
    docker compose up --build
    ```

4.  **Run the Frontend:**
    In a separate terminal, navigate to the `frontend` directory, install the dependencies, and start the Expo development server.
    ```
    cd frontend
    npm install
    npx expo start
    ```
    You can then run the app on an Android or iOS simulator, or on your physical device using the Expo Go app.

#### Setup Python Virtual Environment:

1. **Create a virtual environment:**
    ```
    # In the root directory 
    cd ./backend
    python3 -m venv venv
    ```
2. **Activate virtual environment:**
    ```
    # In Linux and MACos:
    source ./venv/bin/activate

    # In Windows:
    venv\Scripts\activate.bat
    ```
3. **Instal dependencies:**
    ```
    pip install -r requirements.txt
    ```
    *Now you can locally develop and run the server*

### Running Tests

To run the backend tests and linters, use the following Docker command from the project root:
```
docker compose run --rm backend pytest
```

### Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**. Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
