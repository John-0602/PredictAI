import React from 'react';
import {
  BookOpen,
  Users,
  GraduationCap,
  Layers,
  Database,
  Cpu,
  Brain,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function AboutProject() {
  const team = [
    { name: 'John Silva. S', reg: '2403717673721023', role: 'Machine Learning & Model Pipeline' },
    { name: 'John Joeual. C', reg: '2403717673721022', role: 'Full-Stack Architecture & API Integration' },
    { name: 'Darshan. S', reg: '2403717673721009', role: 'EDA, Feature Engineering & Documentation' },
  ];

  const references = [
    {
      id: 1,
      authors: 'T. P. Carvalho, F. A. A. M. N. Soares, R. Vita, et al.',
      title: 'A Systematic Literature Review of Machine Learning Methods Applied to Predictive Maintenance',
      journal: 'Computers & Industrial Engineering, vol. 137, 2019',
      contribution: 'Guided our end-to-end predictive maintenance workflow and justified comparing multiple classifiers.'
    },
    {
      id: 2,
      authors: 'Stephan Matzka',
      title: 'Explainable Artificial Intelligence for Predictive Maintenance Applications',
      journal: 'IEEE AI4I Conference, pp. 69–74, 2020',
      contribution: 'Origin of our 10,000-record AI4I 2020 dataset and physics equations for TWF, HDF, PWF, and OSF.'
    },
    {
      id: 3,
      authors: 'O. Surucu, S. A. Gadsden, and J. Yawney',
      title: 'Condition Monitoring using Machine Learning: A Review of Theory and Advances',
      journal: 'Expert Systems with Applications, vol. 221, 2023',
      contribution: 'Emphasized rigorous data preprocessing, feature normalization, and sensor validation.'
    },
    {
      id: 4,
      authors: 'Manufacturing Letters Research Team',
      title: 'A Predictive Maintenance Approach in Manufacturing Systems via AI-Based Early Failure Detection',
      journal: 'Manufacturing Letters, vol. 35, 2023',
      contribution: 'Demonstrated early anomaly detection before catastrophic machine stoppage.'
    },
    {
      id: 5,
      authors: 'J. M. Fordal, P. Schjolberg, et al.',
      title: 'Application of Sensor Data Based Predictive Maintenance and ANNs to Enable Industry 4.0',
      journal: 'Advances in Manufacturing, vol. 11, 2023',
      contribution: 'Inspired our web-based condition monitoring user interface and operator dashboard.'
    },
    {
      id: 6,
      authors: 'O. Serradilla, E. Zugasti, and U. Zurutuza',
      title: 'Deep Learning Models for Predictive Maintenance: A Survey and Comparison',
      journal: '2020 Survey Review',
      contribution: 'Showed the value of starting with interpretable tree classifiers before deploying deep neural networks.'
    },
    {
      id: 7,
      authors: 'Computers & Industrial Engineering Authors',
      title: 'A-LSTM for Predictive Maintenance of Industrial Equipment Based on ML',
      journal: 'Computers & Industrial Engineering, vol. 172, 2022',
      contribution: 'Informed our future roadmap for sequence attention over temporal sensor data.'
    },
    {
      id: 8,
      authors: 'Computers in Industry Consortium',
      title: 'Data-Driven Strategies for Predictive Maintenance: Lessons Learned from Automotive Use Case',
      journal: 'Computers in Industry, vol. 134, 2022',
      contribution: 'Motivated domain feature engineering: Temperature gradient ΔT, Power, and Tool Overstrain.'
    },
    {
      id: 9,
      authors: 'D. Guidotti, L. Pandolfo, and L. Pulina',
      title: 'A Systematic Review of Supervised ML Techniques for Predictive Maintenance in Industry 4.0',
      journal: 'IEEE Access, vol. 13, 2025',
      contribution: 'Advocated benchmark reproducibility, open datasets, and strict data leakage prevention.'
    },
    {
      id: 10,
      authors: 'J. Cano, J. Santos, and M. Antunes',
      title: 'Explainable AI for Industrial Fault Diagnosis: A Systematic Review',
      journal: 'Journal of Industrial Information Integration, vol. 47, 2025',
      contribution: 'Stressed the vital necessity of interpretable model feature importance for operator trust.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-cyan-400" />
          <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
            Course 22MDC56 — Machine Learning Laboratory
          </span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          PredictAI: Smart Predictive Maintenance and Machine Failure Prediction System
        </h2>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          An end-to-end engineering solution closing the research gap identified in literature surveys by bridging data preprocessing, exploratory analytics, 4-model benchmarking, explainability (XAI), and real-time deployment into a unified Industry 4.0 web application.
        </p>
      </div>

      {/* Project Team Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Project Development Team</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">22MDC56 Lab Batch 2026</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {team.map((m) => (
            <div key={m.reg} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="font-bold text-sm text-slate-900">{m.name}</div>
              <div className="text-xs text-blue-600 font-mono font-semibold">Register No: {m.reg}</div>
              <div className="text-[11px] text-slate-500 pt-1">{m.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gap Analysis & Research Motivation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Research Gap Analysis (From Literature Survey)
          </h3>
        </div>

        <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-950 leading-relaxed space-y-2">
          <p className="font-medium">
            <strong>Identified Research Void:</strong> Most existing literature investigates isolated machine learning or deep learning algorithms for equipment anomaly detection. However, prevailing implementations focus exclusively on academic accuracy metrics without integrating data preprocessing, exploratory data analysis, multi-algorithm benchmarking, explainable AI, and actionable maintenance workflow deployment into a single, cohesive industrial software artifact.
          </p>
          <p>
            <strong>How PredictAI Solves the Gap:</strong> PredictAI provides an end-to-end platform utilizing the validated AI4I 2020 dataset. It implements physical feature engineering, evaluates 4 classifiers (Gradient Boosting, Random Forest, Decision Tree, Logistic Regression), calculates class-imbalanced metrics (Recall, ROC-AUC, PR Curves), extracts transparent feature attributions, and provides a condition-based maintenance task management system.
          </p>
        </div>
      </div>

      {/* System Architecture Flow Diagram */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-blue-600" />
            End-to-End System Architecture Flow
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
            <div className="w-7 h-7 mx-auto bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold">1</div>
            <div className="font-bold text-slate-900">Data Ingestion</div>
            <p className="text-[11px] text-slate-500">AI4I 2020 milling sensor records (10,000 samples, 14 features)</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
            <div className="w-7 h-7 mx-auto bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center font-bold">2</div>
            <div className="font-bold text-slate-900">Feature Engineering</div>
            <p className="text-[11px] text-slate-500">ΔT Gradient, Spindle Power (W), Tool Overstrain (min·Nm)</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
            <div className="w-7 h-7 mx-auto bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center font-bold">3</div>
            <div className="font-bold text-slate-900">Model Pipeline</div>
            <p className="text-[11px] text-slate-500">4 Classifiers, Class Balancing, Joblib serialization</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
            <div className="w-7 h-7 mx-auto bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center font-bold">4</div>
            <div className="font-bold text-slate-900">FastAPI & SQLite</div>
            <p className="text-[11px] text-slate-500">High-performance REST API, persistence for audits & tasks</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
            <div className="w-7 h-7 mx-auto bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-bold">5</div>
            <div className="font-bold text-slate-900">React UI / UX</div>
            <p className="text-[11px] text-slate-500">Industry 4.0 interactive dashboard with Recharts & XAI</p>
          </div>
        </div>
      </div>

      {/* 10 Literature Survey References */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Literature Survey References (10 Reviewed Papers)
          </h3>
          <span className="text-xs text-slate-400">Literature Survey for 22MDC56 Lab</span>
        </div>

        <div className="space-y-3">
          {references.map((ref) => (
            <div key={ref.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-slate-900">
                  [{ref.id}] {ref.title}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0 font-mono">Ref #{ref.id}</span>
              </div>
              <div className="text-[11px] text-slate-600 italic">
                {ref.authors} — {ref.journal}
              </div>
              <p className="text-[11px] text-blue-800 pt-0.5">
                <strong>Project Relevance:</strong> {ref.contribution}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations and Future Enhancements */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          System Limitations & Future Enhancements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-800">Current Limitations</div>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>Dataset instances are independent cycles without continuous time-series stream.</li>
              <li>Sensor telemetry is simulated/uploaded rather than directly tied to physical OPC-UA / MQTT industrial fieldbuses.</li>
              <li>Rare stochastic failures (RNF, 0.1% baseline) cannot be reliably predicted via deterministic physics.</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-800">Future Enhancements</div>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>Implement Attention-based LSTM (A-LSTM) as reviewed in Reference [7] for temporal degradation tracking.</li>
              <li>Integration with live Edge IoT gateway protocols (MQTT, Modbus TCP, OPC-UA).</li>
              <li>Remaining Useful Life (RUL) regression forecasting to predict exact operating hours before failure.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
