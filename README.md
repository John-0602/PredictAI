# PredictAI — Smart Predictive Maintenance & Machine Failure Prediction System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.4+-F7931E.svg?logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57.svg?logo=sqlite&logoColor=white)](https://sqlite.org)

**Course:** 22MDC56 — Machine Learning Laboratory  
**Project:** Predictive Maintenance and Machine Failure Prediction Using Machine Learning  

### Project Development Team
- **John Silva. S** — Register No: `2403717673721023` (Machine Learning & Model Pipeline)
- **John Joeual. C** — Register No: `2403717673721022` (Full-Stack Architecture & API Integration)
- **Darshan. S** — Register No: `2403717673721009` (EDA, Feature Engineering & Documentation)

---

## 1. Project Overview & Research Gap

Industrial manufacturing systems endure continuous mechanical stresses where sudden equipment failure causes catastrophic production downtime, safety hazards, and exorbitant emergency repair expenses.

### The Research Gap
A comprehensive survey of 10 seminal research publications revealed that most existing literature investigates isolated machine learning or deep learning algorithms for anomaly detection, evaluating model accuracy in an academic silo. However, prevailing implementations **fail to combine data preprocessing, exploratory data analysis, multi-algorithm benchmarking, explainable AI (XAI), and deployment into a unified, actionable industrial software system**.

**PredictAI** bridges this research gap by developing an end-to-end predictive maintenance platform utilizing the **AI4I 2020 Predictive Maintenance Dataset** (Stephan Matzka, 2020). The system delivers:
1. Physics-informed feature engineering ($\Delta T$ gradient, motor power in Watts, and tool overstrain).
2. Rigorous multi-algorithm classification benchmark comparing 4 algorithms.
3. Decision transparency via Explainable AI (XAI) feature attributions.
4. An industrial-grade React & FastAPI dashboard with real-time condition-based maintenance task management.

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AI4I 2020 Milling Dataset                       │
│                       (10,000 Records, 14 Features)                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 Physics-Informed Feature Engineering                   │
│   • Temp_difference (ΔT = T_process - T_air)                           │
│   • Power_W (ω × Torque = RPM × 2π/60 × Torque)                        │
│   • Tool_overstrain (Tool Wear × Torque)                               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              Scikit-learn Pipeline & Preprocessing Engine              │
│   • One-Hot Encoding for Machine Types (L, M, H)                       │
│   • StandardScaler for numerical sensors                               │
│   • Stratified 80/20 train/test split (Handling 3.39% class imbalance)│
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌────────────────────────────────────────┐  ┌───────────────────────────┐
│       4 Classification Algorithms      │  │      Explainable AI       │
│  • Gradient Boosting (Best F1: 87.3%)  │  │  • Global Feature Weight  │
│  • Random Forest (99.0% Acc, 98.4% AUC)│  │  • Physical Rule Engine   │
│  • Decision Tree (95.0% Acc)           │  │  • Local Deviation Impact │
│  • Logistic Regression (85.9% Acc)     │  │  • Matzka Failure Modes   │
└───────────────────┬────────────────────┘  └─────────────┬─────────────┘
                    │                                     │
                    └──────────────────┬──────────────────┘
                                       │
                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       FastAPI High-Performance API                     │
│               • Single & Batch CSV Inference Endpoints                 │
│               • SQLite Persistence (`predictai.db`)                    │
└──────────────────────────────────────┬─────────────────────────────────┘
                                       │
                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  PredictAI Modern React 18 Dashboard                   │
│  • Dark Navy Sidebar + Crisp Industrial UI (#0b1329 / #f8fafc)        │
│  • Interactive Recharts (ROC Curves, PR Curves, Histograms)            │
│  • Work Order Planner with CRUD Operations                             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

- **Frontend:**
  - **React 18** with **Vite** build tooling
  - **Tailwind CSS** for responsive industrial styling
  - **Recharts** for interactive charts (ROC curves, histograms, scatter, bar charts)
  - **Lucide React** for icons
- **Backend:**
  - **Python 3.10+ / 3.14** with **FastAPI**
  - **Pandas** & **NumPy** for vector processing
  - **Scikit-learn** for machine learning pipelines
  - **Joblib** for model serialization
  - **Uvicorn** ASGI web server
- **Database:**
  - **SQLite** for prediction history logs, maintenance work orders, and model configurations

---

## 4. Machine Learning Experimental Benchmark Results

Models were evaluated on **2,000 holdout test instances** (68 actual failures, 1,932 normal cycles) using stratified sampling:

| Algorithm | Accuracy | Precision | Recall (Sensitivity) | F1-Score | ROC-AUC | Missed Failures (FN) | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Gradient Boosting** | **99.20%** | **94.83%** | **80.88%** | **0.8730** | **0.9602** | **13** | **Selected Best Model** |
| **Random Forest** | 99.00% | 96.15% | 73.53% | 0.8333 | 0.9839 | 18 | High Precision |
| **Decision Tree** | 95.00% | 38.89% | 82.35% | 0.5283 | 0.8568 | 12 | Interpretable Baseline |
| **Logistic Regression** | 85.85% | 17.91% | 88.24% | 0.2978 | 0.9385 | 8 | Linear Benchmark |

### Why Recall & F1-Score Matter More than Accuracy
In industrial manufacturing, a **False Negative (missed machine failure)** causes sudden catastrophic tool breakage, ruined workpieces, and thousands of dollars in line shutdown costs. A **False Positive** merely triggers a 5-minute visual inspection. Because normal cycles represent 96.61% of records, a naive dummy model predicting 0 for all rows achieves 96.61% accuracy with 0% recall. Therefore, **Gradient Boosting** is selected for production deployment due to its superior F1-score (0.873) and balanced recall.

---

## 5. Physical Failure Mechanisms (Matzka 2020)

PredictAI incorporates domain heuristics from Stephan Matzka (2020):
1. **Tool Wear Failure (TWF):** Cutting tool accumulates critical micro-fractures when active cut time reaches 200–240 minutes.
2. **Heat Dissipation Failure (HDF):** Inadequate convective heat transfer occurs when the thermal gradient ($\Delta T = T_{process} - T_{air}$) drops below **8.6 K** at low spindle airflow velocity ($< 1380\text{ RPM}$).
3. **Power Failure (PWF):** Mechanical spindle power ($P = \omega \times \tau$) exceeds continuous electrical rating ($> 9000\text{ W}$) or causes motor stall ($< 3500\text{ W}$).
4. **Overstrain Failure (OSF):** Product of tool wear and applied torque exceeds material capacity ($> 11,000\text{ min}\cdot\text{Nm}$ for Type L, $> 12,000$ for Type M, $> 13,000$ for Type H).
5. **Random Failure (RNF):** Uncorrelated stochastic baseline failure ($0.1\%$).

---

## 6. Application Pages & Features

1. **Dashboard:** Executive KPI overview, historical vs live inference metrics, class imbalance donut chart, failure modes frequency bar chart, and recent predictions table.
2. **Machine Failure Prediction:**
   - Sliders and numeric inputs for all 6 operational parameters.
   - 5 one-click realistic industrial presets (Normal Operation, TWF Hazard, HDF Hazard, PWF Hazard, OSF Hazard).
   - Instant probability meter, risk level badge (Low, Medium, High, Critical), contributing factors breakdown, and maintenance recommendation.
   - Batch CSV file ingestion and prediction preview.
3. **Dataset Explorer:** Paginated data table of all 10,000 records, search by Product ID/UDI, filter by Machine Type (L, M, H) or failure status, column data types schema, and CSV download.
4. **EDA & Analytics:** Sensor distribution histograms (Normal vs Failure), correlation matrix heatmap, rotational speed vs torque power envelope scatter plot, and statistical divergence table.
5. **Model Performance:** Side-by-side comparison table of all 4 models, interactive confusion matrix, multi-model ROC curves chart, and live model switcher.
6. **Explainable AI (XAI):** Global feature importance ranking, physical factor descriptions, and practical plant maintenance insights.
7. **Maintenance Tasks:** Condition-based Standard Operating Procedures (SOPs), work order manager with CRUD operations, priority tags, technician assignment, and status toggles.
8. **Prediction History:** Searchable, filterable audit log stored in SQLite with modal inspection and CSV export.
9. **About Project:** Complete academic documentation including problem identification, team register numbers, the 10 literature survey references, and system limitations.

---

## 7. Quickstart Guide: Run Everything in One Command

You can now start both the **Backend API** and **Frontend UI** simultaneously using a single command from the project root (`C:\college\ML project`):

### Option A: Using `npm start` (Recommended)
Open your terminal in `C:\college\ML project` and run:
```bash
npm start
```
*(or `npm run dev`)*  
This will concurrently start the FastAPI backend on `http://127.0.0.1:8000` and the Vite frontend on `http://127.0.0.1:5173`.

### Option B: Using Windows Batch Script (One-Click)
In Windows File Explorer, double-click:
```
run.bat
```
or run in Command Prompt:
```cmd
run.bat
```
This automatically launches both services in separate windows and opens your default browser at `http://127.0.0.1:5173`.

### Option C: Using PowerShell
```powershell
.\run.ps1
```

---

## 8. REST API Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/api/dashboard/stats` | Aggregated dashboard telemetry and KPI statistics |
| `POST` | `/api/predict` | Single machine failure prediction and diagnostics |
| `POST` | `/api/predict/batch` | Batch CSV upload and multi-row inference |
| `GET` | `/api/dataset/summary` | AI4I 2020 dataset statistics and column metadata |
| `GET` | `/api/dataset/preview` | Paginated dataset records with filtering and search |
| `GET` | `/api/dataset/download` | Download cleaned dataset with engineered features |
| `GET` | `/api/eda/distributions` | Binned histograms and normal vs failure comparison |
| `GET` | `/api/eda/correlations` | Pearson correlation matrix |
| `GET` | `/api/eda/scatter` | Sensor scatter points (Speed vs Torque) |
| `GET` | `/api/models/comparison` | 4-model evaluation metrics, ROC curves, confusion matrices |
| `GET` | `/api/models/active` | Get currently active prediction model |
| `POST` | `/api/models/active` | Switch active model (`gradient_boosting`, `random_forest`, etc.) |
| `GET` | `/api/explainability/global` | Global feature importance rankings for all algorithms |
| `GET` | `/api/explainability/insights` | Physical and business insights derived from data |
| `GET` | `/api/maintenance/tasks` | List all maintenance work orders |
| `POST` | `/api/maintenance/tasks` | Create a new maintenance task |
| `PUT` | `/api/maintenance/tasks/{id}` | Update task status, priority, or notes |
| `DELETE` | `/api/maintenance/tasks/{id}` | Delete a maintenance task |
| `GET` | `/api/maintenance/recommendations` | Condition-based guidelines and recent critical alerts |
| `GET` | `/api/history` | List logged prediction audit history |
| `DELETE` | `/api/history/{id}` | Delete prediction record |
| `GET` | `/api/history/export` | Export prediction history to CSV |

---

## 9. Academic Literature Survey References

1. **T. P. Carvalho, F. A. A. M. N. Soares, R. Vita, R. P. Francisco, J. P. T. V. Basto and S. G. S. Alcalá**, "A Systematic Literature Review of Machine Learning Methods Applied to Predictive Maintenance," *Computers & Industrial Engineering*, vol. 137, 2019.
2. **S. Matzka**, "Explainable Artificial Intelligence for Predictive Maintenance Applications," *2020 Third International Conference on Artificial Intelligence for Industries (AI4I)*, pp. 69–74, 2020.
3. **O. Surucu, S. A. Gadsden and J. Yawney**, "Condition Monitoring using Machine Learning: A Review of Theory, Applications, and Recent Advances," *Expert Systems with Applications*, vol. 221, 2023.
4. **Manufacturing Letters Consortium**, "A Predictive Maintenance Approach in Manufacturing Systems via AI-Based Early Failure Detection," *Manufacturing Letters*, vol. 35, pp. 1179–1186, 2023.
5. **J. M. Fordal, P. Schjølberg, H. Helgetun, T. Å. Skjermo, Y. Wang and C. Wang**, "Application of Sensor Data Based Predictive Maintenance and Artificial Neural Networks to Enable Industry 4.0," *Advances in Manufacturing*, vol. 11, pp. 248–263, 2023.
6. **O. Serradilla, E. Zugasti and U. Zurutuza**, "Deep Learning Models for Predictive Maintenance: A Survey, Comparison, Challenges and Prospect," 2020.
7. **Industrial AI Research Team**, "A²-LSTM for Predictive Maintenance of Industrial Equipment Based on Machine Learning," *Computers & Industrial Engineering*, vol. 172, 2022.
8. **Automotive Use Case Authors**, "Data-Driven Strategies for Predictive Maintenance: Lessons Learned from an Automotive Use Case," *Computers in Industry*, vol. 134, 2022.
9. **D. Guidotti, L. Pandolfo and L. Pulina**, "A Systematic Literature Review of Supervised Machine Learning Techniques for Predictive Maintenance in Industry 4.0," *IEEE Access*, vol. 13, pp. 102479–102504, 2025.
10. **J. Cano, J. Santos and M. Antunes**, "Explainable AI for Industrial Fault Diagnosis: A Systematic Review," *Journal of Industrial Information Integration*, vol. 47, 2025.

---

## 10. Limitations & Disclaimers

- **Synthetic Baseline:** The AI4I 2020 dataset consists of synthetic machine cycles generated to reflect actual milling physical properties. Sensor values and predictions are simulated for decision support.
- **Correlation vs Causation:** Machine learning models detect statistical correlations in sensor parameters. Predictions do not establish absolute mechanical causation and must be verified by certified maintenance personnel.
- **Stochastic Failure Boundary:** Random failures (RNF, 0.1% probability) cannot be predicted deterministically through sensor thresholds alone.

---

## 11. License
Developed for educational and academic research purposes under the **MIT License**.
